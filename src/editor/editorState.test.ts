import {
  editorReducer,
  createInitialEditorState,
  normalizeSelection,
  getDefaultFloorTile,
  type EditorState,
  type Selection,
} from './editorState'
import type { TileConfig } from '../game/mapParser'

function makeConfig(): TileConfig {
  return {
    classes: {
      FL: { name: 'floor', solid: false },
      WL: { name: 'wall', solid: true },
    },
    tiles: {
      FL00: { code: 'FL00', className: 'floor', image: 'floor/dirt0.png' },
      WL00: { code: 'WL00', className: 'wall', image: 'wall/brick0.png' },
    },
    classProperties: {},
    tileProperties: {},
  }
}

function makeStateWithGrid(): EditorState {
  const state = createInitialEditorState()
  return editorReducer(state, { type: 'NEW_MAP', width: 3, height: 3, defaultTile: 'FL00' })
}

describe('normalizeSelection', () => {
  it('should normalize when start < end', () => {
    const sel: Selection = { startCol: 1, startRow: 1, endCol: 3, endRow: 3 }
    expect(normalizeSelection(sel)).toEqual({ startCol: 1, startRow: 1, endCol: 3, endRow: 3 })
  })

  it('should normalize when start > end (inverted selection)', () => {
    const sel: Selection = { startCol: 3, startRow: 3, endCol: 1, endRow: 1 }
    expect(normalizeSelection(sel)).toEqual({ startCol: 1, startRow: 1, endCol: 3, endRow: 3 })
  })

  it('should handle mixed inversion', () => {
    const sel: Selection = { startCol: 3, startRow: 1, endCol: 1, endRow: 3 }
    expect(normalizeSelection(sel)).toEqual({ startCol: 1, startRow: 1, endCol: 3, endRow: 3 })
  })
})

describe('getDefaultFloorTile', () => {
  it('should return first non-solid tile code', () => {
    const config = makeConfig()
    const result = getDefaultFloorTile(config)
    expect(result).toBe('FL00')
  })

  it('should fall back to first tile if all are solid', () => {
    const config: TileConfig = {
      classes: { WL: { name: 'wall', solid: true } },
      tiles: { WL00: { code: 'WL00', className: 'wall', image: 'wall/brick0.png' } },
      classProperties: {},
      tileProperties: {},
    }
    expect(getDefaultFloorTile(config)).toBe('WL00')
  })

  it('should return null for empty config', () => {
    const config: TileConfig = { classes: {}, tiles: {}, classProperties: {}, tileProperties: {} }
    expect(getDefaultFloorTile(config)).toBeNull()
  })
})

