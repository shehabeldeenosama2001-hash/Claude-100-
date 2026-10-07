"""Generates ugc-25s-v2/index.html — 25s UGC-style edit built only from real photos.

Layout per scene: blurred fill of the photo (phone-video feel) + the sharp photo in a rounded card
shown near native size, sticker on top, word-by-word captions below.
"""
import html
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "ugc-25s-v2" / "index.html"

VO = [  # (text, start, duration) — measured from source/audio/ugc-25s/u*.wav
    ("Stop! If you still chop on plastic, you need to see this.", 0.10, 2.89),
    ("This is my old plastic board. Every cut scrapes tiny bits into your food.", 3.08, 3.99),
    ("And wood? Stains, deep grooves, even mold.", 7.16, 2.52),
    ("So I switched to pure titanium.", 9.78, 1.68),
    ("Nothing soaks in. I just rinse it, and it's clean.", 11.56, 2.70),
    ("It's easy on my knives.", 14.36, 1.28),
    ("Two sides. One for meat, one for veggies.", 15.74, 2.58),
    ("Lemon doesn't even stain it.", 18.42, 1.47),
    ("And it goes right in the dishwasher.", 19.99, 1.66),
    ("Best kitchen upgrade under thirty bucks. Link is below!", 21.75, 3.03),
]

# id, image, start, duration, card (left, top, width, height), sticker, label chip (text, class) or None
SCENES = [
    ("p1", "plastic_real.jpg", 3.0, 4.1, (60, 380, 960, 560), "my old board 😬", ("MICROPLASTICS", "red")),
    ("p2", "wood_stained.jpg", 7.1, 1.3, (190, 330, 700, 1054), "wood isn't better 🤢", ("STAINS", "red")),
    ("p3", "wood_scratch.jpg", 8.4, 0.7, (60, 420, 960, 640), "wood isn't better 🤢", ("DEEP GROOVES", "red")),
    ("p4", "wood_moldy.jpg", 9.1, 0.62, (60, 450, 960, 560), "wood isn't better 🤢", ("MOLD", "red")),
    ("p5", "ti_kitchen.jpg", 9.72, 1.78, (70, 330, 940, 935), "100% titanium ✨", None),
    ("p6", "rinse_photo.jpg", 11.5, 2.8, (130, 300, 820, 1153), "nothing soaks in 💧", ("NON-POROUS", "acc")),
    ("p7", "knife_photo.jpg", 14.3, 1.38, (110, 320, 860, 934), "knife-friendly 🔪", ("SOFTER THAN STEEL", "acc")),
    ("p9", "lemon_photo.jpg", 18.36, 1.57, (40, 420, 1000, 687), "acid-proof 🍋", ("NO STAINS", "acc")),
    ("p10", "dishwasher_photo.jpg", 19.93, 1.77, (220, 300, 640, 1108), "dishwasher safe 🧼", None),
]

parts, js = [], []
for sid, img, st, du, (l, t, w, h), stick, chip in SCENES:
    chip_html = ""
    if chip:
        chip_html = f'\n        <div class="tag" id="{sid}chip" style="left: {l + 30}px; top: {t + h - 90}px;"><span class="chip {chip[1]}">{chip[0]}</span></div>'
    parts.append(f'''      <div id="{sid}" class="clip" data-start="{st}" data-duration="{du}" data-track-index="0">
        <div class="blurfill"><img src="assets/{img}" alt="" /></div>
        <div class="card" id="{sid}card" style="left: {l}px; top: {t}px; width: {w}px; height: {h}px;"><img src="assets/{img}" alt="" /></div>{chip_html}
        <div class="sticker" id="{sid}st" style="top: 150px;">{stick}</div>
      </div>''')
    js.append(f'tl.fromTo("#{sid}card", {{ scale: 1.08, y: 40 }}, {{ scale: 1, y: 0, duration: 0.45, ease: "power3.out" }}, {st});')
    js.append(f'tl.fromTo("#{sid}card img", {{ scale: 1.0 }}, {{ scale: 1.1, duration: {du}, ease: "none" }}, {st});')
    js.append(f'tl.fromTo("#{sid}st", {{ scale: 0.4, opacity: 0, rotation: -10 }}, {{ scale: 1, opacity: 1, rotation: -2, duration: 0.28, ease: "back.out(2.6)" }}, {st + 0.05});')
    if chip:
        js.append(f'tl.fromTo("#{sid}chip", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.5)" }}, {st + 0.3});')

# captions (word-by-word, chunked)
caps_html, caps_js, cid = [], [], 0
for text, st, du in VO:
    words = text.split()
    weights = [len(w) + 2 + (4 if w[-1] in ".,!?" else 0) for w in words]
    tot, t, times = sum(weights), st, []
    for w, wt in zip(words, weights):
        times.append((w, t, t + du * wt / tot)); t += du * wt / tot
    chunks, cur = [], []
    for item in times:
        cur.append(item)
        if len(cur) == 3 or item[0][-1] in ".,!?":
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

tpl = (HERE / "ugc_25s_template.html").read_text()
OUT.write_text(
    tpl.replace("{{SCENES}}", "\n".join(parts))
    .replace("{{SCENE_JS}}", "\n      ".join(js))
    .replace("{{CAPTIONS}}", "\n          ".join(caps_html))
    .replace("{{CAPTION_JS}}", "\n      ".join(caps_js))
)
print("wrote", OUT, "| caption chunks:", cid)
