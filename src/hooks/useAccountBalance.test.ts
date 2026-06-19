import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAccountBalance } from './useAccountBalance'

const mockFetch = vi.fn()
beforeEach(() => vi.stubGlobal('fetch', mockFetch))
afterEach(() => vi.unstubAllGlobals())

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useAccountBalance', () => {
  it('returns null when username is null', () => {
    const { result } = renderHook(() => useAccountBalance(null), { wrapper: wrap() })
    expect(result.current).toBeNull()
  })

  it('returns balance string on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: [{ name: 'alice', balance: '5.000 HIVE' }] }),
    })
    const { result } = renderHook(() => useAccountBalance('alice'), { wrapper: wrap() })
    await waitFor(() => { expect(result.current).not.toBeNull() })
    expect(result.current).toBe('5.000 HIVE')
  })

  it('returns null silently on API error', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const { result } = renderHook(() => useAccountBalance('alice'), { wrapper: wrap() })
    await waitFor(() => !result.current)
    expect(result.current).toBeNull()
  })
})
