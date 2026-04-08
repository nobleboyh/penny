import Dexie, { type EntityTable } from 'dexie'

interface Transaction {
  id: number
  amount: number
  category: string
  emoji: string
  note?: string
  date: string      // ISO 8601 YYYY-MM-DD (local timezone)
  createdAt: string // ISO 8601 full timestamp
}

type NewTransaction = Omit<Transaction, 'id'>

interface PendingSync {
  id?: number
  transactionData: NewTransaction
  retryCount: number
  createdAt: string
}

interface FailedSync {
  id?: number
  transactionData: NewTransaction
  failedAt: string
  lastError: string
}

class PennyDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  pendingSync!: EntityTable<PendingSync, 'id'>
  failedSync!: EntityTable<FailedSync, 'id'>

  constructor() {
    super('penny-db')
    this.version(1).stores({
      transactions: '++id, date, category',
      pendingSync: '++id, createdAt',
      failedSync: '++id, failedAt',
    })
  }
}

export const db = new PennyDatabase()
export type { Transaction, NewTransaction, PendingSync, FailedSync }
