# Story 2.6: Returning User Session Restore

Status: done

## Story

As a returning user,
I want to be authenticated and returned to my existing session state,
so that I don't have to set up my goal again.

## Acceptance Criteria

1. **Given** a user has previously completed onboarding
   **When** they open the Penny PWA
   **Then** their existing OAuth2 token is validated against the Redis token store

2. **And** they are routed directly to the home screen (skipping onboarding)

3. **And** their goal state, streak, and Penny mood are restored from Zustand (localStorage)

4. **And** if the token is expired, they are routed to the login screen (not onboarding)

5. **And** an expired token does not cause a blank screen or unhandled error

## Context: What's Already Done

**Token storage already exists:** `useLogin` and `useSocialLogin` in `penny/src/features/auth/api.ts` both call `localStorage.setItem('access_token', response.data.access_token)` on success.

**`apiClient` already attaches the token:** `penny/src/lib/api.ts` has a request interceptor that reads `localStorage.getItem('access_token')` and sets `Authorization: Bearer <token>` on every request.

**Zustand stores already persist to localStorage:** All three stores use `persist` middleware:
- `goalStore` → `penny-goal` key (goalName, goalAmount, targetDate, isJustSaving, savedAmount)
- `pennyStore` → `penny-mood` key (currentMood, lastReaction)
- `streakStore` → `penny-streak` key (streakCount, lastLogDate, saverLevel)

**The gap:** `App.tsx` has no auth guard. The catch-all `<Route path="*">` redirects to `/onboarding` — so a returning user with a valid token always hits the age gate again. There is no startup check that reads the token and routes accordingly.

**`useAuthGuard.ts` does NOT exist yet** — `penny/src/features/auth/hooks/` directory does not exist.

## Tasks / Subtasks

- [x] Create `useAuthGuard.ts` hook in `penny/src/features/auth/hooks/` (AC: 1, 2, 4, 5)
  - [x] Read `access_token` from localStorage
  - [x] If no token → return `{ status: 'unauthenticated' }`
  - [x] If token exists → call `GET /accounts/current` to validate against Redis token store
  - [x] If validation succeeds → return `{ status: 'authenticated' }`
  - [x] If validation fails (401/403/network error) → clear `access_token` from localStorage → return `{ status: 'unauthenticated', expired: true }`

- [x] Create `AuthGuard.tsx` component in `penny/src/features/auth/components/` (AC: 2, 4, 5)
  - [x] Show loading state (skeleton or spinner) while token validation is in-flight
  - [x] On `authenticated` → render children (the protected route)
  - [x] On `unauthenticated` with `expired: true` → redirect to `/login`
  - [x] On `unauthenticated` without expired → redirect to `/onboarding`
  - [x] Never render a blank screen — always show loading or redirect

- [x] Wrap protected routes in `App.tsx` with `<AuthGuard>` (AC: 2, 4)
  - [x] `/home`, `/stuff`, `/journey`, `/penny-says`, `/vibe` are protected routes
  - [x] `/onboarding`, `/login`, `/onboarding/goal` remain public (no guard)
  - [x] Update catch-all `*` to redirect to `/onboarding` (unchanged)

- [x] Export `AuthGuard` from `penny/src/features/auth/index.ts` (AC: architecture compliance)

- [x] Verify Zustand state is restored automatically (AC: 3)
  - [x] No code change needed — `persist` middleware rehydrates on store access
  - [x] Confirm `_hasHydrated` guard in `goalStore` prevents flash of empty state

## Dev Notes

### The Core Flow

```
App opens
  ↓
AuthGuard mounts on protected route
  ↓
Read localStorage 'access_token'
  ├── No token → redirect to /onboarding (new user)
  └── Token exists → GET /accounts/current
        ├── 200 OK → render children (home screen)
        └── 401/403/error → clear token → redirect to /login (expired)
```

### `useAuthGuard` Hook Implementation