describe('editorReducer', () => {
  describe('NEW_MAP', () => {
    it('should create a grid filled with default tile', () => {
      const state = createInitialEditorState()
      const next = editorReducer(state, { type: 'NEW_MAP', width: 3, height: 2, defaultTile: 'FL00' })
      expect(next.widthInTiles).toBe(3)
      expect(next.heightInTiles).toBe(2)
      expect(next.grid).toHaveLength(2)
      expect(next.grid[0]).toEqual(['FL00', 'FL00', 'FL00'])
      expect(next.isDirty).toBe(false)
    })
  })

  describe('LOAD_MAP', () => {
    it('should load grid and set dimensions', () => {
      const state = createInitialEditorState()
      const grid = [['WL00', 'FL00'], ['FL00', 'WL00']]
      const next = editorReducer(state, { type: 'LOAD_MAP', grid, fileName: 'test.map' })
      expect(next.grid).toBe(grid)
      expect(next.widthInTiles).toBe(2)
      expect(next.heightInTiles).toBe(2)
      expect(next.fileName).toBe('test.map')
      expect(next.isDirty).toBe(false)
    })
  })

  describe('PAINT_TILE', () => {
    it('should paint a tile at the given position', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      const next = editorReducer(state, { type: 'PAINT_TILE', col: 1, row: 1 })
      expect(next.grid[1][1]).toBe('WL00')
      expect(next.isDirty).toBe(true)
    })

    it('should not paint when no tile is selected', () => {
      const state = makeStateWithGrid()
      const next = editorReducer(state, { type: 'PAINT_TILE', col: 1, row: 1 })
      expect(next).toBe(state)
    })

    it('should not paint out of bounds', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      const next = editorReducer(state, { type: 'PAINT_TILE', col: -1, row: 0 })
      expect(next).toBe(state)
    })

    it('should not mutate when painting same tile', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'FL00' })
      const next = editorReducer(state, { type: 'PAINT_TILE', col: 0, row: 0 })
      expect(next).toBe(state)
    })
  })

  describe('PAINT_TILES', () => {
    it('should paint multiple tiles', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      const next = editorReducer(state, {
        type: 'PAINT_TILES',
        cells: [{ col: 0, row: 0 }, { col: 1, row: 1 }],
      })
      expect(next.grid[0][0]).toBe('WL00')
      expect(next.grid[1][1]).toBe('WL00')
      expect(next.isDirty).toBe(true)
    })

    it('should skip out-of-bounds cells', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      const next = editorReducer(state, {
        type: 'PAINT_TILES',
        cells: [{ col: -1, row: 0 }, { col: 1, row: 1 }],
      })
      expect(next.grid[1][1]).toBe('WL00')
      expect(next.isDirty).toBe(true)
    })

    it('should not mutate when no cells change', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'FL00' })
      const next = editorReducer(state, {
        type: 'PAINT_TILES',
        cells: [{ col: 0, row: 0 }],
      })
      expect(next).toBe(state)
    })
  })

  describe('SET_TOOL', () => {
    it('should change active tool', () => {
      const state = createInitialEditorState()
      const next = editorReducer(state, { type: 'SET_TOOL', tool: 'select' })
      expect(next.activeTool).toBe('select')
    })

    it('should clear selection when switching away from select', () => {
      let state = createInitialEditorState()
      state = { ...state, activeTool: 'select', selection: { startCol: 0, startRow: 0, endCol: 1, endRow: 1 } }
      const next = editorReducer(state, { type: 'SET_TOOL', tool: 'paint' })
      expect(next.selection).toBeNull()
    })

    it('should keep selection when switching to select', () => {
      let state = createInitialEditorState()
      state = { ...state, selection: { startCol: 0, startRow: 0, endCol: 1, endRow: 1 } }
      const next = editorReducer(state, { type: 'SET_TOOL', tool: 'select' })
      expect(next.selection).not.toBeNull()
    })
  })

  describe('DELETE_SELECTION', () => {
    it('should fill selection area with replacement tile', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      state = editorReducer(state, { type: 'PAINT_TILE', col: 0, row: 0 })
      state = editorReducer(state, { type: 'PAINT_TILE', col: 1, row: 0 })
      state = { ...state, selection: { startCol: 0, startRow: 0, endCol: 1, endRow: 0 } }
      const next = editorReducer(state, { type: 'DELETE_SELECTION', replacementTile: 'FL00' })
      expect(next.grid[0][0]).toBe('FL00')
      expect(next.grid[0][1]).toBe('FL00')
      expect(next.selection).toBeNull()
    })

    it('should do nothing when no selection', () => {
      const state = makeStateWithGrid()
      const next = editorReducer(state, { type: 'DELETE_SELECTION', replacementTile: 'FL00' })
      expect(next).toBe(state)
    })
  })

  describe('FILL_SELECTION', () => {
    it('should fill selection area with given tile', () => {
      let state = makeStateWithGrid()
      state = { ...state, selection: { startCol: 0, startRow: 0, endCol: 1, endRow: 1 } }
      const next = editorReducer(state, { type: 'FILL_SELECTION', tileCode: 'WL00' })
      expect(next.grid[0][0]).toBe('WL00')
      expect(next.grid[0][1]).toBe('WL00')
      expect(next.grid[1][0]).toBe('WL00')
      expect(next.grid[1][1]).toBe('WL00')
      expect(next.grid[2][2]).toBe('FL00') // outside selection
    })
  })

  describe('AUTO_BORDER', () => {
    it('should set border tiles to wall', () => {
      const state = makeStateWithGrid()
      const next = editorReducer(state, { type: 'AUTO_BORDER', wallTileCode: 'WL00' })
      expect(next.grid[0]).toEqual(['WL00', 'WL00', 'WL00'])
      expect(next.grid[2]).toEqual(['WL00', 'WL00', 'WL00'])
      expect(next.grid[1][0]).toBe('WL00')
      expect(next.grid[1][2]).toBe('WL00')
      expect(next.grid[1][1]).toBe('FL00')
    })

    it('should do nothing on empty grid', () => {
      const state = createInitialEditorState()
      const next = editorReducer(state, { type: 'AUTO_BORDER', wallTileCode: 'WL00' })
      expect(next).toBe(state)
    })
  })

  describe('AUTO_RANDOM_BORDER', () => {
    it('should set border tiles from provided codes', () => {
      const state = makeStateWithGrid()
      const next = editorReducer(state, { type: 'AUTO_RANDOM_BORDER', wallTileCodes: ['WL00'] })
      expect(next.grid[0]).toEqual(['WL00', 'WL00', 'WL00'])
      expect(next.grid[1][1]).toBe('FL00')
    })

    it('should do nothing with empty codes array', () => {
      const state = makeStateWithGrid()
      const next = editorReducer(state, { type: 'AUTO_RANDOM_BORDER', wallTileCodes: [] })
      expect(next).toBe(state)
    })
  })

  describe('MARK_SAVED', () => {
    it('should set isDirty to false', () => {
      let state = makeStateWithGrid()
      state = editorReducer(state, { type: 'SELECT_TILE_CODE', code: 'WL00' })
      state = editorReducer(state, { type: 'PAINT_TILE', col: 0, row: 0 })
      expect(state.isDirty).toBe(true)
      const next = editorReducer(state, { type: 'MARK_SAVED' })
      expect(next.isDirty).toBe(false)
    })
  })
})
