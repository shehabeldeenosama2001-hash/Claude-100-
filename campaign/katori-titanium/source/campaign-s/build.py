"""Builds the size-S image campaign (8 feed creatives, 1080x1350 -> rendered 2160x2700).

Only real imagery: the cut-out S board (board_cutout.png, round hanging hole) and real listing
photos that show the same S board (rinse, knife + lemon). Problem shots are real photos of
used plastic/wood boards. Each creative = one marketing angle from PRODUCT_ANGLES_PROMPTS.txt.
"""
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
R = 1.4188  # board height / width

CSS = """
@font-face { font-family: Montserrat; font-weight: 500 900; src: url(assets/fonts/Montserrat-800.woff2) format("woff2"); }
@font-face { font-family: Playfair; font-weight: 900; src: url(assets/fonts/Playfair-normal-900.woff2) format("woff2"); }
@font-face { font-family: Playfair; font-weight: 400; font-style: italic; src: url(assets/fonts/Playfair-italic-400.woff2) format("woff2"); }
:root { --ink:#111214; --paper:#f2f0eb; --acc:#4a2be8; --red:#d10a0a; }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1350px; overflow:hidden; font-family: Montserrat, sans-serif; color: var(--ink); }
body { position:relative; }
.abs { position:absolute; }
.paper { background-color: var(--paper); background-image: linear-gradient(rgba(17,18,20,.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(17,18,20,.05) 1.5px, transparent 1.5px); background-size: 90px 90px; }
.indigo { background: radial-gradient(ellipse at 50% 40%, #6a4cff 0%, #4a2be8 55%, #2c189f 100%); color:#fff; }
.indigo-grid { position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.07) 1.5px, transparent 1.5px); background-size: 90px 90px; }
.dark { background: radial-gradient(ellipse at 50% 35%, #3a3f47 0%, #1a1d22 55%, #0b0c0e 100%); color:#fff; }
.kicker { font-weight:800; font-size:24px; letter-spacing:7px; text-transform:uppercase; }
.h { font-family: Playfair, serif; line-height:1.0; }
.h b { font-weight:900; } .h i { font-weight:400; font-style:italic; }
.board { position:absolute; }
.board img { width:100%; height:100%; display:block; }
.card { position:absolute; border-radius:30px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,.25); background:#fff; }
.card img { width:100%; height:100%; object-fit:cover; display:block; }
.chip { display:inline-flex; align-items:center; gap:10px; padding:14px 24px; border-radius:999px; font-weight:800; font-size:26px; white-space:nowrap; }
.chip.ink { background:var(--ink); color:#fff; } .chip.white { background:#fff; color:var(--ink); }
.chip.red { background:var(--red); color:#fff; } .chip.acc { background:var(--acc); color:#fff; }
.row { position:absolute; display:flex; gap:14px; flex-wrap:wrap; }
.stamp { position:absolute; width:120px; height:120px; border-radius:50%; background:var(--red); color:#fff; display:flex; align-items:center; justify-content:center; font-size:76px; font-weight:900; box-shadow:0 0 0 8px #fff, 0 16px 30px rgba(0,0,0,.3); }
.foot { position:absolute; left:60px; right:60px; bottom:44px; display:flex; justify-content:space-between; font-weight:800; font-size:20px; letter-spacing:4px; text-transform:uppercase; opacity:.75; }
.price { position:absolute; width:230px; height:230px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 18px 40px rgba(0,0,0,.25); }
.price .s { font-weight:800; font-size:24px; letter-spacing:4px; } .price .p { font-family:Playfair, serif; font-weight:900; font-size:96px; line-height:1; }
.tile { position:absolute; width:200px; height:230px; border:5px solid #fff; border-radius:18px; color:#fff; padding:16px 18px; }
.tile .n { font-weight:800; font-size:28px; } .tile .sym { font-family:Playfair, serif; font-weight:900; font-size:104px; line-height:1; }
.tile .nm { font-weight:700; font-size:21px; } .tile .wt { font-weight:600; font-size:18px; opacity:.8; }
"""


def board(left, top, h, extra=""):
    return (f'<div class="board" style="left:{left}px; top:{top}px; width:{h / R:.0f}px; height:{h}px; {extra}">'
            f'<img src="assets/board_cutout.png" alt="" /></div>')


def foot(dark=False):
    return '<div class="foot"><span>Katori</span><span>Size S · 8 × 11.5 in</span></div>'


def page(name, cls, body):
    html = (f'<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>{name}</title>'
            f'<style>{CSS}</style></head><body class="{cls}">{body}</body></html>\n')
    (HERE / f"{name}.html").write_text(html)


SHADOW = "filter: drop-shadow(0 30px 34px rgba(0,0,0,.28));"

