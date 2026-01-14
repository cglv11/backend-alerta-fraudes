import { Router } from 'express'
import { TransactionController } from '../controllers/TransactionController'

export function transactionRoutes(controller: TransactionController) {
  const router = Router()

  router.post('/transactions', (req, res) => controller.create(req, res))

  // New route
  router.get('/users', (req, res) => controller.getUsers(req, res))

  return router
}
