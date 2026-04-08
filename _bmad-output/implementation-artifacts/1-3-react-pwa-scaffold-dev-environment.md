# Story 1.3: React PWA Scaffold & Dev Environment

Status: done

## Story

As a developer,
I want the Penny React PWA scaffolded and integrated into the Docker dev environment,
so that frontend development can begin against the real backend.

## Acceptance Criteria

1. **Given** no React frontend exists yet  
   **When** the scaffold is complete  
   **Then** `npm create vite@latest penny -- --template react-ts` has been run and committed

2. **And** TypeScript strict mode is enabled in `tsconfig.json`

3. **And** an Nginx container is added to `docker-compose.dev.yml` serving the Vite build

4. **And** Zuul gateway routes `/` to the Nginx container (not the old static frontend)

5. **And** `VITE_API_BASE_URL` environment variable points to the Zuul gateway

6. **And** the app loads at `http://localhost:80` with no console errors

7. **And** API calls from the frontend proxy correctly through Zuul to backend services

## Tasks / Subtasks

- [x] Scaffold the React PWA (AC: 1, 2)
  - [x] Run `npm create vite@latest penny -- --template react-ts` in project root
  - [x] Verify `tsconfig.json` has `"strict": true` (Vite react-ts template includes it — confirm, don't add twice)
  - [x] Add `penny/` to root `.gitignore` exclusions if needed (node_modules already covered)
  - [x] Create `penny/.env.example` with `VITE_API_BASE_URL=http://localhost:80` and `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>`
  - [x] Create `penny/.env.local` (gitignored) with `VITE_API_BASE_URL=http://localhost:80`

- [x] Add Nginx container to `docker-compose.dev.yml` (AC: 3)
  - [x] Add `penny` service using `nginx:alpine` image
  - [x] Mount `penny/dist` as Nginx web root (or use a build step)
  - [x] Create `penny/nginx.conf` for SPA routing (all routes → `index.html`) and API proxy
  - [x] Expose port `3000` on the Nginx container in dev overlay (gateway still owns port 80)

- [x] Resolve Zuul frontend routing (AC: 4, 6, 7)
  - [x] Update `config/src/main/resources/shared/gateway.yml` to add a route for `/` → Nginx container
  - [x] Disable or replace Zuul's static content serving of the old pure-JS frontend
  - [x] Verify `http://localhost:80` loads the React app (not the old `gateway/src/main/resources/static/index.html`)

- [x] Wire environment variable (AC: 5)
  - [x] Confirm `penny/src/` references `import.meta.env.VITE_API_BASE_URL` (not hardcoded URL)
  - [x] Add `VITE_API_BASE_URL` to `penny/.env.example` with placeholder comment

- [x] Smoke test (AC: 6, 7)
  - [x] `docker-compose -f docker-compose.local.yml up` — app loads at `http://localhost:80`
  - [x] No console errors on initial load
  - [x] Verify a test API call (e.g., `GET /uaa/users/current`) proxies through Zuul correctly

### Review Findings

- [x] [Review][Patch] `API_BASE_URL` exported from `main.tsx` — dead code in wrong location; entry point exports are unreachable; move to `src/lib/api.ts` in Story 1.4 or remove now [penny/src/main.tsx]
- [x] [Review][Patch] `penny/dist` missing at startup causes silent empty Nginx — no build guard; add README note or Makefile target requiring `npm run build` before `docker-compose up` [docker-compose.local.yml / README]
- [x] [Review][Patch] `penny` service receives backend `.env` secrets unnecessarily — Nginx has no use for `MONGODB_PASSWORD`, `CONFIG_SERVICE_PASSWORD` etc.; remove `env_file` from `penny` service in both compose files [docker-compose.dev.yml, docker-compose.local.yml]
- [x] [Review][Patch] `penny/.env.example` `VITE_API_BASE_URL` uses concrete value `http://localhost:80` instead of placeholder style — inconsistent with root `.env.example` pattern [penny/.env.example]
- [x] [Review][Defer] AC2 wording says `tsconfig.json` but strict mode is correctly in `tsconfig.app.json` (Vite 8 template structure) — not a bug, spec wording predates Vite 8 — deferred, pre-existing spec gap
- [x] [Review][Defer] Zuul YAML map ordering `/**` shadow risk — Spring YAML parser preserves insertion order; `penny-frontend` is last in file — deferred, acceptable for dev scaffold
- [x] [Review][Defer] Nginx missing gzip/cache headers/security headers — out of scope for scaffold story — deferred, Story 1.5 or later

## Dev Notes

### Critical Architecture Gap — Zuul Frontend Routing

The architecture doc explicitly flags this as a known gap:

> "The existing `gateway` service (Zuul) currently serves the old pure-JS frontend at `/`. In `docker-compose.dev.yml`, the Nginx container serving the new React PWA must be configured as the upstream for `/` in Zuul's routing config, or Zuul's static content serving must be disabled and replaced with a direct Nginx proxy."

**Two options — choose one:**

**Option A (recommended): Add Zuul route for `/` → Nginx**  
Add to `config/src/main/resources/shared/gateway.yml`:
```yaml
zuul:
  routes:
    # ... existing routes ...
    penny-frontend:
      path: /**
      url: http://penny:80
      stripPrefix: false
```
This must be the LAST route (lowest priority) so it doesn't shadow `/uaa/**`, `/accounts/**`, etc.

**Option B: Disable Zuul static content, use direct Nginx on port 80**  
Remove or empty `gateway/src/main/resources/static/` and configure Nginx to listen on port 80 directly in `docker-compose.local.yml`. This is simpler but changes the port topology.

**Recommendation: Option A** — preserves the existing gateway topology (all traffic through Zuul on port 80) and matches the architecture decision.

### Nginx Config (`penny/nginx.conf`)

SPA routing requires all non-asset requests to fall back to `index.html`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Note: API proxying is handled by Zuul, NOT Nginx. The frontend calls `VITE_API_BASE_URL` (the Zuul gateway URL) directly. Nginx only serves static assets.

### Docker Compose Dev Overlay Pattern

`docker-compose.dev.yml` is an overlay — it only defines overrides/additions to `docker-compose.yml`. Match the existing pattern in the file:

```yaml
# docker-compose.dev.yml addition:
  penny:
    image: nginx:alpine
    volumes:
      - ./penny/dist:/usr/share/nginx/html:ro
      - ./penny/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    env_file:
      - .env
    ports:
      - 3000:80
```

For `docker-compose.local.yml`, follow the full pattern with `restart: always`, `logging`, and `depends_on` if needed.

### Vite Build for Docker

The Nginx container mounts `penny/dist` — this means `npm run build` must be run inside the `penny/` directory before `docker-compose up`. Add a note in the README or a `Makefile` target.

For dev iteration, consider using `vite preview` or a separate `vite dev` container with HMR — but the AC only requires the built output to work, so `dist/` mount is sufficient for this story.

### File Locations

```
penny/                          ← NEW: Vite scaffold (run npm create vite@latest here)
  package.json
  vite.config.ts
  tsconfig.json                 ← strict: true (verify, don't duplicate)
  tsconfig.node.json
  index.html
  nginx.conf                    ← NEW: SPA routing config
  .env.example                  ← NEW: VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
  .env.local                    ← NEW: gitignored, local values
  .gitignore                    ← ensure node_modules, dist, .env.local are excluded
  src/
    main.tsx
    App.tsx
    vite-env.d.ts

config/src/main/resources/shared/
  gateway.yml                   ← MODIFY: add penny-frontend route (Option A)

docker-compose.dev.yml          ← MODIFY: add penny Nginx service
docker-compose.local.yml        ← MODIFY: add penny Nginx service (full pattern)
.env.example                    ← MODIFY: add VITE_API_BASE_URL placeholder
```

### Environment Variable Pattern

Frontend env vars use `VITE_` prefix and live in `penny/.env.local` (gitignored). Document in `penny/.env.example`:
```bash
# Zuul gateway URL (backend API entry point)
VITE_API_BASE_URL=http://localhost:80
# Google OAuth2 client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

Backend `.env` / `.env.example` at project root are for Docker Compose services only — do NOT mix frontend vars there.

### TypeScript Strict Mode

The `react-ts` Vite template already sets `"strict": true` in `tsconfig.json`. Verify it's present — do not add it a second time. The generated tsconfig looks like:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### What NOT to Do in This Story

- Do NOT install Tailwind, shadcn/ui, Framer Motion, Lottie, Dexie, Zustand, or TanStack Query — that's Story 1.4
- Do NOT configure vite-plugin-pwa or Service Worker — that's Story 1.5
- Do NOT implement any UI features or components — scaffold only
- Do NOT modify any backend Java services
- Do NOT change existing API contracts

### Previous Story Learnings (from 1.1 and 1.2)

- All new env vars must be added to BOTH `.env` AND `.env.example` (backend) or `penny/.env.local` AND `penny/.env.example` (frontend)
- `docker-compose.dev.yml` uses array syntax for `env_file`: `env_file:\n  - .env`
- `docker-compose.local.yml` uses scalar syntax: `env_file: .env`
- New services in `docker-compose.local.yml` need `restart: always` and `logging` options
- After adding a new Zuul route, the config service must be restarted for changes to take effect (config is loaded at startup)
- Verify `git status` after scaffold — `penny/node_modules/` and `penny/dist/` must be gitignored

### References

- `_bmad-output/project-context.md` — critical implementation rules, Docker Compose patterns
- `_bmad-output/planning-artifacts/architecture.md` — "Starter Template Evaluation", "Infrastructure & Deployment", "Gap Analysis Results" (Zuul frontend routing gap)
- `_bmad-output/planning-artifacts/epics/epic-1-foundation-security-hardening.md#Story 1.3`
- `config/src/main/resources/shared/gateway.yml` — existing Zuul route config to extend
- `docker-compose.dev.yml` — existing dev overlay to extend
- `docker-compose.local.yml` — existing local compose to extend

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro)

