package com.shehab.salliwarakez;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.net.VpnService;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * A do-nothing local VPN whose only job is to keep the app alive: the system
 * keeps VPN apps running, and with "Always-on VPN" it restarts them itself.
 *
 * Normally the tunnel covers only this app (which sends no traffic), so no
 * other app's internet is touched. During the 10-minute lock it covers the
 * installed browsers instead and routes everything into the tunnel, which is
 * never read, so the browsers have no internet until the lock ends.
 */
public class KeepVpnService extends VpnService {

    static final String ACTION_REFRESH = "refresh";
    private static final long CHECK_MS = 30_000;

    static volatile boolean running;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private ParcelFileDescriptor tun;
    private boolean tunIsLock;

    private final Runnable check = new Runnable() {
        @Override public void run() {
            applyMode();
            handler.postDelayed(this, CHECK_MS);
        }
    };

    /** True once the user accepted the system VPN prompt. */
    static boolean isAllowed(Context c) {
        try {
            return VpnService.prepare(c) == null;
        } catch (RuntimeException e) {
            return false;
        }
    }

    static void start(Context c) {
        if (!isAllowed(c)) return;
        try {
            Intent i = new Intent(c, KeepVpnService.class).setAction(ACTION_REFRESH);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
            else c.startService(i);
        } catch (RuntimeException ignored) {
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        KeepAlive.startForeground(this);
        running = true;
        tunIsLock = !Prefs.isLocked(this); // force a rebuild below
        applyMode();
        handler.removeCallbacks(check);
        handler.postDelayed(check, CHECK_MS);
        MonitorService.start(this);
        Diagnostics.record(this, "vpn", "on");
        return START_STICKY;
    }

    /** Rebuilds the tunnel when the lock starts or ends. */
    private void applyMode() {
        boolean lock = Prefs.isLocked(this);
        if (tun != null && lock == tunIsLock) {
            if (lock) scheduleLockEnd();
            return;
        }
        ParcelFileDescriptor old = tun;
        tun = establish(lock);
        tunIsLock = lock;
        closeQuietly(old);
        if (lock) scheduleLockEnd();
    }

    private void scheduleLockEnd() {
        long left = Prefs.remainingLockMs(this);
        handler.postDelayed(this::applyMode, Math.max(1000, left + 500));
    }

    private ParcelFileDescriptor establish(boolean lock) {
        try {
            Builder b = new Builder()
                    .setSession(getString(R.string.app_name))
                    .addAddress("10.111.222.1", 32);
            if (lock) {
                int added = 0;
                for (String pkg : installedBrowsers()) {
                    try {
                        b.addAllowedApplication(pkg);
                        added++;
                    } catch (PackageManager.NameNotFoundException ignored) {
                    }
                }
                if (added == 0) b.addAllowedApplication(getPackageName());
                // Everything from the browsers goes into the tunnel and is dropped.
                b.addRoute("0.0.0.0", 0);
                b.addAddress("fd11:2222:3333::1", 128);
                b.addRoute("::", 0);
                b.addDnsServer("10.111.222.2");
            } else {
                // Only this app: nobody else's traffic is affected.
                b.addAllowedApplication(getPackageName());
            }
            return b.establish();
        } catch (Exception e) {
            Diagnostics.record(this, "caught", "vpn: " + e);
            return null;
        }
    }

    private Set<String> installedBrowsers() {
        Set<String> out = new HashSet<>();
        PackageManager pm = getPackageManager();
        for (ApplicationInfo ai : pm.getInstalledApplications(0)) {
            if (!ai.packageName.equals(getPackageName()) && Apps.isBrowser(this, ai.packageName)) {
                out.add(ai.packageName);
            }
        }
        return out;
    }

    @Override
    public void onRevoke() {
        // The user switched the VPN off (or another VPN took over).
        Diagnostics.record(this, "vpn", "revoked");
        shutdown();
        super.onRevoke();
    }

    @Override
    public void onDestroy() {
        shutdown();
        super.onDestroy();
    }

    private void shutdown() {
        running = false;
        handler.removeCallbacksAndMessages(null);
        closeQuietly(tun);
        tun = null;
    }

    private static void closeQuietly(ParcelFileDescriptor pfd) {
        if (pfd == null) return;
        try {
            pfd.close();
        } catch (Exception ignored) {
        }
    }
}
