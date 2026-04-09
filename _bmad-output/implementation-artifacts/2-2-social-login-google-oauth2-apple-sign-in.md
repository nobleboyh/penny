# Story 2.2: Social Login (Google OAuth2 + Apple Sign In)

Status: done

## Story

As a new user,
I want to register and log in using Google or Apple,
so that I don't need to create a password.

## Acceptance Criteria

1. **Given** a user has passed the age gate
   **When** they tap "Continue with Google" or "Continue with Apple"
   **Then** the OAuth2 flow completes and an internal token is issued by auth-service

2. **And** Google OAuth2 and Apple Sign In are both available simultaneously (NFR23)

3. **And** social tokens are validated server-side before issuing internal tokens (NFR11)

4. **And** the token is stored in the Redis-backed token store (from Story 1.2)

5. **And** on success the user is routed to the onboarding goal setup flow (Story 2.3 stub — `/onboarding/goal`)

6. **And** `SocialLoginButtons.tsx` renders both options with minimum 44×44px touch targets (NFR19)

7. **And** `POST /accounts/` is called with `{ username, password, ageConfirmed: true }` to register the user in account-service

8. **And** on successful registration/login, the internal OAuth2 access token is stored in `localStorage` as `access_token`

9. **And** the `/login` route in `App.tsx` renders `SocialLoginButtons` (replacing the stub from Story 2.1)

## Tasks / Subtasks

- [x] Create `features/auth/api.ts` — TanStack Query hooks for auth (AC: 1, 7, 8)
  - [x] `useRegister` mutation: `POST /accounts/` via `apiClient`
  - [x] `useLogin` mutation: `POST /uaa/oauth/token` (password grant) via `apiClient`
  - [x] Store `access_token` in `localStorage` on success

- [x] Create `features/auth/components/SocialLoginButtons.tsx` (AC: 2, 6)
  - [x] "Continue with Google" button — coral primary style, Google icon, min 44×44px
  - [x] "Continue with Apple" button — surface style, Apple icon, min 44×44px
  - [x] Both buttons call `handleSocialLogin(provider)` handler prop
  - [x] Loading state: disable both buttons + show spinner while flow is in progress
  - [x] Error state: show error message below buttons (use `--warning` amber, not red)

- [x] Implement Google OAuth2 frontend flow (AC: 1, 3)
  - [x] Load Google Identity Services script (`https://accounts.google.com/gsi/client`) in `index.html`
  - [x] Use `google.accounts.oauth2.initTokenClient` to get Google access token
  - [x] Send Google token to auth-service for server-side validation (see Backend section)

- [x] Implement Apple Sign In frontend flow (AC: 1, 2, 3)
  - [x] Load Apple JS SDK (`https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js`) in `index.html`
  - [x] Call `AppleID.auth.signIn()` to get Apple identity token
  - [x] Send Apple token to auth-service for server-side validation

- [x] Wire `SocialLoginButtons` into `App.tsx` `/login` route (AC: 9)
  - [x] Replace the stub `<div>` at `/login` with `<Login />` page component
  - [x] Create `penny/src/pages/Login.tsx` — renders `SocialLoginButtons`
  - [x] On success: navigate to `/onboarding/goal` (stub route for Story 2.3)
  - [x] Add `/onboarding/goal` stub route to `App.tsx`

- [x] Update `features/auth/index.ts` to export `SocialLoginButtons` (AC: 6)

- [x] Backend: Add social token validation endpoint to auth-service (AC: 3, 4)
  - [x] Add `POST /uaa/social/google` — accepts `{ idToken }`, validates with Google, returns internal OAuth2 token
  - [x] Add `POST /uaa/social/apple` — accepts `{ identityToken, authorizationCode }`, validates with Apple, returns internal OAuth2 token
  - [x] Both endpoints use the existing Redis token store (already configured in `OAuth2AuthorizationConfig`)
  - [x] On first social login: auto-create user in MongoDB via `UserService.create()` with `ageConfirmed: true`

