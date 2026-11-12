package com.shehab.salliwarakez;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;

/**
 * An alarm every ~5 minutes that brings the backup engine back if the phone
 * (e.g. vivo) killed the app. Each alarm schedules the next one.
 */
public class Revive extends BroadcastReceiver {
    private static final long INTERVAL_MS = 5 * 60 * 1000L;

    static void schedule(Context c) {
        try {
            AlarmManager am = c.getSystemService(AlarmManager.class);
            if (am == null) return;
            PendingIntent pi = PendingIntent.getBroadcast(c, 7,
                    new Intent(c, Revive.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                    SystemClock.elapsedRealtime() + INTERVAL_MS, pi);
        } catch (RuntimeException ignored) {
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        MonitorService.start(context);
        Watchdog.check(context);
        schedule(context);
    }
}
