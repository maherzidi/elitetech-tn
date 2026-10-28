"""Rend le fond blanc d'une photo produit transparent (PNG).

Usage: python scripts/make_transparent.py <source> <destination> [seuil] [couleur_fond_hex]
Ex.:   python scripts/make_transparent.py in.jpg out.png 20 F7F7F5

Le fond est detecte par remplissage depuis les bords : les zones blanches
internes au produit (reflets, coque blanche) sont preservees.
"""
import sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 20
bg_hex = sys.argv[4] if len(sys.argv) > 4 else None

im = Image.open(src).convert("RGB")
w, h = im.size
key = (255, 0, 255)

seeds = [
    (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
    (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
]
for seed in seeds:
    if im.getpixel(seed) != key:
        ImageDraw.floodfill(im, seed, key, thresh=thresh)

rgba = im.convert("RGBA")
px = rgba.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if (r, g, b) == key:
            px[x, y] = (255, 255, 255, 0)

bbox = rgba.getbbox()
if bbox:
    rgba = rgba.crop(bbox)

# marge de 4 %
mw = max(1, int(rgba.width * 0.04))
mh = max(1, int(rgba.height * 0.04))
canvas = Image.new("RGBA", (rgba.width + 2 * mw, rgba.height + 2 * mh), (0, 0, 0, 0))
canvas.paste(rgba, (mw, mh), rgba)

if max(canvas.size) > 1100:
    ratio = 1100 / max(canvas.size)
    canvas = canvas.resize((int(canvas.width * ratio), int(canvas.height * ratio)), Image.LANCZOS)

canvas.save(dst, "PNG", optimize=True)

preview = canvas
if bg_hex:
    bg = tuple(int(bg_hex[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    sheet = Image.new("RGBA", canvas.size, bg)
    sheet.alpha_composite(canvas)
    preview = sheet
    preview.save(dst.replace(".png", "-preview.png"), "PNG")

print(f"OK {dst} {canvas.size[0]}x{canvas.size[1]}")
