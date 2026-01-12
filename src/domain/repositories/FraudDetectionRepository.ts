import { UserRiskProfile } from '../entities/UserRiskProfile'

export interface FraudDetectionRepository {
  getUserRiskProfile(userId: string): Promise<UserRiskProfile>
}
