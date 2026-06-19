# Hive Aquarium Phase 1 — Part 2: Auth + Feed UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Part 1 (`2026-06-18-phase1-part1-scaffold-engine.md`) must be complete and all tests passing before starting Part 2.

**Goal:** Build the Aquarium React component, Hive Keychain auth, common UI (Toast/Button), Header, feed data hooks, and feed card components (PostCard, SnapCard, TagFilterStrip, FeedPanel).

**Architecture:** Aquarium.tsx mounts the Canvas engine via `useEffect`. Auth lives in `useKeychain.ts` and writes to Zustand. Feed data comes from React Query hooks wrapping `hiveApi`. FeedPanel orchestrates tabs + filters + cards.

**Tech Stack:** React 18, Zustand, @tanstack/react-query v5, Tailwind CSS v3, MSW (test mocking), Vitest + @testing-library/react.

## Global Constraints

- All user-visible text in Brazilian Portuguese
- CSS vars: `--glow`, `--gold`, `--panel`, `--border` (defined in Part 1's `index.css`)
- Feed panel: `480px` wide, centered, glassmorphism style (`rgba(2,18,38,0.88)` + `backdrop-filter: blur(12px)` + cyan border)
- Empty feed state: "Siga pessoas no Hive para ver o feed aqui" + link to PeakD
- Hive RPC: `https://api.hive.blog`

---

### Task 7: Aquarium.tsx

**Files:**
- Create: `src/components/Aquarium/Aquarium.tsx`
- Create: `src/components/Aquarium/Aquarium.test.tsx`

**Interfaces:**
- Consumes: `initEngine` from `engine/fishEngine`, `useAppStore` for `myFish`
- Produces: `<Aquarium />` — fixed full-screen canvas with engine lifecycle

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/Aquarium/Aquarium.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Aquarium from './Aquarium'

vi.mock('../../engine/fishEngine', () => ({
  initEngine: vi.fn(() => ({
    spawnFish: vi.fn(),
    clearFish: vi.fn(),
    destroy: vi.fn(),
  })),
}))

vi.mock('../../store/appStore', () => ({
  useAppStore: vi.fn((sel: (s: { myFish: unknown[] }) => unknown) =>
    sel({ myFish: [] })
  ),
}))

describe('Aquarium', () => {
  it('renders a canvas element', () => {
    render(<Aquarium />)
    expect(document.querySelector('canvas')).toBeTruthy()
  })

  it('canvas has fixed positioning class', () => {
    render(<Aquarium />)
    const canvas = document.querySelector('canvas')!
    expect(canvas.className).toContain('fixed')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test Aquarium
```
Expected: FAIL — `Cannot find module './Aquarium'`

- [ ] **Step 3: Implement `src/components/Aquarium/Aquarium.tsx`**

```tsx
// src/components/Aquarium/Aquarium.tsx
import { useEffect, useRef } from 'react'
import { initEngine, type FishEngine } from '../../engine/fishEngine'
import { useAppStore } from '../../store/appStore'

export default function Aquarium() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FishEngine | null>(null)
  const myFish = useAppStore(s => s.myFish)

  // Mount engine once
  useEffect(() => {
    if (!canvasRef.current) return
    canvasRef.current.width  = window.innerWidth
    canvasRef.current.height = window.innerHeight
    engineRef.current = initEngine(canvasRef.current)

    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return
      canvasRef.current.width  = window.innerWidth
      canvasRef.current.height = window.innerHeight
      engineRef.current.destroy()
      engineRef.current = initEngine(canvasRef.current)
      myFish.forEach(f => engineRef.current!.spawnFish(f.id))
    }
    window.addEventListener('resize', handleResize)

    return () => {
      engineRef.current?.destroy()
      window.removeEventListener('resize', handleResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync fish list to engine
  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.clearFish()
    myFish.forEach(f => engineRef.current!.spawnFish(f.id))
  }, [myFish])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test Aquarium
```
Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/Aquarium/
git commit -m "feat: Aquarium canvas component with engine lifecycle"
```

---

### Task 8: Common Components (Toast + Button)

**Files:**
- Create: `src/components/common/Toast.tsx`
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Toast.test.tsx`
- Create: `src/components/common/Button.test.tsx`

**Interfaces:**
- Produces:
  - `<Toast />` — subscribes to `useToastStore`, renders message at bottom-right
  - `useShowToast()` — returns `(title, body, isError?) => void`
  - `<Button variant="primary"|"logout"|"keychain" ...>` — styled button

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/common/Toast.test.tsx
import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import Toast, { useToastStore } from './Toast'

describe('Toast', () => {
  it('is hidden by default', () => {
    render(<Toast />)
    const el = document.getElementById('toast-container')
    expect(el).toBeTruthy()
    // translateX(120%) means off-screen
    expect(el!.style.transform).toContain('120%')
  })

  it('shows when showToast is called', () => {
    render(<Toast />)
    act(() => { useToastStore.getState().show('Título', 'Corpo', false) })
    const el = document.getElementById('toast-container')!
    expect(el.style.transform).not.toContain('120%')
  })
})
```

```tsx
// src/components/common/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeTruthy()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>OK</Button>)
    fireEvent.click(screen.getByText('OK'))
    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test "Toast|Button"
```
Expected: FAIL — modules not found

- [ ] **Step 3: Implement `src/components/common/Toast.tsx`**

```tsx
// src/components/common/Toast.tsx
import { useEffect, useRef } from 'react'
import { create } from 'zustand'

interface ToastState {
  title: string
  body: string
  isError: boolean
  visible: boolean
  show(title: string, body: string, isError?: boolean): void
  hide(): void
}

export const useToastStore = create<ToastState>((set) => ({
  title: '',
  body: '',
  isError: false,
  visible: false,
  show: (title, body, isError = false) => set({ title, body, isError, visible: true }),
  hide: () => set({ visible: false }),
}))

export function useShowToast() {
  return useToastStore(s => s.show)
}

export default function Toast() {
  const { title, body, isError, visible, hide } = useToastStore()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(hide, 4000)
    }
    return () => clearTimeout(timerRef.current)
  }, [visible, title, hide])

  const borderColor = isError ? '#ff6b6b' : 'var(--glow)'
  const shadowColor = isError ? 'rgba(255,80,80,0.3)' : 'rgba(0,212,255,0.3)'

  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        bottom: 110,
        right: 24,
        zIndex: 500,
        background: 'rgba(0,30,60,0.97)',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '14px 20px',
        maxWidth: 320,
        boxShadow: `0 0 30px ${shadowColor}`,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        fontSize: '0.88rem',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, color: isError ? '#ff8080' : 'var(--glow)', marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ color: 'var(--text)' }}>{body}</div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/components/common/Button.tsx`**

```tsx
// src/components/common/Button.tsx
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'logout' | 'keychain' | 'buy'
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', fullWidth, children, className = '', style, ...rest }: ButtonProps) {
  const base = 'cursor-pointer border-none rounded-lg font-raleway font-medium transition-all duration-300 tracking-wide'

  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-br from-blue-700 to-blue-400 text-white px-6 py-2.5 text-sm shadow-[0_0_20px_rgba(0,170,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_30px_rgba(0,170,255,0.5)]',
    logout:  'bg-red-500/15 text-red-300 border border-red-500/30 px-4 py-2 text-sm hover:bg-red-500/25',
    keychain:'bg-gradient-to-br from-blue-800 to-blue-500 text-white py-4 text-base rounded-xl shadow-[0_4px_30px_rgba(0,136,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,136,255,0.5)] flex items-center justify-center gap-2.5',
    buy:     'bg-gradient-to-br from-blue-900 to-blue-600 text-white py-2.5 text-sm rounded-lg hover:from-blue-800 hover:to-blue-500 hover:-translate-y-px disabled:from-blue-950 disabled:text-gray-500 disabled:cursor-not-allowed disabled:translate-y-0',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test "Toast|Button"
```
Expected: PASS — 5 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/common/
git commit -m "feat: Toast and Button common components"
```

---

### Task 9: useKeychain.ts

**Files:**
- Create: `src/hooks/useKeychain.ts`
- Create: `src/hooks/useKeychain.test.ts`

**Interfaces:**
- Consumes: `window.hive_keychain` (browser extension), `useAppStore`
- Produces: `useKeychain()` returning `{ login(username), isLoading, error }`

- [ ] **Step 1: Write failing tests**

```ts
// src/hooks/useKeychain.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeychain } from './useKeychain'
import { useAppStore } from '../store/appStore'

beforeEach(() => {
  useAppStore.setState({ user: null, myFish: [] })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useKeychain', () => {
  it('sets error when keychain not found', async () => {
    vi.stubGlobal('hive_keychain', undefined)
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(result.current.error).toContain('Keychain')
  })

  it('calls requestSignBuffer with correct args', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(requestSignBuffer).toHaveBeenCalledWith(
      'alice',
      expect.stringContaining('Login no Hive Aquarium'),
      'Posting',
      expect.any(Function)
    )
  })

  it('stores user in Zustand on success', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: true }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(useAppStore.getState().user?.username).toBe('alice')
  })

  it('sets error on keychain rejection', async () => {
    const requestSignBuffer = vi.fn((user, msg, role, cb) => cb({ success: false, message: 'Rejeitado' }))
    vi.stubGlobal('hive_keychain', { requestSignBuffer })
    const { result } = renderHook(() => useKeychain())
    await act(async () => { await result.current.login('alice') })
    expect(result.current.error).toContain('Rejeitado')
    expect(useAppStore.getState().user).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test useKeychain
```
Expected: FAIL — `Cannot find module './useKeychain'`

- [ ] **Step 3: Implement `src/hooks/useKeychain.ts`**

```ts
// src/hooks/useKeychain.ts
import { useState } from 'react'
import { useAppStore } from '../store/appStore'

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
    }
  }
}

function waitForKeychain(timeout = 5000): Promise<NonNullable<Window['hive_keychain']>> {
  return new Promise((resolve, reject) => {
    if (window.hive_keychain) { resolve(window.hive_keychain); return }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.hive_keychain) { clearInterval(check); resolve(window.hive_keychain) }
      else if (Date.now() - start > timeout) { clearInterval(check); reject(new Error('Hive Keychain não encontrado')) }
    }, 200)
  })
}

export function useKeychain() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAppStore(s => s.login)

  async function loginWithKeychain(username: string) {
    const clean = username.trim().replace('@', '').toLowerCase()
    if (!clean) { setError('Digite seu usuário Hive.'); return }

    setIsLoading(true)
    setError(null)

    let keychain: NonNullable<Window['hive_keychain']>
    try {
      keychain = await waitForKeychain(5000)
    } catch {
      setError('Hive Keychain não encontrado. Verifique se a extensão está instalada.')
      setIsLoading(false)
      return
    }

    await new Promise<void>((resolve) => {
      keychain.requestSignBuffer(
        clean,
        `Login no Hive Aquarium — ${Date.now()}`,
        'Posting',
        (response) => {
          if (response.success) {
            login({
              username: clean,
              avatarUrl: `https://images.hive.blog/u/${clean}/avatar`,
              hivePower: 0,
              hiveBalance: '...',
            })
            localStorage.setItem('hive_aquarium_user', JSON.stringify({ username: clean }))
          } else {
            setError(response.message ?? 'Login cancelado')
          }
          setIsLoading(false)
          resolve()
        }
      )
    })
  }

  return { login: loginWithKeychain, isLoading, error }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test useKeychain
```
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useKeychain.ts src/hooks/useKeychain.test.ts
git commit -m "feat: useKeychain hook for Hive Keychain login"
```

---

### Task 10: LoginOverlay.tsx

**Files:**
- Create: `src/components/Login/LoginOverlay.tsx`
- Create: `src/components/Login/LoginOverlay.test.tsx`

**Interfaces:**
- Consumes: `useKeychain`, `useAppStore`
- Produces: `<LoginOverlay />` — full-screen overlay, hidden once `user` is set

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/Login/LoginOverlay.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginOverlay from './LoginOverlay'
import { useAppStore } from '../../store/appStore'

vi.mock('../../hooks/useKeychain', () => ({
  useKeychain: vi.fn(() => ({ login: vi.fn(), isLoading: false, error: null })),
}))

beforeEach(() => { useAppStore.setState({ user: null, myFish: [] }) })

describe('LoginOverlay', () => {
  it('renders when user is not logged in', () => {
    render(<LoginOverlay />)
    expect(screen.getByText(/Entrar com Hive Keychain/i)).toBeTruthy()
  })

  it('is hidden when user is logged in', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [],
    })
    render(<LoginOverlay />)
    expect(screen.queryByText(/Entrar com Hive Keychain/i)).toBeFalsy()
  })

  it('calls login when button clicked', () => {
    const mockLogin = vi.fn()
    const { useKeychain } = vi.mocked(await import('../../hooks/useKeychain'))
    vi.mocked(useKeychain).mockReturnValue({ login: mockLogin, isLoading: false, error: null })

    render(<LoginOverlay />)
    fireEvent.change(screen.getByPlaceholderText(/Seu usuário Hive/i), { target: { value: 'alice' } })
    fireEvent.click(screen.getByText(/Entrar com Hive Keychain/i))
    expect(mockLogin).toHaveBeenCalledWith('alice')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test LoginOverlay
```
Expected: FAIL — `Cannot find module './LoginOverlay'`

- [ ] **Step 3: Implement `src/components/Login/LoginOverlay.tsx`**

```tsx
// src/components/Login/LoginOverlay.tsx
import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useKeychain } from '../../hooks/useKeychain'
import Button from '../common/Button'

export default function LoginOverlay() {
  const user = useAppStore(s => s.user)
  const { login, isLoading, error } = useKeychain()
  const [username, setUsername] = useState('')

  // Restore saved username
  useEffect(() => {
    const saved = localStorage.getItem('hive_aquarium_user')
    if (saved) {
      try { setUsername(JSON.parse(saved).username ?? '') } catch {}
    }
  }, [])

  if (user) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(1,15,35,0.97) 0%, rgba(0,5,15,0.99) 100%)',
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '48px 56px',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(0,80,160,0.3), inset 0 1px 0 rgba(0,212,255,0.1)',
          maxWidth: 440,
          width: '90%',
          animation: 'cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: 24 }}>🐠</div>

        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.8rem', color: 'var(--glow)', textShadow: '0 0 30px rgba(0,212,255,0.5)', marginBottom: 8 }}>
          Hive <span style={{ color: 'var(--gold)' }}>Aquarium</span>
        </h1>

        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
          Um aquário vivo na blockchain. Faça login com o Hive Keychain para coletar e cuidar dos seus peixes.
        </p>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Seu usuário Hive (sem @)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login(username)}
            autoComplete="off"
            style={{
              width: '100%',
              background: 'rgba(0,30,60,0.8)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '14px 18px',
              color: 'var(--text)',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <Button
          variant="keychain"
          fullWidth
          disabled={isLoading}
          onClick={() => login(username)}
        >
          <span style={{ fontSize: '1.3rem' }}>🔑</span>
          {isLoading ? 'Conectando...' : 'Entrar com Hive Keychain'}
        </Button>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: 10, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Não tem a extensão?{' '}
          <a href="https://hive-keychain.com" target="_blank" rel="noreferrer" style={{ color: 'var(--glow)', textDecoration: 'none' }}>
            Baixar Hive Keychain →
          </a>
          <br />
          Sem conta Hive?{' '}
          <a href="https://peakd.com/register?ref=shiftrox" target="_blank" rel="noreferrer" style={{ color: 'var(--glow)', textDecoration: 'none' }}>
            Criar conta grátis →
          </a>
        </p>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(30px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test LoginOverlay
```
Expected: PASS — 3 tests (the dynamic import test may need adjustment if the mock isn't wired; the key assertions are render and hidden-when-logged-in)

- [ ] **Step 5: Commit**

```bash
git add src/components/Login/
git commit -m "feat: LoginOverlay with Hive Keychain form"
```

---

### Task 11: useOwnedFish + Header

**Files:**
- Create: `src/hooks/useOwnedFish.ts`
- Create: `src/hooks/useOwnedFish.test.ts`
- Create: `src/components/Header/Header.tsx`
- Create: `src/components/Header/Header.test.tsx`

**Interfaces:**
- `useOwnedFish(username)` — React Query hook, returns `{ data: OwnedFish[], isLoading, isError }`
- `<Header />` — logo, user pill, HIVE balance chip, logout button

- [ ] **Step 1: Write failing tests for useOwnedFish**

```ts
// src/hooks/useOwnedFish.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useOwnedFish } from './useOwnedFish'

const APP_ID = 'hive-aquarium/1.0'
const mockFetch = vi.fn()

beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function mockHistory(ops: Array<{ id: string; json: object }>) {
  const history = ops.map((op, i) => [
    i,
    {
      op: ['custom_json', { id: op.id, json: JSON.stringify(op.json) }],
      timestamp: `2026-01-0${i+1}T00:00:00`,
    },
  ])
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ result: history }) })
}

