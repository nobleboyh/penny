import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoalProgressCard } from './GoalProgressCard'

vi.mock('../../features/goal', () => ({
  useCurrentAccount: vi.fn(),
}))
vi.mock('../../features/goal/hooks/useGoalProgress', () => ({
  useGoalProgress: vi.fn(),
}))
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

import { useCurrentAccount } from '../../features/goal'
import { useGoalProgress } from '../../features/goal/hooks/useGoalProgress'

const mockAccount = useCurrentAccount as ReturnType<typeof vi.fn>
const mockProgress = useGoalProgress as ReturnType<typeof vi.fn>

const defaultProgress = {
  goalName: 'AirPods',
  goalEmoji: '💻',
  goalAmount: 249,
  savedAmount: 87,
  progressPercent: 35,
  weeklyTarget: 20,
  isJustSaving: false,
  targetDate: '2026-06-01',
}

describe('GoalProgressCard', () => {
  beforeEach(() => {
    mockAccount.mockReturnValue({ isLoading: false, isError: false })
    mockProgress.mockReturnValue(defaultProgress)
  })

  it('renders goal name and progress bar when goal is set', () => {
    render(<GoalProgressCard />)
    expect(screen.getByText('AirPods')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders user goal emoji not hardcoded pig', () => {
    render(<GoalProgressCard />)
    expect(screen.getByText('💻')).toBeInTheDocument()
  })

  it('progress bar has correct aria-valuenow', () => {
    render(<GoalProgressCard />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '35')
  })

  it('just saving variant renders total saved without progress bar', () => {
    mockProgress.mockReturnValue({
      goalName: 'Just saving', goalEmoji: '💰', goalAmount: null,
      savedAmount: 42, progressPercent: null, weeklyTarget: null,
      isJustSaving: true, targetDate: null,
    })
    render(<GoalProgressCard />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByText('$42')).toBeInTheDocument()
  })

  it('renders skeleton when isLoading is true', () => {
    mockAccount.mockReturnValue({ isLoading: true, isError: false })
    const { container } = render(<GoalProgressCard />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders error state when isError is true', () => {
    mockAccount.mockReturnValue({ isLoading: false, isError: true })
    render(<GoalProgressCard />)
    expect(screen.getByText(/couldn't load goal data/i)).toBeInTheDocument()
  })

  it('tap expands to show detail view', () => {
    render(<GoalProgressCard />)
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(card)
    expect(card).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/target date/i)).toBeInTheDocument()
  })

  it('card has accessible aria-label', () => {
    render(<GoalProgressCard />)
    expect(screen.getByRole('button', { name: /airpods goal progress/i })).toBeInTheDocument()
  })
})
