import { useState, useEffect } from 'react'
import { getDiscussionsByBlog, getContentReplies } from '../lib/hiveApi'
import type { HivePost } from '../lib/hiveApi'

const PAGE_SIZE = 20

export function useSnaps() {
  const [allSnaps, setAllSnaps] = useState<HivePost[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [containerPermlink, setContainerPermlink] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setIsError(false)
      try {
        const containers = await getDiscussionsByBlog('peak.snaps', 1)
        if (cancelled || containers.length === 0) { setIsLoading(false); return }
        const container = containers[0]
        if (!cancelled) setContainerPermlink(container.permlink)
        const replies = await getContentReplies('peak.snaps', container.permlink)
        if (!cancelled) setAllSnaps(replies.slice().reverse())
      } catch {
        if (!cancelled) setIsError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const posts = allSnaps.slice(0, page * PAGE_SIZE)
  const hasMore = posts.length < allSnaps.length

  function fetchNextPage() {
    setPage(p => p + 1)
  }

  return { posts, isLoading, isError, fetchNextPage, hasMore, containerPermlink }
}
