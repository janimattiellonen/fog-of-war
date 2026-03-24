import { useRef, useEffect, useState } from 'react';
import { createInputState } from './game/input';
import { type GameState, loadGameState, updateGame, renderGame } from './game/gameLoop';

interface GameCanvasProps {
  mapFile: string;
  paused?: boolean;
  onEscape?: () => void;
  onGameOver?: () => void;
}

export default function GameCanvas({ mapFile, paused, onEscape, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const inputRef = useRef(createInputState());
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const gameOverFiredRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }
      if (pausedRef.current) return;
      inputRef.current.keysDown.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      inputRef.current.keysDown.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId: number;
    let cancelled = false;
    let lastTime = 0;

    loadGameState(`/maps/${mapFile}`).then((state) => {
      if (cancelled) {
        return;
      }
      gameStateRef.current = state;
      setLoading(false);

      const loop = (time: number) => {
        if (!gameStateRef.current) {
          return;
        }
        if (pausedRef.current) {
          lastTime = 0;
          renderGame(ctx, gameStateRef.current, window.innerWidth, window.innerHeight, time);
        } else {
          const dt = lastTime === 0 ? 0 : (time - lastTime) / 1000;
          lastTime = time;
          const movement = inputRef.current.getMovement();
          gameStateRef.current = updateGame(gameStateRef.current, movement, dt);
          renderGame(ctx, gameStateRef.current, window.innerWidth, window.innerHeight, time);
          if (gameStateRef.current.player.hp <= 0 && !gameOverFiredRef.current) {
            gameOverFiredRef.current = true;
            onGameOverRef.current?.();
          }
        }
        animationId = requestAnimationFrame(loop);
      };
      animationId = requestAnimationFrame(loop);
    }).catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mapFile]);

  return (
    <>
      {(loading || error) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: error ? '#e85050' : '#666',
          fontSize: '18px',
          background: '#000',
        }}>
          {error ?? 'Loading map...'}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          display: loading ? 'none' : 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
        }}
      />
    </>
  );
}
