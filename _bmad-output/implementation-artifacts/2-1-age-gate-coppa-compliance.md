# Story 2.1: Age Gate (COPPA Compliance)

Status: done

## Story

As a new user,
I want to confirm my age before registering,
so that the app complies with COPPA 2025 (16+ default path).

## Acceptance Criteria

1. **Given** a user visits the Penny PWA for the first time
   **When** they reach the registration screen
   **Then** an age confirmation step is shown before any account creation

2. **And** users who indicate they are under 16 are shown a friendly message and cannot proceed

3. **And** users who confirm 16+ can proceed to social login (Story 2.2)

4. **And** the age gate is enforced server-side in the auth-service registration endpoint (`POST /uaa/users`)

5. **And** the `AgeGate.tsx` component is in `features/auth/components/`

## Tasks / Subtasks

- [x] Create `features/auth/` module structure (AC: 5)
  - [x] `penny/src/features/auth/index.ts` — public API re-export
  - [x] `penny/src/features/auth/types.ts` — `AgeGateStatus` type
  - [x] `penny/src/features/auth/components/AgeGate.tsx` — age gate component

- [x] Implement `AgeGate.tsx` frontend component (AC: 1, 2, 3)
  - [x] Show two options: "I'm 16 or older" and "I'm under 16"
  - [x] On "under 16": show friendly block message, no proceed CTA
  - [x] On "16+": call `onConfirmed()` prop to advance to social login
  - [x] Minimum 44×44px touch targets on both buttons
  - [x] Wrap any animation in `useReducedMotion()` check

- [x] Wire `AgeGate` into `App.tsx` onboarding route (AC: 1)
  - [x] Add `/onboarding` route to `App.tsx` (unauthenticated)
  - [x] `AgeGate` is the first screen on the onboarding route
  - [x] On confirmation, advance to social login screen (stub/placeholder for Story 2.2)

- [x] Server-side age gate enforcement in auth-service (AC: 4)
  - [x] Add `ageConfirmed` boolean field to `User` domain class
  - [x] Add `AgeGateValidator` — reject `createUser` if `ageConfirmed` is false or absent
  - [x] `UserController.createUser` returns HTTP 400 with message `"Age confirmation required"` if not confirmed
  - [x] `UserServiceImpl.create` uses `Assert.isTrue(user.isAgeConfirmed(), "Age confirmation required")`

## Dev Notes

### What Exists Already (from Epic 1)

- `penny/src/main.tsx` — has `QueryClientProvider` wrapping `App`; no Router yet
- `penny/src/App.tsx` — minimal placeholder (`<p>🐷 Penny</p>`), no routes
- `penny/src/lib/api.ts` — `apiClient` (axios) + `queryClient` (TanStack Query) configured
- `penny/src/store/goalStore.ts`, `pennyStore.ts`, `streakStore.ts` — Zustand stores exist
- `penny/src/hooks/useOfflineSync.ts` — online state hook exists
- `penny/src/components/ui/` — `button.tsx`, `badge.tsx`, `progress.tsx`, `sheet.tsx`, `slider.tsx` from shadcn/ui
- `penny/src/styles/globals.css` — all Penny design tokens (CSS custom properties) defined
- No `features/` directory exists yet — this story creates the first feature module

### React Router Setup (Required for This Story)

React Router v6 is in the architecture but not yet installed. This story requires it for the `/onboarding` route.

Install: `npm install react-router-dom`

Wire into `main.tsx`:
```tsx
import { BrowserRouter } from 'react-router-dom'
// wrap <App /> with <BrowserRouter>
```

`App.tsx` route structure (minimal for this story):
```tsx
import { Routes, Route } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<div>🐷 Penny</div>} />
    </Routes>
  )
}
```

Create `penny/src/pages/Onboarding.tsx` — renders `<AgeGate />` for now (Story 2.2 will extend it).

### `AgeGate.tsx` Implementation Pattern

File location: `penny/src/features/auth/components/AgeGate.tsx`

Props interface:
```tsx
interface AgeGateProps {
  onConfirmed: () => void  // called when user selects 16+
}
```

