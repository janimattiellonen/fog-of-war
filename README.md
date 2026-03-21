# Fog of War

A tile-based 2D game where the player explores a playing field with limited visibility. Only a small area around the player is visible — the rest is covered in darkness.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- nvm (recommended)

## Setup

```bash
nvm use
npm install
```

## Development

```bash
npm run dev
```

Opens at http://localhost:5122

## Other commands

```bash
npm run build       # Production build
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
npm run preview     # Preview production build
```

## Controls

Move the player using:
- Arrow keys
- WASD
- Numpad 8, 6, 2, 4

## Maps

Maps are plain text `.map` files stored in `public/maps/`. A map file only needs a `GRID` section — tile classes and definitions are loaded from the shared config at `public/maps/tiles.conf`.

### Map format

```
# Comments start with #

GRID
W00 W00 W00 W00 W00
W00 F00 F01 F00 W00
W00 F02 F00 F01 W00
W00 F00 F00 F02 W00
W00 W00 W00 W00 W00
```

Each cell is a 3-character tile code (class letter + 2-digit variant) separated by spaces. The codes must be defined in `tiles.conf`.

### Tile configuration

`public/maps/tiles.conf` defines all available tile classes and their image mappings. This file is shared across all maps.

```
CLASSES
F:floor:false
W:wall:true

TILES
F00:floor:floor/dirt0.png
W00:wall:wall/brick_dark0.png
```

- **CLASSES**: `letter:name:solid` — the letter is used as the first character of tile codes, `solid` controls whether the player can walk through the tile
- **TILES**: `code:class_name:image_path` — maps each tile code to a class and an image file under `public/assets/tiles/`

To add a new tile type (e.g. grass), add a class in CLASSES, define tiles in TILES, and place the images in `public/assets/tiles/`.

### Tile images

Tile images are 32x32 PNG files stored in `public/assets/tiles/`, organized by class:

```
public/assets/tiles/
  floor/
    dirt0.png
    dirt1.png
    ...
  wall/
    brick_dark0.png
    brick_dark1.png
    ...
```

### Changing the active map

Edit `src/GameCanvas.tsx` and change the map path in the `loadGameState()` call.

## Creating maps from PNG images

You can draw a map as a PNG image and convert it to a `.map` file using the included script.

### How it works

Each 10x10 pixel area in the PNG corresponds to one tile. So a 500x500 pixel image produces a 50x50 tile map.

The script samples the center pixel of each 10x10 block and maps its color to a tile code:

| Color     | Tile code |
|-----------|-----------|
| `#302721` | W00 (wall) |
| `#8B6916` | F00 (floor) |

### Generating a map

```bash
npm run png-to-map -- path/to/your-image.png
```

The generated `.map` file is saved in the same directory as the input PNG, named `MAP-DD-MM-YYYY-HH-MM-SS.map`. Move it to `public/maps/` to use it in the game.

### Tips for creating PNG maps

- Use an image editor (e.g. Photoshop, GIMP, Aseprite) with a canvas size that is a multiple of 10 in both dimensions
- Fill areas with the exact hex colors listed above — anti-aliasing or color blending will cause the script to fail on unrecognized colors
- The script can be extended with new color mappings by editing `scripts/png-to-map.ts`
- After generating, you can manually edit the `.map` file to add tile variation (e.g. replace some F00 with F01, F02)
