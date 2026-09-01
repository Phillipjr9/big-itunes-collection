import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Check, ChevronDown, ChevronUp, Copy, Lock, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { PaymentFailedLottie } from '@/components/PaymentFailedLottie'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { BRAND, whatsappUrl } from '@/lib/brand'
import { BULK_TIERS } from '@/lib/bulk'
import {
  NIGERIAN_STATES,
  deliveryFeeForState,
  deliveryNote,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/delivery'
import { naira } from '@/lib/format'
import { isPaystackConfigured, openPaystackPopup } from '@/lib/paystack'
import { hasCriticalFlags, normalizeTxnId, scanPaymentProof } from '@/lib/receiptScan'
import type { PaymentMethod, ReceiptFlag } from '@/lib/types'

export const Route = createFileRoute('/checkout')({
  head: () => ({ meta: [{ title: 'Checkout · Big ITunes Collection' }] }),
  component: CheckoutPage,
})

const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

function CheckoutPage() {
  const navigate = useNavigate()
  const {
    cart,
    cartSubtotal,
    cartCount,
    bulkSavings,
    getProduct,
    placeOrder,
    validateDiscount,
    updateOrderPayment,
    orders,
  } = useShop()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Lagos',
    notes: '',
  })
  const [promo, setPromo] = useState('')
  const [appliedCode, setAppliedCode] = useState('')
  const [codeDiscount, setCodeDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [paymentProof, setPaymentProof] = useState('')
  const [txnId, setTxnId] = useState('')
  const [scanFlags, setScanFlags] = useState<ReceiptFlag[]>([])
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const paystackReady = isPaystackConfigured()

  const bulkAmount = bulkSavings.amount
  const afterBulk = Math.max(0, cartSubtotal - bulkAmount)
  const totalDiscount = bulkAmount + codeDiscount
  const afterDiscount = Math.max(0, cartSubtotal - totalDiscount)
  const deliveryFee = cart.length ? deliveryFeeForState(form.state, afterDiscount) : 0
  const total = afterDiscount + deliveryFee

  const bagLines = useMemo(
    () =>
      cart
        .map((item) => {
          const p = getProduct(item.productId)
          if (!p) return null
          return { item, product: p }
        })
        .filter(Boolean) as {
        item: (typeof cart)[0]
        product: NonNullable<ReturnType<typeof getProduct>>
      }[],
    [cart, getProduct],
  )

  async function runScan(proof: string, manual: string) {
    if (!proof && !manual.trim()) {
      setScanFlags([])
      return
    }
    setScanning(true)
    try {
      const scan = await scanPaymentProof({
        dataUrl: proof || undefined,
        manualTxnId: manual,
        orderTotal: total,
        existingOrders: orders,
        runOcr: Boolean(proof),
      })
      if (scan.transactionId && !manual.trim()) setTxnId(scan.transactionId)
      setScanFlags(scan.flags)
      if (hasCriticalFlags(scan.flags)) {
        toast.error('Receipt flagged — check transaction ID / image')
      } else if (scan.transactionId) {
        toast.success(`Reference detected: ${scan.transactionId}`)
      }
      return scan
    } finally {
      setScanning(false)
    }
  }

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(BRAND.bank.accountNumber)
      setCopied(true)
      toast.success('Account number copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.message(BRAND.bank.accountNumber)
    }
  }

  if (cart.length === 0 && !orderError) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-serif text-3xl">Your bag is empty</h1>
          <Link
            to="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Continue shopping
          </Link>
        </main>
      </StoreChrome>
    )
  }

  if (orderError) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-md px-5 py-14 text-center pb-28">
          <PaymentFailedLottie className="mx-auto h-36 w-36 sm:h-48 sm:w-48" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
            Couldn’t complete
          </p>
          <h1 className="mt-2 font-serif text-3xl">Something went wrong</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{orderError}</p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setOrderError(null)}
              className="min-h-12 rounded-full bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
            >
              Try again
            </button>
            <a
              href={whatsappUrl(`Hi Big ITunes! Checkout failed: ${orderError}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-[11px] font-semibold uppercase tracking-[0.12em]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </main>
      </StoreChrome>
    )
  }

  const submitLabel =
    submitting
      ? 'Working…'
      : paymentMethod === 'paystack'
        ? `Pay ${naira(total)}`
        : `Place order · ${naira(total)}`

  return (
    <StoreChrome>
      <main className="mx-auto max-w-[1100px] px-4 pb-32 pt-6 sm:px-6 md:px-10 md:pb-16 md:pt-12">
        {/* Mobile bag summary — collapsible */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card md:hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            onClick={() => setBagOpen((o) => !o)}
            aria-expanded={bagOpen}
          >
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Your bag</p>
              <p className="truncate text-sm font-medium">
                {cartCount} piece{cartCount === 1 ? '' : 's'} · {naira(total)}
              </p>
            </div>
            {bagOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
          </button>
          {bagOpen && (
            <div className="border-t border-border px-4 pb-4 pt-3">
              <OrderLines lines={bagLines} />
              <OrderTotals
                cartSubtotal={cartSubtotal}
                bulkAmount={bulkAmount}
                bulkLabel={bulkSavings.label}
                codeDiscount={codeDiscount}
                appliedCode={appliedCode}
                deliveryFee={deliveryFee}
                state={form.state}
                afterDiscount={afterDiscount}
                total={total}
              />
            </div>
          )}
        </div>

        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
          <div>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Checkout</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Safe & simple. We confirm on WhatsApp ({BRAND.phoneDisplay}).
            </p>
            {bulkSavings.nextHint && (
              <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {bulkSavings.nextHint}
              </p>
            )}

            <form
              id="checkout-form"
              className="mt-8 space-y-8"
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitting(true)
                setOrderError(null)

                let paymentMeta: {
                  paymentReference?: string
                  paymentProofHash?: string
                  paymentAmountDetected?: number
                  paymentFlags?: ReceiptFlag[]
                  paymentScannedAt?: string
                } = {}

                if (paymentMethod === 'transfer') {
                  const scan = await scanPaymentProof({
                    dataUrl: paymentProof || undefined,
                    manualTxnId: txnId,
                    orderTotal: total,
                    existingOrders: orders,
                    runOcr: Boolean(paymentProof),
                  })
                  setScanFlags(scan.flags)
                  if (hasCriticalFlags(scan.flags)) {
                    setSubmitting(false)
                    setOrderError(
                      scan.flags
                        .filter((f) => f.severity === 'critical')
                        .map((f) => f.message)
                        .join(' ') ||
                        'This receipt was flagged. Use a unique transfer reference for this order.',
                    )
                    return
                  }
                  if (!scan.transactionId && !txnId.trim()) {
                    setSubmitting(false)
                    setOrderError(
                      'Enter your bank transaction ID so we can match your payment (avoids mix-ups when amounts are the same).',
                    )
                    return
                  }
                  paymentMeta = {
                    paymentReference: scan.transactionId || normalizeTxnId(txnId),
                    paymentProofHash: scan.imageHash || undefined,
                    paymentAmountDetected: scan.amountDetected ?? undefined,
                    paymentFlags: scan.flags.length ? scan.flags : undefined,
                    paymentScannedAt: scan.scannedAt,
                  }
                }

                const res = placeOrder({
                  customer: {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    address: form.address,
                    city: form.city,
                    state: form.state,
                  },
                  notes: form.notes || undefined,
                  discountCode: appliedCode || undefined,
                  paymentMethod,
                  paymentProof: paymentProof || undefined,
                })
                if (!res.ok || !res.order) {
                  setSubmitting(false)
                  setOrderError(res.message || 'We couldn’t place your order.')
                  toast.error(res.message)
                  return
                }
                const order = res.order

                if (paymentMethod === 'transfer' && (paymentMeta.paymentReference || paymentProof)) {
                  updateOrderPayment(order.id, {
                    paymentStatus: paymentProof ? 'proof_sent' : 'unpaid',
                    paymentProof: paymentProof || undefined,
                    ...paymentMeta,
                  } as Parameters<typeof updateOrderPayment>[1])
                }

                if (paymentMethod === 'paystack') {
                  const pay = await openPaystackPopup({
                    email: form.email,
                    amountNaira: order.total,
                    reference: order.id.replace(/[^a-zA-Z0-9]/g, '') + Date.now().toString(36),
                    metadata: {
                      order_id: order.id,
                      customer_name: form.name,
                      phone: form.phone,
                    },
                    onSuccess: (ref) => {
                      updateOrderPayment(order.id, {
                        paymentStatus: 'paid',
                        paymentReference: ref,
                      } as Parameters<typeof updateOrderPayment>[1])
                      toast.success(`Payment received · ref ${ref}`)
                      navigate({ to: '/order/$id', params: { id: order.id } })
                    },
                    onCancel: () => {
                      toast.message('Payment window closed — order is saved as unpaid')
                      navigate({ to: '/order/$id', params: { id: order.id } })
                    },
                  })
                  setSubmitting(false)
                  if (!pay.ok) {
                    toast.error(pay.message)
                    navigate({ to: '/order/$id', params: { id: order.id } })
                  }
                  return
                }

                setSubmitting(false)
                toast.success(
                  paymentMeta.paymentReference
                    ? `Order placed · ref ${paymentMeta.paymentReference}`
                    : 'Order placed — next, confirm on WhatsApp',
                )
                navigate({ to: '/order/$id', params: { id: order.id } })
              }}
            >
              {/* Step 1 — Contact */}
              <section className="space-y-4">
                <StepHeader n={1} title="Your details" />
                <Field label="Full name">
                  <input
                    required
                    autoComplete="name"
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={fieldClass}
                    placeholder="As on delivery"
                  />
                </Field>
                <Field label="WhatsApp number">
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={fieldClass}
                    placeholder="0801 234 5678"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">We’ll confirm your order here</p>
                </Field>
                <Field label="Email">
                  <input
                    required
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    name="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={fieldClass}
                    placeholder="you@email.com"
                  />
                </Field>
              </section>

              {/* Step 2 — Delivery */}
              <section className="space-y-4">
                <StepHeader n={2} title="Delivery" />
                <Field label="Street address">
                  <input
                    required
                    autoComplete="street-address"
                    name="address"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={fieldClass}
                    placeholder="House number, street, landmark"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City">
                    <input
                      required
                      autoComplete="address-level2"
                      name="city"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="State">
                    <select
                      name="state"
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      className={fieldClass}
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <p className="rounded-xl bg-secondary/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                  {deliveryNote(form.state)}
                  {afterDiscount < FREE_DELIVERY_THRESHOLD && (
                    <>
                      {' '}
                      Free delivery from {naira(FREE_DELIVERY_THRESHOLD)}.
                    </>
                  )}
                </p>
              </section>

              {/* Step 3 — Pay */}
              <section className="space-y-4">
                <StepHeader n={3} title="Payment" />
                <div className="grid gap-3">
                  <PayOption
                    selected={paymentMethod === 'transfer'}
                    onSelect={() => setPaymentMethod('transfer')}
                    title="Bank transfer"
                    subtitle="Most popular · upload proof"
                  />
                  <PayOption
                    selected={paymentMethod === 'whatsapp'}
                    onSelect={() => setPaymentMethod('whatsapp')}
                    title="Confirm on WhatsApp"
                    subtitle="We’ll guide you after order"
                  />
                  <PayOption
                    selected={paymentMethod === 'paystack'}
                    onSelect={() => {
                      if (!paystackReady) {
                        toast.message('Card pay goes live when Paystack key is set')
                        return
                      }
                      setPaymentMethod('paystack')
                    }}
                    title="Card / bank (Paystack)"
                    subtitle={
                      paystackReady ? 'Pay securely after you place order' : 'Coming online soon'
                    }
                  />
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
                    <p className="text-sm font-medium">Transfer exactly {naira(total)}</p>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Bank</dt>
                        <dd className="text-right font-medium">{BRAND.bank.bankName}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Account</dt>
                        <dd className="flex items-center gap-2">
                          <span className="font-mono text-base font-semibold tracking-wide">
                            {BRAND.bank.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyAccount()}
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-background"
                            aria-label="Copy account number"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 border-t border-primary/15 pt-2">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="text-right text-xs font-medium">{BRAND.bank.accountName}</dd>
                      </div>
                    </dl>

                    <Field label="Transaction ID / reference *">
                      <input
                        required
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        onBlur={() => void runScan(paymentProof, txnId)}
                        placeholder="From bank SMS or app"
                        className={fieldClass}
                        autoCapitalize="characters"
                      />
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                        Unique per transfer so two people paying the same amount are never mixed up.
                      </p>
                    </Field>

                    <ImageSourcePicker
                      label="Payment screenshot (optional but helpful)"
                      value={paymentProof}
                      onChange={(v) => {
                        setPaymentProof(v)
                        void runScan(v, txnId)
                      }}
                    />
                    {scanning && <p className="text-xs text-muted-foreground">Scanning receipt…</p>}
                    {scanFlags.length > 0 && (
                      <ul className="space-y-1 text-xs">
                        {scanFlags.map((f) => (
                          <li
                            key={f.code + f.message}
                            className={
                              f.severity === 'critical'
                                ? 'font-medium text-destructive'
                                : 'text-amber-800'
                            }
                          >
                            {f.severity === 'critical' ? '🚩 ' : '⚠️ '}
                            {f.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>

              {/* Step 4 — extras */}
              <section className="space-y-4">
                <StepHeader n={4} title="Promo & notes" optional />
                <Field label="Discount code">
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="e.g. LAGOS10"
                      className={`${fieldClass} mt-0 min-w-0 flex-1`}
                      autoCapitalize="characters"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-2xl border border-border px-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
                      onClick={() => {
                        const v = validateDiscount(promo, afterBulk)
                        if (!v.ok) {
                          setCodeDiscount(0)
                          setAppliedCode('')
                          toast.error(v.message)
                          return
                        }
                        setCodeDiscount(v.discount)
                        setAppliedCode(promo.trim().toUpperCase())
                        toast.success(v.message)
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </Field>
                <Field label="Order notes (optional)">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className={fieldClass}
                    placeholder="Gate code, preferred time…"
                  />
                </Field>
              </section>

              {/* Desktop submit */}
              <button
                type="submit"
                disabled={submitting || scanning}
                className="hidden min-h-14 w-full items-center justify-center rounded-full bg-primary text-[12px] font-semibold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-50 md:flex"
              >
                {submitLabel}
              </button>
              <p className="hidden items-center justify-center gap-1.5 text-center text-xs text-muted-foreground md:flex">
                <Lock className="h-3.5 w-3.5" /> Your details stay with us · WhatsApp confirm
              </p>
            </form>
          </div>

          {/* Desktop summary */}
          <aside className="hidden h-fit rounded-2xl border border-border bg-card p-6 md:sticky md:top-6 md:block">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <p className="mt-1 text-xs text-muted-foreground">{cartCount} pieces in bag</p>
            <div className="mt-6">
              <OrderLines lines={bagLines} />
            </div>
            <div className="mt-4 rounded-xl bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
              Multi-buy: {BULK_TIERS.map((t) => t.label).join(' · ')}
            </div>
            <OrderTotals
              cartSubtotal={cartSubtotal}
              bulkAmount={bulkAmount}
              bulkLabel={bulkSavings.label}
              codeDiscount={codeDiscount}
              appliedCode={appliedCode}
              deliveryFee={deliveryFee}
              state={form.state}
              afterDiscount={afterDiscount}
              total={total}
            />
          </aside>
        </div>
      </main>

      {/* Sticky mobile checkout bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Total</p>
            <p className="truncate font-serif text-xl leading-tight">{naira(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting || scanning}
            className="flex min-h-12 min-w-[9.5rem] shrink-0 items-center justify-center rounded-full bg-primary px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-foreground disabled:opacity-50"
          >
            {submitting ? 'Working…' : paymentMethod === 'paystack' ? 'Pay now' : 'Place order'}
          </button>
        </div>
      </div>
    </StoreChrome>
  )
}

function StepHeader({ n, title, optional }: { n: number; title: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <div>
        <h2 className="font-serif text-xl leading-none">{title}</h2>
        {optional && (
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Optional</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function PayOption({
  selected,
  onSelect,
  title,
  subtitle,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-[3.5rem] w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
        selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border active:bg-secondary/40'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  )
}

function OrderLines({
  lines,
}: {
  lines: {
    item: { productId: number; size: string; quantity: number }
    product: { name: string; image: string; price: number }
  }[]
}) {
  return (
    <ul className="space-y-3">
      {lines.map(({ item, product }) => (
        <li key={`${item.productId}-${item.size}`} className="flex gap-3 text-sm">
          <img
            src={product.image}
            alt=""
            className="h-16 w-12 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{product.name}</p>
            <p className="text-muted-foreground">
              {item.size} × {item.quantity}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs">{naira(product.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  )
}

function OrderTotals({
  cartSubtotal,
  bulkAmount,
  bulkLabel,
  codeDiscount,
  appliedCode,
  deliveryFee,
  state,
  afterDiscount,
  total,
}: {
  cartSubtotal: number
  bulkAmount: number
  bulkLabel?: string
  codeDiscount: number
  appliedCode: string
  deliveryFee: number
  state: string
  afterDiscount: number
  total: number
}) {
  return (
    <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{naira(cartSubtotal)}</span>
      </div>
      {bulkAmount > 0 && (
        <div className="flex justify-between text-primary">
          <span>Bulk ({bulkLabel})</span>
          <span>−{naira(bulkAmount)}</span>
        </div>
      )}
      {codeDiscount > 0 && (
        <div className="flex justify-between text-primary">
          <span>Code ({appliedCode})</span>
          <span>−{naira(codeDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Delivery ({state})</span>
        <span>{deliveryFee === 0 ? 'Free' : naira(deliveryFee)}</span>
      </div>
      {afterDiscount < FREE_DELIVERY_THRESHOLD && (
        <p className="text-xs text-muted-foreground">
          Free delivery from {naira(FREE_DELIVERY_THRESHOLD)}.
        </p>
      )}
      <div className="flex justify-between pt-1 text-base font-semibold">
        <span>Total</span>
        <span>{naira(total)}</span>
      </div>
    </div>
  )
}
