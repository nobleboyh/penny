# Story 1.4: Design System & Core Dependencies Setup

Status: done

## Story

As a developer,
I want Tailwind CSS, shadcn/ui, Framer Motion, Lottie, Dexie.js, Zustand, and TanStack Query installed and configured,
so that all frontend features can be built on a consistent foundation.

## Acceptance Criteria

1. **Given** the bare Vite scaffold from Story 1.3  
   **When** setup is complete  
   **Then** Tailwind CSS is configured with the Penny design tokens (all CSS custom properties from the UX spec) in `src/styles/globals.css`

2. **And** Nunito font (Google Fonts) is loaded via Google Fonts in `index.html`

3. **And** shadcn/ui is initialized (`components.json`) with Penny theme tokens

4. **And** Framer Motion and `lottie-react` are installed

5. **And** Dexie.js schema is defined in `src/lib/db.ts` with tables: `transactions`, `pendingSync`, `failedSync`

6. **And** Zustand stores exist at `src/store/`: `goalStore.ts`, `pennyStore.ts`, `streakStore.ts` with typed state + actions interfaces

7. **And** TanStack Query `QueryClient` is configured in `src/lib/api.ts` with axios instance pointing to `VITE_API_BASE_URL`

8. **And** `QueryClientProvider` wraps the app in `src/main.tsx`

9. **And** dark mode is the default; CSS variables resolve correctly on `<html>` element

## Tasks / Subtasks

- [x] Install and configure Tailwind CSS (AC: 1, 9)
  - [x] `npm install -D tailwindcss @tailwindcss/vite` (Tailwind v4 — Vite 8 compatible)
  - [x] Add `@tailwindcss/vite` plugin to `vite.config.ts`
  - [x] Create `src/styles/globals.css` with `@import "tailwindcss"` and all Penny CSS custom properties (see Dev Notes)
  - [x] Update `penny/index.html` to import Nunito from Google Fonts
  - [x] Update `src/main.tsx` to import `./styles/globals.css` instead of `./index.css`
  - [x] Add `class="dark"` to `<html>` element in `index.html` (dark mode default)
  - [x] Create `tailwind.config.ts` mapping CSS variables to Tailwind theme tokens

- [x] Initialize shadcn/ui (AC: 3)
  - [x] `npx shadcn@latest init` — select: TypeScript, Tailwind CSS, `src/components/ui`, CSS variables
  - [x] Verify `components.json` is created with correct paths
  - [x] Verify `components.json` uses Penny theme tokens (not default shadcn blue)
  - [x] Add initial shadcn components needed by later stories: `npx shadcn@latest add button badge progress sheet slider`

- [x] Install animation libraries (AC: 4)
  - [x] `npm install framer-motion lottie-react`
  - [x] Verify no peer dependency conflicts with React 19

- [x] Configure Dexie.js offline schema (AC: 5)
  - [x] `npm install dexie`
  - [x] Create `src/lib/db.ts` with Dexie schema (see Dev Notes for exact schema)

- [x] Create Zustand stores (AC: 6)
  - [x] `npm install zustand`
  - [x] Create `src/store/goalStore.ts` with `GoalState` + `GoalActions` interfaces
  - [x] Create `src/store/pennyStore.ts` with `PennyState` + `PennyActions` interfaces
  - [x] Create `src/store/streakStore.ts` with `StreakState` + `StreakActions` interfaces
  - [x] All stores use `persist` middleware (localStorage)

- [x] Configure TanStack Query + axios (AC: 7, 8)
  - [x] `npm install @tanstack/react-query axios`
  - [x] Create `src/lib/api.ts` with `QueryClient` and axios instance (see Dev Notes)
  - [x] Wrap app in `QueryClientProvider` in `src/main.tsx`

- [x] Clean up scaffold artifacts
  - [x] Remove `src/index.css` (replaced by `src/styles/globals.css`)
  - [x] Remove `src/App.css`
  - [x] Remove `src/assets/react.svg` and `public/vite.svg` (unused)
  - [x] Update `src/App.tsx` to a minimal placeholder (no Vite/React logos)

