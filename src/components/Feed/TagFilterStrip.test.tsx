import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagFilterStrip from './TagFilterStrip'

describe('TagFilterStrip', () => {
  it('renders default chips', () => {
    render(<TagFilterStrip activeTag={null} onTagChange={vi.fn()} />)
    expect(screen.getByText('Todos')).toBeTruthy()
    expect(screen.getByText('#hive-aquarium')).toBeTruthy()
    expect(screen.getByText('#photography')).toBeTruthy()
  })

  it('calls onTagChange with null when Todos is clicked', () => {
    const onChange = vi.fn()
    render(<TagFilterStrip activeTag="#art" onTagChange={onChange} />)
    fireEvent.click(screen.getByText('Todos'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('calls onTagChange with tag when chip is clicked', () => {
    const onChange = vi.fn()
    render(<TagFilterStrip activeTag={null} onTagChange={onChange} />)
    fireEvent.click(screen.getByText('#art'))
    expect(onChange).toHaveBeenCalledWith('art')
  })

  it('highlights activeTag chip', () => {
    render(<TagFilterStrip activeTag="art" onTagChange={vi.fn()} />)
    const artChip = screen.getByText('#art').closest('button')!
    expect(artChip.getAttribute('data-active')).toBe('true')
  })
})
