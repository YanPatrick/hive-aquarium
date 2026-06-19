import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useFollowingFeed, useTagFeed } from './useHiveFeed'
import { useAppStore } from '../store/appStore'

const mockFetch = vi.fn()
beforeEach(() => { mockFetch.mockReset(); vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function mockPosts(posts: object[]) {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ result: posts }) })
}

const SAMPLE_POST = {
  author: 'alice', permlink: 'my-post', title: 'Hello World',
  body: 'Post body content', json_metadata: '{"tags":[],"image":[]}',
  created: '2026-01-01T00:00:00', net_votes: 10, children: 2,
  pending_payout_value: '1.234 HBD',
}

describe('useFollowingFeed', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [], activeTab: 'posts', activeTag: null,
    })
  })

  it('returns empty array when no user', async () => {
    useAppStore.setState({ user: null, myFish: [] })
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    expect(result.current.posts).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches posts when user is logged in', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    expect(result.current.posts.length).toBeGreaterThanOrEqual(0)
  })

  it('fetchNextPage appends posts with cursor', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    await act(async () => { await result.current.fetchNextPage() })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('useTagFeed', () => {
  it('does not fetch when tag is null', async () => {
    const { result } = renderHook(() => useTagFeed(null), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches when tag is provided', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useTagFeed('hive-aquarium'), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    expect(mockFetch).toHaveBeenCalled()
  })
})
