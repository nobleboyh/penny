---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowStatus: complete
completedAt: '2026-04-07'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/product-brief-penny.md"
  - "wiki/00-reverse-engineering-summary.md"
  - "wiki/01-system-overview.md"
  - "wiki/02-account-service.md"
  - "wiki/03-statistics-service.md"
  - "wiki/04-notification-service.md"
  - "wiki/05-auth-service.md"
  - "wiki/06-infrastructure-services.md"
  - "wiki/07-data-flow.md"
  - "wiki/08-architecture-patterns.md"
  - "wiki/09-deployment-operations.md"
  - "wiki/10-technology-stack.md"
workflowType: 'architecture'
project_name: 'piggymetrics'
user_name: 'Itobeo'
date: '2026-04-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (48 total):**
Organized into 11 capability areas: Authentication & Onboarding (FR1–6), Goal Management (FR7–13), Transaction Logging (FR14–19), Penny Mascot System (FR20–23), Habit & Engagement Mechanics (FR24–30), What If Simulator (FR31–34), Progression & Sharing (FR35–38), PWA & Platform (FR39–42), Personalization & Settings (FR43–45), Compliance & Safety (FR46–48). The core loop — log → progress → motivation → log again — is the irreducible minimum; all other features are downstream of this habit.

**Non-Functional Requirements (25 total):**
- Performance: TTI ≤ 3s (mobile 4G), LCP ≤ 2.5s, CLS < 0.1, Lighthouse PWA ≥ 90, offline core flows 100% functional
- Security: HTTPS/TLS 1.2+, persistent auth token store (pre-launch gate), no hardcoded secrets (pre-launch gate), server-side social token validation
- Scalability: 10x concurrent user headroom, horizontal Docker scaling, CDN-deployable static assets
- Accessibility: WCAG 2.1 AA, zero axe-core violations in CI, prefers-reduced-motion respected, 44px touch targets

**Scale & Complexity:**
- Primary domain: Full-stack brownfield (new React PWA + targeted backend hardening)
- Complexity level: High
- Estimated architectural components: ~12 custom React components, 1 Service Worker, 1 PWA manifest, auth-service hardening, secrets migration

### Technical Constraints & Dependencies

- **Existing backend preserved as-is:** All PiggyMetrics API contracts (account-service, statistics-service, notification-service, auth-service, Zuul gateway, Eureka) must not be broken
- **Frontend migration:** Pure JS → React PWA (confirmed constraint)
- **Auth-service hardening:** In-memory token store → Redis/DB-backed persistent store; NoOp encoder → production-grade; add Google OAuth2 + Apple Sign In
- **Secrets management:** Hardcoded config secrets → environment variables or secrets manager
- **Client-side only for v1:** NLP parsing, shareable card generation (html2canvas) — no new backend services
- **COPPA 2025:** Age gate implementation path must be decided before build starts (default: 16+ restriction)
- **Apple Sign In:** Must ship simultaneously with Google OAuth2 on iOS (Apple policy)

### Cross-Cutting Concerns Identified

1. **Offline sync** — Service Worker + IndexedDB queue for transactions; affects logging, goal state, and streak tracking
2. **Auth token lifecycle** — Social login tokens (Google/Apple) validated server-side; persistent store required; affects every authenticated API call
3. **Penny mascot state** — Mood state is derived from financial health + activity data; must be consistent across all screens and survive page refresh
4. **Performance budget** — Code splitting, lazy loading, CDN caching strategy affects every feature's implementation approach
5. **Accessibility** — axe-core CI enforcement + WCAG 2.1 AA affects every component; prefers-reduced-motion affects all animations
6. **Shareable card generation** — html2canvas client-side rendering affects What If Simulator, milestone cards, and Saver Level up flows
7. **Secrets & environment config** — Affects deployment pipeline, local dev setup, and CI/CD configuration

## Starter Template Evaluation

### Primary Technology Domain

React PWA (SPA) — mobile-first, installable, offline-capable. No SSR required; static assets served via CDN.

### Selected Starter: Vite + React (TypeScript)

**Initialization Command:**

```bash
npm create vite@latest penny -- --template react-ts
```

