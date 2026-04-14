import { Link } from 'react-router-dom'
import { useGoalStore } from '../../store/goalStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

function FeaturedCard({ name, pct }: { name: string; pct: number | null }) {
  return (
    <div
      role="listitem"
      className="shrink-0 w-44 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-headline font-bold text-xs truncate w-24">{name}</h3>
        {pct !== null && (
          <span className="bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full text-[9px] font-black">
            {pct}%
          </span>
        )}
      </div>
      {pct !== null && (
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

function SecondaryCard({ name, pct, barColor }: { name: string; pct: number; barColor: string }) {
  return (
    <div
      role="listitem"
      data-testid="placeholder-card"
      className="shrink-0 w-32 bg-white p-3 rounded-xl border border-outline-variant/5"
    >
      <h4 className="font-headline font-bold text-[10px] mb-1 truncate">{name}</h4>
      <div className="h-1.5 w-full bg-surface-container rounded-full mb-1">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[8px] font-bold text-on-surface-variant uppercase">{pct}% Saved</p>
    </div>
  )
}

export function YourDreamsSection() {
  const { goalName, goalAmount, savedAmount, isJustSaving } = useGoalStore()
  const prefersReducedMotion = useReducedMotion()

  let featuredName: string
  let featuredPct: number | null = null

  if (isJustSaving) {
    featuredName = 'Just Saving 💰'
  } else if (goalName) {
    featuredName = goalName
    if (goalAmount && goalAmount > 0 && Number.isFinite(savedAmount)) {
      featuredPct = Math.min(100, Math.max(0, Math.round((savedAmount / goalAmount) * 100)))
    }
  } else {
    featuredName = 'Add your first dream ✨'
  }

  return (
    <section className="shrink-0 space-y-2">
      <div className="flex justify-between items-center px-1">
        <h2 className="font-headline font-extrabold text-lg tracking-tight">Your Dreams</h2>
        <Link
          to="/wishlist"
          className="text-primary font-bold text-xs"
          aria-label="View all dreams"
        >
          View All
        </Link>
      </div>
      <div
        role="list"
        aria-label="Your Dreams"
        className={`flex gap-3 overflow-x-auto pb-1 no-scrollbar${prefersReducedMotion ? '' : ' scroll-smooth'}`}
      >
        <FeaturedCard name={featuredName} pct={featuredPct} />
        <SecondaryCard name="New Game" pct={33} barColor="bg-tertiary-fixed" />
        <SecondaryCard name="Concert" pct={50} barColor="bg-secondary-fixed" />
      </div>
    </section>
  )
}
