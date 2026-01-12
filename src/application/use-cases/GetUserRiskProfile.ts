import { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import { FraudDetectionRepository } from '../../domain/repositories/FraudDetectionRepository'
import { UserRiskProfile } from '../../domain/entities/UserRiskProfile'

export type GetUserRiskProfileInput = {
  userId: string
}

export class GetUserRiskProfile {
  constructor(
    private readonly fraudDetectionRepository: FraudDetectionRepository
  ) {}

  async execute(input: GetUserRiskProfileInput): Promise<UserRiskProfile> {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    // Delegate to repository (which will use TransactionRepository + RiskCalculator)
    const riskProfile = await this.fraudDetectionRepository.getUserRiskProfile(
      input.userId
    )

    return riskProfile
  }
}
