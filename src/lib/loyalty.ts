/** Loyalty: earn points when you shop; redeem later at checkout. */

/** 1 point for every ₦100 spent on items (after discounts, before delivery). */
export const NAIRA_PER_POINT_EARNED = 100

/** When redeeming, 1 point = ₦10 off (10% back relative to earn rate). */
export const NAIRA_PER_POINT_REDEEM = 10

/** Minimum points to redeem in one order */
export const MIN_REDEEM_POINTS = 50

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)
  return digits
}

export function pointsFromSpend(amountNaira: number): number {
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) return 0
  return Math.floor(amountNaira / NAIRA_PER_POINT_EARNED)
}

export function nairaFromPoints(points: number): number {
  if (!Number.isFinite(points) || points <= 0) return 0
  return Math.floor(points) * NAIRA_PER_POINT_REDEEM
}

export function pointsNeededForNaira(naira: number): number {
  if (naira <= 0) return 0
  return Math.ceil(naira / NAIRA_PER_POINT_REDEEM)
}

export type LoyaltyTier = 'Member' | 'Silver' | 'Gold' | 'Pearl'

export function tierFromLifetimePoints(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 5000) return 'Pearl'
  if (lifetimePoints >= 2000) return 'Gold'
  if (lifetimePoints >= 500) return 'Silver'
  return 'Member'
}

export function loyaltyCopy() {
  return {
    earn: `Earn 1 point for every ₦${NAIRA_PER_POINT_EARNED.toLocaleString('en-NG')} you spend on pieces.`,
    redeem: `Redeem from ${MIN_REDEEM_POINTS} points — each point is ₦${NAIRA_PER_POINT_REDEEM} off your next order.`,
  }
}
