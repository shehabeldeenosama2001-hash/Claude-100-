package com.shehab.salliwarakez;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * While this device admin is active, Android refuses to uninstall the app.
 * It is removed by the app itself after the phrase has been typed 100 times.
 */
public class AdminReceiver extends DeviceAdminReceiver {
    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        return context.getString(R.string.admin_disable_warning);
    }
}