# 1 — health / microplastics
page("c1-health", "paper", f"""
<div class="abs" style="left:70px; top:80px"><div class="kicker" style="color:var(--red)">The plastic problem</div>
<div class="h" style="font-size:96px; margin-top:20px"><i>Your board is</i><br/><b>feeding you<br/>plastic.</b></div></div>
<div class="card" style="left:60px; top:640px; width:520px; height:303px; transform:rotate(-5deg)"><img src="assets/plastic_real.jpg" alt="" /></div>
<div class="stamp" style="left:500px; top:600px">✕</div>
<div class="row" style="left:70px; top:1000px"><span class="chip red">Scratched plastic sheds into food</span></div>
{board(640, 520, 560, "transform:rotate(6deg); " + SHADOW)}
<div class="row" style="left:640px; top:1110px"><span class="chip acc">0 microplastics</span></div>
{foot()}""")

# 2 — hygiene / mold
page("c2-hygiene", "paper", f"""
<div class="abs" style="left:70px; top:80px"><div class="kicker" style="color:var(--acc)">Non-porous titanium</div>
<div class="h" style="font-size:104px; margin-top:20px"><b>Nothing soaks in.</b><br/><i>Nothing grows.</i></div></div>
<div class="card" style="left:60px; top:470px; width:540px; height:315px; transform:rotate(-3deg)"><img src="assets/wood_moldy.jpg" alt="" /></div>
<div class="row" style="left:80px; top:810px"><span class="chip red">Wood: mold &amp; stains</span></div>
{board(600, 560, 600, "transform:rotate(4deg); " + SHADOW)}
<div class="row" style="left:80px; top:910px; flex-direction:column; align-items:flex-start">
  <span class="chip ink">✓ No odors</span><span class="chip ink">✓ No stains</span><span class="chip ink">✓ No mold</span></div>
{foot()}""")

# 3 — easy clean
page("c3-easy-clean", "indigo", f"""
<div class="indigo-grid"></div>
<img class="abs" src="assets/burst.svg" alt="" style="right:-40px; top:-40px; width:380px; transform:scaleX(-1)" />
<div class="abs" style="left:70px; top:90px"><div class="kicker" style="color:#d9d2ff">Zero effort</div>
<div class="h" style="font-size:150px; margin-top:20px"><b>Rinse.</b><br/><i>Done.</i></div></div>
<div class="card" style="left:500px; top:400px; width:520px; height:731px; transform:rotate(3deg)"><img src="assets/rinse_photo.jpg" alt="" /></div>
<div class="row" style="left:70px; top:620px; flex-direction:column; align-items:flex-start">
  <span class="chip white">No scrubbing</span><span class="chip white">No oiling</span><span class="chip white">Dishwasher safe</span></div>
{foot()}""")

# 4 — durability (dark)
page("c4-durable", "dark", f"""
<div class="abs" style="left:0; right:0; top:90px; text-align:center"><div class="kicker" style="color:#aab4c8">Built to last</div>
<div class="h" style="font-size:100px; margin-top:20px"><b>The last board</b><br/><i>you'll need.</i></div></div>
<div class="abs" style="left:240px; top:420px; width:600px; height:600px; border-radius:50%; background: radial-gradient(circle, rgba(140,160,210,.25), rgba(0,0,0,0) 70%)"></div>
{board(330, 380, 600, "filter: drop-shadow(0 30px 40px rgba(0,0,0,.6)) drop-shadow(-8px 0 18px rgba(150,180,240,.2));")}
<div class="row" style="left:0; right:0; top:1040px; justify-content:center">
  <span class="chip white">Won't crack</span><span class="chip white">Won't warp</span><span class="chip white">Won't rust</span></div>
<div class="foot" style="color:#fff"><span>Katori</span><span>Size S · 8 × 11.5 in</span></div>""")

# 5 — knives
page("c5-knives", "paper", f"""
<div class="abs" style="left:70px; top:80px"><div class="kicker" style="color:var(--acc)">Softer than steel</div>
<div class="h" style="font-size:110px; margin-top:20px"><i>Kind to</i><br/><b>your knives.</b></div></div>
<div class="card" style="left:150px; top:470px; width:780px; height:847px; transform:rotate(-2deg); height:640px"><img src="assets/knife_photo.jpg" alt="" style="object-position:50% 40%" /></div>
<div class="row" style="left:70px; top:1150px"><span class="chip acc">Blades stay sharp longer</span><span class="chip ink">Double-sided</span></div>
{foot()}""")

