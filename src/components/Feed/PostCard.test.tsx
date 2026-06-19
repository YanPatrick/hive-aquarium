import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostCard from './PostCard'
import type { HivePost } from '../../lib/hiveApi'

const POST: HivePost = {
  author: 'alice', permlink: 'my-post', title: 'Hello World',
  body: 'This is the **body** of the post with some content.',
  json_metadata: JSON.stringify({ image: ['https://example.com/img.jpg'] }),
  created: '2026-01-01T00:00:00',
  net_votes: 42, children: 5,
  pending_payout_value: '1.500 HBD',
}

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

  it('link points to peakd', () => {
    render(<PostCard post={POST} />)
    const link = document.querySelector('a')!
    expect(link.href).toContain('peakd.com/@alice/my-post')
  })

  it('strips markdown from body excerpt', () => {
    render(<PostCard post={POST} />)
    const excerpt = screen.getByText(/This is the/)
    expect(excerpt.textContent).not.toContain('**')
  })
})
