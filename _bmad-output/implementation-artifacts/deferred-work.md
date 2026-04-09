# Deferred Work

## Deferred from: code review of 1-1-secrets-migration-environment-configuration (2026-04-07)

- `.env` contains `dev-password` as SMTP placeholder value — weak but acceptable for local dev. All other passwords in `.env` also use `password` as placeholder. Consider documenting in `.env.example` that production values must be strong. Pre-existing pattern, not introduced by this story.

## Deferred from: code review of 1-2-auth-service-security-hardening (2026-04-08)

- Redis has no password config — `spring.redis.password` absent in `auth-service.yml`. Acceptable for local dev but a production hardening gap. Should be addressed before production deployment.
- Port 6379 conflict risk — `docker-compose.dev.yml` exposes `6379:6379` with no warning. If a local Redis is already running, startup will fail with a port bind error.

## Deferred from: code review of 1-3-react-pwa-scaffold-dev-environment (2026-04-08)

- AC2 wording says `tsconfig.json` but strict mode is correctly in `tsconfig.app.json` (Vite 8 template structure) — spec wording predates Vite 8, not a bug
- Zuul YAML map ordering `/**` shadow risk — Spring YAML parser preserves insertion order; `penny-frontend` is last in file; acceptable for dev scaffold
- Nginx missing gzip/cache headers/security headers — out of scope for scaffold story; address in Story 1.5 or a dedicated infra story

## Deferred from: code review of 1-4-design-system-core-dependencies-setup (2026-04-08)

- `access_token` localStorage key is a magic string in `api.ts` — centralize in a constants file in a later story
- `MoodState` type is defined in `pennyStore.ts` but architecture specifies it belongs in `features/penny/types.ts` — move when `features/penny/` is scaffolded
- `updateSavedAmount` in `goalStore.ts` allows negative `savedAmount` — clamp at display layer in `GoalProgressCard` story
- Dexie schema version 1 has no migration path documented — add migration strategy when fields are added in future stories
- `saverLevel` in `streakStore.ts` has no max cap — enforce max when Saver Level progression system is implemented

## Deferred from: code review of 1-5-service-worker-pwa-foundation (2026-04-08)

- `offline.html` missing retry/reload button — UX improvement, not a PWA requirement; add in a later polish story
- `penny-mascot.png` is a blank dark rectangle — placeholder acceptable per spec; replace with real design asset before launch
- `networkTimeoutSeconds: 10` is long for mobile — tune after real-world performance testing

## Deferred from: code review of 2-1-age-gate-coppa-compliance (2026-04-09)

- `animate="visible"` fires even when `prefersReduced=true` in `AgeGate.tsx` — harmless in production, may flash in StrictMode dev. Pre-existing Framer Motion behavior.
- `react-router-dom@7.14.0` installed vs "React Router v6" in architecture spec — API used is compatible with both; no functional breakage.

## Deferred from: code review of 2-2-social-login-google-oauth2-apple-sign-in (2026-04-09)

- Age gate bypassable via direct call to `/uaa/social/*` — requires session state or COPPA enforcement layer; out of scope for story 2.2; revisit before production launch
- `AppleID.auth.init()` called on every click in `SocialLoginButtons.tsx` — Apple SDK re-init behavior in popup mode is implementation-defined; monitor for issues in integration testing

## Deferred from: code review of 2-4-just-saving-onboarding-path (2026-04-09)

- `PennyAvatar mood` hardcoded to `happy` in `Home.tsx` regardless of store state — deferred, mood engine is Story 4.1
