import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useShop } from '@/context/ShopContext'
import { DEFAULT_WHOLESALE_PERCENT, wholesaleUnitPrice } from '@/lib/bulk'
import { NIGERIAN_STATES } from '@/lib/delivery'
import { naira } from '@/lib/format'
import { SIZES } from '@/lib/catalog'

export const Route = createFileRoute('/app/wholesale')({
  head: () => ({ meta: [{ title: 'Wholesale · Studio' }] }),
  component: WholesaleAdmin,
})

type Line = { productId: number; size: string; quantity: number }

function WholesaleAdmin() {
  const { activeProducts, placeWholesaleOrder } = useShop()
  const [buyer, setBuyer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Lagos',
  })
  const [percentOff, setPercentOff] = useState(DEFAULT_WHOLESALE_PERCENT)
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<Line[]>([{ productId: 0, size: 'M', quantity: 5 }])

  const preview = useMemo(() => {
    let units = 0
    let retail = 0
    let wholesale = 0
    for (const line of lines) {
      if (!line.productId || line.quantity < 1) continue
      const p = activeProducts.find((x) => x.id === line.productId)
      if (!p) continue
      units += line.quantity
      retail += p.price * line.quantity
      wholesale += wholesaleUnitPrice(p.price, percentOff) * line.quantity
    }
    return { units, retail, wholesale, savings: retail - wholesale }
  }, [lines, activeProducts, percentOff])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Studio</p>
        <h1 className="mt-1 font-serif text-3xl">Wholesale / bulk order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an order for a boutique or reseller at a set % off retail. Stock is deducted when you
          save.
        </p>
      </div>

      <form
        className="space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          const validLines = lines.filter((l) => l.productId && l.quantity > 0)
          if (!validLines.length) {
            toast.error('Add at least one product line')
            return
          }
          const res = placeWholesaleOrder({
            customer: buyer,
            lines: validLines,
            wholesalePercent: percentOff,
            notes: notes || undefined,
          })
          if (!res.ok) {
            toast.error(res.message)
            return
          }
          toast.success(`Wholesale order ${res.order?.id} created`)
          setLines([{ productId: 0, size: 'M', quantity: 5 }])
          setNotes('')
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['name', 'Business / buyer name'],
              ['email', 'Email'],
              ['phone', 'WhatsApp phone'],
              ['address', 'Delivery address'],
              ['city', 'City'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                required
                value={buyer[key]}
                onChange={(e) => setBuyer((b) => ({ ...b, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">State</label>
            <select
              value={buyer.state}
              onChange={(e) => setBuyer((b) => ({ ...b, state: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
            >
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Wholesale % off retail
            </label>
            <input
              type="number"
              min={5}
              max={70}
              value={percentOff}
              onChange={(e) => setPercentOff(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Lines</p>
            <button
              type="button"
              className="text-xs font-semibold text-primary"
              onClick={() => setLines((l) => [...l, { productId: 0, size: 'M', quantity: 5 }])}
            >
              + Add line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-[1.4fr_0.5fr_0.5fr_auto]">
                <select
                  value={line.productId || ''}
                  onChange={(e) => {
                    const productId = Number(e.target.value)
                    setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, productId } : x)))
                  }}
                  className="rounded-xl border border-border px-2 py-2 text-sm"
                  required
                >
                  <option value="">Select piece…</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {naira(p.price)}
                    </option>
                  ))}
                </select>
                <select
                  value={line.size}
                  onChange={(e) =>
                    setLines((ls) =>
                      ls.map((x, i) => (i === idx ? { ...x, size: e.target.value } : x)),
                    )
                  }
                  className="rounded-xl border border-border px-2 py-2 text-sm"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((ls) =>
                      ls.map((x, i) =>
                        i === idx ? { ...x, quantity: Math.max(1, Number(e.target.value) || 1) } : x,
                      ),
                    )
                  }
                  className="rounded-xl border border-border px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                  disabled={lines.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Invoice #, delivery window, MOQ agreement…"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-xl bg-secondary/50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Units</span>
            <span>{preview.units}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">Retail value</span>
            <span className="line-through">{naira(preview.retail)}</span>
          </div>
          <div className="mt-1 flex justify-between font-semibold text-primary">
            <span>Wholesale total (before delivery)</span>
            <span>{naira(preview.wholesale)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            You save the buyer {naira(preview.savings)} vs retail ({percentOff}% off).
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground"
        >
          Create wholesale order
        </button>
      </form>
    </div>
  )
}
