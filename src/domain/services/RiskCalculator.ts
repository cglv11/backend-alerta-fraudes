import { Transaction } from '../entities/Transaction'
import {
  FraudAlert,
  FraudAlertSeverity,
  FraudAlertType,
} from '../entities/FraudAlert'

export class RiskCalculator {
  // Calculate overall risk score (0-100)
  static calculateRiskScore(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0

    let score = 0
    const alerts = this.detectAlerts(transactions)

    // Base score on number and severity of alerts
    alerts.forEach((alert) => {
      switch (alert.severity) {
        case 'CRITICAL':
          score += 30
          break
        case 'HIGH':
          score += 20
          break
        case 'MEDIUM':
          score += 10
          break
        case 'LOW':
          score += 5
          break
      }
    })

    // Cap at 100
    return Math.min(score, 100)
  }

  // Detect fraud alerts from transactions
  static detectAlerts(transactions: Transaction[]): FraudAlert[] {
    const alerts: FraudAlert[] = []

    // Sort by date (newest first)
    const sorted = [...transactions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    // Check for high frequency
    const highFreqAlert = this.checkHighFrequency(sorted)
    if (highFreqAlert) alerts.push(highFreqAlert)

    // Check for unusual country
    const unusualCountryAlert = this.checkUnusualCountry(sorted)
    if (unusualCountryAlert) alerts.push(unusualCountryAlert)

    // Check for amount spike
    const amountSpikeAlert = this.checkAmountSpike(sorted)
    if (amountSpikeAlert) alerts.push(amountSpikeAlert)

    // Check for unusual time
    const unusualTimeAlert = this.checkUnusualTime(sorted)
    if (unusualTimeAlert) alerts.push(unusualTimeAlert)

    return alerts
  }

  // Rule 1: High frequency (5+ transactions in 10 minutes)
  private static checkHighFrequency(
    transactions: Transaction[]
  ): FraudAlert | null {
    if (transactions.length < 5) return null

    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    const recentTransactions = transactions.filter(
      (tx) => tx.createdAt >= tenMinutesAgo
    )

    if (recentTransactions.length >= 5) {
      return FraudAlert.create({
        type: 'HIGH_FREQUENCY',
        severity: 'CRITICAL',
        message: `${recentTransactions.length} transactions in 10 minutes`,
        transactionIds: recentTransactions.map((tx) => tx.id),
        metadata: {
          count: recentTransactions.length,
          timeWindow: '10 minutes',
        },
      })
    }

    return null
  }

  // Rule 2: Unusual country (new country not seen in last 30 days)
  private static checkUnusualCountry(
    transactions: Transaction[]
  ): FraudAlert | null {
    if (transactions.length < 2) return null

    const latest = transactions[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const historicalCountries = new Set(
      transactions
        .filter((tx) => tx.createdAt < thirtyDaysAgo)
        .map((tx) => tx.country)
    )

    // If latest transaction is from a new country
    if (
      historicalCountries.size > 0 &&
      !historicalCountries.has(latest.country)
    ) {
      return FraudAlert.create({
        type: 'UNUSUAL_COUNTRY',
        severity: 'HIGH',
        message: `First transaction from ${latest.country}`,
        transactionIds: [latest.id],
        metadata: {
          newCountry: latest.country,
          historicalCountries: Array.from(historicalCountries),
        },
      })
    }

    return null
  }

  // Rule 3: Amount spike (transaction 300%+ above average)
  private static checkAmountSpike(
    transactions: Transaction[]
  ): FraudAlert | null {
    if (transactions.length < 5) return null

    const latest = transactions[0]
    const historical = transactions.slice(1) // Exclude latest

    const avgAmount =
      historical.reduce((sum, tx) => sum + tx.amount, 0) / historical.length

    const percentageIncrease = ((latest.amount - avgAmount) / avgAmount) * 100

    if (percentageIncrease >= 300) {
      return FraudAlert.create({
        type: 'AMOUNT_SPIKE',
        severity: 'HIGH',
        message: `Amount ${percentageIncrease.toFixed(0)}% above average`,
        transactionIds: [latest.id],
        metadata: {
          currentAmount: latest.amount,
          avgAmount: avgAmount.toFixed(2),
          percentageIncrease: percentageIncrease.toFixed(0),
        },
      })
    }

    return null
  }

  // Rule 4: Unusual time (transaction between 12 AM - 5 AM)
  private static checkUnusualTime(
    transactions: Transaction[]
  ): FraudAlert | null {
    if (transactions.length === 0) return null

    const latest = transactions[0]
    const hour = latest.createdAt.getHours()

    // Between midnight and 5 AM
    if (hour >= 0 && hour < 5) {
      const nightTransactions = transactions.filter((tx) => {
        const txHour = tx.createdAt.getHours()
        return txHour >= 0 && txHour < 5
      })

      // Only alert if this is unusual (not common for this user)
      const nightTransactionRatio =
        nightTransactions.length / transactions.length
      if (nightTransactionRatio < 0.2) {
        // Less than 20% of transactions are at night
        return FraudAlert.create({
          type: 'UNUSUAL_TIME',
          severity: 'MEDIUM',
          message: `Transaction at unusual hour: ${hour}:${latest.createdAt
            .getMinutes()
            .toString()
            .padStart(2, '0')}`,
          transactionIds: [latest.id],
          metadata: {
            hour,
            nightTransactionRatio: (nightTransactionRatio * 100).toFixed(1),
          },
        })
      }
    }

    return null
  }

  // Calculate behavioral statistics
  static calculateBehavioralStats(transactions: Transaction[]) {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const last24h = transactions.filter((tx) => tx.createdAt >= oneDayAgo)
    const last30d = transactions.filter((tx) => tx.createdAt >= thirtyDaysAgo)

    return {
      last24h: {
        transactionCount: last24h.length,
        totalAmount: last24h.reduce((sum, tx) => sum + tx.amount, 0),
        avgAmount:
          last24h.length > 0
            ? last24h.reduce((sum, tx) => sum + tx.amount, 0) / last24h.length
            : 0,
        countries: [...new Set(last24h.map((tx) => tx.country))],
      },
      last30d: {
        transactionCount: last30d.length,
        totalAmount: last30d.reduce((sum, tx) => sum + tx.amount, 0),
        avgAmount:
          last30d.length > 0
            ? last30d.reduce((sum, tx) => sum + tx.amount, 0) / last30d.length
            : 0,
        countries: [...new Set(last30d.map((tx) => tx.country))],
      },
    }
  }
}
