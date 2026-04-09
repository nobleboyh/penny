import { useReducedMotion, motion } from 'framer-motion'
import type { MoodState } from '../../store/pennyStore'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  mood?: MoodState
}

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  sm: 40,
  md: 80,
  lg: 160,
}

const MOOD_EMOJI: Record<MoodState, string> = {
  idle: '🐷',
  happy: '🐷',
  excited: '🐷',
  sad: '🐷',
  celebrating: '🐷',
  worried: '🐷',
  proud: '🐷',
  neutral: '🐷',
  thinking: '🐷',
  disappointed: '🐷',
}

const BOUNCE = {
  animate: { y: [0, -12, 0] },
  transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' as const },
}

export function PennyAvatar({ size = 'md', mood = 'idle' }: Props) {
  const prefersReduced = useReducedMotion()
  const px = SIZE_PX[size]
  const fontSize = Math.round(px * 0.6)
  const shouldBounce = !prefersReduced && (mood === 'excited' || mood === 'celebrating' || mood === 'happy')

  return (
    <motion.div
      role="img"
      aria-label="Penny, your saving buddy"
      style={{ width: px, height: px, fontSize }}
      className="relative flex items-center justify-center rounded-full"
      animate={shouldBounce ? BOUNCE.animate : undefined}
      transition={shouldBounce ? BOUNCE.transition : undefined}
    >
      {/* Coral radial glow backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <span style={{ fontSize, lineHeight: 1 }}>{MOOD_EMOJI[mood]}</span>
    </motion.div>
  )
}
