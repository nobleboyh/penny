export type GoalCategory = 'tech' | 'fashion' | 'travel' | 'food' | 'other'

export interface GoalSetupData {
  goalName: string
  goalAmount: number
  targetDate: string
  category: GoalCategory
}
