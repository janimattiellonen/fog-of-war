import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { PNG } from 'pngjs';
import type { Plugin } from 'vite';

const MAPS_DIR = 'public/maps';
const TILES_CONF = join(MAPS_DIR, 'tiles.conf');
const OUTPUT_FILE = join(MAPS_DIR, 'maps.json');

// Colors per tile class name (from tiles.conf class definitions)
const CLASS_COLORS: Record<string, [number, number, number]> = {
  floor: [139, 105, 22],
  wall: [48, 39, 33],
  water: [30, 80, 140],
  lava: [200, 60, 20],
};

const DEFAULT_COLOR: [number, number, number] = [80, 80, 80];

interface TileClassInfo {
  name: string;
}

function parseTileClasses(text: string): {
  classes: Record<string, TileClassInfo>;
  tileToClass: Record<string, string>;
} {
  const classes: Record<string, TileClassInfo> = {};
  const tileToClass: Record<string, string> = {};
  let section: 'none' | 'classes' | 'tiles' = 'none';

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    if (line === 'CLASSES') { section = 'classes'; continue; }
    if (line === 'TILES') { section = 'tiles'; continue; }
    if (line === 'GRID' || line === 'PROPERTIES') break;

    if (section === 'classes') {
      const parts = line.split(':');
      if (parts.length === 3) {
        classes[parts[0]] = { name: parts[1] };
      }
    }
    if (section === 'tiles') {
      const parts = line.split(':');
      if (parts.length === 3) {
        tileToClass[parts[0]] = parts[1];
      }
    }
  }
  return { classes, tileToClass };
}

function parseGrid(text: string): string[][] {
  const grid: string[][] = [];
  let inGrid = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === 'GRID') { inGrid = true; continue; }
    if (!inGrid || line === '' || line.startsWith('#')) continue;
    if (line === 'CLASSES' || line === 'TILES' || line === 'PROPERTIES') break;
    grid.push(line.split(/\s+/));
  }
  return grid;
}

function getTileColor(
  code: string,
  tileToClass: Record<string, string>,
): [number, number, number] {
  const className = tileToClass[code];
  if (!className) return DEFAULT_COLOR;

  // Check for specific tile name matches (e.g. "lava" in tile image path name)
  // The className from tiles.conf is generic (e.g. "floor"), but we can check
  // the tile code prefix for more specific coloring
  // For now, check if there's a direct class color, otherwise use className
  if (CLASS_COLORS[className]) return CLASS_COLORS[className];
  return DEFAULT_COLOR;
}

function generatePreview(
  mapPath: string,
  tileToClass: Record<string, string>,
  tileNames: Record<string, string>,
): Buffer | null {
  const text = readFileSync(mapPath, 'utf-8');
  const grid = parseGrid(text);
  if (grid.length === 0) return null;

  const height = grid.length;
  const width = grid[0].length;
  const png = new PNG({ width, height });

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const code = grid[row]?.[col] ?? '';
      const tileName = tileNames[code] ?? '';
      let color: [number, number, number];

      // Use tile image path for more specific coloring
      if (tileName.includes('lava')) {
        color = CLASS_COLORS['lava'];
      } else if (tileName.includes('water') || tileName.includes('sea')) {
        color = CLASS_COLORS['water'];
      } else {
        color = getTileColor(code, tileToClass);
      }

      const idx = (row * width + col) * 4;
      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

function parseTileImageNames(text: string): Record<string, string> {
  const names: Record<string, string> = {};
  let inTiles = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === 'TILES') { inTiles = true; continue; }
    if (line === 'CLASSES' || line === 'GRID' || line === 'PROPERTIES') { inTiles = false; continue; }
    if (!inTiles || line === '' || line.startsWith('#')) continue;
    const parts = line.split(':');
    if (parts.length === 3) {
      names[parts[0]] = parts[2]; // code -> image path
    }
  }
  return names;
}

function generateMapList(): string[] {
  const dir = resolve(MAPS_DIR);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.map'))
    .sort();
}

function syncAll() {
  const maps = generateMapList();
  writeFileSync(resolve(OUTPUT_FILE), JSON.stringify(maps) + '\n');

  const confPath = resolve(TILES_CONF);
  if (!existsSync(confPath)) return;

  const confText = readFileSync(confPath, 'utf-8');
  const { tileToClass } = parseTileClasses(confText);
  const tileNames = parseTileImageNames(confText);

  for (const mapFile of maps) {
    const mapPath = resolve(join(MAPS_DIR, mapFile));
    const previewPath = resolve(join(MAPS_DIR, mapFile.replace(/\.map$/, '.preview.png')));

    // Only regenerate if preview is missing or older than the map file
    if (existsSync(previewPath)) {
      const mapStat = statSync(mapPath);
      const previewStat = statSync(previewPath);
      if (previewStat.mtimeMs >= mapStat.mtimeMs) continue;
    }

    const buf = generatePreview(mapPath, tileToClass, tileNames);
    if (buf) {
      writeFileSync(previewPath, buf);
    }
  }
}

export default function mapListPlugin(): Plugin {
  return {
    name: 'map-list',

    buildStart() {
      syncAll();
    },

    configureServer(server) {
      const mapsDir = resolve(MAPS_DIR);

      const handleChange = (path: string) => {
        if (path.startsWith(mapsDir) && (path.endsWith('.map') || path.endsWith('tiles.conf'))) {
          syncAll();
        }
      };

      server.watcher.on('add', handleChange);
      server.watcher.on('change', handleChange);
      server.watcher.on('unlink', handleChange);
    },
  };
}
