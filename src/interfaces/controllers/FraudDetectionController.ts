import { Request, Response } from 'express'
import { GetUserRiskProfile } from '../../application/use-cases/GetUserRiskProfile'

export class FraudDetectionController {
  constructor(private readonly getUserRiskProfile: GetUserRiskProfile) {}

  async getRiskProfile(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId)
        ? req.params.userId[0]
        : req.params.userId

      const riskProfile = await this.getUserRiskProfile.execute({ userId })

      // Map to JSON response
      return res.status(200).json({
        userId: riskProfile.userId,
        riskScore: riskProfile.riskScore,
        riskLevel: riskProfile.riskLevel,
        activeAlertsCount: riskProfile.activeAlertsCount,
        criticalAlertsCount: riskProfile.criticalAlertsCount,
        alerts: riskProfile.alerts.map((alert) => ({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          transactionIds: alert.transactionIds,
          detectedAt: alert.detectedAt,
          metadata: alert.metadata,
        })),
        stats: riskProfile.stats,
        calculatedAt: riskProfile.calculatedAt,
      })
    } catch (error) {
      return res.status(400).json({
        error: (error as Error).message,
      })
    }
  }
}
