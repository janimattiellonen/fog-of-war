import { PLAYER_RADIUS, MOVE_SPEED, DEFAULT_MAX_HP } from './constants';
import { type TileMap, isSolid, getPlayerTileProperty, TILE_SIZE } from './tiles';

export interface PlayerState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export function createPlayer(fieldWidth: number, fieldHeight: number, tileMap: TileMap): PlayerState {
  const centerX = fieldWidth / 2;
  const centerY = fieldHeight / 2;

  if (!collidesWithWall(centerX, centerY, tileMap)) {
    return { x: centerX, y: centerY, hp: DEFAULT_MAX_HP, maxHp: DEFAULT_MAX_HP };
  }

  // Spiral outward from center to find a non-solid tile
  for (let radius = 1; radius < Math.max(tileMap.width, tileMap.height); radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
          continue;
        }
        const col = Math.floor(centerX / TILE_SIZE) + dx;
        const row = Math.floor(centerY / TILE_SIZE) + dy;
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        if (!collidesWithWall(x, y, tileMap)) {
          return { x, y, hp: DEFAULT_MAX_HP, maxHp: DEFAULT_MAX_HP };
        }
      }
    }
  }

  return { x: centerX, y: centerY, hp: DEFAULT_MAX_HP, maxHp: DEFAULT_MAX_HP };
}

export function movePlayer(player: PlayerState, dx: number, dy: number, tileMap: TileMap): PlayerState {
  const speedModifier = getPlayerTileProperty(tileMap, player.x, player.y, 'speedModifier', 1.0);
  const effectiveSpeed = MOVE_SPEED * speedModifier;

  const newX = player.x + dx * effectiveSpeed;
  const newY = player.y + dy * effectiveSpeed;

  const resolvedX = collidesWithWall(newX, player.y, tileMap) ? player.x : newX;
  const resolvedY = collidesWithWall(resolvedX, newY, tileMap) ? player.y : newY;

  return { ...player, x: resolvedX, y: resolvedY };
}

function collidesWithWall(x: number, y: number, tileMap: TileMap): boolean {
  const left = x - PLAYER_RADIUS;
  const right = x + PLAYER_RADIUS;
  const top = y - PLAYER_RADIUS;
  const bottom = y + PLAYER_RADIUS;

  const colStart = Math.floor(left / TILE_SIZE);
  const colEnd = Math.floor(right / TILE_SIZE);
  const rowStart = Math.floor(top / TILE_SIZE);
  const rowEnd = Math.floor(bottom / TILE_SIZE);

  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      if (isSolid(tileMap, col, row)) {
        return true;
      }
    }
  }

  return false;
}
