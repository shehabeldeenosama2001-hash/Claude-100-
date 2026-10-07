"""Vector illustrations for the v2 videos (crisp at any scale)."""
import math, pathlib, random, sys

out = pathlib.Path(sys.argv[1])
rnd = random.Random(7)

# --- worn plastic cutting board: knife scratches + food stains -------------------------------
W, H = 900, 620
scr = []
for _ in range(260):
    x, y = rnd.uniform(60, W - 60), rnd.uniform(70, H - 50)
    ang = rnd.gauss(-0.25, 0.5)
    L = rnd.uniform(25, 170)
    x2, y2 = x + L * math.cos(ang), y + L * math.sin(ang)
    o = rnd.uniform(0.12, 0.45); w = rnd.uniform(0.8, 2.4)
    scr.append(f'<path d="M{x:.1f} {y:.1f} Q{(x+x2)/2+rnd.uniform(-6,6):.1f} {(y+y2)/2+rnd.uniform(-6,6):.1f} {x2:.1f} {y2:.1f}" stroke="#7d7a70" stroke-opacity="{o:.2f}" stroke-width="{w:.1f}" fill="none" stroke-linecap="round"/>')
stains = []
for _ in range(16):
    cx, cy = rnd.uniform(120, W - 120), rnd.uniform(130, H - 90)
    rx, ry = rnd.uniform(18, 70), rnd.uniform(10, 40)
    col = rnd.choice(["#c9a14a", "#b77d3a", "#a9893f", "#8f6b3a"])
    stains.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{col}" opacity="{rnd.uniform(.12,.32):.2f}" transform="rotate({rnd.uniform(-40,40):.0f} {cx:.0f} {cy:.0f})" filter="url(#blur)"/>')
(out / "plastic_board.svg").write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
  <linearGradient id="pb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfbf7"/><stop offset="1" stop-color="#e6e5dd"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>
  <clipPath id="c"><rect x="10" y="10" width="{W-20}" height="{H-20}" rx="38"/></clipPath>
</defs>
<rect x="10" y="22" width="{W-20}" height="{H-20}" rx="38" fill="#c9c6bb"/>
<rect x="10" y="10" width="{W-20}" height="{H-20}" rx="38" fill="url(#pb)"/>
<g clip-path="url(#c)">{''.join(stains)}{''.join(scr)}</g>
<rect x="{W/2-110}" y="40" width="220" height="56" rx="28" fill="#2a2a2a" opacity=".92"/>
</svg>''')

# --- chef knife ------------------------------------------------------------------------------
(out / "knife.svg").write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 160" width="900" height="160">
<defs>
  <linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d7dbe0"/><stop offset="1" stop-color="#8e959e"/></linearGradient>
  <linearGradient id="hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3d"/><stop offset="1" stop-color="#0c0c0d"/></linearGradient>
</defs>
<path d="M300 40 L840 52 Q890 58 880 80 Q760 132 300 128 Z" fill="url(#bl)" stroke="#6b7179" stroke-width="2"/>
<path d="M300 44 L830 56" stroke="#fff" stroke-width="3" opacity=".8"/>
<rect x="270" y="34" width="40" height="100" rx="6" fill="#9aa0a7"/>
<rect x="20" y="46" width="260" height="78" rx="34" fill="url(#hd)"/>
<circle cx="90" cy="85" r="8" fill="#c8ccd1"/><circle cx="160" cy="85" r="8" fill="#c8ccd1"/><circle cx="230" cy="85" r="8" fill="#c8ccd1"/>
</svg>''')

# --- warning triangle ------------------------------------------------------------------------
(out / "warning.svg").write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" width="400" height="360">
<path d="M200 18 Q214 18 222 32 L388 318 Q396 334 382 342 Q376 346 366 346 L34 346 Q24 346 18 342 Q4 334 12 318 L178 32 Q186 18 200 18 Z" fill="#FFD400" stroke="#111" stroke-width="16" stroke-linejoin="round"/>
<rect x="182" y="110" width="36" height="140" rx="18" fill="#111"/>
<circle cx="200" cy="292" r="22" fill="#111"/>
</svg>''')

# --- starburst corner (editorial accent, like the reference) ---------------------------------
pts = []
for i, (a, r) in enumerate([(0, 520), (12, 120), (24, 440), (38, 110), (52, 560), (64, 130), (78, 400), (90, 120)]):
    t = math.radians(a)
    pts.append(f"{r*math.cos(t):.0f},{r*math.sin(t):.0f}")
(out / "burst.svg").write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<polygon points="0,0 {' '.join(pts)}" fill="#ffffff"/></svg>''')
print("svgs ok")
