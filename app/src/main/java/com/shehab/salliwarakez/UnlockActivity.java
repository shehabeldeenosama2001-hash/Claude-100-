package com.shehab.salliwarakez;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

/** Type «صلي على النبي» 100 times, then the app releases its uninstall protection. */
public class UnlockActivity extends Activity {

    private EditText input;
    private TextView counter, feedback;
    private ProgressBar progress;
    private Button btnSubmit, btnDoUninstall;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_unlock);

        input = findViewById(R.id.input);
        counter = findViewById(R.id.counter);
        feedback = findViewById(R.id.feedback);
        progress = findViewById(R.id.progress);
        btnSubmit = findViewById(R.id.btnSubmit);
        btnDoUninstall = findViewById(R.id.btnDoUninstall);

        PhraseInput.blockPaste(input, feedback);

        btnSubmit.setOnClickListener(v -> submit());
        input.setOnEditorActionListener((v, actionId, e) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE || actionId == EditorInfo.IME_NULL) {
                submit();
                return true; // keep the keyboard open for the next one
            }
            return false;
        });
        btnDoUninstall.setOnClickListener(v -> launchUninstall());

        if (Prefs.uninstallAllowed(this)) {
            showUnlocked();
        } else {
            updateCounter();
        }
    }

    private void submit() {
        if (Prefs.uninstallAllowed(this)) return;
        if (PhraseInput.normalize(input.getText()).isEmpty()) return;

        if (PhraseInput.matches(input.getText())) {
            int n = Prefs.phraseCount(this) + 1;
            Prefs.setPhraseCount(this, n);
            input.setText("");
            feedback.setText("اللهم صلِّ وسلم على نبينا محمد ﷺ");
            updateCounter();
            if (n >= Prefs.PHRASES_NEEDED) unlock();
        } else {
            feedback.setText("❌ اكتبها كده بالظبط: صلي على النبي");
        }
    }

    private void updateCounter() {
        int n = Math.min(Prefs.phraseCount(this), Prefs.PHRASES_NEEDED);
        counter.setText(Prefs.toArabicDigits(n + " / " + Prefs.PHRASES_NEEDED));
        progress.setProgress(n);
    }

    private void unlock() {
        Prefs.setUninstallAllowed(this, true);
        DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
        if (dpm != null && dpm.isAdminActive(Prefs.adminComponent(this))) {
            dpm.removeActiveAdmin(Prefs.adminComponent(this));
        }
        showUnlocked();
        // Give the system a moment to drop the device-admin before asking to uninstall.
        handler.postDelayed(this::launchUninstall, 1500);
    }

    private void showUnlocked() {
        updateCounter();
        counter.setText("✅ " + Prefs.toArabicDigits("100 / 100"));
        progress.setProgress(Prefs.PHRASES_NEEDED);
        input.setEnabled(false);
        btnSubmit.setVisibility(View.GONE);
        feedback.setText("تقبّل الله 🤍 الحماية اتشالت، وتقدر تمسح الأبلكيشن دلوقتي.");
        btnDoUninstall.setVisibility(View.VISIBLE);
    }

    private void launchUninstall() {
        if (isFinishing()) return;
        startActivity(new Intent(Intent.ACTION_DELETE, Uri.parse("package:" + getPackageName())));
    }
}