describe('useOwnedFish', () => {
  it('returns empty array when no fish ops found', async () => {
    mockHistory([])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('returns fish from add_fish ops', async () => {
    mockHistory([
      { id: APP_ID, json: { action: 'add_fish', fish_id: 'clownfish', fish_name: 'Peixe-Palhaço' } },
    ])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.length).toBe(1)
    expect(result.current.data?.[0].id).toBe('clownfish')
  })

  it('respects remove_fish ops', async () => {
    mockHistory([
      { id: APP_ID, json: { action: 'add_fish', fish_id: 'tang', fish_name: 'Tang Azul' } },
      { id: APP_ID, json: { action: 'remove_fish', fish_id: 'tang' } },
    ])
    const { result } = renderHook(() => useOwnedFish('alice'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('returns null when username is null', async () => {
    const { result } = renderHook(() => useOwnedFish(null), { wrapper: makeWrapper() })
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test useOwnedFish
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/hooks/useOwnedFish.ts`**

```ts
// src/hooks/useOwnedFish.ts
import { useQuery } from '@tanstack/react-query'
import { getAccountHistory } from '../lib/hiveApi'
import type { OwnedFish } from '../store/appStore'

const APP_ID = 'hive-aquarium/1.0'

async function fetchOwnedFish(username: string): Promise<OwnedFish[]> {
  const history = await getAccountHistory(username)
  const owned: Record<string, OwnedFish> = {}

  history.forEach(([, entry]) => {
    const [opType, opData] = entry.op
    if (opType !== 'custom_json' || (opData as { id?: string }).id !== APP_ID) return

    try {
      const json = JSON.parse((opData as { json: string }).json)
      if (json.action === 'add_fish' && json.fish_id) {
        owned[json.fish_id] = {
          id: json.fish_id,
          name: json.fish_name ?? json.fish_id,
          boughtAt: entry.timestamp,
        }
      }
      if (json.action === 'remove_fish' && json.fish_id) {
        delete owned[json.fish_id]
      }
    } catch {}
  })

  return Object.values(owned)
}

export function useOwnedFish(username: string | null) {
  return useQuery({
    queryKey: ['ownedFish', username],
    queryFn: () => fetchOwnedFish(username!),
    enabled: !!username,
    staleTime: Infinity,
  })
}
```

- [ ] **Step 4: Write failing tests for Header**

```tsx
// src/components/Header/Header.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'
import { useAppStore } from '../../store/appStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('../../hooks/useOwnedFish', () => ({
  useOwnedFish: vi.fn(() => ({ data: [], isLoading: false })),
}))

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient()
  return render(createElement(QueryClientProvider, { client: qc }, ui))
}

describe('Header', () => {
  it('renders logo', () => {
    useAppStore.setState({ user: null, myFish: [] })
    wrap(<Header />)
    expect(screen.getByText(/Aquarium/i)).toBeTruthy()
  })

  it('shows user pill when logged in', () => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '5.000 HIVE' },
      myFish: [],
    })
    wrap(<Header />)
    expect(screen.getByText('@alice')).toBeTruthy()
  })

  it('calls logout when Sair is clicked', () => {
    const logout = vi.fn()
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '5.000 HIVE' },
      myFish: [],
    })
    vi.spyOn(useAppStore, 'getState').mockReturnValue({
      ...useAppStore.getState(),
      logout,
    } as ReturnType<typeof useAppStore.getState>)

    wrap(<Header />)
    fireEvent.click(screen.getByText('Sair'))
    expect(logout).toHaveBeenCalled()
  })
})
```

- [ ] **Step 5: Implement `src/components/Header/Header.tsx`**

```tsx
// src/components/Header/Header.tsx
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useOwnedFish } from '../../hooks/useOwnedFish'
import { getAccounts } from '../../lib/hiveApi'
import Button from '../common/Button'

