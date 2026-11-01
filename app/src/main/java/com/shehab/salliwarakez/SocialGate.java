package com.shehab.salliwarakez;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Facebook / Instagram / TikTok: type the phrase 5 times, then the app stays
 * open for 10 minutes (even if you close and reopen it) before asking again.
 */
final class SocialGate {
    static final long PASS_DURATION_MS = 10 * 60 * 1000L;

    static final Set<String> APPS = new HashSet<>(Arrays.asList(
            // Facebook
            "com.facebook.katana", "com.facebook.lite",
            // Instagram
            "com.instagram.android", "com.instagram.lite",
            // TikTok
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill",
            "com.zhiliaoapp.musically.go", "com.ss.android.ugc.tiktok.lite"
    ));

    private static final String FILE = "social_pass";

    private SocialGate() {}

    static boolean isSocial(String pkg) {
        return APPS.contains(pkg);
    }

    private static SharedPreferences sp(Context c) {
        return c.getApplicationContext().getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    static void grant(Context c, String pkg) {
        sp(c).edit().putLong(pkg, System.currentTimeMillis() + PASS_DURATION_MS).apply();
    }

    static boolean hasPass(Context c, String pkg) {
        long until = sp(c).getLong(pkg, 0);
        long now = System.currentTimeMillis();
        // until - now > duration means the clock was moved back; don't trust it.
        return until > now && until - now <= PASS_DURATION_MS;
    }
}
