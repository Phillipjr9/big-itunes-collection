import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ImageIcon,
  Package,
  ShoppingBag,
  Warehouse,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { isLowStock, totalStock } from '@/lib/catalog'
import { naira, formatDate } from '@/lib/format'

export const Route = createFileRoute('/app/')({
  head: () => ({
    meta: [{ title: 'Studio · Big ITunes Collection' }],
  }),
  component: DashboardHome,
})

function DashboardHome() {
  const { products, orders, subscribers, activeProducts } = useShop()
  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0)
  const lowStock = products.filter(isLowStock)
  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed')
  const recent = [...orders].slice(0, 5)
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const actions = [
    {
      to: '/app/products' as const,
      title: 'Add a new piece',
      desc: 'Photo, price, sizes — ready for the shop.',
      icon: Package,
      accent: 'from-rose-500/15 to-primary/10',
      iconBg: 'bg-primary text-primary-foreground',
    },
    {
      to: '/app/homepage' as const,
      title: 'Homepage looks',
      desc: 'Hero and category photos shoppers see first.',
      icon: ImageIcon,
      accent: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      to: '/app/orders' as const,
      title: 'Orders',
      desc:
        pending.length > 0
          ? `${pending.length} need your attention.`
          : 'Inbox is clear — nice work.',
      icon: ShoppingBag,
      accent: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-700 text-white',
    },
    {
      to: '/app/inventory' as const,
      title: 'Stock',
      desc:
        lowStock.length > 0
          ? `${lowStock.length} running low.`
          : 'Levels look healthy.',
      icon: Warehouse,
      accent: 'from-slate-500/10 to-slate-400/5',
      iconBg: 'bg-slate-800 text-white',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3 w-3" /> Overview
          </div>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground md:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Big ITunes Collection · one place for products, orders, and the boutique face.
          </p>
        </div>
        <Link
          to="/app/products"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-95"
        >
          New product <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {(pending.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground">Needs a quick look</p>
              <p className="mt-0.5 text-muted-foreground">
                {pending.length > 0 && (
                  <>
                    {pending.length} order{pending.length === 1 ? '' : 's'} open
                    {lowStock.length > 0 ? ' · ' : ''}
                  </>
                )}
                {lowStock.length > 0 && (
                  <>
                    {lowStock.length} low-stock item{lowStock.length === 1 ? '' : 's'}
                  </>
                )}
              </p>
            </div>
          </div>
          <Link
            to={pending.length > 0 ? '/app/orders' : '/app/inventory'}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-semibold text-primary sm:self-auto"
          >
            Review <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Revenue',
            value: naira(revenue),
            sub: `${orders.length} orders total`,
            icon: TrendingUp,
          },
          {
            label: 'Open orders',
            value: String(pending.length),
            sub: 'Pending or confirmed',
            icon: ShoppingBag,
          },
          {
            label: 'Live products',
            value: String(activeProducts.length),
            sub: `${products.length} in catalog`,
            icon: Package,
          },
          {
            label: 'Waitlist emails',
            value: String(subscribers.length),
            sub: 'Newsletter list',
            icon: Sparkles,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-primary/50" />
            </div>
            <p className="mt-3 font-serif text-2xl tracking-tight text-foreground md:text-[1.65rem]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl text-foreground">Shortcuts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${a.accent} bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${a.iconBg} shadow-sm`}
                >
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground group-hover:text-primary">{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary opacity-0 transition group-hover:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-foreground">Recent orders</h2>
            <Link to="/app/orders" className="text-xs font-semibold text-primary">
              See all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet — your first sale will show here.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{o.customer.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {o.id} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{naira(o.total)}</p>
                    <p className="text-[10px] capitalize text-muted-foreground">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-serif text-lg text-foreground">Catalog health</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Units in stock</span>
              <span className="font-semibold">
                {products.reduce((s, p) => s + totalStock(p), 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low stock alerts</span>
              <span className={`font-semibold ${lowStock.length ? 'text-primary' : ''}`}>
                {lowStock.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active listings</span>
              <span className="font-semibold">{activeProducts.length}</span>
            </div>
            <Link
              to="/app/inventory"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:border-primary hover:text-primary"
            >
              Manage inventory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
