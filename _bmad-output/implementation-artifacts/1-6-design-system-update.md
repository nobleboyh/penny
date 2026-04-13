# Story 1.6: Design System Update

Status: done

## Story

As a developer,
I want the Penny design system updated to the new v2 visual language (Plus Jakarta Sans, Be Vietnam Pro, Material Symbols, new Material Design color palette, light-mode default, Lottie removed),
so that all subsequent UI stories can be built on the correct foundation matching the penny-ui designs.

## Acceptance Criteria

1. **Given** the existing dark-mode design system from Story 1.4  
   **When** the update is complete  
   **Then** `src/styles/globals.css` contains the full v2 Material Design color token palette (primary `#6a37d4`, secondary `#006859`, tertiary `#f4db36`, surface `#f5f6f7`, etc.) as Tailwind `@theme` CSS variables

2. **And** `index.html` loads **Plus Jakarta Sans** (weights 400, 600, 700, 800) and **Be Vietnam Pro** (weights 400, 500, 700, 900) from Google Fonts — Nunito is removed

3. **And** `index.html` loads **Material Symbols Outlined** from Google Fonts CDN

4. **And** `tailwind.config.ts` defines `fontFamily` with `headline: ['Plus Jakarta Sans']`, `body: ['Be Vietnam Pro']`, `label: ['Plus Jakarta Sans']`

5. **And** `tailwind.config.ts` defines `borderRadius` with `DEFAULT: '1rem'`, `lg: '2rem'`, `xl: '3rem'`, `full: '9999px'`

6. **And** `src/styles/globals.css` defines `.material-symbols-outlined` CSS rule with `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20` and `.active-nav-fill .material-symbols-outlined` with `'FILL' 1`

7. **And** `index.html` has `class="light"` on `<html>` (not `class="dark"`) — light mode is the default

8. **And** `src/styles/globals.css` `html` rule sets `background-color: #f5f6f7` and `color: #2c2f30` and `font-family: 'Be Vietnam Pro', sans-serif`

9. **And** `lottie-react` is removed from `package.json` dependencies

10. **And** `penny/public/penny_icon/` directory contains the 8 Pocket Pixel PNG skins copied from `./penny-ui/penny_icon/` (`penny_happy.png`, `penny_confident.png`, `penny_peace.png`, `penny_fierce.png`, `penny_shocked.png`, `penny_sad.png`, `penny_crying.png`, `penny_angry.png`)

11. **And** `src/store/pennyStore.ts` `MoodState` type is updated to match the 8 Pocket Pixel moods: `'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry'`

12. **And** `npm run build` succeeds with zero TypeScript errors

13. **And** `npm run lint` passes

## Tasks / Subtasks

- [x] Update `index.html` fonts and mode (AC: 2, 3, 7)
  - [x] Remove Nunito Google Fonts link
  - [x] Add Plus Jakarta Sans (400, 600, 700, 800) + Be Vietnam Pro (400, 500, 700, 900) Google Fonts link
  - [x] Add Material Symbols Outlined Google Fonts link
  - [x] Change `<html class="dark">` to `<html class="light">`

- [x] Replace color tokens in `src/styles/globals.css` (AC: 1, 6, 8)
  - [x] Replace entire `@theme` block with v2 Material Design palette (see Dev Notes)
  - [x] Replace shadcn/ui `:root` CSS variable bridge with light-mode values (see Dev Notes)
  - [x] Update `html` rule: `background-color: #f5f6f7`, `color: #2c2f30`, `font-family: 'Be Vietnam Pro', sans-serif`
  - [x] Add `.material-symbols-outlined` and `.active-nav-fill .material-symbols-outlined` CSS rules

- [x] Update `tailwind.config.ts` (AC: 4, 5)
  - [x] Add `fontFamily` with `headline`, `body`, `label` entries
  - [x] Add `borderRadius` with `DEFAULT`, `lg`, `xl`, `full` entries

- [x] Remove Lottie (AC: 9)
  - [x] `npm uninstall lottie-react`
  - [x] Remove any `lottie-react` imports from existing files (check `pennyStore.ts`, `App.tsx`)

- [x] Copy Pocket Pixel PNG skins (AC: 10)
  - [x] Create `penny/public/penny_icon/` directory
  - [x] Copy all 8 PNGs from `./penny-ui/penny_icon/` to `penny/public/penny_icon/`

- [x] Update `pennyStore.ts` MoodState type (AC: 11)
  - [x] Replace old 10-state `MoodState` with 8-state Pocket Pixel type
  - [x] Update `currentMood` initial value to `'peace'` (idle default)

- [x] Smoke test (AC: 12, 13)
  - [x] `npm run build` — zero TypeScript errors
  - [x] `npm run lint` — zero errors (pre-existing `Date.now` error in `useGoalCompletion.ts` not introduced by this story; error count reduced from 2 to 1)
  - [x] Verify app loads with light background (`#f5f6f7`) and correct fonts in browser

