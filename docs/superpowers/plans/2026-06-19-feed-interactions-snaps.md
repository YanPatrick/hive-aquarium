# Feed Interactions, Snaps & Aquarium Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace external PeakD links with native in-app voting/commenting, load real Snaps from @peak.snaps, and give FeedPanel an "underwater" visual style.

**Architecture:** `hiveApi.ts` gains two new RPC calls; `useSnaps` is rewritten to fetch @peak.snaps containers and replies; `useInteractions` (new) wraps Keychain requestVote/requestBroadcast with toast feedback; `VoteSlider` (new) handles weighted voting UI; PostCard and SnapCard gain inline vote/comment controls; FeedPanel gets CSS bubble animations and a Snaps compose textarea.

**Tech Stack:** React 18, TypeScript, Zustand, Vitest, @testing-library/react, Hive Keychain extension

## Global Constraints

- All user-facing strings in PT-BR
- Hive vote weight: slider 1–100 → Keychain weight 100–10000 (multiply by 100)
- Toast via `useToastStore.getState().show(title, body, isError?)` (imported from `src/components/common/Toast`)
- Keychain obtained via `waitForKeychain()` exported from `src/hooks/useKeychain.ts`
- Tests: vitest, `vi.stubGlobal` for globals, `renderHook` + `act` + `waitFor` for hooks, `render` + `screen` + `fireEvent` for components

---

## File Map

| File | Action |
|---|---|
| `src/lib/hiveApi.ts` | Modify — add `getDiscussionsByBlog`, `getContentReplies` |
| `src/lib/hiveApi.test.ts` | Modify — add tests for new API functions |
| `src/hooks/useKeychain.ts` | Modify — export `waitForKeychain`, add `requestVote` + `requestBroadcast` to Window type |
| `src/hooks/useSnaps.ts` | Rewrite — fetch from @peak.snaps containers |
| `src/hooks/useSnaps.test.ts` | Create — tests for new useSnaps |
| `src/hooks/useInteractions.ts` | Create — vote, comment, publishSnap |
| `src/hooks/useInteractions.test.ts` | Create — tests for useInteractions |
| `src/components/Feed/VoteSlider.tsx` | Create — slider component for vote weight |
| `src/components/Feed/PostCard.tsx` | Modify — remove PeakD link, add VoteSlider + inline comment |
| `src/components/Feed/PostCard.test.tsx` | Modify — update tests (no more PeakD link) |
| `src/components/Feed/SnapCard.tsx` | Modify — remove PeakD link, add VoteSlider + inline comment |
| `src/components/Feed/FeedPanel.tsx` | Modify — visual aquático + Snaps compose area |
| `src/components/Feed/FeedPanel.test.tsx` | Modify — update useSnaps mock shape |

---

### Task 1: hiveApi.ts — getDiscussionsByBlog and getContentReplies

**Files:**
- Modify: `src/lib/hiveApi.ts`
- Modify: `src/lib/hiveApi.test.ts`

**Interfaces:**
- Produces: `getDiscussionsByBlog(author: string, limit?: number): Promise<HivePost[]>`
- Produces: `getContentReplies(author: string, permlink: string): Promise<HivePost[]>`

- [ ] **Step 1: Write failing tests**

Add to the bottom of `src/lib/hiveApi.test.ts`:

```ts
import { getDiscussionsByBlog, getContentReplies } from './hiveApi'

describe('getDiscussionsByBlog', () => {
  it('fetches blog posts for a given author', async () => {
    mockRpc([{ author: 'peak.snaps', permlink: 'snaps-container-2026-06-19', title: 'Snaps Container' }])
    const result = await getDiscussionsByBlog('peak.snaps', 1)
    expect(result[0].author).toBe('peak.snaps')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ body: expect.stringContaining('get_discussions_by_blog') })
    )
  })
})

describe('getContentReplies', () => {
  it('fetches replies for a given post', async () => {
    mockRpc([{ author: 'user1', permlink: 're-peak-snaps-123', body: 'Hello snap!' }])
    const result = await getContentReplies('peak.snaps', 'snaps-container-2026-06-19')
    expect(result[0].author).toBe('user1')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ body: expect.stringContaining('get_content_replies') })
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npx vitest run src/lib/hiveApi.test.ts
```
Expected: FAIL — `getDiscussionsByBlog is not exported`

