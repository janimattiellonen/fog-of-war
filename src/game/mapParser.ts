import { TILE_SIZE } from './tiles';

export interface TileClass {
  name: string;
  solid: boolean;
}

export interface TileDef {
  code: string;
  className: string;
  image: string;
}

export interface TileConfig {
  classes: Record<string, TileClass>;
  tiles: Record<string, TileDef>;
}

export interface ParsedMap extends TileConfig {
  grid: string[][];
  widthInTiles: number;
  heightInTiles: number;
  widthInPixels: number;
  heightInPixels: number;
}

export function parseTileConfig(text: string): TileConfig {
  const classes: Record<string, TileClass> = {};
  const tiles: Record<string, TileDef> = {};
  parseSections(text, classes, tiles, null);
  return { classes, tiles };
}

export function parseMap(mapText: string, config?: TileConfig): ParsedMap {
  const classes: Record<string, TileClass> = config ? { ...config.classes } : {};
  const tiles: Record<string, TileDef> = config ? { ...config.tiles } : {};
  const grid: string[][] = [];

  parseSections(mapText, classes, tiles, grid);

  if (grid.length === 0) {
    throw new Error('Map has no grid data');
  }

  const widthInTiles = grid[0].length;
  const heightInTiles = grid.length;

  for (let row = 0; row < heightInTiles; row++) {
    if (grid[row].length !== widthInTiles) {
      throw new Error(`Grid row ${row} has ${grid[row].length} columns, expected ${widthInTiles}`);
    }
    for (let col = 0; col < widthInTiles; col++) {
      const code = grid[row][col];
      if (!tiles[code]) {
        throw new Error(`Grid references unknown tile "${code}" at row ${row}, col ${col}`);
      }
    }
  }

  return {
    classes,
    tiles,
    grid,
    widthInTiles,
    heightInTiles,
    widthInPixels: widthInTiles * TILE_SIZE,
    heightInPixels: heightInTiles * TILE_SIZE,
  };
}

function parseSections(
  text: string,
  classes: Record<string, TileClass>,
  tiles: Record<string, TileDef>,
  grid: string[][] | null,
) {
  const lines = text.split('\n');
  let section: 'none' | 'classes' | 'tiles' | 'grid' = 'none';

  for (const raw of lines) {
    const line = raw.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    if (line === 'CLASSES') {
      section = 'classes';
      continue;
    }
    if (line === 'TILES') {
      section = 'tiles';
      continue;
    }
    if (line === 'GRID') {
      section = 'grid';
      continue;
    }

    if (section === 'classes') {
      const parts = line.split(':');
      if (parts.length !== 3) {
        throw new Error(`Invalid class definition: ${line}`);
      }
      const [letter, name, solidStr] = parts;
      classes[letter] = { name, solid: solidStr === 'true' };
    }

    if (section === 'tiles') {
      const parts = line.split(':');
      if (parts.length !== 3) {
        throw new Error(`Invalid tile definition: ${line}`);
      }
      const [code, className, image] = parts;
      const classLetter = code[0];
      if (!classes[classLetter]) {
        throw new Error(`Tile "${code}" references unknown class letter "${classLetter}"`);
      }
      if (classes[classLetter].name !== className) {
        throw new Error(`Tile "${code}" class name "${className}" doesn't match class letter "${classLetter}" (expected "${classes[classLetter].name}")`);
      }
      tiles[code] = { code, className, image };
    }

    if (section === 'grid' && grid !== null) {
      const row = line.split(/\s+/);
      grid.push(row);
    }
  }
}
