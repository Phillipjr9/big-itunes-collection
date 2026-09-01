import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  Percent,
  RotateCcw,
  LogOut,
  PanelLeft,
  ImageIcon,
  ExternalLink,
  Store,
  Users,
  Tags,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShop } from '@/context/ShopContext'
import { useStudioConfig } from '@/context/StudioConfigContext'
import { BrandLogo } from '@/components/BrandLogo'

const SIDEBAR_KEY = 'sidebar_collapsed'

interface NavItemDef {
  href: string
  icon: ReactNode
  label: string
  hint: string
  badgeKey?: 'orders' | 'stock'
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItemDef[] = [
  { href: '/app', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Overview', hint: 'Today at a glance' },
  { href: '/app/homepage', icon: <ImageIcon className="h-4 w-4" />, label: 'Homepage', hint: 'Hero & collection photos' },
  { href: '/app/products', icon: <Package className="h-4 w-4" />, label: 'Products', hint: 'Catalog & photos' },
  { href: '/app/categories', icon: <Tags className="h-4 w-4" />, label: 'Cloth types', hint: 'Add new categories' },
  { href: '/app/orders', icon: <ShoppingBag className="h-4 w-4" />, label: 'Orders', hint: 'Fulfill & track', badgeKey: 'orders' },
  { href: '/app/wholesale', icon: <Store className="h-4 w-4" />, label: 'Wholesale', hint: 'Bulk for boutiques' },
  { href: '/app/inventory', icon: <Warehouse className="h-4 w-4" />, label: 'Inventory', hint: 'Sizes & stock', badgeKey: 'stock' },
  { href: '/app/discounts', icon: <Percent className="h-4 w-4" />, label: 'Discounts', hint: 'Promo codes' },
  { href: '/app/returns', icon: <RotateCcw className="h-4 w-4" />, label: 'Returns', hint: 'Exchanges' },
  { href: '/app/staff', icon: <Users className="h-4 w-4" />, label: 'Team', hint: 'Staff accounts', ownerOnly: true },
]

function NavItem({
  item,
  collapsed,
  active,
  badge,
}: {
  item: NavItemDef
  collapsed: boolean
  active: boolean
  badge?: number
}) {
  const link = (
    <Link
      to={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl text-sm transition-all',
        collapsed ? 'mx-auto h-10 w-10 justify-center' : 'w-full px-3 py-2.5',
        active
          ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
          : 'text-white/65 hover:bg-white/8 hover:text-white',
      )}
    >
      <span className="relative shrink-0">
        {item.icon}
        {collapsed && badge != null && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[9px] font-bold text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium tracking-tight">{item.label}</span>
            <span className={cn('block truncate text-[10px]', active ? 'text-white/70' : 'text-white/40')}>
              {item.hint}
            </span>
          </span>
          {badge != null && badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-400/90 px-1.5 text-[10px] font-semibold text-white">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="border-border bg-card">
        <p className="font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.hint}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function AppSidebarShell() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { logoutAdmin, orders, products } = useShop()
  const { logoutStudio, session, canManageStaff } = useStudioConfig()

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length
  const lowStock = products.filter((p) => {
    const total = Object.values(p.stock).reduce((a, b) => a + b, 0)
    return total <= p.reorderPoint
  }).length

  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_KEY) === 'true') setCollapsed(true)
  }, [])

  const toggle = useCallback(() => {
    setCollapsed((v) => {
      const next = !v
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }, [])

  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || canManageStaff)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden border-r border-white/5',
          'bg-[linear-gradient(165deg,#1a1218_0%,#2a1a22_45%,#1c1419_100%)]',
          'transition-[width] duration-200 ease-linear shrink-0',
          collapsed ? 'w-[3.75rem]' : 'w-[16.5rem]',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center gap-2 border-b border-white/8 px-3',
            collapsed && 'justify-center px-2',
          )}
        >
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <BrandLogo className="[&_img]:h-9 [&_img]:max-w-[140px]" />
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">Studio</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={toggle}
          >
            <PanelLeft className={cn('h-4 w-4', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {!collapsed && (
          <p className="px-4 pt-5 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
            Manage
          </p>
        )}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 py-1">
          {items.map((item) => {
            const active =
              item.href === '/app'
                ? pathname === '/app' || pathname === '/app/'
                : pathname.startsWith(item.href)
            const badge =
              item.badgeKey === 'orders'
                ? pendingOrders
                : item.badgeKey === 'stock'
                  ? lowStock
                  : undefined
            return (
              <NavItem key={item.href} item={item} collapsed={collapsed} active={active} badge={badge} />
            )
          })}
        </div>

        <div className={cn('shrink-0 border-t border-white/8', collapsed ? 'p-2' : 'p-3')}>
          {!collapsed && (
            <Link
              to="/"
              className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview boutique
            </Link>
          )}
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
              <Avatar className="h-8 w-8 border border-white/15">
                <AvatarFallback className="bg-primary/30 text-xs text-white">
                  {(session?.name || 'BI').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{session?.name || 'Studio'}</p>
                <p className="truncate text-[10px] text-white/45">{session?.role || 'team'}</p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-xl text-white/55 hover:bg-white/10 hover:text-white',
              collapsed ? 'h-10 w-10 p-0' : 'w-full justify-start gap-2',
            )}
            onClick={() => {
              logoutStudio()
              logoutAdmin()
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign out'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
