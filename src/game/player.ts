import { PLAYER_RADIUS, MOVE_SPEED } from './constants';
import { type TileMap, isSolid, TILE_SIZE } from './tiles';

export interface PlayerState {
  x: number;
  y: number;
}

export function createPlayer(fieldWidth: number, fieldHeight: number): PlayerState {
  return {
    x: fieldWidth / 2,
    y: fieldHeight / 2,
  };
}

export function movePlayer(player: PlayerState, dx: number, dy: number, tileMap: TileMap): PlayerState {
  const newX = player.x + dx * MOVE_SPEED;
  const newY = player.y + dy * MOVE_SPEED;

  const resolvedX = collidesWithWall(newX, player.y, tileMap) ? player.x : newX;
  const resolvedY = collidesWithWall(resolvedX, newY, tileMap) ? player.y : newY;

  return { x: resolvedX, y: resolvedY };
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
