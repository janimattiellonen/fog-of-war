import { TILE_SIZE, isSolid, type TileMap } from './tiles';

export interface RayHit {
  distance: number;
  endX: number;
  endY: number;
}

/**
 * DDA grid traversal. Marches from (originX, originY) along `angle` until either a solid
 * tile is hit or `maxDist` is reached. The optional `visitCell` callback is invoked for the
 * origin cell and every cell the ray enters, including the solid cell that terminates it.
 * Out-of-bounds tiles are treated as solid by `isSolid`, so rays naturally stop at map edges.
 */
export function castRay(
  originX: number,
  originY: number,
  angle: number,
  maxDist: number,
  tileMap: TileMap,
  visitCell?: (col: number, row: number) => void,
): RayHit {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  let cellX = Math.floor(originX / TILE_SIZE);
  let cellY = Math.floor(originY / TILE_SIZE);

  visitCell?.(cellX, cellY);

  const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;

  const tDeltaX = dx !== 0 ? TILE_SIZE / Math.abs(dx) : Infinity;
  const tDeltaY = dy !== 0 ? TILE_SIZE / Math.abs(dy) : Infinity;

  let tMaxX: number;
  if (dx > 0) tMaxX = ((cellX + 1) * TILE_SIZE - originX) / dx;
  else if (dx < 0) tMaxX = (cellX * TILE_SIZE - originX) / dx;
  else tMaxX = Infinity;

  let tMaxY: number;
  if (dy > 0) tMaxY = ((cellY + 1) * TILE_SIZE - originY) / dy;
  else if (dy < 0) tMaxY = (cellY * TILE_SIZE - originY) / dy;
  else tMaxY = Infinity;

  while (true) {
    let nextT: number;
    if (tMaxX < tMaxY) {
      nextT = tMaxX;
      tMaxX += tDeltaX;
      cellX += stepX;
    } else {
      nextT = tMaxY;
      tMaxY += tDeltaY;
      cellY += stepY;
    }

    if (nextT >= maxDist) {
      return {
        distance: maxDist,
        endX: originX + dx * maxDist,
        endY: originY + dy * maxDist,
      };
    }

    visitCell?.(cellX, cellY);

    if (isSolid(tileMap, cellX, cellY)) {
      // Extend the ray to the far side of the hit cell so the wall itself is inside the
      // visibility polygon (and gets lit). Anything beyond that cell stays dark.
      const exitT = Math.min(tMaxX, tMaxY, maxDist);
      return {
        distance: exitT,
        endX: originX + dx * exitT,
        endY: originY + dy * exitT,
      };
    }
  }
}
