import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { BRAND, whatsappUrl } from '@/lib/brand'
import { formatDate, naira } from '@/lib/format'
import { loyaltyCopy, tierFromLifetimePoints } from '@/lib/loyalty'
import type { Order } from '@/lib/types'

export const Route = createFileRoute('/track-order')({
  head: () => ({ meta: [{ title: 'Track order · Big ITunes Collection' }] }),
  component: TrackOrderPage,
})

function TrackOrderPage() {
  const { findOrders, getLoyalty } = useShop()
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [results, setResults] = useState<Order[] | null>(null)
  const loyalty = phone.trim() ? getLoyalty(phone) : undefined
  const copy = loyaltyCopy()

  return (
    <StoreChrome>
      <main className="mx-auto max-w-xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">Track your order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your order ID and/or the phone number used at checkout. Points are linked to your phone.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setResults(findOrders({ orderId, phone }))
          }}
        >
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (e.g. BIC-…)"
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Look up
          </button>
        </form>

        {loyalty && (
          <div className="mt-8 border border-primary/20 bg-primary/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Your points</p>
            <p className="mt-2 font-serif text-3xl">{loyalty.points.toLocaleString('en-NG')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tierFromLifetimePoints(loyalty.lifetimePoints)} ·{' '}
              {loyalty.lifetimePoints.toLocaleString('en-NG')} lifetime points
            </p>
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          {copy.earn} {copy.redeem}
        </p>

        <a
          href={whatsappUrl('Hi Big ITunes! I need help tracking my order.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center text-sm text-primary underline"
        >
          WhatsApp {BRAND.phoneDisplay}
        </a>

        {results && results.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">No orders found for that lookup.</p>
        )}
        {results && results.length > 0 && (
          <ul className="mt-8 space-y-4">
            {results.map((o) => (
              <li key={o.id} className="border border-border p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <Link to="/order/$id" params={{ id: o.id }} className="font-mono text-primary">
                    {o.id}
                  </Link>
                  <span className="capitalize">{o.status}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{formatDate(o.createdAt)}</p>
                <p className="mt-1 font-semibold">{naira(o.total)}</p>
                {o.pointsEarned != null && o.pointsEarned > 0 && (
                  <p className="mt-1 text-xs text-primary">+{o.pointsEarned} points earned</p>
                )}
                {o.trackingNumber && (
                  <p className="mt-2">
                    {o.courier} · {o.trackingNumber}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </StoreChrome>
  )
}
