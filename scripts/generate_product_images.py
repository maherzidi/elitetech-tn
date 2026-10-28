"""Genere les 20 visuels produits (PNG transparents) du catalogue EliteTech.

Usage: python scripts/generate_product_images.py
Sources : %TEMP%/elitetech-src + images deja presentes dans public/images/products.
"""
import os
import sys
from rembg import remove, new_session
from PIL import Image

SRC = os.path.join(os.environ["TEMP"], "elitetech-src")
PUB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images", "products")
OUT = PUB
PREV = os.path.join(os.environ["TEMP"], "elitetech-preview")
os.makedirs(PREV, exist_ok=True)

# (fichier source, destination, crop facultatif)
JOBS = [
    ("daraz3.jpg", "p-pro5.png", None),
    ("romis.png", "romis-speaker.png", None),
    ("zqs1430-conv.png", "zqs-1430.png", None),
    ("p47-blanc-noir.jpg", "casque-p47.png", (480, 230, 990, 1000)),
    ("p47m-rgb.webp", "casque-p47m.png", (615, 240, 1000, 940)),
    ("smartec-prime.jpg", "smartec-prime.png", None),
    ("itel-it2165.png", "itel-it2165.png", None),
    ("lp-m06.jpg", "lp-starlight-m06.png", None),
    ("sunelan-s30b.jpg", "sunelan-s30.png", None),
    ("honor-x5c.png", "honor-x5c.png", None),
    ("redmi-15c-1.jpg", "redmi-15c.png", (368, 0, 645, 675)),
    ("redmi-a7-pro.jpg", "redmi-a7-pro.png", (368, 0, 655, 672)),
    ("infinix-smart20.jpg", "infinix-smart-20.png", (0, 0, 214, 647)),
    ("oppo-a6c.jpg", "oppo-a6c.png", (305, 0, 462, 500)),
    ("samsung-charger-2-conv.png", "samsung-25w.png", None),
    ("usb-c-cc.jpg", "cable-usb-c.png", None),
    ("samsung-45w.jpg", "samsung-45w.png", None),
    ("lightning-1.jpg", "cable-lightning.png", None),
    ("lightning-2.jpg", "cable-lightning-rommos.png", None),
    ("apple-20w.jpg", "apple-20w.png", None),
]

# certains fichiers sources vivent dans public/images/products
LOCAL = {
    "redmi-15c-1.jpg",
    "redmi-a7-pro.jpg",
    "oppo-a6c.jpg",
}


def trim(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def finish(im: Image.Image, dst: str):
    im = trim(im)
    pad_x = max(2, int(im.width * 0.05))
    pad_y = max(2, int(im.height * 0.05))
    canvas = Image.new("RGBA", (im.width + 2 * pad_x, im.height + 2 * pad_y), (0, 0, 0, 0))
    canvas.paste(im, (pad_x, pad_y), im)

    if max(canvas.size) > 1000:
        r = 1000 / max(canvas.size)
        canvas = canvas.resize((round(canvas.width * r), round(canvas.height * r)), Image.LANCZOS)

    canvas.save(dst, "PNG", optimize=True)

    # apercu sur fond clair du site
    bg = Image.new("RGBA", canvas.size, (247, 247, 245, 255))
    bg.alpha_composite(canvas)
    bg.convert("RGB").save(os.path.join(PREV, os.path.basename(dst).replace(".png", ".jpg")), quality=88)
    return canvas.size


def main():
    session = new_session("u2net")
    for src_name, dst_name, crop in JOBS:
        src = os.path.join(PUB if src_name in LOCAL else SRC, src_name)
        if not os.path.exists(src):
            print(f"MISSING {src}")
            continue
        im = Image.open(src).convert("RGBA")
        if crop:
            im = im.crop(crop)
        # Les PNG deja transparents n'ont pas besoin de l'IA.
        alpha_min = im.getchannel("A").getextrema()[0]
        if alpha_min == 0:
            out = im
        else:
            out = remove(im, session=session, post_process_mask=True)
        size = finish(out, os.path.join(OUT, dst_name))
        print(f"OK {dst_name:32} {size[0]}x{size[1]}")


if __name__ == "__main__":
    sys.exit(main())
