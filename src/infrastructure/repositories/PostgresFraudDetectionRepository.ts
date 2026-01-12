import { FraudDetectionRepository } from '../../domain/repositories/FraudDetectionRepository'
import { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import { UserRiskProfile } from '../../domain/entities/UserRiskProfile'
import { RiskCalculator } from '../../domain/services/RiskCalculator'

export class PostgresFraudDetectionRepository implements FraudDetectionRepository {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    // 1. Get all transactions for the user
    const transactions = await this.transactionRepository.findByUser(userId)

    if (transactions.length === 0) {
      // User has no transactions - zero risk
      return UserRiskProfile.create({
        userId,
        riskScore: 0,
        alerts: [],
        stats: {
          last24h: {
            transactionCount: 0,
            totalAmount: 0,
            avgAmount: 0,
            countries: [],
          },
          last30d: {
            transactionCount: 0,
            totalAmount: 0,
            avgAmount: 0,
            countries: [],
          },
        },
      })
    }

    // 2. Detect fraud alerts using domain service
    const alerts = RiskCalculator.detectAlerts(transactions)

    // 3. Calculate risk score
    const riskScore = RiskCalculator.calculateRiskScore(transactions)

    // 4. Calculate behavioral statistics
    const stats = RiskCalculator.calculateBehavioralStats(transactions)

    // 5. Create and return UserRiskProfile entity
    return UserRiskProfile.create({
      userId,
      riskScore,
      alerts,
      stats,
    })
  }
}
