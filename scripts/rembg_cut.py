"""Detoure des photos produits avec rembg et enregistre des PNG transparents.

Usage: python scripts/rembg_cut.py <source> <destination> [couleur_apercu]
"""
import sys
import os
from rembg import remove, new_session
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
bg_hex = sys.argv[3] if len(sys.argv) > 3 else None

session = new_session("u2net")
im = Image.open(src).convert("RGBA")
out = remove(im, session=session, post_process_mask=True)

bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)

mw = max(1, int(out.width * 0.05))
mh = max(1, int(out.height * 0.05))
canvas = Image.new("RGBA", (out.width + 2 * mw, out.height + 2 * mh), (0, 0, 0, 0))
canvas.paste(out, (mw, mh), out)

if max(canvas.size) > 1100:
    ratio = 1100 / max(canvas.size)
    canvas = canvas.resize((int(canvas.width * ratio), int(canvas.height * ratio)), Image.LANCZOS)

canvas.save(dst, "PNG", optimize=True)

if bg_hex:
    bg = tuple(int(bg_hex[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    sheet = Image.new("RGBA", canvas.size, bg)
    sheet.alpha_composite(canvas)
    sheet.save(os.path.splitext(dst)[0] + "-preview.png", "PNG")

print(f"OK {dst} {canvas.width}x{canvas.height}")
