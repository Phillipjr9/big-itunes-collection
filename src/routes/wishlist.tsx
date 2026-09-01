import { createFileRoute, Link } from '@tanstack/react-router'
import { ProductCard, StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'

export const Route = createFileRoute('/wishlist')({
  head: () => ({ meta: [{ title: 'Wishlist · Big ITunes Collection' }] }),
  component: WishlistPage,
})

function WishlistPage() {
  const { wishlist, getProduct } = useShop()
  const items = wishlist.map((id) => getProduct(id)).filter(Boolean)

  return (
    <StoreChrome>
      <main className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
        <h1 className="font-serif text-4xl">Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">{items.length} saved looks</p>
        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Nothing saved yet.</p>
            <Link to="/shop" className="mt-4 inline-block text-primary underline">
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
            {items.map((p, i) => p && <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </main>
    </StoreChrome>
  )
}
