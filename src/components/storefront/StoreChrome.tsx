import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { BrandLogo } from '@/components/BrandLogo'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { useShop } from '@/context/ShopContext'
import { BRAND, whatsappUrl } from '@/lib/brand'
import { isLowStock, totalStock } from '@/lib/catalog'
import { naira } from '@/lib/format'
import { unitsSold } from '@/lib/commerce'

const NAV = [
  { label: 'Shop', to: '/shop' },
  { label: 'New Arrivals', to: '/shop?badge=New' },
  { label: 'Dresses', to: '/shop?category=Dresses' },
  { label: 'Tops', to: '/shop?category=Tops' },
  { label: 'Sets', to: '/shop?category=Sets' },
  { label: 'Sale', to: '/shop?badge=Sale' },
]

export function StoreChrome({
  children,
  onOpenSearch,
}: {
  children: ReactNode
  onOpenSearch?: () => void
}) {
  const {
    cart,
    cartCount,
    cartSubtotal,
    bulkSavings,
    wishlist,
    getProduct,
    removeFromCart,
    updateCartQty,
    cartOpenSignal,
  } = useShop()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const lastCartSignal = useRef(cartOpenSignal)

  useEffect(() => {
    if (cartOpenSignal > lastCartSignal.current) {
      lastCartSignal.current = cartOpenSignal
      setCartOpen(true)
    } else {
      lastCartSignal.current = cartOpenSignal
    }
  }, [cartOpenSignal])

  const afterPackage = Math.max(0, cartSubtotal - bulkSavings.amount)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <div className="bg-primary px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground">
        Complimentary delivery in Lagos on orders over ₦100,000 · WhatsApp {BRAND.phoneDisplay}
      </div>
      <header className="relative z-20 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-10">
          <button type="button" className="lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo />
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to.split('?')[0]}
                search={Object.fromEntries(new URLSearchParams(item.to.split('?')[1] || ''))}
                className="text-[11px] font-medium uppercase tracking-[0.12em] transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/track-order"
              className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground hover:text-primary sm:inline"
            >
              Track
            </Link>
            <button
              type="button"
              aria-label="Search"
              className="hidden transition-transform hover:scale-110 sm:block"
              onClick={() => onOpenSearch?.()}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden transition-transform hover:scale-110 sm:block"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              className="relative transition-transform hover:scale-110"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="bg-foreground px-5 py-14 text-background md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo className="[&_img]:h-14 [&_img]:max-w-[180px] md:[&_img]:h-16 md:[&_img]:max-w-[220px]" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-background/55">
              Women’s clothing for every version of you. Based in Nigeria, styled everywhere.
            </p>
            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.16em] text-background/45">
              © 2026 Big ITunes Collection
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Shop</h3>
            <ul className="mt-5 space-y-3">
              {['New Arrivals', 'Dresses', 'Tops', 'Skirts', 'Sets'].map((label) => (
                <li key={label}>
                  <Link
                    to="/shop"
                    search={label === 'New Arrivals' ? { badge: 'New' } : { category: label }}
                    className="text-sm text-background/60 transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Customer care</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-background/60 hover:text-primary">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-sm text-background/60 hover:text-primary">
                  Track order
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-sm text-background/60 hover:text-primary">
                  Delivery information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-background/60 hover:text-primary">
                  Returns & exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-sm text-background/60 hover:text-primary">
                  Size guide
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-sm text-background/60 hover:text-primary">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-background/60 hover:text-primary">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Follow her</h3>
            <ul className="mt-5 space-y-3 text-sm text-background/60">
              <li>
                <a href={BRAND.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  TikTok @{BRAND.tiktokHandle}
                </a>
              </li>
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  WhatsApp {BRAND.phoneDisplay}
                </a>
              </li>
              <li>{BRAND.location}</li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-primary">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-background p-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <BrandLogo />
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="mt-20 flex flex-col gap-6 font-serif text-4xl">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to.split('?')[0]}
                  search={Object.fromEntries(new URLSearchParams(item.to.split('?')[1] || ''))}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/track-order" onClick={() => setMenuOpen(false)}>
                Track order
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close cart"
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background p-6 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Your edit</p>
                  <h2 className="mt-1 font-serif text-3xl">Shopping bag</h2>
                </div>
                <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-5">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ShoppingBag className="h-8 w-8 text-primary/50" />
                    <p className="mt-4 font-serif text-2xl">Your bag is waiting.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cart.map((item) => {
                      const product = getProduct(item.productId)
                      if (!product) return null
                      return (
                        <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                          <img src={product.image} alt={product.name} className="h-28 w-20 object-cover" />
                          <div className="flex-1">
                            <p className="font-serif text-lg">{product.name}</p>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                              Size {item.size} · {product.color}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                className="h-7 w-7 border border-border text-sm"
                                onClick={() => updateCartQty(item.productId, item.size, item.quantity - 1)}
                              >
                                −
                              </button>
                              <span className="font-mono text-sm">{item.quantity}</span>
                              <button
                                type="button"
                                className="h-7 w-7 border border-border text-sm"
                                onClick={() => updateCartQty(item.productId, item.size, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-mono text-sm">{naira(product.price * item.quantity)}</span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId, item.size)}
                                className="text-[10px] uppercase tracking-[0.12em] text-primary"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t border-border pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{naira(cartSubtotal)}</span>
                  </div>
                  {bulkSavings.amount > 0 && (
                    <div className="mt-1 flex justify-between gap-2 text-sm text-primary">
                      <span className="min-w-0 truncate">Piece packages</span>
                      <span className="shrink-0">−{naira(bulkSavings.amount)}</span>
                    </div>
                  )}
                  {bulkSavings.nextHint && (
                    <p className="mt-2 text-xs text-muted-foreground">{bulkSavings.nextHint}</p>
                  )}
                  {bulkSavings.amount > 0 && (
                    <div className="mt-2 flex justify-between text-sm font-semibold">
                      <span>After packages</span>
                      <span>{naira(afterPackage)}</span>
                    </div>
                  )}
                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 flex w-full items-center justify-center gap-3 bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
                  >
                    Proceed to checkout
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProductCard({
  product,
  index = 0,
  dark = false,
}: {
  product: import('@/lib/types').Product
  index?: number
  dark?: boolean
}) {
  const { wishlist, toggleWishlist, addToCart, orders } = useShop()
  const isWishlisted = wishlist.includes(product.id)
  const text = dark ? 'text-background' : 'text-foreground'
  const muted = dark ? 'text-background/50' : 'text-muted-foreground'
  const sold = unitsSold(product.id, orders)
  const low = isLowStock(product)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group"
    >
      <div className="relative overflow-hidden bg-secondary">
        <Link to="/product/$id" params={{ id: String(product.id) }}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[0.78] h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-background px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground">
            {product.badge}
          </span>
        )}
        {low && (
          <span className="absolute bottom-3 left-3 bg-primary px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-primary-foreground">
            Low stock
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          aria-label={`Wishlist ${product.name}`}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/90 ${
            isWishlisted ? 'text-primary' : 'text-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to="/product/$id" params={{ id: String(product.id) }}>
              <h3 className={`font-serif text-lg md:text-xl ${text}`}>{product.name}</h3>
            </Link>
            <p className={`mt-1 font-mono text-[9px] uppercase tracking-[0.12em] ${muted}`}>
              {product.color} · {totalStock(product)} in stock
              {sold > 0 ? ` · ${sold} sold` : ''}
            </p>
          </div>
          <div className={`text-right font-mono text-xs ${text}`}>
            <p>{naira(product.price)}</p>
            {product.oldPrice > 0 && (
              <p className={`mt-1 text-[10px] line-through ${muted}`}>{naira(product.oldPrice)}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const res = addToCart(product.id, 'M')
            if (res.ok) toast.success('Added to bag', { description: res.message })
            else toast.error(res.message)
          }}
          className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent hover:text-primary"
        >
          Quick add (M)
        </button>
      </div>
    </motion.article>
  )
}
