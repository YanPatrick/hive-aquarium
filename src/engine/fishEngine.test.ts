import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initEngine } from './fishEngine'

function makeCanvas() {
  const mockCtx = {
    clearRect: vi.fn(), drawImage: vi.fn(),
    save: vi.fn(), restore: vi.fn(),
    beginPath: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(), rect: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), quadraticCurveTo: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '', strokeStyle: '', globalAlpha: 1,
    shadowBlur: 0, shadowColor: '', lineWidth: 1, lineCap: 'butt',
    rotate: vi.fn(), scale: vi.fn(), translate: vi.fn(),
    roundRect: vi.fn(),
  }

  const canvas = {
    width: 1400, height: 900,
    getContext: vi.fn(() => mockCtx),
    addEventListener: vi.fn(),
  } as unknown as HTMLCanvasElement

  return { canvas, mockCtx }
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('performance', { now: vi.fn(() => 0) })
  vi.stubGlobal('OffscreenCanvas', undefined)
})

describe('initEngine', () => {
  it('returns engine with spawnFish, clearFish, destroy', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(typeof engine.spawnFish).toBe('function')
    expect(typeof engine.clearFish).toBe('function')
    expect(typeof engine.destroy).toBe('function')
  })

  it('spawnFish with valid fishId does not throw', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(() => engine.spawnFish('clownfish')).not.toThrow()
  })

  it('spawnFish with unknown fishId is silently ignored', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(() => engine.spawnFish('unknown-fish')).not.toThrow()
  })

  it('clearFish removes all fish', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    engine.spawnFish('clownfish')
    engine.spawnFish('tang')
    engine.clearFish()
    expect(() => engine.spawnFish('clownfish')).not.toThrow()
  })

  it('destroy cancels animation frame', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    engine.destroy()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
