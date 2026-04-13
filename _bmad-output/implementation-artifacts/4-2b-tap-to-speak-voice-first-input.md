# Story 4.2b: Tap to Speak — Voice-First Transaction Input

Status: ready-for-dev

## Context

Rework addendum to Story 4.2 (done). Replaces the text-first `PennyChatInput` bottom sheet with a voice-first "TAP TO SPEAK" input using the Web Speech API. Text input remains as a fallback for unsupported browsers. The `TapToSpeakCard` on the home screen (created in Story 3.1b) is the entry point.

Design reference: `./penny-ui/mobile_dashboard/code.html` (Record section), `./penny-ui/mobile_stash_log/code.html`

## Story

As a user,
I want to log a transaction by tapping and speaking,
so that logging feels instant and natural without typing.

## Acceptance Criteria

1. **Given** a user taps "TAP TO SPEAK" on the home screen
   **When** `PennyChatInput` opens
   **Then** the Web Speech API (`SpeechRecognition`) starts listening immediately (if supported)

2. **And** the sheet shows a purple gradient card with a white pill "TAP TO SPEAK" button and mic icon while listening

3. **And** the transcript from speech is fed into `lib/nlp.ts` `parseTransaction()` in real-time

4. **And** on unsupported browsers (no `SpeechRecognition`), the sheet falls back to the existing text input (AC from Story 4.2)

5. **And** the parsed amount and category preview are shown below the input (unchanged from Story 4.2)

6. **And** a single tap on the confirm button (or Enter key) logs the transaction (unchanged)

7. **And** the sheet dismisses on confirm or swipe down (unchanged)

8. **And** `aria-label="Tap to speak and log a transaction"` on the mic button; `aria-live="polite"` on the transcript display

9. **And** `npm run build` and `npm run lint` pass

## Tasks / Subtasks

- [ ] Create `hooks/useSpeechRecognition.ts` (AC: 1, 4)
  - [ ] Detect support: `const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window`
  - [ ] Return `{ isSupported, isListening, transcript, startListening, stopListening, error }`
  - [ ] `startListening()`: creates `SpeechRecognition` instance, sets `continuous: false`, `interimResults: true`, calls `.start()`
  - [ ] `stopListening()`: calls `.stop()` on the instance
  - [ ] `onresult`: update `transcript` with `event.results[0][0].transcript`
  - [ ] `onerror`: set `error` state, set `isListening: false`
  - [ ] `onend`: set `isListening: false`
  - [ ] Cleanup: call `.abort()` on unmount

- [ ] Update `PennyChatInput.tsx` to support voice-first mode (AC: 1, 2, 3, 4, 5, 6, 7, 8)
  - [ ] Import `useSpeechRecognition` hook
  - [ ] If `isSupported`: render voice-first UI (purple gradient card + mic button)
  - [ ] If `!isSupported`: render existing text input UI (fallback — no change to existing code path)
  - [ ] Voice UI layout (matches `mobile_dashboard/code.html` Record section):
    ```
    bg-gradient-to-br from-violet-600 to-violet-800 p-4 rounded-xl
    ├── prompt text: "Spent something? Tap and say it to log!"
    └── TAP TO SPEAK button: bg-white text-violet-700 rounded-full font-headline font-black
        └── mic icon: material-symbols-outlined "mic" (FILL 1 when listening)
    ```
  - [ ] On mic button tap: `startListening()` if not listening, `stopListening()` if listening
  - [ ] Transcript feeds into `parseTransaction()` with 300ms debounce (same as text input)
  - [ ] Transcript displayed in `<p aria-live="polite">` below the button
  - [ ] Confirm button: same logic as Story 4.2 (disabled until `amount !== null`)
  - [ ] Mic button `aria-label`: `isListening ? "Stop listening" : "Tap to speak and log a transaction"`
  - [ ] When `isListening`: mic icon uses `style="font-variation-settings: 'FILL' 1"` (filled)

- [ ] Create `hooks/useSpeechRecognition.test.ts` (AC: 1, 4)
  - [ ] Test: `isSupported` is false when `SpeechRecognition` not in window
  - [ ] Test: `startListening` sets `isListening: true`
  - [ ] Test: `onresult` updates `transcript`
  - [ ] Test: `onerror` sets `error` and `isListening: false`
  - [ ] Test: cleanup calls `.abort()` on unmount

