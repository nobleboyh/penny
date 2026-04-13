import type { MoodState } from '../../store/pennyStore'

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

const MOOD_PNG: Record<MoodState, string> = {
  happy: '/penny_icon/penny_happy.png',
  confident: '/penny_icon/penny_confident.png',
  peace: '/penny_icon/penny_peace.png',
  fierce: '/penny_icon/penny_fierce.png',
  shocked: '/penny_icon/penny_shocked.png',
  sad: '/penny_icon/penny_sad.png',
  crying: '/penny_icon/penny_crying.png',
  angry: '/penny_icon/penny_angry.png',
}

export function PennyAvatar({ size = 'md', mood = 'peace', 'aria-label': ariaLabel = 'Penny, your saving buddy' }: Props) {
  const px = SIZE_PX[size]

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: px, height: px }}
      className="relative flex items-center justify-center rounded-full"
    >
      <img
        src={MOOD_PNG[mood]}
        alt=""
        width={px}
        height={px}
        style={{ width: px, height: px, objectFit: 'contain' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden' }}
      />
    </div>
  )
}