```typescript
// penny/src/features/auth/hooks/useAuthGuard.ts
import { useEffect, useState } from 'react'
import { apiClient } from '../../../lib/api'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'expired'

export function useAuthGuard(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setStatus('unauthenticated')
      return
    }
    apiClient
      .get('/accounts/current')
      .then(() => setStatus('authenticated'))
      .catch(() => {
        localStorage.removeItem('access_token')
        setStatus('expired')
      })
  }, [])

  return status
}
```

### `AuthGuard` Component Implementation

```tsx
// penny/src/features/auth/components/AuthGuard.tsx
import { Navigate } from 'react-router-dom'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const status = useAuthGuard()

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-bounce" role="img" aria-label="Loading">🐷</span>
      </main>
    )
  }
  if (status === 'expired') return <Navigate to="/login" replace />
  if (status === 'unauthenticated') return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
```

### `App.tsx` Update

```tsx
// Wrap protected routes — do NOT wrap /onboarding, /login, /onboarding/goal
import { AuthGuard } from './features/auth'

// Inside <Routes>:
<Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
<Route path="/stuff" element={<AuthGuard><MyStuff /></AuthGuard>} />
<Route path="/journey" element={<AuthGuard><Journey /></AuthGuard>} />
<Route path="/penny-says" element={<AuthGuard><PennySays /></AuthGuard>} />
<Route path="/vibe" element={<AuthGuard><MyVibe /></AuthGuard>} />
```

### `features/auth/index.ts` Export Addition

```typescript
export { AuthGuard } from './components/AuthGuard'
```

### Zustand State Restoration (AC 3 — No Code Change)

All three stores use `persist` middleware — they rehydrate automatically from localStorage when the store is first accessed. The `_hasHydrated` flag in `goalStore` already prevents flash of empty state in `Home.tsx`. No additional code needed for AC 3.

### Token Validation via `/accounts/current`

This endpoint is the correct validation target:
- It requires a valid Bearer token (returns 401 if expired/invalid)
- It's already used in `SocialLoginButtons.tsx` (`registerIfNew` function) to check if account exists
- The `apiClient` interceptor automatically attaches the token from localStorage

### File Locations (architecture compliance)

- `penny/src/features/auth/hooks/useAuthGuard.ts` — new hook (create `hooks/` directory)
- `penny/src/features/auth/components/AuthGuard.tsx` — new component (single file, < 50 lines, no test needed)
- `penny/src/App.tsx` — MODIFIED: wrap 5 protected routes with `<AuthGuard>`
- `penny/src/features/auth/index.ts` — MODIFIED: add `AuthGuard` export

### What NOT to Do

- Do NOT use TanStack Query for the auth check — this is a one-time startup validation, not server state that needs caching/refetching
- Do NOT add `useAuthGuard` to every page component — it belongs in `App.tsx` route wrapping only
- Do NOT redirect expired tokens to `/onboarding` — they must go to `/login` (AC 4)
- Do NOT show a blank screen during the loading state — always render the pig loading indicator (AC 5)
- Do NOT clear Zustand stores on token expiry — the user's goal/streak data should persist for when they log back in
- Do NOT modify `SocialLoginButtons.tsx` or `OnboardingFlow.tsx` — they already handle post-login routing correctly
- Do NOT add auth guard to `/onboarding/goal` — it's part of the new user flow and must remain public

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — Token validated against Redis token store | `GET /accounts/current` with Bearer token — auth-service validates against Redis (Story 1.2) |
| 2 — Route to home screen, skip onboarding | `AuthGuard` renders children on `authenticated` status |
| 3 — Goal/streak/mood restored from Zustand | Automatic via `persist` middleware — no code change |
| 4 — Expired token → login screen (not onboarding) | `status === 'expired'` → `<Navigate to="/login" replace />` |
| 5 — No blank screen on expired token | Loading state renders pig emoji; error path always redirects |

### References

