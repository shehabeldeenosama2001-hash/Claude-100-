package com.shehab.salliwarakez;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

/**
 * Every ~15 minutes (and after a restart) checks whether the blocking service
 * was switched off, and if so shows a notification that opens its settings.
 */
public class Watchdog extends JobService {
    private static final int JOB_ID = 42;
    private static final String CHANNEL = "watchdog";
    private static final int NOTIFICATION_ID = 2;

    static void schedule(Context c) {
        try {
            JobScheduler js = c.getSystemService(JobScheduler.class);
            if (js == null || js.getPendingJob(JOB_ID) != null) return;
            JobInfo job = new JobInfo.Builder(JOB_ID, new ComponentName(c, Watchdog.class))
                    .setPeriodic(15 * 60 * 1000L)
                    .setPersisted(true)
                    .build();
            js.schedule(job);
        } catch (RuntimeException ignored) {
        }
    }

    static void check(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        if (Prefs.isAccessibilityEnabled(c)) {
            nm.cancel(NOTIFICATION_ID);
            return;
        }
        try {
            if (nm.getNotificationChannel(CHANNEL) == null) {
                nm.createNotificationChannel(new NotificationChannel(CHANNEL,
                        "تنبيه لما خدمة الحجب تتقفل", NotificationManager.IMPORTANCE_HIGH));
            }
            Intent open = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            PendingIntent pi = PendingIntent.getActivity(c, 1, open, PendingIntent.FLAG_IMMUTABLE);
            Notification n = new Notification.Builder(c, CHANNEL)
                    .setSmallIcon(android.R.drawable.ic_lock_lock)
                    .setContentTitle("⚠️ خدمة الحجب اتقفلت")
                    .setContentText("دوس هنا وفعّل «صلي وركز» تاني")
                    .setContentIntent(pi)
                    .setAutoCancel(true)
                    .build();
            nm.notify(NOTIFICATION_ID, n);
        } catch (RuntimeException ignored) {
        }
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        check(this);
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;
    }

    /** Runs after the phone restarts. */
    public static class BootReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            schedule(context);
            check(context);
        }
    }
}
