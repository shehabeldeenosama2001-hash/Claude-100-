package com.shehab.salliwarakez;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

/**
 * Phones like Realme / Oppo / Xiaomi / Vivo kill background apps when the screen
 * locks, which also switches the accessibility service off. This keeps the
 * service in the foreground and opens the battery / auto-start settings.
 */
final class KeepAlive {
    private static final String CHANNEL = "keep_alive";
    private static final int NOTIFICATION_ID = 1;

    /** OEM auto-start / background managers, tried in order. */
    private static final String[][] AUTOSTART_PAGES = {
            {"com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"},
            {"com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"},
            {"com.oplus.safecenter", "com.oplus.safecenter.permission.startup.StartupAppListActivity"},
            {"com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"},
            {"com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"},
            {"com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"},
            {"com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager"},
            {"com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"},
            {"com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"},
            {"com.asus.mobilemanager", "com.asus.mobilemanager.autostart.AutoStartActivity"},
    };

    private KeepAlive() {}

    /** Shows a quiet permanent notification so the system doesn't kill the service. */
    static void startForeground(Service service) {
        try {
            NotificationManager nm = service.getSystemService(NotificationManager.class);
            if (nm != null && nm.getNotificationChannel(CHANNEL) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "تشغيل صلي وركز",
                        NotificationManager.IMPORTANCE_MIN);
                ch.setShowBadge(false);
                nm.createNotificationChannel(ch);
            }
            PendingIntent open = PendingIntent.getActivity(service, 0,
                    new Intent(service, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
            Notification n = new Notification.Builder(service, CHANNEL)
                    .setSmallIcon(android.R.drawable.ic_lock_lock)
                    .setContentTitle("صلي وركز شغّال 🤍")
                    .setContentText("المتصفحات وفيسبوك وانستا وتيك توك محميين")
                    .setContentIntent(open)
                    .setOngoing(true)
                    .build();
            if (Build.VERSION.SDK_INT >= 34) {
                service.startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                service.startForeground(NOTIFICATION_ID, n);
            }
        } catch (RuntimeException e) {
            // Never let this crash the service: a crashing accessibility service gets disabled.
        }
    }

    static boolean isBatteryUnrestricted(Context c) {
        PowerManager pm = c.getSystemService(PowerManager.class);
        return pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName());
    }

    static void requestBatteryUnrestricted(Activity a) {
        Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                Uri.parse("package:" + a.getPackageName()));
        if (!tryStart(a, i)) {
            tryStart(a, new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
        }
    }

    /** Opens the phone maker's auto-start page if there is one. */
    static void openAutoStart(Activity a) {
        for (String[] page : AUTOSTART_PAGES) {
            Intent i = new Intent().setComponent(new ComponentName(page[0], page[1]));
            if (tryStart(a, i)) return;
        }
        tryStart(a, new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
    }

    private static boolean tryStart(Activity a, Intent i) {
        try {
            a.startActivity(i);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}
