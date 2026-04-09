import { useNavigate } from 'react-router-dom'
import { SocialLoginButtons } from '../features/auth'

export function Login() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 text-6xl" role="img" aria-label="Penny the pig">🐷</span>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Let's get started</h1>
      <p className="mb-10 text-muted-foreground">Sign in to save with Penny</p>
      <SocialLoginButtons
        onSuccess={(_token, isNewUser) => navigate(isNewUser ? '/onboarding/goal' : '/home')}
        onError={() => {/* error shown inline in SocialLoginButtons */}}
      />
    </main>
  )
}
