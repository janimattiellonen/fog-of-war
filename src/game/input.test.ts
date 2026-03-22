import { createInputState } from './input'

describe('createInputState', () => {
  it('should return zero movement when no keys are pressed', () => {
    const input = createInputState()
    const movement = input.getMovement()
    expect(movement.dx).toBe(0)
    expect(movement.dy).toBe(0)
  })

  it('should handle arrow key up', () => {
    const input = createInputState()
    input.keysDown.add('ArrowUp')
    expect(input.getMovement()).toEqual({ dx: 0, dy: -1 })
  })

  it('should handle arrow key down', () => {
    const input = createInputState()
    input.keysDown.add('ArrowDown')
    expect(input.getMovement()).toEqual({ dx: 0, dy: 1 })
  })

  it('should handle arrow key left', () => {
    const input = createInputState()
    input.keysDown.add('ArrowLeft')
    expect(input.getMovement()).toEqual({ dx: -1, dy: 0 })
  })

  it('should handle arrow key right', () => {
    const input = createInputState()
    input.keysDown.add('ArrowRight')
    expect(input.getMovement()).toEqual({ dx: 1, dy: 0 })
  })

  it('should handle WASD keys (lowercase)', () => {
    const input = createInputState()
    input.keysDown.add('w')
    expect(input.getMovement().dy).toBe(-1)

    input.keysDown.clear()
    input.keysDown.add('a')
    expect(input.getMovement().dx).toBe(-1)

    input.keysDown.clear()
    input.keysDown.add('s')
    expect(input.getMovement().dy).toBe(1)

    input.keysDown.clear()
    input.keysDown.add('d')
    expect(input.getMovement().dx).toBe(1)
  })

  it('should handle WASD keys (uppercase)', () => {
    const input = createInputState()
    input.keysDown.add('W')
    expect(input.getMovement().dy).toBe(-1)
  })

  it('should handle numpad keys', () => {
    const input = createInputState()
    input.keysDown.add('8')
    expect(input.getMovement()).toEqual({ dx: 0, dy: -1 })

    input.keysDown.clear()
    input.keysDown.add('4')
    expect(input.getMovement()).toEqual({ dx: -1, dy: 0 })

    input.keysDown.clear()
    input.keysDown.add('6')
    expect(input.getMovement()).toEqual({ dx: 1, dy: 0 })

    input.keysDown.clear()
    input.keysDown.add('2')
    expect(input.getMovement()).toEqual({ dx: 0, dy: 1 })
  })

  it('should normalize diagonal movement', () => {
    const input = createInputState()
    input.keysDown.add('ArrowUp')
    input.keysDown.add('ArrowRight')
    const movement = input.getMovement()
    const length = Math.sqrt(movement.dx * movement.dx + movement.dy * movement.dy)
    expect(length).toBeCloseTo(1, 5)
    expect(movement.dx).toBeGreaterThan(0)
    expect(movement.dy).toBeLessThan(0)
  })

  it('should cancel out opposing directions', () => {
    const input = createInputState()
    input.keysDown.add('ArrowUp')
    input.keysDown.add('ArrowDown')
    expect(input.getMovement()).toEqual({ dx: 0, dy: 0 })
  })

  it('should ignore unknown keys', () => {
    const input = createInputState()
    input.keysDown.add('z')
    input.keysDown.add('Enter')
    expect(input.getMovement()).toEqual({ dx: 0, dy: 0 })
  })
})
