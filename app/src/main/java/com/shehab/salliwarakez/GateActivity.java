package com.shehab.salliwarakez;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

/**
 * Browsers, every time one is opened:
 *   1) type «صلي على النبي» 5 times,
 *   2) confirm «متأكد إنك عايز تكمل؟» by tapping 5 times.
 *   Then the browser is allowed until you leave it.
 * Facebook / Instagram / TikTok: step 1 only, then 10 minutes free (see SocialGate).
 */
public class GateActivity extends Activity {

    static final String EXTRA_PACKAGE = "browser_package";
    static final String EXTRA_SOCIAL = "social";
    static final int PHRASES_NEEDED = 5;
    static final int TAPS_NEEDED = 5;
    /** Short pause after each confirm tap so it can't be spam-tapped without reading. */
    private static final long TAP_COOLDOWN_MS = 700;

    /** True while this screen is in front; the service checks it to detect a blocked launch. */
    static volatile boolean visible;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private String browserPkg;
    private boolean social;
    private int phrases;
    private int tapsLeft;
    private boolean passed;

    private View phase1, phase2;
    private EditText input;
    private TextView title, counter, feedback;
    private Button btnConfirm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gate);

        phase1 = findViewById(R.id.phase1);
        phase2 = findViewById(R.id.phase2);
        input = findViewById(R.id.input);
        title = findViewById(R.id.gateTitle);
        counter = findViewById(R.id.counter);
        feedback = findViewById(R.id.feedback);
        btnConfirm = findViewById(R.id.btnConfirm);

        PhraseInput.blockPaste(input, feedback);
        findViewById(R.id.btnSubmit).setOnClickListener(v -> submit());
        input.setOnEditorActionListener((v, actionId, e) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE || actionId == EditorInfo.IME_NULL) {
                submit();
                return true;
            }
            return false;
        });
        btnConfirm.setOnClickListener(v -> confirmTap());
        findViewById(R.id.btnBack1).setOnClickListener(v -> giveUp());
        findViewById(R.id.btnBack2).setOnClickListener(v -> giveUp());

        start(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String pkg = intent.getStringExtra(EXTRA_PACKAGE);
        // A different app restarts the gate; the same one keeps the progress.
        if (pkg != null && !pkg.equals(browserPkg)) start(intent);
    }

    private void start(Intent intent) {
        browserPkg = intent.getStringExtra(EXTRA_PACKAGE);
        social = intent.getBooleanExtra(EXTRA_SOCIAL, false);
        title.setText(social
                ? "قبل ما تفتح " + appLabel(browserPkg) + " اكتب ٥ مرات:"
                : "قبل ما تفتح المتصفح اكتب ٥ مرات:");
        phrases = 0;
        tapsLeft = TAPS_NEEDED;
        passed = false;
        input.setText("");
        feedback.setText("");
        phase1.setVisibility(View.VISIBLE);
        phase2.setVisibility(View.GONE);
        updateCounter();
        input.requestFocus();
    }

    private void submit() {
        if (PhraseInput.normalize(input.getText()).isEmpty()) return;
        if (PhraseInput.matches(input.getText())) {
            phrases++;
            input.setText("");
            feedback.setText("اللهم صلِّ وسلم على نبينا محمد ﷺ");
            updateCounter();
            if (phrases >= PHRASES_NEEDED) {
                if (social) {
                    passed = true;
                    SocialGate.grant(this, browserPkg);
                    finish(); // back to the app underneath, free for 10 minutes
                } else {
                    showConfirm();
                }
            }
        } else {
            feedback.setText("❌ اكتبها كده بالظبط: صلي على النبي");
        }
    }

    private String appLabel(String pkg) {
        try {
            android.content.pm.PackageManager pm = getPackageManager();
            return pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString();
        } catch (Exception e) {
            return "التطبيق";
        }
    }

    private void updateCounter() {
        counter.setText(Prefs.toArabicDigits(phrases + " / " + PHRASES_NEEDED));
    }

    private void showConfirm() {
        phase1.setVisibility(View.GONE);
        phase2.setVisibility(View.VISIBLE);
        input.clearFocus();
        getWindow().getDecorView().post(() -> {
            android.view.inputmethod.InputMethodManager imm =
                    (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            if (imm != null) imm.hideSoftInputFromWindow(input.getWindowToken(), 0);
        });
        updateConfirmButton();
    }

    private void confirmTap() {
        tapsLeft--;
        if (tapsLeft <= 0) {
            passed = true;
            BrowserGate.grant(browserPkg);
            // Finishing returns to the browser that is waiting underneath.
            finish();
            return;
        }
        updateConfirmButton();
        btnConfirm.setEnabled(false);
        btnConfirm.setAlpha(0.5f);
        handler.postDelayed(() -> {
            btnConfirm.setEnabled(true);
            btnConfirm.setAlpha(1f);
        }, TAP_COOLDOWN_MS);
    }

    private void updateConfirmButton() {
        btnConfirm.setText("أيوه، متأكد  (" + Prefs.toArabicDigits(String.valueOf(tapsLeft)) + ")");
    }

    private void giveUp() {
        goHome();
        finish();
    }

    private void goHome() {
        Intent home = new Intent(Intent.ACTION_MAIN);
        home.addCategory(Intent.CATEGORY_HOME);
        home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(home);
    }

    @Override
    public void onBackPressed() {
        giveUp();
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        // Leaving with the home/recents button cancels; the next browser open starts over.
        if (!passed) finish();
    }

    @Override
    protected void onResume() {
        super.onResume();
        visible = true;
    }

    @Override
    protected void onPause() {
        super.onPause();
        visible = false;
    }
}
