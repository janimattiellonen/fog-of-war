import { parseTileConfig, parseMap, type TileConfig } from './mapParser'

const VALID_CONFIG = `
CLASSES
F:floor:false
W:wall:true

TILES
F00:floor:floor/dirt0.png
F01:floor:floor/dirt1.png
W00:wall:wall/brick0.png
`

const VALID_MAP = `
GRID
W00 W00 W00
W00 F00 W00
W00 W00 W00
`

const FULL_MAP = `
# A self-contained map with inline config
CLASSES
F:floor:false
W:wall:true

TILES
F00:floor:floor/dirt0.png
W00:wall:wall/brick0.png

GRID
W00 W00 W00
W00 F00 W00
W00 W00 W00
`

function makeConfig(): TileConfig {
  return parseTileConfig(VALID_CONFIG)
}

describe('parseTileConfig', () => {
  it('should parse classes', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.classes['F']).toEqual({ name: 'floor', solid: false })
    expect(config.classes['W']).toEqual({ name: 'wall', solid: true })
  })

  it('should parse tiles', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.tiles['F00']).toEqual({ code: 'F00', className: 'floor', image: 'floor/dirt0.png' })
    expect(config.tiles['W00']).toEqual({ code: 'W00', className: 'wall', image: 'wall/brick0.png' })
  })

  it('should parse multiple tile variants', () => {
    const config = parseTileConfig(VALID_CONFIG)
    expect(config.tiles['F01']).toEqual({ code: 'F01', className: 'floor', image: 'floor/dirt1.png' })
  })

  it('should skip comments and empty lines', () => {
    const text = `
# This is a comment
CLASSES
# Another comment
F:floor:false

TILES
F00:floor:floor/dirt0.png
`
    const config = parseTileConfig(text)
    expect(config.classes['F']).toEqual({ name: 'floor', solid: false })
    expect(config.tiles['F00']).toBeDefined()
  })

  it('should throw on invalid class definition', () => {
    const text = `
CLASSES
F:floor
`
    expect(() => parseTileConfig(text)).toThrow('Invalid class definition')
  })

  it('should throw on invalid tile definition', () => {
    const text = `
CLASSES
F:floor:false

TILES
F00:floor
`
    expect(() => parseTileConfig(text)).toThrow('Invalid tile definition')
  })

  it('should throw when tile references unknown class letter', () => {
    const text = `
CLASSES
F:floor:false

TILES
W00:wall:wall/brick0.png
`
    expect(() => parseTileConfig(text)).toThrow('unknown class letter "W"')
  })

  it('should throw when tile class name does not match class letter', () => {
    const text = `
CLASSES
F:floor:false

TILES
F00:wall:floor/dirt0.png
`
    expect(() => parseTileConfig(text)).toThrow("doesn't match class letter")
  })

  it('should return empty config for text with no sections', () => {
    const config = parseTileConfig('# just a comment')
    expect(Object.keys(config.classes)).toHaveLength(0)
    expect(Object.keys(config.tiles)).toHaveLength(0)
  })
})

describe('parseMap', () => {
  it('should parse a map with external config', () => {
    const config = makeConfig()
    const map = parseMap(VALID_MAP, config)
    expect(map.widthInTiles).toBe(3)
    expect(map.heightInTiles).toBe(3)
    expect(map.grid).toHaveLength(3)
    expect(map.grid[1][1]).toBe('F00')
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
    expect(map.classes['F']).toBeDefined()
    expect(map.tiles['F00']).toBeDefined()
  })

  it('should merge external config with inline config', () => {
    const config = makeConfig()
    const mapWithExtraTile = `
TILES
F02:floor:floor/dirt2.png

GRID
W00 F02 W00
`
    const map = parseMap(mapWithExtraTile, config)
    expect(map.tiles['F02']).toBeDefined()
    expect(map.tiles['F00']).toBeDefined()
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
W00 W00 W00
W00 F00
W00 W00 W00
`
    expect(() => parseMap(mapText, config)).toThrow('columns, expected 3')
  })

  it('should throw when grid references unknown tile code', () => {
    const config = makeConfig()
    const mapText = `
GRID
W00 X99 W00
`
    expect(() => parseMap(mapText, config)).toThrow('unknown tile "X99"')
  })

  it('should preserve all grid data exactly', () => {
    const config = makeConfig()
    const map = parseMap(VALID_MAP, config)
    expect(map.grid[0]).toEqual(['W00', 'W00', 'W00'])
    expect(map.grid[1]).toEqual(['W00', 'F00', 'W00'])
    expect(map.grid[2]).toEqual(['W00', 'W00', 'W00'])
  })
})
