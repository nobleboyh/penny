export type GoalCategory = 'tech' | 'fashion' | 'travel' | 'food' | 'other'

export interface GoalSetupData {
  goalName: string
  goalAmount: number
  targetDate: string
  category: GoalCategory
}

export interface AccountItem {
  title: string
  amount: number
  currency: string
  period: string
  icon: string
}

export interface AccountResponse {
  name: string
  incomes: AccountItem[]
  expenses: AccountItem[]
  saving: { amount: number; currency: string; interest: number; deposit: boolean; capitalization: boolean }
  note: string
  lastSeen: string
}
