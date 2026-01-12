import { Transaction } from '../../domain/entities/Transaction'
import { TransactionRepository } from '../../domain/repositories/TransactionRepository'

export type CreateTransactionInput = {
  userId: string
  amount: number
  country: string
}

export class CreateTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const transaction = Transaction.create(input)

    await this.repository.save(transaction)

    return transaction
  }
}