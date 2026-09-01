import { createFileRoute, Link } from '@tanstack/react-router'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { BRAND } from '@/lib/brand'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service · Big ITunes Collection' },
      {
        name: 'description',
        content: 'Terms for shopping with Big ITunes Collection — orders, payment, delivery, and returns.',
      },
    ],
  }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Legal</p>
        <h1 className="mt-2 font-serif text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="font-serif text-xl text-foreground">Products & pricing</h2>
            <p className="mt-2">
              {BRAND.name} sells physical women’s clothing. Prices are in Nigerian Naira (₦) and may change.
              Stock is limited; we may cancel or adjust orders if an item is unavailable and will notify you.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-foreground">Orders & payment</h2>
            <p className="mt-2">
              Placing an order is an offer to buy. Payment may be bank transfer, WhatsApp-assisted, or online
              (e.g. Paystack) when enabled. Bank transfer orders remain unpaid until we confirm funds. Online
              payment success is shown only after the provider confirms payment.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-foreground">Delivery</h2>
            <p className="mt-2">
              Delivery fees and timelines vary by state and are shown at checkout. Estimates are not
              guarantees; delays can occur due to courier or location.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-foreground">Returns</h2>
            <p className="mt-2">
              Unworn items with tags may be exchanged within {BRAND.returnWindowDays} days as described on our{' '}
              <Link to="/returns" className="text-primary underline">
                returns page
              </Link>
              . Contact us on WhatsApp with your order ID.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-foreground">Support</h2>
            <p className="mt-2">
              WhatsApp {BRAND.phoneDisplay} · {BRAND.email} ·{' '}
              <Link to="/contact" className="text-primary underline">
                Contact
              </Link>
              .
            </p>
          </section>
          <p>
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </StoreChrome>
  )
}
