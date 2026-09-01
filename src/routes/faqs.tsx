import { createFileRoute } from '@tanstack/react-router'
import { StoreChrome } from '@/components/storefront/StoreChrome'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Lagos usually 1–3 working days; other cities 3–7 working days.',
  },
  {
    q: 'Do you offer free delivery?',
    a: 'Yes — complimentary delivery in Lagos on orders over ₦100,000.',
  },
  {
    q: 'Can I exchange sizes?',
    a: 'Unworn items with tags can be exchanged within 7 days, subject to stock.',
  },
  {
    q: 'How do I track my order?',
    a: 'Use your order ID from the confirmation page. Our team also follows up by phone/email.',
  },
]

export const Route = createFileRoute('/faqs')({
  head: () => ({ meta: [{ title: 'FAQs · Big ITunes Collection' }] }),
  component: () => (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">FAQs</h1>
        <dl className="mt-10 space-y-8">
          {FAQS.map((item) => (
            <div key={item.q}>
              <dt className="font-serif text-xl">{item.q}</dt>
              <dd className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </main>
    </StoreChrome>
  ),
})
