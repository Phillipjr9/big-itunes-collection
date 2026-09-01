import type { DiscountCode } from './types'

export const SEED_DISCOUNTS: DiscountCode[] = [
  { code: 'LAGOS10', percent: 10, active: true, usedCount: 0, minSubtotal: 30000 },
  { code: 'WELCOME5', percent: 5, active: true, usedCount: 0 },
  { code: 'BIGITUNES15', percent: 15, active: true, usedCount: 0, minSubtotal: 50000, maxUses: 100 },
]

export function applyDiscount(
  subtotal: number,
  code: DiscountCode | undefined,
): { discount: number; error?: string } {
  if (!code) return { discount: 0 }
  if (!code.active) return { discount: 0, error: 'This code is no longer active.' }
  if (code.maxUses != null && code.usedCount >= code.maxUses) {
    return { discount: 0, error: 'This code has reached its limit.' }
  }
  if (code.minSubtotal != null && subtotal < code.minSubtotal) {
    return {
      discount: 0,
      error: `Minimum order ₦${code.minSubtotal.toLocaleString('en-NG')} required for this code.`,
    }
  }
  const discount = Math.round((subtotal * code.percent) / 100)
  return { discount }
}
