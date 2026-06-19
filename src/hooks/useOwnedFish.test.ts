import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useOwnedFish } from './useOwnedFish'

const APP_ID = 'hive-aquarium/1.0'
const mockFetch = vi.fn()

beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function mockHistory(ops: Array<{ id: string; json: object }>) {
  const history = ops.map((op, i) => [
    i,
    {
      op: ['custom_json', { id: op.id, json: JSON.stringify(op.json) }],
      timestamp: `2026-01-0${i+1}T00:00:00`,
    },
  ])
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ result: history }) })
}

describe('useOwnedFish', () => {
  it('returns empty array when no fish ops found', async () => {
    mockHistory([])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('returns fish from add_fish ops', async () => {
    mockHistory([
      { id: APP_ID, json: { action: 'add_fish', fish_id: 'clownfish', fish_name: 'Peixe-Palhaço' } },
    ])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.length).toBe(1)
    expect(result.current.data?.[0].id).toBe('clownfish')
  })

  it('respects remove_fish ops', async () => {
    mockHistory([
      { id: APP_ID, json: { action: 'add_fish', fish_id: 'tang', fish_name: 'Tang Azul' } },
      { id: APP_ID, json: { action: 'remove_fish', fish_id: 'tang' } },
    ])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('returns undefined when username is null', async () => {
    const { result } = renderHook(() => useOwnedFish(null), { wrapper: makeWrapper() })
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
})