# 6 — gift
RIBBON = """<svg class="abs" style="left:350px; top:430px; width:380px; height:539px; overflow:visible" viewBox="0 0 380 539">
  <rect x="168" y="-4" width="44" height="547" fill="#c8102e"/><rect x="-4" y="300" width="388" height="44" fill="#c8102e"/>
  <rect x="168" y="-4" width="8" height="547" fill="#e64a5f"/><rect x="-4" y="300" width="388" height="8" fill="#e64a5f"/>
  <path d="M178 312 L128 392 L146 396 L156 378 L170 398 Z" fill="#a50d26"/>
  <path d="M202 312 L252 392 L234 396 L224 378 L210 398 Z" fill="#a50d26"/>
  <path d="M190 318 C150 250, 70 262, 92 312 C108 350, 160 334, 190 322 Z" fill="#d61a37" stroke="#8f0b20" stroke-width="4"/>
  <path d="M190 318 C230 250, 310 262, 288 312 C272 350, 220 334, 190 322 Z" fill="#d61a37" stroke="#8f0b20" stroke-width="4"/>
  <path d="M120 306 C140 290, 165 300, 182 316" fill="none" stroke="#f0637a" stroke-width="5" stroke-linecap="round"/>
  <path d="M260 306 C240 290, 215 300, 198 316" fill="none" stroke="#f0637a" stroke-width="5" stroke-linecap="round"/>
  <rect x="172" y="302" width="36" height="34" rx="10" fill="#a50d26"/></svg>"""
page("c6-gift", "dark", f"""
<div class="abs" style="inset:0; background: radial-gradient(ellipse at 50% 45%, #5a3a22 0%, #2b1a10 60%, #140c07 100%)"></div>
<div class="abs" style="left:0; right:0; top:90px; text-align:center; color:#fff"><div class="kicker" style="color:#e8c48a">The gift that gets used</div>
<div class="h" style="font-size:96px; margin-top:20px"><i>For every</i> <b>home cook.</b></div></div>
{board(350, 430, 539, "filter: drop-shadow(0 30px 40px rgba(0,0,0,.6));")}
{RIBBON}
<div class="row" style="left:0; right:0; top:1030px; justify-content:center"><span class="chip white">Under $30</span><span class="chip white">Non-toxic</span><span class="chip white">Built to last</span></div>
<div class="foot" style="color:#fff"><span>Katori</span><span>Size S · 8 × 11.5 in</span></div>""")

# 7 — premium aesthetic
page("c7-premium", "indigo", f"""
<div class="indigo-grid"></div>
<img class="abs" src="assets/burst.svg" alt="" style="left:-40px; top:-40px; width:380px" />
<img class="abs" src="assets/burst.svg" alt="" style="right:-40px; top:520px; width:300px; transform:rotate(90deg)" />
<div class="abs" style="left:0; right:0; top:110px; text-align:center"><div class="h" style="font-size:120px"><b>Sleek.</b> <i>Pure.</i><br/><b>Titanium.</b></div></div>
<div style="position:absolute; inset:0; perspective:1600px">{board(355, 470, 520, "transform: rotateZ(-10deg) rotateY(20deg) rotateX(8deg); filter: drop-shadow(0 40px 50px rgba(10,0,60,.5));")}</div>
<div class="tile" style="left:80px; top:900px; background:var(--acc); transform:rotate(-6deg)"><div class="n">22</div><div class="sym">Ti</div><div class="nm">Titanium</div><div class="wt">47.867</div></div>
<div class="row" style="right:70px; top:1120px"><span class="chip white">100% pure titanium</span></div>
{foot()}""")

# 8 — offer / CTA
page("c8-offer", "", f"""
<div class="abs" style="inset:0; background: radial-gradient(ellipse at 50% 45%, #ffffff 0%, #eef0f3 45%, #d6dae0 100%)"></div>
<div class="abs" style="left:0; right:0; top:80px; text-align:center"><div class="kicker" style="color:var(--acc)">Ditch plastic for good</div>
<div class="h" style="font-size:104px; margin-top:20px"><b>Upgrade</b> <i>your board.</i></div></div>
{board(370, 330, 600, SHADOW)}
<div class="price" style="left:770px; top:330px; background:var(--ink); color:#fff; transform:rotate(-10deg)"><span class="s">UNDER</span><span class="p" style="color:#ffb800">$30</span></div>
<div class="row" style="left:0; right:0; top:985px; justify-content:center"><span class="chip ink">0 plastic</span><span class="chip ink">0 mold</span><span class="chip ink">0 odors</span></div>
<div class="abs" style="left:0; right:0; top:1080px; text-align:center; font-weight:800; font-size:32px"><span style="color:#a87400; letter-spacing:4px">★★★★★</span> 4.7 on Amazon</div>
<div class="abs" style="left:240px; top:1150px; width:600px; height:110px; border-radius:999px; background:linear-gradient(180deg,#ffcc33,#ff9f00); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:44px; letter-spacing:3px; box-shadow:0 16px 36px rgba(255,159,0,.4)">SHOP NOW →</div>
""")
print("built 8 creatives")