## Dev Notes

### What This Story Is and Is NOT

**IS:** A pure design system token swap. No new components, no new pages, no routing changes.

**IS NOT:** Rebuilding any existing components (GoalProgressCard, PennyAvatar, etc.) — those are separate rework addendum stories (3-1b, 4-1b, etc.).

The goal is to update the foundation so all future stories build on the correct tokens. Existing components will look broken after this story — that is expected and acceptable.

### Critical: Do NOT Break These Files

These files must not be modified (they are not design-system files):
- `src/lib/db.ts` — Dexie schema unchanged
- `src/lib/api.ts` — API client unchanged
- `src/hooks/useOfflineSync.ts` — offline hook unchanged
- `vite.config.ts` — no changes needed (VitePWA config stays)
- All files in `src/pages/`, `src/features/`, `src/components/` — leave as-is

### `src/styles/globals.css` — Complete Replacement

Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  /* Typography */
  --font-headline: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Be Vietnam Pro', sans-serif;
  --font-label: 'Plus Jakarta Sans', sans-serif;
  --font-sans: 'Be Vietnam Pro', sans-serif;

  /* Primary (violet) */
  --color-primary: #6a37d4;
  --color-primary-container: #ae8dff;
  --color-primary-fixed: #ae8dff;
  --color-primary-dim: #5e26c7;
  --color-on-primary: #f8f0ff;
  --color-on-primary-container: #2b006e;

  /* Secondary (teal) */
  --color-secondary: #006859;
  --color-secondary-container: #26fedc;
  --color-secondary-fixed: #26fedc;
  --color-on-secondary: #c2ffef;
  --color-on-secondary-container: #005d4f;

  /* Tertiary (yellow) */
  --color-tertiary: #685c00;
  --color-tertiary-container: #f4db36;
  --color-tertiary-fixed: #f4db36;
  --color-on-tertiary-container: #584d00;

  /* Surface scale (light mode) */
  --color-background: #f5f6f7;
  --color-surface: #f5f6f7;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #eff1f2;
  --color-surface-container: #e6e8ea;
  --color-surface-container-high: #e0e3e4;
  --color-surface-variant: #dadddf;
  --color-on-surface: #2c2f30;
  --color-on-surface-variant: #595c5d;
  --color-outline: #757778;
  --color-outline-variant: #abadae;

  /* Semantic */
  --color-error: #b41340;
  --color-error-container: #f74b6d;
  --color-on-error: #ffefef;
}

/* shadcn/ui CSS variable bridge — light mode values */
:root {
  --background: 210 11% 96%;        /* #f5f6f7 */
  --foreground: 195 5% 18%;         /* #2c2f30 */
  --card: 0 0% 100%;                /* #ffffff */
  --card-foreground: 195 5% 18%;
  --popover: 0 0% 100%;
  --popover-foreground: 195 5% 18%;
  --primary: 263 62% 52%;           /* #6a37d4 */
  --primary-foreground: 270 100% 97%; /* #f8f0ff */
  --secondary: 172 100% 21%;        /* #006859 */
  --secondary-foreground: 165 100% 91%; /* #c2ffef */
  --muted: 200 8% 93%;              /* #eff1f2 */
  --muted-foreground: 195 3% 36%;   /* #595c5d */
  --accent: 172 100% 58%;           /* #26fedc */
  --accent-foreground: 172 100% 21%;
  --destructive: 344 83% 38%;       /* #b41340 */
  --destructive-foreground: 0 100% 97%;
  --border: 195 5% 68%;             /* #abadae */
  --input: 195 5% 68%;
  --ring: 263 62% 52%;              /* #6a37d4 */
  --radius: 1rem;
}

/* Material Symbols icon font settings */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}
.active-nav-fill .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

/* Bubble tail for Pocket Pixel speech bubble */
.bubble-tail {
  border-bottom-left-radius: 0.25rem !important;
}

html {
  background-color: #f5f6f7;
  color: #2c2f30;
  font-family: 'Be Vietnam Pro', sans-serif;
}
```

### `tailwind.config.ts` — Updated Config

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        label: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

### `index.html` — Updated Font Links

Replace the Nunito font link block with:

```html
<!-- Typography: Plus Jakarta Sans (headlines) + Be Vietnam Pro (body) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Be+Vietnam+Pro:wght@400;500;700;900&display=swap" rel="stylesheet" />
<!-- Material Symbols Outlined icon font -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
```

Change `<html class="dark">` to `<html class="light">`.

### `src/store/pennyStore.ts` — Updated MoodState

Replace the `MoodState` type:

```typescript
// OLD (10 states — Lottie pig)
// type MoodState = 'idle' | 'happy' | 'excited' | 'sad' | 'celebrating' | 'worried' | 'proud' | 'neutral' | 'thinking' | 'disappointed'

