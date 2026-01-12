import express from 'express'
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { PostgresTransactionRepository } from './repositories/PostgresTransactionRepository'
import { CreateTransaction } from '../application/use-cases/CreateTransaction'
import { TransactionController } from '../interfaces/controllers/TransactionController'
import { transactionRoutes } from '../interfaces/routes/transaction.routes'

async function bootstrap() {
  await AppDataSource.initialize()

  const app = express()
  app.use(cors())
  app.use(express.json())

  // Infrastructure
  const transactionRepository =
    new PostgresTransactionRepository()

  // Use case
  const createTransaction =
    new CreateTransaction(transactionRepository)

  // Controller
  const transactionController =
    new TransactionController(createTransaction)

  // Routes
  app.use('/api', transactionRoutes(transactionController))

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

bootstrap()
