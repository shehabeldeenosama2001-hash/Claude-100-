package com.shehab.salliwarakez;

import android.accessibilityservice.AccessibilityService;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Toast;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 1) While the 10-minute lock is running, any browser that comes to the
 *    foreground is sent straight back to the home screen.
 * 2) Otherwise, every time a browser is opened the gate screen appears on top
 *    of it (type the phrase 5 times, then confirm 5 times).
 * 3) Facebook / Instagram / TikTok: the gate asks for the phrase 5 times only,
 *    then leaves the app alone for 10 minutes.
 * 4) While uninstall protection is armed, any Settings / installer screen that
 *    shows this app's name (app info, device admin, accessibility toggle,
 *    uninstall dialog) is closed immediately.
 */
public class BlockerService extends AccessibilityService {

    private static final Set<String> KNOWN_BROWSERS = new HashSet<>(Arrays.asList(
            "com.android.chrome", "com.chrome.beta", "com.chrome.dev", "com.chrome.canary",
            "org.chromium.chrome", "com.google.android.apps.chrome",
            "org.mozilla.firefox", "org.mozilla.firefox_beta", "org.mozilla.fenix",
            "org.mozilla.focus", "org.mozilla.klar",
            "com.opera.browser", "com.opera.browser.beta", "com.opera.mini.native", "com.opera.gx",
            "com.microsoft.emmx", "com.brave.browser", "com.duckduckgo.mobile.android",
            "com.sec.android.app.sbrowser", "com.sec.android.app.sbrowser.beta",
            "com.UCMobile.intl", "com.uc.browser.en", "com.mi.globalbrowser", "com.android.browser",
            "com.huawei.browser", "com.heytap.browser", "com.coloros.browser", "com.vivo.browser",
            "com.kiwibrowser.browser", "com.yandex.browser", "com.vivaldi.browser",
            "com.ecosia.android", "mark.via.gp", "com.cloudmosa.puffinFree",
            "org.torproject.torbrowser", "com.transsion.phoenix", "com.qwant.liberty",
            "acr.browser.lightning", "com.stoutner.privacybrowser.standard"
    ));

    private static final String[] GUARDED_HINTS = {
            "settings", "securitycenter", "safecenter",
            "permissioncontroller", "systemmanager", "devicecare"
    };

    private static final long BROWSER_REFRESH_MS = 5 * 60 * 1000L;
    private static final long CONTENT_CHECK_INTERVAL_MS = 250;
    private static final long TOAST_INTERVAL_MS = 2500;
    private static final int MAX_NODES = 600;
    private static final long GATE_RELAUNCH_MS = 1500;
    /** If the gate hasn't appeared by then (some phones block pop-ups), close the browser. */
    private static final long GATE_FALLBACK_MS = 2000;