- [x] Smoke test
  - [x] `npm run build` succeeds with zero TypeScript errors
  - [x] `npm run lint` passes
  - [x] App loads at `http://localhost:80` with dark background (#0F0F14) and Nunito font visible

### Review Findings

- [x] [Review][Patch] `html` rule hardcodes `#0F0F14` hex instead of referencing `--color-background` token [penny/src/styles/globals.css]
- [x] [Review][Patch] `Transaction.id` is `optional` on the interface but is the Dexie primary key — should be `id?: number` on write type, `id: number` on read type [penny/src/lib/db.ts]
- [x] [Review][Patch] `resetStreak` resets `streakCount` but not `lastLogDate` — stale date will cause incorrect streak logic [penny/src/store/streakStore.ts]
- [x] [Review][Patch] Missing `VITE_API_BASE_URL` silently sets axios `baseURL` to `undefined` — add dev-time guard [penny/src/lib/api.ts]
- [x] [Review][Defer] `access_token` localStorage key is a magic string — centralize in a constants file in a later story [penny/src/lib/api.ts] — deferred, pre-existing pattern gap
- [x] [Review][Defer] `MoodState` type defined in store file — architecture specifies `features/penny/types.ts`; move when `features/penny/` is scaffolded [penny/src/store/pennyStore.ts] — deferred, features/ not yet created
- [x] [Review][Defer] `updateSavedAmount` allows negative `savedAmount` — clamp at display layer in `GoalProgressCard` story [penny/src/store/goalStore.ts] — deferred, display layer not yet built
- [x] [Review][Defer] Dexie schema version 1 has no migration path — document migration strategy when fields are added in future stories [penny/src/lib/db.ts] — deferred, no schema changes yet
- [x] [Review][Defer] `saverLevel` has no max cap — enforce max in progression story when Saver Level system is implemented [penny/src/store/streakStore.ts] — deferred, progression not yet built

## Dev Notes

### Tailwind CSS v4 — Critical Version Note

**Use Tailwind v4**, not v3. Vite 8 + React 19 requires Tailwind v4 for compatibility.

- Install: `npm install -D tailwindcss @tailwindcss/vite`
- Plugin in `vite.config.ts`:
  ```typescript
  import tailwindcss from '@tailwindcss/vite'
  export default defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```
- Tailwind v4 uses CSS-first config — `tailwind.config.ts` is optional; design tokens go in `globals.css` via `@theme`
- Do NOT use `@tailwind base/components/utilities` directives — v4 uses `@import "tailwindcss"` instead

### Penny Design Tokens — `src/styles/globals.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: 'Nunito', sans-serif;

  /* Penny color tokens */
  --color-background: #0F0F14;
  --color-surface: #1A1A24;
  --color-surface-elevated: #242433;
  --color-border: #2E2E42;
  --color-primary: #FF6B6B;
  --color-primary-foreground: #FFFFFF;
  --color-secondary: #A78BFA;
  --color-accent: #34D399;
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-muted: #6B7280;
  --color-foreground: #F9FAFB;
  --color-muted-foreground: #9CA3AF;

  /* Spacing scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
}

/* shadcn/ui CSS variable bridge (shadcn uses --background, --foreground etc.) */
:root {
  --background: 240 10% 7%;        /* #0F0F14 in HSL */
  --foreground: 210 40% 98%;       /* #F9FAFB */
  --card: 240 10% 12%;             /* #1A1A24 */
  --card-foreground: 210 40% 98%;
  --popover: 240 10% 15%;          /* #242433 */
  --popover-foreground: 210 40% 98%;
  --primary: 0 100% 71%;           /* #FF6B6B */
  --primary-foreground: 0 0% 100%;
  --secondary: 263 70% 76%;        /* #A78BFA */
  --secondary-foreground: 0 0% 100%;
  --muted: 240 10% 15%;
  --muted-foreground: 220 9% 63%;  /* #9CA3AF */
  --accent: 160 64% 52%;           /* #34D399 */
  --accent-foreground: 0 0% 0%;
  --destructive: 43 96% 56%;       /* #FBBF24 amber — no red */
  --destructive-foreground: 0 0% 0%;
  --border: 240 15% 22%;           /* #2E2E42 */
  --input: 240 15% 22%;
  --ring: 0 100% 71%;              /* coral focus ring */
  --radius: 1rem;                  /* 16px = --radius-md */
}

html {
  background-color: #0F0F14;
  color: #F9FAFB;
  font-family: 'Nunito', sans-serif;
}
```

**Note on shadcn/ui HSL format:** shadcn/ui CSS variables use space-separated HSL values (not `hsl()`). The values above are correct for shadcn compatibility.

### `index.html` — Nunito Font + Dark Mode

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <title>Penny</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/lib/db.ts` — Dexie Schema

```typescript
import Dexie, { type EntityTable } from 'dexie'

interface Transaction {
  id?: number
  amount: number
  category: string
  emoji: string
  note?: string
  date: string        // ISO 8601 YYYY-MM-DD (local timezone)
  createdAt: string   // ISO 8601 full timestamp
}

interface PendingSync {
  id?: number
  transactionData: Omit<Transaction, 'id'>
  retryCount: number
  createdAt: string
}

interface FailedSync {
  id?: number
  transactionData: Omit<Transaction, 'id'>
  failedAt: string
  lastError: string
}

class PennyDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  pendingSync!: EntityTable<PendingSync, 'id'>
  failedSync!: EntityTable<FailedSync, 'id'>

  constructor() {
    super('penny-db')
    this.version(1).stores({
      transactions: '++id, date, category',
      pendingSync: '++id, createdAt',
      failedSync: '++id, failedAt',
    })
  }
}

export const db = new PennyDatabase()
export type { Transaction, PendingSync, FailedSync }
```

### `src/lib/api.ts` — TanStack Query + Axios

```typescript
import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auth token interceptor — attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      retry: 1,
    },
  },
})
```

### `src/store/goalStore.ts` — Zustand Store Pattern

All stores follow the same pattern (State + Actions typed separately):

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GoalState {
  goalName: string | null
  goalAmount: number | null
  savedAmount: number
  targetDate: string | null   // ISO 8601 date string
}

interface GoalActions {
  setGoal: (name: string, amount: number, targetDate: string) => void
  updateSavedAmount: (amount: number) => void
  resetGoal: () => void
}

type GoalStore = GoalState & GoalActions

const initialState: GoalState = {
  goalName: null,
  goalAmount: null,
  savedAmount: 0,
  targetDate: null,
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      ...initialState,
      setGoal: (goalName, goalAmount, targetDate) =>
        set({ goalName, goalAmount, targetDate }),
      updateSavedAmount: (amount) =>
        set((s) => ({ savedAmount: s.savedAmount + amount })),
      resetGoal: () => set(initialState),
    }),
    { name: 'penny-goal' }
  )
)
```

**`src/store/pennyStore.ts`** — state: `currentMood: MoodState`, `lastReaction: string | null`; actions: `setMood`, `setLastReaction`. MoodState type: `'idle' | 'happy' | 'excited' | 'sad' | 'celebrating' | 'worried' | 'proud' | 'neutral' | 'thinking' | 'disappointed'`

**`src/store/streakStore.ts`** — state: `streakCount: number`, `lastLogDate: string | null` (YYYY-MM-DD), `saverLevel: number`; actions: `incrementStreak`, `resetStreak`, `updateLastLogDate`, `incrementSaverLevel`

### `src/main.tsx` — QueryClientProvider Wrapper

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/api'
import App from './App.tsx'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

### shadcn/ui Init — Expected `components.json`

After `npx shadcn@latest init`, verify `components.json` looks like:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

shadcn/ui will create `src/lib/utils.ts` with `cn()` helper — keep it, it's used by all shadcn components.

### Path Alias `@/` — Required for shadcn/ui

shadcn/ui imports use `@/` alias. Add to `vite.config.ts` and `tsconfig.app.json`:

**`vite.config.ts`:**
```typescript
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**`tsconfig.app.json`** — add to `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

`@types/node` is already in devDependencies (from Story 1.3) — `path` import will work.

### File Structure After This Story

```
penny/
  components.json               ← NEW: shadcn/ui config
  tailwind.config.ts            ← NEW: (optional in v4, but needed for shadcn compat)
  vite.config.ts                ← MODIFY: add tailwindcss plugin + @ alias
  tsconfig.app.json             ← MODIFY: add baseUrl + paths
  index.html                    ← MODIFY: add Nunito font + class="dark"
  src/
    main.tsx                    ← MODIFY: add QueryClientProvider, import globals.css
    App.tsx                     ← MODIFY: remove Vite/React logos, minimal placeholder
    styles/
      globals.css               ← NEW: Tailwind + Penny design tokens
    lib/
      api.ts                    ← NEW: QueryClient + axios instance
      db.ts                     ← NEW: Dexie schema
      utils.ts                  ← NEW: created by shadcn init (cn() helper)
    store/
      goalStore.ts              ← NEW
      pennyStore.ts             ← NEW
      streakStore.ts            ← NEW
    components/
      ui/                       ← NEW: shadcn components (button, badge, progress, sheet, slider)
