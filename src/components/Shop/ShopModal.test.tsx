import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShopModal from './ShopModal'
import { useAppStore } from '../../store/appStore'

vi.mock('../../lib/hivePrice', () => ({ fetchHivePrice: vi.fn(async () => 0.25) }))

beforeEach(() => {
  useAppStore.setState({
    user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '10.000 HIVE' },
    myFish: [], activeTab: 'posts', activeTag: null,
  })
  vi.unstubAllGlobals()
})

describe('ShopModal', () => {
  it('renders all 7 fish when open', () => {
    render(<ShopModal isOpen onClose={vi.fn()} />)
    expect(screen.getByText('Peixe-Palhaço')).toBeTruthy()
    expect(screen.getByText('Tang Azul')).toBeTruthy()
    expect(screen.getByText('Peixe-Dragão')).toBeTruthy()
  })

  it('does not render when isOpen is false', () => {
    render(<ShopModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Peixe-Palhaço')).toBeFalsy()
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ShopModal isOpen onClose={onClose} />)
    const overlay = container.querySelector('[data-overlay]')!
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows owned badge for already-owned fish', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [{ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' }],
      activeTab: 'posts', activeTag: null,
    })
    render(<ShopModal isOpen onClose={vi.fn()} />)
    expect(screen.getByText('✓ Seu')).toBeTruthy()
  })

  it('disables buy button for owned fish', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [{ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' }],
      activeTab: 'posts', activeTag: null,
    })
    render(<ShopModal isOpen onClose={vi.fn()} />)
    const clownfishCard = screen.getByText('Peixe-Palhaço').closest('[data-card]')!
    const btn = clownfishCard.querySelector('button')!
    expect(btn).toBeDisabled()
  })
})
