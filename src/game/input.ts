export interface Direction {
  dx: number;
  dy: number;
}

const KEY_BINDINGS: Record<string, Direction> = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 },
  W: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  A: { dx: -1, dy: 0 },
  D: { dx: 1, dy: 0 },
  '8': { dx: 0, dy: -1 },
  '2': { dx: 0, dy: 1 },
  '4': { dx: -1, dy: 0 },
  '6': { dx: 1, dy: 0 },
};

export function getDirectionFromKey(key: string): Direction | null {
  return KEY_BINDINGS[key] ?? null;
}

export function createInputState() {
  const keysDown = new Set<string>();
  return {
    keysDown,
    getMovement(): Direction {
      let dx = 0;
      let dy = 0;
      for (const key of keysDown) {
        const dir = KEY_BINDINGS[key];
        if (dir) {
          dx += dir.dx;
          dy += dir.dy;
        }
      }
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }
      return { dx, dy };
    },
  };
}
