import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAccounts, getAccountHistory, getDiscussionsByBlog, getContentReplies } from './hiveApi'

const mockFetch = vi.fn()
beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function mockRpc(result: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ jsonrpc: '2.0', id: 1, result }),
  })
}

describe('getAccounts', () => {
  it('returns account array', async () => {
    mockRpc([{ name: 'alice', balance: '10.000 HIVE' }])
    const result = await getAccounts(['alice'])
    expect(result[0].name).toBe('alice')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('getAccountHistory', () => {
  it('returns history array', async () => {
    mockRpc([[0, { op: ['transfer', {}], timestamp: '2026-01-01T00:00:00' }]])
    const result = await getAccountHistory('alice')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('getDiscussionsByBlog', () => {
  it('fetches blog posts for a given author', async () => {
    mockRpc([{ author: 'peak.snaps', permlink: 'snaps-container-2026-06-19', title: 'Snaps Container' }])
    const result = await getDiscussionsByBlog('peak.snaps', 1)
    expect(result[0].author).toBe('peak.snaps')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ body: expect.stringContaining('get_discussions_by_blog') })
    )
  })
})

describe('getContentReplies', () => {
  it('fetches replies for a given post', async () => {
    mockRpc([{ author: 'user1', permlink: 're-peak-snaps-123', body: 'Hello snap!' }])
    const result = await getContentReplies('peak.snaps', 'snaps-container-2026-06-19')
    expect(result[0].author).toBe('user1')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ body: expect.stringContaining('get_content_replies') })
    )
  })
})
