import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ProductCard, StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { SIZES, totalStock } from '@/lib/catalog'
import { unitsSold } from '@/lib/commerce'

type ShopSearch = {
  category?: string
  badge?: string
  q?: string
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller'

export const Route = createFileRoute('/shop')({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search.category === 'string' ? search.category : undefined,
    badge: typeof search.badge === 'string' ? search.badge : undefined,
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Shop · Big ITunes Collection' },
      { name: 'description', content: 'Shop dresses, tops, sets, and more from Big ITunes Collection.' },
    ],
  }),
  component: ShopPage,
})

function ShopPage() {
  const { category, badge, q } = Route.useSearch()
  const { activeProducts, orders } = useShop()
  const [localQ, setLocalQ] = useState(q ?? '')
  const [sizeFilter, setSizeFilter] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [sort, setSort] = useState<SortKey>('featured')

  const filtered = useMemo(() => {
    let list = activeProducts
    if (category) list = list.filter((p) => p.category === category)
    if (badge) list = list.filter((p) => p.badge === badge)
    const query = (q ?? localQ).trim().toLowerCase()
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.color.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }
    if (sizeFilter) {
      list = list.filter((p) => (p.stock[sizeFilter] ?? 0) > 0)
    }
    if (maxPrice !== '' && maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice)
    }

    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') sorted.sort((a, b) => b.id - a.id)
    else if (sort === 'bestseller') {
      sorted.sort((a, b) => unitsSold(b.id, orders) - unitsSold(a.id, orders) || totalStock(b) - totalStock(a))
    }
    return sorted
  }, [activeProducts, category, badge, q, localQ, sizeFilter, maxPrice, sort, orders])

  return (
    <StoreChrome>
      <main className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Shop</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] md:text-5xl">
          {category || badge || (q ? `Results for “${q}”` : 'All pieces')}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{filtered.length} styles</p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {['', 'Dresses', 'Tops', 'Skirts', 'Sets', 'Jumpsuits'].map((c) => (
              <Link
                key={c || 'all'}
                to="/shop"
                search={{ category: c || undefined, badge, q }}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  (category || '') === c
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {c || 'All'}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Size in stock
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="mt-1 block w-full min-w-[120px] border border-border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Any size</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Max price (₦)
              </label>
              <select
                value={maxPrice === '' ? '' : String(maxPrice)}
                onChange={(e) =>
                  setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="mt-1 block w-full min-w-[140px] border border-border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Any price</option>
                <option value="30000">Under ₦30,000</option>
                <option value="50000">Under ₦50,000</option>
                <option value="75000">Under ₦75,000</option>
                <option value="100000">Under ₦100,000</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="mt-1 block w-full min-w-[160px] border border-border bg-transparent px-3 py-2 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="bestseller">Best selling</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
            <form
              className="flex flex-1 gap-2 sm:justify-end"
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = `/shop?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(badge ? { badge } : {}),
                  ...(localQ ? { q: localQ } : {}),
                }).toString()}`
              }}
            >
              <input
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="Search…"
                className="min-w-0 flex-1 border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-xs"
              />
              <button
                type="submit"
                className="bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">No pieces match your filters.</p>
        )}
      </main>
    </StoreChrome>
  )
}
