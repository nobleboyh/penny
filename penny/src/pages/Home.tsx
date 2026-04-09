import { BottomNav } from '../components/BottomNav'
import { PennyAvatar } from '../components/PennyAvatar'

export function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <PennyAvatar size="md" mood="happy" />
        <p className="text-foreground text-xl font-bold">You're all set! 🎉</p>
        <p className="text-muted-foreground text-sm">More features coming soon…</p>
      </div>
      <BottomNav />
    </div>
  )
}
