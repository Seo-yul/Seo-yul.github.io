#!/usr/bin/env python3
"""Turn a generated walk-cycle sheet into the walker sprite.

Usage: python3 tools/sprite.py <sheet.png> [frames]

The sheet is a 2x2 grid of frames, read left to right, then top to bottom. `frames` picks which ones
to use and in what order, e.g. "1,2" (default "1,2,3,4"). The script
  - removes the background (the same way tools/cutout.py does),
  - lines the frames up on the head center and the lowest foot, so the character does not jitter
    when the frames swap even if the generator drew it at slightly different spots in each cell,
  - writes assets/town/walker.webp (the frames side by side, 2x the display height)
    and the frame size into assets/town/manifest.json under "walker".
Then run: node tools/art.mjs
"""
import json
import os
import runpy
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
cutout = runpy.run_path(os.path.join(HERE, 'cutout.py'))
OUT = cutout['OUT']
HEIGHT = 200          # frame height in the output, px (the walker shows at up to ~96px)
HEAD = 0.32           # top share of the character treated as the head when finding its center


def head_center_x(alpha):
    """Horizontal center of the head: the middle of the opaque pixels in the top rows of the character"""
    box = alpha.getbbox()
    top = alpha.crop((box[0], box[1], box[2], box[1] + int((box[3] - box[1]) * HEAD)))
    hb = top.getbbox()
    return box[0] + (hb[0] + hb[2]) / 2


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    sheet = cutout['cut'](Image.open(sys.argv[1]).convert('RGB'))
    order = [int(v) for v in (sys.argv[2] if len(sys.argv) == 3 else '1,2,3,4').split(',')]
    w, h = sheet.size
    cells = [sheet.crop((x, y, x + w // 2, y + h // 2)) for y in (0, h // 2) for x in (0, w // 2)]

    frames = []
    for i in order:
        cell = cells[i - 1]
        alpha = cell.getchannel('A')
        box = alpha.getbbox()
        frames.append((cell, head_center_x(alpha), box))
    # one canvas size for every frame: widest reach either side of the head center, tallest figure
    left = max(cx - b[0] for _, cx, b in frames)
    right = max(b[2] - cx for _, cx, b in frames)
    tall = max(b[3] - b[1] for _, _, b in frames)
    fw, fh = int(left + right) + 4, int(tall) + 4
    scale = HEIGHT / fh
    ow, oh = round(fw * scale), HEIGHT
    strip = Image.new('RGBA', (ow * len(frames), oh), (0, 0, 0, 0))
    for k, (cell, cx, b) in enumerate(frames):
        canvas = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
        # head center on the canvas center line, lowest foot on the bottom edge
        canvas.paste(cell, (int(round(left - cx + 2)), int(fh - 2 - b[3])), cell)
        strip.paste(canvas.resize((ow, oh), Image.LANCZOS), (k * ow, 0))
    os.makedirs(OUT, exist_ok=True)
    strip.save(os.path.join(OUT, 'walker.webp'), 'WEBP', quality=90, method=6)
    path = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(path)) if os.path.exists(path) else {}
    manifest['walker'] = {'w': ow, 'h': oh, 'frames': len(frames)}
    json.dump(manifest, open(path, 'w'), indent=2, sort_keys=True)
    print(f'walker: {len(frames)} frames of {ow}x{oh}')


if __name__ == '__main__':
    main()
