import type { MoodState } from '../../store/pennyStore'
import { MOOD_PNG } from '../PocketPixelAvatar/moodPng'

interface Props {
  mood?: MoodState
  message?: string
  subtext?: string
}

export function PocketPixelTip({
  mood = 'happy',
  message = "You're on it!",
  subtext = 'Stash growing this week.',
}: Props) {
  return (
    <section className="shrink-0 flex items-center gap-3 bg-white/40 p-2 rounded-2xl relative overflow-hidden">
      <img
        src={MOOD_PNG[mood]}
        alt="Pocket Pixel"
        className="w-16 h-16 object-contain shrink-0"
      />
      <div className="flex flex-col">
        <div className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-headline font-bold text-xs inline-block w-fit">
          {message}
        </div>
        <p className="text-on-surface-variant font-medium text-[10px] mt-1">{subtext}</p>
      </div>
    </section>
  )
}
