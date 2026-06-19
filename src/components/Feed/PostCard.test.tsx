import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PostCard from './PostCard'
import type { HivePost } from '../../lib/hiveApi'
import { useAppStore } from '../../store/appStore'

vi.mock('../../hooks/useInteractions', () => ({
  useInteractions: () => ({
    vote: vi.fn(),
    comment: vi.fn().mockResolvedValue(undefined),
    publishSnap: vi.fn(),
  }),
}))

const POST: HivePost = {
  author: 'alice', permlink: 'my-post', title: 'Hello World',
  body: 'This is the **body** of the post with some content.',
  json_metadata: JSON.stringify({ image: ['https://example.com/img.jpg'] }),
  created: '2026-01-01T00:00:00',
  net_votes: 42, children: 5,
  pending_payout_value: '1.500 HBD',
}

beforeEach(() => {
  useAppStore.setState({ user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' }, myFish: [], activeTab: 'posts', activeTag: null })
})

afterEach(() => { vi.clearAllMocks() })

describe('PostCard', () => {
  it('renders title', () => {
    render(<PostCard post={POST} />)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('renders author', () => {
    render(<PostCard post={POST} />)
    expect(screen.getByText('@alice')).toBeTruthy()
  })

  it('renders payout value', () => {
    render(<PostCard post={POST} />)
    expect(screen.getByText(/1\.500 HBD/)).toBeTruthy()
  })

  it('does not link to PeakD', () => {
    render(<PostCard post={POST} />)
    expect(document.querySelector('a[href*="peakd.com"]')).toBeNull()
  })

  it('strips markdown from body excerpt', () => {
    render(<PostCard post={POST} />)
    const excerpt = screen.getByText(/This is the/)
    expect(excerpt.textContent).not.toContain('**')
  })

  it('shows vote slider when upvote button is clicked', () => {
    render(<PostCard post={POST} />)
    const voteBtn = screen.getByText(/▲ 42/)
    fireEvent.click(voteBtn)
    expect(screen.getByRole('slider')).toBeTruthy()
  })

  it('shows comment textarea when comment button is clicked', () => {
    render(<PostCard post={POST} />)
    const commentBtn = screen.getByText(/💬 5/)
    fireEvent.click(commentBtn)
    expect(screen.getByPlaceholderText('Escreva um comentário...')).toBeTruthy()
  })
})
