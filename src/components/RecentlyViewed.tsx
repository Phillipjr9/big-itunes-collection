import { Link } from '@tanstack/react-router'
import { ProductCard } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'

export function RecentlyViewed({
  excludeId,
  dark = false,
  title = 'Recently viewed',
}: {
  excludeId?: number
  dark?: boolean
  title?: string
}) {
  const { recentlyViewed, getProduct } = useShop()
  const products = recentlyViewed
    .filter((id) => id !== excludeId)
    .map((id) => getProduct(id))
    .filter(Boolean)
    .slice(0, 8) as NonNullable<ReturnType<typeof getProduct>>[]

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{title}</p>
      <h2
        className={`mt-2 font-serif text-2xl tracking-tight md:text-3xl ${
          dark ? 'text-background' : 'text-foreground'
        }`}
      >
        Pick up where you left off
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-5">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} dark={dark} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link to="/shop" className="text-sm text-primary underline">
          Browse all pieces
        </Link>
      </div>
    </section>
  )
}
