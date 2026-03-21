import { type PlayerState, createPlayer, movePlayer } from './player';
import { type Direction } from './input';
import { type TileMap, createTileMapFromParsed } from './tiles';
import { parseMap } from './mapParser';
import { render } from './renderer';

export interface GameState {
  player: PlayerState;
  tileMap: TileMap;
}

export async function loadGameState(mapUrl: string): Promise<GameState> {
  const response = await fetch(mapUrl);
  const text = await response.text();
  const parsed = parseMap(text);
  const tileMap = createTileMapFromParsed(parsed);
  const player = createPlayer(parsed.widthInPixels, parsed.heightInPixels);
  return { player, tileMap };
}

export function updateGame(state: GameState, movement: Direction): GameState {
  return {
    ...state,
    player: movePlayer(state.player, movement.dx, movement.dy, state.tileMap),
  };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  viewportWidth: number,
  viewportHeight: number,
  time: number,
) {
  render(ctx, state.player, state.tileMap, viewportWidth, viewportHeight, time);
}
