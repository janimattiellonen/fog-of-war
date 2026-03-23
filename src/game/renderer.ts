import type { PlayerState } from './player';
import type { TileMap } from './tiles';
import { TILE_SIZE, getTileImage } from './tiles';
import { PLAYER_RADIUS, VISIBLE_RADIUS, FOG_EDGE_THICKNESS } from './constants';
import { type MinimapState, renderMinimap } from './minimap';

export function render(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  tileMap: TileMap,
  viewportWidth: number,
  viewportHeight: number,
  time: number,
  minimap?: MinimapState,
) {
  const cameraX = player.x - viewportWidth / 2;
  const cameraY = player.y - viewportHeight / 2;

  ctx.save();
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  ctx.translate(-cameraX, -cameraY);

  drawTiles(ctx, tileMap, cameraX, cameraY, viewportWidth, viewportHeight);
  drawPlayer(ctx, player, time);

  ctx.restore();

  drawFogOfWar(ctx, viewportWidth, viewportHeight);

  if (minimap) {
    renderMinimap(ctx, minimap, tileMap, player);
  }
}

function drawTiles(
  ctx: CanvasRenderingContext2D,
  tileMap: TileMap,
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  // Only render tiles visible in the viewport
  const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
  const endCol = Math.min(tileMap.width - 1, Math.floor((cameraX + viewportWidth) / TILE_SIZE));
  const endRow = Math.min(tileMap.height - 1, Math.floor((cameraY + viewportHeight) / TILE_SIZE));

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const code = tileMap.grid[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      const img = getTileImage(tileMap, code);
      if (img) {
        ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, time: number) {
  const pulse = Math.sin(time * 0.004) * 0.5 + 0.5;
  const r = Math.round(180 + pulse * 75);
  const g = Math.round(20 + pulse * 30);
  const b = Math.round(20 + pulse * 20);

  const glowRadius = PLAYER_RADIUS + 4 + pulse * 3;
  const gradient = ctx.createRadialGradient(
    player.x, player.y, PLAYER_RADIUS * 0.5,
    player.x, player.y, glowRadius,
  );
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.6)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.beginPath();
  ctx.arc(player.x, player.y, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fill();
}

function drawFogOfWar(ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number) {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  const innerRadius = VISIBLE_RADIUS - FOG_EDGE_THICKNESS;
  const outerRadius = VISIBLE_RADIUS;

  const fogGradient = ctx.createRadialGradient(
    centerX, centerY, innerRadius,
    centerX, centerY, outerRadius,
  );
  fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  fogGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

  ctx.fillStyle = fogGradient;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // Solid darkness beyond the visible radius
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, viewportWidth, viewportHeight);
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fill();
  ctx.restore();
}
