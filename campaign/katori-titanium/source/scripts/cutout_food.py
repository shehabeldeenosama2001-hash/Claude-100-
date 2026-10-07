"""Cut the real steak and the real vegetables out of the listing photo (white background).
Grey board pixels and the near-white floor are excluded; the onion (white, unsafe to key) is left out.
Usage: cutout_food.py <listing_photo> <out_dir>  -> steak.png, veggies.png
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = np.array(Image.open(src).convert("RGB")).astype(np.float32)
mx, mn = im.max(2), im.min(2)
sat = mx - mn


def cut(box, name, sat_min, onion=None, floor_y=None):
    x0, y0, x1, y1 = box
    sub = im[y0:y1, x0:x1]
    a = (sat[y0:y1, x0:x1] > sat_min).astype(np.uint8) * 255
    if onion is not None:                      # remove the onion by colour, keep the red pepper
        ox0, oy0, ox1, oy1 = onion
        r, g = sub[oy0:oy1, ox0:ox1, 0], sub[oy0:oy1, ox0:ox1, 1]
        not_red = ~((r > 1.6 * g) & (r > 120))
        a[oy0:oy1, ox0:ox1][not_red] = 0
    if floor_y is not None:                    # pink floor reflections under the tomatoes
        low = sat[y0 + floor_y:y1, x0:x1] < 90
        a[floor_y:][low] = 0
    m = Image.fromarray(a).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))  # close small holes
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = np.dstack([im[y0:y1, x0:x1], np.array(m, dtype=np.float32)]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    img.crop(img.getbbox()).save(f"{out}/{name}.png")
    print(name, img.getbbox())


cut((15, 915, 530, 1125), "steak", 22)                                 # steak + parsley
cut((555, 630, 1075, 1110), "veggies", 38, onion=(0, 290, 160, 480), floor_y=440)   # pepper, lettuce, broccoli, tomatoes (no onion)
