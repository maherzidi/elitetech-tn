"""Prepare les visuels des accessoires (fond transparent) pour la boutique.

Les sources sont lues depuis %TEMP%/elitetech-accessoires :
  - images officielles Inkax (X01, CB-33, Y03) sur fond blanc
  - visuel CB-07 (vision.tn) et vdenmenv (Felnatech) sur fond uni

Le fond est retire par remplissage depuis les bords (PIL floodfill), ce qui
preserve les parties blanches a l'interieur du produit. Un léger detourage
est applique pour eviter les halos.

Usage: python scripts/import_accessory_photos.py
"""
import os

from PIL import Image, ImageDraw, ImageFilter

SRC = os.path.join(os.environ["TEMP"], "elitetech-accessoires")
CO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(CO, "public", "images", "products")
SENTINEL = (255, 0, 255)

# (source, destination, crop eventuel, tolerance du fond)
JOBS = [
    ("x01-official-a.jpg", "inkax-x01.png", None, 26),
    # CB-07 : la photo de la boite evite de decouper le blanc du connecteur.
    ("cb07-c.webp", "inkax-cb07.png", None, 26),
    ("cb33-official.png", "inkax-cb33.png", None, 26),
    ("y03-official.jpg", "inkax-y03.png", None, 26),
    ("vd-alt2.png", "vdenmenv-micro-usb.png", (295, 95, 632, 635), 18),
    ("yatel-k11.jpg", "yatel-k11.png", None, 26),
    ("r8-1801.jpeg", "r8-1801.png", None, 26),
    ("redragon-bk7092.jpg", "redragon-bk7092.png", None, 26),
]


def remove_background(im: Image.Image, tolerance: int) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    # Remplissage depuis les quatre coins et le milieu des bords.
    for point in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
                  (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1)]:
        ImageDraw.floodfill(im, point, SENTINEL, thresh=tolerance)

    alpha = Image.new("L", im.size, 255)
    px = im.load()
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r == SENTINEL[0] and g == SENTINEL[1] and b == SENTINEL[2]:
                ap[x, y] = 0
    # Adoucit le contour du masque.
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))

    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def main():
    for src_name, dst_name, crop, tolerance in JOBS:
        src = os.path.join(SRC, src_name)
        if not os.path.exists(src):
            print(f"MISSING {src}")
            continue

        im = Image.open(src)
        if crop:
            im = im.crop(crop)

        im = remove_background(im, tolerance)

        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)

        pad = max(6, int(max(im.size) * 0.04))
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
