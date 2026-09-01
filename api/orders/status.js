import { ensureSchema, getDatabaseUrl, handleOptions, json, kvGet, sql } from '../_db.js'

/**
 * Public poll endpoint — real-time order payment/status for confirmation page.
 * GET /api/orders/status?id=BIC-…
 * Returns limited fields only (no full address dump beyond city/state).
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, message: 'Method not allowed' })
  }

  if (!getDatabaseUrl()) {
    return json(res, 503, { ok: false, neon: false, message: 'DATABASE_URL not set' })
  }

  try {
    const url = new URL(req.url, 'http://localhost')
    const id = (url.searchParams.get('id') || '').trim()
    if (!id) {
      return json(res, 400, { ok: false, message: 'id required' })
    }

    const db = sql()
    await ensureSchema(db)
    const orders = (await kvGet(db, 'orders')) || []
    const order = orders.find((o) => o.id === id || o.id.toUpperCase() === id.toUpperCase())
    if (!order) {
      return json(res, 404, { ok: false, message: 'Order not found' })
    }

    return json(res, 200, {
      ok: true,
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus || 'unpaid',
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference || null,
      total: order.total,
      trackingNumber: order.trackingNumber || null,
      courier: order.courier || null,
      updatedHint: order.statusHistory?.slice(-1)?.[0]?.at || order.createdAt,
    })
  } catch (e) {
    console.error(e)
    return json(res, 500, { ok: false, message: e.message || 'Error' })
  }
}
