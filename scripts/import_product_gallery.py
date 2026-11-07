"""Prepare les galeries photos des produits EliteTech.

Sources :
  - le dossier "elitetech photo articles" fourni par le magasin ;
  - les rendus officiels HONOR X5c Plus telecharges dans %TEMP%/honor-xprs.

Traitement :
  - detourage du fond blanc par remplissage depuis les bords (PIL floodfill),
    afin de conserver les zones blanches internes au produit ;
  - recadrage sur le produit + marge ;
  - agrandissement LANCZOS + accentuation legere pour les petites sources ;
  - export WebP avec transparence.

Usage: python scripts/import_product_gallery.py
"""
from __future__ import annotations

import os

from PIL import Image, ImageDraw, ImageFilter

PHOTOS = r"C:\Users\Elite Tech\Desktop\elitetech photo articles"
HONOR = os.path.join(os.environ["TEMP"], "honor-xprs")
CO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(CO, "public", "images", "products")

SENTINEL = (255, 0, 255)

# (source, destination, clean_bg, crop, tolerance, max_size)
JOBS = [
    # HONOR X5c Plus 4/128 : rendus officiels, fond blanc.
    (os.path.join(HONOR, "Honor_X5c_plus_4GB_Ram_128GB_blue_1.webp"),
     "honor-x5c-plus-cyan-avant-arriere.webp", True, None, 18, 800),
    (os.path.join(HONOR, "Honor_X5c_plus_4GB_Ram_128GB_blue_back_view.webp"),
     "honor-x5c-plus-cyan-arriere.webp", True, None, 18, 800),
    (os.path.join(HONOR, "Honor_X5c_plus_4GB_Ram_128GB_blue_side_view.webp"),
     "honor-x5c-plus-cyan-profil.webp", True, None, 18, 800),
    (os.path.join(HONOR, "two_Honor_X5c_plus_4GB_Ram_128GB_black_1.webp"),
     "honor-x5c-plus-noir-avant-arriere.webp", True, None, 18, 800),
    (os.path.join(HONOR, "Honor_X5c_plus_4GB_Ram_128GB_black_back_view.webp"),
     "honor-x5c-plus-noir-arriere.webp", True, None, 18, 800),
    (os.path.join(HONOR, "two_Honor_X5c_plus_4GB_Ram_128GB_black_side_view.webp"),
     "honor-x5c-plus-noir-profil.webp", True, None, 18, 800),

    # Enceinte P Pro5 : photos du fournisseur (220 px) -> agrandies.
    (os.path.join(PHOTOS, "S3c313f92dd0f45d2b7ddae5c6e619820E.jpg_220x220q75.jpg_.jpeg"),
     "p-pro5-bleu-action.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S3ed8bdf690ab4ab69ca3ceb42e8d9b90I.jpg_220x220q75.jpg_.avif"),
     "p-pro5-camouflage-action.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S477be9ea42e54a099fb4df14eec611a01.jpg_220x220q75.jpg_.avif"),
     "p-pro5-rouge.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S5b1764a5cfbf422ba8931d743aede7a0M.jpg_220x220q75.jpg_.avif"),
     "p-pro5-rouge-action.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S3416476e111546d6b4e9a22912a572c38.jpg_220x220q75.jpg_.avif"),
     "p-pro5-bleu.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S43bda3bf511e48fba6cd054a0aecac13t.jpg_220x220q75.jpg_.avif"),
     "p-pro5-lineup.webp", False, None, 0, 800),
    (os.path.join(PHOTOS, "S43f5d625658842ac8afa4eca40817919S.jpg_220x220q75.jpg_.avif"),
     "p-pro5-noir-action.webp", False, None, 0, 800),

    # Enceinte ROMIS RM-S213 LED : photo de gamme + visuel noir detoure.
    # Le crop coupe le texte "RM-S213 LED" en haut et laisse le packaging.
    (os.path.join(PHOTOS, "images.jpg"),
     "romis-rm-s213-lineup.webp", True, (0, 42, 520, 359), 60, 1000),
    (os.path.join(PHOTOS, "1-removebg-preview.webp"),
     "romis-rm-s213-noir.webp", False, None, 0, 800),

    # Accessoires : photos fournisseur en 800 px.
    (os.path.join(PHOTOS, "haut-parleur-bluetooth-sans-fil-zqs-1430-noir.jpg"),
     "zqs-1430-noir.webp", True, None, 24, 1000),
    (os.path.join(PHOTOS, "casque-sans-fil-p47m-cat-bleu-100.jpg"),
     "casque-p47m-bleu.webp", True, None, 20, 1000),

    # Telephones portables : coloris supplementaires.
    (os.path.join(PHOTOS, "images (2).jpg"),
     "lp-starlight-noir.webp", True, None, 18, 800),
    (os.path.join(PHOTOS, "images (3).jpg"),
     "lp-starlight-bleu.webp", True, None, 18, 800),
    (os.path.join(PHOTOS, "images (4).jpg"),
     "lp-starlight-argent.webp", True, None, 14, 800),
    (os.path.join(PHOTOS, "images (1).jpg"),
     "smartec-prime-noir.webp", True, None, 18, 800),
    (os.path.join(PHOTOS, "telephone-portable-itel-it2165-noir-1.jpg"),
     "itel-it2165-noir-avant.webp", True, None, 20, 1000),
    (os.path.join(PHOTOS, "telephone-portable-itel-it2165-noir-2.jpg"),
     "itel-it2165-noir-arriere.webp", True, None, 20, 1000),
    (os.path.join(PHOTOS, "smartphone-infinix-smart-20-4go-128go-noir.jpg"),
     "infinix-smart-20-noir.webp", True, None, 20, 1000),
]


def remove_background(im: Image.Image, tolerance: int) -> Image.Image:
    """Retire le fond uni connecte aux bords, sans toucher aux blancs internes."""
    im = im.convert("RGB")
    w, h = im.size
    points = [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
        (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1),
    ]
    for point in points:
        ImageDraw.floodfill(im, point, SENTINEL, thresh=tolerance)

    alpha = Image.new("L", im.size, 255)
    px = im.load()
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r == SENTINEL[0] and g == SENTINEL[1] and b == SENTINEL[2]:
                ap[x, y] = 0

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def resize(im: Image.Image, max_size: int) -> Image.Image:
    largest = max(im.size)
    if largest >= max_size:
        ratio = max_size / largest
        im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.LANCZOS)
    else:
        ratio = max_size / largest
        if ratio > 1.2:
            im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.LANCZOS)
            im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=3))
    return im


def main() -> None:
    for src, dst_name, clean_bg, crop, tolerance, max_size in JOBS:
        if not os.path.exists(src):
            print(f"MISSING {src}")
            continue

        im = Image.open(src).convert("RGBA")
        if crop:
            im = im.crop(crop)
        # Les rendus HONOR sont deja detoures : on recadre sans retoucher l'alpha.
        existing_alpha = im.getchannel("A").getextrema()[0] < 255
        if existing_alpha:
            bbox = im.getchannel("A").getbbox()
            if bbox:
                im = im.crop(bbox)
        elif clean_bg:
            im = remove_background(im, tolerance)
            bbox = im.getbbox()
            if bbox:
                im = im.crop(bbox)

        im = resize(im, max_size)

        pad = max(8, int(max(im.size) * 0.05))
        canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad), im)

        canvas.save(os.path.join(OUT, dst_name), "WEBP", quality=92, method=6)
        print(f"OK {dst_name:42} {canvas.width}x{canvas.height}")


if __name__ == "__main__":
    main()

