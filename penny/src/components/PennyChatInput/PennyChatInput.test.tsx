import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PennyChatInput } from './PennyChatInput'

const mockLogTransaction = vi.fn()

vi.mock('../../features/transactions', () => ({
  useTransactionLog: vi.fn(() => ({ logTransaction: mockLogTransaction, isLogging: false })),
}))

vi.mock('../../lib/nlp', () => ({
  parseTransaction: vi.fn((input: string) => {
    if (input.includes('$') || /\d/.test(input)) {
      return { amount: 6, category: 'Drinks', emoji: '🧋', confidence: 0.9 }
    }

    return { amount: null, category: 'Other', emoji: '➕', confidence: 0 }
  }),
}))

import { useTransactionLog } from '../../features/transactions'

const mockUseTransactionLog = vi.mocked(useTransactionLog)

vi.mock('@radix-ui/react-dialog', async () => {
  const actual = await vi.importActual<typeof import('@radix-ui/react-dialog')>('@radix-ui/react-dialog')
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function renderChat(open = true, onOpenChange = vi.fn()) {
  return { onOpenChange, ...render(<PennyChatInput open={open} onOpenChange={onOpenChange} />) }
}

describe('PennyChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseTransactionLog.mockReturnValue({ logTransaction: mockLogTransaction, isLogging: false })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with correct aria-label when open', () => {
    renderChat()
    expect(screen.getByLabelText('Tell Penny what you spent')).toBeTruthy()
  })

  it('confirm button is disabled when no amount parsed', () => {
    renderChat()
    expect(screen.getByRole('button', { name: /confirm transaction/i })).toBeDisabled()
  })

  it('shows parse preview after typing "bubble tea $6"', async () => {
    renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: 'bubble tea $6' } })
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByText(/Drinks/)).toBeTruthy()
  })

  it('confirm button enabled after valid input', async () => {
    renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: '$10' } })
    expect(screen.getByRole('button', { name: /confirm transaction/i })).not.toBeDisabled()
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByRole('button', { name: /confirm transaction/i })).not.toBeDisabled()
  })

  it('confirm button enables immediately before debounced preview updates', () => {
    renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: 'bubble tea $6' } })
    expect(screen.getByRole('button', { name: /confirm transaction/i })).not.toBeDisabled()
  })

  it('calls onOpenChange(false) on confirm', async () => {
    const { onOpenChange } = renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: '$10' } })
    await act(async () => { vi.runAllTimers() })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirm transaction/i }))
    })
    expect(mockLogTransaction).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('Enter key triggers confirmation', async () => {
    const { onOpenChange } = renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: '$10' } })
    await act(async () => { vi.runAllTimers() })
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' })
    })
    expect(mockLogTransaction).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables confirmation while a log is already in progress', () => {
    mockUseTransactionLog.mockReturnValue({ logTransaction: mockLogTransaction, isLogging: true })
    renderChat()
    const input = screen.getByLabelText('Tell Penny what you spent')
    fireEvent.change(input, { target: { value: '$10' } })
    const button = screen.getByRole('button', { name: /confirm transaction/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Logging...')
  })

  it('does not render input when closed', () => {
    renderChat(false)
    expect(screen.queryByLabelText('Tell Penny what you spent')).toBeNull()
  })
})
