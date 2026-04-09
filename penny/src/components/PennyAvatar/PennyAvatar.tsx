import Lottie from 'lottie-react'
import { useState, useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
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

const MOOD_LOTTIE: Partial<Record<MoodState, string>> = {
  idle: '/lottie/penny-idle.json',
  happy: '/lottie/penny-happy.json',
  excited: '/lottie/penny-excited.json',
  sad: '/lottie/penny-sad.json',
  celebrating: '/lottie/penny-celebrating.json',
  worried: '/lottie/penny-worried.json',
  proud: '/lottie/penny-proud.json',
  neutral: '/lottie/penny-neutral.json',
  thinking: '/lottie/penny-thinking.json',
  disappointed: '/lottie/penny-disappointed.json',
}

const MOOD_EMOJI: Record<MoodState, string> = {
  idle: '🐷', happy: '🐷', excited: '🐷', sad: '🐷', celebrating: '🐷',
  worried: '🐷', proud: '🐷', neutral: '🐷', thinking: '🐷', disappointed: '🐷',
}

function PennyAvatarLottie({ mood, px, fontSize }: { mood: MoodState; px: number; fontSize: number }) {
  const [failed, setFailed] = useState(false)
  const [animData, setAnimData] = useState<object | null>(null)

  useEffect(() => {
    setFailed(false)
    setAnimData(null)
    const path = MOOD_LOTTIE[mood]
    if (!path) { setFailed(true); return }
    fetch(path)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setAnimData)
      .catch(() => setFailed(true))
  }, [mood])

  if (failed || !animData) {
    return <span style={{ fontSize, lineHeight: 1 }}>{MOOD_EMOJI[mood]}</span>
  }
  return <Lottie animationData={animData} style={{ width: px, height: px }} loop autoplay />
}

export function PennyAvatar({ size = 'md', mood = 'idle', 'aria-label': ariaLabel = 'Penny, your saving buddy' }: Props) {
  const reducedMotion = useReducedMotion()
  const px = SIZE_PX[size]
  const fontSize = Math.round(px * 0.6)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: px, height: px, fontSize }}
      className="relative flex items-center justify-center rounded-full"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      {reducedMotion ? (
        <span style={{ fontSize, lineHeight: 1 }}>{MOOD_EMOJI[mood]}</span>
      ) : (
        <PennyAvatarLottie mood={mood} px={px} fontSize={fontSize} />
      )}
    </div>
  )
}
