import { useGoalStore } from '../store/goalStore'
import { BottomNav } from '../components/BottomNav'
import { PennyAvatar } from '../components/PennyAvatar'

export function Home() {
  const hasHydrated = useGoalStore(s => s._hasHydrated)
  const isJustSaving = useGoalStore(s => s.isJustSaving)
  const goalName = useGoalStore(s => s.goalName)

  const message = !hasHydrated
    ? { headline: "You're all set! 🎉", sub: 'More features coming soon…' }
    : isJustSaving
    ? { headline: 'Every penny counts 🐷', sub: 'Log what you spend and watch it add up!' }
    : goalName
    ? { headline: `Let's get you to ${goalName}! 🎯`, sub: 'Log your first spend to get started.' }
    : { headline: "You're all set! 🎉", sub: 'More features coming soon…' }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <PennyAvatar size="md" mood="happy" />
        <div aria-live="polite">
          <p className="text-foreground text-xl font-bold">{message.headline}</p>
          <p className="text-muted-foreground text-sm">{message.sub}</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
