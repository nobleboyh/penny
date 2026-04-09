import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { OnboardingFlow } from './features/auth'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding/goal" element={<OnboardingFlow />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

export default App
