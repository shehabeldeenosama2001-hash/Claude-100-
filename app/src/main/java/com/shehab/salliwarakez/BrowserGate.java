package com.shehab.salliwarakez;

/**
 * Which browser (if any) has passed the gate. The pass lasts until you leave the
 * browser for another app, go to the home screen, or turn the screen off.
 */
final class BrowserGate {
    private static volatile String passedPackage;

    private BrowserGate() {}

    static void grant(String pkg) {
        passedPackage = pkg;
    }

    static boolean hasPass(String pkg) {
        return pkg != null && pkg.equals(passedPackage);
    }

    static void revoke() {
        passedPackage = null;
    }
}
