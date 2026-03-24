import { createPlayer, movePlayer } from './player'
import { createTileMapFromParsed, type TileMap } from './tiles'
import { parseMap, parseTileConfig } from './mapParser'
import { MOVE_SPEED } from './constants'

const CONFIG_TEXT = `
CLASSES
FL:floor:false
WL:wall:true

TILES
FL00:floor:floor/dirt0.png
WL00:wall:wall/brick0.png
`

function makeTileMap(mapText: string): TileMap {
  const config = parseTileConfig(CONFIG_TEXT)
  const parsed = parseMap(mapText, config)
  return createTileMapFromParsed(parsed)
}

const OPEN_MAP = `
GRID
WL00 WL00 WL00 WL00 WL00
WL00 FL00 FL00 FL00 WL00
WL00 FL00 FL00 FL00 WL00
WL00 FL00 FL00 FL00 WL00
WL00 WL00 WL00 WL00 WL00
`

const ALL_WALLS_EXCEPT_CORNER = `
GRID
WL00 WL00 WL00
WL00 WL00 FL00
WL00 WL00 WL00
`

describe('createPlayer', () => {
  it('should place player at center of map when center is not solid', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = createPlayer(tileMap.width * 32, tileMap.height * 32, tileMap)
    expect(player.x).toBe((5 * 32) / 2)
    expect(player.y).toBe((5 * 32) / 2)
  })

  it('should find a non-solid tile when center is solid', () => {
    const tileMap = makeTileMap(ALL_WALLS_EXCEPT_CORNER)
    const player = createPlayer(tileMap.width * 32, tileMap.height * 32, tileMap)
    const col = Math.floor(player.x / 32)
    const row = Math.floor(player.y / 32)
    const code = tileMap.grid[row][col]
    expect(code).toBe('FL00')
  })
})

describe('movePlayer', () => {
  it('should move player in open space', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = { x: 80, y: 80, hp: 100, maxHp: 100 }
    const moved = movePlayer(player, 1, 0, tileMap)
    expect(moved.x).toBe(80 + MOVE_SPEED)
    expect(moved.y).toBe(80)
  })

  it('should not move into a wall horizontally', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = { x: 32 + 1, y: 80, hp: 100, maxHp: 100 }
    const moved = movePlayer(player, -1, 0, tileMap)
    expect(moved.x).toBe(player.x)
  })

  it('should not move into a wall vertically', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = { x: 80, y: 32 + 1, hp: 100, maxHp: 100 }
    const moved = movePlayer(player, 0, -1, tileMap)
    expect(moved.y).toBe(player.y)
  })

  it('should resolve axes independently (slide along wall)', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = { x: 80, y: 45, hp: 100, maxHp: 100 }
    const moved = movePlayer(player, 1, -1, tileMap)
    expect(moved.x).toBeGreaterThan(player.x)
    expect(moved.y).toBe(player.y)
  })

  it('should not move when direction is zero', () => {
    const tileMap = makeTileMap(OPEN_MAP)
    const player = { x: 80, y: 80, hp: 100, maxHp: 100 }
    const moved = movePlayer(player, 0, 0, tileMap)
    expect(moved).toEqual(player)
  })
})
