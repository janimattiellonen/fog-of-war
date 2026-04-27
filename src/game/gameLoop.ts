import { type PlayerState, createPlayer, movePlayer } from './player';
import { type Direction } from './input';
import { type TileMap, createTileMapFromParsed, clearTileCache, getPlayerTileProperty } from './tiles';
import { parseTileConfig, parseMap } from './mapParser';
import { render } from './renderer';
import { type MinimapState, createMinimapState } from './minimap';
import { type VisibilityPolygon, computeVisibility } from './visibility';
import type { VisibilityMode } from './settings';

export interface GameState {
  player: PlayerState;
  tileMap: TileMap;
  minimap: MinimapState;
  visibility: VisibilityPolygon;
}

export async function loadGameState(
  mapUrl: string,
  configUrl = '/maps/tiles.conf',
  visibilityMode: VisibilityMode = 'circle',
): Promise<GameState> {
  const [configResponse, mapResponse] = await Promise.all([
    fetch(configUrl),
    fetch(mapUrl),
  ]);
  if (!configResponse.ok) {
    throw new Error(`Failed to load tile config (${configResponse.status}): ${configUrl}`);
  }
  if (!mapResponse.ok) {
    throw new Error(`Failed to load map (${mapResponse.status}): ${mapUrl}`);
  }
  const configText = await configResponse.text();
  const mapText = await mapResponse.text();
  const config = parseTileConfig(configText);
  const parsed = parseMap(mapText, config);
  clearTileCache();
  const tileMap = createTileMapFromParsed(parsed);
  const player = createPlayer(parsed.widthInPixels, parsed.heightInPixels, tileMap);
  const minimap = createMinimapState(tileMap);
  const visibility = computeVisibility(player, tileMap, visibilityMode, minimap);
  return { player, tileMap, minimap, visibility };
}

export function updateGame(
  state: GameState,
  movement: Direction,
  dt: number,
  visibilityMode: VisibilityMode = 'circle',
  targetFacingAngle: number | null = null,
): GameState {
  const moved = movePlayer(state.player, movement.dx, movement.dy, dt, state.tileMap, targetFacingAngle);

  const damagePerSecond = getPlayerTileProperty(state.tileMap, moved.x, moved.y, 'damage', 0);
  const player = damagePerSecond > 0
    ? { ...moved, hp: Math.max(0, moved.hp - damagePerSecond * dt) }
    : moved;

  const visibility = computeVisibility(player, state.tileMap, visibilityMode, state.minimap);
  return {
    ...state,
    player,
    visibility,
  };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  viewportWidth: number,
  viewportHeight: number,
  time: number,
) {
  render(
    ctx,
    state.player,
    state.tileMap,
    viewportWidth,
    viewportHeight,
    time,
    state.minimap,
    state.visibility,
  );
}
