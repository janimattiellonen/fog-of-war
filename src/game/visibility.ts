import { castRay } from './raycast';
import { AMBIENT_RADIUS, FLASHLIGHT_BEAM_ANGLE, VISIBLE_RADIUS } from './constants';
import { isSolid, type TileMap } from './tiles';
import type { PlayerState } from './player';
import type { MinimapState } from './minimap';
import type { VisibilityMode } from './settings';

export interface Point {
  x: number;
  y: number;
}

export interface VisibilityPolygon {
  /** Cone fan with player at index 0 followed by ray endpoints around the rim. Empty in circle mode. */
  cone: Point[];
  /** Closed loop of ray endpoints around the player. Empty when ambientRadius is 0. */
  ambient: Point[];
  /** Effective radius of the ambient ring. Drives the soft-edge gradient in the renderer. */
  ambientRadius: number;
  /** Wall cells hit by any ray. Each hit cell should be lit fully to avoid polygon-edge slivers. */
  litWalls: { col: number; row: number }[];
}

const CONE_RAY_COUNT = 60;
const FLASHLIGHT_AMBIENT_RAY_COUNT = 24;
const CIRCLE_RAY_COUNT = 72;

/**
 * Casts rays from the player to build a line-of-sight polygon, marking traversed tiles
 * in `minimap.explored` along the way. Returned polygon points are in world coordinates.
 */
export function computeVisibility(
  player: PlayerState,
  tileMap: TileMap,
  mode: VisibilityMode,
  minimap: MinimapState,
): VisibilityPolygon {
  const litWalls: { col: number; row: number }[] = [];
  const seenWall = new Set<number>();

  const recordLitWall = (col: number, row: number): void => {
    if (col < 0 || col >= tileMap.width || row < 0 || row >= tileMap.height) return;
    const key = row * tileMap.width + col;
    if (seenWall.has(key)) return;
    seenWall.add(key);
    litWalls.push({ col, row });
  };

  const visit = (col: number, row: number): void => {
    if (col >= 0 && col < minimap.width && row >= 0 && row < minimap.height) {
      minimap.explored[row][col] = true;
    }
    // For each non-solid cell traversed by a ray, light up adjacent wall tiles. Walls
    // bordering visible floor get lit even if no ray happens to hit them directly,
    // which prevents dark gaps along walls that run parallel to ray directions.
    if (!isSolid(tileMap, col, row)) {
      if (isSolid(tileMap, col - 1, row)) recordLitWall(col - 1, row);
      if (isSolid(tileMap, col + 1, row)) recordLitWall(col + 1, row);
      if (isSolid(tileMap, col, row - 1)) recordLitWall(col, row - 1);
      if (isSolid(tileMap, col, row + 1)) recordLitWall(col, row + 1);
    }
  };

  if (mode === 'flashlight') {
    return computeFlashlightVisibility(player, tileMap, visit, litWalls);
  }
  return computeCircleVisibility(player, tileMap, visit, litWalls);
}

function computeFlashlightVisibility(
  player: PlayerState,
  tileMap: TileMap,
  visit: (col: number, row: number) => void,
  litWalls: { col: number; row: number }[],
): VisibilityPolygon {
  const halfBeam = FLASHLIGHT_BEAM_ANGLE / 2;
  const startAngle = player.facingAngle - halfBeam;
  const coneStep = FLASHLIGHT_BEAM_ANGLE / (CONE_RAY_COUNT - 1);

  const cone: Point[] = [{ x: player.x, y: player.y }];
  for (let i = 0; i < CONE_RAY_COUNT; i++) {
    const angle = startAngle + i * coneStep;
    const hit = castRay(player.x, player.y, angle, VISIBLE_RADIUS, tileMap, visit);
    cone.push({ x: hit.endX, y: hit.endY });
  }

  const ambient: Point[] = [];
  const ambientStep = (Math.PI * 2) / FLASHLIGHT_AMBIENT_RAY_COUNT;
  for (let i = 0; i < FLASHLIGHT_AMBIENT_RAY_COUNT; i++) {
    const angle = i * ambientStep;
    const hit = castRay(player.x, player.y, angle, AMBIENT_RADIUS, tileMap, visit);
    ambient.push({ x: hit.endX, y: hit.endY });
  }

  return { cone, ambient, ambientRadius: AMBIENT_RADIUS, litWalls };
}

function computeCircleVisibility(
  player: PlayerState,
  tileMap: TileMap,
  visit: (col: number, row: number) => void,
  litWalls: { col: number; row: number }[],
): VisibilityPolygon {
  const ambient: Point[] = [];
  const step = (Math.PI * 2) / CIRCLE_RAY_COUNT;
  for (let i = 0; i < CIRCLE_RAY_COUNT; i++) {
    const angle = i * step;
    const hit = castRay(player.x, player.y, angle, VISIBLE_RADIUS, tileMap, visit);
    ambient.push({ x: hit.endX, y: hit.endY });
  }
  return { cone: [], ambient, ambientRadius: VISIBLE_RADIUS, litWalls };
}
