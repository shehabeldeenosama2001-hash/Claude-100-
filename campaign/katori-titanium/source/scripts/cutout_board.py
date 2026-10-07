"""Cut the real titanium board out of the white-background listing photo (no AI).

The board's bottom edge is hidden behind the steak/veggies, so the occluded strip is
reconstructed by extending the board's own vertical brushed grain downward (the grain is
vertical, so copying rows from just above the occlusion is visually seamless), then the
board is masked with its own rounded-rectangle outline + hanging hole.

Usage: cutout_board.py <listing_photo> <out_dir>
Writes board_cutout.png (board only, RGBA) and food_cutout.png (board + food, RGBA).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert("RGB")).astype(np.float32)
H, W, _ = im.shape
mx, mn = im.max(2), im.min(2)
sat = mx - mn
grey = (sat < 22) & (mx < 246)

# --- board outline from rows/cols where only the board is present -----------------------
top_rows = np.where(grey[:, : W // 2].sum(1) > 40)[0]
y0 = int(top_rows.min())
mid = grey[y0 + 200 : y0 + 500]
cols = np.where(mid.sum(0) > 100)[0]
x0, x1 = int(cols.min()), int(cols.max())
# bottom edge: board left column stays grey until the meat covers it -> use the left edge column
left_col = grey[:, x0 + 25]
ys = np.where(left_col)[0]
y1 = int(ys.max())
print(f"board bbox x {x0}-{x1}, y {y0}-{y1} (image {W}x{H})")

# --- occlusion: food pixels (saturated) inside the board box -----------------------------
food = (sat > 40) | (mx < 120)
occ_rows = np.where(food[:, x0:x1].sum(1) > 6)[0]
occ_rows = occ_rows[(occ_rows > y0 + 100) & (occ_rows <= y1)]
y_occ = int(occ_rows.min()) - 6 if len(occ_rows) else y1
print("food starts overlapping board at y", y_occ)

board = im.copy()
band = board[y_occ - 60 : y_occ].copy()          # 60px clean strip of grain right above food
fill_y = y_occ
while fill_y < y1 + 1:                            # tile it downward, mirrored to avoid seams
    take = min(band.shape[0], y1 + 1 - fill_y)
    board[fill_y : fill_y + take, x0:x1 + 1] = band[:take, x0:x1 + 1]
    band = band[::-1]
    fill_y += take

# --- mask: rounded rectangle with radius + hanging hole ---------------------------------
bw, bh = x1 - x0, y1 - y0
r = int(bw * 0.075)
mask = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mask)
d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=255)
# hole: darkest-white circle near the top-right (white pixels surrounded by grey)
hole = (~grey) & (mx > 240)
hy, hx = np.where(hole[y0 : y0 + int(bh * 0.15), x0 + int(bw * 0.7) : x1 - 5])
if len(hx):
    cx = x0 + int(bw * 0.7) + hx.mean(); cy = y0 + hy.mean(); rad = max(hx.ptp(), hy.ptp()) / 2 + 2
    d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=0)
    print(f"hole at ({cx:.0f},{cy:.0f}) r={rad:.0f}")
mask = mask.filter(ImageFilter.GaussianBlur(0.8))

rgba = np.dstack([board, np.array(mask, dtype=np.float32)]).clip(0, 255).astype(np.uint8)
Image.fromarray(rgba, "RGBA").crop((x0 - 4, y0 - 4, x1 + 5, y1 + 5)).save(f"{out}/board_cutout.png")

# --- board + food version: alpha from distance to white ----------------------------------
dist = np.sqrt(((255 - im) ** 2).sum(2))
alpha = np.clip((dist - 10) / 25, 0, 1) * 255
alpha = np.maximum(alpha, np.array(mask, dtype=np.float32))
a_img = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
food_rgba = np.dstack([im, np.array(a_img, dtype=np.float32)]).clip(0, 255).astype(np.uint8)
Image.fromarray(food_rgba, "RGBA").save(f"{out}/food_cutout.png")
print("ok")
