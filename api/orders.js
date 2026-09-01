import {
  ensureSchema,
  getDatabaseUrl,
  handleOptions,
  json,
  kvGet,
  kvSet,
  sql,
} from './_db.js'

/** Public order create — appends order + updates product stock + loyalty in Neon */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (!getDatabaseUrl()) {
    return json(res, 503, { ok: false, neon: false, message: 'DATABASE_URL not set' })
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, message: 'Method not allowed' })
  }

  try {
    const db = sql()
    await ensureSchema(db)
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const order = body.order
    if (!order || !order.id || !Array.isArray(order.items)) {
      return json(res, 400, { ok: false, message: 'Invalid order payload' })
    }

    const products = (await kvGet(db, 'products')) || []
    const orders = (await kvGet(db, 'orders')) || []
    let loyalty = (await kvGet(db, 'loyalty')) || []

    const nextProducts = products.map((p) => ({ ...p, stock: { ...p.stock } }))
    for (const item of order.items) {
      const p = nextProducts.find((x) => x.id === item.productId)
      if (!p) continue
      const avail = p.stock[item.size] ?? 0
      if (avail < item.quantity) {
        return json(res, 409, {
          ok: false,
          message: `Insufficient stock for ${p.name} (${item.size})`,
        })
      }
      p.stock[item.size] = avail - item.quantity
    }

    const nextOrders = [order, ...orders.filter((o) => o.id !== order.id)].slice(0, 500)

    if (body.loyaltyAccount && body.loyaltyAccount.phoneKey) {
      const acc = body.loyaltyAccount
      const i = loyalty.findIndex((a) => a.phoneKey === acc.phoneKey)
      if (i >= 0) loyalty = loyalty.map((a, idx) => (idx === i ? acc : a))
      else loyalty = [acc, ...loyalty].slice(0, 2000)
    }

    await kvSet(db, 'products', nextProducts)
    await kvSet(db, 'orders', nextOrders)
    await kvSet(db, 'loyalty', loyalty)

    if (Array.isArray(body.discounts)) {
      await kvSet(db, 'discounts', body.discounts)
    }

    return json(res, 201, { ok: true, neon: true, order })
  } catch (e) {
    console.error(e)
    return json(res, 500, { ok: false, message: e.message || 'Database error' })
  }
}