- `penny/src/App.tsx` — current route definitions (needs AuthGuard wrapping)
- `penny/src/features/auth/api.ts` — `useSocialLogin` / `useLogin` (token storage pattern)
- `penny/src/lib/api.ts` — `apiClient` with Bearer token interceptor
- `penny/src/store/goalStore.ts` — persist middleware + `_hasHydrated` guard
- `penny/src/store/pennyStore.ts` — persist middleware
- `penny/src/store/streakStore.ts` — persist middleware
- `penny/src/features/auth/components/SocialLoginButtons.tsx` — `registerIfNew` uses `/accounts/current` for validation
- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.6`
- `_bmad-output/planning-artifacts/architecture.md` — Auth boundary: "all routes except /onboarding require valid OAuth2 token"; `useAuthGuard.ts` listed in `features/auth/hooks/`
- `_bmad-output/planning-artifacts/architecture.md` — Single-file components acceptable for < 50 lines with no test needed

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 2

### Action Items

- [x] [Review][Patch] Network error (offline/timeout) clears valid token and routes to /login — distinguish 401/403 (truly expired) from network errors; only clear token and redirect on auth failure, not connectivity failure [`penny/src/features/auth/hooks/useAuthGuard.ts`]
- [x] [Review][Patch] No AbortController in useEffect — if component unmounts while GET /accounts/current is in-flight, setStatus fires on unmounted component [`penny/src/features/auth/hooks/useAuthGuard.ts`]
- [x] [Review][Patch] localStorage.getItem may throw in restricted environments (storage quota, private browsing policy) — wrap in try/catch, treat exception as unauthenticated [`penny/src/features/auth/hooks/useAuthGuard.ts`]

### Deferred

- [x] [Review][Defer] `[status]` dep array is semantically misleading — functionally correct due to `if (status !== 'loading') return` guard; cosmetic only

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][Patch] Fix network error clearing valid token — only treat 401/403 as expired; treat network/timeout errors as transient (keep token, redirect to /login only on auth failure) [`penny/src/features/auth/hooks/useAuthGuard.ts`]
- [x] [AI-Review][Patch] Add AbortController cleanup to useEffect [`penny/src/features/auth/hooks/useAuthGuard.ts`]
- [x] [AI-Review][Patch] Wrap localStorage.getItem in try/catch in getInitialStatus [`penny/src/features/auth/hooks/useAuthGuard.ts`]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `useAuthGuard`: initial `setState('unauthenticated')` inside `useEffect` triggered lint error `react-hooks/set-state-in-effect`. Fixed by initialising state lazily via `getInitialStatus()` — reads localStorage synchronously at mount, skips the effect entirely when no token present.

### Completion Notes List

- Created `penny/src/features/auth/hooks/useAuthGuard.ts` — lazy initial state from localStorage; validates token via `GET /accounts/current`; clears token and returns `expired` on any API failure
- Created `penny/src/features/auth/components/AuthGuard.tsx` — renders pig bounce loader during validation; redirects expired → `/login`, unauthenticated → `/onboarding`
- Modified `penny/src/App.tsx` — wrapped `/home`, `/stuff`, `/journey`, `/penny-says`, `/vibe` with `<AuthGuard>`; public routes unchanged
- Modified `penny/src/features/auth/index.ts` — added `AuthGuard` export
- AC 3 (Zustand restore) confirmed: all three stores use `persist` middleware — no code change needed
- `npm run build` passes (zero TS errors); `npm run lint` passes (zero errors, 1 pre-existing warning in unrelated file)
- ✅ Resolved review finding [Patch]: Network error now only clears token on 401/403; network/timeout errors redirect to /login without destroying the token
- ✅ Resolved review finding [Patch]: Added AbortController with cleanup function — prevents setStatus on unmounted component
- ✅ Resolved review finding [Patch]: Wrapped localStorage.getItem in try/catch — storage exceptions treated as unauthenticated

### File List

- `penny/src/features/auth/hooks/useAuthGuard.ts` — CREATED
- `penny/src/features/auth/components/AuthGuard.tsx` — CREATED
- `penny/src/App.tsx` — MODIFIED: AuthGuard wrapping on 5 protected routes
- `penny/src/features/auth/index.ts` — MODIFIED: added AuthGuard export
