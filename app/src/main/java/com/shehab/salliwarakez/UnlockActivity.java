package com.shehab.salliwarakez;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

/** Type «صلي على النبي» 100 times, then the app releases its uninstall protection. */
public class UnlockActivity extends Activity {

    static final String TARGET = normalize("صلي على النبي");

    /** Anything that inserts this many characters at once is treated as a paste. */
    private static final int PASTE_THRESHOLD = 9;

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

        blockPaste();

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
        String typed = normalize(input.getText());
        if (typed.isEmpty()) return;

        if (typed.equals(TARGET)) {
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

    private void blockPaste() {
        ActionMode.Callback noMenu = new ActionMode.Callback() {
            @Override public boolean onCreateActionMode(ActionMode mode, Menu menu) { return false; }
            @Override public boolean onPrepareActionMode(ActionMode mode, Menu menu) { return false; }
            @Override public boolean onActionItemClicked(ActionMode mode, MenuItem item) { return false; }
            @Override public void onDestroyActionMode(ActionMode mode) {}
        };
        input.setCustomSelectionActionModeCallback(noMenu);
        input.setCustomInsertionActionModeCallback(noMenu);
        input.setLongClickable(false);

        // Keyboards can still paste from their own clipboard bar; catch big jumps in text.
        input.addTextChangedListener(new TextWatcher() {
            private boolean pasted;
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                pasted = count - before >= PASTE_THRESHOLD;
            }
            @Override public void afterTextChanged(Editable s) {
                if (pasted) {
                    pasted = false;
                    s.clear();
                    feedback.setText("✋ اكتبها بإيدك، مفيش لزق 🙂");
                }
            }
        });
    }

    /** Ignores tashkeel, hamza forms, ى/ي, extra spaces, stars and ﷺ. */
    static String normalize(CharSequence cs) {
        String s = cs.toString();
        s = s.replaceAll("[\\u064B-\\u065F\\u0670\\u0640]", "");
        s = s.replace('ى', 'ي').replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا');
        s = s.replace("ﷺ", "").replace("*", "").replace("٭", "");
        s = s.replaceAll("\\s+", " ").trim();
        return s;
    }
}
