import { useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { GoalProgressCard } from '../components/GoalProgressCard'
import { useGoalCompletion, GoalCompletionCelebration } from '../features/goal'

export function Home() {
  const { isComplete } = useGoalCompletion()
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-start bg-background pt-8 pb-20 px-4">
        <GoalProgressCard />
      </main>
      <BottomNav />
      {isComplete && !celebrationDismissed && (
        <GoalCompletionCelebration onDismiss={() => setCelebrationDismissed(true)} />
      )}
    </>
  )
}
