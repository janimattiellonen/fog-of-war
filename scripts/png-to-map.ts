import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { PNG } from 'pngjs';

const TILE_PX = 10;

const COLOR_MAP: Record<string, string> = {
  '302721': 'WL00',
  '8b6916': 'FL00',
};

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('').toLowerCase();
}

function run() {
  const pngPath = process.argv[2];
  if (!pngPath) {
    console.error('Usage: npx tsx scripts/png-to-map.ts <path-to-png>');
    process.exit(1);
  }

  const absPath = resolve(pngPath);
  const data = readFileSync(absPath);
  const png = PNG.sync.read(data);

  if (png.width % TILE_PX !== 0 || png.height % TILE_PX !== 0) {
    console.error(`Image dimensions (${png.width}x${png.height}) must be divisible by ${TILE_PX}`);
    process.exit(1);
  }

  const cols = png.width / TILE_PX;
  const rows = png.height / TILE_PX;
  const grid: string[][] = [];

  for (let row = 0; row < rows; row++) {
    const gridRow: string[] = [];
    for (let col = 0; col < cols; col++) {
      // Sample the center pixel of each tile
      const px = col * TILE_PX + Math.floor(TILE_PX / 2);
      const py = row * TILE_PX + Math.floor(TILE_PX / 2);
      const idx = (py * png.width + px) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const hex = rgbToHex(r, g, b);

      const code = COLOR_MAP[hex];
      if (!code) {
        console.error(`Unknown color #${hex} at pixel (${px}, ${py}), tile (${col}, ${row})`);
        process.exit(1);
      }
      gridRow.push(code);
    }
    grid.push(gridRow);
  }

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = [
    pad(now.getDate()),
    pad(now.getMonth() + 1),
    now.getFullYear(),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('-');

  const lines = [`# Generated from ${pngPath}`, '', 'GRID'];
  for (const row of grid) {
    lines.push(row.join(' '));
  }

  const outPath = resolve(dirname(absPath), `MAP-${timestamp}.map`);
  writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`Generated ${cols}x${rows} map: ${outPath}`);
}

run();