Key UX rules from spec:
- Two clear options — NOT a date-of-birth form (too much friction for onboarding)
- Under-16 block message must be friendly, not shaming: e.g., "Penny is for savers 16 and up 🐷 Come back when you're ready!"
- No red color for the block state — use `--muted-foreground` or `--warning` (#FBBF24 amber)
- Both buttons minimum 44×44px touch target (UX-DR19 / Apple HIG)
- Penny mascot or emoji (🐷) should be visible on this screen — it's the first impression
- Dark background (`--background: #0F0F14`), Nunito font — already set globally via `globals.css`

Accessibility:
- `<button>` elements (not `<div onClick>`)
- `aria-label` on icon-only elements if any
- Respect `prefers-reduced-motion` for any entrance animation

### Feature Module Structure

```
penny/src/features/auth/
  index.ts              ← export { AgeGate } from './components/AgeGate'
  types.ts              ← export type AgeGateStatus = 'pending' | 'confirmed' | 'blocked'
  components/
    AgeGate.tsx         ← this story
    SocialLoginButtons.tsx  ← Story 2.2 (do NOT create in this story)
    OnboardingFlow.tsx      ← Story 2.3+ (do NOT create in this story)
```

Only create `AgeGate.tsx`, `index.ts`, and `types.ts`. Do NOT scaffold future story files.

### Backend: auth-service Changes

**Package:** `com.piggymetrics.auth`

**`User.java` — add field:**
```java
private boolean ageConfirmed;

public boolean isAgeConfirmed() { return ageConfirmed; }
public void setAgeConfirmed(boolean ageConfirmed) { this.ageConfirmed = ageConfirmed; }
```

**`UserServiceImpl.java` — add validation in `create()`:**
```java
Assert.isTrue(user.isAgeConfirmed(), "Age confirmation required");
```
Place this BEFORE the duplicate-user check. Use `Assert.isTrue` (Spring) — matches existing codebase pattern.

**`UserController.java` — no change needed.** The `@Valid @RequestBody` + `Assert` in service layer handles the 400 response. Spring's `DefaultHandlerExceptionResolver` returns 400 for `IllegalArgumentException` from `Assert`.

**Existing `POST /uaa/users` endpoint** is `@PreAuthorize("#oauth2.hasScope('server')")` — this is service-to-service only. The frontend does NOT call this directly; it goes through account-service which calls auth-service. This server-side gate prevents any service from creating a user without age confirmation in the payload.

**Do NOT change:**
- `UserController` method signatures
- `@RequestMapping` annotations (use existing style)
- Package structure
- Any other Java files

### API Contract Note

`POST /uaa/users` is a server-scoped endpoint — the frontend never calls it directly. The age gate enforcement is:
1. **Frontend:** `AgeGate.tsx` blocks UI progression if user selects under-16
2. **Backend:** `UserServiceImpl.create()` rejects if `ageConfirmed != true`

The frontend sends `ageConfirmed: true` as part of the registration payload when the user proceeds through the age gate. This payload flows: frontend → account-service `POST /accounts/` → account-service calls auth-service `POST /uaa/users` with `ageConfirmed: true`.

For this story, the frontend only needs to implement the `AgeGate.tsx` component and the backend validation. The full registration flow (account-service call) is Story 2.2.

### Design Tokens (Already in globals.css)

```css
--background: #0F0F14
--surface: #1A1A24
--primary: #FF6B6B       /* coral — use for 16+ confirm button */
--warning: #FBBF24       /* amber — use for under-16 block state */
--foreground: #F9FAFB
--muted-foreground: #9CA3AF
--border-radius-md: 16px
--border-radius-lg: 24px
```

Use Tailwind utility classes that map to these tokens (configured in `tailwind.config.ts`).

### What NOT to Do

- Do NOT build a date-of-birth picker — binary choice only (16+ / under 16)
- Do NOT create `SocialLoginButtons.tsx` or `OnboardingFlow.tsx` — those are Story 2.2+
- Do NOT add React Router to `package.json` without installing it first (`npm install react-router-dom`)
- Do NOT call `POST /uaa/users` from the frontend — it's server-scoped
- Do NOT use `@GetMapping`/`@PostMapping` in Java — use `@RequestMapping(method = RequestMethod.GET/POST)`
- Do NOT use constructor injection in Java — use `@Autowired` field injection
- Do NOT use red color for the under-16 block state — use amber (#FBBF24)
- Do NOT add `useState` + `useEffect` for any server state — use TanStack Query (not needed in this story)
- Do NOT check `navigator.onLine` directly — use `useOfflineSync().isOnline` (not needed in this story)

### Previous Story Learnings (from Epic 1)

- `vite-plugin-pwa@1.2.0` installed with `--legacy-peer-deps` (Vite 8 peer dep mismatch) — document in README if adding new deps with same issue
- `@types/node` already installed — `path` import works in config files
- `tsconfig.app.json` has `"ignoreDeprecations": "6.0"` — no change needed
- `penny/src/lib/db.ts` exports `db` instance — Dexie schema already defined
- Tailwind v4 is installed (`@tailwindcss/vite` plugin) — use `@import "tailwindcss"` not `@tailwind base/components/utilities`
- shadcn/ui components are in `src/components/ui/` — import from there
- `npm run build` must pass with zero TypeScript errors before marking done

### File List After This Story

```
penny/
  package.json                          ← MODIFY: add react-router-dom
  src/
    main.tsx                            ← MODIFY: add BrowserRouter
    App.tsx                             ← MODIFY: add Routes + /onboarding route
    pages/
      Onboarding.tsx                    ← NEW: renders AgeGate
    features/
      auth/
        index.ts                        ← NEW: public API
        types.ts                        ← NEW: AgeGateStatus type
        components/
          AgeGate.tsx                   ← NEW: age gate component

auth-service/src/main/java/com/piggymetrics/auth/
  domain/User.java                      ← MODIFY: add ageConfirmed field
  service/UserServiceImpl.java          ← MODIFY: add Assert.isTrue check
```

### References

- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.1`
- `_bmad-output/planning-artifacts/architecture.md` — "Authentication & Security" (COPPA 2025 section), "Frontend Architecture" (feature module structure), "Project Structure & Boundaries"
- `_bmad-output/project-context.md` — Frontend Implementation Rules, Backend Implementation Rules, Critical Don't-Miss Rules
- `_bmad-output/planning-artifacts/prd.md` — COPPA 2025 decision (16+ default path, line ~239)
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 1 (Onboarding flow), Component Strategy, Design System Foundation
- `_bmad-output/implementation-artifacts/1-5-service-worker-pwa-foundation.md` — File List (what exists in penny/)
- `_bmad-output/implementation-artifacts/1-4-design-system-core-dependencies-setup.md` — design tokens, shadcn/ui setup

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `react-router-dom` install required `--legacy-peer-deps` (same Vite 8 peer dep pattern as vite-plugin-pwa in Story 1.5)
- Framer Motion `Variants` type must be imported explicitly — inline conditional object `{}` is not assignable to `Variants | undefined` in strict mode; fixed by hoisting to a typed const

### Completion Notes List

- Installed `react-router-dom` with `--legacy-peer-deps`
- Created `features/auth/` module: `index.ts`, `types.ts`, `components/AgeGate.tsx`
- `AgeGate.tsx`: binary choice (16+ / under 16), amber block state, 44px touch targets, `useReducedMotion()` guard on entrance animation, `<button>` elements with semantic HTML
- Created `pages/Onboarding.tsx` rendering `AgeGate`; `onConfirmed` navigates to `/login` (stub for Story 2.2)
- Updated `App.tsx`: `Routes` with `/onboarding` route; catch-all redirects to `/onboarding`
- Updated `main.tsx`: wrapped app in `<BrowserRouter>`
- Backend: added `ageConfirmed` field + getter/setter to `User.java`
- Backend: added `Assert.isTrue(user.isAgeConfirmed(), "Age confirmation required")` before duplicate-user check in `UserServiceImpl.create()`
- Updated `UserServiceTest`: existing tests set `ageConfirmed=true`; new `shouldFailWhenAgeNotConfirmed` test added
- `npm run build` passes with zero TypeScript errors
- `mvn test -Dtest=UserServiceTest` passes all 3 tests

### File List

- `penny/package.json` — MODIFIED: added react-router-dom
- `penny/package-lock.json` — MODIFIED: updated lockfile
- `penny/src/main.tsx` — MODIFIED: added BrowserRouter
- `penny/src/App.tsx` — MODIFIED: added Routes + /onboarding route + catch-all redirect
- `penny/src/pages/Onboarding.tsx` — NEW: renders AgeGate
- `penny/src/features/auth/index.ts` — NEW: public API
- `penny/src/features/auth/types.ts` — NEW: AgeGateStatus type
- `penny/src/features/auth/components/AgeGate.tsx` — NEW: age gate component
- `auth-service/src/main/java/com/piggymetrics/auth/domain/User.java` — MODIFIED: added ageConfirmed field + getter/setter
- `auth-service/src/main/java/com/piggymetrics/auth/service/UserServiceImpl.java` — MODIFIED: added Assert.isTrue age check
- `penny/src/App.tsx` — MODIFIED: added /login stub route (Story 2.2 placeholder)
- `auth-service/src/main/java/com/piggymetrics/auth/controller/GlobalExceptionHandler.java` — NEW: maps IllegalArgumentException → HTTP 400

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 2

### Action Items

- [x] [High] `/login` route missing — `onConfirmed` navigates to `/login` which has no route; catch-all redirects back to `/onboarding`, trapping confirmed users in a loop. Violates AC3. [`penny/src/pages/Onboarding.tsx`, `penny/src/App.tsx`]
- [x] [High] `Assert.isTrue` throws `IllegalArgumentException` → HTTP 500 in default Spring MVC, not HTTP 400 as AC4 requires. Fix: add `@ControllerAdvice` mapping `IllegalArgumentException` → 400, or replace with a `@ResponseStatus(BAD_REQUEST)` custom exception. [`auth-service/.../UserServiceImpl.java`]

### Deferred

- [x] [Defer] `animate="visible"` fires even when `prefersReduced=true` — `initial={false}` suppresses entrance but animate prop still runs; harmless in production, may flash in StrictMode dev. Pre-existing Framer Motion behavior. [`penny/src/features/auth/components/AgeGate.tsx`]
- [x] [Defer] `react-router-dom@7.14.0` installed vs "React Router v6" in architecture spec — API used (`Routes`, `Route`, `Navigate`, `useNavigate`) is compatible with both; no functional breakage. Version upgrade is intentional.

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][High] Fix `/login` missing route — replace `navigate('/login')` with a stub route or navigate to a placeholder that exists [`penny/src/pages/Onboarding.tsx`, `penny/src/App.tsx`]
- [x] [AI-Review][High] Fix HTTP 500 → 400 for age gate rejection — add `@ControllerAdvice` or custom exception [`auth-service/src/main/java/com/piggymetrics/auth/`]

- 2026-04-09: Addressed code review findings — 2 items resolved (Date: 2026-04-09)
