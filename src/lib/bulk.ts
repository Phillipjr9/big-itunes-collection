import { loadJSON } from '@/lib/persist'
import type { CartItem, Product, ProductPackageDeal } from './types'

export const DEFAULT_WHOLESALE_PERCENT = 30

export function lineChargeForProduct(
  unitPrice: number,
  quantity: number,
  deals?: ProductPackageDeal[] | null,
): {
  charge: number
  retail: number
  savings: number
  label: string | null
  nextHint: string | null
} {
  const retail = unitPrice * quantity
  const list = (deals ?? [])
    .filter((d) => d.units > 0 && d.packagePrice >= 0)
    .sort((a, b) => b.units - a.units)

  if (!list.length || quantity < 1) {
    return { charge: retail, retail, savings: 0, label: null, nextHint: null }
  }

  let remaining = quantity
  let packageCash = 0
  const used: string[] = []

  for (const deal of list) {
    while (remaining >= deal.units) {
      remaining -= deal.units
      packageCash += deal.packagePrice
      used.push(`${deal.units} pcs · ₦${deal.packagePrice.toLocaleString('en-NG')}`)
    }
  }

  const charge = packageCash + unitPrice * remaining
  const savings = Math.max(0, retail - charge)

  let label: string | null = null
  if (used.length) {
    label = used.join(' + ')
    if (remaining > 0) label += ` + ${remaining} single`
  }

  let nextHint: string | null = null
  for (const deal of [...list].sort((a, b) => a.units - b.units)) {
    if (quantity < deal.units) {
      nextHint = `Add ${deal.units - quantity} more of this piece for ${deal.units} pcs · ₦${deal.packagePrice.toLocaleString('en-NG')}`
      break
    }
  }

  return { charge, retail, savings, label, nextHint }
}

export type BulkResult = {
  amount: number
  label: string | null
  nextHint: string | null
  percent: number
  packageSubtotal: number
}

export function bulkDiscountForCart(
  lines: { product: Product; quantity: number }[],
): BulkResult {
  const byId = new Map<number, { product: Product; quantity: number }>()
  for (const line of lines) {
    const prev = byId.get(line.product.id)
    if (prev) prev.quantity += line.quantity
    else byId.set(line.product.id, { product: line.product, quantity: line.quantity })
  }

  let retail = 0
  let charge = 0
  const labels: string[] = []
  let nextHint: string | null = null

  for (const { product, quantity } of byId.values()) {
    const line = lineChargeForProduct(product.price, quantity, product.packageDeals)
    retail += line.retail
    charge += line.charge
    if (line.label) labels.push(`${product.name}: ${line.label}`)
    if (!nextHint && line.nextHint) nextHint = line.nextHint
  }

  const amount = Math.max(0, retail - charge)
  return {
    amount,
    label: labels.length ? labels.join(' · ') : null,
    nextHint,
    percent: retail > 0 ? Math.round((amount / retail) * 100) : 0,
    packageSubtotal: charge,
  }
}

/**
 * ShopContext calls this with cart totals. We resolve per-product packages from
 * the saved cart + products (each cloth’s own packageDeals).
 */
export function bulkDiscountForUnits(units: number, subtotal: number): BulkResult {
  if (typeof window === 'undefined' || units < 1) {
    return {
      amount: 0,
      label: null,
      nextHint: null,
      percent: 0,
      packageSubtotal: subtotal,
    }
  }
  const cart = loadJSON<CartItem[]>('cart', [])
  const products = loadJSON<Product[]>('products', [])
  if (!cart.length || !products.length) {
    return {
      amount: 0,
      label: null,
      nextHint: null,
      percent: 0,
      packageSubtotal: subtotal,
    }
  }
  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter(Boolean) as { product: Product; quantity: number }[]
  return bulkDiscountForCart(lines)
}

export const BULK_TIERS: { minUnits: number; packagePrice: number; label: string }[] = []

export function wholesaleUnitPrice(retail: number, percentOff: number): number {
  const p = Math.min(90, Math.max(0, percentOff))
  return Math.round(retail * (1 - p / 100))
}

export function formatPackageDeals(deals?: ProductPackageDeal[] | null): string {
  if (!deals?.length) return ''
  return deals
    .slice()
    .sort((a, b) => a.units - b.units)
    .map((d) => `${d.units} pcs · ₦${d.packagePrice.toLocaleString('en-NG')}`)
    .join(' · ')
}

/** No site-wide package slogan */
export function packageDealsTagline(): string {
  return ''
}
