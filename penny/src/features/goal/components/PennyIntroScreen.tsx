import { useEffect, useState } from 'react'
import { PennyAvatar } from '../../../components/PennyAvatar'

interface Props {
  goalName: string | null
  onDone: () => void
}

export function PennyIntroScreen({ goalName, onDone }: Props) {
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCtaVisible(true), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 w-full text-center">
      <PennyAvatar size="lg" mood="excited" />

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-foreground">
          Hi! I'm Penny, your saving buddy 🐷
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          I'll cheer you on, keep you on track,<br />
          and never judge your bubble tea habit.
        </p>
        {goalName && goalName !== 'Just saving' && (
          <p className="text-accent font-semibold text-base">
            Let's start saving! 🎯
          </p>
        )}
      </div>

      <button
        onClick={ctaVisible ? onDone : undefined}
        className={`w-full min-h-[56px] rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground text-lg transition-opacity hover:opacity-90 active:opacity-80 ${!ctaVisible ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label="Let's go to the home screen"
        aria-disabled={!ctaVisible}
      >
        Let's go! 🚀
      </button>
    </div>
  )
}
