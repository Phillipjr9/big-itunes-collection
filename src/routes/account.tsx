import { createFileRoute, Link } from '@tanstack/react-router'
import { LogOut, Sparkles, User } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop, tierFromLifetimePoints } from '@/context/ShopContext'
import { BRAND } from '@/lib/brand'
import { naira } from '@/lib/format'
import {
  MIN_REDEEM_POINTS,
  NAIRA_PER_POINT_REDEEM,
  loyaltyCopy,
  normalizePhone,
} from '@/lib/loyalty'
import { loadJSON, removeKey, saveJSON } from '@/lib/persist'

export const Route = createFileRoute('/account')({
  head: () => ({ meta: [{ title: 'My account · Big ITunes Collection' }] }),
  component: AccountPage,
})

const SESSION_KEY = 'customer_phone'

function AccountPage() {
  const { getLoyalty, findOrders, ready } = useShop()
  const [phone, setPhone] = useState('')
  const [sessionPhone, setSessionPhone] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = loadJSON<string | null>(SESSION_KEY, null)
    if (saved) setSessionPhone(saved)
  }, [])

  const loyalty = useMemo(
    () => (sessionPhone ? getLoyalty(sessionPhone) : undefined),
    [sessionPhone, getLoyalty],
  )

  const myOrders = useMemo(
    () => (sessionPhone ? findOrders({ phone: sessionPhone }) : []),
    [sessionPhone, findOrders],
  )

  const copy = loyaltyCopy()
  const tier = loyalty ? tierFromLifetimePoints(loyalty.lifetimePoints) : 'Member'
  const redeemValue = loyalty ? loyalty.points * NAIRA_PER_POINT_REDEEM : 0

  function login(e: FormEvent) {
    e.preventDefault()
    const key = normalizePhone(phone)
    if (key.length < 10) {
      setError('Enter a valid Nigerian phone (at least 10 digits)')
      return
    }
    setError('')
    saveJSON(SESSION_KEY, key)
    setSessionPhone(key)
    toast.success("You're signed in")
  }

  function logout() {
    removeKey(SESSION_KEY)
    setSessionPhone(null)
    setPhone('')
    toast.message('Signed out')
  }

  if (!ready) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-md px-5 py-24 text-center text-sm text-muted-foreground">
          Loading your account…
        </main>
      </StoreChrome>
    )
  }

  if (!sessionPhone) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-md px-5 py-12 sm:py-16">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-serif text-3xl">My account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with the WhatsApp number you use when ordering to see loyalty points and past
              orders.
            </p>
          </div>

          <form
            onSubmit={login}
            className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                WhatsApp / phone number
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError('')
                }}
                placeholder="0801 234 5678"
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            ) : null}
            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
            >
              View my points
            </button>
            <p className="text-center text-xs text-muted-foreground">
              {copy.earn} {copy.redeem}
            </p>
          </form>

          <div className="mt-10 rounded-2xl border border-dashed border-border/80 bg-secondary/30 p-5 text-center">
            <p className="text-xs font-medium text-muted-foreground">Staff or owner?</p>
            <Link to="/app" className="mt-2 inline-block text-sm font-semibold text-primary underline">
              Open Studio (admin login)
            </Link>
          </div>
        </main>
      </StoreChrome>
    )
  }

  return (
    <StoreChrome>
      <main className="mx-auto max-w-lg px-5 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Welcome back</p>
            <h1 className="mt-1 font-serif text-3xl">{loyalty?.name || 'Your account'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">···{sessionPhone.slice(-4)}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{tier} member</span>
          </div>
          <p className="mt-4 font-serif text-5xl tracking-tight text-foreground">
            {loyalty?.points ?? 0}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">loyalty points</p>
          <p className="mt-3 text-sm">
            Worth about <span className="font-semibold text-primary">{naira(redeemValue)}</span> off
            when you redeem
            {loyalty && loyalty.points < MIN_REDEEM_POINTS
              ? ` (need ${MIN_REDEEM_POINTS} to redeem)`
              : ''}
            .
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Lifetime earned: {loyalty?.lifetimePoints ?? 0} pts · {copy.earn}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-serif text-2xl">Your orders</h2>
          {myOrders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No orders yet with this number. Checkout with this WhatsApp number to earn points.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/order/$id"
                    params={{ id: o.id }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-primary">{o.id}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {o.status} · {o.paymentStatus ?? 'unpaid'}
                        {o.pointsEarned ? ` · +${o.pointsEarned} pts` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm">{naira(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Continue shopping
          </Link>
          <Link
            to="/track-order"
            className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-border text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            Track an order
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Staff?{' '}
          <Link to="/app" className="text-primary underline">
            Studio login
          </Link>
        </p>
      </main>
    </StoreChrome>
  )
}
