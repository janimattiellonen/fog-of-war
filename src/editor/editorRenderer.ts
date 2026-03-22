import type { EditorState } from './editorState';
import { normalizeSelection } from './editorState';
import { TILE_SIZE } from '../game/tiles';

export function renderEditor(
  ctx: CanvasRenderingContext2D,
  state: EditorState,
  viewportWidth: number,
  viewportHeight: number,
  scrollX: number,
  scrollY: number,
  hoverCol: number | null,
  hoverRow: number | null,
) {
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  if (state.widthInTiles === 0 || state.heightInTiles === 0) {
    ctx.fillStyle = '#666';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Create a new map or load an existing one', viewportWidth / 2, viewportHeight / 2);
    return;
  }

  ctx.save();
  ctx.translate(-scrollX, -scrollY);

  const startCol = Math.max(0, Math.floor(scrollX / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(scrollY / TILE_SIZE));
  const endCol = Math.min(state.widthInTiles - 1, Math.floor((scrollX + viewportWidth) / TILE_SIZE));
  const endRow = Math.min(state.heightInTiles - 1, Math.floor((scrollY + viewportHeight) / TILE_SIZE));

  // Draw tiles
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const code = state.grid[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      const img = state.tileImages.get(code);
      if (img) {
        ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  const gridLeft = startCol * TILE_SIZE;
  const gridRight = (endCol + 1) * TILE_SIZE;
  const gridTop = startRow * TILE_SIZE;
  const gridBottom = (endRow + 1) * TILE_SIZE;

  for (let col = startCol; col <= endCol + 1; col++) {
    const x = col * TILE_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, gridTop);
    ctx.lineTo(x, gridBottom);
    ctx.stroke();
  }
  for (let row = startRow; row <= endRow + 1; row++) {
    const y = row * TILE_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(gridLeft, y);
    ctx.lineTo(gridRight, y);
    ctx.stroke();
  }

  // Map border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, state.widthInTiles * TILE_SIZE, state.heightInTiles * TILE_SIZE);

  // Hover highlight
  if (hoverCol !== null && hoverRow !== null && hoverCol >= 0 && hoverRow >= 0 && hoverCol < state.widthInTiles && hoverRow < state.heightInTiles) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(hoverCol * TILE_SIZE, hoverRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // Selection overlay
  if (state.selection) {
    const sel = normalizeSelection(state.selection);
    const sx = sel.startCol * TILE_SIZE;
    const sy = sel.startRow * TILE_SIZE;
    const sw = (sel.endCol - sel.startCol + 1) * TILE_SIZE;
    const sh = (sel.endRow - sel.startRow + 1) * TILE_SIZE;

    ctx.fillStyle = 'rgba(50, 130, 240, 0.2)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = 'rgba(50, 130, 240, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);
  }

  ctx.restore();
}
