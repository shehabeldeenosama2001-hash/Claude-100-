package com.shehab.salliwarakez;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {

    private final Handler handler = new Handler(Looper.getMainLooper());
    private TextView lockStatus, statusA11y, statusAdmin, statusBattery, restrictedHint;
    private Button btnLock, btnA11y, btnAdmin, btnBattery, btnRestricted, btnUninstall;
    private View setupCard;

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            refresh();
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        lockStatus = findViewById(R.id.lockStatus);
        statusA11y = findViewById(R.id.statusA11y);
        statusAdmin = findViewById(R.id.statusAdmin);
        statusBattery = findViewById(R.id.statusBattery);
        btnBattery = findViewById(R.id.btnBattery);
        restrictedHint = findViewById(R.id.restrictedHint);
        btnLock = findViewById(R.id.btnLock);
        btnA11y = findViewById(R.id.btnA11y);
        btnAdmin = findViewById(R.id.btnAdmin);
        btnRestricted = findViewById(R.id.btnRestricted);
        btnUninstall = findViewById(R.id.btnUninstall);
        setupCard = findViewById(R.id.setupCard);

        // The main button: no dialog, no question — lock immediately.
        btnLock.setOnClickListener(v -> {
            if (!Prefs.isAccessibilityEnabled(this) && !MonitorService.isReady(this)) {
                Toast.makeText(this, "فعّل «خدمة الحجب» الأول من الإعداد اللي تحت 👇", Toast.LENGTH_LONG).show();
                return;
            }
            Prefs.startLock(this);
            refresh();
            Toast.makeText(this, "🔒 اتقفلت كل المتصفحات ١٠ دقايق", Toast.LENGTH_SHORT).show();
        });

        btnA11y.setOnClickListener(v ->
                startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));

        btnRestricted.setOnClickListener(v ->
                startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + getPackageName()))));

        btnAdmin.setOnClickListener(v -> {
            // Turning protection (back) on starts the 100-phrase count from zero.
            Prefs.setUninstallAllowed(this, false);
            Prefs.setPhraseCount(this, 0);
            if (!Prefs.isAdminActive(this)) {
                Intent i = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
                i.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, Prefs.adminComponent(this));
                i.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, getString(R.string.admin_explanation));
                startActivity(i);
            }
            refresh();
        });

        btnUninstall.setOnClickListener(v -> startActivity(new Intent(this, UnlockActivity.class)));
        btnBattery.setOnClickListener(v -> KeepAlive.requestBatteryUnrestricted(this));
        findViewById(R.id.btnAutoStart).setOnClickListener(v -> KeepAlive.openAutoStart(this));
        findViewById(R.id.btnUsage).setOnClickListener(v -> {
            Intent i = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            try {
                startActivity(i);
            } catch (RuntimeException e) {
                Toast.makeText(this, "افتح الإعدادات ← الوصول لبيانات الاستخدام", Toast.LENGTH_LONG).show();
            }
        });
        findViewById(R.id.btnOverlay).setOnClickListener(v -> {
            Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            try {
                startActivity(i);
            } catch (RuntimeException e) {
                startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION));
            }
        });

        // Lets the "صلي وركز شغّال" notification show, which keeps the service alive.
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                        != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        handler.post(tick);
        MonitorService.start(this);
        try {
            ((TextView) findViewById(R.id.diagnostics)).setText(Diagnostics.report(this));
        } catch (RuntimeException e) {
            ((TextView) findViewById(R.id.diagnostics)).setText(String.valueOf(e));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        handler.removeCallbacks(tick);
    }

    private void refresh() {
        boolean a11y = Prefs.isAccessibilityEnabled(this);
        boolean admin = Prefs.isAdminActive(this);
        boolean armed = Prefs.isArmed(this);
        long remaining = Prefs.remainingLockMs(this);

        if (remaining > 0) {
            lockStatus.setText("🔒 المتصفحات مقفولة\nفاضل " + Prefs.formatRemaining(remaining));
            btnLock.setText("🔒  ابدأ ١٠ دقايق من الأول");
        } else {
            lockStatus.setText("🌐 المتصفحات مفتوحة دلوقتي");
            btnLock.setText("🔒  اقفل المتصفحات ١٠ دقايق");
        }

        statusA11y.setText(a11y ? "١. خدمة الحجب: ✅ شغّالة" : "١. خدمة الحجب: ❌ مش متفعّلة");
        btnA11y.setVisibility(a11y ? View.GONE : View.VISIBLE);

        // "Allow restricted settings" is only needed on Android 13+ for apps installed from an APK.
        // Hidden once protection is armed, because that page is guarded then.
        boolean showRestricted = !a11y && !armed && Build.VERSION.SDK_INT >= 33;
        restrictedHint.setVisibility(showRestricted ? View.VISIBLE : View.GONE);
        btnRestricted.setVisibility(showRestricted ? View.VISIBLE : View.GONE);

        if (armed) {
            statusAdmin.setText("٢. الحماية من المسح: ✅ شغّالة");
            btnAdmin.setVisibility(View.GONE);
        } else if (admin) {
            statusAdmin.setText("٢. الحماية من المسح: ⏸ موقوفة (كتبت الـ ١٠٠ مرة)");
            btnAdmin.setText("رجّع الحماية تاني");
            btnAdmin.setVisibility(View.VISIBLE);
        } else {
            statusAdmin.setText("٢. الحماية من المسح: ❌ مش متفعّلة");
            btnAdmin.setText("فعّل الحماية من المسح");
            btnAdmin.setVisibility(View.VISIBLE);
        }

        boolean battery = KeepAlive.isBatteryUnrestricted(this);
        statusBattery.setText(battery
                ? "٣. الشغل في الخلفية: ✅ مسموح"
                : "٣. الشغل في الخلفية: ❌ الموبايل ممكن يقفل خدمة الحجب");
        btnBattery.setVisibility(battery ? View.GONE : View.VISIBLE);

        boolean usage = MonitorService.hasUsageAccess(this);
        boolean overlay = MonitorService.canShowOverApps(this);
        ((TextView) findViewById(R.id.statusBackup)).setText(usage && overlay
                ? "٤. الحماية الاحتياطية: ✅ جاهزة"
                : "٤. الحماية الاحتياطية: ❌ ناقصها صلاحيات");
        findViewById(R.id.backupHint).setVisibility(usage && overlay ? View.GONE : View.VISIBLE);
        findViewById(R.id.btnUsage).setVisibility(usage ? View.GONE : View.VISIBLE);
        findViewById(R.id.btnOverlay).setVisibility(overlay ? View.GONE : View.VISIBLE);

        setupCard.setVisibility(a11y && armed && battery && usage && overlay ? View.GONE : View.VISIBLE);
        btnUninstall.setVisibility(armed ? View.VISIBLE : View.GONE);
    }
}
