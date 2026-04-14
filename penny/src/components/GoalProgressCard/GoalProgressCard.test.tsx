import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoalProgressCard } from './GoalProgressCard'

vi.mock('../../features/goal', () => ({
  useCurrentAccount: vi.fn(),
  GoalSetupForm: () => <div data-testid="goal-setup-form" />,
}))
vi.mock('../../features/goal/hooks/useGoalProgress', () => ({
  useGoalProgress: vi.fn(),
}))
vi.mock('../../features/goal/hooks/useGoalCountdown', () => ({
  useGoalCountdown: vi.fn(),
}))
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))
vi.mock('../PennyAvatar', () => ({
  PennyAvatar: ({ mood, 'aria-label': ariaLabel }: { mood: string; 'aria-label'?: string }) => (
    <div role="img" aria-label={ariaLabel ?? 'Penny, your saving buddy'} data-mood={mood} />
  ),
}))

import { useCurrentAccount } from '../../features/goal'
import { useGoalProgress } from '../../features/goal/hooks/useGoalProgress'
import { useGoalCountdown } from '../../features/goal/hooks/useGoalCountdown'

const mockAccount = useCurrentAccount as ReturnType<typeof vi.fn>
const mockProgress = useGoalProgress as ReturnType<typeof vi.fn>
const mockCountdown = useGoalCountdown as ReturnType<typeof vi.fn>

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
    mockCountdown.mockReturnValue({ isCountdown: false, remainingAmount: null })
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

  it('renders "Set a goal" CTA when isJustSaving is true', () => {
    mockProgress.mockReturnValue({
      goalName: 'Just saving', goalEmoji: '💰', goalAmount: null,
      savedAmount: 42, progressPercent: null, weeklyTarget: null,
      isJustSaving: true, targetDate: null,
    })
    render(<GoalProgressCard />)
    expect(screen.getByRole('button', { name: /add a dream/i })).toBeInTheDocument()
  })

  it('tapping "Set a goal" CTA in just-saving mode opens GoalSetupForm', () => {
    mockProgress.mockReturnValue({
      goalName: 'Just saving', goalEmoji: '💰', goalAmount: null,
      savedAmount: 42, progressPercent: null, weeklyTarget: null,
      isJustSaving: true, targetDate: null,
    })
    render(<GoalProgressCard />)
    fireEvent.click(screen.getByRole('button', { name: /add a dream/i }))
    expect(screen.getByTestId('goal-setup-form')).toBeInTheDocument()
  })

  it('renders countdown message and PennyAvatar when isCountdown', () => {
    mockCountdown.mockReturnValue({ isCountdown: true, remainingAmount: 18 })
    render(<GoalProgressCard />)
    expect(screen.getByText(/you're \$18 away from airpods/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /penny is happy/i })).toBeInTheDocument()
  })

  it('renders PennyAvatar but no message when isCountdown and remainingAmount is null', () => {
    mockCountdown.mockReturnValue({ isCountdown: true, remainingAmount: null })
    render(<GoalProgressCard />)
    expect(screen.getByRole('img', { name: /penny is happy/i })).toBeInTheDocument()
    expect(screen.queryByText(/you're .* away from/i)).not.toBeInTheDocument()
  })

  it('does not render countdown message when isCountdown is false', () => {
    render(<GoalProgressCard />)
    expect(screen.queryByRole('img', { name: /penny/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/you're .* away from/i)).not.toBeInTheDocument()
  })
})
