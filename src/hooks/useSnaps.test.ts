import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSnaps } from './useSnaps'
import * as hiveApi from '../lib/hiveApi'

vi.mock('../lib/hiveApi', () => ({
  getDiscussionsByBlog: vi.fn(),
  getContentReplies: vi.fn(),
}))

const CONTAINER: hiveApi.HivePost = {
  author: 'peak.snaps', permlink: 'snaps-container-2026-06-19',
  title: 'Snaps Container', body: '', json_metadata: '{}',
  created: '2026-06-19T00:00:00', net_votes: 0, children: 2,
  pending_payout_value: '0.000 HBD',
}

const SNAP1: hiveApi.HivePost = {
  author: 'user1', permlink: 're-peak-snaps-1', title: '',
  body: 'Hello snap!', json_metadata: '{"app":"snaps/1.0"}',
  created: '2026-06-19T10:00:00', net_votes: 3, children: 0,
  pending_payout_value: '0.000 HBD',
}

beforeEach(() => {
  vi.mocked(hiveApi.getDiscussionsByBlog).mockResolvedValue([CONTAINER])
  vi.mocked(hiveApi.getContentReplies).mockResolvedValue([SNAP1])
})

afterEach(() => { vi.clearAllMocks() })

describe('useSnaps', () => {
  it('fetches container from peak.snaps then returns its replies', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(hiveApi.getDiscussionsByBlog).toHaveBeenCalledWith('peak.snaps', 1)
    expect(hiveApi.getContentReplies).toHaveBeenCalledWith('peak.snaps', 'snaps-container-2026-06-19')
    expect(result.current.posts).toHaveLength(1)
    expect(result.current.posts[0].author).toBe('user1')
  })

  it('exposes containerPermlink for publishing snaps', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.containerPermlink).toBe('snaps-container-2026-06-19')
  })

  it('sets isError when API throws', async () => {
    vi.mocked(hiveApi.getDiscussionsByBlog).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(true)
  })

  it('returns hasMore false when all snaps fit in first page', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })
})