// NEW (8 states — Pocket Pixel PNG skins)
export type MoodState = 'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry'
```

Update `currentMood` initial value to `'peace'` (idle/default state).

The PNG skin mapping (for reference — used in Story 4-1b):
| MoodState | PNG file | Trigger |
|---|---|---|
| `happy` | `penny_happy.png` | Default, after logging, streak active |
| `confident` | `penny_confident.png` | Goal >75% complete |
| `peace` | `penny_peace.png` | Idle, no recent activity |
| `fierce` | `penny_fierce.png` | Streak milestone (7-day, 30-day) |
| `shocked` | `penny_shocked.png` | Large unexpected expense |
| `sad` | `penny_sad.png` | Streak broken |
| `crying` | `penny_crying.png` | Goal deadline missed |
| `angry` | `penny_angry.png` | Repeated overspending in same category |

### Copying Pocket Pixel PNGs

```bash
mkdir -p penny/public/penny_icon
cp penny-ui/penny_icon/*.png penny/public/penny_icon/
```

Run from the project root (`/Users/itobeo/code/piggymetrics`).

### Removing Lottie

```bash
cd penny && npm uninstall lottie-react
```

After uninstalling, grep for any remaining `lottie-react` imports:
```bash
grep -r "lottie-react" penny/src/
```

If any imports exist (unlikely — Lottie was installed but not yet used in any component), remove them.

### shadcn/ui Compatibility Note

shadcn/ui components installed in Story 1.4 (`button`, `badge`, `progress`, `sheet`, `slider`) use the `:root` CSS variable bridge. The updated bridge values above use light-mode HSL values. The components will render correctly with the new light palette — no changes to the component files themselves are needed.

### What NOT to Do

- Do NOT rebuild `PennyAvatar`, `GoalProgressCard`, or any other component — those are rework stories
- Do NOT add React Router changes
- Do NOT install new npm packages beyond removing `lottie-react`
- Do NOT modify `vite.config.ts` — VitePWA config is unchanged
- Do NOT modify any backend Java services
- Do NOT rename or restructure `src/store/`, `src/lib/`, `src/hooks/` — only update `pennyStore.ts` MoodState type

### Previous Story Learnings (from 1.4 and 1.5)

- `tailwind.config.ts` currently has only `darkMode: ['class']` — extend it with `fontFamily` and `borderRadius` (do not replace the `darkMode` entry)
- `vite.config.ts` has `@tailwindcss/vite` plugin — Tailwind v4 reads `@theme` from `globals.css`; `tailwind.config.ts` is used for shadcn/ui compat and custom extensions only
- `lottie-react` was installed in Story 1.4 but never used in any component — safe to uninstall with no import cleanup needed (verify with grep)
- `penny/src/store/pennyStore.ts` has `MoodState` defined inline — update the type definition in place
- `penny/index.html` currently has `class="dark"` on `<html>` — change to `class="light"`
- `--legacy-peer-deps` was used for `vite-plugin-pwa` install — not relevant for this story

### File Structure After This Story

```
penny/
  index.html                    ← MODIFY: fonts (Plus Jakarta Sans + Be Vietnam Pro + Material Symbols), class="light"
  tailwind.config.ts            ← MODIFY: add fontFamily + borderRadius
  package.json                  ← MODIFY: remove lottie-react
  public/
    penny_icon/                 ← NEW: 8 Pocket Pixel PNG skins
      penny_happy.png
      penny_confident.png
      penny_peace.png
      penny_fierce.png
      penny_shocked.png
      penny_sad.png
      penny_crying.png
      penny_angry.png
  src/
    styles/
      globals.css               ← MODIFY: full v2 token replacement
    store/
      pennyStore.ts             ← MODIFY: MoodState type (8 states)
```

### References

- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-13.md` — Section 4.D "Story 1-4b: Design System Token Update" (this story implements that spec)
- `_bmad-output/planning-artifacts/ux-design-specification.md` — "Design System Foundation" (color tokens, typography, border radius, icons, mascot)
- `penny-ui/mobile_dashboard/code.html` — Tailwind config block (authoritative source for all color tokens and font families)
- `_bmad-output/implementation-artifacts/1-4-design-system-core-dependencies-setup.md` — File List (what currently exists)
- `_bmad-output/implementation-artifacts/1-5-service-worker-pwa-foundation.md` — File List (vite.config.ts state)

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-5

### Debug Log References
- `npm uninstall lottie-react` required `--legacy-peer-deps` due to pre-existing vite-plugin-pwa peer dep conflict
- `lottie-react` was actively used in `PennyAvatar.tsx` (contrary to story notes) — replaced with PNG-based implementation
- Pre-existing lint error in `useGoalCompletion.ts` (`Date.now` impure function) not introduced by this story; error count reduced from 2 to 1

### Completion Notes List
- Updated `index.html`: replaced Nunito with Plus Jakarta Sans + Be Vietnam Pro + Material Symbols Outlined; changed `class="dark"` → `class="light"`
- Replaced `globals.css` entirely with v2 Material Design light-mode token palette, shadcn/ui bridge, Material Symbols rules, and html base styles
- Updated `tailwind.config.ts` with `fontFamily` (headline/body/label) and `borderRadius` (DEFAULT/lg/xl/full)
- Removed `lottie-react` package; replaced `PennyAvatar` Lottie implementation with PNG skin renderer using new MoodState
- Copied 8 Pocket Pixel PNGs to `penny/public/penny_icon/`
- Updated `pennyStore.ts` MoodState to 8-state Pocket Pixel type; initial mood set to `'peace'`
- Updated `moodEngine.ts` and all component/test files referencing old mood values to use new MoodState
- Build: ✅ zero TypeScript errors | Tests: ✅ 87/87 passed | Lint: ✅ no new errors

### File List
- penny/index.html
- penny/tailwind.config.ts
- penny/package.json
- penny/package-lock.json
- penny/src/styles/globals.css
- penny/src/store/pennyStore.ts
- penny/src/components/PennyAvatar/PennyAvatar.tsx
- penny/src/components/PennyAvatar/PennyAvatar.test.tsx
- penny/src/components/BottomNav/BottomNav.tsx
- penny/src/components/GoalProgressCard/GoalProgressCard.tsx
- penny/src/features/goal/components/GoalCompletionCelebration.tsx
- penny/src/features/goal/components/PennyIntroScreen.tsx
- penny/src/features/penny/moodEngine.ts
- penny/src/features/penny/moodEngine.test.ts
- penny/src/features/penny/hooks/usePennyMood.test.ts
- penny/public/penny_icon/penny_happy.png (new)
- penny/public/penny_icon/penny_confident.png (new)
- penny/public/penny_icon/penny_peace.png (new)
- penny/public/penny_icon/penny_fierce.png (new)
- penny/public/penny_icon/penny_shocked.png (new)
- penny/public/penny_icon/penny_sad.png (new)
- penny/public/penny_icon/penny_crying.png (new)
- penny/public/penny_icon/penny_angry.png (new)

## Change Log

- 2026-04-13: Design system updated to v2 — Plus Jakarta Sans + Be Vietnam Pro fonts, Material Symbols Outlined, light-mode default, v2 Material Design color tokens, lottie-react removed, Pocket Pixel PNG skins added, MoodState updated to 8-state Pocket Pixel type

## Senior Developer Review (AI)

**Date:** 2026-04-13
**Outcome:** Changes Requested → All Resolved
**Action Items:** 6 total (3 decision-needed, 3 patch, 4 deferred)

### Action Items

- [x] [Review][Decision] Persisted store migration — users with old mood values ('idle','excited' etc.) will load invalid MoodState, causing `MOOD_PNG[undefined]` broken image [pennyStore.ts] — deferred, dev/demo app no real users
- [x] [Review][Decision] `useReducedMotion()` result unused — reduced motion users get no accommodation; regression from prior behaviour [PennyAvatar.tsx] — fixed: removed dead hook call; reduced motion support deferred to story 4-1b
- [x] [Review][Decision] PennyAvatar fully rebuilt vs. Dev Notes constraint ("Do NOT rebuild PennyAvatar") — necessary for compile, but needs explicit acceptance [PennyAvatar.tsx] — accepted; noted in deferred-work.md for story 4-1b
- [x] [Review][Patch] Aria-label says "Penny is excited" but mood is now "happy" — misleading to screen readers [GoalProgressCard.tsx:126]
- [x] [Review][Patch] Unreachable `return 'peace'` duplicate at end of moodEngine [moodEngine.ts:21]
- [x] [Review][Patch] PNG 404 no fallback — broken image shown if PNG fails to load, no `onError` handler [PennyAvatar.tsx]
- [x] [Review][Defer] `--color-foreground`/`--color-muted-foreground` removed — may affect existing components; full rework in later stories — deferred, pre-existing
- [x] [Review][Defer] `mood="fierce"` for celebration semantic mismatch — mood mapping is story 4-1b's concern — deferred, pre-existing
- [x] [Review][Defer] `'crying'`/`'angry'` unreachable from moodEngine — story 4-1b — deferred, pre-existing
- [x] [Review][Defer] Redundant `sad` branches in moodEngine (daysSinceLastLog>=2 makes second branch unreachable) — logic correct, cosmetic — deferred, pre-existing
