export interface NlpResult {
  amount: number | null
  category: string
  emoji: string
  confidence: number
}

export interface TransactionEntry {
  amount: number
  category: string
  emoji: string
  note?: string
  date: string
}
