package com.shehab.salliwarakez;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.SystemClock;
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
 * 2) While uninstall protection is armed, any Settings / installer screen that
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
            "settings", "packageinstaller", "securitycenter", "safecenter",
            "permissioncontroller", "systemmanager", "devicecare"
    };

    private static final long BROWSER_REFRESH_MS = 5 * 60 * 1000L;
    private static final long CONTENT_CHECK_INTERVAL_MS = 250;
    private static final long TOAST_INTERVAL_MS = 2500;
    private static final int MAX_NODES = 600;

    private final Set<String> browsers = new HashSet<>();
    private long browsersLoadedAt = -BROWSER_REFRESH_MS;
    private long lastGuardCheck;
    private long lastToast;
    private String appName;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        appName = getString(R.string.app_name);
        refreshBrowsers();
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        String pkg = event.getPackageName().toString();
        if (pkg.equals(getPackageName())) return;

        // 1) Browser lock.
        if (Prefs.isLocked(this) && isBrowser(pkg)) {
            performGlobalAction(GLOBAL_ACTION_HOME);
            toast("🔒 المتصفحات مقفولة… فاضل " + Prefs.formatRemaining(Prefs.remainingLockMs(this)));
            return;
        }

        // 2) Uninstall / disable protection.
        if (isGuardedPackage(pkg)) {
            long now = SystemClock.uptimeMillis();
            if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                    && now - lastGuardCheck < CONTENT_CHECK_INTERVAL_MS) {
                return;
            }
            lastGuardCheck = now;
            if (!Prefs.isArmed(this)) return;

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
