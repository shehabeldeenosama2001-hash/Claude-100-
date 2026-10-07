"""Build true-proportion board cut-outs for each size from the real board's brushed texture.

Sizes from the Amazon listing (B0HJR2HCQC):
  S  = 8 x 11.5 in, round hanging hole        (the real cut-out is used as-is)
  L  = 9 x 13.5 in, rectangular handle slot
  XL = 11 x 15.5 in, rectangular handle slot
  XXL = 12 x 18 in (listing B0HFC5JFW7), rectangular handle slot like L/XL
All boards are written at the same scale (PPI px per inch) so they compare correctly.

Usage: make_size_boards.py <assets_dir>   (expects board_cutout.png from cutout_board.py)
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

A = sys.argv[1]
PPI = 80
S_IN = (8.0, 11.5)

s_cut = Image.open(f"{A}/board_cutout.png").convert("RGBA")
# S at common scale
s_w, s_h = round(S_IN[0] * PPI), round(S_IN[1] * PPI)
s_img = s_cut.resize((s_w, s_h), Image.LANCZOS)
a = s_img.getchannel("A").filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.8))  # drop white fringe
s_img.putalpha(a)
s_img.save(f"{A}/board_S.png")

# clean texture region of the real board (no hole, no edges): x 25-655, y 140-950 of the cut-out
tex = np.array(s_cut.convert("RGB"))[140:950, 25:655]


def slot_board(w_in, h_in, name):
    W, H = round(w_in * PPI), round(h_in * PPI)
    # vertical grain -> resize keeps the brushed look; tile horizontally if wider than source
    reps = int(np.ceil(W / tex.shape[1]))
    wide = np.concatenate([tex if i % 2 == 0 else tex[:, ::-1] for i in range(reps)], axis=1)
    img = Image.fromarray(wide).resize((W * wide.shape[1] // (tex.shape[1] * reps) if reps == 1 else W, H), Image.LANCZOS)
    img = img.resize((W, H), Image.LANCZOS)
    arr = np.array(img).astype(np.float32)
    # soft vertical light falloff like the real photo
    y = np.linspace(0, 1, H)[:, None, None]
    arr = arr * (1.03 - 0.06 * y)
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=round(W * 0.085), fill=255)
    sw, sh = round(W * 0.34), round(H * 0.062)       # handle slot like the real L/XL boards
    sx, sy = (W - sw) // 2, round(H * 0.045)
    d.rounded_rectangle([sx, sy, sx + sw, sy + sh], radius=sh // 2, fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(0.9))
    # thin darker edge line like the real board's rim
    edge = np.array(mask.filter(ImageFilter.FIND_EDGES)).astype(np.float32)[..., None] / 255
    arr = arr * (1 - 0.35 * edge)
    rgba = np.dstack([arr.clip(0, 255), np.array(mask, dtype=np.float32)]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(f"{A}/board_{name}.png")
    print(name, W, H)


slot_board(9.0, 13.5, "L")
slot_board(11.0, 15.5, "XL")
slot_board(12.0, 18.0, "XXL")
print("S", s_w, s_h)
