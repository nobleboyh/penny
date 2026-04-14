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
        <h1 className="text-2xl font-headline font-bold text-foreground text-center mb-2">What's your dream?</h1>
        <p className="text-muted-foreground text-center text-sm">Pick a category to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id, label, emoji)}
            className="flex flex-col items-center justify-center gap-2 min-h-[88px] rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-3 transition-all hover:border-primary active:scale-95 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
            aria-label={`Save for ${label}`}
          >
            <span className="text-3xl">{emoji}</span>
            <span className="font-headline font-bold text-sm text-foreground">{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onJustSaving}
        className="w-full min-h-[56px] border-2 border-primary text-primary rounded-full py-3 px-6 font-headline font-bold bg-transparent transition-opacity hover:opacity-80 active:opacity-60"
        aria-label="Just saving, no specific goal"
      >
        Just Saving 💰
      </button>
    </div>
  )
}
