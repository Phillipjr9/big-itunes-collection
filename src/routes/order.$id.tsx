import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PaymentPendingLottie } from '@/components/PaymentPendingLottie'
import { PaymentSuccessLottie } from '@/components/PaymentSuccessLottie'
import { PaymentFailedLottie } from '@/components/PaymentFailedLottie'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { useOrderLiveStatus } from '@/hooks/useOrderLiveStatus'
import { BRAND, orderWhatsAppMessage, whatsappUrl } from '@/lib/brand'
import { formatDate, naira } from '@/lib/format'
import type { OrderStatus, PaymentStatus } from '@/lib/types'

export const Route = createFileRoute('/order/$id')({
  head: () => ({ meta: [{ title: 'Order confirmation · Big ITunes Collection' }] }),
  component: OrderPage,
})

const JOURNEY: { status: OrderStatus; label: string; detail: string }[] = [
  { status: 'pending', label: 'We received your order', detail: 'Confirm on WhatsApp so we can lock stock.' },
  { status: 'confirmed', label: 'Payment / order confirmed', detail: 'We’re preparing your pieces.' },
  { status: 'processing', label: 'Packing', detail: 'Quality check and packing in studio.' },
  { status: 'shipped', label: 'On the way', detail: 'Courier has your parcel.' },
  { status: 'delivered', label: 'Delivered', detail: 'Enjoy — message us if anything is off.' },
]

function statusIndex(s: OrderStatus): number {
  if (s === 'cancelled') return -1
  const i = JOURNEY.findIndex((j) => j.status === s)
  return i >= 0 ? i : 0
}

function isPaymentFullyPaid(paymentStatus?: string): boolean {
  return paymentStatus === 'paid'
}

