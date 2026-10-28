"""Detoure un telephone sur fond blanc en suivant sa silhouette arrondie.

Le crop doit cadrer l'appareil de pres. Le masque arrondi conserve les zones
claires du dos (panneaux blancs) que les modeles IA confondent avec le fond.

Usage: python scripts/mask_rounded.py <src> <dst> x1,y1,x2,y2 [rayon]
"""
import os
import sys
from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
x1, y1, x2, y2 = (int(v) for v in sys.argv[3].split(","))
radius = int(sys.argv[4]) if len(sys.argv) > 4 else 0

im = Image.open(src).convert("RGBA").crop((x1, y1, x2, y2))
w, h = im.size
if not radius:
    radius = max(6, int(min(w, h) * 0.09))

mask = Image.new("L", (w, h), 0)
d = ImageDraw.Draw(mask)
d.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
im.putalpha(mask)

PAD = max(2, int(min(w, h) * 0.03))
canvas = Image.new("RGBA", (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
canvas.paste(im, (PAD, PAD), im)

CO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
canvas.save(os.path.join(CO, "public", "images", "products", os.path.basename(dst)), "PNG", optimize=True)

prev = os.path.join(os.environ["TEMP"], "elitetech-preview")
os.makedirs(prev, exist_ok=True)
bg = Image.new("RGBA", canvas.size, (247, 247, 245, 255))
bg.alpha_composite(canvas)
bg.convert("RGB").save(os.path.join(prev, os.path.basename(dst).replace(".png", ".jpg")), quality=88)
print(f"OK {dst} {canvas.size[0]}x{canvas.size[1]}")
