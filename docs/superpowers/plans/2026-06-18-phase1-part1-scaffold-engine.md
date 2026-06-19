# Hive Aquarium Phase 1 — Part 1: Scaffold + Fish Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Vite + React + TypeScript project, port fish data and behaviors, and implement the Canvas 2D fish engine.

**Architecture:** Static decorations drawn once to an offscreen canvas. Fish and animated bubbles redrawn each RAF frame. Behaviors and drawing are separated into pure-TS modules consumed by the engine.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS v3, Zustand, @tanstack/react-query v5, Vitest + @testing-library/react, Canvas 2D API.

## Global Constraints

- All user-visible text in Brazilian Portuguese
- CSS vars: `--glow: #00d4ff`, `--gold: #f0c040`, `--panel: rgba(2,18,38,0.92)`, `--border: rgba(0,212,255,0.2)`, `--deep: #020d1a`, `--abyss: #010810`
- Fonts: `Cinzel Decorative` (headings), `Raleway` (body) — loaded via Google Fonts in `index.html`
- Fish engine targets 60 fps via `requestAnimationFrame`
- Hive RPC endpoint: `https://api.hive.blog`
- Shop account: `hive-aquarium`, App ID: `hive-aquarium/1.0`
- Phase 1 out-of-scope: 3D fish, gamification, aquarium discovery, voting, HiveAuth, infinite scroll

---

### Task 1: Project Scaffold

**Files:**
- Modify: `index.html`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: working `npm run dev`, `npm run build`, `npm test` commands

- [ ] **Step 1: Scaffold Vite + React + TS in existing directory**

```bash
npm create vite@latest . -- --template react-ts
```

Accept the "Target directory is not empty" prompt. This creates `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install zustand @tanstack/react-query@5 @hiveio/dhive tailwindcss@3 postcss autoprefixer
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitejs/plugin-react msw
```

- [ ] **Step 4: Init Tailwind**

```bash
npx tailwindcss init -p
```

Then replace `tailwind.config.ts` with:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aqua:  '#00d4ff',
        gold:  '#f0c040',
        deep:  '#020d1a',
        abyss: '#010810',
        water1: '#0a2a4a',
      },
      fontFamily: {
        cinzel:  ['"Cinzel Decorative"', 'serif'],
        raleway: ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 5: Update `vite.config.ts` to add Vitest**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 6: Create test setup file**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Replace `src/index.css` with Tailwind directives + CSS vars**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --deep:   #020d1a;
  --abyss:  #010810;
  --water1: #0a2a4a;
  --water2: #0d3b6e;
  --glow:   #00d4ff;
  --glow2:  #00ffcc;
  --gold:   #f0c040;
  --coral:  #ff6b6b;
  --sand:   #c8a96e;
  --text:   #cce8ff;
  --text-dim: #6a9bc0;
  --panel:  rgba(2, 18, 38, 0.92);
  --border: rgba(0, 212, 255, 0.2);
}

* { box-sizing: border-box; }

