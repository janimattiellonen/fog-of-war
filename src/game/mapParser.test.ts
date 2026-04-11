import { parseTileConfig, parseMap, getClassPrefix, type TileConfig } from './mapParser'

const VALID_CONFIG = `
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
FL01:floor:floor/dirt1.png
WL00:wall:wall/brick0.png
`

const VALID_MAP = `
GRID
WL00 WL00 WL00
WL00 FL00 WL00
WL00 WL00 WL00
`

const FULL_MAP = `
# A self-contained map with inline config
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
WL00:wall:wall/brick0.png

GRID
WL00 WL00 WL00
WL00 FL00 WL00
WL00 WL00 WL00
`

function makeConfig(): TileConfig {
  return parseTileConfig(VALID_CONFIG)
}

describe('getClassPrefix', () => {
  it('should extract single-letter prefix', () => {
    expect(getClassPrefix('F00')).toBe('F')
  })

  it('should extract two-letter prefix', () => {
    expect(getClassPrefix('FL00')).toBe('FL')
  })

  it('should extract multi-letter prefix', () => {
    expect(getClassPrefix('ABC123')).toBe('ABC')
  })

  it('should return empty string for numeric-only code', () => {
    expect(getClassPrefix('123')).toBe('')
  })
})

describe('parseTileConfig', () => {
  it('should parse classes', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.classes['FL']).toEqual({ name: 'floor', solid: false })
    expect(config.classes['WL']).toEqual({ name: 'wall', solid: true })
  })

  it('should parse tiles', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.tiles['FL00']).toEqual({ code: 'FL00', className: 'floor', image: 'floor/dirt0.png' })
    expect(config.tiles['WL00']).toEqual({ code: 'WL00', className: 'wall', image: 'wall/brick0.png' })
  })

  it('should parse multiple tile variants', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.tiles['FL01']).toEqual({ code: 'FL01', className: 'floor', image: 'floor/dirt1.png' })
  })

  it('should skip comments and empty lines', () => {
    const text = `
# This is a comment
CLASSES
# Another comment
FL:floor:false

TILES
FL00:floor:floor/dirt0.png
`
    const config = parseTileConfig(text)
    expect(config.classes['FL']).toEqual({ name: 'floor', solid: false })
    expect(config.tiles['FL00']).toBeDefined()
  })

  it('should throw on invalid class definition', () => {
    const text = `
CLASSES
FL:floor
`
    expect(() => parseTileConfig(text)).toThrow('Invalid class definition')
  })

  it('should throw on invalid tile definition', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor
`
    expect(() => parseTileConfig(text)).toThrow('Invalid tile definition')
  })

  it('should throw when tile references unknown class', () => {
    const text = `
CLASSES
FL:floor:false

TILES
WL00:wall:wall/brick0.png
`
    expect(() => parseTileConfig(text)).toThrow('unknown class "WL"')
  })

  it('should throw when tile class name does not match class', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:wall:floor/dirt0.png
`
    expect(() => parseTileConfig(text)).toThrow("doesn't match class")
  })

  it('should return empty config for text with no sections', () => {
    const config = parseTileConfig('# just a comment')
    expect(Object.keys(config.classes)).toHaveLength(0)
    expect(Object.keys(config.tiles)).toHaveLength(0)
  })

  it('should parse class-level properties', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
FL.speedModifier=0.5
`
    const config = parseTileConfig(text)
    expect(config.classProperties['FL']).toEqual({ speedModifier: 0.5 })
  })

  it('should parse tile-level properties', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
FL00.damage=1.5
`
    const config = parseTileConfig(text)
    expect(config.tileProperties['FL00']).toEqual({ damage: 1.5 })
  })

  it('should parse multiple properties on same target', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
FL.speedModifier=0.3
FL.damage=2
`
    const config = parseTileConfig(text)
    expect(config.classProperties['FL']).toEqual({ speedModifier: 0.3, damage: 2 })
  })

  it('should throw on property with unknown target', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
X.speedModifier=0.5
`
    expect(() => parseTileConfig(text)).toThrow('not a known class or tile')
  })

  it('should throw on property with invalid value', () => {
    const text = `
CLASSES
FL:floor:false

TILES
FL00:floor:floor/dirt0.png

PROPERTIES
FL.speedModifier=abc
`
    expect(() => parseTileConfig(text)).toThrow('not a number')
  })

  it('should return empty properties when no PROPERTIES section', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.classProperties).toEqual({})
    expect(config.tileProperties).toEqual({})
  })
})

describe('parseMap', () => {
  it('should parse a map with external config', () => {
    const config = makeConfig()
    const map = parseMap(VALID_MAP, config)
    expect(map.widthInTiles).toBe(3)
    expect(map.heightInTiles).toBe(3)
    expect(map.grid).toHaveLength(3)
    expect(map.grid[1][1]).toBe('FL00')
  })

  it('should calculate pixel dimensions from tile dimensions', () => {
    const config = makeConfig()
    const map = parseMap(VALID_MAP, config)
    expect(map.widthInPixels).toBe(3 * 32)
    expect(map.heightInPixels).toBe(3 * 32)
  })

  it('should parse a self-contained map with inline config', () => {
    const map = parseMap(FULL_MAP)
    expect(map.widthInTiles).toBe(3)
    expect(map.classes['FL']).toBeDefined()
    expect(map.tiles['FL00']).toBeDefined()
  })

  it('should merge external config with inline config', () => {
    const config = makeConfig()
    const mapWithExtraTile = `
TILES
FL02:floor:floor/dirt2.png

GRID
WL00 FL02 WL00
`
    const map = parseMap(mapWithExtraTile, config)
    expect(map.tiles['FL02']).toBeDefined()
    expect(map.tiles['FL00']).toBeDefined()
  })

  it('should throw when grid is empty', () => {
    const config = makeConfig()
    expect(() => parseMap('GRID\n', config)).toThrow('Map has no grid data')
  })

  it('should throw when grid has no GRID section', () => {
    expect(() => parseMap('# no grid here')).toThrow('Map has no grid data')
  })

  it('should throw on inconsistent row lengths', () => {
    const config = makeConfig()
    const mapText = `
GRID
WL00 WL00 WL00
WL00 FL00
WL00 WL00 WL00
`
    expect(() => parseMap(mapText, config)).toThrow('columns, expected 3')
  })

  it('should throw when grid references unknown tile code', () => {
    const config = makeConfig()
    const mapText = `
GRID
WL00 X99 WL00
`
    expect(() => parseMap(mapText, config)).toThrow('unknown tile "X99"')
  })

  it('should preserve all grid data exactly', () => {
    const config = makeConfig()
    const map = parseMap(VALID_MAP, config)
    expect(map.grid[0]).toEqual(['WL00', 'WL00', 'WL00'])
    expect(map.grid[1]).toEqual(['WL00', 'FL00', 'WL00'])
    expect(map.grid[2]).toEqual(['WL00', 'WL00', 'WL00'])
  })
})
