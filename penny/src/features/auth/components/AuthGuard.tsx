import { Navigate } from 'react-router-dom'
import { useAuthGuard } from '../hooks/useAuthGuard'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const status = useAuthGuard()

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-bounce" role="img" aria-label="Loading">🐷</span>
      </main>
    )
  }
  if (status === 'expired') return <Navigate to="/login" replace />
  if (status === 'unauthenticated') return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