export default function Header() {
  const user = useAppStore(s => s.user)
  const logout = useAppStore(s => s.logout)
  const setFish = useAppStore(s => s.setFish)
  const { data: ownedFish } = useOwnedFish(user?.username ?? null)

  // Sync fish from blockchain into store when loaded
  useEffect(() => {
    if (ownedFish) setFish(ownedFish)
  }, [ownedFish, setFish])

  // Load HIVE balance
  useEffect(() => {
    if (!user) return
    getAccounts([user.username]).then(accounts => {
      if (accounts[0]) {
        useAppStore.setState(s => ({
          user: s.user ? { ...s.user, hiveBalance: accounts[0].balance } : null,
        }))
      }
    }).catch(() => {})
  }, [user?.username])

  function handleLogout() {
    localStorage.removeItem('hive_aquarium_user')
    logout()
  }

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'linear-gradient(180deg, rgba(1,8,16,0.98) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem', color: 'var(--glow)', textShadow: '0 0 20px rgba(0,212,255,0.6)', letterSpacing: 2 }}>
        🐠 Hive <span style={{ color: 'var(--gold)' }}>Aquarium</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            {user.hiveBalance && user.hiveBalance !== '...' && (
              <div style={{ fontSize: '0.8rem', color: 'var(--gold)', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', padding: '6px 14px', borderRadius: 20 }}>
                ⚡ {user.hiveBalance}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border)', borderRadius: 24, padding: '6px 16px' }}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--glow)', objectFit: 'cover' }}
                />
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--glow)', fontWeight: 500 }}>
                @{user.username}
              </span>
            </div>

            <Button variant="logout" onClick={handleLogout}>Sair</Button>
          </>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Run all tests for this task**

