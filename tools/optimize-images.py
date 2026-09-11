import os
import sys
from PIL import Image, ImageOps

SRC = "images"
DST = os.path.join("assets", "img")
GALLERY = (400, 800, 1400)
COVER = (300, 600)
CARD = (480, 900)


def widths_for(name):
    if name.startswith("book"):
        return COVER
    if name.startswith("header"):
        return CARD
    return GALLERY


def build(path, name):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im).convert("RGB")
    made = []
    for w in widths_for(name):
        if w > im.width:
            w = im.width
        if any(w == m for m, _ in made):
            continue
        h = round(im.height * w / im.width)
        rs = im.resize((w, h), Image.LANCZOS)
        base = os.path.join(DST, f"{name}-{w}")
        rs.save(base + ".webp", "WEBP", quality=82, method=6)
        rs.save(base + ".jpg", "JPEG", quality=82, optimize=True, progressive=True)
        made.append((w, h))
    return im.size, made


def main():
    os.makedirs(DST, exist_ok=True)
    total = 0
    for f in sorted(os.listdir(SRC)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        name = os.path.splitext(f)[0]
        size, made = build(os.path.join(SRC, f), name)
        total += len(made) * 2
        print(f"{name:12s} {size[0]}x{size[1]} -> {[m[0] for m in made]}")
    print(f"{total} files in {DST}")


if __name__ == "__main__":
    sys.exit(main())
