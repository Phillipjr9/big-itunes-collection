import { createFileRoute } from '@tanstack/react-router'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import {
  FREE_DELIVERY_THRESHOLD,
  NIGERIAN_STATES,
  deliveryFeeForState,
} from '@/lib/delivery'
import { naira } from '@/lib/format'

export const Route = createFileRoute('/delivery')({
  head: () => ({ meta: [{ title: 'Delivery · Big ITunes Collection' }] }),
  component: DeliveryPage,
})

function DeliveryPage() {
  const sample = ['Lagos', 'Ogun', 'FCT Abuja', 'Rivers', 'Kano', 'Enugu'] as const

  return (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">Delivery information</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
          <p>
            We ship nationwide from Lagos. Orders of{' '}
            <strong className="text-foreground">{naira(FREE_DELIVERY_THRESHOLD)}</strong> or more
            (after discount) get <strong className="text-foreground">free delivery</strong>.
          </p>
          <p>
            <strong className="text-foreground">Lagos:</strong> typically 1–3 working days.
            <br />
            <strong className="text-foreground">Other states:</strong> typically 3–7 working days
            depending on courier.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">State (examples)</th>
                  <th className="px-4 py-3">Fee</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((state) => (
                  <tr key={state} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{state}</td>
                    <td className="px-4 py-3 font-mono">{naira(deliveryFeeForState(state, 1))}</td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">Other states</td>
                  <td className="px-4 py-3 font-mono">{naira(deliveryFeeForState('Zamfara', 1))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs">
            We deliver to all {NIGERIAN_STATES.length} states & FCT. Exact fee is calculated at checkout
            when you pick your state.
          </p>
          <p>
            After you place an order, confirm on WhatsApp so we can verify payment and schedule
            dispatch.
          </p>
        </div>
      </main>
    </StoreChrome>
  )
}