function OrderPage() {
  const { id } = Route.useParams()
  const { orders, updateOrderPayment, updateOrderStatus } = useShop()
  const order = orders.find((o) => o.id === id)

  const live = useOrderLiveStatus(id, {
    enabled: Boolean(order),
    intervalMs: 5000,
  })

  // Merge webhook updates into local order view + ShopContext
  useEffect(() => {
    if (!order || !live) return
    if (live.paymentStatus === 'paid' && order.paymentStatus !== 'paid') {
      updateOrderPayment(order.id, {
        paymentStatus: 'paid' as PaymentStatus,
        paymentReference: live.paymentReference || undefined,
      } as { paymentStatus: PaymentStatus; paymentProof?: string })
    }
    if (live.status && live.status !== order.status) {
      updateOrderStatus(order.id, live.status as OrderStatus, 'Live status sync')
    }
  }, [live, order, updateOrderPayment, updateOrderStatus])

  const paymentStatus = live?.paymentStatus || order?.paymentStatus
  const orderStatus = (live?.status as OrderStatus | undefined) || order?.status
  const failed = paymentStatus === 'failed'

  const wa = order
    ? whatsappUrl(
        orderWhatsAppMessage({
          id: order.id,
          customer: order.customer,
          total: order.total,
          items: order.items,
          paymentMethod: order.paymentMethod,
          paymentStatus: paymentStatus,
        }),
      )
    : ''

  const needsReceipt =
    order &&
    order.paymentMethod === 'transfer' &&
    paymentStatus !== 'paid'

  useEffect(() => {
    if (!order) return
    const key = `wa_opened_${order.id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    const t = window.setTimeout(() => {
      window.open(wa, '_blank', 'noopener,noreferrer')
    }, 900)
    return () => window.clearTimeout(t)
  }, [order, wa])

  if (!order) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Try <Link to="/track-order" className="text-primary underline">order lookup</Link> or
            WhatsApp us.
          </p>
          <a
            href={whatsappUrl(`Hi! Looking for order ${id}`)}
            className="mt-6 inline-block text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {BRAND.phoneDisplay}
          </a>
        </main>
      </StoreChrome>
    )
  }

  const step = statusIndex(orderStatus || order.status)
  const paid = isPaymentFullyPaid(paymentStatus)

  return (
    <StoreChrome>
      <main className="mx-auto max-w-2xl px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto mb-2 flex justify-center">
          {paid ? (
            <PaymentSuccessLottie className="h-44 w-full max-w-sm sm:h-52" />
          ) : failed ? (
            <PaymentFailedLottie className="h-44 w-full max-w-sm sm:h-52" />
          ) : (
            <PaymentPendingLottie className="h-44 w-full max-w-sm sm:h-52" />
          )}
        </div>

        <p
          className={`text-center font-mono text-[10px] uppercase tracking-[0.16em] ${
            paid ? 'text-emerald-600' : failed ? 'text-destructive' : 'text-amber-600'
          }`}
        >
          {paid ? 'Payment successful' : failed ? 'Payment failed' : 'Payment pending'}
          {live && !paid ? ' · live' : ''}
        </p>
        <h1 className="mt-2 text-center font-serif text-4xl">
          {paid
            ? `Thank you, ${order.customer.name.split(' ')[0]}`
            : `Order received, ${order.customer.name.split(' ')[0]}`}
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Order <span className="font-mono text-foreground">{order.id}</span> ·{' '}
          {formatDate(order.createdAt)}
        </p>

        {needsReceipt && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#25D366]/35 bg-[#25D366]/10 p-5 text-center">
            <p className="font-serif text-xl text-foreground">Send your receipt on WhatsApp</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              WhatsApp will open to <strong className="text-foreground">{BRAND.phoneDisplay}</strong>.
              In the chat, tap the <strong className="text-foreground">📎 paperclip / gallery</strong> and
              attach your bank transfer screenshot so we receive it on our phone.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
            >
              Open WhatsApp & send receipt
            </a>
          </div>
        )}

        {!paid && !needsReceipt && (
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
            {order.paymentMethod === 'paystack'
              ? 'Waiting for Paystack confirmation (updates automatically when payment clears).'
              : 'Your order is saved. Confirm on WhatsApp to arrange payment.'}
          </p>
        )}

        {orderStatus !== 'cancelled' && (
          <ol className="mt-8 space-y-3 rounded-2xl border border-border bg-card/40 p-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Your order journey
            </p>
            {JOURNEY.map((j, i) => {
              const done = step >= i
              const current = step === i
              return (
                <li
                  key={j.status}
                  className={`flex gap-3 text-sm ${
                    done ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      current
                        ? 'bg-primary text-primary-foreground'
                        : done
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className={`font-medium ${current ? 'text-primary' : ''}`}>{j.label}</p>
                    <p className="text-xs text-muted-foreground">{j.detail}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <p className="mt-4 text-center text-sm">
          Payment:{' '}
          <strong className="capitalize">
            {order.paymentMethod === 'transfer'
              ? 'Bank transfer'
              : order.paymentMethod === 'paystack'
                ? 'Paystack'
                : order.paymentMethod ?? '—'}
          </strong>
          {paymentStatus ? ` · ${String(paymentStatus).replace('_', ' ')}` : ''}
          {(live?.paymentReference || order.paymentReference) && (
            <>
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                Ref: {live?.paymentReference || order.paymentReference}
              </span>
            </>
          )}
        </p>

        {order.paymentMethod === 'transfer' && !paid && (
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
            <p className="font-medium">Bank transfer — awaiting confirmation</p>
            <p className="mt-1 text-muted-foreground">
              {BRAND.bank.bankName} · {BRAND.bank.accountName} ·{' '}
              <span className="font-mono text-foreground">{BRAND.bank.accountNumber}</span>
            </p>
            <p className="mt-2 font-semibold text-primary">Send {naira(order.total)}</p>
          </div>
        )}

        {paid && (
          <p className="mt-4 text-center text-sm text-emerald-700">
            Payment confirmed. We’ll pack and update you on WhatsApp.
          </p>
        )}

        {(live?.trackingNumber || order.trackingNumber) && (
          <p className="mt-4 text-center text-sm">
            Tracking: {(live?.courier || order.courier) ? `${live?.courier || order.courier} · ` : ''}
            {order.trackingUrl ? (
              <a href={order.trackingUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                {live?.trackingNumber || order.trackingNumber}
              </a>
            ) : (
              live?.trackingNumber || order.trackingNumber
            )}
          </p>
        )}

        {!needsReceipt && (
          <>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
            >
              {paid ? 'Message us on WhatsApp' : 'Confirm on WhatsApp'}
            </a>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Opens chat with {BRAND.phoneDisplay}
            </p>
          </>
        )}

        <ul className="mt-10 space-y-4 border-y border-border py-6">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex gap-3 text-sm">
              <img src={item.image} alt="" className="h-16 w-12 object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">
                  {item.size} × {item.quantity}
                </p>
              </div>
              <span className="font-mono">{naira(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{naira(order.subtotal)}</span>
          </div>
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount</span>
              <span>−{naira(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'Free' : naira(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{naira(order.total)}</span>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Delivery to {order.customer.address}, {order.customer.city}, {order.customer.state}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Keep shopping
          </Link>
          <Link
            to="/track-order"
            className="border border-border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            Track order
          </Link>
        </div>
      </main>
    </StoreChrome>
  )
}
