import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useShop } from '@/context/ShopContext'
import { BRAND, requestReceiptWhatsAppMessage, whatsappUrl } from '@/lib/brand'
import { formatDate, naira } from '@/lib/format'
import { hasCriticalFlags } from '@/lib/receiptScan'
import type { OrderStatus, PaymentStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

const PAY_STATUSES: PaymentStatus[] = ['unpaid', 'proof_sent', 'paid', 'refunded']

export const Route = createFileRoute('/app/orders')({
  head: () => ({ meta: [{ title: 'Orders · Studio' }] }),
  component: OrdersAdmin,
})

function OrdersAdmin() {
  const { orders, updateOrderStatus, updateOrderShipping, updateOrderPayment } = useShop()
  const [shipForm, setShipForm] = useState<
    Record<string, { courier: string; trackingNumber: string; trackingUrl: string }>
  >({})

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Studio</p>
        <h1 className="mt-1 font-serif text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} total · Match payments by <strong>transaction ID</strong> (not amount alone).
          Red flags appear when a receipt/ref looks reused or mismatched.
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
          No orders yet — when a customer checks out, it will show here.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const ship = shipForm[order.id] ?? {
              courier: order.courier ?? '',
              trackingNumber: order.trackingNumber ?? '',
              trackingUrl: order.trackingUrl ?? '',
            }
            const waCustomer = whatsappUrl(
              `Hi ${order.customer.name}, this is Big ITunes about order ${order.id}.`,
            )
            const waRequestReceipt = whatsappUrl(
              requestReceiptWhatsAppMessage({
                id: order.id,
                customer: order.customer,
                total: order.total,
              }),
            )
            const customerDigits = order.customer.phone.replace(/\D/g, '')
            const customerWa = customerDigits
              ? `https://wa.me/${customerDigits.startsWith('234') ? customerDigits : customerDigits.length === 10 ? `234${customerDigits}` : customerDigits}?text=${encodeURIComponent(
                  requestReceiptWhatsAppMessage({
                    id: order.id,
                    customer: order.customer,
                    total: order.total,
                  }),
                )}`
              : waRequestReceipt
            const flagged = hasCriticalFlags(order.paymentFlags)

            return (
              <div
                key={order.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm ${
                  flagged ? 'border-destructive/50 ring-1 ring-destructive/30' : 'border-border/80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm">
                      {order.customer.name} ·{' '}
                      <a
                        href={waCustomer}
                        className="text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.customer.phone}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer.address}, {order.customer.city}, {order.customer.state}
                    </p>
                    {order.paymentMethod && (
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        Pay: {order.paymentMethod}
                        {order.paymentStatus ? ` · ${order.paymentStatus.replace('_', ' ')}` : ''}
                      </p>
                    )}
                    {order.paymentReference && (
                      <p className="mt-2 rounded-lg bg-secondary/80 px-2 py-1 font-mono text-xs">
                        TXN / REF:{' '}
                        <span className="font-semibold text-foreground">{order.paymentReference}</span>
                      </p>
                    )}
                    {order.paymentAmountDetected != null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        OCR amount ~{naira(order.paymentAmountDetected)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{naira(order.total)}</p>
                    {(order.discount ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Discount {order.discountCode}: −{naira(order.discount)}
                      </p>
                    )}
                    <select
                      className="mt-2 rounded-xl border px-2 py-1.5 text-sm capitalize"
                      value={order.status}
                      onChange={(e) => {
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                        toast.success('Status updated')
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      className="mt-2 block w-full rounded-xl border px-2 py-1.5 text-sm capitalize"
                      value={order.paymentStatus ?? 'unpaid'}
                      onChange={(e) => {
                        updateOrderPayment(order.id, {
                          paymentStatus: e.target.value as PaymentStatus,
                        })
                        toast.success('Payment status saved')
                      }}
                    >
                      {PAY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          pay: {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {order.paymentFlags && order.paymentFlags.length > 0 && (
                  <div
                    className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                      flagged
                        ? 'border border-destructive/30 bg-destructive/10 text-destructive'
                        : 'border border-amber-500/30 bg-amber-500/10 text-amber-900'
                    }`}
                  >
                    <p className="font-semibold">{flagged ? '🚩 Red flags' : '⚠️ Review'}</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {order.paymentFlags.map((f) => (
                        <li key={f.code + f.message}>{f.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={customerWa}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full bg-[#25D366] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white"
                  >
                    Request receipt on WhatsApp
                  </a>
                  <a
                    href={waCustomer}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  >
                    Open chat
                  </a>
                </div>

                {order.paymentProof ? (
                  <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-medium text-primary">Receipt on website</p>
                    <a href={order.paymentProof} target="_blank" rel="noreferrer">
                      <img
                        src={order.paymentProof}
                        alt="Payment proof"
                        className="max-h-48 rounded-lg border object-contain"
                      />
                    </a>
                  </div>
                ) : (
                  order.paymentMethod === 'transfer' &&
                  order.paymentStatus !== 'paid' && (
                    <p className="mt-3 text-xs text-amber-700">
                      No website upload yet — request receipt on WhatsApp ({BRAND.phoneDisplay}).
                    </p>
                  )
                )}

                <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                  {order.items.map((i) => (
                    <li key={`${i.productId}-${i.size}`}>
                      {i.name} · {i.size} × {i.quantity} — {naira(i.price * i.quantity)}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-2 border-t border-border/60 pt-3 sm:grid-cols-3">
                  <input
                    placeholder="Courier"
                    className="rounded-xl border px-2 py-1.5 text-sm"
                    value={ship.courier}
                    onChange={(e) =>
                      setShipForm((f) => ({
                        ...f,
                        [order.id]: { ...ship, courier: e.target.value },
                      }))
                    }
                  />
                  <input
                    placeholder="Tracking number"
                    className="rounded-xl border px-2 py-1.5 text-sm"
                    value={ship.trackingNumber}
                    onChange={(e) =>
                      setShipForm((f) => ({
                        ...f,
                        [order.id]: { ...ship, trackingNumber: e.target.value },
                      }))
                    }
                  />
                  <input
                    placeholder="Tracking URL"
                    className="rounded-xl border px-2 py-1.5 text-sm"
                    value={ship.trackingUrl}
                    onChange={(e) =>
                      setShipForm((f) => ({
                        ...f,
                        [order.id]: { ...ship, trackingUrl: e.target.value },
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary underline"
                  onClick={() => {
                    updateOrderShipping(order.id, ship)
                    if (ship.trackingNumber) updateOrderStatus(order.id, 'shipped', 'Tracking added')
                    toast.success('Shipping saved')
                  }}
                >
                  Save shipping / mark shipped
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
