import type { GoalCategory } from '../types'

interface Props {
  onSelect: (category: GoalCategory, name: string, emoji: string) => void
  onJustSaving: () => void
}

const CATEGORIES: { id: GoalCategory; emoji: string; label: string }[] = [
  { id: 'tech', emoji: '💻', label: 'Tech' },
  { id: 'fashion', emoji: '👟', label: 'Fashion' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'food', emoji: '🍔', label: 'Food' },
  { id: 'other', emoji: '🎯', label: 'Other' },
]

export function GoalCategoryPicker({ onSelect, onJustSaving }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">What are you saving for?</h1>
        <p className="text-muted-foreground text-center text-sm">Pick a category to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id, label, emoji)}
            className="flex flex-col items-center justify-center gap-2 min-h-[88px] rounded-2xl border border-border bg-surface p-4 font-semibold text-foreground transition-all hover:border-primary hover:shadow-[0_0_12px_rgba(255,107,107,0.4)] active:scale-95"
            aria-label={`Save for ${label}`}
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onJustSaving}
        className="w-full min-h-[56px] rounded-2xl border border-border bg-transparent px-6 py-4 font-semibold text-muted-foreground text-base transition-opacity hover:opacity-80 active:opacity-60"
        aria-label="Just saving, no specific goal"
      >
        Just saving 💰
      </button>
    </div>
  )
}
