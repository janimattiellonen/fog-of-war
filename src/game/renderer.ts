import type { PlayerState } from './player';
import type { TileMap } from './tiles';
import { TILE_SIZE, getTileImage } from './tiles';
import { PLAYER_RADIUS, FOG_EDGE_THICKNESS, VISIBLE_RADIUS } from './constants';
import { type MinimapState, renderMinimap } from './minimap';
import type { VisibilityPolygon, Point } from './visibility';

export function render(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  tileMap: TileMap,
  viewportWidth: number,
  viewportHeight: number,
  time: number,
  minimap: MinimapState,
  visibility: VisibilityPolygon,
) {
  const cameraX = player.x - viewportWidth / 2;
  const cameraY = player.y - viewportHeight / 2;

  ctx.save();
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  ctx.translate(-cameraX, -cameraY);

  drawTiles(ctx, tileMap, cameraX, cameraY, viewportWidth, viewportHeight);
  drawPlayer(ctx, player, time);

  ctx.restore();

  drawVisibilityFog(ctx, viewportWidth, viewportHeight, visibility, cameraX, cameraY);
  drawHealthBar(ctx, player, viewportWidth, time);
  renderMinimap(ctx, minimap, tileMap, player);
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

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  viewportWidth: number,
  time: number,
) {
  const barWidth = 200;
  const barHeight = 20;
  const padding = 16;
  const x = viewportWidth - barWidth - padding;
  const y = padding;

  const hpRatio = Math.max(0, player.hp / player.maxHp);
  const losing = player.hp < player.maxHp && player.hp > 0;

  // Background (red = lost health)
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(x, y, barWidth, barHeight);

  // Foreground (green = current health, pulsates when losing)
  if (losing) {
    const pulse = Math.sin(time * 0.008) * 0.5 + 0.5;
    const r = Math.round(34 + pulse * 60);
    const g = Math.round(197 - pulse * 50);
    const b = Math.round(94 - pulse * 30);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  } else {
    ctx.fillStyle = '#22c55e';
  }
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);

  // HP text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${Math.ceil(player.hp)} / ${player.maxHp}`,
    x + barWidth / 2,
    y + barHeight / 2,
  );
}

let cachedMaskCanvas: HTMLCanvasElement | null = null;

function drawVisibilityFog(
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
  visibility: VisibilityPolygon,
  cameraX: number,
  cameraY: number,
) {
  if (!cachedMaskCanvas || cachedMaskCanvas.width !== viewportWidth || cachedMaskCanvas.height !== viewportHeight) {
    cachedMaskCanvas = document.createElement('canvas');
    cachedMaskCanvas.width = viewportWidth;
    cachedMaskCanvas.height = viewportHeight;
  }
  const mask = cachedMaskCanvas.getContext('2d')!;

  mask.globalCompositeOperation = 'source-over';
  mask.fillStyle = 'rgba(0, 0, 0, 1)';
  mask.fillRect(0, 0, viewportWidth, viewportHeight);

  mask.globalCompositeOperation = 'destination-out';

  const playerScreenX = viewportWidth / 2;
  const playerScreenY = viewportHeight / 2;

  if (visibility.cone.length > 0) {
    fillPolygonWithRadialFade(
      mask,
      visibility.cone,
      cameraX,
      cameraY,
      playerScreenX,
      playerScreenY,
      VISIBLE_RADIUS,
    );
  }

  if (visibility.ambient.length > 0) {
    fillPolygonWithRadialFade(
      mask,
      visibility.ambient,
      cameraX,
      cameraY,
      playerScreenX,
      playerScreenY,
      visibility.ambientRadius,
    );
  }

  // Cut out each ray-hit wall as a full rect so polygon-edge slivers across the front
  // face of a wall tile disappear. Use the same radial gradient so distant walls fade.
  if (visibility.litWalls.length > 0) {
    const gradient = mask.createRadialGradient(
      playerScreenX, playerScreenY, 0,
      playerScreenX, playerScreenY, VISIBLE_RADIUS,
    );
    const inner = (VISIBLE_RADIUS - FOG_EDGE_THICKNESS) / VISIBLE_RADIUS;
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(inner, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mask.fillStyle = gradient;
    for (const { col, row } of visibility.litWalls) {
      mask.fillRect(
        col * TILE_SIZE - cameraX,
        row * TILE_SIZE - cameraY,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }

  ctx.drawImage(cachedMaskCanvas, 0, 0);
}

function fillPolygonWithRadialFade(
  mask: CanvasRenderingContext2D,
  worldPoints: Point[],
  cameraX: number,
  cameraY: number,
  centerScreenX: number,
  centerScreenY: number,
  outerRadius: number,
) {
  const softEdge = Math.min(FOG_EDGE_THICKNESS, outerRadius * 0.5);
  const innerRadius = outerRadius - softEdge;
  const gradient = mask.createRadialGradient(
    centerScreenX, centerScreenY, 0,
    centerScreenX, centerScreenY, outerRadius,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(innerRadius / outerRadius, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  mask.fillStyle = gradient;
  mask.beginPath();
  mask.moveTo(worldPoints[0].x - cameraX, worldPoints[0].y - cameraY);
  for (let i = 1; i < worldPoints.length; i++) {
    mask.lineTo(worldPoints[i].x - cameraX, worldPoints[i].y - cameraY);
  }
  mask.closePath();
  mask.fill();
}
