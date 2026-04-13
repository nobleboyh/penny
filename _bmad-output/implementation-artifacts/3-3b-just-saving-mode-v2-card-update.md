# Story 3.3b: "Just Saving" Mode — v2 Card Style Update

Status: ready-for-dev

## Context

Rework addendum to Story 3.3 (done). Updates the "Just Saving" variant of the home screen card to use the new v2 design tokens and terminology. Logic is unchanged.

Design reference: `./penny-ui/mobile_dashboard/code.html` (featured card, just-saving variant)

## Story

As a user in "Just Saving" mode,
I want the home screen to show my total stash in the new visual style,
so that the experience is consistent with the updated design.

## Acceptance Criteria

1. **Given** a user is in "Just Saving" mode
   **When** the home screen renders
   **Then** the featured card in `YourDreamsSection` shows "Just Saving 💰" as the card title and total saved amount

2. **And** the card uses `bg-surface-container-lowest rounded-xl border border-outline-variant/10` styling

3. **And** no progress bar is shown (unchanged behavior)

4. **And** the "Add Dream ✨" upgrade CTA is styled as `text-primary font-bold text-xs` link below the saved amount

5. **And** the Pocket Pixel tip banner shows an encouraging message (not referencing a missing goal)

6. **And** `npm run build` and `npm run lint` pass

## Tasks / Subtasks

- [ ] Update `YourDreamsSection` just-saving card variant (AC: 1, 2, 3, 4)
  - [ ] Card title: "Just Saving 💰" in `font-headline font-bold text-xs`
  - [ ] Saved amount: `font-headline font-extrabold text-sm text-on-surface`
  - [ ] No progress bar rendered (guard: `isJustSaving`)
  - [ ] "Add Dream ✨" CTA: `text-primary font-bold text-xs mt-1` — sets `isEditing = true` in parent

- [ ] Update `PocketPixelTip` default message for just-saving users (AC: 5)
  - [ ] When `isJustSaving`, pass message: "Every penny counts! Keep stashing 💪"
  - [ ] Subtext: "No goal needed — just keep going."
  - [ ] Mood: `'peace'` (calm, encouraging)

- [ ] Verify no regressions in `YourDreamsSection.test.tsx` (AC: 6)
  - [ ] Add test: just-saving card renders "Just Saving 💰" title
  - [ ] Add test: no progress bar rendered when `isJustSaving: true`
  - [ ] Add test: "Add Dream ✨" CTA renders when `isJustSaving: true`

## Dev Notes

### Scope Boundary

This story touches only:
1. The just-saving card variant inside `YourDreamsSection`
2. The `PocketPixelTip` message when `isJustSaving`

Do NOT change:
- `goalStore.setJustSaving()` logic
- `GoalSetupForm` just-saving path (covered in 3.2b)
- Any API calls

### What Exists

- `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` — created in Story 3.1b; MODIFY just-saving variant
- `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` — created in Story 3.1b; MODIFY message logic
- `penny/src/store/goalStore.ts` — `isJustSaving` selector

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` | MODIFY: just-saving card variant styles + copy |
| `penny/src/components/YourDreamsSection/YourDreamsSection.test.tsx` | MODIFY: add just-saving tests |
| `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` | MODIFY: just-saving message |

### Design Reference

`./penny-ui/mobile_dashboard/code.html` — featured card section for style reference.