**Rationale:** Vite is the current standard for React SPAs — fastest HMR, optimized production builds, and first-class PWA support via `vite-plugin-pwa` (Workbox). No SSR overhead. Full control over architecture without framework opinions conflicting with the custom Penny component system.

**Architectural Decisions Provided by Starter:**

- **Language:** TypeScript (strict mode)
- **Build tooling:** Vite (esbuild dev, Rollup prod) — code splitting and tree-shaking out of the box
- **PWA:** `vite-plugin-pwa` added post-init — generates Service Worker (Workbox), `manifest.json`, offline fallback
- **Styling:** Tailwind CSS + shadcn/ui added post-init
- **Routing:** React Router v6 added post-init (SPA client-side routing)
- **State management:** Zustand added post-init (lightweight, no boilerplate — fits Penny mood state + goal state)
- **Animations:** Framer Motion added post-init
- **Mascot animations:** Lottie (`lottie-react`) added post-init
- **Shareable cards:** `html2canvas` added post-init
- **Testing:** Vitest + React Testing Library added post-init (Vite-native, no Jest config overhead)
- **Linting:** ESLint + Prettier (included in template)
- **Project structure:** Feature-based (`/components`, `/features`, `/hooks`, `/lib`, `/store`)

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Auth-service hardening (persistent token store + social login) — pre-launch gate
- Secrets migration — pre-launch gate
- Offline persistence strategy — core PWA requirement
- COPPA age gate path — pre-launch legal gate (default: 16+ restriction)

**Important Decisions (Shape Architecture):**
- TanStack Query for server state
- Dexie.js for offline persistence
- Feature-based project structure
- Nginx (dev) + CDN (prod) deployment split

**Deferred Decisions (Post-MVP):**
- Native mobile app (Phase 3)
- Monetization layer
- Bank/card integration

---

### Data Architecture

**Offline Persistence: Dual-layer strategy**
- **Dexie.js (IndexedDB)** — transaction queue, full transaction history, offline write buffer, sync-on-reconnect. Chosen over localStorage due to unlimited storage, async API, and queryability for growing transaction logs.
- **Zustand + persist middleware (localStorage)** — lightweight UI state: current goal, Penny mood state, streak counter, Saver Level. Synchronous reads for instant UI hydration on app open.
- **Sync strategy:** Transactions written to Dexie first (optimistic), then flushed to backend via TanStack Query mutation on reconnect. Conflict resolution: last-write-wins (single-user app, no multi-device conflict risk in v1).

---

### Authentication & Security

**Social Login: Extend existing auth-service (Option A)**
- Add Google OAuth2 + Apple Sign In providers to Spring Security auth-service
- Swap in-memory token store → **Redis** (persistent, fast, horizontally scalable)
- Replace NoOp password encoder → BCrypt
- Social tokens validated server-side before issuing internal OAuth2 tokens — client-side token trust not acceptable (NFR11)
- Apple Sign In ships simultaneously with Google OAuth2 (Apple policy, NFR23)

**Secrets Management:**
- Local/dev: `.env` files (gitignored), Docker Compose `env_file`
- Production: Docker secrets or cloud secrets manager (AWS Secrets Manager / equivalent)
- Zero hardcoded secrets in source or config files (NFR10, pre-launch gate)

**COPPA 2025:**
- Default path: 16+ age gate at registration (simplest compliant path)
- Age gate implemented in React onboarding flow; enforced server-side in auth-service registration endpoint

---

### API & Communication Patterns

**HTTP Client: TanStack Query v5**
- Handles server state lifecycle: caching, stale-while-revalidate, background refetch, loading/error states
- Optimistic updates for transaction logging — goal progress bar updates instantly, syncs in background (supports "under 5 seconds" UX requirement)
- Offline mutation queue integrates with Dexie.js offline buffer
- All API calls routed through existing Zuul gateway — no direct service calls from frontend
- Base URL configured via environment variable (`VITE_API_BASE_URL`)

**Error Handling:**
- TanStack Query error boundaries per feature
- Offline state: amber indicator on StreakBadge, no error shown to user — full core functionality available (NFR6)
- API errors surfaced via Penny response bubble (contextual), not generic toast

