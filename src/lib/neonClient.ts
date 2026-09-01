/** Client helpers for Neon-backed /api routes (Vercel serverless). */

export type ShopPayload = {
  products?: unknown
  orders?: unknown
  discounts?: unknown
  homepage?: unknown
  returns?: unknown
  waitlist?: unknown
  subscribers?: unknown
  audit?: unknown
  loyalty?: unknown
  staff?: unknown
  categories?: unknown
}

export async function fetchShopFromNeon(): Promise<
  (ShopPayload & { ok: boolean; neon?: boolean; message?: string }) | null
> {
  try {
    const res = await fetch('/api/shop')
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.ok || data.neon === false) return null
    return data
  } catch {
    return null
  }
}

export async function saveShopToNeon(
  payload: ShopPayload,
  adminPin: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch('/api/shop', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Pin': adminPin,
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.ok !== false, message: data.message }
  } catch {
    return { ok: false, message: 'Could not reach Neon API' }
  }
}

export async function postOrderToNeon(
  order: unknown,
  discounts?: unknown,
  loyaltyAccount?: unknown,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, discounts, loyaltyAccount }),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.ok !== false, message: data.message }
  } catch {
    return { ok: false, message: 'Could not sync order to Neon' }
  }
}

export async function neonHealth(): Promise<{ neon: boolean; message?: string }> {
  try {
    const res = await fetch('/api/health')
    const data = await res.json()
    return { neon: Boolean(data.neon), message: data.message }
  } catch {
    return { neon: false, message: 'API unreachable' }
  }
}

export const CLIENT_ADMIN_PIN = 'itunes2026'
