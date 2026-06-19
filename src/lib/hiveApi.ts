const HIVE_API = 'https://api.hive.blog'

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(HIVE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  })
  const data = await res.json()
  return data.result as T
}

export interface HiveAccount {
  name: string
  balance: string
  vesting_shares: string
}

export interface HivePost {
  author: string
  permlink: string
  title: string
  body: string
  json_metadata: string
  created: string
  net_votes: number
  children: number
  pending_payout_value: string
}

export interface HistoryEntry {
  op: [string, Record<string, unknown>]
  timestamp: string
}

export interface PaginationCursor {
  start_author: string
  start_permlink: string
}

export function getAccounts(usernames: string[]) {
  return rpc<HiveAccount[]>('condenser_api.get_accounts', [usernames])
}

export function getAccountHistory(username: string) {
  return rpc<[number, HistoryEntry][]>('condenser_api.get_account_history', [username, -1, 500])
}

export function getDiscussionsByFeed(
  username: string,
  limit = 20,
  cursor?: PaginationCursor
) {
  const params: Record<string, unknown> = { tag: username, limit }
  if (cursor) {
    params.start_author = cursor.start_author
    params.start_permlink = cursor.start_permlink
  }
  return rpc<HivePost[]>('condenser_api.get_discussions_by_feed', [params])
}

export function getDiscussionsByCreated(
  tag: string,
  limit = 20,
  cursor?: PaginationCursor
) {
  const params: Record<string, unknown> = { tag, limit }
  if (cursor) {
    params.start_author = cursor.start_author
    params.start_permlink = cursor.start_permlink
  }
  return rpc<HivePost[]>('condenser_api.get_discussions_by_created', [params])
}

export function getDiscussionsByBlog(author: string, limit = 10) {
  return rpc<HivePost[]>('condenser_api.get_discussions_by_blog', [{ tag: author, limit }])
}

export function getContentReplies(author: string, permlink: string) {
  return rpc<HivePost[]>('condenser_api.get_content_replies', [author, permlink])
}
