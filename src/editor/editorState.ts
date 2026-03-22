import type { TileConfig } from '../game/mapParser';

export type ActiveTool = 'paint' | 'select' | 'autoborder';

export interface Selection {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export interface EditorState {
  tileConfig: TileConfig | null;
  tileImages: Map<string, HTMLImageElement>;
  grid: string[][];
  widthInTiles: number;
  heightInTiles: number;
  selectedTileCode: string | null;
  activeTool: ActiveTool;
  selection: Selection | null;
  isDirty: boolean;
  fileName: string;
}

export type EditorAction =
  | { type: 'SET_TILE_CONFIG'; config: TileConfig; images: Map<string, HTMLImageElement> }
  | { type: 'NEW_MAP'; width: number; height: number; defaultTile: string }
  | { type: 'LOAD_MAP'; grid: string[][]; fileName: string }
  | { type: 'PAINT_TILE'; col: number; row: number }
  | { type: 'PAINT_TILES'; cells: { col: number; row: number }[] }
  | { type: 'SELECT_TILE_CODE'; code: string }
  | { type: 'SET_TOOL'; tool: ActiveTool }
  | { type: 'SET_SELECTION'; selection: Selection | null }
  | { type: 'DELETE_SELECTION'; replacementTile: string }
  | { type: 'FILL_SELECTION'; tileCode: string }
  | { type: 'AUTO_BORDER'; wallTileCode: string }
  | { type: 'AUTO_RANDOM_BORDER'; wallTileCodes: string[] }
  | { type: 'MARK_SAVED' };

export function getDefaultFloorTile(config: TileConfig): string | null {
  return Object.keys(config.tiles).find((code) => {
    const classLetter = code[0];
    return config.classes[classLetter] && !config.classes[classLetter].solid;
  }) ?? Object.keys(config.tiles)[0] ?? null;
}

export function createInitialEditorState(): EditorState {
  return {
    tileConfig: null,
    tileImages: new Map(),
    grid: [],
    widthInTiles: 0,
    heightInTiles: 0,
    selectedTileCode: null,
    activeTool: 'paint',
    selection: null,
    isDirty: false,
    fileName: 'untitled.map',
  };
}

function createGrid(width: number, height: number, defaultTile: string): string[][] {
  const grid: string[][] = [];
  for (let row = 0; row < height; row++) {
    grid.push(new Array(width).fill(defaultTile));
  }
  return grid;
}

function cloneGrid(grid: string[][]): string[][] {
  return grid.map((row) => [...row]);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TILE_CONFIG':
      return {
        ...state,
        tileConfig: action.config,
        tileImages: action.images,
      };

    case 'NEW_MAP':
      return {
        ...state,
        grid: createGrid(action.width, action.height, action.defaultTile),
        widthInTiles: action.width,
        heightInTiles: action.height,
        selection: null,
        isDirty: false,
        fileName: 'untitled.map',
      };

    case 'LOAD_MAP':
      return {
        ...state,
        grid: action.grid,
        widthInTiles: action.grid[0]?.length ?? 0,
        heightInTiles: action.grid.length,
        selection: null,
        isDirty: false,
        fileName: action.fileName,
      };

    case 'PAINT_TILE': {
      if (!state.selectedTileCode) {
        return state;
      }
      if (action.col < 0 || action.row < 0 || action.col >= state.widthInTiles || action.row >= state.heightInTiles) {
        return state;
      }
      if (state.grid[action.row][action.col] === state.selectedTileCode) {
        return state;
      }
      const newGrid = cloneGrid(state.grid);
      newGrid[action.row][action.col] = state.selectedTileCode;
      return { ...state, grid: newGrid, isDirty: true };
    }

    case 'PAINT_TILES': {
      if (!state.selectedTileCode) {
        return state;
      }
      const newGrid = cloneGrid(state.grid);
      let changed = false;
      for (const cell of action.cells) {
        if (cell.col >= 0 && cell.row >= 0 && cell.col < state.widthInTiles && cell.row < state.heightInTiles) {
          if (newGrid[cell.row][cell.col] !== state.selectedTileCode) {
            newGrid[cell.row][cell.col] = state.selectedTileCode;
            changed = true;
          }
        }
      }
      if (!changed) {
        return state;
      }
      return { ...state, grid: newGrid, isDirty: true };
    }

    case 'SELECT_TILE_CODE':
      return { ...state, selectedTileCode: action.code };

    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selection: action.tool !== 'select' ? null : state.selection };

    case 'SET_SELECTION':
      return { ...state, selection: action.selection };

    case 'DELETE_SELECTION': {
      if (!state.selection) {
        return state;
      }
      const { startCol, startRow, endCol, endRow } = normalizeSelection(state.selection);
      const newGrid = cloneGrid(state.grid);
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          newGrid[row][col] = action.replacementTile;
        }
      }
      return { ...state, grid: newGrid, selection: null, isDirty: true };
    }

    case 'FILL_SELECTION': {
      if (!state.selection) {
        return state;
      }
      const { startCol, startRow, endCol, endRow } = normalizeSelection(state.selection);
      const newGrid = cloneGrid(state.grid);
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          newGrid[row][col] = action.tileCode;
        }
      }
      return { ...state, grid: newGrid, selection: null, isDirty: true };
    }

    case 'AUTO_BORDER': {
      if (state.widthInTiles === 0 || state.heightInTiles === 0) {
        return state;
      }
      const newGrid = cloneGrid(state.grid);
      for (let col = 0; col < state.widthInTiles; col++) {
        newGrid[0][col] = action.wallTileCode;
        newGrid[state.heightInTiles - 1][col] = action.wallTileCode;
      }
      for (let row = 0; row < state.heightInTiles; row++) {
        newGrid[row][0] = action.wallTileCode;
        newGrid[row][state.widthInTiles - 1] = action.wallTileCode;
      }
      return { ...state, grid: newGrid, isDirty: true };
    }

    case 'AUTO_RANDOM_BORDER': {
      if (state.widthInTiles === 0 || state.heightInTiles === 0 || action.wallTileCodes.length === 0) {
        return state;
      }
      const codes = action.wallTileCodes;
      const pick = () => codes[Math.floor(Math.random() * codes.length)];
      const newGrid = cloneGrid(state.grid);
      for (let col = 0; col < state.widthInTiles; col++) {
        newGrid[0][col] = pick();
        newGrid[state.heightInTiles - 1][col] = pick();
      }
      for (let row = 0; row < state.heightInTiles; row++) {
        newGrid[row][0] = pick();
        newGrid[row][state.widthInTiles - 1] = pick();
      }
      return { ...state, grid: newGrid, isDirty: true };
    }

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}

export function normalizeSelection(sel: Selection): { startCol: number; startRow: number; endCol: number; endRow: number } {
  return {
    startCol: Math.min(sel.startCol, sel.endCol),
    startRow: Math.min(sel.startRow, sel.endRow),
    endCol: Math.max(sel.startCol, sel.endCol),
    endRow: Math.max(sel.startRow, sel.endRow),
  };
}
