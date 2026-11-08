"""Nettoie et exporte les visuels des batteries.

Choisit la meilleure candidate telechargee par fetch-battery-images.cjs,
retire le fond blanc connecte aux bords, recadre et exporte en WebP.
"""
from __future__ import annotations

import os
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

BASE = os.path.join(os.getcwd(), ".cache", "battery-imgs")
OUT = os.path.join(os.getcwd(), "public", "images", "products", "batteries")
with open(os.path.join(os.getcwd(), ".cache", "batteries.json"), encoding="utf-8") as fh:
    BATTERIES = json.load(fh)
SENTINEL = (255, 0, 255)

# Candidate retenue apres revue visuelle (1 = premiere image telechargee).
PICKS = {
    "bm4j": 1,
    "bm5a": 4,
    "bm5r-bm5s": 3,
    "bm5t-bm5u": 3,
    "bm5x-bm5y": 4,
    "bn46": 1,
    "bn50": 1,
    "bn53": 2,
    "bn54": 1,
    "bn59": 1,
    "bn5a": 2,
    "bn5e": 2,
    "bp4k": 1,
    "eb-ba217aby": 2,
    "eb-ba505abu": 2,
    "eb-ba515aby": 2,
    "eb-ba526aby": 2,
    "eb-ba536aby": 3,
    "eb-ba546aby": 2,
    "eb-bm515aby": 4,
    "galaxy-s10": 3,
    "galaxy-s10-plus": 1,
    "galaxy-s20": 4,
    "galaxy-s20-fe": 1,
    "galaxy-s20-plus": 3,
    "galaxy-s21": 2,
    "galaxy-s21-plus": 1,
    "galaxy-s21-ultra": 2,
    "galaxy-s22": 3,
    "galaxy-s22-ultra": 4,
    "galaxy-s23": 2,
    "galaxy-s23-ultra": 4,
    "galaxy-s24": 3,
    "galaxy-s24-ultra": 3,
    "galaxy-s25": 4,
    "galaxy-s25-ultra": 3,
    "iphone-11": 2,
    "iphone-11-pro": 1,
    "iphone-11-pro-max": 3,
    "iphone-12-12-pro": 4,
    "iphone-12-mini": 1,
    "iphone-12-pro-max": 2,
    "iphone-13": 2,
    "iphone-13-mini": 3,
    "iphone-13-pro": 1,
    "iphone-13-pro-max": 3,
    "iphone-14-14-plus": 4,
    "iphone-14-pro-pro-max": 3,
    "iphone-15-15-plus": 2,
    "iphone-15-pro-pro-max": 2,
    "iphone-16-16-plus": 1,
    "iphone-16-pro-pro-max": 2,
    "iphone-se-2-3": 3,
}


def remove_background(im: Image.Image, tolerance: int = 52) -> Image.Image:
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

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def resize(im: Image.Image, max_size: int = 900) -> Image.Image:
    largest = max(im.size)
    ratio = max_size / largest
    if ratio < 1:
        im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.LANCZOS)
    elif ratio > 1.2:
        im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=45, threshold=3))
    return im


def keep_largest_object(im: Image.Image) -> Image.Image:
    """Ne conserve que le plus grand objet (la batterie), pas les outils/textes."""
    alpha = np.asarray(im.getchannel("A"))
    mask = alpha > 24
    labels, count = ndimage.label(mask)
    if count <= 1:
        return im
    sizes = ndimage.sum(mask, labels, range(1, count + 1))
    largest = labels == (int(np.argmax(sizes)) + 1)
    ys, xs = np.where(largest)
    if len(xs) == 0:
        return im
    return im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for b in BATTERIES:
        key = b["key"]
        folder = os.path.join(BASE, key)
        if not os.path.isdir(folder):
            print(f"MISSING {key}")
            continue
        files = sorted(os.listdir(folder))
        pick = PICKS.get(key, 1)
        source = os.path.join(folder, files[min(pick, len(files)) - 1])
        im = Image.open(source).convert("RGBA")
        tol = 90 if b.get("family") in ("apple", "xiaomi") else 42
        im = remove_background(im, tol)
        im = keep_largest_object(im)
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)
        im = resize(im)
        pad = max(8, int(max(im.size) * 0.06))
        canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad), im)
        dest = os.path.join(OUT, f"{b['slug']}.webp")
        canvas.save(dest, "WEBP", quality=92, method=6)
        print(f"OK {key:26} {canvas.width}x{canvas.height}")


if __name__ == "__main__":
    main()
