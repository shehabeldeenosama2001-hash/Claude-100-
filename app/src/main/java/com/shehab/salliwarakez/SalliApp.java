package com.shehab.salliwarakez;

import android.app.Application;

public class SalliApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        Diagnostics.installCrashRecorder(this);
        Watchdog.schedule(this);
        MonitorService.start(this);
        Revive.schedule(this);
        KeepVpnService.start(this);
    }
}
