import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/app/packages')({
  head: () => ({ meta: [{ title: 'Piece packages · Studio' }] }),
  component: PackagesHelp,
})

function PackagesHelp() {
  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Sales model</p>
        <h1 className="mt-1 font-serif text-3xl">Piece packages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Packages are set <strong>per cloth</strong> in Inventory — not as a banner on every page.
          Each piece has its own photo, description, and optional pack prices (e.g. 5 pcs ₦15k).
        </p>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Open Inventory</li>
        <li>Tap “Edit photo, description & packages” on a cloth</li>
        <li>Upload photo, write description, add package tiers</li>
        <li>Save — shoppers only see packs on that product / when they buy enough of it</li>
      </ol>
      <Link
        to="/app/inventory"
        className="inline-flex rounded-full bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
      >
        Go to Inventory
      </Link>
    </div>
  )
}
