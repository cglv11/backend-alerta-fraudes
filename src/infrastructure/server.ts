import express from 'express'
import cors from 'cors'
import { AppDataSource } from './database/data-source'
import { PostgresTransactionRepository } from './repositories/PostgresTransactionRepository'
import { PostgresFraudDetectionRepository } from './repositories/PostgresFraudDetectionRepository'
import { CreateTransaction } from '../application/use-cases/CreateTransaction'
import { GetUserRiskProfile } from '../application/use-cases/GetUserRiskProfile'
import { TransactionController } from '../interfaces/controllers/TransactionController'
import { FraudDetectionController } from '../interfaces/controllers/FraudDetectionController'
import { transactionRoutes } from '../interfaces/routes/transaction.routes'
import { fraudDetectionRoutes } from '../interfaces/routes/fraud-detection.routes'

async function bootstrap() {
  await AppDataSource.initialize()

  const app = express()
  app.use(cors())
  app.use(express.json())

  // Infrastructure - Repositories
  const transactionRepository = new PostgresTransactionRepository()
  const fraudDetectionRepository = new PostgresFraudDetectionRepository(
    transactionRepository
  )

  // Use cases
  const createTransaction = new CreateTransaction(transactionRepository)
  const getUserRiskProfile = new GetUserRiskProfile(fraudDetectionRepository)

  // Controllers
  const transactionController = new TransactionController(createTransaction)
  const fraudDetectionController = new FraudDetectionController(
    getUserRiskProfile
  )

  // Routes
  app.use('/api', transactionRoutes(transactionController))
  app.use('/api', fraudDetectionRoutes(fraudDetectionController))

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

bootstrap()
