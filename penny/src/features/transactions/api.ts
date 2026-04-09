import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

interface StatisticsPayload {
  incomes: Array<{ title: string; amount: number; currency: string; period: string }>
  expenses: Array<{ title: string; amount: number; currency: string; period: string }>
  saving: { amount: number; currency: string; interest: number; deposit: boolean; capitalization: boolean }
}

export function useUpdateStatistics(accountName: string) {
  return useMutation({
    mutationFn: (data: StatisticsPayload) =>
      apiClient.put(`/statistics/${accountName}`, data),
  })
}