```

**Files to DELETE:**
- `src/index.css` — replaced by `src/styles/globals.css`
- `src/App.css` — unused
- `src/assets/react.svg` — unused scaffold asset
- `public/vite.svg` — unused scaffold asset

### What NOT to Do in This Story

- Do NOT install `vite-plugin-pwa` or configure Service Worker — that's Story 1.5
- Do NOT install React Router — that's a later story
- Do NOT install `html2canvas` — that's a later story
- Do NOT implement any UI features or components beyond the store/lib scaffolding
- Do NOT modify any backend Java services
- Do NOT install Tailwind v3 — must be v4 for Vite 8 compatibility

### Previous Story Learnings (from 1.1, 1.2, 1.3)

- `penny/src/main.tsx` currently exports `API_BASE_URL` — this is dead code flagged in Story 1.3 review. Remove it when updating `main.tsx` in this story.
- `penny/src/App.tsx` is a minimal placeholder — safe to update to remove Vite/React logos
- `penny/src/index.css` exists from scaffold — delete it; `globals.css` replaces it
- Vite 8 template uses `tsconfig.app.json` (not `tsconfig.json`) for source compilation — all tsconfig changes go in `tsconfig.app.json`
- `@types/node` is already installed (added in Story 1.3) — no need to reinstall
- React version is 19.x (not 18) — verify Framer Motion and lottie-react peer deps support React 19

### React 19 Peer Dependency Note

The scaffold uses React 19.2.4. Verify compatibility before installing:
- `framer-motion` — v11+ supports React 19; use `npm install framer-motion@latest`
- `lottie-react` — check for React 19 support; if peer dep warning, use `--legacy-peer-deps` and note it
- `@tanstack/react-query` — v5 supports React 19
- `zustand` — v5 supports React 19
- `dexie` — no React peer dep, no issue

### References

- `_bmad-output/planning-artifacts/ux-design-specification.md` — Design System Foundation, Color System, Typography System sections (source of all design tokens)
- `_bmad-output/planning-artifacts/architecture.md` — "Starter Template Evaluation", "Data Architecture", "Frontend Architecture", "Project Structure & Boundaries"
- `_bmad-output/project-context.md` — Frontend Implementation Rules, Technology Stack
- `_bmad-output/planning-artifacts/epics/epic-1-foundation-security-hardening.md#Story 1.4`
- `_bmad-output/implementation-artifacts/1-3-react-pwa-scaffold-dev-environment.md` — File List and Dev Agent Record (what was built in Story 1.3)
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs/installation/vite) — Vite plugin setup
- [shadcn/ui docs](https://ui.shadcn.com/docs/installation/vite) — Vite installation

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro)

