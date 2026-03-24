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

export type TileProperties = Record<string, number>;

export interface TileConfig {
  classes: Record<string, TileClass>;
  tiles: Record<string, TileDef>;
  classProperties: Record<string, TileProperties>;
  tileProperties: Record<string, TileProperties>;
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
  const classProperties: Record<string, TileProperties> = {};
  const tileProperties: Record<string, TileProperties> = {};
  parseSections(text, classes, tiles, null, classProperties, tileProperties);
  return { classes, tiles, classProperties, tileProperties };
}

export function parseMap(mapText: string, config?: TileConfig): ParsedMap {
  const classes: Record<string, TileClass> = config ? { ...config.classes } : {};
  const tiles: Record<string, TileDef> = config ? { ...config.tiles } : {};
  const classProperties: Record<string, TileProperties> = config ? { ...config.classProperties } : {};
  const tileProperties: Record<string, TileProperties> = config ? { ...config.tileProperties } : {};
  const grid: string[][] = [];

  parseSections(mapText, classes, tiles, grid, classProperties, tileProperties);

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
    classProperties,
    tileProperties,
    grid,
    widthInTiles,
    heightInTiles,
    widthInPixels: widthInTiles * TILE_SIZE,
    heightInPixels: heightInTiles * TILE_SIZE,
  };
}

export function getClassPrefix(code: string): string {
  const match = code.match(/^[A-Za-z]+/);
  return match ? match[0] : '';
}

function parseSections(
  text: string,
  classes: Record<string, TileClass>,
  tiles: Record<string, TileDef>,
  grid: string[][] | null,
  classProperties: Record<string, TileProperties>,
  tileProperties: Record<string, TileProperties>,
) {
  const lines = text.split('\n');
  let section: 'none' | 'classes' | 'tiles' | 'grid' | 'properties' = 'none';

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
    if (line === 'PROPERTIES') {
      section = 'properties';
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
      const classPrefix = getClassPrefix(code);
      if (!classes[classPrefix]) {
        throw new Error(`Tile "${code}" references unknown class "${classPrefix}"`);
      }
      if (classes[classPrefix].name !== className) {
        throw new Error(`Tile "${code}" class name "${className}" doesn't match class "${classPrefix}" (expected "${classes[classPrefix].name}")`);
      }
      tiles[code] = { code, className, image };
    }

    if (section === 'grid' && grid !== null) {
      const row = line.split(/\s+/);
      grid.push(row);
    }

    if (section === 'properties') {
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) {
        throw new Error(`Invalid property definition (missing '='): ${line}`);
      }
      const targetAndKey = line.substring(0, eqIndex);
      const value = parseFloat(line.substring(eqIndex + 1));
      if (isNaN(value)) {
        throw new Error(`Invalid property value (not a number): ${line}`);
      }
      const dotIndex = targetAndKey.indexOf('.');
      if (dotIndex === -1) {
        throw new Error(`Invalid property definition (missing '.'): ${line}`);
      }
      const target = targetAndKey.substring(0, dotIndex);
      const key = targetAndKey.substring(dotIndex + 1);

      if (classes[target]) {
        if (!classProperties[target]) classProperties[target] = {};
        classProperties[target][key] = value;
      } else if (tiles[target]) {
        if (!tileProperties[target]) tileProperties[target] = {};
        tileProperties[target][key] = value;
      } else {
        throw new Error(`Property target "${target}" is not a known class or tile`);
      }
    }
  }
}