---

### Frontend Architecture

**Project Structure (feature-based):**
```
src/
  features/
    auth/           ← login, registration, age gate, token management
    goal/           ← goal CRUD, progress calculation, countdown mode
    transactions/   ← NLP parser, logging flow, history, offline queue
    penny/          ← mood engine, response templates, animation state
    simulator/      ← What If Simulator, shareable card generation
    sharing/        ← milestone cards, Saver Level cards, native share
  components/       ← shared: PennyAvatar, GoalProgressCard, StreakBadge,
                       PennyChatInput, PennyResponseBubble, StoriesWeeklySummary
  hooks/            ← useOfflineSync, usePennyMood, useStreak, useGoalProgress
  lib/
    api.ts          ← TanStack Query client, Zuul base URL config
    db.ts           ← Dexie.js schema and instance
    nlp.ts          ← client-side NLP parser (regex + keyword matching)
  store/            ← Zustand slices: goalStore, pennyStore, streakStore
  sw.ts             ← Service Worker (Workbox via vite-plugin-pwa)
```

**Penny Mood Engine:**
- Pure function in `features/penny/moodEngine.ts`
- Inputs: goal progress %, streak count, days since last log, recent transaction patterns
- Outputs: one of ≤10 mood states (idle, happy, excited, sad, celebrating, worried, proud, neutral, thinking, disappointed)
- Mood state persisted in Zustand (localStorage) — survives page refresh

**NLP Parser (`lib/nlp.ts`):**
- Regex extracts amount (handles "$6", "6 dollars", "spent 6")
- Keyword matching maps to category + emoji (≤20 category rules)
- Returns `{ amount, category, emoji, confidence }` — low confidence triggers structured form fallback

---

### Infrastructure & Deployment

**Local / Dev:** Nginx container added to existing `docker-compose.dev.yml` — serves Vite build, proxies `/api` to Zuul gateway. Single `docker-compose up` starts full stack.

**Production:** CDN deployment (Vercel or Cloudflare Pages) for React PWA static assets — global edge, automatic HTTPS, meets TTI ≤ 3s target. Backend remains Docker Compose on server.

**CI/CD:** GitHub Actions
- On PR: `vitest`, `axe-core` accessibility audit, Lighthouse CI (PWA ≥ 90, Performance ≥ 80)
- On merge to main: build + deploy to CDN; Docker image build for backend services

**Environment config:**
- `VITE_API_BASE_URL` — Zuul gateway URL
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth2
- All backend secrets via `.env` / Docker secrets

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Secrets migration + auth-service hardening (Redis token store, BCrypt, Google + Apple OAuth2)
2. Vite + React PWA scaffold (`npm create vite@latest penny -- --template react-ts`)
3. Tailwind + shadcn/ui + Framer Motion + Lottie setup
4. Dexie.js schema + Zustand stores
5. TanStack Query client + API layer (Zuul gateway)
6. Service Worker (vite-plugin-pwa + Workbox)
7. Core features: auth → goal → transactions → Penny mascot
8. What If Simulator + shareable cards
9. Progression system (Saver Level, milestone cards)
10. CI/CD pipeline + CDN deployment

**Cross-Component Dependencies:**
- Penny mood engine depends on: goal progress (goal store), streak count (streak store), transaction patterns (Dexie.js)
- Offline sync depends on: Dexie.js queue + TanStack Query mutation retry
- Shareable cards depend on: html2canvas + feature data (simulator result, milestone state)
- Auth flow gates: all other features (no unauthenticated access to goal/transaction data)

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

9 areas where AI agents could make different choices without explicit rules:
file naming, component structure, API response handling, error patterns,
state update approach, offline queue handling, Penny mood derivation,
date/time formatting, and test co-location.

---

### Naming Patterns

**File & Directory Naming:**
- React components: PascalCase filename matching component name — `PennyAvatar.tsx`
- Non-component files: camelCase — `moodEngine.ts`, `nlp.ts`, `goalStore.ts`
- Feature directories: camelCase — `features/transactions/`, `features/penny/`
- Test files: co-located, `.test.tsx` / `.test.ts` suffix — `PennyAvatar.test.tsx`
- Hook files: camelCase prefixed with `use` — `useOfflineSync.ts`

