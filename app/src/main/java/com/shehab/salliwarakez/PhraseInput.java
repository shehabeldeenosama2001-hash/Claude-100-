package com.shehab.salliwarakez;

import android.text.Editable;
import android.text.TextWatcher;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.EditText;
import android.widget.TextView;

/** Shared helpers for screens where «صلي على النبي» must be typed by hand. */
final class PhraseInput {
    static final String TARGET = normalize("صلي على النبي");

    /** Anything that inserts this many characters at once is treated as a paste. */
    private static final int PASTE_THRESHOLD = 9;

    private PhraseInput() {}

    static boolean matches(CharSequence typed) {
        return normalize(typed).equals(TARGET);
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

    /** Removes the copy/paste menu and clears the field if a big chunk appears at once. */
    static void blockPaste(EditText input, TextView feedback) {
        ActionMode.Callback noMenu = new ActionMode.Callback() {
            @Override public boolean onCreateActionMode(ActionMode mode, Menu menu) { return false; }
            @Override public boolean onPrepareActionMode(ActionMode mode, Menu menu) { return false; }
            @Override public boolean onActionItemClicked(ActionMode mode, MenuItem item) { return false; }
            @Override public void onDestroyActionMode(ActionMode mode) {}
        };
        input.setCustomSelectionActionModeCallback(noMenu);
        input.setCustomInsertionActionModeCallback(noMenu);
        input.setLongClickable(false);

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
}
