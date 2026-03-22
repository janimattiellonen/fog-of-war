import { serializeMap } from './mapSerializer'
import { parseMap, parseTileConfig } from '../game/mapParser'

describe('serializeMap', () => {
  it('should serialize a grid to map format', () => {
    const grid = [
      ['W00', 'W00', 'W00'],
      ['W00', 'F00', 'W00'],
      ['W00', 'W00', 'W00'],
    ]
    const result = serializeMap(grid)
    expect(result).toBe('GRID\nW00 W00 W00\nW00 F00 W00\nW00 W00 W00\n')
  })

  it('should start with GRID header', () => {
    const result = serializeMap([['F00']])
    expect(result.startsWith('GRID\n')).toBe(true)
  })

  it('should end with a newline', () => {
    const result = serializeMap([['F00']])
    expect(result.endsWith('\n')).toBe(true)
  })

  it('should handle single-cell grid', () => {
    const result = serializeMap([['F00']])
    expect(result).toBe('GRID\nF00\n')
  })

  it('should handle empty grid', () => {
    const result = serializeMap([])
    expect(result).toBe('GRID\n')
  })

  it('should round-trip through parseMap', () => {
    const config = parseTileConfig(`
CLASSES
F:floor:false
W:wall:true

TILES
F00:floor:floor/dirt0.png
W00:wall:wall/brick0.png
`)
    const originalGrid = [
      ['W00', 'W00', 'W00'],
      ['W00', 'F00', 'W00'],
      ['W00', 'W00', 'W00'],
    ]
    const serialized = serializeMap(originalGrid)
    const parsed = parseMap(serialized, config)
    expect(parsed.grid).toEqual(originalGrid)
  })
})
