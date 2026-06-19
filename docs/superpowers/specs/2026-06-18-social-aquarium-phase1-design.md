# Hive Aquarium — Phase 1 Design Spec
**Date:** 2026-06-18
**Branch:** feat/social-aquarium
**Scope:** Vite + React migration + Canvas 2D fish + social feed

---

## Overview

Migrate the existing single-file HTML app to a Vite + React + TypeScript project, upgrade fish rendering from SVG DOM to Canvas 2D, and add a centered social feed panel that displays the logged-in user's Hive following feed (Posts and Snaps tabs).

The aquarium runs full-screen as a persistent canvas background. All UI floats above it. Fish are always swimming behind everything.

**Out of scope for Phase 1:** Three.js/3D fish, gamification (XP/levels/leaderboard), aquarium discovery, fish notifications/screensaver. Those are Phases 2–4.

---

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 5 + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Data fetching | @tanstack/react-query v5 |
| Hive API | @hiveio/dhive |
| Fish rendering | Canvas 2D (HTML `<canvas>`) |
| Auth | Hive Keychain (browser extension only) |

---

## Project Structure

```
hive-aquarium/
├── src/
│   ├── components/
│   │   ├── Aquarium/
│   │   │   └── Aquarium.tsx          ← canvas element, mounts engine
│   │   ├── Feed/
│   │   │   ├── FeedPanel.tsx         ← centered column, tabs
│   │   │   ├── PostCard.tsx
│   │   │   ├── SnapCard.tsx
│   │   │   └── TagFilterStrip.tsx
│   │   ├── Header/
│   │   │   └── Header.tsx
│   │   ├── Shop/
│   │   │   ├── ShopModal.tsx
│   │   │   └── FishCard.tsx
│   │   ├── Login/
│   │   │   └── LoginOverlay.tsx
│   │   └── common/
│   │       ├── Toast.tsx
│   │       └── Button.tsx
│   ├── engine/
│   │   ├── fishEngine.ts             ← Canvas 2D renderer + RAF loop
│   │   ├── fishPaths.ts              ← ctx path drawing for each fish type
│   │   └── behaviors.ts              ← movement logic (cruise, wander, etc.)
│   ├── hooks/
│   │   ├── useHiveFeed.ts            ← following feed + tag feed queries
│   │   ├── useSnaps.ts               ← snaps query
│   │   ├── useKeychain.ts            ← login, sign, broadcast
│   │   └── useOwnedFish.ts           ← read memo history for owned fish
│   ├── lib/
│   │   ├── hiveApi.ts                ← raw condenser_api fetch calls
│   │   └── hivePrice.ts              ← HIVE/USD price fetching
│   ├── store/
│   │   └── appStore.ts               ← Zustand store
│   ├── data/
│   │   └── fishCatalog.ts            ← FISH_CATALOG array (ported from HTML)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                     ← Tailwind directives + CSS vars
├── index.html
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Layout

The aquarium canvas is `position: fixed; inset: 0` at z-index 0. All UI is above it.

```
┌─────────────────────────────────────────────────────────┐
│  Header (fixed, full width, glassmorphism)              │
├──────────────┬──────────────────────┬───────────────────┤
│              │  ┌────────────────┐  │                   │
│   aquarium   │  │  Posts │ Snaps │  │   aquarium        │
│   (canvas)   │  ├────────────────┤  │   (canvas)        │
│              │  │ [tag filter]   │  │                   │
│  fish swim   │  │ ─────────────  │  │  fish swim        │
│  here        │  │  post card     │  │  here             │
│              │  │ ─────────────  │  │                   │
│              │  │  post card     │  │                   │
│              │  └────────────────┘  │                   │
└──────────────┴──────────────────────┴───────────────────┘
```

- Feed panel: `480px` wide, centered, `height: calc(100vh - header)`, scrollable internally
- On mobile (<640px): feed panel is full-width, aquarium still visible above/below
- Feed panel style: `rgba(2,18,38,0.88)` background + `backdrop-filter: blur(12px)` + cyan border — matches existing visual language

---

## Fish Engine (Canvas 2D)

### API

```ts
// engine/fishEngine.ts
export interface FishEngine {
  spawnFish(fishId: string, opts?: { owner?: string }): void;
  clearFish(): void;
  destroy(): void;
}

export function initEngine(canvas: HTMLCanvasElement): FishEngine
```

### Rendering loop

```
initEngine(canvas)
  → sets up 2D ctx
  → starts RAF loop:
      clearRect(full canvas)
      draw decorations from offscreen canvas
      forEach fishInstance: drawFish(ctx, instance)
      update positions (behaviors.ts)
```

### Decorations

All aquarium decorations (pebbles, plants, corals, boat, bubbles, particles) are drawn once to an **offscreen canvas** on mount and composited each frame. This is faster than redrawing them every frame.

### Fish drawing (fishPaths.ts)

Each fish type has a `drawFishId(ctx, x, y, scale, facing, glowColor)` function that reproduces the existing SVG shapes as Canvas 2D path commands. Rarity glow uses `ctx.shadowBlur` + `ctx.shadowColor` instead of CSS `drop-shadow`. Motion blur on dash: draw a faded copy at previous position using `ctx.globalAlpha = 0.3`.

### Movement

`behaviors.ts` is a direct port of the existing JS behavior logic (cruise, wander, zigzag, patrol, spiral, dash). No behavioral changes in Phase 1.

### React integration

```tsx
// Aquarium.tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const engineRef = useRef<FishEngine | null>(null);

