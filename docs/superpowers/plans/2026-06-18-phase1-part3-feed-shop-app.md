# Hive Aquarium Phase 1 — Part 3: FeedPanel + Shop + App Wiring

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Parts 1 and 2 must be complete and all tests passing before starting Part 3.

**Goal:** Build FeedPanel (tabs + filter + cards + load more), Shop (FishCard + ShopModal with Keychain transfer), wire everything together in App.tsx, and do a full smoke-test pass.

**Architecture:** FeedPanel is the main social surface — centered at 480px, always visible when logged in. ShopModal is a fixed overlay. App.tsx composes Aquarium + Header + LoginOverlay + FeedPanel + ShopModal + Toast.

---

### Task 14: FeedPanel

**Files:**
- Create: `src/components/Feed/FeedPanel.tsx`
- Create: `src/components/Feed/FeedPanel.test.tsx`

**Interfaces:**
- Consumes: `useFollowingFeed`, `useTagFeed`, `useSnaps`, `useAppStore` (activeTab, activeTag, setTab, setTag), `PostCard`, `SnapCard`, `TagFilterStrip`
- Produces: `<FeedPanel />` — centered 480px column, glassmorphism, tabs, filter, card list, load more, empty state

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/Feed/FeedPanel.test.tsx
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
  useSnaps: vi.fn(() => EMPTY_FEED),
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
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test FeedPanel
```
Expected: FAIL — `Cannot find module './FeedPanel'`

- [ ] **Step 3: Implement `src/components/Feed/FeedPanel.tsx`**

```tsx
// src/components/Feed/FeedPanel.tsx
import { useAppStore } from '../../store/appStore'
import { useFollowingFeed, useTagFeed } from '../../hooks/useHiveFeed'
import { useSnaps } from '../../hooks/useSnaps'
import PostCard from './PostCard'
import SnapCard from './SnapCard'
import TagFilterStrip from './TagFilterStrip'

