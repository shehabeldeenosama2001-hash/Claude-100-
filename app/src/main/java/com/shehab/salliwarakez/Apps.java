package com.shehab.salliwarakez;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.SystemClock;
import android.provider.Settings;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Which apps are browsers, and which windows don't count as leaving one. Shared by both engines. */
final class Apps {
    static final Set<String> KNOWN_BROWSERS = new HashSet<>(Arrays.asList(
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


    private static final long BROWSER_REFRESH_MS = 5 * 60 * 1000L;
    private static final Set<String> browsers = new HashSet<>();
    private static long browsersLoadedAt = -BROWSER_REFRESH_MS;

    private Apps() {}

    static synchronized boolean isBrowser(Context c, String pkg) {
        long now = SystemClock.elapsedRealtime();
        if (now - browsersLoadedAt > BROWSER_REFRESH_MS) refreshBrowsers(c);
        return browsers.contains(pkg);
    }

    /** Known browsers + whatever installed app can open a plain web link. */
    private static void refreshBrowsers(Context c) {
        browsersLoadedAt = SystemClock.elapsedRealtime();
        browsers.clear();
        browsers.addAll(KNOWN_BROWSERS);
        PackageManager pm = c.getPackageManager();
        for (String url : new String[]{"http://example.com", "https://example.com"}) {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            List<ResolveInfo> list = pm.queryIntentActivities(i, PackageManager.MATCH_ALL);
            for (ResolveInfo ri : list) {
                if (ri.activityInfo != null) browsers.add(ri.activityInfo.packageName);
            }
        }
        browsers.remove(c.getPackageName());
        // The system "choose an app" sheet is not a browser.
        browsers.remove("android");
    }

    /** Windows that pop up over a browser without meaning you left it. */
    static boolean isPassThrough(Context c, String pkg) {
        if (pkg.equals("android") || pkg.equals("com.android.systemui")) return true;
        String p = pkg.toLowerCase(Locale.ROOT);
        if (p.contains("inputmethod") || p.contains("keyboard") || p.contains("permissioncontroller")
                || p.contains("packageinstaller") || p.contains("providers.downloads")
                || p.contains("documentsui")) {
            return true;
        }
        String ime = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.DEFAULT_INPUT_METHOD);
        if (ime != null) {
            ComponentName cn = ComponentName.unflattenFromString(ime);
            if (cn != null && cn.getPackageName().equals(pkg)) return true;
        }
        return false;
    }
}
