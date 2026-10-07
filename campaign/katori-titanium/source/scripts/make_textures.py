"""Procedural brushed-titanium texture (vertical grain) used for the 3D board render."""
import sys
import numpy as np
from PIL import Image, ImageFilter

out = sys.argv[1]
W, H = 1200, 1740
rng = np.random.default_rng(22)  # Ti = 22
n = rng.standard_normal((H, W))
# long vertical streaks: box-blur along y (cumsum trick) with two lengths
def vblur(a, k):
    c = np.cumsum(np.pad(a, ((k, 0), (0, 0)), mode="wrap"), axis=0)
    return (c[k:] - c[:-k]) / k
fine = vblur(n, 90)
coarse = vblur(rng.standard_normal((H, W)), 400)
cols = np.convolve(rng.standard_normal(W), np.ones(25) / 25, "same")  # band variation across width
tex = 0.55 * fine / fine.std() + 0.35 * coarse / coarse.std() + 0.6 * (cols / cols.std())[None, :]
tex = (tex - tex.min()) / (tex.max() - tex.min())
base = 168 + 62 * tex                              # 168..230 grey
y = np.linspace(0, 1, H)[:, None]
base = base + 10 * np.sin(y * np.pi) - 6 * y       # soft vertical light falloff
rgb = np.stack([base - 3, base, base + 5], axis=2).clip(0, 255).astype("uint8")
img = Image.fromarray(rgb).filter(ImageFilter.UnsharpMask(2, 60, 1))
img.save(out, quality=94)
print("wrote", out)
