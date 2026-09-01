import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { StoreChrome } from '@/components/storefront/StoreChrome'
import { BRAND, whatsappUrl } from '@/lib/brand'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact · Big ITunes Collection' }] }),
  component: ContactPage,
})

function ContactPage() {
  return (
    <StoreChrome>
      <main className="mx-auto max-w-xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">Contact us</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {BRAND.location} · {BRAND.email}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl('Hi Big ITunes Collection!')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center bg-[#25D366] py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
          >
            WhatsApp {BRAND.phoneDisplay}
          </a>
          <a
            href={BRAND.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center border border-border py-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            TikTok @{BRAND.tiktokHandle}
          </a>
        </div>
        <form
          className="mt-10 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.target as HTMLFormElement)
            const name = String(fd.get('name') || '')
            const message = String(fd.get('message') || '')
            window.open(
              whatsappUrl(`Hi Big ITunes! I'm ${name}.\n\n${message}`),
              '_blank',
              'noopener,noreferrer',
            )
            toast.success('Opening WhatsApp…')
            ;(e.target as HTMLFormElement).reset()
          }}
        >
          <input
            required
            name="name"
            placeholder="Your name"
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <textarea
            required
            name="message"
            rows={5}
            placeholder="How can we help?"
            className="w-full border border-border bg-transparent px-3 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Send via WhatsApp
          </button>
        </form>
      </main>
    </StoreChrome>
  )
}
