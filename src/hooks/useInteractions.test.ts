import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInteractions } from './useInteractions'
import { useAppStore } from '../store/appStore'
import { useToastStore } from '../components/common/Toast'

const LOGGED_IN_USER = { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' }

beforeEach(() => {
  useAppStore.setState({ user: LOGGED_IN_USER, myFish: [], activeTab: 'posts', activeTag: null })
  useToastStore.setState({ visible: false, title: '', body: '', isError: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('useInteractions.vote', () => {
  it('calls requestVote with correct args', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(requestVote).toHaveBeenCalledWith('alice', 'bob', 'my-post', 5000, expect.any(Function))
  })

  it('returns true on successful vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    let returnValue: boolean | undefined
    await act(async () => { returnValue = await result.current.vote('bob', 'my-post', 5000) })
    expect(returnValue).toBe(true)
  })

  it('returns false when Keychain rejects vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: false, message: 'Cancelado' }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    let returnValue: boolean | undefined
    await act(async () => { returnValue = await result.current.vote('bob', 'my-post', 5000) })
    expect(returnValue).toBe(false)
  })

  it('shows success toast after vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().visible).toBe(true)
    expect(useToastStore.getState().isError).toBe(false)
  })

  it('shows error toast when not logged in', async () => {
    useAppStore.setState({ user: null, myFish: [] })
    const { result } = renderHook(() => useInteractions())
    let returnValue: boolean | undefined
    await act(async () => { returnValue = await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().isError).toBe(true)
    expect(returnValue).toBe(false)
  })

  it('shows error toast when Keychain rejects vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: false, message: 'Cancelado' }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().isError).toBe(true)
  })
})

describe('useInteractions.comment', () => {
  it('calls requestBroadcast with comment operation', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.comment('bob', 'my-post', 'Great post!') })
    expect(requestBroadcast).toHaveBeenCalledWith(
      'alice',
      expect.arrayContaining([expect.arrayContaining(['comment'])]),
      'Posting',
      expect.any(Function)
    )
  })

  it('returns true on successful comment', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    let returnValue: boolean | undefined
    await act(async () => { returnValue = await result.current.comment('bob', 'my-post', 'Great post!') })
    expect(returnValue).toBe(true)
  })

  it('returns false when Keychain rejects comment', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: false, message: 'Cancelado' }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    let returnValue: boolean | undefined
    await act(async () => { returnValue = await result.current.comment('bob', 'my-post', 'Great post!') })
    expect(returnValue).toBe(false)
  })

  it('sets parent_author and parent_permlink correctly', async () => {
    const requestBroadcast = vi.fn((_u, ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.comment('bob', 'my-post', 'Hello!') })
    const op = requestBroadcast.mock.calls[0][1][0]
    expect(op[1].parent_author).toBe('bob')
    expect(op[1].parent_permlink).toBe('my-post')
    expect(op[1].body).toBe('Hello!')
  })
})

describe('useInteractions.publishSnap', () => {
  it('calls requestBroadcast with snaps app in json_metadata', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.publishSnap('snaps-container-123', 'My snap!') })
    const op = requestBroadcast.mock.calls[0][1][0]
    expect(op[1].parent_author).toBe('peak.snaps')
    expect(JSON.parse(op[1].json_metadata).app).toBe('snaps/1.0')
  })
})
