import { getDatabaseUrl, handleOptions, json, ensureSchema, sql } from './_db.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  const url = getDatabaseUrl()
  if (!url) {
    return json(res, 200, { ok: true, neon: false, message: 'No DATABASE_URL — using browser storage only' })
  }
  try {
    const db = sql()
    await ensureSchema(db)
    return json(res, 200, { ok: true, neon: true, message: 'Neon connected' })
  } catch (e) {
    return json(res, 500, { ok: false, neon: false, message: e.message })
  }
}
