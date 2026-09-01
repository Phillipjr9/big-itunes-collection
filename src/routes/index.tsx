import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { ProductCard, StoreChrome } from '@/components/storefront/StoreChrome'
import { useShop } from '@/context/ShopContext'
import { BRAND } from '@/lib/brand'
import { CURATED_EDITS } from '@/lib/curation'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `Big ITunes Collection · ${BRAND.tagline}` },
      { name: 'description', content: BRAND.promise },
    ],
  }),
  component: Home,
})

function Home() {
  const { activeProducts, subscribe, homepage } = useShop()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [email, setEmail] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')

  const collectionProducts = useMemo(() => {
    let list =
      homepage.featuredProductIds.length > 0
        ? activeProducts.filter((p) => homepage.featuredProductIds.includes(p.id))
        : activeProducts
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory)
    }
    return list
  }, [activeProducts, homepage.featuredProductIds, selectedCategory])

  const under40 = useMemo(
    () => activeProducts.filter((p) => p.price <= 40000).slice(0, 4),
    [activeProducts],
  )

  const categories = useMemo(() => {
    const meta = [
      { name: 'Dresses' as const, image: homepage.categoryImages.Dresses },
      { name: 'Tops' as const, image: homepage.categoryImages.Tops },
      { name: 'Sets' as const, image: homepage.categoryImages.Sets },
      { name: 'Jumpsuits' as const, image: homepage.categoryImages.Jumpsuits },
    ]
    return meta.map((c) => ({
      ...c,
      count: `${activeProducts.filter((p) => p.category === c.name).length} styles`,
    }))
  }, [activeProducts, homepage.categoryImages])

  return (
    <StoreChrome onOpenSearch={() => setSearchOpen(true)}>
      <main id="top">
        {searchOpen && (
          <div className="border-b border-border bg-background px-5 py-4 md:px-10">
            <div className="mx-auto flex max-w-[1440px] gap-3">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dresses, sets, tops…"
                className="min-w-0 flex-1 border-b border-border bg-transparent py-2 text-sm outline-none"
              />
              <Link
                to="/shop"
                search={{ q: q || undefined }}
                onClick={() => setSearchOpen(false)}
                className="bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
              >
                Search
              </Link>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <section className="relative mx-auto grid min-h-[680px] max-w-[1440px] overflow-hidden bg-secondary lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col justify-center px-7 py-16 md:px-16 lg:px-20">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              {BRAND.tagline}
            </p>
            <h1 className="max-w-xl font-serif text-[clamp(3.7rem,8vw,7.6rem)] leading-[0.88] tracking-[-0.065em] text-foreground">
              {homepage.heroTitleLine1}
              <br />
              <em className="text-primary">{homepage.heroTitleLine2}</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground md:text-lg">
              {homepage.heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                Shop women’s collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                search={{ badge: 'New' }}
                className="inline-flex items-center gap-3 border border-primary/40 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Explore new arrivals
              </Link>
            </div>
          </div>
          <div className="relative min-h-[460px] overflow-hidden lg:min-h-0">
            <img
              src={homepage.heroImage}
              alt="Woman in an elegant fashion look"
              className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-transparent to-primary/10" />
          </div>
        </section>

        <section className="border-b border-border bg-background px-5 py-6 md:px-10">
          <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto pb-1">
            {CURATED_EDITS.map((edit) => (
              <Link
                key={edit.id}
                to="/shop"
                search={'search' in edit ? edit.search : edit.id === 'under40' ? { max: '40000' } : undefined}
                className="shrink-0 rounded-full border border-border px-4 py-2 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <span className="block text-xs font-semibold text-foreground">{edit.label}</span>
                <span className="block text-[10px] text-muted-foreground">{edit.hint}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 lg:py-28">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Shop by mood</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] md:text-5xl">
                Your next <em>favorite</em> look.
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary sm:flex"
            >
              View all pieces <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/shop"
                search={{ category: category.name }}
                className={`group relative overflow-hidden bg-secondary ${
                  index === 0 ? 'md:-translate-y-5' : index === 3 ? 'md:translate-y-5' : ''
                }`}
              >
                <div className="aspect-[0.78] overflow-hidden">
                  <img
                    src={category.image}
                    alt={`${category.name} women’s clothing`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-16 text-primary-foreground md:p-5 md:pt-20">
                  <h3 className="font-serif text-xl md:text-2xl">{category.name}</h3>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] opacity-80">
                    {category.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {under40.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Smart picks</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Under ₦40,000</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
              {under40.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

        <section id="collection" className="bg-foreground px-5 py-20 text-background md:px-10 lg:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Curated for you</p>
                <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] md:text-6xl">
                  The Big ITunes
                  <br />
                  <em className="text-primary">Collection</em>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-background/65">{BRAND.promise}</p>
            </div>
            <div className="my-10 flex gap-2 overflow-x-auto pb-2">
              {['All', 'Dresses', 'Tops', 'Skirts', 'Sets', 'Jumpsuits'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    selectedCategory === category
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-background/20 text-background/60 hover:border-primary hover:text-background'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
              {collectionProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} dark />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-background hover:border-primary hover:text-primary"
              >
                View full shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <RecentlyViewed />

        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:py-28">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">01 · Just in</p>
            <h2 className="mt-4 max-w-md font-serif text-5xl leading-[0.95] tracking-[-0.055em] md:text-7xl">
              New looks.
              <br />
              <em className="text-primary">Fresh energy.</em>
            </h2>
            <p className="mt-7 max-w-sm text-base leading-7 text-muted-foreground">
              Fresh styles for the woman who loves to stand out. Made for Lagos days, Abuja evenings,
              and everywhere your story takes you.
            </p>
            <Link
              to="/shop"
              search={{ badge: 'New' }}
              className="mt-8 inline-flex items-center gap-3 border-b border-primary pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
            >
              Shop the new arrivals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="mt-10 overflow-hidden bg-secondary">
              <img
                src={homepage.justInImage1}
                alt="Tailored neutral outfit"
                className="aspect-[0.78] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="overflow-hidden bg-secondary">
              <img
                src={homepage.justInImage2}
                alt="Feminine flowing dress"
                className="aspect-[0.78] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-secondary px-5 py-20 md:px-10 lg:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="relative">
              <p className="relative max-w-2xl font-serif text-4xl leading-[1.08] tracking-[-0.04em] md:text-6xl">
                Made for Her.
                <br />
                <em>Styled by Her.</em>
              </p>
              <p className="mt-7 max-w-md text-sm leading-6 text-muted-foreground">{BRAND.promise}</p>
            </div>
            <div className="relative mx-auto w-full max-w-sm rotate-2 overflow-hidden border-[10px] border-background shadow-lg">
              <img
                src={homepage.brandStoryImage}
                alt="Editorial fashion detail"
                className="aspect-[0.8] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section id="newsletter" className="bg-primary px-5 py-16 text-primary-foreground md:px-10 md:py-20">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                Stay in the know
              </p>
              <h2 className="mt-3 max-w-lg font-serif text-4xl leading-none tracking-[-0.045em] md:text-5xl">
                Don’t miss your next favorite look.
              </h2>
            </div>
            <form
              className="flex w-full max-w-md border-b border-primary-foreground/50 pb-3"
              onSubmit={(e) => {
                e.preventDefault()
                const res = subscribe(email)
                if (res.ok) {
                  toast.success(res.message)
                  setEmail('')
                } else toast.error(res.message)
              }}
            >
              <input
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                type="email"
                required
                className="min-w-0 flex-1 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-primary-foreground/60"
              />
              <button className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]" type="submit">
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </main>
    </StoreChrome>
  )
}