- [ ] **Step 3: Add functions to hiveApi.ts**

Append to `src/lib/hiveApi.ts`:

```ts
export function getDiscussionsByBlog(author: string, limit = 10) {
  return rpc<HivePost[]>('condenser_api.get_discussions_by_blog', [{ tag: author, limit }])
}

export function getContentReplies(author: string, permlink: string) {
  return rpc<HivePost[]>('condenser_api.get_content_replies', [author, permlink])
}
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run src/lib/hiveApi.test.ts
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/hiveApi.ts src/lib/hiveApi.test.ts
git commit -m "feat: add getDiscussionsByBlog and getContentReplies to hiveApi"
```

---

### Task 2: useKeychain.ts — export waitForKeychain, add Keychain type declarations

**Files:**
- Modify: `src/hooks/useKeychain.ts`

**Interfaces:**
- Produces: `export function waitForKeychain(timeout?: number): Promise<NonNullable<Window['hive_keychain']>>`
- Produces: `Window['hive_keychain']` type gains `requestVote` and `requestBroadcast`

- [ ] **Step 1: Update Window type declaration and export waitForKeychain**

In `src/hooks/useKeychain.ts`, replace the `declare global` block with:

```ts
declare global {
  interface Window {
    hive_keychain?: {
      requestSignBuffer(
        username: string,
        message: string,
        role: string,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
      requestTransfer(
        username: string,
        to: string,
        amount: string,
        memo: string,
        currency: string,
        callback: (response: { success: boolean; message?: string; result?: { id?: string } }) => void
      ): void
      requestCustomJson(
        username: string,
        id: string,
        role: string,
        json: string,
        displayTitle: string,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
      requestVote(
        username: string,
        author: string,
        permlink: string,
        weight: number,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
      requestBroadcast(
        username: string,
        operations: unknown[][],
        key: string,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
    }
  }
}
```

Then change `function waitForKeychain` to `export function waitForKeychain`.

- [ ] **Step 2: Run existing keychain tests to confirm nothing broke**

```
npx vitest run src/hooks/useKeychain.test.ts
```
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useKeychain.ts
git commit -m "feat: export waitForKeychain and add requestVote/requestBroadcast types"
```

---

### Task 3: useSnaps.ts — rewrite to fetch from @peak.snaps

**Files:**
- Rewrite: `src/hooks/useSnaps.ts`
- Create: `src/hooks/useSnaps.test.ts`

**Interfaces:**
- Consumes: `getDiscussionsByBlog` from Task 1, `getContentReplies` from Task 1
- Produces: `useSnaps(): { posts: HivePost[], isLoading: boolean, isError: boolean, fetchNextPage(): void, hasMore: boolean, containerPermlink: string | null }`

- [ ] **Step 1: Create test file**

Create `src/hooks/useSnaps.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSnaps } from './useSnaps'
import * as hiveApi from '../lib/hiveApi'

vi.mock('../lib/hiveApi', () => ({
  getDiscussionsByBlog: vi.fn(),
  getContentReplies: vi.fn(),
}))

const CONTAINER: hiveApi.HivePost = {
  author: 'peak.snaps', permlink: 'snaps-container-2026-06-19',
  title: 'Snaps Container', body: '', json_metadata: '{}',
  created: '2026-06-19T00:00:00', net_votes: 0, children: 2,
  pending_payout_value: '0.000 HBD',
}

const SNAP1: hiveApi.HivePost = {
  author: 'user1', permlink: 're-peak-snaps-1', title: '',
  body: 'Hello snap!', json_metadata: '{"app":"snaps/1.0"}',
  created: '2026-06-19T10:00:00', net_votes: 3, children: 0,
  pending_payout_value: '0.000 HBD',
}

beforeEach(() => {
  vi.mocked(hiveApi.getDiscussionsByBlog).mockResolvedValue([CONTAINER])
  vi.mocked(hiveApi.getContentReplies).mockResolvedValue([SNAP1])
})

afterEach(() => { vi.clearAllMocks() })

