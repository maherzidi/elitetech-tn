"""Importe les photos fournies par la boutique (deja detourees) dans le catalogue.

Les fichiers sources sont lus depuis %TEMP%/elitetech-user-photos (extraits des
photos envoyees dans la conversation). Chaque image est rognee, legerement
marginee puis optimisee en PNG transparent.

Usage: python scripts/import_shop_photos.py
"""
import os
from PIL import Image

SRC = os.path.join(os.environ["TEMP"], "elitetech-user-photos")
CO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(CO, "public", "images", "products")

JOBS = [
    ("photo-03.png", "honor-x5c.png"),
    ("photo-04.png", "honor-x6c.png"),
    ("photo-05.png", "honor-x6c-noir.png"),
    ("photo-07.png", "infinix-smart-20.png"),
    ("photo-11.png", "redmi-15c.png"),
    ("photo-08.webp", "redmi-15c-lineup.png"),
    ("photo-12.png", "redmi-a7-pro.png"),
    ("photo-13.webp", "redmi-a7-pro-lineup.png"),
]


def main():
    for src_name, dst_name in JOBS:
        src = os.path.join(SRC, src_name)
        if not os.path.exists(src):
            print(f"MISSING {src}")
            continue

        im = Image.open(src).convert("RGBA")
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)

        pad = max(4, int(max(im.size) * 0.04))
        canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad), im)

        if max(canvas.size) > 1000:
            ratio = 1000 / max(canvas.size)
            canvas = canvas.resize(
                (round(canvas.width * ratio), round(canvas.height * ratio)),
                Image.LANCZOS,
            )

        canvas.save(os.path.join(OUT, dst_name), "PNG", optimize=True)
        print(f"OK {dst_name:28} {canvas.width}x{canvas.height}")


if __name__ == "__main__":
    main()