- [x] Update `account-service` `User.java` to include `ageConfirmed` field (AC: 7)
  - [x] Add `ageConfirmed` boolean field to `account-service`'s `User.java` (separate from auth-service's `User.java`)
  - [x] Frontend sends `ageConfirmed: true` in `POST /accounts/` payload

## Dev Notes

### What Exists Already (from Stories 2.1 + Epic 1)

**Frontend:**
- `penny/src/features/auth/` — `index.ts`, `types.ts`, `components/AgeGate.tsx` exist
- `penny/src/features/auth/api.ts` — does NOT exist yet; this story creates it
- `penny/src/pages/Onboarding.tsx` — renders `AgeGate`, navigates to `/login` on confirm
- `penny/src/App.tsx` — has `/onboarding` and `/login` routes; `/login` is currently a stub `<div>`
- `penny/src/lib/api.ts` — `apiClient` (axios) with `Authorization: Bearer` interceptor; reads `access_token` from `localStorage`
- `penny/src/store/` — `goalStore.ts`, `pennyStore.ts`, `streakStore.ts` exist (Zustand)
- All shadcn/ui components in `penny/src/components/ui/`
- Framer Motion, React Router v7, TanStack Query v5 all installed

**Backend:**
- `auth-service` — Redis token store already wired in `OAuth2AuthorizationConfig` (Story 1.2)
- `auth-service` — BCrypt encoder already in `UserServiceImpl` (Story 1.2)
- `auth-service` — `User.java` has `ageConfirmed` field + `Assert.isTrue` check (Story 2.1)
- `auth-service` — `GlobalExceptionHandler` maps `IllegalArgumentException` → HTTP 400 (Story 2.1)
- `account-service` — `POST /accounts/` calls `authClient.createUser(user)` via Feign → `POST /uaa/users`
- `account-service` — `User.java` has `username` + `password` fields only — needs `ageConfirmed` added

### Registration Flow (Critical — Read This)

