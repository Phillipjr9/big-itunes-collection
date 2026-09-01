import { neon } from '@neondatabase/serverless'

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  )
}

export function sql() {
  const url = getDatabaseUrl()
  if (!url) throw new Error('DATABASE_URL not configured')
  return neon(url)
}

export async function ensureSchema(db) {
  await db`
    CREATE TABLE IF NOT EXISTS shop_kv (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function kvGet(db, key) {
  const rows = await db`SELECT value FROM shop_kv WHERE key = ${key}`
  return rows[0]?.value ?? null
}

export async function kvSet(db, key, value) {
  await db`
    INSERT INTO shop_kv (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `
}

export function getAdminPin() {
  return process.env.ADMIN_PIN || process.env.VITE_ADMIN_PIN || 'itunes2026'
}

export function requireAdmin(req) {
  const pin = req.headers['x-admin-pin'] || req.headers['X-Admin-Pin']
  return pin === getAdminPin()
}

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Pin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  res.end(JSON.stringify(body))
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    json(res, 204, {})
    return true
  }
  return false
}
