import { useRef, useEffect, useCallback } from 'react';
import type { EditorState, EditorAction } from '../editorState';
import { renderEditor } from '../editorRenderer';
import { TILE_SIZE } from '../../game/tiles';

interface DrawingAreaProps {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

export default function DrawingArea({ state, dispatch }: DrawingAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<{ col: number; row: number } | null>(null);
  const isPaintingRef = useRef(false);
  const isSelectingRef = useRef(false);
  const selectStartRef = useRef<{ col: number; row: number } | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const getCell = useCallback((e: React.MouseEvent<HTMLCanvasElement>): { col: number; row: number } => {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left + scrollRef.current.x) / TILE_SIZE);
    const row = Math.floor((e.clientY - rect.top + scrollRef.current.y) / TILE_SIZE);
    return { col, row };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCell(e);
    if (stateRef.current.activeTool === 'paint') {
      isPaintingRef.current = true;
      dispatch({ type: 'PAINT_TILE', col: cell.col, row: cell.row });
    } else if (stateRef.current.activeTool === 'select') {
      isSelectingRef.current = true;
      selectStartRef.current = cell;
      dispatch({ type: 'SET_SELECTION', selection: { startCol: cell.col, startRow: cell.row, endCol: cell.col, endRow: cell.row } });
    }
  }, [dispatch, getCell]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCell(e);
    hoverRef.current = cell;

    if (isPaintingRef.current && stateRef.current.activeTool === 'paint') {
      dispatch({ type: 'PAINT_TILE', col: cell.col, row: cell.row });
    } else if (isSelectingRef.current && selectStartRef.current) {
      dispatch({
        type: 'SET_SELECTION',
        selection: {
          startCol: selectStartRef.current.col,
          startRow: selectStartRef.current.row,
          endCol: cell.col,
          endRow: cell.row,
        },
      });
    }
  }, [dispatch, getCell]);

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
    isSelectingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    scrollRef.current = {
      x: Math.max(0, scrollRef.current.x + e.deltaX),
      y: Math.max(0, scrollRef.current.y + e.deltaY),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let animId: number;
    const loop = () => {
      const s = stateRef.current;
      const hover = hoverRef.current;
      renderEditor(
        ctx,
        s,
        canvas.width,
        canvas.height,
        scrollRef.current.x,
        scrollRef.current.y,
        hover?.col ?? null,
        hover?.row ?? null,
      );
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: state.activeTool === 'paint' ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