**Code Naming:**
- Components: PascalCase — `GoalProgressCard`, `PennyChatInput`
- Hooks: camelCase, `use` prefix — `usePennyMood`, `useGoalProgress`
- Zustand stores: camelCase, `Store` suffix — `goalStore`, `pennyStore`
- TanStack Query keys: array of string literals — `['account', 'current']`, `['statistics', accountName]`
- Dexie tables: camelCase plural — `transactions`, `pendingSync`
- Event handlers: `handle` prefix — `handleConfirm`, `handleSliderChange`
- Boolean props/state: `is`/`has`/`can` prefix — `isOffline`, `hasStreak`, `canShare`

**API Naming (existing backend — do not change):**
- All existing PiggyMetrics endpoints preserved as-is
- Frontend query key mirrors the endpoint path: `/accounts/current` → `['accounts', 'current']`

---

### Structure Patterns

**Component File Structure (every component follows this):**
```
ComponentName/
  index.ts              ← re-export only
  ComponentName.tsx     ← component implementation
  ComponentName.test.tsx
```
Single-file components acceptable only for components < 50 lines with no test needed.

**Feature Module Structure:**
```
features/featureName/
  index.ts          ← public API (what other features can import)
  components/       ← feature-specific components
  hooks/            ← feature-specific hooks
  types.ts          ← feature-specific TypeScript types
  api.ts            ← TanStack Query hooks for this feature
```
Cross-feature imports ONLY through `index.ts` — never import directly from a feature's internals.

**Zustand Store Structure (every store follows this):**
```typescript
interface GoalState {
  // state fields
}
interface GoalActions {
  // action methods
}
type GoalStore = GoalState & GoalActions
```
State and actions always typed separately, combined in store type.

---

### Format Patterns

**API Response Handling (TanStack Query):**
- All queries use the existing PiggyMetrics response shape — no wrapper added
- Error responses: extract `message` field if present, fallback to HTTP status text
- Never expose raw API error objects to UI — always map to user-facing strings via `lib/errors.ts`

**Date/Time:**
- All dates stored and transmitted as ISO 8601 strings (`2026-04-07T13:00:00.000Z`)
- Display formatting via `Intl.DateTimeFormat` — no date library added
- Streak dates compared as `YYYY-MM-DD` strings in local timezone (not UTC) — streak is a local-day concept

**TypeScript:**
- Strict mode enforced (`"strict": true` in tsconfig)
- No `any` — use `unknown` + type guard if type is genuinely unknown
- All component props typed with explicit interface, not inline type
- All API response shapes typed in `features/[feature]/types.ts`

---

### Communication Patterns

**Zustand State Updates:**
- Always immutable — use spread or Immer if nested
- Actions defined inside `create()` — never mutate state outside the store
- No direct store access in components — always via selector hook: `const goal = useGoalStore(s => s.goal)`
- Selectors are stable references — memoize with `useShallow` for object selects

**TanStack Query + Offline Queue:**
- Optimistic updates: `onMutate` → update cache → `onError` → rollback
- Offline transactions: write to Dexie `pendingSync` table first, then attempt mutation
- On reconnect: `useOfflineSync` hook drains `pendingSync` table in insertion order
- Never retry a failed mutation more than 3 times — move to `failedSync` table after 3 failures

**Penny Mood Derivation:**
- Mood is ALWAYS derived via `moodEngine(state)` — never set directly
- `moodEngine` is a pure function — no side effects, no async
- Called once per meaningful state change (after transaction log, on app open, on streak update)
- Result stored in `pennyStore.currentMood` — components read from store, never call engine directly

---

### Process Patterns

**Error Handling:**
```
API error → TanStack Query catches → map via lib/errors.ts →
  if recoverable: show via PennyResponseBubble (contextual)
  if fatal: show via ErrorBoundary fallback
  if offline: suppress, queue in Dexie, show amber sync indicator
```
- Never use `alert()` or `console.error` in production code
- All errors logged via `lib/logger.ts` (wraps console in dev, no-op in prod until monitoring added)

