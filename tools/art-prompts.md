# Career Town art prompts (Gemini image generation)

The site shows one illustration per stop, in a day and a night version.
Generate them in Gemini, then run the processing step at the bottom.

## Workflow

1. Open Gemini in your usual browser and pick image generation (use the Pro image model if it is offered).
2. Generate **01 home** first with the prompt below. Regenerate until the style is right. This image is the style reference.
3. For 02–07, **attach the 01 home image** and paste the prompt. Every prompt already asks Gemini to match the attached style.
4. For each finished day image, in the same chat, **attach the 01 home night image** (the color reference)
   and send the **night edit** prompt. Without the reference, every night edit picks its own darkness.
5. Download the full-size files into one folder and tell Claude the folder path.
   Renaming is optional: Claude opens the images, tells which scene each one is, and renames them to
   `<name>-day.png` and `<name>-night.png` (`home`, `tech`, `lab`, `gate`, `plaza`, `launch`, `post`).

Check the first image for a visible watermark (usually bottom-right). Tell Claude if there is one.
Do not attach images from other websites as references.

## Shared style (already included in each prompt)

> Isometric illustration, true isometric angle (30°), the scene stands on one small square lot of cream paving with a thin raised edge; the lot's corners point up, down, left and right. Clean flat vector style: uniform thin dark outlines (#2F2C36) on every shape, flat pastel fills (mint #CBEBDC, cream #FBF3E2, coral #F7887A, soft yellow #FFE5A0, sky blue #CBE5F7, lavender #DCD6F6, leaf green #93D385), no gradients, no drop shadows, no texture. People are small, cute and simple, with round heads. Pure white background (#FFFFFF) with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.

## Prompts

### 01 home (About)

```
Isometric illustration of a cozy two-story house with a coral gable roof and cream walls, a small mint garage beside it, a flower bed, a red mailbox on a post, stepping stones to the door, two round trees and one pine tree, and a person watering the flowers.
Isometric illustration, true isometric angle (30°), the scene stands on one small square lot of cream paving with a thin raised edge; the lot's corners point up, down, left and right. Clean flat vector style: uniform thin dark outlines (#2F2C36) on every shape, flat pastel fills (mint #CBEBDC, cream #FBF3E2, coral #F7887A, soft yellow #FFE5A0, sky blue #CBE5F7, lavender #DCD6F6, leaf green #93D385), no gradients, no drop shadows, no texture. People are small, cute and simple, with round heads. Pure white background (#FFFFFF) with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 02 tech (Tech stack: workshop)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of a workshop with a sawtooth roof and glass skylights, a large open roll-up door showing tool shelves and boxes inside, a stack of three shipping containers (orange, sky blue, mint) beside it, a ship's-wheel sign on a tall pole, a worker carrying a toolbox, and a few trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 03 lab (Project: AI agent platform)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of a tall sky-blue glass office tower with horizontal window bands, a rooftop antenna with a small red light and a satellite dish, a small lavender server annex with rows of tiny green status lights, and a friendly small white robot standing next to a person holding a laptop, plus a bench and trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 04 gate (Project: API gateway)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of a toll-gate style canopy with a coral flat roof over a short two-lane road crossing the lot, a small booth with a striped barrier arm, two small cars passing through, and behind it a sage-green control building with a large dark monitoring screen on its wall showing simple green line charts, plus trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 05 plaza (Activities: community)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of an outdoor community stage on a wooden platform with a lavender backdrop wall, colorful bunting flags strung across the top, a speaker on stage holding a microphone and waving, an audience of small people seen from behind on the grass in front, two light poles, a bunch of balloons, a bench and trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 06 launch (Certifications: launch pad)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of a white rocket with coral fins and a round window standing on a gray launch pad, a red lattice service tower beside it with an arm reaching the rocket, a few puffy white smoke clouds at the base, a small gray control building with a satellite dish, an astronaut in a white helmet waving, and trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### 07 post (Closing: post office)

```
Match the exact art style, line weight, palette, lot shape and camera angle of the attached image.
Isometric illustration of a small peach-colored post office with a flat roof and a coral-and-white striped awning over the door, a red round-top mailbox in front, a small cream mail van, a person posting a letter, three white envelopes floating in the air above, a bench and trees.
Pure white background with nothing outside the lot. No text, letters, numbers or logos anywhere. Square image, the lot centered with a wide white margin.
```

### Night edit (send after each day image, in the same chat, with the 01 home night image attached)

```
Edit the image you just made into the same scene at night. Keep the composition, outlines and every object exactly the same; do not add or remove any windows, lights or objects. The attached image is a night scene from the same set: match its night colors and brightness exactly (ground, lot, walls, roofs, trees, window light), but do not copy its content. Keep the pure white background (#FFFFFF) exactly as it is. No text.
```

### 08 walker (the character that walks along the road)

Attach the 01 home day image. Aspect ratio 1:1, 2K. No night version: the site dims it at night.
Save it as `walker.png`.

```
Match the exact art style, line weight and colors of the attached image. Draw a walk-cycle sprite sheet of the small person from the attached image (round head, brown hair, lavender long-sleeve shirt, dark pants, dark shoes): 4 frames in a 2x2 grid, read left to right, then top to bottom. Three-quarter view facing the front-right, the same angle as the person in the attached image, walking toward the front-right.
Frame 1: right leg forward, heel on the ground, left arm forward.
Frame 2: legs passing under the body, body slightly higher, arms by the sides.
Frame 3: left leg forward, heel on the ground, right arm forward.
Frame 4: legs passing under the body, body slightly higher, arms by the sides.
The same character at the same size and proportions in every frame. Each frame centered in its cell, the feet on the same baseline, the whole body inside the cell with a wide white margin. Pure white background (#FFFFFF). No ground, no shadow, no text, no numbers, no grid lines.
```

## Processing (Claude runs this)

`python3 tools/cutout.py <folder>` removes the white background, trims, and writes
`assets/town/<name>-day.webp` and `assets/town/<name>-night.webp`.
