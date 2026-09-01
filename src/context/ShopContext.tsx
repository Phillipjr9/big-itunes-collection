import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { bulkDiscountForUnits, wholesaleUnitPrice } from '@/lib/bulk'
import { SEED_PRODUCTS } from '@/lib/catalog'
import { deliveryFeeForState } from '@/lib/delivery'
import { SEED_DISCOUNTS, applyDiscount } from '@/lib/discounts'
import { orderId } from '@/lib/format'
import { DEFAULT_HOMEPAGE, type HomepageSettings } from '@/lib/homepage'
import {
  MIN_REDEEM_POINTS,
  nairaFromPoints,
  normalizePhone,
  pointsFromSpend,
  tierFromLifetimePoints,
} from '@/lib/loyalty'
import {
  CLIENT_ADMIN_PIN,
  fetchShopFromNeon,
  postOrderToNeon,
  saveShopToNeon,
} from '@/lib/neonClient'
import { loadJSON, saveJSON } from '@/lib/persist'
import type {
  AuditEntry,
  CartItem,
  DiscountCode,
  LoyaltyAccount,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  ReturnRequest,
  ReturnStatus,
  Subscriber,
  WaitlistEntry,
} from '@/lib/types'

const ADMIN_PIN = CLIENT_ADMIN_PIN

function returnId() {
  return `RET-${Date.now().toString(36).toUpperCase()}`
}

function auditId() {
  return `AUD-${Date.now().toString(36)}`
}

interface ShopContextValue {
  ready: boolean
  neonConnected: boolean
  products: Product[]
  activeProducts: Product[]
  cart: CartItem[]
  wishlist: number[]
  recentlyViewed: number[]
  orders: Order[]
  subscribers: Subscriber[]
  discounts: DiscountCode[]
  returns: ReturnRequest[]
  waitlist: WaitlistEntry[]
  auditLog: AuditEntry[]
  loyaltyAccounts: LoyaltyAccount[]
  homepage: HomepageSettings
  cartCount: number
  cartSubtotal: number
  bulkSavings: ReturnType<typeof bulkDiscountForUnits>
  isAdmin: boolean
  cartOpenSignal: number
  openCartDrawer: () => void
  trackProductView: (productId: number) => void
  addToCart: (productId: number, size: string, qty?: number) => { ok: boolean; message: string }
  updateCartQty: (productId: number, size: string, quantity: number) => void
  removeFromCart: (productId: number, size: string) => void
  clearCart: () => void
  toggleWishlist: (productId: number) => void
  getProduct: (id: number) => Product | undefined
  getLoyalty: (phone: string) => LoyaltyAccount | undefined
  placeOrder: (input: {
    customer: Order['customer']
    notes?: string
    discountCode?: string
    paymentMethod?: PaymentMethod
    paymentProof?: string
    /** Points to redeem (must be available on phone account) */
    pointsToRedeem?: number
  }) => { ok: boolean; order?: Order; message: string }
  placeWholesaleOrder: (input: {
    customer: Order['customer']
    lines: { productId: number; size: string; quantity: number }[]
    wholesalePercent: number
    notes?: string
  }) => { ok: boolean; order?: Order; message: string }
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void
  updateOrderShipping: (
    id: string,
    data: { courier?: string; trackingNumber?: string; trackingUrl?: string },
  ) => void
  updateOrderPayment: (
    id: string,
    data: { paymentStatus?: PaymentStatus; paymentProof?: string },
  ) => void
  findOrders: (query: { orderId?: string; phone?: string }) => Order[]
  updateProduct: (product: Product) => void
  addProduct: (product: Omit<Product, 'id'>) => Product
  setStock: (productId: number, size: string, qty: number) => void
  updateHomepage: (next: HomepageSettings) => void
  subscribe: (email: string) => { ok: boolean; message: string }
  loginAdmin: (pin: string) => boolean
  logoutAdmin: () => void
  validateDiscount: (code: string, subtotal: number) => { ok: boolean; discount: number; message: string }
  upsertDiscount: (code: DiscountCode) => void
  requestReturn: (input: {
    orderId: string
    reason: string
    customerName: string
    customerPhone: string
    itemsSummary: string
  }) => { ok: boolean; message: string }
  updateReturnStatus: (id: string, status: ReturnStatus) => void
  joinWaitlist: (productId: number, size: string, email: string, phone?: string) => {
    ok: boolean
    message: string
  }
  recordAudit: (action: string, detail: string) => void
  pushToNeon: () => Promise<{ ok: boolean; message?: string }>
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [neonConnected, setNeonConnected] = useState(false)
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<number[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [discounts, setDiscounts] = useState<DiscountCode[]>(SEED_DISCOUNTS)
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([])
  const [homepage, setHomepage] = useState<HomepageSettings>(DEFAULT_HOMEPAGE)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartOpenSignal, setCartOpenSignal] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCart(loadJSON('cart', []))
      setWishlist(loadJSON('wishlist', []))
      setRecentlyViewed(loadJSON('recently_viewed', []))
      setIsAdmin(loadJSON('admin_session', false))