**Loading States:**
- Use TanStack Query `isLoading` / `isFetching` — no manual loading booleans for server state
- Skeleton screens (not spinners) for initial data load — match content shape
- Optimistic updates mean most mutations show no loading state — instant UI feedback

**Offline State:**
- `useOfflineSync` hook owns the `navigator.onLine` listener — single source of truth
- Components never check `navigator.onLine` directly — read from `useOfflineSync().isOnline`
- Offline indicator: amber dot on `StreakBadge` only — no banners, no blocking UI

**Accessibility (enforced in every component):**
- Semantic HTML always — `<button>` not `<div onClick>`, `<nav>`, `<main>`, `<progress>`
- Every icon-only interactive element has `aria-label`
- `PennyResponseBubble` always has `role="status"` + `aria-live="polite"`
- `GoalProgressCard` progress bar always has `role="progressbar"` + `aria-valuenow/min/max`
- All animations wrapped in `useReducedMotion()` check — instant fallback if true

---

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow feature module boundaries — no cross-feature direct imports
- Use `moodEngine()` for all Penny mood changes — never set mood directly
- Write to Dexie before attempting API mutation — offline-first always
- Map all API errors through `lib/errors.ts` before surfacing to UI
- Add `aria-label` to every icon-only interactive element
- Co-locate tests with components (`ComponentName.test.tsx`)
- Use TanStack Query keys from the pattern: `[resource, identifier?]`

**Anti-Patterns (never do these):**
- `import { X } from '../otherFeature/components/X'` — use `../otherFeature` (index only)
- `pennyStore.setState({ currentMood: 'happy' })` — use `moodEngine()` instead
- `if (!navigator.onLine)` in components — use `useOfflineSync().isOnline`
- `catch (e) { console.error(e) }` — use `lib/logger.ts`
- `const [loading, setLoading] = useState(false)` for server state — use TanStack Query

## Project Structure & Boundaries

### Complete Project Directory Structure