body {
  font-family: 'Raleway', sans-serif;
  background: var(--abyss);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
```

- [ ] **Step 8: Replace `index.html` with Google Fonts + minimal shell**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hive Aquarium</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Raleway:wght@300;400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 10: Replace `src/App.tsx` with placeholder**

```tsx
export default function App() {
  return <div className="text-aqua font-cinzel text-2xl p-8">Hive Aquarium — carregando...</div>
}
```

- [ ] **Step 11: Verify build and tests pass**

```bash
npm run build
```
Expected: `dist/` created, no TS errors.

```bash
npm test
```
Expected: "No test files found" (no tests yet — that's OK).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

### Task 2: Types + Zustand Store

**Files:**
- Create: `src/store/appStore.ts`
- Create: `src/store/appStore.test.ts`

**Interfaces:**
- Produces: `useAppStore()` hook with `user`, `myFish`, `activeTab`, `activeTag`, `login`, `logout`, `setFish`, `addFish`, `setTab`, `setTag`

- [ ] **Step 1: Write the failing tests**

```ts
// src/store/appStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './appStore'

function getStore() {
  return useAppStore.getState()
}

beforeEach(() => {
  useAppStore.setState({
    user: null,
    myFish: [],
    activeTab: 'posts',
    activeTag: null,
  })
})

describe('auth', () => {
  it('login sets user', () => {
    getStore().login({ username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '0.000 HIVE' })
    expect(getStore().user?.username).toBe('alice')
  })

  it('logout clears user and fish', () => {
    getStore().login({ username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '0.000 HIVE' })
    getStore().addFish({ id: 'clownfish', name: 'Peixe-Palhaço', boughtAt: '2026-01-01' })
    getStore().logout()
    expect(getStore().user).toBeNull()
    expect(getStore().myFish).toHaveLength(0)
  })
})

describe('fish', () => {
  it('setFish replaces array', () => {
    getStore().setFish([{ id: 'tang', name: 'Tang Azul', boughtAt: '2026-01-01' }])
    expect(getStore().myFish).toHaveLength(1)
    expect(getStore().myFish[0].id).toBe('tang')
  })

  it('addFish appends', () => {
    getStore().addFish({ id: 'tang', name: 'Tang Azul', boughtAt: '2026-01-01' })
    getStore().addFish({ id: 'dragon', name: 'Peixe-Dragão', boughtAt: '2026-01-02' })
    expect(getStore().myFish).toHaveLength(2)
  })
})

describe('feed', () => {
  it('setTab updates activeTab', () => {
    getStore().setTab('snaps')
    expect(getStore().activeTab).toBe('snaps')
  })

  it('setTag updates activeTag', () => {
    getStore().setTag('#hive-aquarium')
    expect(getStore().activeTag).toBe('#hive-aquarium')
  })

  it('setTag null clears filter', () => {
    getStore().setTag('#art')
    getStore().setTag(null)
    expect(getStore().activeTag).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test appStore
```
Expected: FAIL — `Cannot find module './appStore'`

- [ ] **Step 3: Implement the store**

```ts
// src/store/appStore.ts
import { create } from 'zustand'

export interface HiveUser {
  username: string
  avatarUrl: string
  hivePower: number
  hiveBalance: string
}

export interface OwnedFish {
  id: string
  name: string
  boughtAt: string
}

interface AppStore {
  user: HiveUser | null
  login(user: HiveUser): void
  logout(): void

  myFish: OwnedFish[]
  setFish(fish: OwnedFish[]): void
  addFish(fish: OwnedFish): void

  activeTab: 'posts' | 'snaps'
  activeTag: string | null
  setTab(tab: 'posts' | 'snaps'): void
  setTag(tag: string | null): void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null, myFish: [] }),

  myFish: [],
  setFish: (fish) => set({ myFish: fish }),
  addFish: (fish) => set((s) => ({ myFish: [...s.myFish, fish] })),

  activeTab: 'posts',
  activeTag: null,
  setTab: (activeTab) => set({ activeTab }),
  setTag: (activeTag) => set({ activeTag }),
}))
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test appStore
```
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand store with auth/fish/feed state"
```

---

### Task 3: Data + Lib Layer

**Files:**
- Create: `src/data/fishCatalog.ts`
- Create: `src/lib/hiveApi.ts`
- Create: `src/lib/hivePrice.ts`
- Create: `src/lib/hiveApi.test.ts`

**Interfaces:**
- Produces:
  - `FISH_CATALOG: FishEntry[]`
  - `hiveApi.getDiscussionsByFeed(username, limit, cursor?)`, `getDiscussionsByCreated(tag, limit, cursor?)`, `getAccountHistory(username)`, `getAccounts(usernames)`
  - `fetchHivePrice(): Promise<number | null>`

- [ ] **Step 1: Write failing tests for hiveApi**

```ts
// src/lib/hiveApi.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAccounts, getAccountHistory } from './hiveApi'

const mockFetch = vi.fn()
beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function mockRpc(result: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ jsonrpc: '2.0', id: 1, result }),
  })
}

describe('getAccounts', () => {
  it('returns account array', async () => {
    mockRpc([{ name: 'alice', balance: '10.000 HIVE' }])
    const result = await getAccounts(['alice'])
    expect(result[0].name).toBe('alice')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.hive.blog',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('getAccountHistory', () => {
  it('returns history array', async () => {
    mockRpc([[0, { op: ['transfer', {}], timestamp: '2026-01-01T00:00:00' }]])
    const result = await getAccountHistory('alice')
    expect(Array.isArray(result)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test hiveApi
```
Expected: FAIL — `Cannot find module './hiveApi'`

- [ ] **Step 3: Implement `src/lib/hiveApi.ts`**

```ts
// src/lib/hiveApi.ts
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
```

- [ ] **Step 4: Implement `src/lib/hivePrice.ts`**

```ts
// src/lib/hivePrice.ts
export async function fetchHivePrice(): Promise<number | null> {
  // Strategy 1: CoinGecko
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd',
      { headers: { Accept: 'application/json' } }
    )
    const data = await res.json()
    const price = data?.hive?.usd
    if (price && price > 0) return price
  } catch {}

  // Strategy 2: Hive internal price feed
  try {
    const res = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_current_median_history_price',
        params: [],
        id: 1,
      }),
    })
    const data = await res.json()
    if (data.result) {
      const base = parseFloat(data.result.base.replace(' HBD', ''))
      const quote = parseFloat(data.result.quote.replace(' HIVE', ''))
      if (quote > 0) return base / quote
    }
  } catch {}

  // Strategy 3: CoinCap
  try {
    const res = await fetch('https://api.coincap.io/v2/assets/hive')
    const data = await res.json()
    if (data?.data?.priceUsd) return parseFloat(data.data.priceUsd)
  } catch {}

  return null
}
```

- [ ] **Step 5: Implement `src/data/fishCatalog.ts`**

```ts
// src/data/fishCatalog.ts
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface FishEntry {
  id: string
  name: string
  price: number
  rarity: Rarity
  desc: string
  memo: string
  glowColor: string
  svgString: (scale?: number) => string
}

export const FISH_CATALOG: FishEntry[] = [
  {
    id: 'clownfish', name: 'Peixe-Palhaço', price: 1, rarity: 'common',
    desc: 'O clássico peixe laranja e branco. Animado e curioso.',
    memo: 'buy:clownfish', glowColor: 'rgba(255,120,0,0.7)',
    svgString: (s = 1) => `<svg width="${70*s}" height="${45*s}" viewBox="0 0 70 45">
      <ellipse cx="32" cy="22" rx="20" ry="13" fill="#ff6a00"/>
      <ellipse cx="32" cy="22" rx="20" ry="13" fill="none" stroke="#e05000" stroke-width="1.5"/>
      <ellipse cx="14" cy="22" rx="6" ry="9" fill="#ff6a00" stroke="#e05000" stroke-width="1"/>
      <ellipse cx="22" cy="22" rx="3" ry="10" fill="white" opacity="0.85"/>
      <ellipse cx="36" cy="22" rx="3" ry="10" fill="white" opacity="0.85"/>
      <path d="M52 22 L65 10 L65 34 Z" fill="#ff6a00" stroke="#e05000" stroke-width="1"/>
      <circle cx="14" cy="18" r="3" fill="white"/>
      <circle cx="14" cy="18" r="1.5" fill="#111"/>
      <circle cx="13.3" cy="17.3" r="0.5" fill="white"/>
      <path d="M25 12 Q30 5 38 10" stroke="#e05000" stroke-width="2" fill="none"/>
      <path d="M25 32 Q30 40 38 35" stroke="#e05000" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    id: 'tang', name: 'Tang Azul', price: 2, rarity: 'common',
    desc: 'Peixe azul vibrante com toque amarelo na cauda.',
    memo: 'buy:tang', glowColor: 'rgba(30,140,255,0.7)',
    svgString: (s = 1) => `<svg width="${70*s}" height="${50*s}" viewBox="0 0 70 50">
      <ellipse cx="32" cy="25" rx="20" ry="14" fill="#1a6ee0"/>
      <ellipse cx="14" cy="25" rx="7" ry="11" fill="#1a6ee0"/>
      <path d="M52 25 L66 12 L66 38 Z" fill="#ffcc00"/>
      <path d="M10 20 Q5 12 2 25 Q5 38 10 30 Z" fill="#1a6ee0"/>
      <path d="M20 11 Q32 25 20 39" stroke="#0040a0" stroke-width="2.5" fill="none"/>
      <path d="M46 15 Q55 25 46 35" stroke="#ffcc00" stroke-width="3" fill="none"/>
      <circle cx="14" cy="21" r="3" fill="white"/>
      <circle cx="14" cy="21" r="1.5" fill="#111"/>
      <circle cx="13.3" cy="20.3" r="0.5" fill="white"/>
    </svg>`,
  },
  {
    id: 'angelfish', name: 'Peixe-Anjo', price: 3, rarity: 'rare',
    desc: 'Elegante e majestoso. Nada lentamente em curvas graciosas.',
    memo: 'buy:angelfish', glowColor: 'rgba(180,100,255,0.65)',
    svgString: (s = 1) => `<svg width="${55*s}" height="${70*s}" viewBox="0 0 55 70">
      <ellipse cx="27" cy="35" rx="14" ry="20" fill="#c8a0f0"/>
      <path d="M20 15 Q27 0 34 15" fill="#a070e0" stroke="#8050c0" stroke-width="1"/>
      <path d="M20 55 Q27 70 34 55" fill="#a070e0" stroke="#8050c0" stroke-width="1"/>
      <path d="M22 16 Q20 35 22 54" stroke="#8050c0" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M32 16 Q34 35 32 54" stroke="#8050c0" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M41 35 L55 22 L55 48 Z" fill="#a070e0"/>
      <circle cx="18" cy="28" r="3.5" fill="white"/>
      <circle cx="18" cy="28" r="2" fill="#220044"/>
      <circle cx="17" cy="27" r="0.7" fill="white"/>
    </svg>`,
  },
  {
    id: 'pufferfish', name: 'Baiacu', price: 4, rarity: 'rare',
    desc: 'Barrigudo e espinhoso. Infla quando se sente ameaçado!',
    memo: 'buy:pufferfish', glowColor: 'rgba(255,210,0,0.7)',
    svgString: (s = 1) => `<svg width="${65*s}" height="${60*s}" viewBox="0 0 65 60">
      <defs><radialGradient id="pg${Math.round(s*10)}" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffe066"/><stop offset="60%" stop-color="#f0b800"/><stop offset="100%" stop-color="#c08000"/>
      </radialGradient></defs>
      <ellipse cx="30" cy="30" rx="24" ry="22" fill="url(#pg${Math.round(s*10)})"/>
      <ellipse cx="30" cy="36" rx="16" ry="12" fill="#fffbe0" opacity="0.5"/>
      <circle cx="20" cy="22" r="3" fill="#8a6000" opacity="0.45"/>
      <circle cx="34" cy="18" r="2.5" fill="#8a6000" opacity="0.4"/>
      <circle cx="44" cy="26" r="2" fill="#8a6000" opacity="0.4"/>
      <circle cx="22" cy="36" r="2.5" fill="#8a6000" opacity="0.35"/>
      <circle cx="38" cy="38" r="2" fill="#8a6000" opacity="0.35"/>
      <line x1="12" y1="22" x2="6" y2="16" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="16" x2="10" y2="9" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="22" y1="10" x2="20" y2="3" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="32" y1="8" x2="32" y2="1" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="42" y1="10" x2="44" y2="3" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="50" y1="16" x2="55" y2="10" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="40" x2="9" y2="46" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="24" y1="50" x2="22" y2="57" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="51" x2="36" y2="58" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="46" y1="46" x2="50" y2="52" stroke="#c09000" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M54 30 Q64 22 62 30 Q64 38 54 30 Z" fill="#f0b800" stroke="#c08000" stroke-width="1"/>
      <ellipse cx="8" cy="32" rx="3" ry="2.5" fill="#d09000"/>
      <ellipse cx="8" cy="32" rx="1.5" ry="1.2" fill="#804000"/>
      <circle cx="12" cy="24" r="5" fill="white"/>
      <circle cx="12" cy="24" r="3" fill="#1a1a00"/>
      <circle cx="11" cy="23" r="1.2" fill="white"/>
      <path d="M28 20 Q20 14 18 20 Q20 26 28 24 Z" fill="#f0c020" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'jellyfish', name: 'Água-Viva', price: 5, rarity: 'epic',
    desc: 'Flutuante e hipnótica. Brilha com luz própria nas profundezas.',
    memo: 'buy:jellyfish', glowColor: 'rgba(200,60,255,0.8)',
    svgString: (s = 1) => `<svg width="${55*s}" height="${70*s}" viewBox="0 0 55 70">
      <defs><radialGradient id="jg${Math.round(s*10)}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#e0a0ff" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#8020c0" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#4a00a0" stop-opacity="0.7"/>
      </radialGradient></defs>
      <path d="M5 30 Q5 5 27 5 Q49 5 49 30 Z" fill="url(#jg${Math.round(s*10)})"/>
      <path d="M5 30 Q5 5 27 5 Q49 5 49 30" stroke="rgba(220,160,255,0.6)" stroke-width="1.5" fill="none"/>
      <path d="M13 28 Q13 10 27 8 Q38 10 41 28" fill="rgba(255,255,255,0.14)"/>
      <path d="M12 30 Q9 42 12 52 Q9 60 10 65" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M18 30 Q15 43 18 54 Q15 62 16 68" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M27 31 Q25 44 27 56 Q25 64 27 70" stroke="#cc70ff" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M36 30 Q39 43 36 54 Q39 62 38 68" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <path d="M42 30 Q45 42 42 52 Q45 60 44 65" stroke="#d080ff" stroke-width="1.5" fill="none" opacity="0.75"/>
      <circle cx="18" cy="16" r="2.5" fill="rgba(255,220,255,0.8)"/>
      <circle cx="27" cy="12" r="2" fill="rgba(255,220,255,0.7)"/>
      <circle cx="36" cy="16" r="2" fill="rgba(255,220,255,0.7)"/>
    </svg>`,
  },
  {
    id: 'seahorse', name: 'Cavalo-Marinho', price: 6, rarity: 'epic',
    desc: 'Misterioso e delicado. Flutua verticalmente com graça.',
    memo: 'buy:seahorse', glowColor: 'rgba(240,160,40,0.75)',
    svgString: (s = 1) => `<svg width="${40*s}" height="${75*s}" viewBox="0 0 40 75">
      <path d="M20 12 Q30 12 30 22 Q30 32 22 35 Q28 40 28 50 Q28 62 20 65 Q12 62 12 50 Q12 40 18 35 Q10 32 10 22 Q10 12 20 12 Z" fill="#f0a030"/>
      <circle cx="20" cy="10" r="8" fill="#f0a030"/>
      <path d="M20 8 Q35 10 36 14" stroke="#d08020" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 28 Q40 25 38 32 Q36 38 28 33" fill="#e09025" opacity="0.7"/>
      <path d="M12 22 Q20 22 28 22" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M12 28 Q20 28 28 28" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M14 42 Q20 42 26 42" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <path d="M14 50 Q20 50 26 50" stroke="#d08020" stroke-width="1" opacity="0.5"/>
      <circle cx="24" cy="9" r="2.5" fill="white"/>
      <circle cx="24" cy="9" r="1.3" fill="#111"/>
      <circle cx="23.4" cy="8.4" r="0.4" fill="white"/>
      <path d="M15 4 L16 0 M20 3 L20 0 M24 4 L25 0" stroke="#d08020" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'dragon', name: 'Peixe-Dragão', price: 10, rarity: 'legendary',
    desc: 'Lendário das profundezas. Raridade extrema, brilho eterno.',
    memo: 'buy:dragon', glowColor: 'rgba(255,160,0,0.9)',
    svgString: (s = 1) => `<svg width="${90*s}" height="${55*s}" viewBox="0 0 90 55">
      <defs><linearGradient id="dg${Math.round(s*10)}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ff4400"/>
        <stop offset="50%" stop-color="#ff8800"/>
        <stop offset="100%" stop-color="#ffcc00"/>
      </linearGradient></defs>
      <ellipse cx="40" cy="27" rx="28" ry="16" fill="url(#dg${Math.round(s*10)})"/>
      <ellipse cx="16" cy="27" rx="9" ry="13" fill="#ff5500"/>
      <path d="M20 15 Q28 18 20 22" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M30 13 Q38 16 30 20" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M40 12 Q48 15 40 19" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M50 14 Q58 17 50 21" fill="rgba(255,100,0,0.3)" stroke="rgba(200,60,0,0.5)" stroke-width="0.5"/>
      <path d="M20 11 L23 3 L27 11 L31 2 L35 11 L39 4 L43 11 L47 3 L51 11 L55 6 L59 14" fill="#cc3300" stroke="#aa2200" stroke-width="1"/>
      <path d="M20 43 Q35 52 55 43" fill="#cc3300" opacity="0.7"/>
      <path d="M68 27 L85 12 L80 27 L85 42 Z" fill="#ff6600"/>
      <path d="M68 27 L82 15 M68 27 L82 39" stroke="#cc4400" stroke-width="2"/>
      <path d="M12 14 L9 6 M14 12 L14 5" stroke="#ffaa00" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="22" r="4" fill="#ffee00"/>
      <circle cx="12" cy="22" r="2" fill="#660000"/>
      <circle cx="11" cy="21" r="0.7" fill="white"/>
      <ellipse cx="40" cy="27" rx="30" ry="18" fill="none" stroke="rgba(255,180,0,0.2)" stroke-width="4"/>
    </svg>`,
  },
]

