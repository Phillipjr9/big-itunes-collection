import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'
import { useStudioConfig } from '@/context/StudioConfigContext'
import { SIZES, totalStock } from '@/lib/catalog'
import { naira } from '@/lib/format'
import type { Product, ProductBadge } from '@/lib/types'

export const Route = createFileRoute('/app/products')({
  head: () => ({ meta: [{ title: 'Your pieces · Studio' }] }),
  component: ProductsAdmin,
})

function blankProduct(defaultCategory: string): Omit<Product, 'id'> {
  return {
    name: '',
    slug: `piece-${Date.now()}`,
    price: 25000,
    oldPrice: 0,
    category: defaultCategory || 'Dresses',
    color: '',
    image: '',
    images: [],
    badge: 'New',
    description: '',
    sizes: [...SIZES],
    stock: Object.fromEntries(SIZES.map((s) => [s, 5])),
    barcode: `BIC-${Date.now().toString().slice(-6)}`,
    reorderPoint: 3,
    active: true,
  }
}

function ProductsAdmin() {
  const { products, updateProduct, addProduct } = useShop()
  const { categories } = useStudioConfig()
  const [editing, setEditing] = useState<(Product & { _isNew?: boolean }) | null>(null)
  const categoryOptions =
    categories.length > 0
      ? categories
      : ['Dresses', 'Tops', 'Skirts', 'Sets', 'Jumpsuits']

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Catalog</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Your pieces</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Add any cloth type from Cloth types in the sidebar. Photos, stock, and live shop toggle.
          </p>
        </div>
        <Button
          className="rounded-full px-5"
          onClick={() =>
            setEditing({ ...blankProduct(categoryOptions[0]), id: -1, _isNew: true })
          }
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add a new piece
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:border-primary/25"
          >
            <div className="aspect-[3/4] bg-secondary">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No photo yet
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-snug">{p.name || 'Untitled'}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {p.active ? 'Live in shop' : 'Hidden'} · {totalStock(p)} units
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm">{naira(p.price)}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setEditing({ ...p })}
              >
                Edit this piece
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 shadow-lg sm:rounded-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              {editing._isNew ? 'New piece' : 'Edit piece'}
            </p>
            <h2 className="mt-1 font-serif text-2xl">
              {editing._isNew ? 'Add something beautiful' : editing.name || 'Update details'}
            </h2>

            <div className="mt-5 space-y-4">
              <ImageSourcePicker
                label="Photo of the piece"
                value={editing.image}
                onChange={(image) => setEditing({ ...editing, image })}
              />
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  className="mt-1.5 rounded-xl"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Amara Satin Dress"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Price (₦)</label>
                  <Input
                    className="mt-1.5 rounded-xl"
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Was (₦, optional)</label>
                  <Input
                    className="mt-1.5 rounded-xl"
                    type="number"
                    value={editing.oldPrice}
                    onChange={(e) => setEditing({ ...editing, oldPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Cloth type</label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  >
                    {!categoryOptions.includes(editing.category) && editing.category && (
                      <option value={editing.category}>{editing.category}</option>
                    )}
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Missing a type? Add it under Cloth types.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Badge</label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                    value={editing.badge}
                    onChange={(e) =>
                      setEditing({ ...editing, badge: e.target.value as ProductBadge })
                    }
                  >
                    {['', 'New', 'Bestseller', 'Trending', 'Sale'].map((b) => (
                      <option key={b || 'none'} value={b}>
                        {b || 'None'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  className="mt-1.5 rounded-xl"
                  value={editing.color}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                  placeholder="e.g. Rose, Black"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Inventory — how many in each size?</p>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((s) => (
                    <label key={s} className="text-xs font-medium text-muted-foreground">
                      {s}
                      <Input
                        type="number"
                        className="mt-1 rounded-xl"
                        value={editing.stock[s] ?? 0}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            stock: { ...editing.stock, [s]: Math.max(0, Number(e.target.value)) },
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Short description</label>
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Fit, fabric, vibe…"
                />
              </div>
              <label className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Show this piece in the shop
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setEditing(null)}>
                Not now
              </Button>
              <Button
                className="flex-1 rounded-full"
                onClick={() => {
                  if (!editing.name.trim()) {
                    toast.error('Give your piece a name')
                    return
                  }
                  if (!editing.image) {
                    toast.error('Add a photo first')
                    return
                  }
                  const { _isNew, ...rest } = editing
                  if (_isNew) {
                    const { id: _id, ...input } = rest
                    addProduct({
                      ...input,
                      slug:
                        input.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '') || input.slug,
                    })
                    toast.success('Your new piece is ready')
                  } else {
                    updateProduct(rest)
                    toast.success('Saved')
                  }
                  setEditing(null)
                }}
              >
                Save piece
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