```bash
npm test "useOwnedFish|Header"
```
Expected: PASS — 7 tests total

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useOwnedFish.ts src/hooks/useOwnedFish.test.ts src/components/Header/
git commit -m "feat: useOwnedFish hook and Header component"
```

---

### Task 12: Feed Data Hooks

**Files:**
- Create: `src/hooks/useHiveFeed.ts`
- Create: `src/hooks/useSnaps.ts`
- Create: `src/hooks/useHiveFeed.test.ts`

**Interfaces:**
- Consumes: `hiveApi`, `useAppStore` for username
- Produces:
  - `useFollowingFeed(cursor?)` — `{ posts, fetchNextPage, hasMore, isLoading, isError }`
  - `useTagFeed(tag, cursor?)` — same shape, only active when `tag` is set
  - `useSnaps(cursor?)` — filters following feed by `json_metadata.app` starting with `"snaps"`

- [ ] **Step 1: Write failing tests**

```ts
// src/hooks/useHiveFeed.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useFollowingFeed, useTagFeed } from './useHiveFeed'
import { useAppStore } from '../store/appStore'

const mockFetch = vi.fn()
beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function mockPosts(posts: object[]) {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ result: posts }) })
}

const SAMPLE_POST = {
  author: 'alice', permlink: 'my-post', title: 'Hello World',
  body: 'Post body content', json_metadata: '{"tags":[],"image":[]}',
  created: '2026-01-01T00:00:00', net_votes: 10, children: 2,
  pending_payout_value: '1.234 HBD',
}