- [ ] Update `PennyChatInput.test.tsx` (AC: 1, 2, 4, 8)
  - [ ] Add test: voice UI renders when `isSupported: true`
  - [ ] Add test: text fallback renders when `isSupported: false`
  - [ ] Add test: mic button `aria-label` changes when listening
  - [ ] Add test: transcript feeds into parse preview
  - [ ] Add test: `aria-live="polite"` on transcript display

## Dev Notes

### Web Speech API Browser Support

| Browser | Support |
|---|---|
| Chrome (desktop + Android) | ✅ `webkitSpeechRecognition` |
| Safari iOS 14.5+ | ⚠️ Limited — requires user gesture, may not work in PWA |
| Firefox | ❌ Not supported |
| Samsung Internet | ✅ |

The fallback to text input handles all unsupported cases. Do NOT show an error message — just silently render the text input.

### `useSpeechRecognition` Implementation

```typescript
// penny/src/hooks/useSpeechRecognition.ts
export function useSpeechRecognition() {
  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const isSupported = !!SpeechRecognitionAPI

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  function startListening() {
    if (!isSupported) return
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (e: any) => {
      setTranscript(e.results[0][0].transcript)
    }
    recognition.onerror = (e: any) => {
      setError(e.error)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setTranscript('')
    setError(null)
  }

  function stopListening() {
    recognitionRef.current?.stop()
  }

  useEffect(() => {
    return () => recognitionRef.current?.abort()
  }, [])

  return { isSupported, isListening, transcript, startListening, stopListening, error }
}
```

### `PennyChatInput` Voice UI

The voice UI replaces the text input as the primary interaction when `isSupported`. The text input is still rendered (hidden or below) as fallback. Simplest approach: conditional render based on `isSupported`.

```tsx
// PennyChatInput.tsx — voice-first section
{isSupported ? (
  <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-4 rounded-xl relative overflow-hidden">
    <p className="text-violet-100/90 text-[11px] mb-3 text-center">
      Spent something? Tap and say it to log!
    </p>
    <button
      onClick={isListening ? stopListening : startListening}
      aria-label={isListening ? "Stop listening" : "Tap to speak and log a transaction"}
      className="bg-white text-violet-700 w-full py-2.5 rounded-full font-headline font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
    >
      <span
        className="material-symbols-outlined text-lg"
        style={isListening ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        mic
      </span>
      {isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
    </button>
    {transcript && (
      <p aria-live="polite" className="mt-2 text-violet-100 text-xs text-center">
        "{transcript}"
      </p>
    )}
  </div>
) : (
  // existing text input — unchanged from Story 4.2
  <input ... />
)}
```

### Transcript → NLP Integration

When `transcript` changes (from speech), feed it into `parseTransaction()` with the same 300ms debounce as the text input. The `useEffect` for debounced parse should handle both `input` (text) and `transcript` (voice):

```typescript
const activeInput = isSupported && isListening ? transcript : input
useEffect(() => {
  if (!activeInput.trim()) { setParsed(null); return }
  const t = setTimeout(() => setParsed(parseTransaction(activeInput)), 300)
  return () => clearTimeout(t)
}, [activeInput])
```

### Architecture Compliance

- `useSpeechRecognition` in `hooks/` (shared hook, not feature-specific) ✓
- No `navigator.onLine` check — offline handling is `useOfflineSync` scope ✓
- `lib/nlp.ts` `parseTransaction` unchanged — voice transcript is just another string input ✓
- `useTransactionLog` unchanged — `logTransaction(parsed)` call is identical ✓

### What NOT to Do

- Do NOT add a new route for voice logging — it's still a bottom sheet
- Do NOT implement server-side speech processing — Web Speech API is client-side only
- Do NOT change `lib/nlp.ts` — it already handles natural language strings
- Do NOT change `useTransactionLog` — the logging flow is identical
- Do NOT show an error UI for unsupported browsers — silently fall back to text input
- Do NOT use `console.error` — use `lib/logger.ts` if available, otherwise omit

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/hooks/useSpeechRecognition.ts` | CREATE |
| `penny/src/hooks/useSpeechRecognition.test.ts` | CREATE |
| `penny/src/components/PennyChatInput/PennyChatInput.tsx` | MODIFY: voice-first UI + fallback |
| `penny/src/components/PennyChatInput/PennyChatInput.test.tsx` | MODIFY: add voice tests |

### Design Reference

`./penny-ui/mobile_dashboard/code.html` — "Compact Record Section" (purple gradient card, TAP TO SPEAK button).
`./penny-ui/mobile_stash_log/code.html` — Pocket Pixel mascot tip section for context.
