import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'
import { formatPackageDeals } from '@/lib/bulk'
import { SIZES, isLowStock, totalStock } from '@/lib/catalog'
import { naira } from '@/lib/format'
import type { Product, ProductPackageDeal } from '@/lib/types'

export const Route = createFileRoute('/app/inventory')({
  head: () => ({ meta: [{ title: 'Inventory · Studio' }] }),
  component: InventoryAdmin,
})

function InventoryAdmin() {
  const { products, setStock, updateProduct } = useShop()
  const [editing, setEditing] = useState<Product | null>(null)
  const low = products.filter(isLowStock)
  const totalUnits = products.reduce((s, p) => s + totalStock(p), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Stock</p>
        <h1 className="mt-1 font-serif text-3xl">Inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Each cloth has its own photo, description, sizes, and optional piece packages (e.g. 5 pcs
          ₦15k). Packages are not site-wide — only for that piece.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {products.length} styles · {totalUnits} units · {low.length} low stock
        </p>
      </div>

      {low.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-900">Low stock</p>
          <ul className="mt-2 list-inside list-disc text-amber-900/90">
            {low.map((p) => (
              <li key={p.id}>
                {p.name} — {totalStock(p)} left
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {products.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border bg-card p-4 shadow-sm ${
              isLowStock(p) ? 'border-amber-500/50' : 'border-border/80'
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              {p.image ? (
                <img src={p.image} alt="" className="h-20 w-14 rounded-lg object-cover" />
              ) : (
                <div className="flex h-20 w-14 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted-foreground">
                  No photo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {p.barcode} · {p.category} · {naira(p.price)} · total {totalStock(p)}
                </p>
                {p.packageDeals && p.packageDeals.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    Packages: {formatPackageDeals(p.packageDeals)}
                  </p>
                )}
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium"
                    onClick={() => setEditing({ ...p, packageDeals: p.packageDeals ?? [] })}
                  >
                    Edit photo, description & packages
                  </button>
                  <Link
                    to="/product/$id"
                    params={{ id: String(p.id) }}
                    className="rounded-full px-3 py-1 text-xs text-primary underline"
                  >
                    View as shopper
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SIZES.map((size) => (
                <label key={size} className="text-xs">
                  <span className="text-muted-foreground">{size}</span>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1 h-9 rounded-xl"
                    value={p.stock[size] ?? 0}
                    onChange={(e) => setStock(p.id, size, Number(e.target.value))}
                    onBlur={() => toast.message(`Saved ${p.name} · ${size}`)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditPieceModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            updateProduct(next)
            toast.success('Piece updated')
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function EditPieceModal({
  product,
  onClose,
  onSave,
}: {
  product: Product
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [draft, setDraft] = useState<Product>(product)
  const deals = draft.packageDeals ?? []

  function setDeal(i: number, patch: Partial<ProductPackageDeal>) {
    const next = [...deals]
    next[i] = { ...next[i], ...patch }
    setDraft({ ...draft, packageDeals: next })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 shadow-lg sm:rounded-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">This piece only</p>
        <h2 className="mt-1 font-serif text-2xl">{draft.name || 'Cloth details'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Photo, description, and piece packages apply only to this cloth — not the whole site.
        </p>

        <div className="mt-5 space-y-4">
          <ImageSourcePicker
            label="Photo of this cloth"
            value={draft.image}
            onChange={(image) => setDraft({ ...draft, image })}
          />
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              className="mt-1.5 rounded-xl"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1.5 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Fabric, fit, when to wear it…"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Single-piece price (₦)</label>
            <Input
              type="number"
              className="mt-1.5 rounded-xl"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            />
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="text-sm font-medium">Piece packages (optional)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Example: 5 pcs for ₦15,000 and 10 pcs for ₦30,000 — only when buying this cloth.
            </p>
            <div className="mt-3 space-y-2">
              {deals.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="number"
                    min={2}
                    className="rounded-xl"
                    placeholder="Pcs"
                    value={d.units || ''}
                    onChange={(e) => setDeal(i, { units: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    min={0}
                    className="rounded-xl"
                    placeholder="Package ₦"
                    value={d.packagePrice || ''}
                    onChange={(e) => setDeal(i, { packagePrice: Number(e.target.value) })}
                  />
                  <button
                    type="button"
                    className="text-xs text-destructive"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        packageDeals: deals.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-primary"
              onClick={() =>
                setDraft({
                  ...draft,
                  packageDeals: [...deals, { units: 5, packagePrice: 15000 }],
                })
              }
            >
              + Add package tier
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-full border border-border py-3 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              const cleaned = (draft.packageDeals ?? []).filter(
                (d) => d.units >= 2 && d.packagePrice > 0,
              )
              onSave({ ...draft, packageDeals: cleaned.length ? cleaned : undefined })
            }}
          >
            Save piece
          </button>
        </div>
      </div>
    </div>
  )
}
