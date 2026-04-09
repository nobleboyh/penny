import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

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
