"""Generates ugc-15s-v2/index.html from ugc_v2_template.html (word-by-word captions + stickers)."""
import html
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "ugc-15s-v2" / "index.html"

VO = [  # (text, start, duration) — durations measured from source/audio/v2/u*_t.wav
    ("Stop! If you still chop on plastic, watch this.", 0.20, 2.39),
    ("Every cut scrapes tiny bits of plastic into your food.", 3.10, 2.67),
    ("So I switched to pure titanium.", 6.00, 1.56),
    ("Nothing soaks in, no smell, and it's easy on my knives.", 7.75, 2.94),
    ("Two sides, and it goes right in the dishwasher.", 10.85, 2.27),
    ("Link is below!", 13.30, 0.85),
]
CHUNK = 3

caps_html, caps_js, cid = [], [], 0
for text, st, du in VO:
    words = text.split()
    weights = [len(w) + 2 + (4 if w[-1] in ".,!" else 0) for w in words]
    tot, t, times = sum(weights), st, []
    for w, wt in zip(words, weights):
        times.append((w, t, t + du * wt / tot)); t += du * wt / tot
    chunks, cur = [], []
    for item in times:
        cur.append(item)
        if len(cur) == CHUNK or item[0][-1] in ".,!":
            chunks.append(cur); cur = []
    if cur:
        chunks.append(cur)
    for ch in chunks:
        cid += 1
        spans = " ".join(f'<span class="cw" id="w{cid}_{i}">{html.escape(w.upper().rstrip(".,"))}</span>' for i, (w, _, _) in enumerate(ch))
        caps_html.append(f'<div class="cap" id="cap{cid}">{spans}</div>')
        s, e = ch[0][1], ch[-1][2]
        caps_js.append(f'tl.fromTo("#cap{cid}", {{ opacity: 0, scale: 0.85 }}, {{ opacity: 1, scale: 1, duration: 0.08 }}, {s:.3f});')
        caps_js.append(f'tl.set("#cap{cid}", {{ opacity: 0 }}, {e - 0.005:.3f});')
        for i, (_, ws, we) in enumerate(ch):
            caps_js.append(f'tl.set("#w{cid}_{i}", {{ color: "#ffe14d" }}, {ws:.3f});')
            caps_js.append(f'tl.set("#w{cid}_{i}", {{ color: "#ffffff" }}, {we:.3f});')

STICKERS = [  # id, html, start, duration, top, rotation, extra style
    ("k2", "every. single. cut. 😳", 3.05, 2.85, 170, -3, ""),
    ("k3", "100% titanium ✨", 6.05, 1.65, 170, 3, ""),
    ("k4", "no smell. no stains. 🙌", 7.75, 1.5, 170, -2, ""),
    ("k5", "knife-friendly 🔪", 9.3, 1.5, 170, 2, ""),
    ("k6", "double-sided 🔄", 10.85, 0.7, 170, -3, ""),
    ("k7", "dishwasher safe 🧼", 11.6, 1.6, 170, 2, ""),
    ("k8", "⭐ 4.7 on Amazon", 13.35, 1.65, 170, -3, "background: #111; color: #fff;"),
    ("k9", "tap “Shop now” 👇", 13.7, 1.3, 1640, -2, "background: #ffe14d;"),
]
st_html, st_js = [], []
for sid, h, st, du, top, rot, style in STICKERS:
    st_html.append(
        f'      <div id="{sid}" class="clip" data-start="{st}" data-duration="{du}" data-track-index="2">\n'
        f'        <div class="sticker" id="{sid}s" style="top: {top}px; {style}">{h}</div>\n'
        f"      </div>"
    )
    st_js.append(f'tl.fromTo("#{sid}s", {{ scale: 0.4, opacity: 0, rotation: {rot - 8} }}, {{ scale: 1, opacity: 1, rotation: {rot}, duration: 0.28, ease: "back.out(2.6)" }}, {st + 0.02});')

tpl = (HERE / "ugc_v2_template.html").read_text()
OUT.write_text(
    tpl.replace("{{STICKERS}}", "\n".join(st_html))
    .replace("{{CAPTIONS}}", "\n          ".join(caps_html))
    .replace("{{STICKER_JS}}", "\n      ".join(st_js))
    .replace("{{CAPTION_JS}}", "\n      ".join(caps_js))
)
print("wrote", OUT, "| caption chunks:", cid)
