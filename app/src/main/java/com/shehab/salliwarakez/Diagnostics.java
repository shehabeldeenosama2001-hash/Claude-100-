package com.shehab.salliwarakez;

import android.app.ActivityManager;
import android.app.ApplicationExitInfo;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/** Records why the app / blocking service stopped, so it can be shown on the main screen. */
final class Diagnostics {
    private static final String FILE = "diagnostics";

    private Diagnostics() {}

    private static SharedPreferences sp(Context c) {
        return c.getApplicationContext().getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    /** Catches any crash in the app process and saves it before the process dies. */
    static void installCrashRecorder(Context c) {
        Context app = c.getApplicationContext();
        Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            try {
                record(app, "crash", stackTrace(e));
            } catch (Throwable ignored) {
            }
            if (previous != null) previous.uncaughtException(t, e);
        });
    }

    static void record(Context c, String key, String value) {
        sp(c).edit().putString(key, now() + "  " + value).commit();
    }

    static String stackTrace(Throwable e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String s = sw.toString();
        return s.length() > 1500 ? s.substring(0, 1500) : s;
    }

    private static String now() {
        return new SimpleDateFormat("MM/dd HH:mm:ss", Locale.US).format(new Date());
    }

    /** Human-readable report: service start/stop times, errors, and Android's exit reasons. */
    static String report(Context c) {
        SharedPreferences p = sp(c);
        StringBuilder b = new StringBuilder();
        b.append("Android ").append(Build.VERSION.RELEASE).append(" • ")
                .append(Build.MANUFACTURER).append(' ').append(Build.MODEL).append('\n');
        appendIf(b, "Service on", p.getString("connected", null));
        appendIf(b, "Service off", p.getString("unbound", null));
        appendIf(b, "Error caught", p.getString("caught", null));
        appendIf(b, "Crash", p.getString("crash", null));

        if (Build.VERSION.SDK_INT >= 30) {
            ActivityManager am = c.getSystemService(ActivityManager.class);
            if (am != null) {
                List<ApplicationExitInfo> exits =
                        am.getHistoricalProcessExitReasons(c.getPackageName(), 0, 4);
                for (ApplicationExitInfo e : exits) {
                    b.append("Exit ")
                            .append(new SimpleDateFormat("MM/dd HH:mm:ss", Locale.US)
                                    .format(new Date(e.getTimestamp())))
                            .append(": ").append(reasonName(e.getReason()));
                    if (e.getDescription() != null) b.append(" — ").append(e.getDescription());
                    b.append('\n');
                }
            }
        }
        return b.toString().trim();
    }

    private static void appendIf(StringBuilder b, String label, String value) {
        if (value != null) b.append(label).append(": ").append(value).append('\n');
    }

    private static String reasonName(int r) {
        switch (r) {
            case ApplicationExitInfo.REASON_CRASH: return "CRASH";
            case ApplicationExitInfo.REASON_CRASH_NATIVE: return "CRASH_NATIVE";
            case ApplicationExitInfo.REASON_ANR: return "ANR";
            case ApplicationExitInfo.REASON_LOW_MEMORY: return "LOW_MEMORY";
            case ApplicationExitInfo.REASON_USER_REQUESTED: return "USER_REQUESTED (force stop)";
            case ApplicationExitInfo.REASON_USER_STOPPED: return "USER_STOPPED";
            case ApplicationExitInfo.REASON_EXCESSIVE_RESOURCE_USAGE: return "EXCESSIVE_RESOURCE_USAGE";
            case ApplicationExitInfo.REASON_SIGNALED: return "SIGNALED (killed)";
            case ApplicationExitInfo.REASON_PERMISSION_CHANGE: return "PERMISSION_CHANGE";
            case ApplicationExitInfo.REASON_DEPENDENCY_DIED: return "DEPENDENCY_DIED";
            case ApplicationExitInfo.REASON_INITIALIZATION_FAILURE: return "INIT_FAILURE";
            case ApplicationExitInfo.REASON_EXIT_SELF: return "EXIT_SELF";
            case ApplicationExitInfo.REASON_FREEZER: return "FREEZER";
            case ApplicationExitInfo.REASON_PACKAGE_UPDATED: return "PACKAGE_UPDATED";
            case ApplicationExitInfo.REASON_OTHER: return "OTHER";
            default: return "UNKNOWN(" + r + ")";
        }
    }
}
