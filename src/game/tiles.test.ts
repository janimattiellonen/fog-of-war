import { getTileCode, isSolid, getTileProperty, createTileMapFromParsed, type TileMap } from './tiles'
import { parseMap, parseTileConfig } from './mapParser'

const CONFIG_TEXT = `
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
WL00:wall:wall/brick0.png
`

const MAP_TEXT = `
GRID
WL00 WL00 WL00
WL00 FL00 WL00
WL00 WL00 WL00
`

function makeTileMap(): TileMap {
  const config = parseTileConfig(CONFIG_TEXT)
  const parsed = parseMap(MAP_TEXT, config)
  return createTileMapFromParsed(parsed)
}

describe('createTileMapFromParsed', () => {
  it('should create a TileMap from parsed map data', () => {
    const config = parseTileConfig(CONFIG_TEXT)
    const parsed = parseMap(MAP_TEXT, config)
    const tileMap = createTileMapFromParsed(parsed)
    expect(tileMap.width).toBe(3)
    expect(tileMap.height).toBe(3)
    expect(tileMap.grid).toBe(parsed.grid)
    expect(tileMap.map).toBe(parsed)
  })
})

describe('getTileCode', () => {
  it('should return tile code for valid coordinates', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, 1, 1)).toBe('FL00')
    expect(getTileCode(tileMap, 0, 0)).toBe('WL00')
  })

  it('should return null for negative column', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, -1, 0)).toBeNull()
  })

  it('should return null for negative row', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, 0, -1)).toBeNull()
  })

  it('should return null for column beyond width', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, 3, 0)).toBeNull()
  })

  it('should return null for row beyond height', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, 0, 3)).toBeNull()
  })

  it('should return tile at boundary (last valid position)', () => {
    const tileMap = makeTileMap()
    expect(getTileCode(tileMap, 2, 2)).toBe('WL00')
  })
})

describe('isSolid', () => {
  it('should return false for floor tiles', () => {
    const tileMap = makeTileMap()
    expect(isSolid(tileMap, 1, 1)).toBe(false)
  })

  it('should return true for wall tiles', () => {
    const tileMap = makeTileMap()
    expect(isSolid(tileMap, 0, 0)).toBe(true)
  })

  it('should return true for out-of-bounds coordinates (implicit wall)', () => {
    const tileMap = makeTileMap()
    expect(isSolid(tileMap, -1, 0)).toBe(true)
    expect(isSolid(tileMap, 0, -1)).toBe(true)
    expect(isSolid(tileMap, 3, 0)).toBe(true)
    expect(isSolid(tileMap, 0, 3)).toBe(true)
  })
})

const CONFIG_WITH_PROPS = `
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
FL01:floor:floor/dirt1.png
WL00:wall:wall/brick0.png

PROPERTIES
FL.speedModifier=0.5
FL01.damage=1.5
`

const MAP_WITH_PROPS = `
GRID
WL00 WL00 WL00
WL00 FL00 FL01
WL00 WL00 WL00
`

function makeTileMapWithProps(): TileMap {
  const config = parseTileConfig(CONFIG_WITH_PROPS)
  const parsed = parseMap(MAP_WITH_PROPS, config)
  return createTileMapFromParsed(parsed)
}

describe('getTileProperty', () => {
  it('should return class-level property', () => {
    const tileMap = makeTileMapWithProps()
    expect(getTileProperty(tileMap, 1, 1, 'speedModifier', 1.0)).toBe(0.5)
  })

  it('should return tile-level property', () => {
    const tileMap = makeTileMapWithProps()
    expect(getTileProperty(tileMap, 2, 1, 'damage', 0)).toBe(1.5)
  })

  it('should return default when property is not set', () => {
    const tileMap = makeTileMapWithProps()
    expect(getTileProperty(tileMap, 1, 1, 'damage', 0)).toBe(0)
  })

  it('should return default for out-of-bounds coordinates', () => {
    const tileMap = makeTileMapWithProps()
    expect(getTileProperty(tileMap, -1, 0, 'speedModifier', 1.0)).toBe(1.0)
  })

  it('should prefer tile-level over class-level property', () => {
    const config = parseTileConfig(`
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
FL.damage=1
FL00.damage=5
`)
    const parsed = parseMap(`
GRID
FL00
`, config)
    const tileMap = createTileMapFromParsed(parsed)
    expect(getTileProperty(tileMap, 0, 0, 'damage', 0)).toBe(5)
  })
})
