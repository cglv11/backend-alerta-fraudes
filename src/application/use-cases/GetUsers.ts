import { TransactionRepository } from '../../domain/repositories/TransactionRepository'

export type User = {
  userId: string
  transactionCount: number
  lastTransactionDate: Date
}

// Make sure to EXPORT the class
export class GetUsers {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(): Promise<User[]> {
    // Get all transactions
    const allTransactions = await this.repository.findAll()

    // Group by userId
    const userMap = new Map<string, { count: number; lastDate: Date }>()

    allTransactions.forEach((transaction) => {
      const existing = userMap.get(transaction.userId)

      if (!existing) {
        userMap.set(transaction.userId, {
          count: 1,
          lastDate: transaction.createdAt,
        })
      } else {
        existing.count++
        if (transaction.createdAt > existing.lastDate) {
          existing.lastDate = transaction.createdAt
        }
      }
    })

    // Convert to array and sort by last transaction date (newest first)
    const users: User[] = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        transactionCount: data.count,
        lastTransactionDate: data.lastDate,
      }))
      .sort(
        (a, b) =>
          b.lastTransactionDate.getTime() - a.lastTransactionDate.getTime()
      )

    return users
  }
}