### Debug Log References

- TypeScript 6.0.2 deprecates `baseUrl` — added `"ignoreDeprecations": "6.0"` to `tsconfig.app.json` to silence the error (TS6 migration path)
- `npx shadcn@latest add` created files at literal `@/components/ui/` path instead of resolving the alias — moved files manually to `src/components/ui/`
- shadcn/ui components (`badge.tsx`, `button.tsx`) export both a component and a `cva` variant object, triggering `react-refresh/only-export-components` lint errors — disabled rule for `src/components/ui/**` in `eslint.config.js` (standard shadcn/ui pattern)
- framer-motion 12.38.0 and lottie-react 2.4.1 both support React 19 — no peer dep issues

### Completion Notes List

- Installed Tailwind CSS v4.2.2 with `@tailwindcss/vite` plugin; configured in `vite.config.ts`
- Created `src/styles/globals.css` with full Penny design tokens (`@theme` block) and shadcn/ui HSL CSS variable bridge
- Updated `index.html`: Nunito font (400/500/600/700/800 weights), `class="dark"` on `<html>`, removed vite.svg favicon reference
- Created `tailwind.config.ts` with `darkMode: ['class']` for shadcn/ui compatibility
- Added `@/` path alias to `vite.config.ts` and `tsconfig.app.json` (with `ignoreDeprecations: "6.0"`)
- Created `components.json` for shadcn/ui; added 5 components: button, badge, progress, sheet, slider to `src/components/ui/`
- Installed peer deps: `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-progress`, `@radix-ui/react-slider`
- Installed framer-motion 12.38.0 and lottie-react 2.4.1 (both React 19 compatible)
- Installed dexie; created `src/lib/db.ts` with `PennyDatabase` class — tables: `transactions`, `pendingSync`, `failedSync`
- Installed zustand v5; created 3 stores with typed State + Actions interfaces and `persist` middleware
- Installed `@tanstack/react-query` v5 and `axios`; created `src/lib/api.ts` with `QueryClient` and auth token interceptor
- Updated `src/main.tsx`: `QueryClientProvider` wrapper, `globals.css` import, removed dead `API_BASE_URL` export
- Updated `src/App.tsx`: minimal placeholder, no Vite/React logos
- Deleted: `src/index.css`, `src/App.css`, `src/assets/react.svg`, `public/vite.svg`
- `npm run build` ✅ zero TypeScript errors, 114 modules, 252KB JS bundle
- `npm run lint` ✅ zero errors

