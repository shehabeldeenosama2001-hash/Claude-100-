"""Generates ugc-15s/index.html from ugc_template.html.

Captions are laid out from the VO script + the measured duration of each trimmed TTS clip
(word timing is distributed by character weight, with extra weight on punctuation pauses).
"""
import html
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "ugc-15s" / "index.html"

VO = [  # (text, start, duration) — durations measured from source/audio/u*_t.wav
    ("Okay, I can't believe I was chopping on plastic this whole time.", 0.10, 3.14),
    ("This is pure titanium.", 3.40, 1.28),
    ("Lemon, raw meat, onions... nothing soaks in. Zero smell.", 4.90, 3.43),
    ("I just rinse it, or throw it in the dishwasher.", 8.55, 2.27),
    ("Best thirty dollar kitchen upgrade. Link is below!", 11.20, 2.70),
]
CHUNK = 3

caps_html, caps_js = [], []
cid = 0
for text, st, du in VO:
    words = text.split()
    weights = [len(w) + 2 + (4 if w[-1] in ".,!" else 0) for w in words]
    tot = sum(weights)
    t, times = st, []
    for w, wt in zip(words, weights):
        times.append((w, t, t + du * wt / tot))
        t += du * wt / tot
    chunks, cur = [], []
    for item in times:
        cur.append(item)
        if len(cur) == CHUNK or item[0][-1] in ".,!":
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    for ch in chunks:
        cid += 1
        spans = " ".join(
            f'<span class="cw" id="w{cid}_{i}">{html.escape(w.upper().rstrip(".,"))}</span>'
            for i, (w, _, _) in enumerate(ch)
        )
        caps_html.append(f'<div class="cap" id="cap{cid}">{spans}</div>')
        s, e = ch[0][1], ch[-1][2]
        caps_js.append(f'tl.fromTo("#cap{cid}", {{ opacity: 0, scale: 0.85 }}, {{ opacity: 1, scale: 1, duration: 0.08 }}, {s:.3f});')
        caps_js.append(f'tl.set("#cap{cid}", {{ opacity: 0 }}, {e - 0.005:.3f});')
        for i, (_, ws, we) in enumerate(ch):
            caps_js.append(f'tl.set("#w{cid}_{i}", {{ color: "#ffe14d" }}, {ws:.3f});')
            caps_js.append(f'tl.set("#w{cid}_{i}", {{ color: "#ffffff" }}, {we:.3f});')

SCENES = [  # id, image, start, duration, object-position, (prop, from, to)
    ("p1", "plastic.jpg", 0.0, 1.7, "50% 50%", ("scale", 1.0, 1.25)),
    ("p2", "wood.jpg", 1.7, 1.6, "30% 50%", ("scale", 1.35, 1.1)),
    ("p3", "ti_hero.jpg|fit", 3.3, 1.6, "50% 40%", ("scale", 1.25, 1.0)),
    ("p4", "lemon_full.jpg", 4.9, 1.75, "60% 50%", ("x", 0, -60)),
    ("p5", "board_meat.jpg", 6.65, 1.9, "70% 100%", ("scale", 1.0, 1.15)),
    ("p6", "rinse.jpg", 8.55, 1.25, "50% 50%", ("scale", 1.1, 1.25)),
    ("p7", "dishwasher.jpg", 9.8, 1.4, "50% 50%", ("scale", 1.2, 1.05)),
    ("p8", "ti_hero.jpg|fit", 11.2, 3.8, "50% 45%", ("scale", 1.0, 1.12)),
]
scene_html, scene_js = [], []
for sid, img, st, du, pos, (prop, a, b) in SCENES:
    img, _, mode = img.partition("|")
    if mode == "fit":  # whole product in frame over a blurred fill of the same shot
        inner = (f'        <div class="fill"><img src="assets/{img}" alt="" /></div>\n'
                 f'        <div class="cam fit" data-layout-allow-overflow id="{sid}c"><img src="assets/{img}" alt="" /></div>\n')
    else:
        inner = f'        <div class="cam" data-layout-allow-overflow id="{sid}c"><img src="assets/{img}" alt="" style="object-position: {pos};" /></div>\n'
    scene_html.append(
        f'      <div id="{sid}" class="clip" data-start="{st}" data-duration="{du}" data-track-index="0">\n'
        + inner + "      </div>"
    )
    scene_js.append(f'tl.fromTo("#{sid}c", {{ {prop}: {a} }}, {{ {prop}: {b}, duration: {du}, ease: "sine.inOut" }}, {st});')

STICKERS = [  # id, html, start, duration, top, rotation, extra style
    ("k1", "I threw out ALL my plastic<br />cutting boards 😳", 0.0, 3.3, 170, -2, ""),
    ("k2", "100% titanium 🔪✨", 3.4, 1.5, 200, 3, ""),
    ("k3", "no smell. no stains. 🙌", 6.7, 1.85, 200, -3, ""),
    ("k4", "dishwasher safe 🧼", 8.6, 2.6, 200, 2, ""),
    ("k5", "under $30 🤯", 11.3, 3.7, 190, -3, ""),
    ("k6", "⭐ 4.7 on Amazon", 12.1, 2.9, 330, 3, "background: #111; color: #fff;"),
    ("k7", "tap “Shop now” 👇", 12.8, 2.2, 1480, -2, "background: #ffe14d;"),
]
st_html, st_js = [], []
for sid, h, st, du, top, rot, style in STICKERS:
    st_html.append(
        f'      <div id="{sid}" class="clip" data-start="{st}" data-duration="{du}" data-track-index="2">\n'
        f'        <div class="sticker" id="{sid}s" style="top: {top}px; {style}">{h}</div>\n'
        f"      </div>"
    )
    first = 0.0 if st == 0 else st + 0.02
    from_vars = "scale: 1.15" if st == 0 else f"scale: 0.4, opacity: 0, rotation: {rot - 8}"
    st_js.append(f'tl.fromTo("#{sid}s", {{ {from_vars} }}, {{ scale: 1, opacity: 1, rotation: {rot}, duration: 0.28, ease: "back.out(2.6)" }}, {first});')

tpl = (HERE / "ugc_template.html").read_text()
out = (
    tpl.replace("{{SCENES}}", "\n".join(scene_html))
    .replace("{{STICKERS}}", "\n".join(st_html))
    .replace("{{CAPTIONS}}", "\n          ".join(caps_html))
    .replace("{{SCENE_JS}}", "\n      ".join(scene_js))
    .replace("{{STICKER_JS}}", "\n      ".join(st_js))
    .replace("{{CAPTION_JS}}", "\n      ".join(caps_js))
)
OUT.write_text(out)
print("wrote", OUT, "| caption chunks:", cid)
