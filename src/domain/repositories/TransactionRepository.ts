import { Transaction } from '../entities/Transaction'

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>

  findByUser(userId: string): Promise<Transaction[]>
}