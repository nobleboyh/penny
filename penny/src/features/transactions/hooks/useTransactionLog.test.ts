import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTransactionLog } from './useTransactionLog'

const {
  mockTransactionsAdd,
  mockPendingSyncAdd,
  mockUpdateSavedAmount,
  mockUpdateLastLogDate,
  mockIncrementStreak,
} = vi.hoisted(() => ({
  mockTransactionsAdd: vi.fn(),
  mockPendingSyncAdd: vi.fn(),
  mockUpdateSavedAmount: vi.fn(),
  mockUpdateLastLogDate: vi.fn(),
  mockIncrementStreak: vi.fn(),
}))

vi.mock('../../../lib/db', () => ({
  db: {
    transactions: { add: mockTransactionsAdd },
    pendingSync: { add: mockPendingSyncAdd },
  },
}))

vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn((selector: (state: object) => unknown) =>
    selector({
      updateSavedAmount: mockUpdateSavedAmount,
    })
  ),
}))

vi.mock('../../../store/streakStore', () => ({
  useStreakStore: vi.fn((selector: (state: object) => unknown) =>
    selector({
      updateLastLogDate: mockUpdateLastLogDate,
      incrementStreak: mockIncrementStreak,
      lastLogDate: null,
    })
  ),
}))

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

describe('useTransactionLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes local transaction data and updates optimistic goal and streak state', async () => {
    mockTransactionsAdd.mockResolvedValue(1)
    mockPendingSyncAdd.mockResolvedValue(1)

    const { result } = renderHook(() => useTransactionLog())

    await act(async () => {
      await result.current.logTransaction({
        amount: 6,
        category: 'Drinks',
        emoji: '🧋',
        confidence: 0.9,
      })
    })

    expect(mockTransactionsAdd).toHaveBeenCalledTimes(1)
    expect(mockPendingSyncAdd).toHaveBeenCalledTimes(1)
    expect(mockUpdateSavedAmount).toHaveBeenCalledWith(6)
    expect(mockUpdateLastLogDate).toHaveBeenCalledTimes(1)
    expect(mockIncrementStreak).toHaveBeenCalledTimes(1)
  })

  it('prevents duplicate submissions while a transaction log is in flight', async () => {
    const deferred = createDeferred<number>()
    mockTransactionsAdd.mockReturnValue(deferred.promise)
    mockPendingSyncAdd.mockResolvedValue(1)

    const { result } = renderHook(() => useTransactionLog())

    let firstCall!: Promise<void>
    await act(async () => {
      firstCall = result.current.logTransaction({
        amount: 6,
        category: 'Drinks',
        emoji: '🧋',
        confidence: 0.9,
      })
    })

    expect(result.current.isLogging).toBe(true)

    await act(async () => {
      await result.current.logTransaction({
        amount: 6,
        category: 'Drinks',
        emoji: '🧋',
        confidence: 0.9,
      })
    })

    expect(mockTransactionsAdd).toHaveBeenCalledTimes(1)

    await act(async () => {
      deferred.resolve(1)
      await firstCall
    })

    expect(result.current.isLogging).toBe(false)
  })
})
