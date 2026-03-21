import type { ParsedMap } from './mapParser';

export const TILE_SIZE = 32;

export interface TileMap {
  width: number;
  height: number;
  grid: string[][];
  map: ParsedMap;
}

export function createTileMapFromParsed(parsed: ParsedMap): TileMap {
  return {
    width: parsed.widthInTiles,
    height: parsed.heightInTiles,
    grid: parsed.grid,
    map: parsed,
  };
}

export function getTileCode(tileMap: TileMap, col: number, row: number): string | null {
  if (col < 0 || row < 0 || col >= tileMap.width || row >= tileMap.height) {
    return null;
  }
  return tileMap.grid[row][col];
}

export function isSolid(tileMap: TileMap, col: number, row: number): boolean {
  const code = getTileCode(tileMap, col, row);
  if (code === null) {
    return true;
  }
  const tileDef = tileMap.map.tiles[code];
  if (!tileDef) {
    return true;
  }
  const classLetter = code[0];
  const tileClass = tileMap.map.classes[classLetter];
  return tileClass?.solid ?? true;
}

const imageCache = new Map<string, HTMLImageElement>();
const loadingImages = new Set<string>();

export function getTileImage(tileMap: TileMap, code: string): HTMLImageElement | null {
  const tileDef = tileMap.map.tiles[code];
  if (!tileDef) {
    return null;
  }

  const src = `/assets/tiles/${tileDef.image}`;
  const cached = imageCache.get(src);
  if (cached) {
    return cached;
  }

  if (!loadingImages.has(src)) {
    loadingImages.add(src);
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      loadingImages.delete(src);
    };
    img.src = src;
  }

  return null;
}
