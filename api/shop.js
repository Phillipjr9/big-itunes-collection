import {
  ensureSchema,
  getDatabaseUrl,
  handleOptions,
  json,
  kvGet,
  kvSet,
  requireAdmin,
  sql,
} from './_db.js'

const KEYS = [
  'products',
  'orders',
  'discounts',
  'homepage',
  'returns',
  'waitlist',
  'subscribers',
  'audit',
  'loyalty',
  'staff',
  'categories',
]

export default async function handler(req, res) {
  if (handleOptions(req, res)) return

  if (!getDatabaseUrl()) {
    return json(res, 503, {
      ok: false,
      neon: false,
      message: 'DATABASE_URL not set. Add Neon connection string in Vercel env.',
    })
  }

  try {
    const db = sql()
    await ensureSchema(db)

    if (req.method === 'GET') {
      const out = { ok: true, neon: true }
      for (const key of KEYS) {
        out[key] = await kvGet(db, key)
      }
      return json(res, 200, out)
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return json(res, 401, { ok: false, message: 'Admin PIN required' })
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
      for (const key of KEYS) {
        if (body[key] !== undefined) {
          await kvSet(db, key, body[key])
        }
      }
      return json(res, 200, { ok: true, neon: true, message: 'Shop state saved' })
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' })
  } catch (e) {
    console.error(e)
    return json(res, 500, { ok: false, message: e.message || 'Database error' })
  }
}
