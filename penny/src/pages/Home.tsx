import { BottomNav } from '../components/BottomNav'
import { GoalProgressCard } from '../components/GoalProgressCard'

export function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-start bg-background pt-8 pb-20 px-4">
        <GoalProgressCard />
      </main>
      <BottomNav />
    </>
  )
}
