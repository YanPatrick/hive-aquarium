import { useFollowingFeed } from './useHiveFeed'
import type { HivePost } from '../lib/hiveApi'

function isSnap(post: HivePost): boolean {
  try {
    const meta = JSON.parse(post.json_metadata)
    return typeof meta.app === 'string' && meta.app.startsWith('snaps')
  } catch {
    return false
  }
}

export function useSnaps() {
  const feed = useFollowingFeed()
  return {
    ...feed,
    posts: feed.posts.filter(isSnap),
  }
}