### File List

- `penny/vite.config.ts` — added `@tailwindcss/vite` plugin + `@/` path alias
- `penny/tailwind.config.ts` — NEW: darkMode class strategy
- `penny/components.json` — NEW: shadcn/ui config
- `penny/eslint.config.js` — added rule override for `src/components/ui/**`
- `penny/tsconfig.app.json` — added `ignoreDeprecations`, `baseUrl`, `paths`
- `penny/index.html` — added Nunito font links, `class="dark"`, removed vite.svg
- `penny/src/main.tsx` — QueryClientProvider, globals.css import, removed API_BASE_URL export
- `penny/src/App.tsx` — minimal placeholder, no Vite/React logos
- `penny/src/styles/globals.css` — NEW: Tailwind v4 + Penny design tokens + shadcn CSS vars
- `penny/src/lib/api.ts` — NEW: QueryClient + axios instance with auth interceptor
- `penny/src/lib/db.ts` — NEW: Dexie schema (transactions, pendingSync, failedSync)
- `penny/src/lib/utils.ts` — NEW: shadcn cn() helper
- `penny/src/store/goalStore.ts` — NEW: Zustand goal store with persist
- `penny/src/store/pennyStore.ts` — NEW: Zustand penny/mood store with persist
- `penny/src/store/streakStore.ts` — NEW: Zustand streak store with persist
- `penny/src/components/ui/button.tsx` — NEW: shadcn Button
- `penny/src/components/ui/badge.tsx` — NEW: shadcn Badge
- `penny/src/components/ui/progress.tsx` — NEW: shadcn Progress
- `penny/src/components/ui/sheet.tsx` — NEW: shadcn Sheet
- `penny/src/components/ui/slider.tsx` — NEW: shadcn Slider
- `penny/src/index.css` — DELETED
- `penny/src/App.css` — DELETED
- `penny/src/assets/react.svg` — DELETED
- `penny/public/vite.svg` — DELETED