export default function FeedPanel() {
  const user = useAppStore(s => s.user)
  const activeTab = useAppStore(s => s.activeTab)
  const activeTag = useAppStore(s => s.activeTag)
  const setTab = useAppStore(s => s.setTab)
  const setTag = useAppStore(s => s.setTag)

  const followingFeed = useFollowingFeed()
  const tagFeed = useTagFeed(activeTag)
  const snaps = useSnaps()

  if (!user) return null

  const isTagActive = !!activeTag
  const postFeed = isTagActive ? tagFeed : followingFeed
  const currentFeed = activeTab === 'posts' ? postFeed : snaps

  const { posts, isLoading, isError, fetchNextPage, hasMore } = currentFeed

  return (
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
      {/* Panel */}
      <div
        style={{
          background: 'rgba(2,18,38,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
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
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,212,255,0.08)', flexShrink: 0 }}>
          <TagFilterStrip activeTag={activeTag} onTagChange={setTag} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
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
                Siga pessoas no Hive para ver o feed aqui.
              </p>
              <a
                href="https://peakd.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--glow)', fontSize: '0.8rem', marginTop: 8, display: 'inline-block' }}
              >
                Explorar no PeakD →
              </a>
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
                border: '1px solid var(--border)',
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
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test FeedPanel
```
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/Feed/FeedPanel.tsx src/components/Feed/FeedPanel.test.tsx
git commit -m "feat: FeedPanel with tabs, tag filter, load more, empty state"
```

---

### Task 15: ShopModal + FishCard

**Files:**
- Create: `src/components/Shop/FishCard.tsx`
- Create: `src/components/Shop/ShopModal.tsx`
- Create: `src/components/Shop/ShopModal.test.tsx`

**Interfaces:**
- Consumes: `FISH_CATALOG`, `useAppStore` (myFish, user), `window.hive_keychain`, `fetchHivePrice`, `useShowToast`
- Produces:
  - `<FishCard fish={FishEntry} owned={boolean} onBuy={() => void} />` — fish preview card with buy button
  - `<ShopModal isOpen onClose />` — modal grid of fish cards

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/Shop/ShopModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShopModal from './ShopModal'
import { useAppStore } from '../../store/appStore'

vi.mock('../../lib/hivePrice', () => ({ fetchHivePrice: vi.fn(async () => 0.25) }))

beforeEach(() => {
  useAppStore.setState({
    user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '10.000 HIVE' },
    myFish: [], activeTab: 'posts', activeTag: null,
  })
  vi.unstubAllGlobals()
})

describe('ShopModal', () => {
  it('renders all 7 fish when open', () => {
    render(<ShopModal isOpen onClose={vi.fn()} />)
    expect(screen.getByText('Peixe-Palhaço')).toBeTruthy()
    expect(screen.getByText('Tang Azul')).toBeTruthy()
    expect(screen.getByText('Peixe-Dragão')).toBeTruthy()
  })

  it('does not render when isOpen is false', () => {
    render(<ShopModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Peixe-Palhaço')).toBeFalsy()
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ShopModal isOpen onClose={onClose} />)
    const overlay = container.querySelector('[data-overlay]')!
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows owned badge for already-owned fish', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [{ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' }],
      activeTab: 'posts', activeTag: null,
    })
    render(<ShopModal isOpen onClose={vi.fn()} />)
    expect(screen.getByText('✓ Seu')).toBeTruthy()
  })

  it('disables buy button for owned fish', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [{ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' }],
      activeTab: 'posts', activeTag: null,
    })
    render(<ShopModal isOpen onClose={vi.fn()} />)
    const clownfishCard = screen.getByText('Peixe-Palhaço').closest('[data-card]')!
    const btn = clownfishCard.querySelector('button')!
    expect(btn).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test ShopModal
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/components/Shop/FishCard.tsx`**

```tsx
// src/components/Shop/FishCard.tsx
import type { FishEntry } from '../../data/fishCatalog'

const RARITY_LABEL: Record<string, string> = {
  common: 'Comum', rare: '✦ Raro', epic: '✦✦ Épico', legendary: '★ Lendário',
}
const RARITY_COLOR: Record<string, string> = {
  common: '#80b0e0', rare: '#60ccff', epic: '#cc80ff', legendary: '#f0c040',
}

interface Props {
  fish: FishEntry
  owned: boolean
  hivePrice: number | null
  onBuy(): void
  isBuying: boolean
}

export default function FishCard({ fish, owned, hivePrice, onBuy, isBuying }: Props) {
  return (
    <div
      data-card
      style={{
        position: 'relative',
        background: 'rgba(0,20,50,0.6)',
        border: '1px solid rgba(0,100,200,0.2)',
        borderRadius: 14,
        padding: 20,
        textAlign: 'center',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--glow)'
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 8px 30px rgba(0,212,255,0.2)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(0,100,200,0.2)'
        el.style.transform = 'none'
        el.style.boxShadow = 'none'
      }}
    >
      {owned && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,200,100,0.2)', border: '1px solid rgba(0,200,100,0.4)',
          borderRadius: 10, padding: '2px 8px', fontSize: '0.65rem', color: '#00cc88',
        }}>
          ✓ Seu
        </div>
      )}

      {/* SVG as data URI — avoids dangerouslySetInnerHTML / XSS risk */}
      <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(fish.svgString(0.9))}`}
          alt={fish.name}
          style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--text)', margin: '10px 0 4px', fontWeight: 500 }}>
        {fish.name}
      </h3>

      <div style={{ fontSize: '0.7rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 500, color: RARITY_COLOR[fish.rarity] }}>
        {RARITY_LABEL[fish.rarity]}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: 14 }}>
        {fish.desc}
      </p>

      <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        🐝 {fish.price} HIVE
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          {hivePrice ? `≈ $${(fish.price * hivePrice).toFixed(2)}` : '...'}
        </span>
      </div>

      <button
        onClick={owned ? undefined : onBuy}
        disabled={owned || isBuying}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '10px 0',
          background: owned || isBuying
            ? 'rgba(0,60,120,0.3)'
            : 'linear-gradient(135deg, #004488, #0077cc)',
          color: owned || isBuying ? 'var(--text-dim)' : '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.85rem',
          cursor: owned || isBuying ? 'not-allowed' : 'pointer',
          fontFamily: 'Raleway, sans-serif',
          transition: 'all 0.3s',
        }}
      >
        {isBuying ? '⏳ Aguardando...' : owned ? '✓ Já no aquário' : '🛒 Comprar'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/components/Shop/ShopModal.tsx`**

