---
project_name: 'piggymetrics'
user_name: 'Itobeo'
date: '2026-04-07'
sections_completed: ['technology_stack', 'backend_rules', 'frontend_rules', 'testing_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns AI agents must follow. Focus on unobvious details._

---

## Technology Stack & Versions

### Backend (existing — DO NOT change versions or break API contracts)
- Java 1.8, Spring Boot 2.0.3.RELEASE, Spring Cloud Finchley.RELEASE
- MongoDB (per-service), RabbitMQ 3, Docker + Docker Compose 2.1
- Netflix Zuul (gateway:80), Eureka (registry:8761), Hystrix, Ribbon, Feign
- Spring Security OAuth2 (in-memory token store — demo only, Redis migration required pre-launch)
- Maven 3.x, JUnit 4, Mockito

### Frontend (new — Penny PWA)
- React 18 + TypeScript (strict mode), Vite + vite-plugin-pwa (Workbox)
- Tailwind CSS + shadcn/ui (Radix UI), Framer Motion, Lottie (lottie-react)
- Zustand (client state), TanStack Query v5 (server state), Dexie.js (IndexedDB offline)
- React Router v6 (SPA), html2canvas (shareable cards)
- Vitest + React Testing Library, ESLint + Prettier

---

## Backend Implementation Rules (Java/Spring)

### Patterns to follow (match existing codebase exactly)
- Package structure: `com.piggymetrics.{service}.{controller|service|domain|client|repository}`
- Use `@RestController` + `@RequestMapping` — NOT `@GetMapping`/`@PostMapping`/`@PutMapping`
- Use `@Autowired` field injection — NOT constructor injection (matches existing style)
- Use `Assert.*` (Spring) for precondition validation in service layer — NOT manual if/throw
- Logger: `private final Logger log = LoggerFactory.getLogger(getClass())` — NOT Lombok `@Slf4j`
- Always implement Interface + Impl pattern: `AccountService` interface + `AccountServiceImpl` class
- Use `@Valid @RequestBody` on all POST/PUT controller parameters
- Inject `Principal principal` directly in controller methods for current user identity

### Feign clients
- Always declare fallback: `@FeignClient(name = "service-name", fallback = ServiceClientFallback.class)`
- Fallback class must implement the same interface and log the error silently
- Use `MediaType.APPLICATION_JSON_UTF8_VALUE` for consumes (matches existing clients)

### OAuth2 scope enforcement
- Service-to-service endpoints: `@PreAuthorize("#oauth2.hasScope('server')")`
- Demo account exception: `@PreAuthorize("#oauth2.hasScope('server') or #name.equals('demo')")`
- User-facing endpoints: no `@PreAuthorize` — rely on resource server token validation
- Never expose server-scoped endpoints to the UI scope

### API contracts (NEVER change these)
- `GET /accounts/{name}`, `GET /accounts/current`, `PUT /accounts/current`, `POST /accounts/`
- `GET /statistics/current`, `GET /statistics/{name}`, `PUT /statistics/{name}`
- `GET /notifications/settings/current`, `PUT /notifications/settings/current`
- `POST /uaa/oauth/token`, `GET /uaa/users/current`, `POST /uaa/users`

---

## Frontend Implementation Rules (React/TypeScript)

### TypeScript
- `"strict": true` in tsconfig — no exceptions
- Never use `any` — use `unknown` + type guard for genuinely unknown types
- All component props typed with explicit named interface (not inline type)
- All API response shapes typed in `features/[feature]/types.ts`

### Component rules
- PascalCase filenames matching component name: `PennyAvatar.tsx`
- Non-component files: camelCase: `moodEngine.ts`, `goalStore.ts`
- Components > 50 lines or with tests: use folder structure `ComponentName/index.ts + ComponentName.tsx + ComponentName.test.tsx`
- Semantic HTML always: `<button>` not `<div onClick>`, `<nav>`, `<main>`, `<progress>`
- Every icon-only interactive element MUST have `aria-label`

### Feature module boundaries
- Features expose ONLY what's in their `index.ts` — never import from a feature's internals
- Cross-feature imports: `import { X } from '../otherFeature'` — NEVER `'../otherFeature/components/X'`
- Pages (`src/pages/`) compose features — no business logic in pages

### State management
- Server state: TanStack Query only — NEVER `useState` + `useEffect` for API calls
- Client/UI state: Zustand stores in `src/store/` — persisted to localStorage via persist middleware
- Offline queue: Dexie.js in `src/lib/db.ts` — only `useOfflineSync` and `useTransactionLog` write to it
- Zustand selectors: always use selector function — `useGoalStore(s => s.goal)` not `useGoalStore()`
- Object selects: wrap with `useShallow` to prevent unnecessary re-renders

### Penny mood engine (critical)
- Mood ALWAYS derived via `moodEngine(state)` in `features/penny/moodEngine.ts` — NEVER set directly
- `moodEngine` is a pure function — no side effects, no async, no store access
- Call after: transaction logged, app open, streak update
- Result stored in `pennyStore.currentMood` — components read from store only

### Offline-first (critical)
- Write to Dexie `pendingSync` table BEFORE attempting API mutation — always
- Components NEVER check `navigator.onLine` directly — use `useOfflineSync().isOnline`
- Offline indicator: amber dot on `StreakBadge` only — no error banners, no blocking UI
- Failed mutations after 3 retries → move to `failedSync` table

### TanStack Query patterns
- Query keys: array format `['resource', identifier?]` — e.g. `['accounts', 'current']`
- Optimistic updates: `onMutate` → update cache → `onError` → rollback
- Error boundaries: per-feature, not global
- Never show raw API errors to users — map through `lib/errors.ts`

### Animations
- ALL animations wrapped in `useReducedMotion()` check — instant state change if true
- Framer Motion for spring animations (Penny reactions, progress bars, celebrations)
- Lottie for Penny mascot mood state animations
- `html2canvas` for shareable cards: use inline styles only — CSS custom properties not supported

### Accessibility (enforced in CI)
- `PennyResponseBubble`: always `role="status"` + `aria-live="polite"`
- `GoalProgressCard` progress bar: always `role="progressbar"` + `aria-valuenow/min/max`
- All animations: respect `prefers-reduced-motion`
- Touch targets: minimum 44×44px
- Zero `axe-core` violations — enforced in CI on every PR

---

## Testing Rules

### Backend (Java)
- JUnit 4 (`@Test`, `@Before`, `@After`, `@RunWith`)
- `@SpringBootTest` for integration, `@WebMvcTest` for controllers, `@DataMongoTest` for repositories
- `@MockBean` for Spring context mocks, Mockito for unit test mocks
- Test files mirror source structure: `src/test/java/com/piggymetrics/{service}/...`

### Frontend (React)
- Vitest + React Testing Library — no Jest
- Test files co-located: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Test hooks with `renderHook` from RTL
- Mock Dexie and TanStack Query in unit tests — do not test their internals
- `moodEngine.ts` must have unit tests (pure function — easy to test exhaustively)
- `lib/nlp.ts` must have unit tests covering all category keyword mappings

---

## Development Workflow Rules

### Environment
- Backend secrets: `.env` file (gitignored) + Docker Compose `env_file` — NEVER hardcode
- Frontend env vars: `VITE_` prefix, defined in `.env.local` (gitignored), documented in `.env.example`
- Required vars: `VITE_API_BASE_URL` (Zuul gateway URL), `VITE_GOOGLE_CLIENT_ID`

### Docker
- Dev: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
- Frontend served via Nginx container in `docker-compose.dev.yml` — proxies `/api` to Zuul
- Zuul gateway must be updated to NOT serve old pure-JS frontend at `/` — route to Nginx instead
- Production: CDN (Vercel/Cloudflare Pages) for frontend, Docker Compose for backend

### CI (GitHub Actions)
- On PR: `vitest`, `axe-core` audit, Lighthouse CI (PWA ≥ 90, Performance ≥ 80)
- On merge to main: build + CDN deploy (frontend), Docker image build (backend)

---

## Critical Don't-Miss Rules

### Never do these (anti-patterns)
- `import { X } from '../otherFeature/components/X'` → use `'../otherFeature'` (index only)
- `pennyStore.setState({ currentMood: 'happy' })` → use `moodEngine()` instead
- `if (!navigator.onLine)` in components → use `useOfflineSync().isOnline`
- `catch (e) { console.error(e) }` → use `lib/logger.ts`
- `const [loading, setLoading] = useState(false)` for server state → use TanStack Query
- `@GetMapping` / `@PostMapping` in Java → use `@RequestMapping(method = RequestMethod.GET)`
- Constructor injection in Java → use `@Autowired` field injection
- Calling statistics-service directly from frontend → always go through Zuul gateway

### Security gates (pre-launch blockers)
- Auth-service token store MUST be Redis-backed before production (currently in-memory)
- Auth-service password encoder MUST be BCrypt before production (currently NoOp)
- All secrets MUST be in environment variables before production (currently hardcoded in config)
- COPPA age gate (16+) MUST be enforced in both frontend and auth-service registration endpoint
- Google OAuth2 AND Apple Sign In MUST ship simultaneously (Apple policy)

### Penny UX rules (non-negotiable)
- Transaction logging end-to-end MUST complete in ≤ 5 seconds
- Goal progress bar MUST update optimistically (before API confirms)
- Penny mood MUST update after every transaction log, app open, and streak change
- Celebration animations MUST be unskippable for 2 seconds
- Never use red color for negative financial states — use amber (#FBBF24)
- Never use adult finance jargon: "budget", "expense", "income", "net worth" are UX bugs

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — no exceptions
- When in doubt, prefer the more restrictive option
- Backend patterns must match existing codebase exactly — consistency over preference

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes or new patterns emerge
- Remove rules that become obvious over time

_Last Updated: 2026-04-07_
