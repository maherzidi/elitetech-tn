"""Detourage par remplissage depuis les bords (fonds blancs/gris clair).

Usage: python scripts/cut_white_bg.py <src> <dst> [crop x1,y1,x2,y2] [seuil]
Genere aussi un apercu dans %TEMP%/elitetech-preview.
"""
import os
import sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
crop = None
if len(sys.argv) > 3 and sys.argv[3] != "-":
    crop = tuple(int(v) for v in sys.argv[3].split(","))
thresh = int(sys.argv[4]) if len(sys.argv) > 4 else 18

im = Image.open(src).convert("RGB")
if crop:
    im = im.crop(crop)

w, h = im.size
key = (255, 0, 255)

# graines sur tout le pourtour (tous les 4 px) pour absorber les ombres/degrades
seeds = []
for x in range(0, w, 4):
    seeds += [(x, 0), (x, h - 1)]
for y in range(0, h, 4):
    seeds += [(0, y), (w - 1, y)]
for s in seeds:
    if im.getpixel(s) != key:
        ImageDraw.floodfill(im, s, key, thresh=thresh)

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

CO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 5
canvas = Image.new("RGBA", (rgba.width + 2 * PAD, rgba.height + 2 * PAD), (0, 0, 0, 0))
canvas.paste(rgba, (PAD, PAD), rgba)
if max(canvas.size) > 1000:
    r = 1000 / max(canvas.size)
    canvas = canvas.resize((round(canvas.width * r), round(canvas.height * r)), Image.LANCZOS)

outdir = os.path.join(CO, "public", "images", "products")
os.makedirs(outdir, exist_ok=True)
canvas.save(os.path.join(outdir, os.path.basename(dst)), "PNG", optimize=True)

prevdir = os.path.join(os.environ["TEMP"], "elitetech-preview")
os.makedirs(prevdir, exist_ok=True)
bg = Image.new("RGBA", canvas.size, (247, 247, 245, 255))
bg.alpha_composite(canvas)
bg.convert("RGB").save(os.path.join(prevdir, os.path.basename(dst).replace(".png", ".jpg")), quality=88)
print(f"OK {dst} {canvas.width}x{canvas.height}")