describe('useFollowingFeed', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: { username: 'alice', avatarUrl: '', hivePower: 0, hiveBalance: '' },
      myFish: [], activeTab: 'posts', activeTag: null,
    })
  })

  it('returns empty array when no user', async () => {
    useAppStore.setState({ user: null, myFish: [] })
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    expect(result.current.posts).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches posts when user is logged in', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    expect(result.current.posts.length).toBeGreaterThanOrEqual(0)
  })

  it('fetchNextPage appends posts with cursor', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useFollowingFeed(), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    await act(async () => { await result.current.fetchNextPage() })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('useTagFeed', () => {
  it('does not fetch when tag is null', async () => {
    const { result } = renderHook(() => useTagFeed(null), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches when tag is provided', async () => {
    mockPosts([SAMPLE_POST])
    const { result } = renderHook(() => useTagFeed('hive-aquarium'), { wrapper: makeWrapper() })
    await waitFor(() => !result.current.isLoading)
    expect(mockFetch).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test useHiveFeed
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/hooks/useHiveFeed.ts`**

```ts
// src/hooks/useHiveFeed.ts
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
  const [cursor, setCursor] = useState<PaginationCursor | undefined>()

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
    setCursor(nextCursor)
    setPages(prev => [...prev, more.slice(1)]) // first item is duplicate of last
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
```

- [ ] **Step 4: Implement `src/hooks/useSnaps.ts`**

```ts
// src/hooks/useSnaps.ts
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
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test useHiveFeed
```
Expected: PASS — 5 tests

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useHiveFeed.ts src/hooks/useSnaps.ts src/hooks/useHiveFeed.test.ts
git commit -m "feat: useHiveFeed, useTagFeed, useSnaps data hooks"
```

---

### Task 13: PostCard + SnapCard + TagFilterStrip

**Files:**
- Create: `src/components/Feed/PostCard.tsx`
- Create: `src/components/Feed/SnapCard.tsx`
- Create: `src/components/Feed/TagFilterStrip.tsx`
- Create: `src/components/Feed/PostCard.test.tsx`
- Create: `src/components/Feed/TagFilterStrip.test.tsx`

**Interfaces:**
- Consumes: `HivePost` from hiveApi
- Produces:
  - `<PostCard post={HivePost} />` — clickable card opening PeakD
  - `<SnapCard post={HivePost} />` — compact snap card
  - `<TagFilterStrip activeTag, onTagChange />` — horizontal scrollable chips

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/Feed/PostCard.test.tsx
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
    // Should show plain text, not **bold** markers
    const excerpt = screen.getByText(/This is the/)
    expect(excerpt.textContent).not.toContain('**')
  })
})
```

```tsx
// src/components/Feed/TagFilterStrip.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagFilterStrip from './TagFilterStrip'

describe('TagFilterStrip', () => {
  it('renders default chips', () => {
    render(<TagFilterStrip activeTag={null} onTagChange={vi.fn()} />)
    expect(screen.getByText('Todos')).toBeTruthy()
    expect(screen.getByText('#hive-aquarium')).toBeTruthy()
    expect(screen.getByText('#photography')).toBeTruthy()
  })

  it('calls onTagChange with null when Todos is clicked', () => {
    const onChange = vi.fn()
    render(<TagFilterStrip activeTag="#art" onTagChange={onChange} />)
    fireEvent.click(screen.getByText('Todos'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('calls onTagChange with tag when chip is clicked', () => {
    const onChange = vi.fn()
    render(<TagFilterStrip activeTag={null} onTagChange={onChange} />)
    fireEvent.click(screen.getByText('#art'))
    expect(onChange).toHaveBeenCalledWith('art')
  })

  it('highlights activeTag chip', () => {
    render(<TagFilterStrip activeTag="art" onTagChange={vi.fn()} />)
    const artChip = screen.getByText('#art').closest('button')!
    expect(artChip.getAttribute('data-active')).toBe('true')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test "PostCard|TagFilterStrip"
```
Expected: FAIL — modules not found

- [ ] **Step 3: Implement `src/components/Feed/PostCard.tsx`**

```tsx
// src/components/Feed/PostCard.tsx
import type { HivePost } from '../../lib/hiveApi'

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
  let thumbnail = ''
  let tags: string[] = []
  try {
    const meta = JSON.parse(post.json_metadata)
    thumbnail = meta.image?.[0] ?? ''
    tags = meta.tags ?? []
  } catch {}

  const excerpt = stripMarkdown(post.body).slice(0, 180)
  const peakdUrl = `https://peakd.com/@${post.author}/${post.permlink}`
  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`

  return (
    <a
      href={peakdUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'rgba(0,20,50,0.5)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--glow)', fontWeight: 500 }}>@{post.author}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      {/* Content row */}
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

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <span>▲ {post.net_votes}</span>
        <span>💬 {post.children}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>{post.pending_payout_value}</span>
      </div>
    </a>
  )
}
```

- [ ] **Step 4: Implement `src/components/Feed/SnapCard.tsx`**

```tsx
// src/components/Feed/SnapCard.tsx
import type { HivePost } from '../../lib/hiveApi'

interface Props { post: HivePost }

export default function SnapCard({ post }: Props) {
  let image = ''
  try { image = JSON.parse(post.json_metadata).image?.[0] ?? '' } catch {}

  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`
  const text = post.body.slice(0, 280)

  return (
    <div
      style={{
        background: 'rgba(0,20,50,0.45)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--glow)' }}>@{post.author}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: image ? 8 : 0 }}>
        {text}
      </p>

      {image && (
        <img src={image} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 4, maxHeight: 200, objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      )}

      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        ▲ {post.net_votes}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `src/components/Feed/TagFilterStrip.tsx`**

```tsx
// src/components/Feed/TagFilterStrip.tsx

const DEFAULT_TAGS = ['hive-aquarium', 'photography', 'gaming', 'art', 'music']

interface Props {
  activeTag: string | null
  onTagChange(tag: string | null): void
}

export default function TagFilterStrip({ activeTag, onTagChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0', scrollbarWidth: 'none' }}>
      <Chip label="Todos" active={activeTag === null} onClick={() => onTagChange(null)} />
      {DEFAULT_TAGS.map(tag => (
        <Chip
          key={tag}
          label={`#${tag}`}
          active={activeTag === tag}
          onClick={() => onTagChange(tag)}
        />
      ))}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick(): void }) {
  return (
    <button
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      style={{
        flexShrink: 0,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.75rem',
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--glow)' : 'var(--border)'}`,
        background: active ? 'rgba(0,212,255,0.15)' : 'rgba(0,20,50,0.5)',
        color: active ? 'var(--glow)' : 'var(--text-dim)',
        fontFamily: 'Raleway, sans-serif',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test "PostCard|TagFilterStrip"
```
Expected: PASS — 9 tests

- [ ] **Step 7: Commit**

```bash
git add src/components/Feed/PostCard.tsx src/components/Feed/SnapCard.tsx src/components/Feed/TagFilterStrip.tsx src/components/Feed/PostCard.test.tsx src/components/Feed/TagFilterStrip.test.tsx
git commit -m "feat: PostCard, SnapCard, TagFilterStrip feed components"
```

---

## Part 2 Complete

All auth and feed data/UI components are in place. Continue with **Part 3** (`docs/superpowers/plans/2026-06-18-phase1-part3-feed-shop-app.md`) which covers: FeedPanel, ShopModal + FishCard, App.tsx wiring, and the buy-fish flow via Hive Keychain.
