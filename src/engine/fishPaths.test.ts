import { describe, it, expect, vi } from 'vitest'
import { FISH_DRAW_FNS } from './fishPaths'
import type { SpecialState } from './behaviors'

const defaultSpecial: SpecialState = {
  rotation: 0, scaleMultiplier: 1, glowExtra: 0, tentacleAlpha: 0.75, tentacleScaleY: 1,
}

function mockCtx() {
  return {
    save: vi.fn(), restore: vi.fn(),
    beginPath: vi.fn(), closePath: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    scale: vi.fn(), rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
  } as unknown as CanvasRenderingContext2D
}

const FISH_IDS = ['clownfish','tang','angelfish','pufferfish','jellyfish','seahorse','dragon']

FISH_IDS.forEach(id => {
  it(`${id} draw function exists and does not throw`, () => {
    expect(FISH_DRAW_FNS[id]).toBeDefined()
    const ctx = mockCtx()
    expect(() => FISH_DRAW_FNS[id](ctx, defaultSpecial)).not.toThrow()
  })

  it(`${id} calls ctx.save and ctx.restore`, () => {
    const ctx = mockCtx()
    FISH_DRAW_FNS[id](ctx, defaultSpecial)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })
})