useEffect(() => {
  engineRef.current = initEngine(canvasRef.current!);
  return () => engineRef.current?.destroy();
}, []);

useEffect(() => {
  engineRef.current?.clearFish();
  myFish.forEach(f => engineRef.current?.spawnFish(f.id));
}, [myFish]);

return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
```

---

## Feed Panel

### Components

**FeedPanel.tsx**
- Tabs: `Posts | Snaps` — active tab has `--glow` cyan underline
- Renders `TagFilterStrip` below tabs
- Renders list of `PostCard` or `SnapCard` depending on active tab
- "Load more" button at bottom
- Empty state: "Siga pessoas no Hive para ver o feed aqui" + link to PeakD

**TagFilterStrip.tsx**
- Horizontal scrollable row of chips
- Default chips: `#hive-aquarium`, `#photography`, `#gaming`, `#art`, `#music`
- Selecting a chip filters the current tab's content by that tag
- "All" chip (default) clears the filter

**PostCard.tsx**
- Author avatar (Hive profile image) + `@username`
- Post title (bold, truncated at 2 lines)
- Body excerpt (2 lines, stripped of markdown)
- Thumbnail (if `json_metadata.image[0]` exists)
- Upvote count · Comment count · Payout value
- Clicking opens `https://peakd.com/@author/permlink` in new tab

**SnapCard.tsx**
- More compact than PostCard
- Avatar + username + timestamp
- Snap text (up to 280 chars shown)
- Image if present
- Reaction counts

### Data Sources

| Content | Hive API method | Params |
|---|---|---|
| Following feed | `condenser_api.get_discussions_by_feed` | `{ tag: username, limit: 20 }` |
| Snaps | Same endpoint, filter `json_metadata.app` starts with `"snaps"` | |
| Tag filter | `condenser_api.get_discussions_by_created` | `{ tag, limit: 20 }` |
| Load more | Repeat call with `start_author` + `start_permlink` from last item | |

---

## State Management

```ts
// store/appStore.ts (Zustand)

interface AppStore {
  // Auth
  user: HiveUser | null;
  login(username: string): void;
  logout(): void;

  // Aquarium
  myFish: OwnedFish[];
  setFish(fish: OwnedFish[]): void;
  addFish(fish: OwnedFish): void;

  // Feed
  activeTab: 'posts' | 'snaps';
  activeTag: string | null;
  setTab(tab: 'posts' | 'snaps'): void;
  setTag(tag: string | null): void;
}

interface HiveUser {
  username: string;
  avatarUrl: string;
  hivePower: number;
  hiveBalance: string;
}

interface OwnedFish {
  id: string;        // 'clownfish', 'tang', etc.
  name: string;
  boughtAt: string;  // ISO date
}
```

### React Query config

| Hook | Stale time | Notes |
|---|---|---|
| `useFollowingFeed` | 30s | Refetches on window focus |
| `useSnaps` | 30s | Refetches on window focus |
| `useTagFeed` | 60s | Only active when `activeTag` set |
| `useAccountBalance` | 60s | Fires on login |
| `useOwnedFish` | Infinity | Only on login, invalidated on purchase |

---

## Login Flow

1. User enters Hive username → clicks "Entrar com Hive Keychain"
2. `useKeychain.login()` calls `window.hive_keychain.requestSignBuffer`
3. On success: `appStore.login(username)` → username persisted to `localStorage`
4. `useAccountBalance` and `useOwnedFish` queries fire automatically
5. Login overlay unmounts, feed panel and shop button appear
6. Fish spawn on Canvas from `myFish`

---

## Error Handling

- **Keychain not installed:** show install link (existing behavior, ported as-is)
- **Feed API fails:** React Query retries 2×, then shows "Não foi possível carregar o feed" with retry button inside the feed panel
- **Balance fetch fails:** silently hide the balance chip (non-critical)
- **Fish ownership fetch fails:** show empty aquarium with shop button — user can still buy
- **All errors:** Toast component for transient messages (buy success/fail, login errors)

---

## Visual Language

All new UI follows the existing CSS variable palette:
- `--glow: #00d4ff`, `--gold: #f0c040`, `--panel: rgba(2,18,38,0.92)`, `--border: rgba(0,212,255,0.2)`
- Font: `Cinzel Decorative` for headings, `Raleway` for body (already loaded via Google Fonts)
- Glassmorphism: `backdrop-filter: blur(12px)` on feed panel and header
- Tailwind configured with these colors as custom tokens

---

## What's Not in Phase 1

- Three.js / 3D fish models
- Gamification (fish XP, curation weight, leaderboard)
- Aquarium discovery (visit other users' tanks)
- In-app post reader (posts open on PeakD)
- Voting / commenting from within the app
- Fish notifications / screensaver mode
- HiveAuth / Hivesigner login
- Infinite scroll (load-more button instead)
