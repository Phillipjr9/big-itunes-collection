import { deliveryFeeForState, FREE_DELIVERY_THRESHOLD } from '@/lib/delivery'
import { totalStock } from '@/lib/catalog'
import type { Order, Product } from '@/lib/types'

/** Rough courier ETA in working days by state */
export function deliveryEtaDays(state: string): { min: number; max: number } {
  if (state === 'Lagos') return { min: 1, max: 3 }
  if (state === 'Ogun' || state === 'Oyo') return { min: 2, max: 4 }
  if (state === 'FCT Abuja' || state === 'Rivers' || state === 'Delta' || state === 'Edo')
    return { min: 3, max: 5 }
  return { min: 3, max: 7 }
}

export function formatDeliveryWindow(state: string): string {
  const { min, max } = deliveryEtaDays(state)
  const start = addWorkingDays(new Date(), min)
  const end = addWorkingDays(new Date(), max)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })
  if (min === max) return `Arrives ${fmt(start)}`
  return `Arrives ${fmt(start)} – ${fmt(end)}`
}

function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) left--
  }
  return d
}

export function deliverySummaryLine(state: string, subtotalHint = 50000): string {
  const fee = deliveryFeeForState(state, subtotalHint)
  const eta = formatDeliveryWindow(state)
  if (fee === 0) return `${eta} · Free delivery`
  return `${eta} · From ₦${fee.toLocaleString('en-NG')} (free over ₦${FREE_DELIVERY_THRESHOLD.toLocaleString('en-NG')})`
}

/** Related: same category first, then similar price */
export function relatedProducts(
  product: Product,
  catalog: Product[],
  limit = 4,
): Product[] {
  const others = catalog.filter((p) => p.id !== product.id && p.active)
  const sameCat = others.filter((p) => p.category === product.category)
  const rest = others
    .filter((p) => p.category !== product.category)
    .sort(
      (a, b) =>
        Math.abs(a.price - product.price) - Math.abs(b.price - product.price),
    )
  return [...sameCat, ...rest].slice(0, limit)
}

/** Units sold from order history (honest social proof) */
export function unitsSold(productId: number, orders: Order[]): number {
  return orders.reduce((sum, o) => {
    if (o.status === 'cancelled') return sum
    return (
      sum +
      o.items
        .filter((i) => i.productId === productId)
        .reduce((s, i) => s + i.quantity, 0)
    )
  }, 0)
}

export function scarcityLabel(product: Product, size?: string): string | null {
  if (size) {
    const n = product.stock[size] ?? 0
    if (n <= 0) return 'Out of stock'
    if (n <= 3) return `Only ${n} left in ${size}`
    if (n <= product.reorderPoint) return `Low stock in ${size}`
    return null
  }
  const total = totalStock(product)
  if (total <= 0) return 'Out of stock'
  if (total <= product.reorderPoint) return `Only ${total} left across sizes`
  return null
}
