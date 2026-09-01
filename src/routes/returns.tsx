import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { BRAND, whatsappUrl } from '@/lib/brand'

export const Route = createFileRoute('/returns')({
  head: () => ({ meta: [{ title: 'Returns · Big ITunes Collection' }] }),
  component: ReturnsPage,
})

function ReturnsPage() {
  const { requestReturn } = useShop()
  const [form, setForm] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    itemsSummary: '',
    reason: '',
  })

  return (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">Returns & exchanges</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Unworn items with tags may be exchanged within 7 days of delivery, subject to stock. Sale
            items are final sale unless faulty.
          </p>
          <p>
            Fastest path:{' '}
            <a
              className="text-primary underline"
              href={whatsappUrl('Hi! I need a return/exchange for my order.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {BRAND.phoneDisplay}
            </a>
          </p>
        </div>

        <h2 className="mt-12 font-serif text-2xl">Request a return</h2>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const res = requestReturn(form)
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              setForm({
                orderId: '',
                customerName: '',
                customerPhone: '',
                itemsSummary: '',
                reason: '',
              })
            }
          }}
        >
          {(
            [
              ['orderId', 'Order ID'],
              ['customerName', 'Your name'],
              ['customerPhone', 'Phone'],
              ['itemsSummary', 'Items / sizes'],
            ] as const
          ).map(([key, label]) => (
            <input
              key={key}
              required
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
            />
          ))}
          <textarea
            required
            placeholder="Reason"
            rows={4}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Submit return request
          </button>
        </form>
      </main>
    </StoreChrome>
  )
}