      const remote = await fetchShopFromNeon()
      if (cancelled) return

      if (remote?.neon) {
        setNeonConnected(true)
        setProducts(
          Array.isArray(remote.products) && (remote.products as Product[]).length > 0
            ? (remote.products as Product[])
            : loadJSON('products', SEED_PRODUCTS),
        )
        setOrders(Array.isArray(remote.orders) ? (remote.orders as Order[]) : loadJSON('orders', []))
        setDiscounts(
          Array.isArray(remote.discounts) && (remote.discounts as DiscountCode[]).length > 0
            ? (remote.discounts as DiscountCode[])
            : loadJSON('discounts', SEED_DISCOUNTS),
        )
        setHomepage(
          remote.homepage
            ? (remote.homepage as HomepageSettings)
            : loadJSON('homepage', DEFAULT_HOMEPAGE),
        )
        setReturns(
          Array.isArray(remote.returns) ? (remote.returns as ReturnRequest[]) : loadJSON('returns', []),
        )
        setWaitlist(
          Array.isArray(remote.waitlist)
            ? (remote.waitlist as WaitlistEntry[])
            : loadJSON('waitlist', []),
        )
        setSubscribers(
          Array.isArray(remote.subscribers)
            ? (remote.subscribers as Subscriber[])
            : loadJSON('subscribers', []),
        )
        setAuditLog(
          Array.isArray(remote.audit) ? (remote.audit as AuditEntry[]) : loadJSON('audit', []),
        )
        setLoyaltyAccounts(
          Array.isArray(remote.loyalty)
            ? (remote.loyalty as LoyaltyAccount[])
            : loadJSON('loyalty', []),
        )
      } else {
        setNeonConnected(false)
        setProducts(loadJSON('products', SEED_PRODUCTS))
        setOrders(loadJSON('orders', []))
        setSubscribers(loadJSON('subscribers', []))
        setDiscounts(loadJSON('discounts', SEED_DISCOUNTS))
        setReturns(loadJSON('returns', []))
        setWaitlist(loadJSON('waitlist', []))
        setAuditLog(loadJSON('audit', []))
        setLoyaltyAccounts(loadJSON('loyalty', []))
        setHomepage(loadJSON('homepage', DEFAULT_HOMEPAGE))
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    saveJSON('products', products)
  }, [products, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('cart', cart)
  }, [cart, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('wishlist', wishlist)
  }, [wishlist, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('recently_viewed', recentlyViewed)
  }, [recentlyViewed, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('orders', orders)
  }, [orders, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('subscribers', subscribers)
  }, [subscribers, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('discounts', discounts)
  }, [discounts, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('returns', returns)
  }, [returns, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('waitlist', waitlist)
  }, [waitlist, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('audit', auditLog)
  }, [auditLog, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('loyalty', loyaltyAccounts)
  }, [loyaltyAccounts, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('homepage', homepage)
  }, [homepage, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('admin_session', isAdmin)
  }, [isAdmin, ready])

  useEffect(() => {
    if (!ready || !isAdmin || !neonConnected) return
    const t = window.setTimeout(() => {
      void saveShopToNeon(
        {
          products,
          orders,
          discounts,
          homepage,
          returns,
          waitlist,
          subscribers,
          audit: auditLog,
          loyalty: loyaltyAccounts,
        },
        ADMIN_PIN,
      )
    }, 900)
    return () => window.clearTimeout(t)
  }, [
    products,
    orders,
    discounts,
    homepage,
    returns,
    waitlist,
    subscribers,
    auditLog,
    loyaltyAccounts,
    ready,
    isAdmin,
    neonConnected,
  ])

  const pushToNeon = useCallback(async () => {
    const res = await saveShopToNeon(
      {
        products,
        orders,
        discounts,
        homepage,
        returns,
        waitlist,
        subscribers,
        audit: auditLog,
        loyalty: loyaltyAccounts,
      },
      ADMIN_PIN,
    )
    if (res.ok) setNeonConnected(true)
    return res
  }, [
    products,
    orders,
    discounts,
    homepage,
    returns,
    waitlist,
    subscribers,
    auditLog,
    loyaltyAccounts,
  ])

  const recordAudit = useCallback((action: string, detail: string) => {
    setAuditLog((log) =>
      [{ id: auditId(), at: new Date().toISOString(), action, detail }, ...log].slice(0, 200),
    )
  }, [])

  const getLoyalty = useCallback(
    (phone: string) => {
      const key = normalizePhone(phone)
      if (!key) return undefined
      return loyaltyAccounts.find((a) => a.phoneKey === key)
    },
    [loyaltyAccounts],
  )

  const openCartDrawer = useCallback(() => setCartOpenSignal((n) => n + 1), [])

  const trackProductView = useCallback((productId: number) => {
    setRecentlyViewed((ids) => [productId, ...ids.filter((id) => id !== productId)].slice(0, 12))
  }, [])

  const getProduct = useCallback((id: number) => products.find((p) => p.id === id), [products])

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products])
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.productId)
      return sum + (p ? p.price * item.quantity : 0)
    }, 0)
  }, [cart, products])

  const bulkSavings = useMemo(
    () => bulkDiscountForUnits(cartCount, cartSubtotal),
    [cartCount, cartSubtotal],
  )

  const addToCart = useCallback(
    (productId: number, size: string, qty = 1) => {
      const product = products.find((p) => p.id === productId)
      if (!product || !product.active) return { ok: false, message: 'Product not available.' }
      const available = product.stock[size] ?? 0
      if (available < 1) return { ok: false, message: `Size ${size} is out of stock.` }
      const existing = cart.find((c) => c.productId === productId && c.size === size)
      const nextQty = (existing?.quantity ?? 0) + qty
      if (nextQty > available) {
        return { ok: false, message: `Only ${available} left in size ${size}.` }
      }
      setCart((items) => {
        if (existing) {
          return items.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: nextQty } : i,
          )
        }
        return [...items, { productId, size, quantity: qty }]
      })
      setCartOpenSignal((n) => n + 1)
      return { ok: true, message: `${product.name} (${size}) added to bag.` }
    },
    [cart, products],
  )

  const updateCartQty = useCallback(
    (productId: number, size: string, quantity: number) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return
      const max = product.stock[size] ?? 0
      if (quantity <= 0) {
        setCart((items) => items.filter((i) => !(i.productId === productId && i.size === size)))
        return
      }
      setCart((items) =>
        items.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: Math.min(quantity, max) }
            : i,
        ),
      )
    },
    [products],
  )

  const removeFromCart = useCallback((productId: number, size: string) => {
    setCart((items) => items.filter((i) => !(i.productId === productId && i.size === size)))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWishlist = useCallback((productId: number) => {
    setWishlist((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    )
  }, [])

  const validateDiscount = useCallback(
    (raw: string, subtotal: number) => {
      const code = discounts.find((d) => d.code.toUpperCase() === raw.trim().toUpperCase())
      if (!code) return { ok: false, discount: 0, message: 'Invalid discount code.' }
      const result = applyDiscount(subtotal, code)
      if (result.error) return { ok: false, discount: 0, message: result.error }
      return {
        ok: true,
        discount: result.discount,
        message: `${code.percent}% off applied (−₦${result.discount.toLocaleString('en-NG')})`,
      }
    },
    [discounts],
  )

  const placeOrder = useCallback(
    (input: {
      customer: Order['customer']
      notes?: string
      discountCode?: string
      paymentMethod?: PaymentMethod
      paymentProof?: string
      pointsToRedeem?: number
    }) => {
      if (cart.length === 0) return { ok: false, message: 'Your bag is empty.' }
      for (const item of cart) {
        const p = products.find((x) => x.id === item.productId)
        if (!p || (p.stock[item.size] ?? 0) < item.quantity) {
          return {
            ok: false,
            message: `Insufficient stock for ${p?.name ?? 'item'} (${item.size}).`,
          }
        }
      }
      const orderItems = cart.map((item) => {
        const p = products.find((x) => x.id === item.productId)!
        return {
          productId: item.productId,
          name: p.name,
          size: item.size,
          quantity: item.quantity,
          price: p.price,
          image: p.image,
        }
      })
      const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
      const units = orderItems.reduce((s, i) => s + i.quantity, 0)
      const bulk = bulkDiscountForUnits(units, subtotal)
      let codeDiscount = 0
      let discountCode: string | undefined
      let nextDiscounts = discounts
      const afterBulk = Math.max(0, subtotal - bulk.amount)
      if (input.discountCode) {
        const v = validateDiscount(input.discountCode, afterBulk)
        if (!v.ok) return { ok: false, message: v.message }
        codeDiscount = v.discount
        discountCode = input.discountCode.trim().toUpperCase()
        nextDiscounts = discounts.map((d) =>
          d.code.toUpperCase() === discountCode ? { ...d, usedCount: d.usedCount + 1 } : d,
        )
        setDiscounts(nextDiscounts)
      }

      const phoneKey = normalizePhone(input.customer.phone)
      let pointsRedeemed = 0
      let pointsDiscount = 0
      const existing = phoneKey
        ? loyaltyAccounts.find((a) => a.phoneKey === phoneKey)
        : undefined

      if (input.pointsToRedeem && input.pointsToRedeem > 0) {
        if (!phoneKey) return { ok: false, message: 'Phone number required to redeem points.' }
        const want = Math.floor(input.pointsToRedeem)
        if (want < MIN_REDEEM_POINTS) {
          return { ok: false, message: `Redeem at least ${MIN_REDEEM_POINTS} points.` }
        }
        const available = existing?.points ?? 0
        if (want > available) {
          return { ok: false, message: `You only have ${available} points.` }
        }
        pointsRedeemed = want
        pointsDiscount = nairaFromPoints(want)
      }

      const discount = bulk.amount + codeDiscount + pointsDiscount
      const afterDiscount = Math.max(0, subtotal - discount)
      const deliveryFee = deliveryFeeForState(input.customer.state, afterDiscount)
      const paymentMethod = input.paymentMethod ?? 'whatsapp'
      const paymentStatus: PaymentStatus = input.paymentProof
        ? 'proof_sent'
        : paymentMethod === 'paystack'
          ? 'paid'
          : 'unpaid'

      const pointsEarned = pointsFromSpend(afterDiscount)
      const now = new Date().toISOString()

      let loyaltyAccount: LoyaltyAccount | undefined
      if (phoneKey) {
        const prevPts = existing?.points ?? 0
        const prevLife = existing?.lifetimePoints ?? 0
        loyaltyAccount = {
          phoneKey,
          name: input.customer.name || existing?.name,
          email: input.customer.email || existing?.email,
          points: Math.max(0, prevPts - pointsRedeemed) + pointsEarned,
          lifetimePoints: prevLife + pointsEarned,
          updatedAt: now,
        }
        setLoyaltyAccounts((list) => {
          const i = list.findIndex((a) => a.phoneKey === phoneKey)
          if (i >= 0) {
            const next = [...list]
            next[i] = loyaltyAccount!
            return next
          }
          return [loyaltyAccount!, ...list]
        })
      }

      const order: Order = {
        id: orderId(),
        createdAt: now,
        status: 'pending',
        customer: input.customer,
        items: orderItems,
        subtotal,
        deliveryFee,
        discount,
        discountCode,
        bulkDiscount: bulk.amount || undefined,
        bulkLabel: bulk.label ?? undefined,
        channel: 'retail',
        total: afterDiscount + deliveryFee,
        notes: input.notes,
        paymentMethod,
        paymentStatus,
        paymentProof: input.paymentProof,
        statusHistory: [{ status: 'pending', at: now, note: 'Order placed' }],
        pointsEarned: pointsEarned || undefined,
        pointsRedeemed: pointsRedeemed || undefined,
        pointsDiscount: pointsDiscount || undefined,
      }
      setProducts((prev) =>
        prev.map((p) => {
          const updates = cart.filter((c) => c.productId === p.id)
          if (!updates.length) return p
          const stock = { ...p.stock }
          for (const u of updates) {
            stock[u.size] = Math.max(0, (stock[u.size] ?? 0) - u.quantity)
          }
          return { ...p, stock }
        }),
      )
      setOrders((o) => [order, ...o])
      setCart([])
      recordAudit(
        'order.created',
        `${order.id} · ₦${order.total} · +${pointsEarned} pts${pointsRedeemed ? ` · −${pointsRedeemed} redeemed` : ''}`,
      )
      void postOrderToNeon(order, nextDiscounts, loyaltyAccount)
      return {
        ok: true,
        order,
        message:
          pointsEarned > 0
            ? `Order placed. You earned ${pointsEarned} loyalty points!`
            : 'Order placed successfully.',
      }
    },
    [cart, products, discounts, loyaltyAccounts, validateDiscount, recordAudit],
  )

  const placeWholesaleOrder = useCallback(
    (input: {
      customer: Order['customer']
      lines: { productId: number; size: string; quantity: number }[]
      wholesalePercent: number
      notes?: string
    }) => {
      if (!input.lines.length) return { ok: false, message: 'Add at least one line.' }
      for (const line of input.lines) {
        const p = products.find((x) => x.id === line.productId)
        if (!p || !p.active) return { ok: false, message: `Product ${line.productId} not found.` }
        if ((p.stock[line.size] ?? 0) < line.quantity) {
          return {
            ok: false,
            message: `Not enough stock for ${p.name} (${line.size}). Need ${line.quantity}.`,
          }
        }
      }
      const orderItems = input.lines.map((line) => {
        const p = products.find((x) => x.id === line.productId)!
        const unit = wholesaleUnitPrice(p.price, input.wholesalePercent)
        return {
          productId: line.productId,
          name: p.name,
          size: line.size,
          quantity: line.quantity,
          price: unit,
          image: p.image,
        }
      })
      const retailSub = input.lines.reduce((s, line) => {
        const p = products.find((x) => x.id === line.productId)!
        return s + p.price * line.quantity
      }, 0)
      const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
      const discount = Math.max(0, retailSub - subtotal)
      const deliveryFee = deliveryFeeForState(input.customer.state, subtotal)
      const now = new Date().toISOString()
      const order: Order = {
        id: orderId(),
        createdAt: now,
        status: 'confirmed',
        customer: input.customer,
        items: orderItems,
        subtotal: retailSub,
        deliveryFee,
        discount,
        channel: 'wholesale',
        wholesalePercent: input.wholesalePercent,
        total: subtotal + deliveryFee,
        notes: input.notes,
        paymentMethod: 'transfer',
        paymentStatus: 'unpaid',
        statusHistory: [{ status: 'confirmed', at: now, note: 'Wholesale order created in Studio' }],
      }
      setProducts((prev) =>
        prev.map((p) => {
          const updates = input.lines.filter((c) => c.productId === p.id)
          if (!updates.length) return p
          const stock = { ...p.stock }
          for (const u of updates) {
            stock[u.size] = Math.max(0, (stock[u.size] ?? 0) - u.quantity)
          }
          return { ...p, stock }
        }),
      )
      setOrders((o) => [order, ...o])
      recordAudit(
        'order.wholesale',
        `${order.id} · ${input.wholesalePercent}% off · ₦${order.total}`,
      )
      void postOrderToNeon(order)
      return { ok: true, order, message: 'Wholesale order created.' }
    },
    [products, recordAudit],
  )

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus, note?: string) => {
      const now = new Date().toISOString()
      setOrders((list) =>
        list.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                shippedAt: status === 'shipped' ? now : o.shippedAt,
                statusHistory: [...(o.statusHistory ?? []), { status, at: now, note }],
              }
            : o,
        ),
      )
      recordAudit('order.status', `${id} → ${status}`)
    },
    [recordAudit],
  )

  const updateOrderShipping = useCallback(
    (id: string, data: { courier?: string; trackingNumber?: string; trackingUrl?: string }) => {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...data } : o)))
      recordAudit('order.shipping', `${id} · ${data.courier ?? ''} ${data.trackingNumber ?? ''}`)
    },
    [recordAudit],
  )

  const updateOrderPayment = useCallback(
    (id: string, data: { paymentStatus?: PaymentStatus; paymentProof?: string }) => {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...data } : o)))
      recordAudit('order.payment', `${id} · ${data.paymentStatus ?? 'update'}`)
    },
    [recordAudit],
  )

  const findOrders = useCallback(
    (query: { orderId?: string; phone?: string }) => {
      const id = query.orderId?.trim().toUpperCase()
      const phone = query.phone?.replace(/\D/g, '')
      return orders.filter((o) => {
        const matchId = id ? o.id.toUpperCase().includes(id) : true
        const matchPhone = phone
          ? o.customer.phone.replace(/\D/g, '').endsWith(phone) ||
            o.customer.phone.replace(/\D/g, '').includes(phone)
          : true
        if (id && phone) return matchId && matchPhone
        if (id) return matchId
        if (phone) return matchPhone
        return false
      })
    },
    [orders],
  )

  const updateProduct = useCallback(
    (product: Product) => {
      setProducts((list) => list.map((p) => (p.id === product.id ? product : p)))
      recordAudit('product.update', `${product.id} ${product.name}`)
    },
    [recordAudit],
  )

  const addProduct = useCallback(
    (input: Omit<Product, 'id'>) => {
      const id = Math.max(0, ...products.map((p) => p.id)) + 1
      const product: Product = { ...input, id }
      setProducts((list) => [...list, product])
      recordAudit('product.create', `${id} ${product.name}`)
      return product
    },
    [products, recordAudit],
  )

  const setStock = useCallback(
    (productId: number, size: string, qty: number) => {
      setProducts((list) =>
        list.map((p) =>
          p.id === productId ? { ...p, stock: { ...p.stock, [size]: Math.max(0, qty) } } : p,
        ),
      )
      recordAudit('stock.set', `product ${productId} size ${size} → ${qty}`)
    },
    [recordAudit],
  )

  const updateHomepage = useCallback(
    (next: HomepageSettings) => {
      setHomepage(next)
      recordAudit('homepage.update', 'Homepage media saved')
    },
    [recordAudit],
  )

  const subscribe = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase()
      if (!normalized.includes('@')) return { ok: false, message: 'Enter a valid email.' }
      if (subscribers.some((s) => s.email === normalized)) {
        return { ok: false, message: 'You are already on the list.' }
      }
      setSubscribers((s) => [{ email: normalized, subscribedAt: new Date().toISOString() }, ...s])
      return { ok: true, message: "You're on the list." }
    },
    [subscribers],
  )

  const loginAdmin = useCallback((pin: string) => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const logoutAdmin = useCallback(() => setIsAdmin(false), [])

  const upsertDiscount = useCallback(
    (code: DiscountCode) => {
      setDiscounts((list) => {
        const i = list.findIndex((d) => d.code.toUpperCase() === code.code.toUpperCase())
        if (i >= 0) {
          const next = [...list]
          next[i] = { ...code, code: code.code.toUpperCase() }
          return next
        }
        return [...list, { ...code, code: code.code.toUpperCase() }]
      })
      recordAudit('discount.upsert', code.code)
    },
    [recordAudit],
  )

  const requestReturn = useCallback(
    (input: {
      orderId: string
      reason: string
      customerName: string
      customerPhone: string
      itemsSummary: string
    }) => {
      const order = orders.find((o) => o.id.toUpperCase() === input.orderId.trim().toUpperCase())
      if (!order) return { ok: false, message: 'Order not found. Check your order ID.' }
      const req: ReturnRequest = {
        id: returnId(),
        orderId: order.id,
        createdAt: new Date().toISOString(),
        reason: input.reason,
        status: 'requested',
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        itemsSummary: input.itemsSummary,
      }
      setReturns((r) => [req, ...r])
      recordAudit('return.requested', req.id)
      return { ok: true, message: 'Return request submitted. We will contact you on WhatsApp.' }
    },
    [orders, recordAudit],
  )

  const updateReturnStatus = useCallback(
    (id: string, status: ReturnStatus) => {
      setReturns((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
      recordAudit('return.status', `${id} → ${status}`)
    },
    [recordAudit],
  )

  const joinWaitlist = useCallback(
    (productId: number, size: string, email: string, phone?: string) => {
      const normalized = email.trim().toLowerCase()
      if (!normalized.includes('@')) return { ok: false, message: 'Enter a valid email.' }
      if (
        waitlist.some(
          (w) => w.productId === productId && w.size === size && w.email === normalized,
        )
      ) {
        return { ok: false, message: 'You are already on the waitlist for this size.' }
      }
      setWaitlist((w) => [
        {
          id: `WL-${Date.now().toString(36)}`,
          productId,
          size,
          email: normalized,
          phone,
          createdAt: new Date().toISOString(),
        },
        ...w,
      ])
      return { ok: true, message: "We'll notify you when this size is back." }
    },
    [waitlist],
  )

  const value: ShopContextValue = {
    ready,
    neonConnected,
    products,
    activeProducts,
    cart,
    wishlist,
    recentlyViewed,
    orders,
    subscribers,
    discounts,
    returns,
    waitlist,
    auditLog,
    loyaltyAccounts,
    homepage,
    cartCount,
    cartSubtotal,
    bulkSavings,
    isAdmin,
    cartOpenSignal,
    openCartDrawer,
    trackProductView,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    getProduct,
    getLoyalty,
    placeOrder,
    placeWholesaleOrder,
    updateOrderStatus,
    updateOrderShipping,
    updateOrderPayment,
    findOrders,
    updateProduct,
    addProduct,
    setStock,
    updateHomepage,
    subscribe,
    loginAdmin,
    logoutAdmin,
    validateDiscount,
    upsertDiscount,
    requestReturn,
    updateReturnStatus,
    joinWaitlist,
    recordAudit,
    pushToNeon,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

// re-export tier helper for UI
export { tierFromLifetimePoints }
