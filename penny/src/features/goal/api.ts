import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import type { AccountResponse } from './types'

interface UpdateAccountPayload {
  incomes: []
  expenses: []
  saving: { amount: number; currency: string; interest: number; deposit: boolean; capitalization: boolean }
  note: string
}

export function useUpdateAccount() {
  return useMutation({
    mutationFn: (data: UpdateAccountPayload) =>
      apiClient.put('/accounts/current', data),
  })
}

export function useCurrentAccount() {
  return useQuery({
    queryKey: ['accounts', 'current'],
    queryFn: () => apiClient.get<AccountResponse>('/accounts/current').then(r => r.data),
  })
}
