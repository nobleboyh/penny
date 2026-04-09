import { useNavigate } from 'react-router-dom'
import { AgeGate } from '../features/auth'

export function Onboarding() {
  const navigate = useNavigate()
  // Story 2.2 will replace this navigate with the social login screen
  return <AgeGate onConfirmed={() => navigate('/login')} />
}