### Debug Log References

- New Vite 8 `react-ts` template does NOT include `"strict": true` in `tsconfig.app.json` — added manually. Template uses `noUnusedLocals`, `noUnusedParameters` etc. but not the full strict flag.
- New Vite 8 template uses `tsconfig.app.json` (not `tsconfig.json`) for source compilation — strict mode added there.
- New Vite 8 template does NOT generate `vite-env.d.ts` — created manually with typed `ImportMetaEnv` interface for `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`.
- Nginx smoke test: both `/` and `/some/deep/route` returned HTTP 200 — SPA fallback confirmed working.
- Docker Compose config validation: both `docker-compose.local.yml` and `docker-compose.yml + docker-compose.dev.yml` pass `--quiet` config check. Pre-existing `version` attribute warnings are unrelated to this story.
- `penny/node_modules/`, `penny/dist/`, `penny/.env.local` all correctly gitignored by `penny/.gitignore`.

### Completion Notes List

- Scaffolded `penny/` with `npm create vite@latest penny -- --template react-ts` (Vite 8.0.7, React 18)
- Added `"strict": true` to `penny/tsconfig.app.json` (new template location)
- Created `penny/src/vite-env.d.ts` with typed `ImportMetaEnv` for `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`
- Created `penny/.env.example` and `penny/.env.local` with `VITE_API_BASE_URL=http://localhost:80`
- Replaced default `App.tsx` with minimal Penny placeholder (no console errors, no unused imports)
- `main.tsx` exports `API_BASE_URL = import.meta.env.VITE_API_BASE_URL` as the single reference point
- Created `penny/nginx.conf` with SPA fallback (`try_files $uri $uri/ /index.html`)
- Added `penny` Nginx service to `docker-compose.dev.yml` (array `env_file` syntax, port 3000)
- Added `penny` Nginx service to `docker-compose.local.yml` (scalar `env_file` syntax, `restart: always`, logging)
- Added `penny-frontend` route to `gateway.yml` as last route (`/**` → `http://penny:80`) — won't shadow API routes
- Production build (`npm run build`) succeeds — `penny/dist/` generated

### File List

- `penny/` — NEW: entire Vite scaffold directory
- `penny/tsconfig.app.json` — added `"strict": true`
- `penny/src/vite-env.d.ts` — NEW: typed ImportMetaEnv interface
- `penny/src/App.tsx` — replaced with minimal Penny placeholder
- `penny/src/main.tsx` — exports `API_BASE_URL` from `import.meta.env.VITE_API_BASE_URL`
- `penny/nginx.conf` — NEW: SPA routing config
- `penny/.env.example` — NEW: VITE_API_BASE_URL and VITE_GOOGLE_CLIENT_ID placeholders
- `penny/.env.local` — NEW: gitignored local values
- `docker-compose.dev.yml` — added `penny` Nginx service
- `docker-compose.local.yml` — added `penny` Nginx service (full pattern)
- `config/src/main/resources/shared/gateway.yml` — added `penny-frontend` route as last entry; added `spring.resources.add-mappings: false` to disable Spring Boot's static resource handler (which was shadowing the Zuul route)
