import { Request, Response } from 'express'
import { CreateTransaction } from '../../application/use-cases/CreateTransaction'

export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransaction
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
}