```
penny/                                  ← React PWA (new frontend)
├── README.md
├── package.json
├── vite.config.ts                      ← vite-plugin-pwa configured here
├── tailwind.config.ts
├── tsconfig.json                       ← strict: true
├── tsconfig.node.json
├── components.json                     ← shadcn/ui config
├── .env.example                        ← VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
├── .env.local                          ← gitignored
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← vitest + axe-core + Lighthouse CI on PR
│       └── deploy.yml                  ← build + CDN deploy on merge to main
├── public/
│   ├── icons/                          ← PWA icons (192px, 512px, maskable)
│   ├── penny-mascot.png                ← OG image for social link previews
│   └── manifest.json                   ← generated by vite-plugin-pwa
├── src/
│   ├── main.tsx                        ← React root, QueryClientProvider, Router
│   ├── App.tsx                         ← route definitions, auth guard
│   ├── sw.ts                           ← Workbox Service Worker entry
│   │
│   ├── features/
│   │   ├── auth/                       ← FR1–6, FR46–48
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── api.ts                  ← useLogin, useRegister, useLogout
│   │   │   ├── hooks/
│   │   │   │   └── useAuthGuard.ts
│   │   │   └── components/
│   │   │       ├── AgeGate.tsx         ← FR46: COPPA 16+ gate
│   │   │       ├── SocialLoginButtons.tsx  ← FR1: Google + Apple
│   │   │       └── OnboardingFlow.tsx  ← FR2–5: goal setup + Penny intro
│   │   │
│   │   ├── goal/                       ← FR7–13
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── api.ts                  ← useCurrentAccount, useUpdateAccount
│   │   │   ├── hooks/
│   │   │   │   ├── useGoalProgress.ts  ← progress %, weekly target calc
│   │   │   │   └── useGoalCountdown.ts ← FR12: countdown mode threshold
│   │   │   └── components/
│   │   │       ├── GoalSetupForm.tsx
│   │   │       └── GoalCompletionCelebration.tsx  ← FR13
│   │   │
│   │   ├── transactions/               ← FR14–19
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── api.ts                  ← useUpdateStatistics (PUT /statistics/{account})
│   │   │   ├── hooks/
│   │   │   │   └── useTransactionLog.ts ← optimistic update + Dexie queue
│   │   │   └── components/
│   │   │       ├── TransactionHistory.tsx  ← FR18
│   │   │       └── CategoryPicker.tsx      ← FR16: one-tap correction
│   │   │
│   │   ├── penny/                      ← FR20–23
│   │   │   ├── index.ts
│   │   │   ├── types.ts                ← MoodState enum (≤10 states)
│   │   │   ├── moodEngine.ts           ← pure function: state → MoodState
│   │   │   ├── responseTemplates.ts    ← ≤30 contextual message templates
│   │   │   └── hooks/
│   │   │       └── usePennyMood.ts     ← reads pennyStore, calls moodEngine
│   │   │
│   │   ├── simulator/                  ← FR31–34
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── useSimulatorCalc.ts ← real-time goal date recalculation
│   │   │   └── components/
│   │   │       └── WhatIfSimulator.tsx ← FR31–32: slider + real-time calc
│   │   │
│   │   ├── sharing/                    ← FR33–34, FR37–38
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── useShareCard.ts     ← html2canvas + Web Share API
│   │   │   └── components/
│   │   │       ├── ShareableCard.tsx   ← hidden DOM element for html2canvas
│   │   │       └── ShareButton.tsx     ← native share sheet trigger
│   │   │
│   │   └── engagement/                 ← FR24–30, FR35–36, FR39–42
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── hooks/
│   │       │   ├── useStreak.ts        ← FR24–25: streak tracking
│   │       │   └── useSaverLevel.ts    ← FR35–36: Bronze→Penny Legend
│   │       └── components/
│   │           ├── StoriesWeeklySummary.tsx  ← FR26
│   │           ├── EmojiBreakdown.tsx        ← FR27
│   │           ├── GlowUpStats.tsx           ← FR28–29
│   │           └── PWAInstallPrompt.tsx      ← FR39: Penny-voiced prompt
│   │
│   ├── components/                     ← shared across features
│   │   ├── PennyAvatar/
│   │   │   ├── index.ts
│   │   │   ├── PennyAvatar.tsx         ← Lottie + mood state → animation
│   │   │   └── PennyAvatar.test.tsx
│   │   ├── GoalProgressCard/
│   │   │   ├── index.ts
│   │   │   ├── GoalProgressCard.tsx    ← home screen hero, neon glow progress bar
│   │   │   └── GoalProgressCard.test.tsx
│   │   ├── PennyChatInput/
│   │   │   ├── index.ts
│   │   │   ├── PennyChatInput.tsx      ← bottom sheet NLP input
│   │   │   └── PennyChatInput.test.tsx
│   │   ├── PennyResponseBubble/
│   │   │   ├── index.ts
│   │   │   ├── PennyResponseBubble.tsx ← role="status" aria-live="polite"
│   │   │   └── PennyResponseBubble.test.tsx
│   │   ├── StreakBadge/
│   │   │   ├── index.ts
│   │   │   ├── StreakBadge.tsx         ← amber dot when isOffline
│   │   │   └── StreakBadge.test.tsx
│   │   ├── BottomNav/
│   │   │   ├── index.ts
│   │   │   └── BottomNav.tsx           ← 5-tab nav, Penny center tab
│   │   └── ui/                         ← shadcn/ui components (copied in)
│   │       ├── button.tsx
│   │       ├── sheet.tsx
│   │       ├── slider.tsx
│   │       ├── progress.tsx
│   │       ├── badge.tsx
│   │       └── ...
│   │
│   ├── hooks/                          ← cross-feature hooks
│   │   ├── useOfflineSync.ts           ← navigator.onLine + Dexie drain on reconnect
│   │   └── useReducedMotion.ts         ← prefers-reduced-motion wrapper
│   │
│   ├── store/                          ← Zustand slices
│   │   ├── goalStore.ts                ← current goal, progress %
│   │   ├── pennyStore.ts               ← currentMood, lastReaction
│   │   └── streakStore.ts              ← streakCount, lastLogDate, saverLevel
│   │
│   ├── lib/
│   │   ├── api.ts                      ← TanStack QueryClient, axios instance, VITE_API_BASE_URL
│   │   ├── db.ts                       ← Dexie schema: transactions, pendingSync, failedSync
│   │   ├── nlp.ts                      ← regex amount extractor + keyword→category mapper
│   │   ├── errors.ts                   ← API error → user-facing string mapper
│   │   └── logger.ts                   ← console wrapper (dev) / no-op (prod)
│   │
│   ├── pages/                          ← route-level components (lazy loaded)
│   │   ├── Home.tsx                    ← GoalProgressCard + StreakBadge + PennyChatInput
│   │   ├── Journey.tsx                 ← EmojiBreakdown + GlowUpStats + WhatIfSimulator
│   │   ├── PennySays.tsx               ← StoriesWeeklySummary + notification settings
│   │   ├── MyVibe.tsx                  ← FR43–45: personalization + settings
│   │   └── Onboarding.tsx              ← OnboardingFlow (unauthenticated route)
│   │
│   └── styles/
│       ├── globals.css                 ← Tailwind base + CSS custom properties (design tokens)
│       └── animations.css              ← neon glow keyframes, confetti
│
└── nginx.conf                          ← for docker-compose.dev.yml Nginx container
```

