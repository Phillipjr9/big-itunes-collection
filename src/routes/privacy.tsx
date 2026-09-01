import { createFileRoute, Link } from '@tanstack/react-router'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { BRAND, whatsappUrl } from '@/lib/brand'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy · Big ITunes Collection' },
      {
        name: 'description',
        content:
          'How Big ITunes Collection collects, uses, stores, and deletes personal data for orders and support.',
      },
    ],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Legal</p>
        <h1 className="mt-2 font-serif text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026 · {BRAND.location}</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="font-serif text-xl text-foreground">Who we are</h2>
            <p className="mt-2">
              {BRAND.name} (“we”, “us”) is a women’s fashion brand operating online and via WhatsApp.
              Contact: {BRAND.email} · {BRAND.phoneDisplay}.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">What data we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Order details:</strong> name, email, phone, delivery
                address, city, state, order notes
              </li>
              <li>
                <strong className="text-foreground">Payment status:</strong> method (transfer, WhatsApp,
                Paystack) and status — not full card numbers (handled by Paystack when used)
              </li>
              <li>
                <strong className="text-foreground">Optional:</strong> payment proof images you upload,
                waitlist email, newsletter email, return requests
              </li>
              <li>
                <strong className="text-foreground">Device / local:</strong> bag, wishlist, and preferences
                stored in your browser (localStorage) on this device
              </li>
              <li>
                <strong className="text-foreground">Camera / photos:</strong> only when you choose to take or
                upload a product or payment photo in Studio or checkout
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">How we use data</h2>
            <p className="mt-2">
              To fulfil orders, confirm payment, arrange delivery, support you on WhatsApp, improve the
              shop, and send updates only if you subscribed. We do <strong className="text-foreground">not
              sell</strong> your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">Sharing</h2>
            <p className="mt-2">
              We may share necessary details with payment providers (e.g. Paystack), delivery partners, and
              tools that host our website. Those parties must protect data to a standard consistent with this
              policy. WhatsApp is operated by Meta; messages you send there are also subject to Meta’s terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">Retention</h2>
            <p className="mt-2">
              Order records are kept as long as needed for fulfilment, returns, accounting, and legal
              requirements. Newsletter data is kept until you unsubscribe. Browser local data stays until you
              clear site data or we provide a clear-data control.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">Your rights & deletion</h2>
            <p className="mt-2">
              You may request access, correction, or <strong className="text-foreground">deletion</strong> of
              personal data we hold about you (orders, email list, waitlist), subject to legal record-keeping.
            </p>
            <p className="mt-2">
              Request deletion via:{' '}
              <a className="text-primary underline" href={`mailto:${BRAND.email}?subject=Data%20deletion%20request`}>
                {BRAND.email}
              </a>{' '}
              or{' '}
              <a
                className="text-primary underline"
                href={whatsappUrl(
                  'Hi Big ITunes — please delete my personal data associated with my orders / email. My phone/email: ',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {BRAND.phoneDisplay}
              </a>
              . We aim to respond within 14 days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">Children</h2>
            <p className="mt-2">
              Our shop is intended for adults purchasing fashion. We do not knowingly collect data from
              children under 13.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">Changes</h2>
            <p className="mt-2">
              We may update this policy; the “Last updated” date will change. Continued use of the site means
              you accept the updated policy.
            </p>
          </section>

          <p>
            See also our{' '}
            <Link to="/terms" className="text-primary underline">
              Terms of service
            </Link>
            .
          </p>
        </div>
      </main>
    </StoreChrome>
  )
}
