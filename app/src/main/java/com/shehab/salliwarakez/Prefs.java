package com.shehab.salliwarakez;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.text.TextUtils;

/** Shared state between the screens and the blocking service. */
final class Prefs {
    static final long LOCK_DURATION_MS = 10 * 60 * 1000L;
    static final int PHRASES_NEEDED = 100;

    private static final String FILE = "state";
    private static final String KEY_LOCK_UNTIL = "lock_until";
    private static final String KEY_COUNT = "phrase_count";
    private static final String KEY_UNINSTALL_ALLOWED = "uninstall_allowed";
    private static final String KEY_GUARD_PAUSED_UNTIL = "guard_paused_until";
    /** How long a permission button may open a guarded settings page. */
    static final long GUARD_PAUSE_MS = 60 * 1000L;

    private Prefs() {}

    private static SharedPreferences sp(Context c) {
        return c.getApplicationContext().getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    // ---- browser lock ----

    static void startLock(Context c) {
        sp(c).edit().putLong(KEY_LOCK_UNTIL, System.currentTimeMillis() + LOCK_DURATION_MS).apply();
    }

    static long remainingLockMs(Context c) {
        return Math.max(0, sp(c).getLong(KEY_LOCK_UNTIL, 0) - System.currentTimeMillis());
    }

    static boolean isLocked(Context c) {
        return remainingLockMs(c) > 0;
    }

    // ---- uninstall protection ----

    static int phraseCount(Context c) {
        return sp(c).getInt(KEY_COUNT, 0);
    }

    static void setPhraseCount(Context c, int n) {
        sp(c).edit().putInt(KEY_COUNT, n).apply();
    }

    static boolean uninstallAllowed(Context c) {
        return sp(c).getBoolean(KEY_UNINSTALL_ALLOWED, false);
    }

    static void setUninstallAllowed(Context c, boolean allowed) {
        sp(c).edit().putBoolean(KEY_UNINSTALL_ALLOWED, allowed).apply();
    }

    /** Lets a permission button from the app open its settings page without the guard closing it. */
    static void pauseGuard(Context c) {
        sp(c).edit().putLong(KEY_GUARD_PAUSED_UNTIL, System.currentTimeMillis() + GUARD_PAUSE_MS).apply();
    }

    static void endGuardPause(Context c) {
        sp(c).edit().remove(KEY_GUARD_PAUSED_UNTIL).apply();
    }

    static boolean isGuardPaused(Context c) {
        long until = sp(c).getLong(KEY_GUARD_PAUSED_UNTIL, 0);
        long now = System.currentTimeMillis();
        return until > now && until - now <= GUARD_PAUSE_MS;
    }

    static ComponentName adminComponent(Context c) {
        return new ComponentName(c, AdminReceiver.class);
    }

    static boolean isAdminActive(Context c) {
        DevicePolicyManager dpm = (DevicePolicyManager) c.getSystemService(Context.DEVICE_POLICY_SERVICE);
        return dpm != null && dpm.isAdminActive(adminComponent(c));
    }

    /** Protection is armed once device admin is on and the 100 phrases haven't been typed. */
    static boolean isArmed(Context c) {
        return isAdminActive(c) && !uninstallAllowed(c);
    }

    static boolean isAccessibilityEnabled(Context c) {
        String enabled = Settings.Secure.getString(c.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (TextUtils.isEmpty(enabled)) return false;
        ComponentName me = new ComponentName(c, BlockerService.class);
        for (String s : enabled.split(":")) {
            ComponentName cn = ComponentName.unflattenFromString(s);
            if (me.equals(cn)) return true;
        }
        return false;
    }

    static String formatRemaining(long ms) {
        long totalSec = (ms + 999) / 1000;
        return toArabicDigits(String.format(java.util.Locale.US, "%02d:%02d", totalSec / 60, totalSec % 60));
    }

    static String toArabicDigits(String s) {
        StringBuilder b = new StringBuilder(s.length());
        for (char ch : s.toCharArray()) {
            b.append(ch >= '0' && ch <= '9' ? (char) ('٠' + (ch - '0')) : ch);
        }
        return b.toString();
    }
}
