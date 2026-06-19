import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDiscussionsByFeed, getDiscussionsByCreated, type HivePost, type PaginationCursor } from '../lib/hiveApi'
import { useAppStore } from '../store/appStore'

interface FeedResult {
  posts: HivePost[]
  isLoading: boolean
  isError: boolean
  fetchNextPage(): Promise<void>
  hasMore: boolean
}

export function useFollowingFeed(): FeedResult {
  const username = useAppStore(s => s.user?.username ?? null)
  const [pages, setPages] = useState<HivePost[][]>([])

  const query = useQuery({
    queryKey: ['followingFeed', username],
    queryFn: async () => {
      const posts = await getDiscussionsByFeed(username!, 20, undefined)
      setPages([posts])
      return posts
    },
    enabled: !!username,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const allPosts = pages.flat()
  const lastPost = allPosts[allPosts.length - 1]

  async function fetchNextPage() {
    if (!username || !lastPost) return
    const nextCursor: PaginationCursor = { start_author: lastPost.author, start_permlink: lastPost.permlink }
    const more = await getDiscussionsByFeed(username, 20, nextCursor)
    setPages(prev => [...prev, more.slice(1)])
  }

  return {
    posts: query.data ? allPosts : [],
    isLoading: query.isLoading,
    isError: query.isError,
    fetchNextPage,
    hasMore: !!(lastPost && pages[pages.length - 1]?.length === 20),
  }
}

export function useTagFeed(tag: string | null): FeedResult {
  const [pages, setPages] = useState<HivePost[][]>([])

  const query = useQuery({
    queryKey: ['tagFeed', tag],
    queryFn: async () => {
      const posts = await getDiscussionsByCreated(tag!, 20)
      setPages([posts])
      return posts
    },
    enabled: !!tag,
    staleTime: 60_000,
  })

  const allPosts = pages.flat()
  const lastPost = allPosts[allPosts.length - 1]

  async function fetchNextPage() {
    if (!tag || !lastPost) return
    const nextCursor: PaginationCursor = { start_author: lastPost.author, start_permlink: lastPost.permlink }
    const more = await getDiscussionsByCreated(tag, 20, nextCursor)
    setPages(prev => [...prev, more.slice(1)])
  }

  return {
    posts: query.data ? allPosts : [],
    isLoading: query.isLoading,
    isError: query.isError,
    fetchNextPage,
    hasMore: !!(lastPost && pages[pages.length - 1]?.length === 20),
  }
}