```tsx
// src/components/Shop/ShopModal.tsx
import { useEffect, useState } from 'react'
import { FISH_CATALOG } from '../../data/fishCatalog'
import { useAppStore } from '../../store/appStore'
import { fetchHivePrice } from '../../lib/hivePrice'
import { useShowToast } from '../common/Toast'
import FishCard from './FishCard'

const APP_ID = 'hive-aquarium/1.0'
const SHOP_ACCOUNT = 'hive-aquarium'

interface Props { isOpen: boolean; onClose(): void }

export default function ShopModal({ isOpen, onClose }: Props) {
  const user = useAppStore(s => s.user)
  const myFish = useAppStore(s => s.myFish)
  const addFish = useAppStore(s => s.addFish)
  const showToast = useShowToast()
  const [hivePrice, setHivePrice] = useState<number | null>(null)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    fetchHivePrice().then(p => { if (p) setHivePrice(p) })
  }, [])

  if (!isOpen) return null

  async function buyFish(fishId: string) {
    const fish = FISH_CATALOG.find(f => f.id === fishId)
    if (!fish || !user || !window.hive_keychain) return

    setBuying(fishId)
    const usdStr = hivePrice ? ` (≈ $${(fish.price * hivePrice).toFixed(2)})` : ''
    showToast('🔑 Keychain', `Confirme o pagamento de ${fish.price} HIVE${usdStr} para comprar ${fish.name}`, false)

    const transferTimeout = setTimeout(() => {
      showToast('⏱️ Timeout', 'O Keychain não respondeu. Tente novamente.', true)
      setBuying(null)
    }, 60000)

    window.hive_keychain.requestTransfer(
      user.username,
      SHOP_ACCOUNT,
      fish.price.toFixed(3),
      fish.memo,
      'HIVE',
      (txResponse) => {
        clearTimeout(transferTimeout)
        if (!txResponse.success) {
          showToast('❌ Cancelado', txResponse.message ?? 'Transação cancelada.', true)
          setBuying(null)
          return
        }

        showToast('✅ Pagamento enviado!', `Registrando ${fish.name} na blockchain...`, false)

        const fishJson = JSON.stringify({
          action: 'add_fish',
          fish_id: fishId,
          fish_name: fish.name,
          tx: txResponse.result?.id ?? 'unknown',
          app: APP_ID,
        })

        window.hive_keychain!.requestCustomJson(
          user.username,
          APP_ID,
          'Posting',
          fishJson,
          `Hive Aquarium: Adicionar ${fish.name}`,
          (jsonResponse) => {
            addFish({ id: fishId, name: fish.name, boughtAt: new Date().toISOString() })
            localStorage.setItem(
              `fish_${user.username}`,
              JSON.stringify([...myFish, { id: fishId, name: fish.name, boughtAt: new Date().toISOString() }])
            )
            onClose()
            setBuying(null)
            if (jsonResponse.success) {
              showToast(`🎉 ${fish.name} adquirido!`, 'Seu novo peixe já está nadando no aquário!', false)
            } else {
              showToast(`⚠️ ${fish.name} adquirido!`, 'Peixe no aquário! (registro on-chain com aviso)', false)
            }
          }
        )
      }
    )
  }

  return (
    <div
      data-overlay
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'rgba(0,5,15,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: '92%', maxWidth: 820,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 0 100px rgba(0,80,160,0.4)',
          animation: 'cardIn 0.4s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'var(--panel)', zIndex: 2,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem', color: 'var(--glow)' }}>
              🛒 Loja de Peixes
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Compre peixes com HIVE. Cada peixe fica salvo na blockchain para sempre.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)',
              color: '#ff8080', fontSize: '1.2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
          padding: '28px 32px',
        }}>
          {FISH_CATALOG.map(fish => (
            <FishCard
              key={fish.id}
              fish={fish}
              owned={myFish.some(f => f.id === fish.id)}
              hivePrice={hivePrice}
              onBuy={() => buyFish(fish.id)}
              isBuying={buying === fish.id}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test ShopModal
```
Expected: PASS — 5 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/Shop/
git commit -m "feat: FishCard and ShopModal with Keychain transfer flow"
```

---

### Task 16: useAccountBalance + auto-restore session

**Files:**
- Modify: `src/hooks/useKeychain.ts` — add `restoreSession()` export
- Create: `src/hooks/useAccountBalance.ts`

**Interfaces:**
- `restoreSession()` — reads `localStorage`, sets `user` in Zustand if found (called once on app mount)
- `useAccountBalance(username)` — React Query, fetches HIVE balance, silently fails

- [ ] **Step 1: Write failing tests**

```ts
// src/hooks/useAccountBalance.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAccountBalance } from './useAccountBalance'

