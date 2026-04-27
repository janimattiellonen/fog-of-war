import type { PlayerState } from './player';
import type { TileMap } from './tiles';
import { TILE_SIZE, isSolid } from './tiles';

const MINIMAP_TILE_SIZE = 3;
const MINIMAP_PADDING = 12;
const MINIMAP_BORDER = 2;
const MINIMAP_OPACITY = 0.85;

const FLOOR_COLOR = '#5a4a3a';
const WALL_COLOR = '#2a2a3a';
const PLAYER_COLOR = '#e83030';
const BORDER_COLOR = '#444';
const BG_COLOR = '#000';

export interface MinimapState {
  explored: boolean[][];
  width: number;
  height: number;
}

export function createMinimapState(tileMap: TileMap): MinimapState {
  const explored: boolean[][] = [];
  for (let row = 0; row < tileMap.height; row++) {
    explored.push(new Array<boolean>(tileMap.width).fill(false));
  }
  return { explored, width: tileMap.width, height: tileMap.height };
}

export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  minimap: MinimapState,
  tileMap: TileMap,
  player: PlayerState,
): void {
  const mapW = minimap.width * MINIMAP_TILE_SIZE;
  const mapH = minimap.height * MINIMAP_TILE_SIZE;

  const x = MINIMAP_PADDING;
  const y = MINIMAP_PADDING;

  ctx.save();
  ctx.globalAlpha = MINIMAP_OPACITY;

  // Background + border
  ctx.fillStyle = BORDER_COLOR;
  ctx.fillRect(
    x - MINIMAP_BORDER,
    y - MINIMAP_BORDER,
    mapW + MINIMAP_BORDER * 2,
    mapH + MINIMAP_BORDER * 2,
  );
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(x, y, mapW, mapH);

  // Draw explored tiles
  for (let row = 0; row < minimap.height; row++) {
    for (let col = 0; col < minimap.width; col++) {
      if (!minimap.explored[row][col]) continue;
      const solid = isSolid(tileMap, col, row);
      ctx.fillStyle = solid ? WALL_COLOR : FLOOR_COLOR;
      ctx.fillRect(
        x + col * MINIMAP_TILE_SIZE,
        y + row * MINIMAP_TILE_SIZE,
        MINIMAP_TILE_SIZE,
        MINIMAP_TILE_SIZE,
      );
    }
  }

  // Draw player dot
  const playerMinimapX = x + (player.x / TILE_SIZE) * MINIMAP_TILE_SIZE;
  const playerMinimapY = y + (player.y / TILE_SIZE) * MINIMAP_TILE_SIZE;
  ctx.globalAlpha = 1;
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(playerMinimapX, playerMinimapY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