describe('useSnaps', () => {
  it('fetches container from peak.snaps then returns its replies', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(hiveApi.getDiscussionsByBlog).toHaveBeenCalledWith('peak.snaps', 1)
    expect(hiveApi.getContentReplies).toHaveBeenCalledWith('peak.snaps', 'snaps-container-2026-06-19')
    expect(result.current.posts).toHaveLength(1)
    expect(result.current.posts[0].author).toBe('user1')
  })

  it('exposes containerPermlink for publishing snaps', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.containerPermlink).toBe('snaps-container-2026-06-19')
  })

  it('sets isError when API throws', async () => {
    vi.mocked(hiveApi.getDiscussionsByBlog).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(true)
  })

  it('returns hasMore false when all snaps fit in first page', async () => {
    const { result } = renderHook(() => useSnaps())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npx vitest run src/hooks/useSnaps.test.ts
```
Expected: FAIL — old useSnaps does not call getDiscussionsByBlog

- [ ] **Step 3: Rewrite useSnaps.ts**

Replace the entire contents of `src/hooks/useSnaps.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run src/hooks/useSnaps.test.ts
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSnaps.ts src/hooks/useSnaps.test.ts
git commit -m "feat: rewrite useSnaps to fetch from @peak.snaps container replies"
```

---

### Task 4: useInteractions.ts — vote, comment, publishSnap

**Files:**
- Create: `src/hooks/useInteractions.ts`
- Create: `src/hooks/useInteractions.test.ts`

**Interfaces:**
- Consumes: `waitForKeychain` from `src/hooks/useKeychain.ts` (Task 2), `useToastStore` from `src/components/common/Toast`, `useAppStore` from `src/store/appStore`
- Produces:
  - `vote(author: string, permlink: string, weight: number): Promise<void>` — weight is 100–10000
  - `comment(parentAuthor: string, parentPermlink: string, body: string): Promise<void>`
  - `publishSnap(containerPermlink: string, body: string): Promise<void>`

- [ ] **Step 1: Create test file**

Create `src/hooks/useInteractions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInteractions } from './useInteractions'
import { useAppStore } from '../store/appStore'
import { useToastStore } from '../components/common/Toast'

const LOGGED_IN_USER = { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' }

beforeEach(() => {
  useAppStore.setState({ user: LOGGED_IN_USER, myFish: [], activeTab: 'posts', activeTag: null })
  useToastStore.setState({ visible: false, title: '', body: '', isError: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('useInteractions.vote', () => {
  it('calls requestVote with correct args', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(requestVote).toHaveBeenCalledWith('alice', 'bob', 'my-post', 5000, expect.any(Function))
  })

  it('shows success toast after vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().visible).toBe(true)
    expect(useToastStore.getState().isError).toBe(false)
  })

  it('shows error toast when not logged in', async () => {
    useAppStore.setState({ user: null, myFish: [] })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().isError).toBe(true)
  })

  it('shows error toast when Keychain rejects vote', async () => {
    const requestVote = vi.fn((_u, _a, _p, _w, cb) => cb({ success: false, message: 'Cancelado' }))
    vi.stubGlobal('hive_keychain', { requestVote, requestBroadcast: vi.fn() })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.vote('bob', 'my-post', 5000) })
    expect(useToastStore.getState().isError).toBe(true)
  })
})

describe('useInteractions.comment', () => {
  it('calls requestBroadcast with comment operation', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.comment('bob', 'my-post', 'Great post!') })
    expect(requestBroadcast).toHaveBeenCalledWith(
      'alice',
      expect.arrayContaining([expect.arrayContaining(['comment'])]),
      'Posting',
      expect.any(Function)
    )
  })

  it('sets parent_author and parent_permlink correctly', async () => {
    const requestBroadcast = vi.fn((_u, ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.comment('bob', 'my-post', 'Hello!') })
    const op = requestBroadcast.mock.calls[0][1][0]
    expect(op[1].parent_author).toBe('bob')
    expect(op[1].parent_permlink).toBe('my-post')
    expect(op[1].body).toBe('Hello!')
  })
})

