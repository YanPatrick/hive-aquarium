import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'
import { useAppStore } from '../../store/appStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('../../hooks/useOwnedFish', () => ({
  useOwnedFish: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('../../lib/hiveApi', () => ({
  getAccounts: vi.fn(() => Promise.resolve([])),
  getAccountHistory: vi.fn(() => Promise.resolve([])),
}))

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient()
  return render(createElement(QueryClientProvider, { client: qc }, ui))
}

describe('Header', () => {
  it('renders logo', () => {
    useAppStore.setState({ user: null, myFish: [] })
    wrap(<Header />)
    expect(screen.getByText(/Aquarium/i)).toBeTruthy()
  })

  it('shows user pill when logged in', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '5.000 HIVE' },
      myFish: [],
    })
    wrap(<Header />)
    expect(screen.getByText('@alice')).toBeTruthy()
  })

  it('calls logout when Sair is clicked', () => {
    const logout = vi.fn()
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '5.000 HIVE' },
      myFish: [],
      logout,
    })

    wrap(<Header />)
    fireEvent.click(screen.getByText('Sair'))
    expect(logout).toHaveBeenCalled()
  })
})
