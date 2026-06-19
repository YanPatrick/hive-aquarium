import { describe, it, expect } from 'vitest'
import { updateInstance, pickBehavior, createInstance } from './behaviors'
import type { Bounds } from './behaviors'

const BOUNDS: Bounds = { w: 1400, h: 900, floor: 783, ceil: 81, left: 14, right: 1358 }

describe('pickBehavior', () => {
  it('common fish never gets spiral or dash', () => {
    for (let i = 0; i < 50; i++) {
      const b = pickBehavior('common')
      expect(['cruise', 'wander', 'zigzag']).toContain(b)
    }
  })

  it('legendary fish can get any behavior', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(pickBehavior('legendary'))
    expect(seen.has('dash')).toBe(true)
    expect(seen.has('spiral')).toBe(true)
  })
})

describe('updateInstance — cruise', () => {
  it('moves fish horizontally each tick', () => {
    const f = createInstance('clownfish', 'common', 700, 400)
    f.behavior = 'cruise'
    const startX = f.x
    updateInstance(f, 1, BOUNDS)
    expect(f.x).not.toBe(startX)
  })
})

describe('updateInstance — bounds', () => {
  it('bounces fish off right wall', () => {
    const f = createInstance('clownfish', 'common', 1400, 400)
    f.vx = 5
    updateInstance(f, 1, BOUNDS)
    expect(f.vx).toBeLessThan(0)
    expect(f.x).toBeLessThanOrEqual(BOUNDS.right)
  })

  it('bounces fish off left wall', () => {
    const f = createInstance('clownfish', 'common', 0, 400)
    f.vx = -5
    updateInstance(f, 1, BOUNDS)
    expect(f.vx).toBeGreaterThan(0)
    expect(f.x).toBeGreaterThanOrEqual(BOUNDS.left)
  })

  it('bounces fish off floor', () => {
    const f = createInstance('clownfish', 'common', 700, 900)
    f.vy = 5
    updateInstance(f, 1, BOUNDS)
    expect(f.vy).toBeLessThan(0)
    expect(f.y).toBeLessThanOrEqual(BOUNDS.floor)
  })
})

describe('updateInstance — facing', () => {
  it('sets facing=1 when moving right', () => {
    const f = createInstance('clownfish', 'common', 400, 400)
    f.vx = 2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(1)
  })

  it('sets facing=-1 when moving left', () => {
    const f = createInstance('clownfish', 'common', 400, 400)
    f.vx = -2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(-1)
  })

  it('seahorse reverses facing logic', () => {
    const f = createInstance('seahorse', 'epic', 400, 400)
    f.vx = 2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(-1)
  })
})
