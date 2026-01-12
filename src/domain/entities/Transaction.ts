import { randomUUID } from 'crypto'

export type TransactionProps = {
  id: string
  userId: string
  amount: number
  country: string
  createdAt: Date
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  // Factory method
  static create(input: {
    userId: string
    amount: number
    country: string
  }): Transaction {
    if (input.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero')
    }

    if (!input.userId) {
      throw new Error('Transaction must have a userId')
    }

    return new Transaction({
      id: randomUUID(),
      userId: input.userId,
      amount: input.amount,
      country: input.country,
      createdAt: new Date(),
    })
  }

  // Re-hydration from persistence
  static fromPrimitives(props: TransactionProps): Transaction {
    return new Transaction(props)
  }

  // Getters (read-only)
  get id() {
    return this.props.id
  }

  get userId() {
    return this.props.userId
  }

  get amount() {
    return this.props.amount
  }

  get country() {
    return this.props.country
  }

  get createdAt() {
    return this.props.createdAt
  }
}
