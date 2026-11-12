#!/usr/bin/env python3
"""Turn generated illustrations into cut-outs for the site.

Usage: python3 tools/cutout.py <folder>

The folder holds <name>-day.<png|jpg|webp> and optionally <name>-night.<ext>
(names: home, tech, lab, gate, plaza, launch, post). For each name this
  - removes the flat background connected to the image border (white, or whatever color the corners are),
  - turns the anti-aliased edge between the background and the outlines into transparency,
  - clears a small isolated mark in the bottom-right corner (a generator watermark), if there is one,
  - shifts the lot color to match the home scene's lot (the generator picks a different darkness each time,
    most of all at night); only colors near the lot color move, so lights, trees and outlines stay,
  - crops day and night to the same box and the same size,
  - writes assets/town/<name>-day.webp and <name>-night.webp, and assets/town/manifest.json.
Needs only Pillow.
"""
import json
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'town')
NAMES = ['home', 'tech', 'lab', 'gate', 'plaza', 'launch', 'post']
EXTS = ['.png', '.jpg', '.jpeg', '.webp']
TOL = 22            # max per-channel distance from the background color
MAX_W = 1100        # output width cap (displayed at about 480px, so ~2x)
PAD = 6
CORNER = 0.12       # size of the bottom-right box checked for a watermark
REF = 'home'        # every scene's lot color is matched to this scene's lot
REACH = 70          # colors within this RGB distance of the lot color are shifted (fully at 0, none at REACH)


def find(folder, name, kind):
    for ext in EXTS:
        p = os.path.join(folder, f'{name}-{kind}{ext}')
        if os.path.exists(p):
            return p
    return None


