import { Routes, Route } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { MyStuff } from './pages/MyStuff'
import { Journey } from './pages/Journey'
import { PennySays } from './pages/PennySays'
import { MyVibe } from './pages/MyVibe'
import { OnboardingFlow, AuthGuard } from './features/auth'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding/goal" element={<OnboardingFlow />} />
      <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
      <Route path="/stuff" element={<AuthGuard><MyStuff /></AuthGuard>} />
      <Route path="/journey" element={<AuthGuard><Journey /></AuthGuard>} />
      <Route path="/penny-says" element={<AuthGuard><PennySays /></AuthGuard>} />
      <Route path="/vibe" element={<AuthGuard><MyVibe /></AuthGuard>} />
      <Route path="*" element={<AuthGuard><Home /></AuthGuard>} />
    </Routes>
  )
}

export default App
