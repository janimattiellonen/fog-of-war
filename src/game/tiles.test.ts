import { getTileCode, isSolid, createTileMapFromParsed, type TileMap } from './tiles'
import { parseMap, parseTileConfig } from './mapParser'

const CONFIG_TEXT = `
CLASSES
F:floor:false
W:wall:true

TILES
F00:floor:floor/dirt0.png
W00:wall:wall/brick0.png
`

const MAP_TEXT = `
GRID
W00 W00 W00
W00 F00 W00
W00 W00 W00
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
    expect(getTileCode(tileMap, 1, 1)).toBe('F00')
    expect(getTileCode(tileMap, 0, 0)).toBe('W00')
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
    expect(getTileCode(tileMap, 2, 2)).toBe('W00')
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
