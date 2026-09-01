import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, MessageCircle, Ruler, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { ProductCard, StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { BRAND, productWhatsAppMessage, whatsappUrl } from '@/lib/brand'
import { SEED_PRODUCTS } from '@/lib/catalog'
import {
  deliverySummaryLine,
  relatedProducts,
  scarcityLabel,
  unitsSold,
} from '@/lib/commerce'
import { naira } from '@/lib/format'
import { RETURN_HINT, SHIPPING_HINT, SIZE_HINT, reviewsForProduct } from '@/lib/trust'

export const Route = createFileRoute('/product/$id')({
  head: ({ params }) => {
    const p = SEED_PRODUCTS.find((x) => String(x.id) === params.id)
    return {
      meta: [
        { title: p ? `${p.name} · Big ITunes Collection` : 'Product · Big ITunes Collection' },
        { name: 'description', content: p?.description ?? BRAND.promise },
        { property: 'og:title', content: p ? `${p.name} · Big ITunes` : 'Big ITunes Collection' },
        { property: 'og:description', content: p?.description ?? BRAND.tagline },
      ],
    }
  },
  component: ProductPage,
})

function ProductPage() {
  const { id } = Route.useParams()
  const {
    getProduct,
    addToCart,
    toggleWishlist,
    wishlist,
    joinWaitlist,
    trackProductView,
    activeProducts,
    orders,
  } = useShop()
  const product = getProduct(Number(id))
  const [size, setSize] = useState('M')
  const [waitEmail, setWaitEmail] = useState('')
  const [etaState] = useState('Lagos')
  const [gallery, setGallery] = useState(0)

  useEffect(() => {
    if (product) trackProductView(product.id)
  }, [product?.id, trackProductView])

  const related = useMemo(
    () => (product ? relatedProducts(product, activeProducts, 4) : []),
    [product, activeProducts],
  )

  const images = useMemo(() => {
    if (!product) return []
    const list = [product.image, ...(product.images ?? [])].filter(Boolean)
    return [...new Set(list)]
  }, [product])

  const reviews = useMemo(
    () => (product ? reviewsForProduct(product.id) : []),
    [product],
  )

  if (!product || !product.active) {
    return (
      <StoreChrome>
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">Piece not found</h1>
          <Link to="/shop" className="mt-6 inline-block text-primary underline">
            Back to shop
          </Link>
        </main>
      </StoreChrome>
    )
  }

  const stock = product.stock[size] ?? 0
  const wishlisted = wishlist.includes(product.id)
  const sold = unitsSold(product.id, orders)
  const scarcity = scarcityLabel(product, size)
  const waOrder = whatsappUrl(
    productWhatsAppMessage({ name: product.name, price: product.price, size }),
  )

  return (
    <StoreChrome>
      <main className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-2 md:px-10 lg:py-16">
        <div>
          <div className="overflow-hidden bg-secondary">
            <img
              src={images[gallery] ?? product.image}
              alt={product.name}
              className="aspect-[0.78] w-full object-cover"
              loading="eager"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setGallery(i)}
                  className={`h-16 w-12 shrink-0 overflow-hidden border-2 ${
                    gallery === i ? 'border-primary' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            {product.category}
            {product.badge ? ` · ${product.badge}` : ''}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-none md:text-5xl">{product.name}</h1>
          <p className="mt-2 text-xs text-muted-foreground">{BRAND.tagline}</p>
          <div className="mt-5 flex items-baseline gap-3 font-mono">
            <span className="text-xl">{naira(product.price)}</span>
            {product.oldPrice > 0 && (
              <span className="text-sm text-muted-foreground line-through">{naira(product.oldPrice)}</span>
            )}
          </div>
          {(sold > 0 || scarcity) && (
            <p className="mt-3 text-sm text-muted-foreground">
              {sold > 0 && <span>{sold} sold</span>}
              {sold > 0 && scarcity ? ' · ' : ''}
              {scarcity && <span className="font-medium text-primary">{scarcity}</span>}
            </p>
          )}
          <p className="mt-6 text-sm leading-7 text-muted-foreground">{product.description}</p>
          {(product.fabric || product.care) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {product.fabric && <span>Fabric · {product.fabric}</span>}
              {product.fabric && product.care ? ' · ' : ''}
              {product.care && <span>Care · {product.care}</span>}
            </p>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Color · {product.color}
          </p>

          <div className="mt-6 space-y-2">
            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/40 px-4 py-3 text-sm">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{deliverySummaryLine(etaState, product.price)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{SHIPPING_HINT}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/80 px-4 py-3 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{BRAND.returnWindowDays}-day easy exchange</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{RETURN_HINT}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/80 px-4 py-3 text-sm">
              <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Fit tip</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{SIZE_HINT}</p>
                <Link to="/size-guide" className="mt-1 inline-block text-xs text-primary underline">
                  Open full size guide
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em]">Select size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const available = (product.stock[s] ?? 0) > 0
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex h-11 w-11 items-center justify-center border text-xs transition-colors ${
                      size === s
                        ? 'border-primary bg-primary text-primary-foreground'
                        : available
                          ? 'border-border hover:border-primary'
                          : 'border-border/40 text-muted-foreground line-through'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </p>
          </div>

          {stock < 1 ? (
            <form
              className="mt-8 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const res = joinWaitlist(product.id, size, waitEmail)
                if (res.ok) {
                  toast.success(res.message)
                  setWaitEmail('')
                } else toast.error(res.message)
              }}
            >
              <p className="text-sm">Join the waitlist for size {size}:</p>
              <input
                required
                type="email"
                value={waitEmail}
                onChange={(e) => setWaitEmail(e.target.value)}
                placeholder="Email"
                className="w-full border border-border px-3 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full border border-primary py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
              >
                Notify me
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    const res = addToCart(product.id, size)
                    if (res.ok) toast.success('Added to bag', { description: res.message })
                    else toast.error(res.message)
                  }}
                  className="flex flex-1 items-center justify-center gap-3 bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to bag
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="flex items-center justify-center gap-2 border border-border px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em]"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? 'fill-primary text-primary' : ''}`} />
                  {wishlisted ? 'Saved' : 'Save'}
                </button>
              </div>
              <a
                href={waOrder}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#128C7E]"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mt-10 border-t border-border pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                From our customers
              </p>
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border/70 bg-card/50 px-4 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{r.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.name} · {r.city}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] border-t border-border px-5 py-14 md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Inspired by your pick</p>
          <h2 className="mt-2 font-serif text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </StoreChrome>
  )
}