---

### Architectural Boundaries

**API Boundaries:**
- All frontend → backend calls go through Zuul gateway (`VITE_API_BASE_URL`)
- No direct calls to individual microservices from frontend
- Auth boundary: all routes except `/onboarding` require valid OAuth2 token in `Authorization: Bearer` header
- Token refresh handled in `lib/api.ts` axios interceptor — transparent to feature code

**Component Boundaries:**
- Features expose only what's in their `index.ts` — internal components are private
- Shared components in `components/` have no feature-specific logic — they accept props only
- `pages/` compose features and shared components — no business logic in pages

**Data Boundaries:**
- Server state: owned by TanStack Query (`lib/api.ts`) — features use hooks from `features/[x]/api.ts`
- Client/UI state: owned by Zustand stores (`store/`) — persisted to localStorage
- Offline queue: owned by Dexie (`lib/db.ts`) — only `useOfflineSync` and `useTransactionLog` write to it

---

### Requirements to Structure Mapping

| FR Group | Location |
|---|---|
| FR1–6 (Auth & Onboarding) | `features/auth/`, `pages/Onboarding.tsx` |
| FR7–13 (Goal Management) | `features/goal/`, `components/GoalProgressCard/` |
| FR14–19 (Transaction Logging) | `features/transactions/`, `components/PennyChatInput/`, `lib/nlp.ts`, `lib/db.ts` |
| FR20–23 (Penny Mascot) | `features/penny/`, `components/PennyAvatar/`, `components/PennyResponseBubble/` |
| FR24–30 (Habit & Engagement) | `features/engagement/`, `components/StreakBadge/` |
| FR31–34 (What If Simulator) | `features/simulator/`, `features/sharing/` |
| FR35–38 (Progression & Sharing) | `features/engagement/`, `features/sharing/` |
| FR39–42 (PWA & Platform) | `vite.config.ts`, `src/sw.ts`, `public/manifest.json`, `features/engagement/components/PWAInstallPrompt.tsx` |
| FR43–45 (Settings) | `pages/MyVibe.tsx` |
| FR46–48 (Compliance & Safety) | `features/auth/components/AgeGate.tsx`, `features/simulator/` (disclaimer) |

**Cross-Cutting Concerns:**

| Concern | Location |
|---|---|
| Offline sync | `hooks/useOfflineSync.ts` + `lib/db.ts` |
| Error handling | `lib/errors.ts` + `lib/logger.ts` |
| Auth token lifecycle | `lib/api.ts` (interceptor) |
| Penny mood | `features/penny/moodEngine.ts` + `store/pennyStore.ts` |
| Accessibility | Every component (enforced by axe-core CI) |
| Reduced motion | `hooks/useReducedMotion.ts` |

---

### Integration Points

**Internal Communication:**
- Feature → shared component: props only
- Feature → another feature: via `index.ts` exports only
- Feature → server state: via `features/[x]/api.ts` TanStack Query hooks
- Feature → client state: via `store/[x]Store.ts` Zustand selectors