export const FISH_DIMS: Record<string, { w: number; h: number; cx: number; cy: number }> = {
  clownfish:  { w: 70, h: 45, cx: 35, cy: 22 },
  tang:       { w: 70, h: 50, cx: 35, cy: 25 },
  angelfish:  { w: 55, h: 70, cx: 27, cy: 35 },
  pufferfish: { w: 65, h: 60, cx: 32, cy: 30 },
  jellyfish:  { w: 55, h: 70, cx: 27, cy: 35 },
  seahorse:   { w: 40, h: 75, cx: 20, cy: 37 },
  dragon:     { w: 90, h: 55, cx: 45, cy: 27 },
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test hiveApi
```
Expected: PASS — 2 tests

- [ ] **Step 7: Commit**

```bash
git add src/data/ src/lib/
git commit -m "feat: add fishCatalog, hiveApi, hivePrice lib"
```

---

### Task 4: behaviors.ts

**Files:**
- Create: `src/engine/behaviors.ts`
- Create: `src/engine/behaviors.test.ts`

**Interfaces:**
- Consumes: nothing (pure functions)
- Produces:
  - `BehaviorName` type
  - `FishInstance` interface
  - `Particle` interface
  - `updateInstance(f, dt, bounds)` — mutates `f` in place
  - `pickBehavior(rarity)` — returns random valid behavior

- [ ] **Step 1: Write failing tests**

```ts
// src/engine/behaviors.test.ts
import { describe, it, expect } from 'vitest'
import { updateInstance, pickBehavior, createInstance } from './behaviors'
import type { Bounds } from './behaviors'

const BOUNDS: Bounds = { w: 1400, h: 900, floor: 783, ceil: 81, left: 14, right: 1358 }

describe('pickBehavior', () => {
  it('common fish never gets spiral or dash', () => {
    for (let i = 0; i < 50; i++) {
      const b = pickBehavior('common')
      expect(['cruise', 'wander', 'zigzag']).toContain(b)
    }
  })

  it('legendary fish can get any behavior', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(pickBehavior('legendary'))
    expect(seen.has('dash')).toBe(true)
    expect(seen.has('spiral')).toBe(true)
  })
})

describe('updateInstance — cruise', () => {
  it('moves fish horizontally each tick', () => {
    const f = createInstance('clownfish', 'common', 700, 400)
    f.behavior = 'cruise'
    const startX = f.x
    updateInstance(f, 1, BOUNDS)
    expect(f.x).not.toBe(startX)
  })
})

describe('updateInstance — bounds', () => {
  it('bounces fish off right wall', () => {
    const f = createInstance('clownfish', 'common', 1400, 400)
    f.vx = 5
    updateInstance(f, 1, BOUNDS)
    expect(f.vx).toBeLessThan(0)
    expect(f.x).toBeLessThanOrEqual(BOUNDS.right)
  })

  it('bounces fish off left wall', () => {
    const f = createInstance('clownfish', 'common', 0, 400)
    f.vx = -5
    updateInstance(f, 1, BOUNDS)
    expect(f.vx).toBeGreaterThan(0)
    expect(f.x).toBeGreaterThanOrEqual(BOUNDS.left)
  })

  it('bounces fish off floor', () => {
    const f = createInstance('clownfish', 'common', 700, 900)
    f.vy = 5
    updateInstance(f, 1, BOUNDS)
    expect(f.vy).toBeLessThan(0)
    expect(f.y).toBeLessThanOrEqual(BOUNDS.floor)
  })
})

