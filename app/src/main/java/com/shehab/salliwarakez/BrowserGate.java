package com.shehab.salliwarakez;

import android.os.SystemClock;

/**
 * Which browser (if any) has passed the gate. The pass lasts until you leave the
 * browser for another app, go to the home screen, or turn the screen off.
 */
final class BrowserGate {
    /** Ignore "you left the browser" signals right after passing, while windows settle. */
    private static final long GRACE_MS = 4000;

    private static volatile String passedPackage;
    private static volatile long grantedAt;

    private BrowserGate() {}

    static void grant(String pkg) {
        passedPackage = pkg;
        grantedAt = SystemClock.uptimeMillis();
    }

    static boolean hasPass(String pkg) {
        return pkg != null && pkg.equals(passedPackage);
    }

    /** Called when another app comes to the front. */
    static void revoke() {
        if (SystemClock.uptimeMillis() - grantedAt < GRACE_MS) return;
        passedPackage = null;
    }

    /** Screen turned off: always ends the pass. */
    static void revokeNow() {
        passedPackage = null;
    }
}
