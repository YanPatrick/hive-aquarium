import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import App from './App'

vi.mock('./engine/fishEngine', () => ({
  initEngine: vi.fn(() => ({ spawnFish: vi.fn(), clearFish: vi.fn(), destroy: vi.fn() })),
}))
vi.mock('./hooks/useHiveFeed', () => ({
  useFollowingFeed: vi.fn(() => ({ posts: [], isLoading: false, isError: false, fetchNextPage: vi.fn(), hasMore: false })),
  useTagFeed: vi.fn(() => ({ posts: [], isLoading: false, isError: false, fetchNextPage: vi.fn(), hasMore: false })),
}))
vi.mock('./hooks/useSnaps', () => ({
  useSnaps: vi.fn(() => ({ posts: [], isLoading: false, isError: false, fetchNextPage: vi.fn(), hasMore: false })),
}))
vi.mock('./hooks/useOwnedFish', () => ({
  useOwnedFish: vi.fn(() => ({ data: undefined, isLoading: false })),
}))
vi.mock('./lib/hivePrice', () => ({ fetchHivePrice: vi.fn(async () => null) }))

describe('App', () => {
  it('renders without crashing', () => {
    const qc = new QueryClient()
    expect(() =>
      render(createElement(QueryClientProvider, { client: qc }, createElement(App)))
    ).not.toThrow()
  })

  it('renders login overlay when user is not logged in', () => {
    const qc = new QueryClient()
    const { container } = render(createElement(QueryClientProvider, { client: qc }, createElement(App)))
    expect(container.textContent).toContain('Entrar com Hive Keychain')
  })
})
