import type { ParsedMap } from './mapParser';
import { getClassPrefix } from './mapParser';

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
  const classPrefix = getClassPrefix(code);
  const tileClass = tileMap.map.classes[classPrefix];
  return tileClass?.solid ?? true;
}

export function getTileProperty(
  tileMap: TileMap,
  col: number,
  row: number,
  property: string,
  defaultValue: number,
): number {
  const code = getTileCode(tileMap, col, row);
  if (code === null) return defaultValue;

  const tileProp = tileMap.map.tileProperties[code]?.[property];
  if (tileProp !== undefined) return tileProp;

  const classPrefix = getClassPrefix(code);
  const classProp = tileMap.map.classProperties[classPrefix]?.[property];
  if (classProp !== undefined) return classProp;

  return defaultValue;
}

export function getPlayerTileProperty(
  tileMap: TileMap,
  playerX: number,
  playerY: number,
  property: string,
  defaultValue: number,
): number {
  const col = Math.floor(playerX / TILE_SIZE);
  const row = Math.floor(playerY / TILE_SIZE);
  return getTileProperty(tileMap, col, row, property, defaultValue);
}

const imageCache = new Map<string, HTMLImageElement>();
const loadingImages = new Set<string>();

export function clearTileCache() {
  imageCache.clear();
  loadingImages.clear();
}

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
