import type { MoodState } from '../../store/pennyStore'
import { MOOD_PNG } from './moodPng'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  mood?: MoodState
  'aria-label'?: string
}

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  sm: 40,
  md: 80,
  lg: 160,
}

export function PocketPixelAvatar({
  size = 'md',
  mood = 'peace',
  'aria-label': ariaLabel = 'Pocket Pixel, your saving buddy',
}: Props) {
  const px = SIZE_PX[size]

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: px, height: px }}
      className="relative flex items-center justify-center"
    >
      <img
        src={MOOD_PNG[mood]}
        alt=""
        width={px}
        height={px}
        style={{ width: px, height: px, objectFit: 'contain' }}
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement
          el.style.display = 'none'
          if (el.parentElement) el.parentElement.textContent = '🎮'
        }}
      />
    </div>
  )
}
