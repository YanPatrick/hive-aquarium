import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeychain } from './useKeychain'
import { useAppStore } from '../store/appStore'

beforeEach(() => {
  useAppStore.setState({ user: null, myFish: [], activeTab: 'posts', activeTag: null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useKeychain', () => {
  it('sets error when keychain not found', async () => {
    vi.stubGlobal('hive_keychain', undefined)
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(result.current.error).toContain('Keychain')
  }, 7000)

  it('calls requestSignBuffer with correct args', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(requestSignBuffer).toHaveBeenCalledWith(
      'alice',
      expect.stringContaining('Login no Hive Aquarium'),
      'Posting',
      expect.any(Function)
    )
  })

  it('stores user in Zustand on success', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(useAppStore.getState().user?.username).toBe('alice')
  })

  it('sets error on keychain rejection', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: false, message: 'Rejeitado' }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(result.current.error).toContain('Rejeitado')
    expect(useAppStore.getState().user).toBeNull()
  })
})