const mockFetch = vi.fn()
beforeEach(() => vi.stubGlobal('fetch', mockFetch))
afterEach(() => vi.unstubAllGlobals())

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useAccountBalance', () => {
  it('returns null when username is null', () => {
    const { result } = renderHook(() => useAccountBalance(null), { wrapper: wrap() })
    expect(result.current).toBeNull()
  })

  it('returns balance string on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: [{ name: 'alice', balance: '5.000 HIVE' }] }),
    })
    const { result } = renderHook(() => useAccountBalance('alice'), { wrapper: wrap() })
    await waitFor(() => result.current !== null && result.current !== undefined)
    expect(result.current).toBe('5.000 HIVE')
  })

  it('returns null silently on API error', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const { result } = renderHook(() => useAccountBalance('alice'), { wrapper: wrap() })
    await waitFor(() => !result.current) // stays null
    expect(result.current).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test useAccountBalance
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/hooks/useAccountBalance.ts`**

```ts
// src/hooks/useAccountBalance.ts
import { useQuery } from '@tanstack/react-query'
import { getAccounts } from '../lib/hiveApi'

export function useAccountBalance(username: string | null): string | null {
  const query = useQuery({
    queryKey: ['balance', username],
    queryFn: async () => {
      const accounts = await getAccounts([username!])
      return accounts[0]?.balance ?? null
    },
    enabled: !!username,
    staleTime: 60_000,
  })

  return query.data ?? null
}
```

- [ ] **Step 4: Add `restoreSession` to `src/hooks/useKeychain.ts`**

Add this export at the end of the file (after the `useKeychain` function):

```ts
// Add to src/hooks/useKeychain.ts
export function restoreSession(): string | null {
  try {
    const saved = localStorage.getItem('hive_aquarium_user')
    if (!saved) return null
    const { username } = JSON.parse(saved)
    if (!username) return null
    useAppStore.getState().login({
      username,
      avatarUrl: `https://images.hive.blog/u/${username}/avatar`,
      hivePower: 0,
      hiveBalance: '...',
    })
    return username
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Run tests**

```bash
npm test useAccountBalance
```
Expected: PASS — 3 tests

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useAccountBalance.ts src/hooks/useAccountBalance.test.ts src/hooks/useKeychain.ts
git commit -m "feat: useAccountBalance hook and session restore on mount"
```

---

### Task 17: App.tsx — Wire Everything Together

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

**Interfaces:**
- Consumes: all components and hooks
- Produces: working single-page app with canvas background, header, login overlay, feed panel, shop button, shop modal, toast

- [ ] **Step 1: Write smoke test**

```tsx
// src/App.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import App from './App'

// Mock heavy deps to keep smoke test fast
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test App.test
```
Expected: FAIL — App not importing the right components yet

- [ ] **Step 3: Implement `src/App.tsx`**

```tsx
// src/App.tsx
import { useEffect, useState } from 'react'
import Aquarium from './components/Aquarium/Aquarium'
import Header from './components/Header/Header'
import LoginOverlay from './components/Login/LoginOverlay'
import FeedPanel from './components/Feed/FeedPanel'
import ShopModal from './components/Shop/ShopModal'
import Toast from './components/common/Toast'
import { restoreSession } from './hooks/useKeychain'
import { useAppStore } from './store/appStore'

export default function App() {
  const user = useAppStore(s => s.user)
  const [shopOpen, setShopOpen] = useState(false)

  // Restore saved session on first mount
  useEffect(() => {
    restoreSession()
  }, [])

  return (
    <>
      {/* Layer 0 — canvas background */}
      <Aquarium />

      {/* Layer 1 — fixed header */}
      <Header />

      {/* Layer 2 — login overlay (covers everything when not logged in) */}
      <LoginOverlay />

      {/* Layer 3 — social feed panel (centered column) */}
      <FeedPanel />

      {/* Layer 4 — shop button (bottom-right, only when logged in) */}
      {user && (
        <>
          <div
            style={{
              position: 'fixed', right: 92, bottom: 46, zIndex: 90,
              background: 'rgba(2,18,38,0.9)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 14px', fontSize: '0.8rem',
              color: 'var(--glow)', pointerEvents: 'none',
            }}
          >
            Loja de Peixes
          </div>

          <button
            onClick={() => setShopOpen(true)}
            title="Loja"
            style={{
              position: 'fixed', right: 24, bottom: 32, zIndex: 90,
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #005599, #0088cc)',
              color: '#fff', fontSize: '1.6rem', cursor: 'pointer', border: 'none',
              boxShadow: '0 0 30px rgba(0,136,204,0.5)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'scale(1.1) rotate(10deg)'
              el.style.boxShadow = '0 0 50px rgba(0,136,204,0.7)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'none'
              el.style.boxShadow = '0 0 30px rgba(0,136,204,0.5)'
            }}
          >
            🛒
          </button>

          {/* Fish HUD */}
          <FishHUD />
        </>
      )}

      {/* Layer 5 — shop modal */}
      <ShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} />

      {/* Layer 6 — toast notifications */}
      <Toast />

      {/* Dev credit */}
      <div style={{ position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 88, pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.58rem', letterSpacing: 1, color: 'rgba(100,160,200,0.25)', marginRight: 4 }}>desenvolvido por</span>
        <a href="https://peakd.com/@shiftrox/posts" target="_blank" rel="noreferrer" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.62rem', letterSpacing: '1.5px', color: 'rgba(0,180,220,0.35)', textDecoration: 'none', pointerEvents: 'all', transition: 'color 0.3s' }}>Shiftrox</a>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(30px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}

function FishHUD() {
  const count = useAppStore(s => s.myFish.length)
  if (count === 0) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: 24, zIndex: 90,
      background: 'rgba(2,18,38,0.85)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '10px 18px', fontSize: '0.8rem',
      color: 'var(--text-dim)', backdropFilter: 'blur(4px)',
    }}>
      🐠 <span style={{ color: 'var(--glow)', fontWeight: 600 }}>{count}</span> peixe{count !== 1 ? 's' : ''} no aquário
    </div>
  )
}
```

- [ ] **Step 4: Run smoke tests**

```bash
npm test App.test
```
Expected: PASS — 2 tests

- [ ] **Step 5: Run all tests**

```bash
npm test
```
Expected: PASS — all tests across all parts

- [ ] **Step 6: Build to verify no TS errors**

```bash
npm run build
```
Expected: `dist/` created, zero TypeScript errors, zero import errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/hooks/
git commit -m "feat: App.tsx wiring — all components composed, session restore, shop flow"
```

---

### Task 18: Final Verification Pass

**Files:** No new files — verification only.

**Goal:** Confirm the app renders and behaves correctly end-to-end in the browser.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```
Expected: server at `http://localhost:5173` (or next available port), no console errors on startup.

- [ ] **Step 2: Verify login overlay**

Open the browser. Expected:
- Dark gradient background visible (aquarium canvas rendering)
- Animated bubbles rising
- Login card centered with fish emoji, title "Hive Aquarium", username input, Keychain button
- No console errors

- [ ] **Step 3: Verify decorations render**

In browser devtools console, run:
```js
document.querySelector('canvas').width
```
Expected: window.innerWidth (e.g. 1440)

Visually confirm:
- Pebbles visible at bottom
- Plants swaying (CSS animation — plants are drawn on offscreen canvas, no animation; this is expected)
- Animated bubbles rising

- [ ] **Step 4: Test login (requires Hive Keychain extension)**

Enter a real Hive username → click "Entrar com Hive Keychain".
Expected:
- Keychain popup appears requesting signature
- On approve: login overlay disappears, header shows `@username`, feed panel appears (centered)
- Shop button appears bottom-right
- If user owns fish: fish swimming on canvas

- [ ] **Step 5: Verify feed panel**

With a logged-in account that follows other users:
- Posts tab shows feed items with avatars, titles, excerpts
- Tag chips filter correctly: click `#photography` → re-fetches posts with that tag
- Snaps tab switches to snap cards (compact format)
- "Load mais" appears if >20 posts returned
- Empty state shows if user follows nobody

- [ ] **Step 6: Verify shop**

Click shop button (🛒):
- Modal opens with 7 fish cards + prices
- Fish the user owns show "✓ Seu" badge with disabled button
- Click "Comprar" on unowned fish → Keychain transfer popup
- On approve: fish appears in aquarium, toast shows success, fish HUD count increases

- [ ] **Step 7: Verify mobile layout**

Resize browser to <640px:
- Feed panel becomes full-width
- Aquarium canvas still visible above/below
- All buttons still accessible

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: Phase 1 complete — Vite+React migration, Canvas fish engine, Hive social feed"
```

---

## Phase 1 Complete

All three parts are implemented. The app is a Vite + React + TypeScript single-page app with:

- **Canvas 2D fish engine** — 7 fish types with behaviors, special animations, particle effects
- **Hive Keychain login** — requestSignBuffer auth, session persistence
- **Social feed** — following feed + tag filter, Posts and Snaps tabs, load more
- **Blockchain shop** — requestTransfer + requestCustomJson, fish ownership via on-chain history
- **Glassmorphism UI** — header, feed panel, shop modal matching original visual language

**Next phases:** 3D fish (Three.js), gamification (XP/levels), aquarium discovery (visit other tanks).