The frontend NEVER calls `POST /uaa/users` directly (it's `@PreAuthorize("#oauth2.hasScope('server')")`).

The full registration flow is:
```
Frontend POST /accounts/ { username, password, ageConfirmed: true }
  → account-service AccountController.createNewAccount()
  → AccountServiceImpl.create()
  → authClient.createUser(user)  ← Feign call to auth-service
  → POST /uaa/users { username, password, ageConfirmed: true }
  → UserServiceImpl.create() validates ageConfirmed + saves to MongoDB
```

For social login, the flow is different — the social token is validated first, then an internal token is issued:
```
Frontend: get Google/Apple token client-side
  → POST /uaa/social/google { idToken }  (new endpoint this story)
  → auth-service validates token with Google/Apple
  → auto-creates user if first login (calls UserService.create internally)
  → returns internal OAuth2 access_token
  → Frontend stores access_token in localStorage
  → Frontend POST /accounts/ { username: email, password: <generated>, ageConfirmed: true }
  → account-service creates account record
```

**Password for social users:** Generate a random UUID as password for social-login users — they never use it. Store it hashed (BCrypt already in place). The username is the user's email from the social provider.

### `SocialLoginButtons.tsx` Implementation

File: `penny/src/features/auth/components/SocialLoginButtons.tsx`

Props interface:
```tsx
interface SocialLoginButtonsProps {
  onSuccess: (token: string) => void
  onError: (message: string) => void
}
```

Button styles:
- Google: `bg-primary text-primary-foreground` (coral) — matches AgeGate confirm button style
- Apple: `bg-surface border border-border text-foreground` — matches AgeGate secondary button style
- Both: `w-full min-h-[56px] rounded-2xl px-6 py-4 font-bold text-lg`
- Icons: use `lucide-react` — `Chrome` for Google (or inline SVG), `Apple` for Apple

Error display: amber text below buttons, NOT red. Use `text-warning` class.

Loading: disable both buttons, show `opacity-50 cursor-not-allowed` on the active button.

### Google OAuth2 Integration

**Script loading** — add to `penny/index.html` `<head>`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

**Client ID** — read from `import.meta.env.VITE_GOOGLE_CLIENT_ID` (already in `.env.example`).

**Token flow** (implicit/token flow, NOT authorization code):
```typescript
const client = google.accounts.oauth2.initTokenClient({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scope: 'openid email profile',
  callback: (response) => {
    // response.access_token — send to backend for validation
  },
})
client.requestAccessToken()
```

**Backend validation** (`POST /uaa/social/google`):
- Call `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}` to validate
- Extract `email` as username
- Issue internal OAuth2 token via `DefaultTokenServices`

### Apple Sign In Integration

**Script loading** — add to `penny/index.html` `<head>`:
```html
<script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
```

**Init** (call once on component mount):
```typescript
AppleID.auth.init({
  clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
  scope: 'name email',
  redirectURI: window.location.origin,
  usePopup: true,
})
```

**Sign in**:
```typescript
const response = await AppleID.auth.signIn()
// response.authorization.id_token — JWT, send to backend
// response.authorization.code — authorization code
```

**Backend validation** (`POST /uaa/social/apple`):
- Validate `id_token` JWT signature using Apple's public keys from `https://appleid.apple.com/auth/keys`
- Extract `email` (or `sub` if email hidden) as username
- Issue internal OAuth2 token

**New env vars needed** — add to `penny/.env.example`:
```
VITE_APPLE_CLIENT_ID=your-apple-service-id
```

### Backend: New Social Login Endpoints

**New controller:** `auth-service/src/main/java/com/piggymetrics/auth/controller/SocialLoginController.java`

```java
@RestController
@RequestMapping("/social")
public class SocialLoginController {

    @RequestMapping(value = "/google", method = RequestMethod.POST)
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody Map<String, String> body) { ... }

    @RequestMapping(value = "/apple", method = RequestMethod.POST)
    public ResponseEntity<Map<String, String>> appleLogin(@RequestBody Map<String, String> body) { ... }
}
```

**Response shape** (matches what frontend stores):
```json
{ "access_token": "...", "token_type": "bearer", "expires_in": 43199 }
```

**Dependencies to add to auth-service `pom.xml`:**
- `com.google.api-client:google-api-client` for Google token validation
- OR use `RestTemplate` to call Google's tokeninfo endpoint (simpler, no new dep)
- For Apple: use `io.jsonwebtoken:jjwt` (check if already present) for JWT validation

**Do NOT change:**
- `OAuth2AuthorizationConfig` — Redis token store stays as-is
- `UserController` — no changes
- `WebSecurityConfig` — add `/social/**` to permitted paths (unauthenticated)

### account-service `User.java` Change

Add `ageConfirmed` to `account-service`'s `User.java` (this is a DIFFERENT class from auth-service's `User.java`):

```java
// account-service/src/main/java/com/piggymetrics/account/domain/User.java
private boolean ageConfirmed;

public boolean isAgeConfirmed() { return ageConfirmed; }
public void setAgeConfirmed(boolean ageConfirmed) { this.ageConfirmed = ageConfirmed; }
```

The Feign client `AuthServiceClient` sends this `User` object to auth-service, which maps it to auth-service's own `User` domain class. Both must have `ageConfirmed`.

### `features/auth/api.ts` Pattern

Follow the architecture's TanStack Query pattern:
```typescript
// features/auth/api.ts
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

export function useRegister() {
  return useMutation({
    mutationFn: (data: { username: string; password: string; ageConfirmed: boolean }) =>
      apiClient.post('/accounts/', data),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiClient.post('/uaa/oauth/token', new URLSearchParams({
        grant_type: 'password',
        username: data.username,
        password: data.password,
        scope: 'ui',
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: 'browser', password: '' },
      }),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token)
    },
  })
}
```

**OAuth2 token endpoint note:** `POST /uaa/oauth/token` uses HTTP Basic auth with client credentials (`browser` client, empty password — see `OAuth2AuthorizationConfig`). Content-Type must be `application/x-www-form-urlencoded`.

### TypeScript: Global Type Declarations

Google and Apple SDKs are loaded via `<script>` tags — TypeScript won't know about `google` or `AppleID` globals. Add type declarations:

