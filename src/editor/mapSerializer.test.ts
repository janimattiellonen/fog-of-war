import { serializeMap } from './mapSerializer'
import { parseMap, parseTileConfig } from '../game/mapParser'

describe('serializeMap', () => {
  it('should serialize a grid to map format', () => {
    const grid = [
      ['WL00', 'WL00', 'WL00'],
      ['WL00', 'FL00', 'WL00'],
      ['WL00', 'WL00', 'WL00'],
    ]
    const result = serializeMap(grid)
    expect(result).toBe('GRID\nWL00 WL00 WL00\nWL00 FL00 WL00\nWL00 WL00 WL00\n')
  })

  it('should start with GRID header', () => {
    const result = serializeMap([['FL00']])
    expect(result.startsWith('GRID\n')).toBe(true)
  })

  it('should end with a newline', () => {
    const result = serializeMap([['FL00']])
    expect(result.endsWith('\n')).toBe(true)
  })

  it('should handle single-cell grid', () => {
    const result = serializeMap([['FL00']])
    expect(result).toBe('GRID\nFL00\n')
  })

  it('should handle empty grid', () => {
    const result = serializeMap([])
    expect(result).toBe('GRID\n')
  })

  it('should round-trip through parseMap', () => {
    const config = parseTileConfig(`
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
WL00:wall:wall/brick0.png
`)
    const originalGrid = [
      ['WL00', 'WL00', 'WL00'],
      ['WL00', 'FL00', 'WL00'],
      ['WL00', 'WL00', 'WL00'],
    ]
    const serialized = serializeMap(originalGrid)
    const parsed = parseMap(serialized, config)
    expect(parsed.grid).toEqual(originalGrid)
  })
})