describe('updateInstance — facing', () => {
  it('sets facing=1 when moving right', () => {
    const f = createInstance('clownfish', 'common', 400, 400)
    f.vx = 2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(1)
  })

  it('sets facing=-1 when moving left', () => {
    const f = createInstance('clownfish', 'common', 400, 400)
    f.vx = -2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(-1)
  })

  it('seahorse reverses facing logic', () => {
    const f = createInstance('seahorse', 'epic', 400, 400)
    f.vx = 2
    updateInstance(f, 1, BOUNDS)
    expect(f.facing).toBe(-1) // seahorse snout faces right naturally, so flip is reversed
  })
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npm test behaviors
```
Expected: FAIL — `Cannot find module './behaviors'`

- [ ] **Step 3: Implement `src/engine/behaviors.ts`**

```ts
// src/engine/behaviors.ts
import type { Rarity } from '../data/fishCatalog'

export type BehaviorName = 'cruise' | 'wander' | 'zigzag' | 'patrol' | 'spiral' | 'dash'

export interface Bounds {
  w: number; h: number
  floor: number; ceil: number; left: number; right: number
}

export interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  life: number; maxLife: number
  color: string
  grow: number
  buoyancy: number
  baseOpacity: number
}

export interface SpecialState {
  rotation: number
  scaleMultiplier: number
  glowExtra: number
  tentacleAlpha: number
  tentacleScaleY: number
}

export interface FishInstance {
  fishId: string
  rarity: Rarity
  x: number; y: number
  vx: number; vy: number
  facing: number
  behavior: BehaviorName
  behaviorTick: number
  baseScale: number
  bobPhase: number
  dashCooldown: number
  isDashing: boolean
  spiralAngle: number
  spiralCenterX: number
  spiralCenterY: number
  specialTimer: number
  specialActive: boolean
  specialPhase: number
  special: SpecialState
  particles: Particle[]
}

const BEHAVIORS: Record<Rarity, BehaviorName[]> = {
  common:    ['cruise', 'wander', 'zigzag'],
  rare:      ['cruise', 'wander', 'zigzag', 'patrol'],
  epic:      ['cruise', 'wander', 'zigzag', 'patrol', 'spiral'],
  legendary: ['cruise', 'wander', 'zigzag', 'patrol', 'spiral', 'dash'],
}

export function pickBehavior(rarity: Rarity): BehaviorName {
  const list = BEHAVIORS[rarity]
  return list[Math.floor(Math.random() * list.length)]
}

const BASE_SPEEDS: Record<Rarity, number> = { common: 0.5, rare: 0.65, epic: 0.8, legendary: 0.9 }
const MAX_SPEEDS:  Record<Rarity, number> = { common: 1.4, rare: 1.8, epic: 2.4, legendary: 4.5 }
const CHANGE_EVERY: Record<Rarity, number> = { common: 400, rare: 320, epic: 260, legendary: 200 }
const SPECIAL_INTERVAL = 1800

function defaultSpecial(): SpecialState {
  return { rotation: 0, scaleMultiplier: 1, glowExtra: 0, tentacleAlpha: 0.75, tentacleScaleY: 1 }
}

export function createInstance(fishId: string, rarity: Rarity, x: number, y: number): FishInstance {
  const baseScale =
    fishId === 'dragon'         ? 1.6 + Math.random() * 0.4
    : rarity === 'legendary'   ? 1.1 + Math.random() * 0.3
    : rarity === 'epic'        ? 0.9 + Math.random() * 0.3
    : 0.7 + Math.random() * 0.4

  const spd = BASE_SPEEDS[rarity] * (0.8 + Math.random() * 0.5)
  const angle = (Math.random() - 0.5) * 0.6
  const dirX = Math.random() > 0.5 ? 1 : -1
  const vx = Math.cos(angle) * spd * dirX
  const vy = Math.sin(angle) * spd * 0.4

  return {
    fishId, rarity,
    x, y, vx, vy,
    facing: vx >= 0 ? 1 : -1,
    behavior: pickBehavior(rarity),
    behaviorTick: 0,
    baseScale,
    bobPhase: Math.random() * Math.PI * 2,
    dashCooldown: 0,
    isDashing: false,
    spiralAngle: Math.random() * Math.PI * 2,
    spiralCenterX: x,
    spiralCenterY: y,
    specialTimer: Math.random() * SPECIAL_INTERVAL,
    specialActive: false,
    specialPhase: 0,
    special: defaultSpecial(),
    particles: [],
  }
}

export function updateInstance(f: FishInstance, dt: number, bounds: Bounds): void {
  f.behaviorTick += dt
  f.bobPhase += 0.03 * dt
  f.dashCooldown = Math.max(0, f.dashCooldown - dt)

  // Behavior
  switch (f.behavior) {
    case 'cruise':
      f.vy += Math.sin(f.bobPhase * 0.5) * 0.006 * dt
      f.vy *= 0.96
      break

    case 'wander': {
      const turn = (Math.random() - 0.5) * 0.05 * dt
      const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy) || 0.4
      const ang = Math.atan2(f.vy, f.vx) + turn
      f.vx = Math.cos(ang) * spd
      f.vy = Math.sin(ang) * spd * 0.5
      break
    }

    case 'zigzag':
      if (f.behaviorTick > 50 + Math.random() * 70) {
        f.vy = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8)
        f.behaviorTick = 0
      }
      break

    case 'patrol':
      f.vy *= 0.88
      if (Math.abs(f.vx) < 0.3) f.vx = 0.3 * f.facing
      break

    case 'spiral': {
      if (f.behaviorTick < 2) {
        f.spiralCenterX = f.x
        f.spiralCenterY = f.y
      }
      f.spiralAngle += 0.018 * dt
      const radius = 70 + f.baseScale * 20
      const targetX = f.spiralCenterX + Math.cos(f.spiralAngle) * radius
      const targetY = f.spiralCenterY + Math.sin(f.spiralAngle) * radius * 0.5
      f.vx += (targetX - f.x) * 0.012 * dt
      f.vy += (targetY - f.y) * 0.012 * dt
      f.vx *= 0.92
      f.vy *= 0.92
      break
    }

    case 'dash':
      if (!f.isDashing && f.dashCooldown === 0 && f.behaviorTick > 80) {
        f.vx = f.facing * (3.5 + Math.random() * 2.5)
        f.vy = (Math.random() - 0.5) * 0.8
        f.isDashing = true
        f.dashCooldown = 120 + Math.random() * 80
        f.behaviorTick = 0
      }
      if (f.isDashing) {
        f.vx *= 0.962
        f.vy *= 0.95
        if (Math.abs(f.vx) < 0.5) f.isDashing = false
      }
      break
  }

  // Auto-change behavior
  if (f.behaviorTick > (CHANGE_EVERY[f.rarity] || 350) + Math.random() * 150) {
    f.behavior = pickBehavior(f.rarity)
    f.behaviorTick = 0
  }

  // Speed cap
  const maxSpd = MAX_SPEEDS[f.rarity]
  const curSpd = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (curSpd > maxSpd) { f.vx = (f.vx / curSpd) * maxSpd; f.vy = (f.vy / curSpd) * maxSpd }

  // Min horizontal speed
  if (Math.abs(f.vx) < 0.2) f.vx = 0.2 * (f.vx >= 0 ? 1 : -1)

  // Move
  f.x += f.vx * dt
  f.y += f.vy * dt

  // Bounce
  if (f.x < bounds.left)  { f.x = bounds.left;  f.vx =  Math.abs(f.vx) * 0.85 }
  if (f.x > bounds.right) { f.x = bounds.right; f.vx = -Math.abs(f.vx) * 0.85 }
  if (f.y < bounds.ceil)  { f.y = bounds.ceil;  f.vy =  Math.abs(f.vy) * 0.7 }
  if (f.y > bounds.floor) { f.y = bounds.floor; f.vy = -Math.abs(f.vy) * 0.7 }

  // Facing (seahorse has reversed logic — snout points right in SVG)
  if (f.fishId === 'seahorse') {
    if (f.vx > 0.08)  f.facing = -1
    if (f.vx < -0.08) f.facing =  1
  } else {
    if (f.vx > 0.08)  f.facing =  1
    if (f.vx < -0.08) f.facing = -1
  }

  // Special animation tick
  tickSpecial(f, dt)

  // Particle tick
  f.particles = f.particles.filter(p => {
    p.life -= dt
    if (p.life <= 0) return false
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy -= p.buoyancy * dt
    p.vx *= 0.98
    return true
  })
}

function spawnParticle(f: FishInstance, opts: Omit<Particle, 'x' | 'y' | 'maxLife'>, offX = 0, offY = 0) {
  f.particles.push({ ...opts, x: f.x + offX, y: f.y + offY, maxLife: opts.life })
}

function tickSpecial(f: FishInstance, dt: number) {
  f.specialTimer += dt
  if (f.specialActive) {
    f.specialPhase += dt
    runSpecialFrame(f, dt)
  } else if (f.specialTimer > SPECIAL_INTERVAL) {
    f.specialTimer = 0
    f.specialActive = true
    f.specialPhase = 0
    f.special = defaultSpecial()
  }
}

