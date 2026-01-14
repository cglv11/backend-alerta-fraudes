import { Request, Response } from 'express'
import { CreateTransaction } from '../../application/use-cases/CreateTransaction'
import { GetUsers } from '../../application/use-cases/GetUsers'

export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransaction,
    private readonly getUsersUseCase: GetUsers // Renamed to avoid conflict
  ) {}

  async create(req: Request, res: Response) {
    try {
      const transaction = await this.createTransaction.execute({
        userId: req.body.userId,
        amount: req.body.amount,
        country: req.body.country,
      })

      return res.status(201).json({
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        country: transaction.country,
        createdAt: transaction.createdAt,
      })
    } catch (error) {
      return res.status(400).json({
        error: (error as Error).message,
      })
    }
  }

  // Get all users
  async getUsers(req: Request, res: Response) {
    try {
      const users = await this.getUsersUseCase.execute() // Use renamed property

      return res.status(200).json({
        users: users.map((user) => ({
          userId: user.userId,
          transactionCount: user.transactionCount,
          lastTransactionDate: user.lastTransactionDate,
        })),
      })
    } catch (error) {
      return res.status(400).json({
        error: (error as Error).message,
      })
    }
  }
}
