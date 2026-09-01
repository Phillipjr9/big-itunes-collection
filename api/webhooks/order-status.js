import {
  ensureSchema,
  getDatabaseUrl,
  getAdminPin,
  handleOptions,
  json,
  kvGet,
  kvSet,
  sql,
} from '../_db.js'

/**
 * Inbound order status webhook (automation / admin tools).
 * POST /api/webhooks/order-status
 * Headers: X-Webhook-Secret: same as WEBHOOK_SECRET or ADMIN_PIN
 * Body: { orderId, status?, paymentStatus?, note?, paymentReference? }
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, message: 'Method not allowed' })
  }

  const secret =
    req.headers['x-webhook-secret'] ||
    req.headers['X-Webhook-Secret'] ||
    req.headers['x-admin-pin']
  const expected = process.env.WEBHOOK_SECRET || getAdminPin()
  if (!secret || secret !== expected) {
    return json(res, 401, { ok: false, message: 'Unauthorized' })
  }

  if (!getDatabaseUrl()) {
    return json(res, 503, { ok: false, message: 'DATABASE_URL not set' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const orderId = body.orderId || body.order_id
    if (!orderId) {
      return json(res, 400, { ok: false, message: 'orderId required' })
    }

    const db = sql()
    await ensureSchema(db)
    const orders = (await kvGet(db, 'orders')) || []
    const idx = orders.findIndex((o) => o.id === orderId || o.id.toUpperCase() === String(orderId).toUpperCase())
    if (idx < 0) {
      return json(res, 404, { ok: false, message: 'Order not found' })
    }

    const now = new Date().toISOString()
    const prev = orders[idx]
    const next = { ...prev }

    if (body.status) {
      next.status = body.status
      next.statusHistory = [
        ...(prev.statusHistory || []),
        { status: body.status, at: now, note: body.note || 'Webhook status update' },
      ]
      if (body.status === 'shipped') next.shippedAt = now
    }
    if (body.paymentStatus) next.paymentStatus = body.paymentStatus
    if (body.paymentReference) next.paymentReference = body.paymentReference
    if (body.courier) next.courier = body.courier
    if (body.trackingNumber) next.trackingNumber = body.trackingNumber
    if (body.trackingUrl) next.trackingUrl = body.trackingUrl

    const nextOrders = [...orders]
    nextOrders[idx] = next
    await kvSet(db, 'orders', nextOrders)

    const hook = process.env.ORDER_STATUS_WEBHOOK_URL
    if (hook) {
      try {
        await fetch(hook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'order-status-webhook',
            orderId: next.id,
            status: next.status,
            paymentStatus: next.paymentStatus,
            at: now,
          }),
        })
      } catch (_) {
        /* ignore fan-out errors */
      }
    }

    return json(res, 200, {
      ok: true,
      orderId: next.id,
      status: next.status,
      paymentStatus: next.paymentStatus,
    })
  } catch (e) {
    console.error(e)
    return json(res, 500, { ok: false, message: e.message || 'Webhook error' })
  }
}