function runSpecialFrame(f: FishInstance, dt: number) {
  const p = f.specialPhase

  switch (f.fishId) {

    // Pufferfish: inflate 90t → hold 120t → deflate 90t
    case 'pufferfish': {
      if (p < 90) {
        const t = p / 90
        f.special.scaleMultiplier = 1 + t * 0.75
        f.special.glowExtra = t * 24
      } else if (p < 210) {
        f.special.scaleMultiplier = 1.75
        if (Math.floor(p) === 100) {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2
            spawnParticle(f, { vx: Math.cos(a)*1.5, vy: Math.sin(a)*1.5, color:'rgba(255,220,50,0.9)', size:5, life:40, grow:0.5, buoyancy:0, baseOpacity:0.85 })
          }
        }
      } else if (p < 300) {
        const t = (p - 210) / 90
        f.special.scaleMultiplier = 1.75 - t * 0.75
        f.special.glowExtra = (1 - t) * 24
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Dragon: charge 60t → fire 100t
    case 'dragon': {
      if (p < 60) {
        const t = p / 60
        f.special.glowExtra = t * 38
        f.special.rotation = Math.sin(p * 0.8) * t * 3
      } else if (p < 160) {
        const t2 = p - 60
        f.special.rotation = 0
        f.special.glowExtra = 38 * (1 - t2 / 100)
        if (Math.floor(p) % 8 === 0) {
          const fireDir = f.facing === 1 ? 1 : -1
          for (let i = 0; i < 3; i++) {
            const colors = ['rgba(255,60,0,0.95)', 'rgba(255,160,0,0.9)', 'rgba(255,230,60,0.85)']
            spawnParticle(f, { vx: fireDir*(2+Math.random()*2.5), vy:(Math.random()-0.5)*0.8, color:colors[i], size:7+Math.random()*11, life:55+Math.random()*35, grow:1.3, buoyancy:0.03+Math.random()*0.035, baseOpacity:0.92 }, fireDir * 30, 0)
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Jellyfish: retract 80t → hold 40t → expand 60t → glow 70t
    case 'jellyfish': {
      if (p < 80) {
        const t = p / 80
        f.special.tentacleAlpha = 0.75 * (1 - t)
        f.special.tentacleScaleY = 1 - t * 0.7
        f.special.glowExtra = t * 24
        f.special.scaleMultiplier = 1 - t * 0.1
      } else if (p < 120) {
        f.special.glowExtra = 50
      } else if (p < 180) {
        const t = (p - 120) / 60
        f.special.tentacleAlpha = t * 0.75
        f.special.tentacleScaleY = t * 1.1
        f.special.glowExtra = 24 * (1 - t)
        f.special.scaleMultiplier = 1 + Math.sin(t * Math.PI) * 0.25
        if (Math.floor(p) === 122) {
          const txs = [12, 18, 27, 36, 42]
          txs.forEach(tx => {
            for (let i = 0; i < 2; i++) {
              spawnParticle(f, { vx:(Math.random()-0.5)*1.2, vy:-0.5-Math.random()*0.8, color:`rgba(${210+Math.floor(Math.random()*45)},${80+Math.floor(Math.random()*80)},255,0.88)`, size:5+Math.random()*7, life:90+Math.random()*60, grow:0.25, buoyancy:0.07, baseOpacity:0.88 }, tx - 27, 35)
            }
          })
        }
      } else if (p < 250) {
        const t = (p - 180) / 70
        f.special.glowExtra = 8 * (1 - t)
        f.special.scaleMultiplier = 1
        f.special.tentacleAlpha = 0.75
        f.special.tentacleScaleY = 1
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Seahorse: spin 2 full rotations in 180t
    case 'seahorse': {
      if (p < 180) {
        f.special.rotation = (p / 180) * 720
        f.special.glowExtra = Math.sin((p / 180) * Math.PI) * 20
        if (Math.floor(p) % 8 === 0) {
          const a = f.special.rotation * Math.PI / 180
          for (let i = 0; i < 3; i++) {
            const angle = a + (i / 3) * Math.PI * 2
            spawnParticle(f, { vx:Math.cos(angle)*(1+Math.random()*0.8), vy:Math.sin(angle)*(0.5+Math.random()*0.4), color:`rgba(255,${160+Math.floor(Math.random()*95)},${30+Math.floor(Math.random()*80)},0.92)`, size:4+Math.random()*5, life:55, grow:0.15, buoyancy:0.03, baseOpacity:0.92 })
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Angelfish: figure-8 shimmer 100t
    case 'angelfish': {
      if (p < 100) {
        const t = p / 100
        f.special.rotation = Math.sin(t * Math.PI * 2) * 12
        f.special.glowExtra = Math.abs(Math.sin(t * Math.PI * 4)) * 18
        if (Math.floor(p) % 12 === 0) {
          for (let i = 0; i < 3; i++) {
            spawnParticle(f, { vx:(Math.random()-0.5)*1.2, vy:-0.5-Math.random()*0.5, color:'rgba(230,200,255,0.9)', size:3+Math.random()*4, life:45, grow:0.1, buoyancy:0.04, baseOpacity:0.9 })
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Clownfish: excited wiggle 80t
    case 'clownfish': {
      if (p < 80) {
        f.special.rotation = Math.sin(p * 0.6) * 8
        if (Math.floor(p) % 10 === 0) {
          spawnParticle(f, { vx:(Math.random()-0.5)*0.6, vy:-0.6-Math.random()*0.4, color:'rgba(200,240,255,0.8)', size:4+Math.random()*4, life:60, grow:0.4, buoyancy:0.08, baseOpacity:0.75 })
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    // Tang: flash 20t then burst streak 80t
    case 'tang': {
      if (p < 20) {
        f.special.glowExtra = 30
      } else if (p < 100) {
        const burstDir = f.facing === 1 ? 1 : -1
        if (Math.floor(p) === 20) { f.vx = burstDir * 5.5; f.vy *= 0.2 }
        const glowT = 1 - (p - 20) / 80
        f.special.glowExtra = glowT * 18
        f.vx *= 0.96
        spawnParticle(f, { vx:-burstDir*(0.5+Math.random()*0.5), vy:(Math.random()-0.5)*0.4, color:Math.floor(p)%3===0?'rgba(255,220,0,0.8)':'rgba(60,180,255,0.75)', size:8+Math.random()*12, life:20+Math.random()*15, grow:0, buoyancy:0, baseOpacity:0.75 }, -burstDir*15, (Math.random()-0.5)*8)
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    default:
      f.specialActive = false
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test behaviors
```
Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/engine/behaviors.ts src/engine/behaviors.test.ts
git commit -m "feat: port fish behavior engine to TypeScript"
```

---

### Task 5: fishPaths.ts

**Files:**
- Create: `src/engine/fishPaths.ts`
- Create: `src/engine/fishPaths.test.ts`

**Interfaces:**
- Consumes: `CanvasRenderingContext2D`, `SpecialState` from behaviors
- Produces: `FISH_DRAW_FNS: Record<string, DrawFn>` where `DrawFn = (ctx, special) => void`

- [ ] **Step 1: Write failing tests**

```ts
// src/engine/fishPaths.test.ts
import { describe, it, expect, vi } from 'vitest'
import { FISH_DRAW_FNS } from './fishPaths'
import type { SpecialState } from './behaviors'

const defaultSpecial: SpecialState = {
  rotation: 0, scaleMultiplier: 1, glowExtra: 0, tentacleAlpha: 0.75, tentacleScaleY: 1,
}

function mockCtx() {
  return {
    save: vi.fn(), restore: vi.fn(),
    beginPath: vi.fn(), closePath: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    scale: vi.fn(), rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
  } as unknown as CanvasRenderingContext2D
}

const FISH_IDS = ['clownfish','tang','angelfish','pufferfish','jellyfish','seahorse','dragon']

FISH_IDS.forEach(id => {
  it(`${id} draw function exists and does not throw`, () => {
    expect(FISH_DRAW_FNS[id]).toBeDefined()
    const ctx = mockCtx()
    expect(() => FISH_DRAW_FNS[id](ctx, defaultSpecial)).not.toThrow()
  })

  it(`${id} calls ctx.save and ctx.restore`, () => {
    const ctx = mockCtx()
    FISH_DRAW_FNS[id](ctx, defaultSpecial)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test fishPaths
```
Expected: FAIL — `Cannot find module './fishPaths'`

- [ ] **Step 3: Implement `src/engine/fishPaths.ts`**

```ts
// src/engine/fishPaths.ts
import type { SpecialState } from './behaviors'

export type DrawFn = (ctx: CanvasRenderingContext2D, special: SpecialState) => void

function applyGlow(ctx: CanvasRenderingContext2D, color: string, blur: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = blur
}

function clearGlow(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
}

function drawClownfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  // body
  ctx.beginPath()
  ctx.ellipse(32, 22, 20, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // head
  ctx.beginPath()
  ctx.ellipse(14, 22, 6, 9, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1
  ctx.stroke()

  // white stripes
  ctx.globalAlpha = 0.85
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(22, 22, 3, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(36, 22, 3, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // tail
  ctx.beginPath()
  ctx.moveTo(52, 22); ctx.lineTo(65, 10); ctx.lineTo(65, 34); ctx.closePath()
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1
  ctx.stroke()

  // eye
  ctx.beginPath(); ctx.arc(14, 18, 3, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill()
  ctx.beginPath(); ctx.arc(14, 18, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(13.3, 17.3, 0.5, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill()

  // fins
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(25,12); ctx.quadraticCurveTo(30,5,38,10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(25,32); ctx.quadraticCurveTo(30,40,38,35); ctx.stroke()

  ctx.restore()
}

function drawTang(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.beginPath(); ctx.ellipse(32,25,20,14,0,0,Math.PI*2); ctx.fillStyle='#1a6ee0'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(14,25,7,11,0,0,Math.PI*2); ctx.fillStyle='#1a6ee0'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(52,25); ctx.lineTo(66,12); ctx.lineTo(66,38); ctx.closePath()
  ctx.fillStyle='#ffcc00'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(10,20); ctx.quadraticCurveTo(5,12,2,25); ctx.quadraticCurveTo(5,38,10,30); ctx.closePath()
  ctx.fillStyle='#1a6ee0'; ctx.fill()

  ctx.strokeStyle='#0040a0'; ctx.lineWidth=2.5
  ctx.beginPath(); ctx.moveTo(20,11); ctx.quadraticCurveTo(32,25,20,39); ctx.stroke()

  ctx.strokeStyle='#ffcc00'; ctx.lineWidth=3
  ctx.beginPath(); ctx.moveTo(46,15); ctx.quadraticCurveTo(55,25,46,35); ctx.stroke()

  ctx.beginPath(); ctx.arc(14,21,3,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(14,21,1.5,0,Math.PI*2); ctx.fillStyle='#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(13.3,20.3,0.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.restore()
}

function drawAngelfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.beginPath(); ctx.ellipse(27,35,14,20,0,0,Math.PI*2); ctx.fillStyle='#c8a0f0'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(20,15); ctx.quadraticCurveTo(27,0,34,15); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill(); ctx.strokeStyle='#8050c0'; ctx.lineWidth=1; ctx.stroke()

  ctx.beginPath(); ctx.moveTo(20,55); ctx.quadraticCurveTo(27,70,34,55); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill(); ctx.strokeStyle='#8050c0'; ctx.lineWidth=1; ctx.stroke()

  ctx.globalAlpha=0.7; ctx.strokeStyle='#8050c0'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(22,16); ctx.quadraticCurveTo(20,35,22,54); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(32,16); ctx.quadraticCurveTo(34,35,32,54); ctx.stroke()
  ctx.globalAlpha=1

  ctx.beginPath(); ctx.moveTo(41,35); ctx.lineTo(55,22); ctx.lineTo(55,48); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill()

  ctx.beginPath(); ctx.arc(18,28,3.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(18,28,2,0,Math.PI*2); ctx.fillStyle='#220044'; ctx.fill()
  ctx.beginPath(); ctx.arc(17,27,0.7,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.restore()
}

function drawPufferfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.scale(special.scaleMultiplier, special.scaleMultiplier)
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createRadialGradient(29,24,0,29,24,36)
  grad.addColorStop(0,'#ffe066'); grad.addColorStop(0.6,'#f0b800'); grad.addColorStop(1,'#c08000')

  ctx.beginPath(); ctx.ellipse(30,30,24,22,0,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()

  ctx.globalAlpha=0.5
  ctx.beginPath(); ctx.ellipse(30,36,16,12,0,0,Math.PI*2); ctx.fillStyle='#fffbe0'; ctx.fill()
  ctx.globalAlpha=1

  const spots:number[][] = [[20,22,3,0.45],[34,18,2.5,0.4],[44,26,2,0.4],[22,36,2.5,0.35],[38,38,2,0.35],[28,28,1.5,0.3]]
  spots.forEach(([cx,cy,r,a]) => {
    ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#8a6000'; ctx.fill()
  })
  ctx.globalAlpha=1

  ctx.strokeStyle='#c09000'; ctx.lineWidth=1.5; ctx.lineCap='round'
  const spines:number[][] = [[12,22,6,16],[14,16,10,9],[22,10,20,3],[32,8,32,1],[42,10,44,3],[50,16,55,10],[14,40,9,46],[24,50,22,57],[36,51,36,58],[46,46,50,52]]
  spines.forEach(([x1,y1,x2,y2]) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke() })

  ctx.beginPath(); ctx.moveTo(54,30); ctx.quadraticCurveTo(64,22,62,30); ctx.quadraticCurveTo(64,38,54,30); ctx.closePath()
  ctx.fillStyle='#f0b800'; ctx.fill(); ctx.strokeStyle='#c08000'; ctx.lineWidth=1; ctx.stroke()

  ctx.beginPath(); ctx.ellipse(8,32,3,2.5,0,0,Math.PI*2); ctx.fillStyle='#d09000'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,32,1.5,1.2,0,0,Math.PI*2); ctx.fillStyle='#804000'; ctx.fill()

  ctx.beginPath(); ctx.arc(12,24,5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(12,24,3,0,Math.PI*2); ctx.fillStyle='#1a1a00'; ctx.fill()
  ctx.beginPath(); ctx.arc(11,23,1.2,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.globalAlpha=0.8
  ctx.beginPath(); ctx.moveTo(28,20); ctx.quadraticCurveTo(20,14,18,20); ctx.quadraticCurveTo(20,26,28,24); ctx.closePath()
  ctx.fillStyle='#f0c020'; ctx.fill()
  ctx.globalAlpha=1

  ctx.restore()
}

function drawJellyfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createRadialGradient(27.5,18,0,27.5,18,28)
  grad.addColorStop(0,'rgba(224,160,255,0.95)')
  grad.addColorStop(0.7,'rgba(128,32,192,0.8)')
  grad.addColorStop(1,'rgba(74,0,160,0.7)')

  // dome
  ctx.beginPath(); ctx.moveTo(5,30); ctx.quadraticCurveTo(5,5,27,5); ctx.quadraticCurveTo(49,5,49,30); ctx.closePath()
  ctx.fillStyle=grad; ctx.fill()
  ctx.strokeStyle='rgba(220,160,255,0.6)'; ctx.lineWidth=1.5; ctx.stroke()

  // inner highlight
  ctx.beginPath(); ctx.moveTo(13,28); ctx.quadraticCurveTo(13,10,27,8); ctx.quadraticCurveTo(38,10,41,28); ctx.closePath()
  ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.fill()

  // tentacles
  const tentacles:[string,string,number,number][] = [
    ['M12,30 Q9,42 12,52 Q9,60 10,65','#d080ff',1.5,0.75],
    ['M18,30 Q15,43 18,54 Q15,62 16,68','#d080ff',1.5,0.75],
    ['M27,31 Q25,44 27,56 Q25,64 27,70','#cc70ff',2,0.8],
    ['M36,30 Q39,43 36,54 Q39,62 38,68','#d080ff',1.5,0.75],
    ['M42,30 Q45,42 42,52 Q45,60 44,65','#d080ff',1.5,0.75],
  ]
  tentacles.forEach(([d,color,lw,alpha]) => {
    ctx.save()
    ctx.globalAlpha = alpha * special.tentacleAlpha
    if (special.tentacleScaleY !== 1) ctx.scale(1, special.tentacleScaleY)
    ctx.strokeStyle=color; ctx.lineWidth=lw
    const coords = d.replace(/[MmQq]/g,'').split(/[\s,]+/).map(Number)
    ctx.beginPath(); ctx.moveTo(coords[0],coords[1])
    ctx.quadraticCurveTo(coords[2],coords[3],coords[4],coords[5])
    ctx.quadraticCurveTo(coords[6],coords[7],coords[8],coords[9])
    ctx.stroke()
    ctx.restore()
  })

  // bioluminescent dots
  [[18,16,2.5,0.8],[27,12,2,0.7],[36,16,2,0.7],[22,22,1.5,0.6],[32,20,1.5,0.6]].forEach(([x,y,r,a]) => {
    ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='rgba(255,220,255,0.9)'; ctx.fill()
  })
  ctx.globalAlpha=1

  ctx.restore()
}

function drawSeahorse(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.fillStyle='#f0a030'
  // body
  ctx.beginPath()
  ctx.moveTo(20,12); ctx.quadraticCurveTo(30,12,30,22); ctx.quadraticCurveTo(30,32,22,35)
  ctx.quadraticCurveTo(28,40,28,50); ctx.quadraticCurveTo(28,62,20,65)
  ctx.quadraticCurveTo(12,62,12,50); ctx.quadraticCurveTo(12,40,18,35)
  ctx.quadraticCurveTo(10,32,10,22); ctx.quadraticCurveTo(10,12,20,12)
  ctx.fill()

  // head
  ctx.beginPath(); ctx.arc(20,10,8,0,Math.PI*2); ctx.fill()

  // snout
  ctx.strokeStyle='#d08020'; ctx.lineWidth=3; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(20,8); ctx.quadraticCurveTo(35,10,36,14); ctx.stroke()

  // pectoral fin
  ctx.globalAlpha=0.7; ctx.fillStyle='#e09025'
  ctx.beginPath(); ctx.moveTo(30,28); ctx.quadraticCurveTo(40,25,38,32); ctx.quadraticCurveTo(36,38,28,33); ctx.closePath(); ctx.fill()
  ctx.globalAlpha=1

  // stripes
  ctx.strokeStyle='#d08020'; ctx.lineWidth=1; ctx.globalAlpha=0.5
  [[12,22,28,22],[12,28,28,28],[14,42,26,42],[14,50,26,50]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })
  ctx.globalAlpha=1

  ctx.beginPath(); ctx.arc(24,9,2.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(24,9,1.3,0,Math.PI*2); ctx.fillStyle='#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(23.4,8.4,0.4,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  // crown spikes
  ctx.strokeStyle='#d08020'; ctx.lineWidth=1.5
  [[15,4,16,0],[20,3,20,0],[24,4,25,0]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })

  ctx.restore()
}

function drawDragon(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createLinearGradient(0,0,90,0)
  grad.addColorStop(0,'#ff4400'); grad.addColorStop(0.5,'#ff8800'); grad.addColorStop(1,'#ffcc00')

  ctx.beginPath(); ctx.ellipse(40,27,28,16,0,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()
  ctx.beginPath(); ctx.ellipse(16,27,9,13,0,0,Math.PI*2); ctx.fillStyle='#ff5500'; ctx.fill()

  // scale patches
  const scaleSegs:number[][] = [[20,15,28,18,20,22],[30,13,38,16,30,20],[40,12,48,15,40,19],[50,14,58,17,50,21]]
  scaleSegs.forEach(([mx,my,cx,cy,ex,ey]) => {
    ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(cx,cy,ex,ey); ctx.closePath()
    ctx.fillStyle='rgba(255,100,0,0.3)'; ctx.fill()
    ctx.strokeStyle='rgba(200,60,0,0.5)'; ctx.lineWidth=0.5; ctx.stroke()
  })

  // dorsal spines
  ctx.beginPath()
  ctx.moveTo(20,11); ctx.lineTo(23,3); ctx.lineTo(27,11); ctx.lineTo(31,2); ctx.lineTo(35,11)
  ctx.lineTo(39,4); ctx.lineTo(43,11); ctx.lineTo(47,3); ctx.lineTo(51,11); ctx.lineTo(55,6); ctx.lineTo(59,14)
  ctx.fillStyle='#cc3300'; ctx.fill(); ctx.strokeStyle='#aa2200'; ctx.lineWidth=1; ctx.stroke()

  // belly
  ctx.globalAlpha=0.7
  ctx.beginPath(); ctx.moveTo(20,43); ctx.quadraticCurveTo(35,52,55,43); ctx.closePath()
  ctx.fillStyle='#cc3300'; ctx.fill()
  ctx.globalAlpha=1

  // tail
  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(85,12); ctx.lineTo(80,27); ctx.lineTo(85,42); ctx.closePath()
  ctx.fillStyle='#ff6600'; ctx.fill()
  ctx.strokeStyle='#cc4400'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(82,15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(82,39); ctx.stroke()

  // horns
  ctx.strokeStyle='#ffaa00'; ctx.lineWidth=2; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(12,14); ctx.lineTo(9,6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14,12); ctx.lineTo(14,5); ctx.stroke()

  ctx.beginPath(); ctx.arc(12,22,4,0,Math.PI*2); ctx.fillStyle='#ffee00'; ctx.fill()
  ctx.beginPath(); ctx.arc(12,22,2,0,Math.PI*2); ctx.fillStyle='#660000'; ctx.fill()
  ctx.beginPath(); ctx.arc(11,21,0.7,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  // glow ring
  ctx.globalAlpha=0.2
  ctx.beginPath(); ctx.ellipse(40,27,30,18,0,0,Math.PI*2)
  ctx.strokeStyle='rgba(255,180,0,1)'; ctx.lineWidth=4; ctx.stroke()
  ctx.globalAlpha=1

  ctx.restore()
}

export const FISH_DRAW_FNS: Record<string, DrawFn> = {
  clownfish:  drawClownfish,
  tang:       drawTang,
  angelfish:  drawAngelfish,
  pufferfish: drawPufferfish,
  jellyfish:  drawJellyfish,
  seahorse:   drawSeahorse,
  dragon:     drawDragon,
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test fishPaths
```
Expected: PASS — 14 tests (2 per fish × 7 fish)

- [ ] **Step 5: Commit**

```bash
git add src/engine/fishPaths.ts src/engine/fishPaths.test.ts
git commit -m "feat: Canvas 2D draw functions for all 7 fish types"
```

---

### Task 6: fishEngine.ts

**Files:**
- Create: `src/engine/fishEngine.ts`
- Create: `src/engine/fishEngine.test.ts`

**Interfaces:**
- Consumes: `FishInstance`, `updateInstance` from behaviors; `FISH_DRAW_FNS`, `FISH_DIMS` from fishPaths/fishCatalog
- Produces:
  ```ts
  export interface FishEngine {
    spawnFish(fishId: string, opts?: { owner?: string }): void
    clearFish(): void
    destroy(): void
  }
  export function initEngine(canvas: HTMLCanvasElement): FishEngine
  ```

- [ ] **Step 1: Write failing tests**

```ts
// src/engine/fishEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initEngine } from './fishEngine'

function makeCanvas() {
  const mockCtx = {
    clearRect: vi.fn(), drawImage: vi.fn(),
    save: vi.fn(), restore: vi.fn(),
    beginPath: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(), rect: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), quadraticCurveTo: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: '', strokeStyle: '', globalAlpha: 1,
    shadowBlur: 0, shadowColor: '', lineWidth: 1, lineCap: 'butt',
    rotate: vi.fn(), scale: vi.fn(), translate: vi.fn(),
  }

  const canvas = {
    width: 1400, height: 900,
    getContext: vi.fn(() => mockCtx),
    addEventListener: vi.fn(),
  } as unknown as HTMLCanvasElement

  return { canvas, mockCtx }
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('performance', { now: vi.fn(() => 0) })
})

describe('initEngine', () => {
  it('returns engine with spawnFish, clearFish, destroy', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(typeof engine.spawnFish).toBe('function')
    expect(typeof engine.clearFish).toBe('function')
    expect(typeof engine.destroy).toBe('function')
  })

  it('spawnFish with valid fishId does not throw', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(() => engine.spawnFish('clownfish')).not.toThrow()
  })

  it('spawnFish with unknown fishId is silently ignored', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    expect(() => engine.spawnFish('unknown-fish')).not.toThrow()
  })

  it('clearFish removes all fish', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    engine.spawnFish('clownfish')
    engine.spawnFish('tang')
    engine.clearFish()
    // spawning again should work fine (no crash from cleared state)
    expect(() => engine.spawnFish('clownfish')).not.toThrow()
  })

  it('destroy cancels animation frame', () => {
    const { canvas } = makeCanvas()
    const engine = initEngine(canvas)
    engine.destroy()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test fishEngine
```
Expected: FAIL — `Cannot find module './fishEngine'`

- [ ] **Step 3: Implement `src/engine/fishEngine.ts`**

```ts
// src/engine/fishEngine.ts
import { FISH_CATALOG, FISH_DIMS } from '../data/fishCatalog'
import { FISH_DRAW_FNS } from './fishPaths'
import { createInstance, updateInstance, type FishInstance } from './behaviors'
import type { Rarity } from '../data/fishCatalog'

export interface FishEngine {
  spawnFish(fishId: string, opts?: { owner?: string }): void
  clearFish(): void
  destroy(): void
}

const RARITY_GLOW: Record<Rarity, number> = { common: 0, rare: 8, epic: 16, legendary: 28 }

function buildOffscreenDecorations(w: number, h: number): OffscreenCanvas | HTMLCanvasElement {
  const offscreen = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : (() => { const c = document.createElement('canvas'); c.width=w; c.height=h; return c })()

  const ctx = offscreen.getContext('2d') as CanvasRenderingContext2D
  if (!ctx) return offscreen

  const isMobile = w < 500
  const isTablet = w >= 500 && w < 900
  const sc = Math.min(1, w / 1400)
  const floorH = Math.round(h * 0.10)

  // Sand base
  const sandGrad = ctx.createLinearGradient(0, h - floorH * 1.1, 0, h)
  sandGrad.addColorStop(0, 'transparent')
  sandGrad.addColorStop(0.25, 'rgba(40,30,15,0.5)')
  sandGrad.addColorStop(1, 'rgba(20,15,8,0.95)')
  ctx.fillStyle = sandGrad
  ctx.fillRect(0, h - floorH * 1.1, w, floorH * 1.1)

  // Pebble colors
  const pebbleColors = ['#4a7a9b','#5b8fa8','#3d6b82','#6a9db5','#c8a96e','#b09060','#8a7050','#5d9eb8','#d4b878','#a08048']
  const pebbleCount = isMobile ? 80 : isTablet ? 150 : 250

  for (let i = 0; i < pebbleCount; i++) {
    const sz = (3 + Math.random() * 9) * Math.max(0.5, sc)
    const left = Math.random() * w
    const bottom = 1 + Math.random() * floorH * 0.35
    const col = pebbleColors[Math.floor(Math.random() * pebbleColors.length)]
    ctx.globalAlpha = 0.5 + Math.random() * 0.6
    ctx.beginPath()
    ctx.ellipse(left, h - bottom, sz, sz * 0.62, 0, 0, Math.PI * 2)
    ctx.fillStyle = col
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Plants
  const plantDefs = [
    { x: 0.02, color: '#cc2222', hFrac: 0.16 }, { x: 0.07, color: '#dd3322', hFrac: 0.12 },
    { x: 0.13, color: '#1a88ee', hFrac: 0.17 }, { x: 0.19, color: '#22aa44', hFrac: 0.14 },
    { x: 0.26, color: '#2244ee', hFrac: 0.18 }, { x: 0.33, color: '#22cc44', hFrac: 0.13 },
    { x: 0.39, color: '#aa22dd', hFrac: 0.16 }, { x: 0.45, color: '#22cc88', hFrac: 0.12 },
    { x: 0.51, color: '#ee44aa', hFrac: 0.17 }, { x: 0.57, color: '#22aa44', hFrac: 0.14 },
    { x: 0.63, color: '#ee44aa', hFrac: 0.14 }, { x: 0.69, color: '#1a88ee', hFrac: 0.16 },
    { x: 0.75, color: '#aa22dd', hFrac: 0.13 }, { x: 0.80, color: '#cc2222', hFrac: 0.15 },
  ]
  const step = isMobile ? 3 : isTablet ? 2 : 1
  const baseY = h - floorH * 0.95

  plantDefs.filter((_, i) => i % step === 0).forEach(pl => {
    const plantH = Math.min(h * 0.40, pl.hFrac * h)
    drawPlantOnCanvas(ctx, pl.x * w, baseY, pl.color, plantH)
  })

  // Corals (tablet+)
  if (!isMobile) {
    const corals = [
      { x: 0.44, color: '#ff5566', h: 0.08 },
      { x: 0.62, color: '#ff3344', h: 0.065 },
      { x: 0.48, color: '#ff7744', h: 0.058 },
    ]
    corals.forEach(c => {
      drawCoralOnCanvas(ctx, c.x * w, baseY, c.color, Math.min(h * 0.12, c.h * h))
    })
  }

  // Logs (tablet+)
  if (!isMobile) {
    const logW = Math.round(130 * sc)
    ;[[0.18, logW, -7, '#3d2810'], [0.52, Math.round(logW*0.75), 4, '#4a3218']].forEach(([xFrac, lw, rot, col]) => {
      ctx.save()
      ctx.translate((xFrac as number) * w + (lw as number) / 2, h - floorH * 0.98)
      ctx.rotate((rot as number) * Math.PI / 180)
      const lh = Math.round(17 * sc)
      if (lh >= 4) {
        const lg = ctx.createLinearGradient(0, -lh, 0, 0)
        lg.addColorStop(0, shadeHex(col as string, 20))
        lg.addColorStop(1, '#1a1008')
        ctx.fillStyle = lg
        ctx.beginPath()
        ctx.roundRect(-(lw as number)/2, -lh, lw as number, lh, lh / 2)
        ctx.fill()
      }
      ctx.restore()
    })
  }

  return offscreen
}

function drawPlantOnCanvas(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string, h: number) {
  const dark = shadeHex(color, -40)
  const light = shadeHex(color, 30)
  const numLeaves = 4 + Math.floor(h / 35)
  const mid = x

  // stem
  ctx.strokeStyle = dark; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mid, baseY)
  ctx.quadraticCurveTo(mid + 3, baseY - h * 0.4, mid - 2, baseY - h * 0.7)
  ctx.quadraticCurveTo(mid + 1, baseY - h * 0.85, mid, baseY - h)
  ctx.stroke()

  for (let i = 0; i < numLeaves; i++) {
    const y = baseY - 15 - i * (h * 0.7 / numLeaves)
    const side = i % 2 === 0 ? 1 : -1
    const lw = 12 + Math.random() * 8
    const lh = 18 + Math.random() * 10
    const cx = mid + side * lw * 0.5
    ctx.globalAlpha = 0.85 + Math.random() * 0.15
    ctx.fillStyle = i % 3 === 0 ? light : color
    ctx.beginPath()
    ctx.ellipse(cx, y, lw * 0.5, lh * 0.35, side * 25 * Math.PI / 180, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // top flourish
  ctx.fillStyle = light; ctx.globalAlpha = 0.9
  ctx.beginPath(); ctx.ellipse(mid, baseY - h, 7, 12, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = color; ctx.globalAlpha = 0.8
  ctx.beginPath(); ctx.ellipse(mid - 5, baseY - h + 4, 5, 9, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(mid + 5, baseY - h + 4, 5, 9, 0, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
}

function drawCoralOnCanvas(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string, h: number) {
  const dark = shadeHex(color, -30)
  ctx.lineWidth = 4.5; ctx.lineCap = 'round'

  ctx.strokeStyle = color
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x-11, baseY-h*0.45, x-9, baseY-h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x+11, baseY-h*0.45, x+9, baseY-h); ctx.stroke()
  ctx.lineWidth = 5.5
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, baseY-h*0.72); ctx.stroke()
  ctx.lineWidth = 3; ctx.strokeStyle = dark
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x-14, baseY-h*0.3, x-14, baseY-h*0.4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x+14, baseY-h*0.3, x+14, baseY-h*0.4); ctx.stroke()

  ctx.fillStyle = color
  ;[[-9,-h],[9,-h],[0,-h*0.72-8],[-14,-h*0.4],[14,-h*0.4]].forEach(([ox,oy],i) => {
    ctx.beginPath(); ctx.arc(x+(ox as number), baseY+(oy as number), i===2?6.5:i<3?5.5:4, 0, Math.PI*2); ctx.fill()
  })
}

function shadeHex(hex: string, pct: number): string {
  if (!hex.startsWith('#')) return hex
  let r = parseInt(hex.slice(1,3),16)
  let g = parseInt(hex.slice(3,5),16)
  let b = parseInt(hex.slice(5,7),16)
  r = Math.max(0, Math.min(255, r + Math.round(pct * 2.55)))
  g = Math.max(0, Math.min(255, g + Math.round(pct * 2.55)))
  b = Math.max(0, Math.min(255, b + Math.round(pct * 2.55)))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

export function initEngine(canvas: HTMLCanvasElement): FishEngine {
  const ctx = canvas.getContext('2d')!
  let instances: FishInstance[] = []
  let rafId: number | null = null
  let offscreen = buildOffscreenDecorations(canvas.width, canvas.height)
  let last = performance.now()

  // Animated bubbles
  const bubbles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * (0.85 + Math.random() * 0.1),
    r: 3 + Math.random() * 12,
    speed: (5 + Math.random() * 10) * 0.01,
    drift: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
    opacity: 0,
  }))

  function loop(now: number) {
    const dt = Math.min((now - last) / 16.67, 3)
    last = now

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Static decorations
    ctx.drawImage(offscreen as CanvasImageSource, 0, 0)

    // Bubbles
    bubbles.forEach(b => {
      b.y -= b.speed * dt * 60
      b.x += b.drift * dt
      b.phase += 0.02 * dt
      b.x += Math.sin(b.phase) * 0.3
      if (b.y < -b.r * 2) { b.y = H * 0.85 + Math.random() * H * 0.1; b.x = Math.random() * W }
      b.opacity = Math.min(0.7, b.opacity + 0.01 * dt)
      ctx.globalAlpha = b.opacity
      const gr = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, 0, b.x, b.y, b.r)
      gr.addColorStop(0, 'rgba(255,255,255,0.4)')
      gr.addColorStop(1, 'rgba(0,180,255,0.1)')
      ctx.fillStyle = gr
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(150,220,255,0.5)'; ctx.lineWidth = 0.5
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    const bounds = {
      w: W, h: H,
      floor: H * 0.87, ceil: H * 0.09,
      left: W * 0.01, right: W * 0.97,
    }

    instances.forEach(f => {
      // Motion blur for dash
      if (f.isDashing) {
        ctx.save()
        ctx.globalAlpha = 0.3
        const dims = FISH_DIMS[f.fishId]
        if (dims) {
          ctx.translate(f.x - f.vx * 3, f.y)
          ctx.scale(f.baseScale * f.facing, f.baseScale)
          ctx.translate(-dims.cx, -dims.cy)
          FISH_DRAW_FNS[f.fishId]?.(ctx, f.special)
        }
        ctx.restore()
      }

      // Draw fish
      const dims = FISH_DIMS[f.fishId]
      if (!dims || !FISH_DRAW_FNS[f.fishId]) return

      const catalog = FISH_CATALOG.find(c => c.id === f.fishId)
      const baseGlow = RARITY_GLOW[f.rarity]
      const totalGlow = baseGlow + f.special.glowExtra

      ctx.save()
      if (totalGlow > 0) {
        ctx.shadowBlur = totalGlow
        ctx.shadowColor = catalog?.glowColor ?? 'rgba(0,212,255,0.6)'
      }

      const bob = Math.sin(f.bobPhase) * ({ common:1.5, rare:2.5, epic:2.5, legendary:3.5 }[f.rarity] ?? 2)
      ctx.translate(f.x, f.y + bob)
      ctx.scale(f.baseScale * f.special.scaleMultiplier * f.facing, f.baseScale * f.special.scaleMultiplier)
      ctx.translate(-dims.cx, -dims.cy)
      FISH_DRAW_FNS[f.fishId](ctx, f.special)
      ctx.restore()

      // Particles
      f.particles.forEach(p => {
        const t = 1 - p.life / p.maxLife
        const opacity = t < 0.1 ? t * 10 : t > 0.8 ? (1 - t) * 5 : 1
        const sz = p.size * (1 + t * p.grow)
        ctx.globalAlpha = opacity * p.baseOpacity
        ctx.beginPath()
        ctx.arc(p.x, p.y, sz / 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = sz * 0.8
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      })
      ctx.globalAlpha = 1

      updateInstance(f, dt, bounds)
    })

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)

  return {
    spawnFish(fishId, opts = {}) {
      const catalog = FISH_CATALOG.find(c => c.id === fishId)
      if (!catalog) return
      const W = canvas.width
      const H = canvas.height
      const x = W * 0.05 + Math.random() * W * 0.85
      const y = H * 0.08 + Math.random() * H * 0.62
      instances.push(createInstance(fishId, catalog.rarity, x, y))
    },

    clearFish() {
      instances = []
    },

    destroy() {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
    },
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test fishEngine
```
Expected: PASS — 5 tests

- [ ] **Step 5: Run all tests**

```bash
npm test
```
Expected: PASS — all tests in Part 1

- [ ] **Step 6: Commit**

```bash
git add src/engine/
git commit -m "feat: Canvas 2D fish engine with RAF loop and offscreen decorations"
```

---

## Part 1 Complete

All engine files are in place. Continue with **Part 2** (`docs/superpowers/plans/2026-06-18-phase1-part2-auth-feed.md`) which covers: Aquarium component, auth (useKeychain + LoginOverlay), Header, common components, feed data hooks, and feed card components.
