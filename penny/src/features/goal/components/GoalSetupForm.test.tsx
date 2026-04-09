import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoalSetupForm } from './GoalSetupForm'

const mockSetGoal = vi.fn()
const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn(() => ({ setGoal: mockSetGoal })),
}))

vi.mock('../api', () => ({
  useUpdateAccount: () => ({ mutateAsync: mockMutateAsync }),
}))

describe('GoalSetupForm', () => {
  const onComplete = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders category picker as first step', () => {
    render(<GoalSetupForm onComplete={onComplete} onCancel={onCancel} />)
    expect(screen.getByText(/what are you saving for/i)).toBeInTheDocument()
  })

  it('advances to amount input after category selection', () => {
    render(<GoalSetupForm onComplete={onComplete} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /save for tech/i }))
    expect(screen.getByText(/how much does it cost/i)).toBeInTheDocument()
  })

  it('advances to date picker after amount entry', () => {
    render(<GoalSetupForm onComplete={onComplete} onCancel={onCancel} />)
    // Step 1: pick category
    fireEvent.click(screen.getByRole('button', { name: /save for tech/i }))
    // Step 2: enter amount
    const input = screen.getByRole('textbox', { name: /goal amount/i })
    fireEvent.change(input, { target: { value: '249' } })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/when do you want it by/i)).toBeInTheDocument()
  })

  it('calls setGoal and onComplete after date selection', () => {
    render(<GoalSetupForm onComplete={onComplete} onCancel={onCancel} />)
    // Step 1
    fireEvent.click(screen.getByRole('button', { name: /save for tech/i }))
    // Step 2
    const input = screen.getByRole('textbox', { name: /goal amount/i })
    fireEvent.change(input, { target: { value: '249' } })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    // Step 3: pick a quick date option
    fireEvent.click(screen.getByRole('button', { name: /1 month/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(mockSetGoal).toHaveBeenCalledWith('Tech', '💻', 249, expect.any(String))
    expect(onComplete).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<GoalSetupForm onComplete={onComplete} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
