package com.shehab.salliwarakez;

import android.app.AppOpsManager;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.Process;
import android.os.SystemClock;
import android.provider.Settings;
import android.widget.Toast;

/**
 * Backup engine for phones (like vivo) that keep switching the accessibility
 * service off. It reads the app in front from usage stats (a permission the
 * phone doesn't take away) and does the same job: 10-minute browser lock,
 * browser gate, Facebook/Instagram/TikTok gate. It stays idle while the
 * accessibility service is running.
 */
public class MonitorService extends Service {

    private static final long POLL_MS = 700;
    private static final long GATE_RELAUNCH_MS = 1500;
    private static final long GATE_FALLBACK_MS = 2000;
    private static final long TOAST_INTERVAL_MS = 2500;

    private HandlerThread thread;
    private Handler worker;
    private final Handler main = new Handler(Looper.getMainLooper());
    private UsageStatsManager usm;
    private String foreground;
    private long lastQuery;
    private long lastGateLaunch;
    private long lastToast;

    // ---- static helpers ----

    static boolean hasUsageAccess(Context c) {
        AppOpsManager ops = c.getSystemService(AppOpsManager.class);
        if (ops == null) return false;
        int mode = Build.VERSION.SDK_INT >= 29
                ? ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), c.getPackageName())
                : ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), c.getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    static boolean canShowOverApps(Context c) {
        return Settings.canDrawOverlays(c);
    }

    static boolean isReady(Context c) {
        return hasUsageAccess(c) && canShowOverApps(c);
    }

    /** Starts the engine if its permissions are granted. Safe to call often. */
    static void start(Context c) {
        if (!isReady(c)) return;
        try {
            Intent i = new Intent(c, MonitorService.class);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
            else c.startService(i);
        } catch (RuntimeException ignored) {
            // Some phones refuse starting from the background; the next trigger retries.
        }
    }

    // ---- service ----

    private final BroadcastReceiver screen = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
                BrowserGate.revokeNow();
                worker.removeCallbacks(poll);
            } else {
                worker.removeCallbacks(poll);
                worker.post(poll);
            }
        }
    };

    private final Runnable poll = new Runnable() {
        @Override public void run() {
            try {
                tick();
            } catch (Throwable t) {
                try {
                    Diagnostics.record(MonitorService.this, "caught", Diagnostics.stackTrace(t));
                } catch (Throwable ignored) {
                }
            }
            worker.postDelayed(this, POLL_MS);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        KeepAlive.startForeground(this);
        usm = getSystemService(UsageStatsManager.class);
        thread = new HandlerThread("monitor");
        thread.start();
        worker = new Handler(thread.getLooper());
        IntentFilter f = new IntentFilter(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_SCREEN_ON);
        f.addAction(Intent.ACTION_USER_PRESENT);
        registerReceiver(screen, f);
        Diagnostics.record(this, "backup", "started");
        PowerManager pm = getSystemService(PowerManager.class);
        if (pm == null || pm.isInteractive()) worker.post(poll);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        KeepAlive.startForeground(this);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        try {
            unregisterReceiver(screen);
        } catch (IllegalArgumentException ignored) {
        }
        if (thread != null) thread.quitSafely();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    /** Called when the app is swiped away from recents: ask to come back. */
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        start(this);
    }

    // ---- the actual work ----

    private void tick() {
        if (!isReady(this)) return;
        String pkg = currentForeground();
        if (pkg == null || pkg.equals(getPackageName())) return;
        // The accessibility service does a better job when it is running.
        if (BlockerService.running) return;

        boolean browser = Apps.isBrowser(this, pkg);

        if (Prefs.isLocked(this) && browser) {
            goHome();
            toast("🔒 المتصفحات مقفولة… فاضل " + Prefs.formatRemaining(Prefs.remainingLockMs(this)));
            return;
        }
        if (browser) {
            if (!BrowserGate.hasPass(pkg)) showGate(pkg, false);
            return;
        }
        if (SocialGate.isSocial(pkg)) {
            BrowserGate.revoke();
            if (!SocialGate.hasPass(this, pkg)) showGate(pkg, true);
            return;
        }
        if (!Apps.isPassThrough(this, pkg)) BrowserGate.revoke();
    }

    /** The app most recently brought to the front, from usage events. */
    private String currentForeground() {
        if (usm == null) return foreground;
        long now = System.currentTimeMillis();
        long from = lastQuery == 0 ? now - 60_000 : lastQuery - 2_000;
        lastQuery = now;
        UsageEvents events = usm.queryEvents(from, now);
        UsageEvents.Event e = new UsageEvents.Event();
        while (events != null && events.hasNextEvent()) {
            events.getNextEvent(e);
            if (e.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                foreground = e.getPackageName();
            }
        }
        return foreground;
    }

    private void showGate(String pkg, boolean social) {
        long now = SystemClock.uptimeMillis();
        if (GateActivity.visible || now - lastGateLaunch < GATE_RELAUNCH_MS) return;
        lastGateLaunch = now;
        Intent i = new Intent(this, GateActivity.class)
                .putExtra(GateActivity.EXTRA_PACKAGE, pkg)
                .putExtra(GateActivity.EXTRA_SOCIAL, social)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(i);
        } catch (RuntimeException ignored) {
        }
        worker.postDelayed(() -> {
            boolean hasPass = social ? SocialGate.hasPass(this, pkg) : BrowserGate.hasPass(pkg);
            if (!GateActivity.visible && !hasPass && pkg.equals(currentForeground())) goHome();
        }, GATE_FALLBACK_MS);
    }

    private void goHome() {
        Intent home = new Intent(Intent.ACTION_MAIN)
                .addCategory(Intent.CATEGORY_HOME)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(home);
        } catch (RuntimeException ignored) {
        }
        // The home screen becomes the foreground app; don't act on the stale value.
        foreground = null;
    }

    private void toast(String msg) {
        long now = SystemClock.uptimeMillis();
        if (now - lastToast < TOAST_INTERVAL_MS) return;
        lastToast = now;
        main.post(() -> Toast.makeText(this, msg, Toast.LENGTH_SHORT).show());
    }
}
