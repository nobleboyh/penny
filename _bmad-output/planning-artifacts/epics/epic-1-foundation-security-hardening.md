# Epic 1: Foundation & Security Hardening

Get the backend production-ready and scaffold the new React PWA. After this epic, the development environment is fully operational with secure auth infrastructure and the Penny frontend skeleton running.

## Story 1.1: Secrets Migration & Environment Configuration

As a developer,
I want all hardcoded secrets replaced with environment variables,
So that the application is safe to deploy to production without exposing credentials.

**Acceptance Criteria:**

**Given** the existing PiggyMetrics config files contain hardcoded secrets
**When** the migration is complete
**Then** no secrets exist in any source-controlled file
**And** all services read secrets from environment variables or Docker secrets
**And** a `.env.example` file documents all required variables with placeholder values
**And** a `.env` file (gitignored) provides working local dev values
**And** all existing services start successfully with the new env-based config

## Story 1.2: Auth-Service Security Hardening

As a developer,
I want the auth-service to use a Redis-backed token store and BCrypt password encoder,
So that user sessions persist across restarts and credentials are securely stored.

**Acceptance Criteria:**

**Given** the auth-service currently uses an in-memory token store and NoOp password encoder
**When** the hardening is complete
**Then** the auth-service uses a Redis instance for OAuth2 token storage
**And** the Redis instance is defined in `docker-compose.yml` and `docker-compose.dev.yml`
**And** tokens survive an auth-service restart
**And** the password encoder is BCrypt (not NoOp)
**And** existing API contracts for `/oauth/token` and `/oauth/token_key` are preserved (NFR22)
**And** social login tokens (Google, Apple) are validated server-side before issuing internal tokens (NFR11)

## Story 1.3: React PWA Scaffold & Dev Environment

As a developer,
I want the Penny React PWA scaffolded and integrated into the Docker dev environment,
So that frontend development can begin against the real backend.

**Acceptance Criteria:**

**Given** no React frontend exists yet
**When** the scaffold is complete
**Then** `npm create vite@latest penny -- --template react-ts` has been run and committed
**And** TypeScript strict mode is enabled in `tsconfig.json`
**And** an Nginx container is added to `docker-compose.dev.yml` serving the Vite build
**And** Zuul gateway routes `/` to the Nginx container (not the old static frontend)
**And** `VITE_API_BASE_URL` environment variable points to the Zuul gateway
**And** the app loads at `http://localhost:80` with no console errors
**And** API calls from the frontend proxy correctly through Zuul to backend services

## Story 1.4: Design System & Core Dependencies Setup

As a developer,
I want Tailwind CSS, shadcn/ui, Framer Motion, Lottie, Dexie.js, Zustand, and TanStack Query installed and configured,
So that all frontend features can be built on a consistent foundation.

**Acceptance Criteria:**

**Given** the bare Vite scaffold from Story 1.3
**When** setup is complete
**Then** Tailwind CSS is configured with the Penny design tokens (all CSS custom properties from UX-DR2) in `src/styles/globals.css`
**And** Nunito font (UX-DR3) is loaded via Google Fonts
**And** shadcn/ui is initialized (`components.json`) with Penny theme tokens
**And** Framer Motion and `lottie-react` are installed
**And** Dexie.js schema is defined in `src/lib/db.ts` with tables: `transactions`, `pendingSync`, `failedSync`
**And** Zustand stores exist at `src/store/`: `goalStore.ts`, `pennyStore.ts`, `streakStore.ts` with typed state + actions interfaces
**And** TanStack Query `QueryClient` is configured in `src/lib/api.ts` with axios instance pointing to `VITE_API_BASE_URL`
**And** `QueryClientProvider` wraps the app in `src/main.tsx`
**And** dark mode is the default; CSS variables resolve correctly on `<html>` element

## Story 1.5: Service Worker & PWA Foundation

As a developer,
I want vite-plugin-pwa configured with Workbox, a PWA manifest, and offline fallback,
So that the app is installable and passes the Lighthouse PWA audit.

**Acceptance Criteria:**

**Given** the configured frontend from Story 1.4
**When** PWA setup is complete
**Then** `vite-plugin-pwa` is installed and configured in `vite.config.ts` with Workbox
**And** `public/manifest.json` is generated with correct name, icons (192px, 512px, maskable), theme color `#0F0F14`, and `display: standalone`
**And** PWA icons exist in `public/icons/`
**And** `penny-mascot.png` exists in `public/` for OG social link preview (FR41)
**And** Service Worker uses cache-first for static assets and network-first for API calls
**And** an offline fallback page is served when the network is unavailable
**And** the app passes Lighthouse installability audit on Chrome
**And** `src/hooks/useOfflineSync.ts` exists with `navigator.onLine` listener as the single source of truth for online state
