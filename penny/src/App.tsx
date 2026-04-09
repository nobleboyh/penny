import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { MyStuff } from './pages/MyStuff'
import { Journey } from './pages/Journey'
import { PennySays } from './pages/PennySays'
import { MyVibe } from './pages/MyVibe'
import { OnboardingFlow } from './features/auth'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding/goal" element={<OnboardingFlow />} />
      <Route path="/home" element={<Home />} />
      <Route path="/stuff" element={<MyStuff />} />
      <Route path="/journey" element={<Journey />} />
      <Route path="/penny-says" element={<PennySays />} />
      <Route path="/vibe" element={<MyVibe />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

export default App
