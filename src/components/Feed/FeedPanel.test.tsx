import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import FeedPanel from './FeedPanel'
import { useAppStore } from '../../store/appStore'

const EMPTY_FEED = { posts: [], isLoading: false, isError: false, fetchNextPage: vi.fn(), hasMore: false }
const FEED_WITH_POST = {
  ...EMPTY_FEED,
  posts: [{
    author: 'bob', permlink: 'a-post', title: 'Post de Teste',
    body: 'Conteúdo do post', json_metadata: '{}',
    created: '2026-01-01T00:00:00', net_votes: 5, children: 1,
    pending_payout_value: '0.100 HBD',
  }],
}

vi.mock('../../hooks/useHiveFeed', () => ({
  useFollowingFeed: vi.fn(() => EMPTY_FEED),
  useTagFeed: vi.fn(() => EMPTY_FEED),
}))
vi.mock('../../hooks/useSnaps', () => ({
  useSnaps: vi.fn(() => ({ ...EMPTY_FEED, containerPermlink: null })),
}))
vi.mock('../../hooks/useInteractions', () => ({
  useInteractions: () => ({
    vote: vi.fn(),
    comment: vi.fn(),
    publishSnap: vi.fn(),
  }),
}))

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient()
  return render(createElement(QueryClientProvider, { client: qc }, ui))
}

beforeEach(() => {
  useAppStore.setState({
    user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
    myFish: [], activeTab: 'posts', activeTag: null,
  })
})

describe('FeedPanel', () => {
  it('renders Posts and Snaps tabs', () => {
    wrap(<FeedPanel />)
    expect(screen.getByText('Posts')).toBeTruthy()
    expect(screen.getByText('Snaps')).toBeTruthy()
  })

  it('shows empty state when feed is empty', () => {
    wrap(<FeedPanel />)
    expect(screen.getByText(/Siga pessoas no Hive/i)).toBeTruthy()
  })

  it('switches to Snaps tab on click', () => {
    wrap(<FeedPanel />)
    fireEvent.click(screen.getByText('Snaps'))
    expect(useAppStore.getState().activeTab).toBe('snaps')
  })

  it('renders posts when feed returns data', async () => {
    const { useFollowingFeed } = await import('../../hooks/useHiveFeed')
    vi.mocked(useFollowingFeed).mockReturnValue(FEED_WITH_POST as ReturnType<typeof useFollowingFeed>)
    wrap(<FeedPanel />)
    expect(screen.getByText('Post de Teste')).toBeTruthy()
  })

  it('shows Load More button when hasMore is true', async () => {
    const { useFollowingFeed } = await import('../../hooks/useHiveFeed')
    vi.mocked(useFollowingFeed).mockReturnValue({ ...FEED_WITH_POST, hasMore: true } as ReturnType<typeof useFollowingFeed>)
    wrap(<FeedPanel />)
    expect(screen.getByText(/Carregar mais/i)).toBeTruthy()
  })

  it('is not visible when user is not logged in', () => {
    useAppStore.setState({ user: null, myFish: [] })
    const { container } = wrap(<FeedPanel />)
    expect(container.firstChild).toBeNull()
  })

  it('shows snaps compose area when on Snaps tab', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [], activeTab: 'snaps', activeTag: null,
    })
    wrap(<FeedPanel />)
    expect(screen.getByPlaceholderText(/O que está acontecendo/i)).toBeTruthy()
  })
})
