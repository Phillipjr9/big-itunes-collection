import crypto from 'crypto'
import {
  ensureSchema,
  getDatabaseUrl,
  handleOptions,
  json,
  kvGet,
  kvSet,
  sql,
} from '../_db.js'

/**
 * Paystack webhook — real-time payment status.
 * Dashboard → Settings → API Keys & Webhooks →
 * URL: https://YOUR_DOMAIN/api/webhooks/paystack
 * Env: PAYSTACK_SECRET_KEY (sk_test_… / sk_live_…)
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, message: 'Method not allowed' })
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !secret.startsWith('sk_')) {
    return json(res, 503, {
      ok: false,
      message: 'PAYSTACK_SECRET_KEY not set on server',
    })
  }

  const signature = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature']
  const rawBody =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})

  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (!signature || hash !== signature) {
    return json(res, 401, { ok: false, message: 'Invalid signature' })
  }

  if (!getDatabaseUrl()) {
    return json(res, 503, { ok: false, message: 'DATABASE_URL not set' })
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const eventName = event?.event
    const data = event?.data || {}

    if (eventName !== 'charge.success') {
      return json(res, 200, { ok: true, ignored: eventName || 'unknown' })
    }

    const reference = String(data.reference || '')
    const metaOrderId =
      data.metadata?.order_id ||
      data.metadata?.orderId ||
      data.metadata?.custom_fields?.find?.((f) => f.variable_name === 'order_id')?.value

    const amountNaira =
      typeof data.amount === 'number' ? Math.round(data.amount / 100) : null

    const db = sql()
    await ensureSchema(db)
    const orders = (await kvGet(db, 'orders')) || []

    const idx = orders.findIndex((o) => {
      if (metaOrderId && o.id === metaOrderId) return true
      if (reference && o.paymentReference && o.paymentReference === reference) return true
      if (reference && o.id && reference.startsWith(o.id.replace(/[^a-zA-Z0-9]/g, ''))) return true
      return false
    })

    if (idx < 0) {
      console.warn('Paystack webhook: order not found', { reference, metaOrderId })
      return json(res, 200, {
        ok: true,
        matched: false,
        message: 'Order not found — may still be client-only',
      })
    }

    const now = new Date().toISOString()
    const prev = orders[idx]
    const updated = {
      ...prev,
      paymentStatus: 'paid',
      paymentMethod: prev.paymentMethod || 'paystack',
      paymentReference: reference || prev.paymentReference,
      status: prev.status === 'pending' ? 'confirmed' : prev.status,
      statusHistory: [
        ...(prev.statusHistory || []),
        {
          status: prev.status === 'pending' ? 'confirmed' : prev.status,
          at: now,
          note: `Paystack webhook · ${reference}${amountNaira != null ? ` · ₦${amountNaira}` : ''}`,
        },
      ],
    }

    if (amountNaira != null && prev.total && Math.abs(amountNaira - prev.total) > 1) {
      updated.paymentFlags = [
        ...(prev.paymentFlags || []),
        {
          code: 'amount_mismatch',
          severity: 'critical',
          message: `Paystack paid ₦${amountNaira} but order total is ₦${prev.total}`,
        },
      ]
    }

    const nextOrders = [...orders]
    nextOrders[idx] = updated
    await kvSet(db, 'orders', nextOrders)

    // Optional outbound notify (Slack, Make.com, etc.)
    const hook = process.env.ORDER_STATUS_WEBHOOK_URL
    if (hook) {
      try {
        await fetch(hook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'paystack',
            event: 'payment.paid',
            orderId: updated.id,
            paymentReference: reference,
            total: updated.total,
            customer: updated.customer,
            at: now,
          }),
        })
      } catch (e) {
        console.error('ORDER_STATUS_WEBHOOK_URL failed', e)
      }
    }

    return json(res, 200, {
      ok: true,
      matched: true,
      orderId: updated.id,
      paymentStatus: 'paid',
    })
  } catch (e) {
    console.error(e)
    return json(res, 500, { ok: false, message: e.message || 'Webhook error' })
  }
}
