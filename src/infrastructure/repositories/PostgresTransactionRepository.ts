import { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import { Transaction } from '../../domain/entities/Transaction'
import { AppDataSource } from '../database/data-source'
import { TransactionEntity } from '../database/entities/TransactionEntity'

export class PostgresTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    const repo = AppDataSource.getRepository(TransactionEntity)

    const entity = repo.create({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      country: transaction.country,
      createdAt: transaction.createdAt,
    })

    await repo.save(entity)
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    const repo = AppDataSource.getRepository(TransactionEntity)

    const records = await repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })

    return records.map((record) =>
      Transaction.fromPrimitives({
        id: record.id,
        userId: record.userId,
        amount: Number(record.amount),
        country: record.country,
        createdAt: record.createdAt,
      })
    )
  }

  // New method
  async findAll(): Promise<Transaction[]> {
    const repo = AppDataSource.getRepository(TransactionEntity)

    const records = await repo.find({
      order: { createdAt: 'DESC' },
    })

    return records.map((record) =>
      Transaction.fromPrimitives({
        id: record.id,
        userId: record.userId,
        amount: Number(record.amount),
        country: record.country,
        createdAt: record.createdAt,
      })
    )
  }
}
