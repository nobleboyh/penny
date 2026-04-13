# Story 4.1b: Pocket Pixel Mood Engine — PNG Avatar Replacement

Status: ready-for-dev

## Context

Rework addendum to Story 4.1 (done). Replaces the Lottie-based `PennyAvatar` mood system with the Pocket Pixel PNG skin system. `lottie-react` was already removed in Story 1.6. The `moodEngine` pure function is replaced with a new mapping that uses the 8 Pocket Pixel moods. `PocketPixelAvatar` was created in Story 3.1b.

Design reference: `./penny-ui/penny_icon/` (8 PNG skins), `./penny-ui/mobile_stash_log/code.html` (mascot tip section)

## Story

As a user,
I want Pocket Pixel to display different PNG skins reflecting my financial activity,
so that the mascot feels alive and emotionally responsive with the new pixel-art style.

## Acceptance Criteria

1. **Given** the app is running
   **When** Pocket Pixel's mood is evaluated
   **Then** `moodEngine(state)` returns one of the 8 Pocket Pixel moods: `'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry'`

2. **And** `PocketPixelAvatar` renders the correct PNG skin from `/penny_icon/{mood}.png` for each mood

3. **And** `usePennyMood` hook is updated to use the new 8-state mood mapping

4. **And** `pennyStore.currentMood` initial value is `'peace'` (already set in Story 1.6)

5. **And** if the PNG fails to load, a 🎮 emoji fallback is shown

6. **And** `PocketPixelAvatar` has `aria-label="Pocket Pixel, your saving buddy"` and `role="img"`

7. **And** `prefers-reduced-motion` is respected — no entrance animation when true

8. **And** `npm run build` and `npm run lint` pass with zero errors

## Tasks / Subtasks

- [ ] Update `moodEngine.ts` for 8-state Pocket Pixel moods (AC: 1)
  - [ ] Update `MoodEngineInput` — unchanged interface
  - [ ] Rewrite mood priority logic to return `MoodState` (8 Pocket Pixel states):
    - `progressPercent >= 100` → `'confident'` (was `'celebrating'`)
    - `daysSinceLastLog >= 2` → `'crying'` (was `'worried'`)
    - `daysSinceLastLog >= 1 && streakCount === 0` → `'sad'` (was `'sad'`)
    - `progressPercent >= 75 && streakCount >= 1` → `'happy'` (was `'proud'`)
    - `streakCount >= 3 && progressPercent >= 50` → `'fierce'` (was `'excited'`)
    - `recentSpendingHigh` → `'shocked'` (was `'thinking'`)
    - `progressPercent > 0` → `'happy'` (was `'neutral'`)
    - default → `'peace'` (was `'idle'`)
  - [ ] Remove old 10-state mood values (`celebrating`, `worried`, `proud`, `excited`, `thinking`, `neutral`, `idle`, `disappointed`) — they no longer exist in `MoodState`

- [ ] Update `moodEngine.test.ts` for new 8-state mapping (AC: 1)
  - [ ] Update all test assertions to use new mood names
  - [ ] Ensure all 8 moods are reachable via tests

- [ ] Update `usePennyMood.ts` — no logic change needed (reads from `moodEngine`, writes to `pennyStore.setMood`) (AC: 3)
  - [ ] Verify `MoodState` import is from `store/pennyStore` (already correct)
  - [ ] Verify `recentSpendingHigh: false` is still passed (unchanged)

- [ ] Update `usePennyMood.test.ts` — update mock return values to new mood names (AC: 3)

- [ ] Verify `PocketPixelAvatar` PNG mapping covers all 8 moods (AC: 2, 5, 6, 7)
  - [ ] `PocketPixelAvatar` was created in Story 3.1b — verify it has all 8 mood → PNG mappings
  - [ ] Verify fallback emoji on image load error
  - [ ] Verify `role="img"` and `aria-label`
  - [ ] Verify `useReducedMotion()` check (no entrance animation when true)
  - [ ] If any of the above are missing, add them now

- [ ] Update `PennyAvatar` re-export alias (AC: 2)
  - [ ] `PennyAvatar` should re-export `PocketPixelAvatar` — verify this is in place from Story 3.1b
  - [ ] If not, update `penny/src/components/PennyAvatar/PennyAvatar.tsx` to re-export

- [ ] Update `features/penny/index.ts` exports (AC: 1, 3)
  - [ ] Ensure `moodEngine`, `usePennyMood`, `MoodEngineInput` are exported
  - [ ] Remove any `MoodState` re-export from `features/penny/types.ts` if it conflicts with `store/pennyStore.ts` (source of truth)

- [ ] Smoke test: `npm run build` + `npm run test` (AC: 8)

## Dev Notes

### Critical: `MoodState` Type Already Updated in Story 1.6

`penny/src/store/pennyStore.ts` `MoodState` is already:
```typescript
type MoodState = 'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry'
```
The `moodEngine.ts` currently returns the OLD 10-state values — this story fixes that mismatch.

### Critical: `lottie-react` Already Removed in Story 1.6

Do NOT re-add `lottie-react`. `PennyAvatar` was using Lottie in Story 4.1 — that code is now broken since `lottie-react` was uninstalled. This story replaces it with the PNG approach via `PocketPixelAvatar`.

### Mood Mapping Rationale

| Old Mood | New Pocket Pixel Mood | Rationale |
|---|---|---|
| `celebrating` | `confident` | Goal complete = confident/proud |
| `worried` | `crying` | 2+ days no log = distressed |
| `sad` | `sad` | No streak, missed day |
| `proud` | `happy` | High progress + streak |
| `excited` | `fierce` | Long streak + good progress |
| `thinking` | `shocked` | Unusual spending |
| `neutral` | `happy` | Some progress |
| `idle` | `peace` | Default/calm |
| `happy` | `happy` | Active, positive |
| `disappointed` | (removed — was reserved for Story 4.7) | Story 4.7b will handle streak-break |

### PNG Files Available

All in `penny/public/penny_icon/`:
- `penny_happy.png` → `'happy'`
- `penny_confident.png` → `'confident'`
- `penny_peace.png` → `'peace'`
- `penny_fierce.png` → `'fierce'`
- `penny_shocked.png` → `'shocked'`
- `penny_sad.png` → `'sad'`
- `penny_crying.png` → `'crying'`
- `penny_angry.png` → `'angry'`

### What NOT to Do

- Do NOT re-add `lottie-react`
- Do NOT change `MoodEngineInput` interface
- Do NOT change `usePennyMood` hook logic (only update mood name assertions in tests)
- Do NOT create a new `PocketPixelAvatar` — it was created in Story 3.1b; verify and patch if needed

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/penny/moodEngine.ts` | MODIFY: 8-state mood mapping |
| `penny/src/features/penny/moodEngine.test.ts` | MODIFY: update assertions |
| `penny/src/features/penny/hooks/usePennyMood.test.ts` | MODIFY: update mock mood values |
| `penny/src/features/penny/index.ts` | VERIFY/MODIFY: exports |
| `penny/src/components/PocketPixelAvatar/PocketPixelAvatar.tsx` | VERIFY: all 8 moods, fallback, a11y |
| `penny/src/components/PennyAvatar/PennyAvatar.tsx` | VERIFY: re-export alias to PocketPixelAvatar |

### Design Reference

`./penny-ui/penny_icon/` — 8 PNG skin files.
`./penny-ui/mobile_stash_log/code.html` — Pocket Pixel mascot tip section layout.
