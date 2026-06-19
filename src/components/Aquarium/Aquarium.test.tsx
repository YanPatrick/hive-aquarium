import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import Aquarium from './Aquarium'

vi.mock('../../engine/fishEngine', () => ({
  initEngine: vi.fn(() => ({
    spawnFish: vi.fn(),
    clearFish: vi.fn(),
    destroy: vi.fn(),
  })),
}))

vi.mock('../../store/appStore', () => ({
  useAppStore: vi.fn((sel: (s: { myFish: unknown[] }) => unknown) =>
    sel({ myFish: [] })
  ),
}))

describe('Aquarium', () => {
  it('renders a canvas element', () => {
    render(<Aquarium />)
    expect(document.querySelector('canvas')).toBeTruthy()
  })

  it('canvas has fixed positioning class', () => {
    render(<Aquarium />)
    const canvas = document.querySelector('canvas')!
    expect(canvas.className).toContain('fixed')
  })
})
