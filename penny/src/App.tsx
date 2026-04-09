import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      {/* /login stub — replaced by SocialLoginButtons in Story 2.2 */}
      <Route path="/login" element={<div className="flex min-h-screen items-center justify-center"><p className="text-foreground">🐷 Login coming soon…</p></div>} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

export default App
