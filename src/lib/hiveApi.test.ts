import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAccounts, getAccountHistory } from './hiveApi'

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
