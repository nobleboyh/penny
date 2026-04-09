import { useState } from 'react'
import { useReducedMotion, motion, type Variants } from 'framer-motion'
import type { AgeGateStatus } from '../types'

interface AgeGateProps {
  onConfirmed: () => void
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function AgeGate({ onConfirmed }: AgeGateProps) {
  const [status, setStatus] = useState<AgeGateStatus>('pending')
  const prefersReduced = useReducedMotion()

  return (
    <motion.main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      initial={prefersReduced ? false : 'hidden'}
      animate="visible"
      variants={containerVariants}
    >
      <span className="mb-6 text-6xl" role="img" aria-label="Penny the pig">🐷</span>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome to Penny</h1>
      <p className="mb-10 text-muted-foreground">Your saving buddy 🎯</p>

      {status === 'blocked' ? (
        <div className="rounded-2xl border border-warning/30 bg-surface p-6 max-w-lg w-full">
          <p className="text-warning font-semibold text-lg mb-2">Come back soon! 🐷</p>
          <p className="text-muted-foreground text-sm">
            Penny is for savers 16 and up. Come back when you're ready!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-lg px-2">
          <p className="text-foreground font-semibold mb-2">How old are you?</p>
          <button
            className="w-full min-h-[56px] rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground text-lg transition-opacity hover:opacity-90 active:opacity-80"
            onClick={onConfirmed}
          >
            I'm 16 or older
          </button>
          <button
            className="w-full min-h-[56px] rounded-2xl border border-border bg-surface px-6 py-4 font-semibold text-muted-foreground text-lg transition-opacity hover:opacity-90 active:opacity-80"
            onClick={() => setStatus('blocked')}
          >
            I'm under 16
          </button>
        </div>
      )}
    </motion.main>
  )
}
