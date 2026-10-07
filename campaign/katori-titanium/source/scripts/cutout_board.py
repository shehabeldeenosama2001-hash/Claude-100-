"""Cut the real titanium board out of the white-background listing photo (no AI).

- Board outline (measured on the 1075x1164 listing photo): x 92-775, y 3-975, corner r~62,
  hanging hole centre (673, 95) r~27.
- The printed size label "S: 8 x 11.5 Inch" (x 665-717, y 210-565) and the food covering the
  bottom/right of the board are removed by extending the board's own vertical brushed grain
  down each column (mirrored tiling of the clean rows just above), which is seamless because
  the grain runs vertically.

Usage: cutout_board.py <listing_photo> <out_dir>
Writes board_cutout.png (board only, RGBA) and food_cutout.png (board + food, RGBA).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert("RGB")).astype(np.float32)
H, W, _ = im.shape
X0, X1, Y0, Y1, RAD = 92, 775, 3, 975, 62
HOLE = (673, 95, 27)
TEXT = (662, 720, 205, 570)  # x0, x1, y0, y1

mx, mn = im.max(2), im.min(2)
sat = mx - mn


def fill_column(img, x, start, end, band=70):
    """Fill rows [start, end] of column x with mirrored tiles of the `band` rows above start."""
    src = img[max(Y0 + 5, start - band):start, x].copy()
    if len(src) < 8:
        return
    y, flip = start, False
    while y <= end:
        seg = src[::-1] if flip else src
        n = min(len(seg), end - y + 1)
        img[y:y + n, x] = seg[:n]
        y += n
        flip = not flip


board = im.copy()
# 1) printed size label: per column, cross-fade a mirrored tile of the clean grain above the
#    label into one from below it, so brightness matches at both ends (no visible patch)
tx0, tx1, ty0, ty1 = TEXT
n = ty1 - ty0 + 1
t = np.linspace(0, 1, n)[:, None]
for x in range(tx0, tx1 + 1):
    above = im[ty0 - 60:ty0, x]
    below = im[ty1 + 1:ty1 + 61, x]
    A = np.concatenate([above[::-1], above] * (n // 120 + 2))[:n]
    B = np.concatenate([below, below[::-1]] * (n // 120 + 2))[-n:]
    board[ty0:ty1 + 1, x] = (1 - t) * A + t * B
textfixed = board.copy()  # label removed, food untouched
# 2) food occlusion (first strongly saturated / dark pixel below y=600 in each column)
for x in range(X0, X1 + 1):
    col_food = np.where((sat[600:Y1 + 1, x] > 28) | (mx[600:Y1 + 1, x] < 140))[0]
    if len(col_food):
        fill_column(board, x, 600 + int(col_food[0]) - 4, Y1)
# soften any residual vertical seams with a tiny horizontal blur only inside filled areas
blur = np.array(Image.fromarray(board.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)
board = 0.5 * board + 0.5 * blur

mask = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mask)
d.rounded_rectangle([X0, Y0, X1, Y1], radius=RAD, fill=255)
hx, hy, hr = HOLE
d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=0)
mask = mask.filter(ImageFilter.GaussianBlur(0.9))

rgba = np.dstack([board, np.array(mask, dtype=np.float32)]).clip(0, 255).astype(np.uint8)
Image.fromarray(rgba, "RGBA").crop((X0 - 3, Y0 - 3, X1 + 4, Y1 + 4)).save(f"{out}/board_cutout.png")

# board + food (original pixels, white background removed)
dist = np.sqrt(((255 - im) ** 2).sum(2))
alpha = np.clip((dist - 8) / 22, 0, 1) * 255
orig_board = Image.new("L", (W, H), 0)
od = ImageDraw.Draw(orig_board)
od.rounded_rectangle([X0, Y0, X1, Y1], radius=RAD, fill=255)
od.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=0)
alpha = np.maximum(alpha, np.array(orig_board, dtype=np.float32))
a_img = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
clean = textfixed  # original photo with only the printed size label removed
food_rgba = np.dstack([clean, np.array(a_img, dtype=np.float32)]).clip(0, 255).astype(np.uint8)
Image.fromarray(food_rgba, "RGBA").save(f"{out}/food_cutout.png")
print("ok", W, H)
