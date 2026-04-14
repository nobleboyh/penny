import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoalCompletionCelebration } from './GoalCompletionCelebration'

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn(() => vi.fn()) }))
vi.mock('../../../hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))
vi.mock('../hooks/useGoalProgress', () => ({ useGoalProgress: vi.fn() }))
vi.mock('../hooks/useGoalCompletion', () => ({ useGoalCompletion: vi.fn() }))
vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn((selector: (s: { resetGoal: () => void }) => unknown) =>
    (selector as (s: object) => unknown)({ resetGoal: vi.fn() })
  ),
}))
vi.mock('../../../components/PennyAvatar', () => ({
  PennyAvatar: ({ mood, 'aria-label': ariaLabel }: { mood: string; 'aria-label'?: string }) => (
    <div role="img" aria-label={ariaLabel ?? 'Penny'} data-mood={mood} />
  ),
}))

import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useGoalProgress } from '../hooks/useGoalProgress'
import { useGoalCompletion } from '../hooks/useGoalCompletion'
import { useGoalStore } from '../../../store/goalStore'

const mockNavigate = vi.fn()
const mockReducedMotion = vi.mocked(useReducedMotion)
const mockProgress = vi.mocked(useGoalProgress)
const mockCompletion = vi.mocked(useGoalCompletion)
const mockGoalStore = vi.mocked(useGoalStore)

describe('GoalCompletionCelebration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    mockReducedMotion.mockReturnValue(false)
    mockProgress.mockReturnValue({ goalName: 'AirPods', savedAmount: 249, goalAmount: 249 } as unknown as ReturnType<typeof useGoalProgress>)
    mockCompletion.mockReturnValue({ isComplete: true, daysTaken: 30 })
    mockGoalStore.mockImplementation((selector: unknown) =>
      (selector as (s: object) => unknown)({ resetGoal: vi.fn() })
    )
  })

  it('renders overlay with goal name, saved amount, and days taken', () => {
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    expect(screen.getByText(/airpods — achieved/i)).toBeInTheDocument()
    expect(screen.getByText(/\$249 saved/i)).toBeInTheDocument()
    expect(screen.getByText(/30 days/i)).toBeInTheDocument()
  })

  it('dismiss CTA not visible before 2s', () => {
    vi.useFakeTimers()
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /woohoo/i })).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('dismiss CTA visible after 2s', () => {
    vi.useFakeTimers()
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByRole('button', { name: /woohoo/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('re-engagement screen shows after clicking dismiss CTA', () => {
    vi.useFakeTimers()
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(2000) })
    fireEvent.click(screen.getByRole('button', { name: /woohoo/i }))
    expect(screen.getByText(/ready for your next goal/i)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('"New Dream" calls resetGoal and navigates to /onboarding/goal', () => {
    const mockReset = vi.fn()
    mockGoalStore.mockImplementation((selector: unknown) =>
      (selector as (s: object) => unknown)({ resetGoal: mockReset })
    )
    vi.useFakeTimers()
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(2000) })
    fireEvent.click(screen.getByRole('button', { name: /woohoo/i }))
    fireEvent.click(screen.getByRole('button', { name: /new dream/i }))
    expect(mockReset).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/goal')
    vi.useRealTimers()
  })

  it('"Not yet" calls onDismiss', () => {
    const onDismiss = vi.fn()
    vi.useFakeTimers()
    render(<GoalCompletionCelebration onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(2000) })
    fireEvent.click(screen.getByRole('button', { name: /woohoo/i }))
    fireEvent.click(screen.getByRole('button', { name: /not yet/i }))
    expect(onDismiss).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('reduced motion: dismiss CTA visible immediately', () => {
    mockReducedMotion.mockReturnValue(true)
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    expect(screen.getByRole('button', { name: /woohoo/i })).toBeInTheDocument()
  })

  it('omits days taken when daysTaken is null', () => {
    mockCompletion.mockReturnValue({ isComplete: true, daysTaken: null })
    mockReducedMotion.mockReturnValue(true)
    render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
    expect(screen.queryByText(/days/i)).not.toBeInTheDocument()
  })
})