**External Integrations:**
- PiggyMetrics backend: via Zuul gateway (`lib/api.ts`)
- Google OAuth2: via updated auth-service (server-side flow)
- Apple Sign In: via Apple JS SDK + auth-service validation
- Web Push API: via Service Worker (`src/sw.ts`)
- Native Share: via `navigator.share()` in `features/sharing/hooks/useShareCard.ts`

**Data Flow (transaction log — critical path):**
```
User types in PennyChatInput
  → lib/nlp.ts parses amount + category
  → useTransactionLog writes to Dexie pendingSync
  → optimistic update to TanStack Query cache (goal progress updates instantly)
  → Penny mood recalculated via moodEngine()
  → PennyResponseBubble shows contextual reaction
  → background: TanStack Query mutation → PUT /statistics/{account} via Zuul
  → on success: remove from Dexie pendingSync
  → on failure (offline): stays in pendingSync, useOfflineSync drains on reconnect
```

## Architecture Validation Results

### Coherence Validation ✅

All technology choices are compatible. Vite + React + TypeScript + Tailwind + shadcn/ui + Framer Motion + Lottie have no version conflicts. TanStack Query (server state), Zustand (client state), and Dexie.js (offline queue) have clean, non-overlapping responsibilities. vite-plugin-pwa (Workbox) and React Router v6 are compatible in SPA mode.

**Known implementation constraint:** `html2canvas` has limitations with CSS custom properties. `ShareableCard.tsx` must use inline styles or a canvas-safe DOM subtree — not a blocker, flagged for implementation story.

### Requirements Coverage Validation ✅

All 48 functional requirements and 25 non-functional requirements are architecturally supported. Every FR maps to a specific file or module. All pre-launch gates (auth hardening, secrets migration, COPPA age gate, Apple Sign In) are explicitly documented as blocking items.

### Implementation Readiness Validation ✅

All critical decisions documented with rationale. 9 conflict points addressed with explicit anti-patterns. Complete project tree defined. Critical transaction log data flow traced end-to-end.

### Gap Analysis Results

**Important gap — Zuul frontend routing:**
The existing `gateway` service (Zuul) currently serves the old pure-JS frontend at `/`. In `docker-compose.dev.yml`, the Nginx container serving the new React PWA must be configured as the upstream for `/` in Zuul's routing config, or Zuul's static content serving must be disabled and replaced with a direct Nginx proxy. This must be resolved in the first implementation story (scaffold + dev environment setup).

**Minor gap — html2canvas constraint:**
`ShareableCard.tsx` must use inline styles for canvas-rendered content. Document this in the component's implementation story.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with rationale
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] Pre-launch security gates documented

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented (error handling, loading, offline, accessibility)
- [x] Anti-patterns explicitly listed

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] All FRs mapped to specific locations

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Brownfield constraint (no backend changes) is fully respected — all 48 FRs implementable against existing PiggyMetrics APIs
- Offline-first architecture is coherent end-to-end (Dexie → optimistic update → background sync)
- Penny mood engine is isolated as a pure function — testable, consistent, no side effects
- Pre-launch security gates are explicit and blocking — no accidental launch with demo-grade auth

**Areas for Future Enhancement:**
- Monitoring/observability (`logger.ts` is a no-op in prod — add Sentry or equivalent post-launch)
- E2E test suite (Playwright) — not in MVP CI but recommended for Phase 2
- Multi-device sync conflict resolution — last-write-wins is sufficient for v1 single-user, revisit for Phase 3 social features

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently — refer to anti-patterns list before writing any code
- Respect feature module boundaries — cross-feature imports only via `index.ts`
- All Penny mood changes via `moodEngine()` — never set mood directly
- Write to Dexie before API mutation — offline-first always

**First Implementation Priority:**
```bash
# 1. Auth-service hardening (pre-launch gate — do this before frontend)
# 2. Scaffold React PWA:
npm create vite@latest penny -- --template react-ts
# 3. Resolve Zuul frontend routing in docker-compose.dev.yml
```
