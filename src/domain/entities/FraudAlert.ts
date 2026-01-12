export type FraudAlertType =
  | 'HIGH_FREQUENCY'
  | 'UNUSUAL_COUNTRY'
  | 'AMOUNT_SPIKE'
  | 'UNUSUAL_TIME'

export type FraudAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type FraudAlertProps = {
  type: FraudAlertType
  severity: FraudAlertSeverity
  message: string
  transactionIds: string[]
  detectedAt: Date
  metadata?: Record<string, any>
}

export class FraudAlert {
  private constructor(private readonly props: FraudAlertProps) {}

  // Factory method
  static create(input: {
    type: FraudAlertType
    severity: FraudAlertSeverity
    message: string
    transactionIds: string[]
    metadata?: Record<string, any>
  }): FraudAlert {
    if (!input.message || input.message.trim() === '') {
      throw new Error('Alert message cannot be empty')
    }

    if (!input.transactionIds || input.transactionIds.length === 0) {
      throw new Error('Alert must reference at least one transaction')
    }

    return new FraudAlert({
      type: input.type,
      severity: input.severity,
      message: input.message,
      transactionIds: input.transactionIds,
      detectedAt: new Date(),
      metadata: input.metadata,
    })
  }

  // Re-hydration from persistence
  static fromPrimitives(props: FraudAlertProps): FraudAlert {
    return new FraudAlert(props)
  }

  // Getters (read-only)
  get type() {
    return this.props.type
  }

  get severity() {
    return this.props.severity
  }

  get message() {
    return this.props.message
  }

  get transactionIds() {
    return this.props.transactionIds
  }

  get detectedAt() {
    return this.props.detectedAt
  }

  get metadata() {
    return this.props.metadata
  }

  // Helper to check if alert is critical
  isCritical(): boolean {
    return this.severity === 'CRITICAL'
  }
}
