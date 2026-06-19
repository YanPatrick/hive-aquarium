import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginOverlay from './LoginOverlay'
import { useAppStore } from '../../store/appStore'

vi.mock('../../hooks/useKeychain', () => ({
  useKeychain: vi.fn(() => ({ login: vi.fn(), isLoading: false, error: null })),
}))

beforeEach(() => { useAppStore.setState({ user: null, myFish: [], activeTab: 'posts', activeTag: null }) })

describe('LoginOverlay', () => {
  it('renders when user is not logged in', () => {
    render(<LoginOverlay />)
    expect(screen.getByText(/Entrar com Hive Keychain/i)).toBeTruthy()
  })

  it('is hidden when user is logged in', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [],
    })
    render(<LoginOverlay />)
    expect(screen.queryByText(/Entrar com Hive Keychain/i)).toBeFalsy()
  })

  it('calls login when button clicked', async () => {
    const mockLogin = vi.fn()
    const { useKeychain } = await import('../../hooks/useKeychain')
    vi.mocked(useKeychain).mockReturnValue({ login: mockLogin, isLoading: false, error: null })

    render(<LoginOverlay />)
    fireEvent.change(screen.getByPlaceholderText(/Seu usuário Hive/i), { target: { value: 'alice' } })
    fireEvent.click(screen.getByText(/Entrar com Hive Keychain/i))
    expect(mockLogin).toHaveBeenCalledWith('alice')
  })
})
