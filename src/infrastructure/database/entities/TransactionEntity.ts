import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column()
  userId!: string

  @Column('decimal')
  amount!: number

  @Column()
  country!: string

  @Column({ type: 'timestamp' })
  createdAt!: Date
}