def bg_color(img):
    w, h = img.size
    px = [img.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w // 2, 2), (2, h // 2)]]
    return tuple(sorted(c[i] for c in px)[len(px) // 2] for i in range(3))


def near_mask(img, bg):
    """255 where the pixel is within TOL of the background color on every channel"""
    bands = []
    for i, band in enumerate(img.split()[:3]):
        c = bg[i]
        bands.append(band.point(lambda v, c=c: 255 if abs(v - c) <= TOL else 0))
    return ImageChops.darker(ImageChops.darker(bands[0], bands[1]), bands[2])


def background(img):
    """Mask (255) of the background region connected to the border"""
    bg = bg_color(img)
    near = near_mask(img, bg)
    w, h = near.size
    framed = Image.new('L', (w + 2, h + 2), 255)
    framed.paste(near, (1, 1))
    ImageDraw.floodfill(framed, (0, 0), 128, thresh=0)
    region = framed.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 128 else 0)
    return region, bg


def cut(img):
    img = img.convert('RGB')
    region, bg = background(img)
    rgba = img.convert('RGBA')
    alpha = ImageChops.invert(region)
    # Edge pixels are a blend of the outline and the background: un-blend them
    edge = ImageChops.subtract(region.filter(ImageFilter.MaxFilter(5)), region)
    a_px, e_px, c_px = alpha.load(), edge.load(), rgba.load()
    w, h = img.size
    bl = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]
    for y in range(h):
        for x in range(w):
            if not e_px[x, y]:
                continue
            r, g, b, _ = c_px[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            a = max(0.0, min(1.0, abs(bl - lum) / max(1.0, abs(bl - 45))))
            if a < 0.04:
                a_px[x, y] = 0
                continue
            a_px[x, y] = int(a * 255)
            c_px[x, y] = tuple(max(0, min(255, int((v - (1 - a) * bg[i]) / a))) for i, v in enumerate((r, g, b))) + (255,)
    rgba.putalpha(alpha)
    clear_corner_mark(rgba)
    return rgba


def clear_corner_mark(rgba):
    """Clear the bottom-right box if what is in it does not touch the rest of the picture"""
    w, h = rgba.size
    x0, y0 = int(w * (1 - CORNER)), int(h * (1 - CORNER))
    a = rgba.getchannel('A')
    if not a.crop((x0, y0, w, h)).getbbox():
        return
    band = 6
    top = a.crop((x0 - band, y0 - band, w, y0)).getbbox()
    left = a.crop((x0 - band, y0 - band, x0, h)).getbbox()
    if top or left:
        return
    ImageDraw.Draw(rgba).rectangle((x0, y0, w, h), fill=(0, 0, 0, 0))


def lot_color(img, ref=None):
    """Color of the lot top just behind its front edge, found by walking up a column from the bottom:
    background, slab bottom line, slab side, lot edge line, then the lot top.
    Several columns either side of the front corner are tried. Some scenes put grass or a road there,
    so among the even patches the one closest to the reference lot color wins (without a reference,
    the most even one)."""
    w, h = img.size
    found = []
    for fx in (0.44, 0.56, 0.38, 0.62, 0.32, 0.68):
        x, y = int(w * fx), h - 1
        dark = lambda yy: sum(img.getpixel((x, yy))) < 200   # outlines; night lots can be darker than 300
        for want_dark in (True, False, True, False):
            while y > 0 and dark(y) != want_dark:
                y -= 1
        st = ImageStat.Stat(img.crop((x - 30, y - 80, x + 30, y - 40)))
        found.append((tuple(st.median), max(st.stddev)))
    even = [f for f in found if f[1] < 12]
    if not even:
        return min(found, key=lambda f: f[1])
    if ref is None:
        return min(even, key=lambda f: f[1])
    return min(even, key=lambda f: sum((f[0][i] - ref[i]) ** 2 for i in range(3)))


def match_lot(img, src, ref):
    """Move colors near src toward ref, fading out with distance from src"""
    delta = [ref[i] - src[i] for i in range(3)]

    def shift(r, g, b):
        c = (r * 255, g * 255, b * 255)
        d = sum((c[i] - src[i]) ** 2 for i in range(3)) ** 0.5
        k = max(0.0, 1 - d / REACH)
        k = k * k * (3 - 2 * k)
        return tuple(min(1.0, max(0.0, (c[i] + delta[i] * k) / 255)) for i in range(3))

    return img.filter(ImageFilter.Color3DLUT.generate(33, shift))


def union(b1, b2):
    if not b2:
        return b1
    return (min(b1[0], b2[0]), min(b1[1], b2[1]), max(b1[2], b2[2]), max(b1[3], b2[3]))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    manifest_path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    refs = {}
    for kind in ('day', 'night'):
        p = find(folder, REF, kind)
        if p:
            refs[kind] = lot_color(Image.open(p).convert('RGB'))[0]

    def load(path, kind):
        img = Image.open(path).convert('RGB')
        if kind in refs:
            src, spread = lot_color(img, refs[kind])
            if spread < 12:          # a clean patch of lot; otherwise leave the colors alone
                img = match_lot(img, src, refs[kind])
            else:
                print(f'  {os.path.basename(path)}: lot sample not clean, colors left as they are')
        return cut(img)

    for name in NAMES:
        day_p, night_p = find(folder, name, 'day'), find(folder, name, 'night')
        if not day_p:
            continue
        day = load(day_p, 'day')
        night = load(night_p, 'night') if night_p else None
        if night and night.size != day.size:
            night = night.resize(day.size, Image.LANCZOS)
        box = union(day.getchannel('A').getbbox(), night and night.getchannel('A').getbbox())
        box = (max(0, box[0] - PAD), max(0, box[1] - PAD), min(day.width, box[2] + PAD), min(day.height, box[3] + PAD))
        out = {}
        for kind, im in (('day', day), ('night', night)):
            if not im:
                continue
            im = im.crop(box)
            if im.width > MAX_W:
                im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
            im.save(os.path.join(OUT, f'{name}-{kind}.webp'), 'WEBP', quality=84, method=6)
            out = {'w': im.width, 'h': im.height}
        manifest[name] = dict(out, night=bool(night))
        print(f'{name}: {out["w"]}x{out["h"]}' + (' + night' if night else ' (day only)'))
    json.dump(manifest, open(manifest_path, 'w'), indent=2, sort_keys=True)
    print('wrote', manifest_path)


if __name__ == '__main__':
    main()
