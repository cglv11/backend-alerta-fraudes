import { Router } from 'express'
import { FraudDetectionController } from '../controllers/FraudDetectionController'

export function fraudDetectionRoutes(controller: FraudDetectionController) {
  const router = Router()

  router.get('/users/:userId/risk-profile', (req, res) =>
    controller.getRiskProfile(req, res)
  )

  return router
}
