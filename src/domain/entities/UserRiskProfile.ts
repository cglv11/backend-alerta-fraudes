import { FraudAlert } from './FraudAlert'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type BehavioralStats = {
  last24h: {
    transactionCount: number
    totalAmount: number
    avgAmount: number
    countries: string[]
  }
  last30d: {
    transactionCount: number
    totalAmount: number
    avgAmount: number
    countries: string[]
  }
}

export type UserRiskProfileProps = {
  userId: string
  riskScore: number // 0-100
  riskLevel: RiskLevel
  alerts: FraudAlert[]
  stats: BehavioralStats
  calculatedAt: Date
}

export class UserRiskProfile {
  private constructor(private readonly props: UserRiskProfileProps) {}

  // Factory method
  static create(input: {
    userId: string
    riskScore: number
    alerts: FraudAlert[]
    stats: BehavioralStats
  }): UserRiskProfile {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (input.riskScore < 0 || input.riskScore > 100) {
      throw new Error('Risk score must be between 0 and 100')
    }

    // Calculate risk level based on score
    const riskLevel = this.calculateRiskLevel(input.riskScore)

    return new UserRiskProfile({
      userId: input.userId,
      riskScore: input.riskScore,
      riskLevel,
      alerts: input.alerts,
      stats: input.stats,
      calculatedAt: new Date(),
    })
  }

  // Re-hydration from persistence
  static fromPrimitives(props: UserRiskProfileProps): UserRiskProfile {
    return new UserRiskProfile(props)
  }

  // Business logic: Calculate risk level from score
  private static calculateRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 25) return 'MEDIUM'
    return 'LOW'
  }

  // Getters (read-only)
  get userId() {
    return this.props.userId
  }

  get riskScore() {
    return this.props.riskScore
  }

  get riskLevel() {
    return this.props.riskLevel
  }

  get alerts() {
    return this.props.alerts
  }

  get stats() {
    return this.props.stats
  }

  get calculatedAt() {
    return this.props.calculatedAt
  }

  // Helper methods
  get activeAlertsCount(): number {
    return this.alerts.length
  }

  get criticalAlertsCount(): number {
    return this.alerts.filter((alert) => alert.isCritical()).length
  }

  hasAlerts(): boolean {
    return this.alerts.length > 0
  }

  isHighRisk(): boolean {
    return this.riskLevel === 'HIGH' || this.riskLevel === 'CRITICAL'
  }
}
