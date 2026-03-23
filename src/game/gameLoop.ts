import { type PlayerState, createPlayer, movePlayer } from './player';
import { type Direction } from './input';
import { type TileMap, createTileMapFromParsed, clearTileCache } from './tiles';
import { parseTileConfig, parseMap } from './mapParser';
import { render } from './renderer';
import { type MinimapState, createMinimapState, updateExplored } from './minimap';

export interface GameState {
  player: PlayerState;
  tileMap: TileMap;
  minimap: MinimapState;
}

export async function loadGameState(mapUrl: string, configUrl = '/maps/tiles.conf'): Promise<GameState> {
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
  updateExplored(minimap, player, tileMap);
  return { player, tileMap, minimap };
}

export function updateGame(state: GameState, movement: Direction): GameState {
  const player = movePlayer(state.player, movement.dx, movement.dy, state.tileMap);
  updateExplored(state.minimap, player, state.tileMap);
  return {
    ...state,
    player,
  };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  viewportWidth: number,
  viewportHeight: number,
  time: number,
) {
  render(ctx, state.player, state.tileMap, viewportWidth, viewportHeight, time, state.minimap);
}