describe('useInteractions.publishSnap', () => {
  it('calls requestBroadcast with snaps app in json_metadata', async () => {
    const requestBroadcast = vi.fn((_u, _ops, _k, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestVote: vi.fn(), requestBroadcast })
    const { result } = renderHook(() => useInteractions())
    await act(async () => { await result.current.publishSnap('snaps-container-123', 'My snap!') })
    const op = requestBroadcast.mock.calls[0][1][0]
    expect(op[1].parent_author).toBe('peak.snaps')
    expect(JSON.parse(op[1].json_metadata).app).toBe('snaps/1.0')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npx vitest run src/hooks/useInteractions.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Create useInteractions.ts**

Create `src/hooks/useInteractions.ts`:

```ts
import { useAppStore } from '../store/appStore'
import { useToastStore } from '../components/common/Toast'
import { waitForKeychain } from './useKeychain'

export function useInteractions() {
  const user = useAppStore(s => s.user)

  async function getKeychain() {
    try {
      return await waitForKeychain()
    } catch {
      useToastStore.getState().show('Keychain não encontrado', 'Instale a extensão Hive Keychain.', true)
      return null
    }
  }

  async function vote(author: string, permlink: string, weight: number) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    await new Promise<void>((resolve) => {
      keychain.requestVote(user.username, author, permlink, weight, (res) => {
        if (res.success) useToastStore.getState().show('Voto registrado!', `+1 em @${author}`)
        else useToastStore.getState().show('Erro ao votar', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  async function comment(parentAuthor: string, parentPermlink: string, body: string) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    const permlink = `re-${parentAuthor.replace(/\./g, '-')}-${Date.now()}`
    const op = ['comment', {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author: user.username,
      permlink,
      title: '',
      body,
      json_metadata: JSON.stringify({ app: 'hive-aquarium/1.0' }),
    }]
    await new Promise<void>((resolve) => {
      keychain.requestBroadcast(user.username, [op], 'Posting', (res) => {
        if (res.success) useToastStore.getState().show('Comentário publicado!', '')
        else useToastStore.getState().show('Erro ao comentar', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  async function publishSnap(containerPermlink: string, body: string) {
    if (!user) {
      useToastStore.getState().show('Login necessário', 'Faça login para interagir.', true)
      return
    }
    const keychain = await getKeychain()
    if (!keychain) return
    const permlink = `re-peak-snaps-${Date.now()}`
    const op = ['comment', {
      parent_author: 'peak.snaps',
      parent_permlink: containerPermlink,
      author: user.username,
      permlink,
      title: '',
      body,
      json_metadata: JSON.stringify({ app: 'snaps/1.0', tags: [] }),
    }]
    await new Promise<void>((resolve) => {
      keychain.requestBroadcast(user.username, [op], 'Posting', (res) => {
        if (res.success) useToastStore.getState().show('Snap publicado!', '')
        else useToastStore.getState().show('Erro ao publicar snap', res.message ?? 'Tente novamente.', true)
        resolve()
      })
    })
  }

  return { vote, comment, publishSnap }
}
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run src/hooks/useInteractions.test.ts
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useInteractions.ts src/hooks/useInteractions.test.ts
git commit -m "feat: useInteractions hook — vote, comment, publishSnap via Keychain"
```

---

### Task 5: VoteSlider component

**Files:**
- Create: `src/components/Feed/VoteSlider.tsx`

**Interfaces:**
- Consumes: `useInteractions` from Task 4
- Produces: `<VoteSlider author post permlink onClose onVoted />` — renders slider + Votar + × buttons

- [ ] **Step 1: Create VoteSlider.tsx**

Create `src/components/Feed/VoteSlider.tsx`:

```tsx
import { useState } from 'react'
import { useInteractions } from '../../hooks/useInteractions'

interface Props {
  author: string
  permlink: string
  onClose(): void
  onVoted(): void
}

export default function VoteSlider({ author, permlink, onClose, onVoted }: Props) {
  const [weight, setWeight] = useState(100)
  const [voting, setVoting] = useState(false)
  const { vote } = useInteractions()

  async function handleVote() {
    setVoting(true)
    await vote(author, permlink, weight * 100)
    setVoting(false)
    onVoted()
    onClose()
  }

  return (
    <div
      style={{
        marginTop: 8,
        padding: '10px 12px',
        background: 'rgba(0,30,70,0.7)',
        border: '1px solid rgba(0,200,220,0.2)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <input
        type="range"
        min={1}
        max={100}
        value={weight}
        onChange={e => setWeight(Number(e.target.value))}
        disabled={voting}
        style={{ flex: 1, accentColor: 'var(--glow)', cursor: voting ? 'wait' : 'pointer' }}
      />
      <span style={{ fontSize: '0.75rem', color: 'var(--glow)', minWidth: 36, textAlign: 'right' }}>
        {weight}%
      </span>
      <button
        onClick={handleVote}
        disabled={voting}
        style={{
          padding: '4px 12px',
          background: 'rgba(0,180,220,0.2)',
          border: '1px solid var(--glow)',
          borderRadius: 8,
          color: 'var(--glow)',
          fontSize: '0.78rem',
          cursor: voting ? 'wait' : 'pointer',
          fontFamily: 'Raleway, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        {voting ? 'Votando...' : 'Votar'}
      </button>
      <button
        onClick={onClose}
        disabled={voting}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          fontSize: '1.1rem',
          padding: '0 2px',
          lineHeight: 1,
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite to confirm no regressions**

```
npx vitest run
```
Expected: all existing tests PASS, no new failures

- [ ] **Step 3: Commit**

```bash
git add src/components/Feed/VoteSlider.tsx
git commit -m "feat: VoteSlider component with 1-100 weight slider"
```

---

### Task 6: PostCard — remove PeakD link, add VoteSlider and inline comment

**Files:**
- Modify: `src/components/Feed/PostCard.tsx`
- Modify: `src/components/Feed/PostCard.test.tsx`

**Interfaces:**
- Consumes: `VoteSlider` from Task 5, `useInteractions` from Task 4

- [ ] **Step 1: Update PostCard.test.tsx**

Replace the entire contents of `src/components/Feed/PostCard.test.tsx`:

```ts
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
```

- [ ] **Step 2: Run tests to see which fail**

```
npx vitest run src/components/Feed/PostCard.test.tsx
```
Expected: "does not link to PeakD" and interaction tests FAIL; others PASS

- [ ] **Step 3: Rewrite PostCard.tsx**

Replace the entire contents of `src/components/Feed/PostCard.tsx`:

```tsx
import { useState } from 'react'
import type { HivePost } from '../../lib/hiveApi'
import VoteSlider from './VoteSlider'
import { useInteractions } from '../../hooks/useInteractions'

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/>\s?.+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

interface Props { post: HivePost }

export default function PostCard({ post }: Props) {
  const [showVote, setShowVote] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [votes, setVotes] = useState(post.net_votes)
  const [commentCount, setCommentCount] = useState(post.children)
  const [voted, setVoted] = useState(false)
  const [sending, setSending] = useState(false)
  const { comment } = useInteractions()

  let thumbnail = ''
  try {
    const meta = JSON.parse(post.json_metadata)
    thumbnail = meta.image?.[0] ?? ''
  } catch {}

  const excerpt = stripMarkdown(post.body).slice(0, 180)
  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`

  async function handleComment() {
    if (!commentBody.trim()) return
    setSending(true)
    await comment(post.author, post.permlink, commentBody)
    setSending(false)
    setCommentBody('')
    setShowComment(false)
    setCommentCount(c => c + 1)
  }

  return (
    <div
      style={{
        background: 'rgba(0,25,60,0.55)',
        border: '1px solid rgba(0,200,220,0.12)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,220,0.12)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--glow)', fontWeight: 500 }}>@{post.author}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.3, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {post.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {excerpt}
          </div>
        </div>
        {thumbnail && (
          <img src={thumbnail} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={() => { setShowVote(v => !v); setShowComment(false) }}
          disabled={voted}
          style={{
            background: 'none', border: 'none', cursor: voted ? 'default' : 'pointer',
            color: voted ? 'var(--glow)' : 'var(--text-dim)',
            fontSize: '0.75rem', fontFamily: 'inherit', padding: 0,
          }}
        >
          ▲ {votes}
        </button>
        <button
          onClick={() => { setShowComment(c => !c); setShowVote(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}
        >
          💬 {commentCount}
        </button>
        <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>{post.pending_payout_value}</span>
      </div>

      {showVote && (
        <VoteSlider
          author={post.author}
          permlink={post.permlink}
          onClose={() => setShowVote(false)}
          onVoted={() => { setVotes(v => v + 1); setVoted(true) }}
        />
      )}

      {showComment && (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,30,70,0.7)',
              border: '1px solid rgba(0,200,220,0.2)',
              borderRadius: 8,
              color: 'var(--text)',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '0.82rem',
              padding: '8px 10px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowComment(false); setCommentBody('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleComment}
              disabled={sending || !commentBody.trim()}
              style={{
                padding: '4px 14px',
                background: 'rgba(0,180,220,0.2)',
                border: '1px solid var(--glow)',
                borderRadius: 8,
                color: 'var(--glow)',
                fontSize: '0.78rem',
                cursor: sending ? 'wait' : 'pointer',
                fontFamily: 'Raleway, sans-serif',
              }}
            >
              {sending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run src/components/Feed/PostCard.test.tsx
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Feed/PostCard.tsx src/components/Feed/PostCard.test.tsx
git commit -m "feat: PostCard with inline vote slider and comment — remove PeakD link"
```

---

### Task 7: SnapCard — remove PeakD link, add VoteSlider and inline comment

**Files:**
- Modify: `src/components/Feed/SnapCard.tsx`

**Interfaces:**
- Consumes: `VoteSlider` from Task 5, `useInteractions` from Task 4

- [ ] **Step 1: Rewrite SnapCard.tsx**

Replace the entire contents of `src/components/Feed/SnapCard.tsx`:

```tsx
import { useState } from 'react'
import type { HivePost } from '../../lib/hiveApi'
import VoteSlider from './VoteSlider'
import { useInteractions } from '../../hooks/useInteractions'

interface Props { post: HivePost }

export default function SnapCard({ post }: Props) {
  const [showVote, setShowVote] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [votes, setVotes] = useState(post.net_votes)
  const [voted, setVoted] = useState(false)
  const [sending, setSending] = useState(false)
  const { comment } = useInteractions()

  let image = ''
  try { image = JSON.parse(post.json_metadata).image?.[0] ?? '' } catch {}

  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`

  async function handleComment() {
    if (!commentBody.trim()) return
    setSending(true)
    await comment(post.author, post.permlink, commentBody)
    setSending(false)
    setCommentBody('')
    setShowComment(false)
  }

  return (
    <div
      style={{
        background: 'rgba(0,25,60,0.55)',
        border: '1px solid rgba(0,200,220,0.12)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,220,0.12)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--glow)' }}>@{post.author}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: image ? 8 : 0 }}>
        {post.body.slice(0, 280)}
      </p>

      {image && (
        <img
          src={image}
          alt=""
          style={{ width: '100%', borderRadius: 8, marginTop: 4, maxHeight: 200, objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.72rem', alignItems: 'center' }}>
        <button
          onClick={() => { setShowVote(v => !v); setShowComment(false) }}
          disabled={voted}
          style={{
            background: 'none', border: 'none', cursor: voted ? 'default' : 'pointer',
            color: voted ? 'var(--glow)' : 'var(--text-dim)',
            fontSize: '0.72rem', fontFamily: 'inherit', padding: 0,
          }}
        >
          ▲ {votes}
        </button>
        <button
          onClick={() => { setShowComment(c => !c); setShowVote(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.72rem', fontFamily: 'inherit', padding: 0 }}
        >
          💬
        </button>
      </div>

      {showVote && (
        <VoteSlider
          author={post.author}
          permlink={post.permlink}
          onClose={() => setShowVote(false)}
          onVoted={() => { setVotes(v => v + 1); setVoted(true) }}
        />
      )}

      {showComment && (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,30,70,0.7)',
              border: '1px solid rgba(0,200,220,0.2)',
              borderRadius: 8,
              color: 'var(--text)',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '0.82rem',
              padding: '8px 10px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowComment(false); setCommentBody('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleComment}
              disabled={sending || !commentBody.trim()}
              style={{
                padding: '4px 14px',
                background: 'rgba(0,180,220,0.2)',
                border: '1px solid var(--glow)',
                borderRadius: 8,
                color: 'var(--glow)',
                fontSize: '0.78rem',
                cursor: sending ? 'wait' : 'pointer',
                fontFamily: 'Raleway, sans-serif',
              }}
            >
              {sending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```
npx vitest run
```
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/Feed/SnapCard.tsx
git commit -m "feat: SnapCard with inline vote slider and comment — remove PeakD link"
```

---

### Task 8: FeedPanel — visual aquático + Snaps compose area

**Files:**
- Modify: `src/components/Feed/FeedPanel.tsx`
- Modify: `src/components/Feed/FeedPanel.test.tsx`

**Interfaces:**
- Consumes: `useSnaps` returning `{ posts, isLoading, isError, fetchNextPage, hasMore, containerPermlink }` (Task 3)
- Consumes: `useInteractions().publishSnap` (Task 4)

- [ ] **Step 1: Update FeedPanel.test.tsx mock for useSnaps**

In `src/components/Feed/FeedPanel.test.tsx`, update the `useSnaps` mock to include `containerPermlink`:

```ts
vi.mock('../../hooks/useSnaps', () => ({
  useSnaps: vi.fn(() => ({ ...EMPTY_FEED, containerPermlink: null })),
}))
```

Also update the `'shows empty state when feed is empty'` test — the empty state text for Snaps tab is different from Posts. The Posts empty state stays as-is. Add a new test:

```ts
it('shows snaps compose area when on Snaps tab and logged in', () => {
  useAppStore.setState({
    user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
    myFish: [], activeTab: 'snaps', activeTag: null,
  })
  wrap(<FeedPanel />)
  expect(screen.getByPlaceholderText(/O que está acontecendo/i)).toBeTruthy()
})
```

- [ ] **Step 2: Run FeedPanel tests to see which fail**

```
npx vitest run src/components/Feed/FeedPanel.test.tsx
```
Expected: `useSnaps` mock fails to match new return shape — update mock first, then re-run.

- [ ] **Step 3: Rewrite FeedPanel.tsx**

Replace the entire contents of `src/components/Feed/FeedPanel.tsx`:

```tsx
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useFollowingFeed, useTagFeed } from '../../hooks/useHiveFeed'
import { useSnaps } from '../../hooks/useSnaps'
import { useInteractions } from '../../hooks/useInteractions'
import PostCard from './PostCard'
import SnapCard from './SnapCard'
import TagFilterStrip from './TagFilterStrip'

const BUBBLES = [
  { size: 5,  left: '6%',  delay: 0,   dur: 7   },
  { size: 8,  left: '11%', delay: 2.5, dur: 9   },
  { size: 4,  left: '87%', delay: 1,   dur: 6   },
  { size: 7,  left: '92%', delay: 3.5, dur: 8   },
  { size: 5,  left: '4%',  delay: 5,   dur: 7.5 },
  { size: 6,  left: '95%', delay: 1.5, dur: 6.5 },
]

export default function FeedPanel() {
  const user = useAppStore(s => s.user)
  const activeTab = useAppStore(s => s.activeTab)
  const activeTag = useAppStore(s => s.activeTag)
  const setTab = useAppStore(s => s.setTab)
  const setTag = useAppStore(s => s.setTag)

  const followingFeed = useFollowingFeed()
  const tagFeed = useTagFeed(activeTag)
  const snaps = useSnaps()
  const { publishSnap } = useInteractions()

  const [snapBody, setSnapBody] = useState('')
  const [publishingSnap, setPublishingSnap] = useState(false)

  if (!user) return null

  const isTagActive = !!activeTag
  const postFeed = isTagActive ? tagFeed : followingFeed
  const currentFeed = activeTab === 'posts' ? postFeed : snaps

  const { posts, isLoading, isError, fetchNextPage, hasMore } = currentFeed

  async function handlePublishSnap() {
    if (!snapBody.trim() || !snaps.containerPermlink) return
    setPublishingSnap(true)
    await publishSnap(snaps.containerPermlink, snapBody)
    setPublishingSnap(false)
    setSnapBody('')
  }

  return (
    <>
      <style>{`
        @keyframes bubbleRise {
          0%   { transform: translateY(0)   scaleX(1);    opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-340px) scaleX(1.1); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          maxWidth: '100vw',
          height: 'calc(100vh - 64px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: 'rgba(0,15,40,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,200,220,0.25)',
            borderTop: 'none',
            borderRadius: '0 0 18px 18px',
            boxShadow: 'inset 0 0 40px rgba(0,180,220,0.06), 0 0 60px rgba(0,120,180,0.2)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Bubbles */}
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                bottom: 8,
                left: b.left,
                width: b.size,
                height: b.size,
                borderRadius: '50%',
                background: 'rgba(100,220,255,0.35)',
                border: '1px solid rgba(150,240,255,0.5)',
                animation: `bubbleRise ${b.dur}s ${b.delay}s ease-in infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,200,220,0.15)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            {(['posts', 'snaps'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--glow)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--glow)' : 'var(--text-dim)',
                  fontFamily: 'Raleway, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  letterSpacing: '0.5px',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'posts' ? 'Posts' : 'Snaps'}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,200,220,0.08)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <TagFilterStrip activeTag={activeTag} onTagChange={setTag} />
          </div>

          {/* Snaps compose area */}
          {activeTab === 'snaps' && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,200,220,0.08)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <textarea
                value={snapBody}
                onChange={e => setSnapBody(e.target.value)}
                placeholder="O que está acontecendo no Hive?"
                rows={3}
                maxLength={512}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,30,70,0.6)',
                  border: '1px solid rgba(0,200,220,0.2)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  fontFamily: 'Raleway, sans-serif',
                  fontSize: '0.85rem',
                  padding: '10px 12px',
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{snapBody.length}/512</span>
                <button
                  onClick={handlePublishSnap}
                  disabled={publishingSnap || !snapBody.trim() || !snaps.containerPermlink}
                  style={{
                    padding: '5px 18px',
                    background: 'rgba(0,180,220,0.2)',
                    border: '1px solid var(--glow)',
                    borderRadius: 10,
                    color: 'var(--glow)',
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: '0.82rem',
                    cursor: publishingSnap ? 'wait' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {publishingSnap ? 'Publicando...' : 'Snap'}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', position: 'relative', zIndex: 1 }}>
            {isLoading && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: 40, fontSize: '0.85rem' }}>
                Carregando feed...
              </div>
            )}

            {isError && !isLoading && (
              <div style={{ textAlign: 'center', color: '#ff8080', paddingTop: 40, fontSize: '0.85rem' }}>
                Não foi possível carregar o feed.{' '}
                <button
                  onClick={() => window.location.reload()}
                  style={{ color: 'var(--glow)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !isError && posts.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌊</div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {activeTab === 'posts' ? 'Siga pessoas no Hive para ver o feed aqui.' : 'Nenhum snap por enquanto.'}
                </p>
                {activeTab === 'posts' && (
                  <a
                    href="https://peakd.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--glow)', fontSize: '0.8rem', marginTop: 8, display: 'inline-block' }}
                  >
                    Explorar no PeakD →
                  </a>
                )}
              </div>
            )}

            {!isLoading && posts.map(post => (
              activeTab === 'posts'
                ? <PostCard key={`${post.author}/${post.permlink}`} post={post} />
                : <SnapCard key={`${post.author}/${post.permlink}`} post={post} />
            ))}

            {hasMore && !isLoading && (
              <button
                onClick={fetchNextPage}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  marginTop: 8,
                  background: 'rgba(0,30,60,0.6)',
                  border: '1px solid rgba(0,200,220,0.15)',
                  borderRadius: 10,
                  color: 'var(--glow)',
                  fontFamily: 'Raleway, sans-serif',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Carregar mais
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Run all tests**

```
npx vitest run
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Feed/FeedPanel.tsx src/components/Feed/FeedPanel.test.tsx
git commit -m "feat: FeedPanel visual aquático, Snaps compose area"
```

---

## Final verification

- [ ] **Run full test suite one last time**

```
npx vitest run
```
Expected: all PASS, zero failures

- [ ] **TypeScript check**

```
npx tsc --noEmit
```
Expected: no errors