    private final Set<String> browsers = new HashSet<>();
    private long browsersLoadedAt = -BROWSER_REFRESH_MS;
    private long lastGuardCheck;
    private long lastToast;
    private String appName;
    private long lastGateLaunch;
    /** Class of the last full-screen window, e.g. "...StartupAppListActivity". */
    private String lastWindowPkg = "", lastWindowClass = "";
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final BroadcastReceiver screenOff = new BroadcastReceiver() {
        @Override public void onReceive(Context context, Intent intent) {
            BrowserGate.revokeNow();
        }
    };

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        appName = getString(R.string.app_name);
        refreshBrowsers();
        registerReceiver(screenOff, new IntentFilter(Intent.ACTION_SCREEN_OFF));
        KeepAlive.startForeground(this);
        Diagnostics.record(this, "connected", "ok");
        Watchdog.check(this);
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Diagnostics.record(this, "unbound", "system unbound the service");
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        try {
            unregisterReceiver(screenOff);
        } catch (IllegalArgumentException ignored) {
        }
        super.onDestroy();
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // A crash here makes Android switch the service off, so never let one escape.
        try {
            handleEvent(event);
        } catch (Throwable t) {
            try {
                Diagnostics.record(this, "caught", Diagnostics.stackTrace(t));
            } catch (Throwable ignored) {
            }
        }
    }

    private void handleEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        String pkg = event.getPackageName().toString();
        if (pkg.equals(getPackageName())) return;
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && event.getClassName() != null) {
            lastWindowPkg = pkg;
            lastWindowClass = event.getClassName().toString();
        }

        boolean browser = isBrowser(pkg);

        // 1) Browser lock.
        if (Prefs.isLocked(this) && browser) {
            performGlobalAction(GLOBAL_ACTION_HOME);
            toast("🔒 المتصفحات مقفولة… فاضل " + Prefs.formatRemaining(Prefs.remainingLockMs(this)));
            return;
        }

        // 2) Gate on every browser open.
        if (browser) {
            if (!BrowserGate.hasPass(pkg) && !GateActivity.visible
                    && pkg.equals(activeWindowPackage())) {
                showGate(pkg, false);
            }
            return;
        }

        // 3) Social apps: 5 phrases, then 10 minutes free.
        if (SocialGate.isSocial(pkg)) {
            BrowserGate.revoke();
            if (!SocialGate.hasPass(this, pkg) && !GateActivity.visible
                    && pkg.equals(activeWindowPackage())) {
                showGate(pkg, true);
            }
            return;
        }
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && !isPassThrough(pkg)) {
            String active = activeWindowPackage();
            if (active == null || !isBrowser(active)) {
                // Left the browser (home screen, recents, another app): next open asks again.
                BrowserGate.revoke();
            }
        }

        // 4) Uninstall / disable protection.
        if (isGuardedPackage(pkg)) {
            long now = SystemClock.uptimeMillis();
            if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                    && now - lastGuardCheck < CONTENT_CHECK_INTERVAL_MS) {
                return;
            }
            lastGuardCheck = now;
            if (!Prefs.isArmed(this)) return;
            if (isKeepAliveScreen(pkg)) return;

            AccessibilityNodeInfo root = getRootInActiveWindow();
            if (root != null && containsText(root, appName, new int[]{0})) {
                performGlobalAction(GLOBAL_ACTION_BACK);
                performGlobalAction(GLOBAL_ACTION_HOME);
                toast("مش هينفع 🙂 اكتب «صلي على النبي» ١٠٠ مرة جوه الأبلكيشن الأول");
            }
        }
    }

    @Override
    public void onInterrupt() {}

    private void showGate(String pkg, boolean social) {
        long now = SystemClock.uptimeMillis();
        if (GateActivity.visible || now - lastGateLaunch < GATE_RELAUNCH_MS) return;
        lastGateLaunch = now;
        Intent i = new Intent(this, GateActivity.class)
                .putExtra(GateActivity.EXTRA_PACKAGE, pkg)
                .putExtra(GateActivity.EXTRA_SOCIAL, social)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(i);

        handler.postDelayed(() -> {
            boolean hasPass = social ? SocialGate.hasPass(this, pkg) : BrowserGate.hasPass(pkg);
            if (!GateActivity.visible && !hasPass && pkg.equals(activeWindowPackage())) {
                performGlobalAction(GLOBAL_ACTION_HOME);
                toast("افتح إعدادات «صلي وركز» واسمح له يظهر فوق التطبيقات / يفتح نوافذ في الخلفية");
            }
        }, GATE_FALLBACK_MS);
    }

    /**
     * Battery / auto-start screens list this app too, but they can't switch the
     * protection off, so they stay usable (needed to keep the app running).
     */
    private boolean isKeepAliveScreen(String pkg) {
        if (!pkg.equals(lastWindowPkg)) return false;
        String c = lastWindowClass.toLowerCase(java.util.Locale.ROOT);
        return c.contains("battery") || c.contains("fuelgauge") || c.contains("startup")
                || c.contains("autostart") || c.contains("autolaunch") || c.contains("powerusage");
    }

    private String activeWindowPackage() {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null) return null;
        return root.getPackageName().toString();
    }

    /** Windows that pop up over a browser without meaning you left it. */
    private boolean isPassThrough(String pkg) {
        if (pkg.equals("android") || pkg.equals("com.android.systemui")) return true;
        String p = pkg.toLowerCase(java.util.Locale.ROOT);
        if (p.contains("inputmethod") || p.contains("keyboard") || p.contains("permissioncontroller")
                || p.contains("packageinstaller") || p.contains("providers.downloads")
                || p.contains("documentsui")) {
            return true;
        }
        String ime = Settings.Secure.getString(getContentResolver(), Settings.Secure.DEFAULT_INPUT_METHOD);
        if (ime != null) {
            ComponentName cn = ComponentName.unflattenFromString(ime);
            if (cn != null && cn.getPackageName().equals(pkg)) return true;
        }
        return false;
    }

    private boolean isBrowser(String pkg) {
        long now = SystemClock.elapsedRealtime();
        if (now - browsersLoadedAt > BROWSER_REFRESH_MS) refreshBrowsers();
        return browsers.contains(pkg);
    }

    /** Known browsers + whatever installed app can open a plain web link. */
    private void refreshBrowsers() {
        browsersLoadedAt = SystemClock.elapsedRealtime();
        browsers.clear();
        browsers.addAll(KNOWN_BROWSERS);
        PackageManager pm = getPackageManager();
        for (String url : new String[]{"http://example.com", "https://example.com"}) {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            List<ResolveInfo> list = pm.queryIntentActivities(i, PackageManager.MATCH_ALL);
            for (ResolveInfo ri : list) {
                if (ri.activityInfo != null) browsers.add(ri.activityInfo.packageName);
            }
        }
        browsers.remove(getPackageName());
        // The system "choose an app" sheet is not a browser.
        browsers.remove("android");
    }

    private static boolean isGuardedPackage(String pkg) {
        String p = pkg.toLowerCase(java.util.Locale.ROOT);
        for (String hint : GUARDED_HINTS) {
            if (p.contains(hint)) return true;
        }
        return false;
    }

    private static boolean containsText(AccessibilityNodeInfo node, String needle, int[] visited) {
        if (node == null || visited[0]++ > MAX_NODES) return false;
        CharSequence t = node.getText();
        if (t != null && t.toString().contains(needle)) return true;
        CharSequence d = node.getContentDescription();
        if (d != null && d.toString().contains(needle)) return true;
        for (int i = 0; i < node.getChildCount(); i++) {
            if (containsText(node.getChild(i), needle, visited)) return true;
        }
        return false;
    }

    private void toast(String msg) {
        long now = SystemClock.uptimeMillis();
        if (now - lastToast < TOAST_INTERVAL_MS) return;
        lastToast = now;
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }
}
