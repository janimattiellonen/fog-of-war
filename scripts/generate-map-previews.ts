import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { PNG } from 'pngjs';

const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');
const MAPS_DIR = resolve(PUBLIC_DIR, 'maps');
const TILES_DIR = resolve(PUBLIC_DIR, 'assets', 'tiles');
const TILE_SIZE = 32;

interface TileClass {
  name: string;
  solid: boolean;
}

interface TileDef {
  code: string;
  className: string;
  image: string;
}

function parseTileConfig(text: string) {
  const classes: Record<string, TileClass> = {};
  const tiles: Record<string, TileDef> = {};
  let section: 'none' | 'classes' | 'tiles' = 'none';

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line === 'CLASSES') { section = 'classes'; continue; }
    if (line === 'TILES') { section = 'tiles'; continue; }
    if (line === 'GRID') break;

    if (section === 'classes') {
      const [letter, name, solidStr] = line.split(':');
      classes[letter] = { name, solid: solidStr === 'true' };
    }
    if (section === 'tiles') {
      const [code, className, image] = line.split(':');
      tiles[code] = { code, className, image };
    }
  }
  return { classes, tiles };
}

function parseMapGrid(text: string): string[][] {
  const grid: string[][] = [];
  let inGrid = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line === 'GRID') { inGrid = true; continue; }
    if (['CLASSES', 'TILES'].includes(line)) { inGrid = false; continue; }
    if (inGrid) grid.push(line.split(/\s+/));
  }
  return grid;
}

function loadTileImage(imagePath: string): PNG | null {
  try {
    let data = readFileSync(resolve(TILES_DIR, imagePath));
    // Some PNGs have a duplicate IEND chunk; truncate after the first one
    const iendSig = Buffer.from([0x49, 0x45, 0x4e, 0x44]); // "IEND"
    const iendIdx = data.indexOf(iendSig);
    if (iendIdx !== -1) {
      const endOfChunk = iendIdx + 4 + 4; // 4 bytes type + 4 bytes CRC
      if (endOfChunk < data.length) {
        data = data.subarray(0, endOfChunk);
      }
    }
    return PNG.sync.read(data);
  } catch {
    return null;
  }
}

function run() {
  const configText = readFileSync(resolve(MAPS_DIR, 'tiles.conf'), 'utf-8');
  const config = parseTileConfig(configText);

  const tileImages = new Map<string, PNG>();
  for (const [code, tileDef] of Object.entries(config.tiles)) {
    const img = loadTileImage(tileDef.image);
    if (img) tileImages.set(code, img);
  }

  const mapFiles = readdirSync(MAPS_DIR).filter((f) => f.endsWith('.map'));

  for (const mapFile of mapFiles) {
    const mapText = readFileSync(resolve(MAPS_DIR, mapFile), 'utf-8');
    // Merge any map-local config with the shared config
    const mapConfig = parseTileConfig(mapText);
    const mergedTiles = { ...config.tiles, ...mapConfig.tiles };
    const mergedClasses = { ...config.classes, ...mapConfig.classes };

    // Load any map-specific tile images
    for (const [code, tileDef] of Object.entries(mapConfig.tiles)) {
      if (!tileImages.has(code)) {
        const img = loadTileImage(tileDef.image);
        if (img) tileImages.set(code, img);
      }
    }

    const grid = parseMapGrid(mapText);
    if (grid.length === 0) {
      console.warn(`Skipping ${mapFile}: no grid data`);
      continue;
    }

    const cols = grid[0].length;
    const rows = grid.length;
    const png = new PNG({ width: cols * TILE_SIZE, height: rows * TILE_SIZE });

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const code = grid[row][col];
        const tileImg = tileImages.get(code);
        const dx = col * TILE_SIZE;
        const dy = row * TILE_SIZE;

        if (tileImg) {
          // Blit tile image onto the output
          for (let ty = 0; ty < TILE_SIZE && ty < tileImg.height; ty++) {
            for (let tx = 0; tx < TILE_SIZE && tx < tileImg.width; tx++) {
              const srcIdx = (ty * tileImg.width + tx) * 4;
              const dstIdx = ((dy + ty) * png.width + (dx + tx)) * 4;
              png.data[dstIdx] = tileImg.data[srcIdx];
              png.data[dstIdx + 1] = tileImg.data[srcIdx + 1];
              png.data[dstIdx + 2] = tileImg.data[srcIdx + 2];
              png.data[dstIdx + 3] = tileImg.data[srcIdx + 3];
            }
          }
        } else {
          // Fallback color based on solid/floor
          const classLetter = code[0];
          const isSolid = mergedClasses[classLetter]?.solid ?? true;
          const r = isSolid ? 42 : 58;
          const g = isSolid ? 42 : 58;
          const b = isSolid ? 62 : 46;
          for (let ty = 0; ty < TILE_SIZE; ty++) {
            for (let tx = 0; tx < TILE_SIZE; tx++) {
              const idx = ((dy + ty) * png.width + (dx + tx)) * 4;
              png.data[idx] = r;
              png.data[idx + 1] = g;
              png.data[idx + 2] = b;
              png.data[idx + 3] = 255;
            }
          }
        }
      }
    }

    const outName = mapFile.replace(/\.map$/, '.preview.png');
    const outPath = resolve(MAPS_DIR, outName);
    writeFileSync(outPath, PNG.sync.write(png));
    console.log(`Generated ${outPath}`);
  }
}

run();