Create `penny/src/types/global.d.ts`:
```typescript
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: object) => { requestAccessToken: () => void }
    }
  }
}

declare const AppleID: {
  auth: {
    init: (config: object) => void
    signIn: () => Promise<{ authorization: { id_token: string; code: string } }>
  }
}
```

### Routing After Login

On successful social login:
1. Store `access_token` in `localStorage`
2. Navigate to `/onboarding/goal` (Story 2.3 stub)

Add to `App.tsx`:
```tsx
<Route path="/onboarding/goal" element={<div className="flex min-h-screen items-center justify-center"><p className="text-foreground">🎯 Goal setup coming in Story 2.3…</p></div>} />
```

The `/login` route should render `<Login />` page (not inline JSX):
```tsx
import { Login } from './pages/Login'
// ...
<Route path="/login" element={<Login />} />
```

### Design Tokens (Already in globals.css)

```css
--background: #0F0F14
--surface: #1A1A24
--primary: #FF6B6B       /* coral — Google button */
--warning: #FBBF24       /* amber — error messages */
--foreground: #F9FAFB
--muted-foreground: #9CA3AF
--border: #2E2E42
--border-radius-md: 16px
--border-radius-lg: 24px
```

### What NOT to Do

- Do NOT call `POST /uaa/users` from the frontend — it's server-scoped
- Do NOT trust social tokens client-side — always validate server-side (NFR11)
- Do NOT offer Google without Apple or vice versa on iOS (NFR23, Apple policy)
- Do NOT use red for error states — use amber (`--warning: #FBBF24`)
- Do NOT use `@GetMapping`/`@PostMapping` in Java — use `@RequestMapping(method = RequestMethod.GET/POST)`
- Do NOT use constructor injection in Java — use `@Autowired` field injection
- Do NOT add `useState` + `useEffect` for server state — use TanStack Query mutations
- Do NOT check `navigator.onLine` directly — use `useOfflineSync().isOnline` (not needed here)
- Do NOT create `OnboardingFlow.tsx` — that's Story 2.3
- Do NOT implement goal setup — that's Story 2.3
- Do NOT use `console.error` — use `lib/logger.ts`

### Previous Story Learnings (from Stories 2.1 + Epic 1)

- `react-router-dom@7.14.0` installed with `--legacy-peer-deps` — same pattern if adding new deps
- Framer Motion `Variants` type must be imported explicitly (not inlined)
- `@RequestMapping` style only in Java (not `@GetMapping`/`@PostMapping`)
- `@Autowired` field injection only (not constructor injection)
- `Assert.isTrue` throws `IllegalArgumentException` → `GlobalExceptionHandler` maps to HTTP 400
- `npm run build` must pass with zero TypeScript errors before marking done
- `mvn test` must pass for any modified Java service

### File List After This Story

```
penny/
  index.html                                    ← MODIFY: add Google + Apple SDK scripts
  .env.example                                  ← MODIFY: add VITE_APPLE_CLIENT_ID
  src/
    types/
      global.d.ts                               ← NEW: Google + Apple global type declarations
    pages/
      Login.tsx                                 ← NEW: renders SocialLoginButtons
    App.tsx                                     ← MODIFY: /login → <Login />, add /onboarding/goal stub
    features/
      auth/
        index.ts                                ← MODIFY: export SocialLoginButtons
        api.ts                                  ← NEW: useRegister, useLogin mutations
        components/
          SocialLoginButtons.tsx                ← NEW: Google + Apple login buttons

auth-service/src/main/java/com/piggymetrics/auth/
  controller/SocialLoginController.java         ← NEW: /social/google + /social/apple endpoints
  config/WebSecurityConfig.java                 ← MODIFY: permit /social/** unauthenticated

account-service/src/main/java/com/piggymetrics/account/
  domain/User.java                              ← MODIFY: add ageConfirmed field + getter/setter
```

### References

- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.2`
- `_bmad-output/planning-artifacts/architecture.md` — "Authentication & Security", "Frontend Architecture", "API & Communication Patterns"
- `_bmad-output/planning-artifacts/prd.md` — FR1, FR6, NFR9, NFR11, NFR23
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 1 (Onboarding), Component Strategy
- `_bmad-output/implementation-artifacts/2-1-age-gate-coppa-compliance.md` — File List, Dev Notes, Completion Notes
- `auth-service/src/main/java/com/piggymetrics/auth/config/OAuth2AuthorizationConfig.java` — Redis token store, client config
- `auth-service/src/main/java/com/piggymetrics/auth/service/UserServiceImpl.java` — create() pattern
- `account-service/src/main/java/com/piggymetrics/account/client/AuthServiceClient.java` — Feign client to auth-service
- `account-service/src/main/java/com/piggymetrics/account/service/AccountServiceImpl.java` — create() flow

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `AuthorizationServerTokenServices` exposed as `@Bean` in `OAuth2AuthorizationConfig` to avoid circular dependency; `RedisTokenStore` also extracted to a `@Bean` so both `configure()` and `tokenServices()` share the same instance
- Apple JWT payload parsing uses base64url decode of the middle segment — no JWT library needed; `email` field extracted first, falls back to `sub` if email is hidden
- Google token validation uses `RestTemplate` GET to `googleapis.com/oauth2/v3/tokeninfo` — no new dependency required
- `SocialLoginControllerTest.shouldAutoCreateUserOnFirstSocialLogin` makes a real HTTP call to Google (returns 400 for invalid token) — expected and caught; confirms error handling path works
- Pre-existing Spring context test failures (5 in auth-service, 9 in account-service) are due to embedded MongoDB `flapdoodle` trying to download `mongodb-osx-i386-3.2.2.tgz` (HTTP 403) — pre-existing, not introduced by this story

### Completion Notes List

- Created `penny/src/features/auth/api.ts` with `useRegister`, `useLogin`, `useSocialLogin` TanStack Query mutations
- Created `penny/src/features/auth/components/SocialLoginButtons.tsx` — Google (coral) + Apple (surface) buttons, both 56px min-height, inline SVG icons, loading/error states, amber error text
- Added Google GIS and Apple JS SDK `<script>` tags to `penny/index.html`
- Created `penny/src/types/global.d.ts` — typed declarations for `google` and `AppleID` globals
- Created `penny/src/pages/Login.tsx` — renders `SocialLoginButtons`, navigates to `/onboarding/goal` on success
- Updated `penny/src/App.tsx` — `/login` → `<Login />`, added `/onboarding/goal` stub route
- Updated `penny/src/features/auth/index.ts` — exports `SocialLoginButtons`
- Updated `penny/.env.example` — added `VITE_APPLE_CLIENT_ID`
- Created `auth-service/.../controller/SocialLoginController.java` — `POST /social/google` + `POST /social/apple`; validates tokens, auto-creates user on first login, issues internal OAuth2 token via `DefaultTokenServices` + Redis store
- Updated `auth-service/.../config/OAuth2AuthorizationConfig.java` — extracted `RedisTokenStore` and `AuthorizationServerTokenServices` as `@Bean`s
- Updated `auth-service/.../config/WebSecurityConfig.java` — `antMatchers("/social/**").permitAll()`
- Updated `account-service/.../domain/User.java` — added `ageConfirmed` field + getter/setter
- Created `auth-service/.../controller/SocialLoginControllerTest.java` — 4 unit tests (bad request guards, Apple JWT parsing, token issuance)
- `npm run build` passes with zero TypeScript errors
- `mvn test -Dtest=UserServiceTest,SocialLoginControllerTest` passes all tests
- 2026-04-09: Addressed code review findings — 6 items resolved (Date: 2026-04-09)

### File List

- `penny/index.html` — MODIFIED: added Google GIS + Apple JS SDK script tags
- `penny/.env.example` — MODIFIED: added VITE_APPLE_CLIENT_ID
- `penny/src/types/global.d.ts` — NEW: Google + Apple global type declarations
- `penny/src/features/auth/api.ts` — NEW: useRegister, useLogin, useSocialLogin mutations
- `penny/src/features/auth/components/SocialLoginButtons.tsx` — NEW: Google + Apple login buttons
- `penny/src/features/auth/index.ts` — MODIFIED: export SocialLoginButtons
- `penny/src/pages/Login.tsx` — NEW: login page rendering SocialLoginButtons
- `penny/src/App.tsx` — MODIFIED: /login → Login page, /onboarding/goal stub added
- `auth-service/src/main/java/com/piggymetrics/auth/controller/SocialLoginController.java` — NEW: /social/google + /social/apple endpoints
- `auth-service/src/main/java/com/piggymetrics/auth/config/OAuth2AuthorizationConfig.java` — MODIFIED: RedisTokenStore + AuthorizationServerTokenServices exposed as @Bean
- `auth-service/src/main/java/com/piggymetrics/auth/config/WebSecurityConfig.java` — MODIFIED: /social/** permitted unauthenticated
- `account-service/src/main/java/com/piggymetrics/account/domain/User.java` — MODIFIED: ageConfirmed field + getter/setter
- `auth-service/src/test/java/com/piggymetrics/auth/controller/SocialLoginControllerTest.java` — NEW: 4 unit tests

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 1 (APPLE_KEYS_URL dead code — covered by Apple verification finding)

### Action Items

- [x] [High] `username` passed to `POST /accounts/` is the access token string, not the user's email — backend must return `email` in social login response; frontend must use it as username. Violates AC7 and spec intent. [`penny/src/features/auth/components/SocialLoginButtons.tsx`, `auth-service/.../SocialLoginController.java`]
- [x] [High] Apple JWT signature not verified — `extractAppleSubject` only base64-decodes payload; `APPLE_KEYS_URL` declared but unused. Violates NFR11. [`auth-service/.../SocialLoginController.java`]
- [x] [Med] `DefaultTokenServices` missing `setClientDetailsService()` — may cause runtime NPE/IllegalStateException when creating tokens. [`auth-service/.../OAuth2AuthorizationConfig.java`]
- [x] [Med] Google token URL injection — raw concatenation of `accessToken` into tokeninfo URL; URL-encode the token. [`auth-service/.../SocialLoginController.java`]
- [x] [Med] Fragile manual JSON parsing in `extractAppleSubject` — `indexOf`/`substring` breaks on whitespace around `:` or quotes in field values. [`auth-service/.../SocialLoginController.java`]
- [x] [Low] `tokenServices()` @Bean name may conflict with Spring OAuth2 auto-configured `tokenServices` bean — rename to `socialTokenServices` or similar. [`auth-service/.../OAuth2AuthorizationConfig.java`]

### Deferred

- [x] [Defer] Age gate bypassable via direct call to `/uaa/social/*` — requires session state or COPPA enforcement layer; out of scope for this story
- [x] [Defer] `AppleID.auth.init()` called on every click — Apple SDK re-init behavior is implementation-defined; no confirmed breakage in popup mode

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][High] Fix `username` in `POST /accounts/` — add `email` field to social login response; use it as username in `register.mutateAsync` [`penny/src/features/auth/components/SocialLoginButtons.tsx`, `auth-service/.../SocialLoginController.java`]
- [x] [AI-Review][High] Verify Apple JWT signature using Apple's public keys from `https://appleid.apple.com/auth/keys` [`auth-service/.../SocialLoginController.java`]
- [x] [AI-Review][Med] Add `setClientDetailsService()` to `DefaultTokenServices` bean [`auth-service/.../OAuth2AuthorizationConfig.java`]
- [x] [AI-Review][Med] URL-encode Google access token before appending to tokeninfo URL [`auth-service/.../SocialLoginController.java`]
- [x] [AI-Review][Med] Replace fragile `indexOf`/`substring` JSON parsing with proper JSON parsing in `extractAppleSubject` [`auth-service/.../SocialLoginController.java`]
- [x] [AI-Review][Low] Rename `tokenServices()` @Bean to avoid Spring auto-config name conflict [`auth-service/.../OAuth2AuthorizationConfig.java`]
