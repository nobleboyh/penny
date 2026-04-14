import { useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { YourDreamsSection } from '../components/YourDreamsSection'
import { PocketPixelTip } from '../components/PocketPixelTip'
import { TapToSpeakCard } from '../components/TapToSpeakCard'
import { PennyChatInput } from '../components/PennyChatInput'
import { useGoalCompletion, GoalCompletionCelebration } from '../features/goal'

export function Home() {
  const { isComplete } = useGoalCompletion()
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto px-4 max-w-md mx-auto w-full flex flex-col space-y-3 py-2">
        <PocketPixelTip />
        <YourDreamsSection />
        <TapToSpeakCard onTap={() => setChatOpen(true)} />
      </main>
      <BottomNav />
      <PennyChatInput open={chatOpen} onOpenChange={setChatOpen} />
      {isComplete && !celebrationDismissed && (
        <GoalCompletionCelebration onDismiss={() => setCelebrationDismissed(true)} />
      )}
    </div>
  )
}
