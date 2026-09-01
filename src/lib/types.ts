export type ProductCategory = string

export type ProductBadge = 'Bestseller' | 'New' | 'Trending' | 'Sale' | ''

/** Optional bulk packs for THIS piece only — e.g. 5 pcs ₦15k, 10 pcs ₦30k */
export type ProductPackageDeal = {
  units: number
  packagePrice: number
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  oldPrice: number
  cost?: number
  category: ProductCategory
  color: string
  image: string
  images?: string[]
  badge: ProductBadge
  description: string
  care?: string
  fabric?: string
  sizes: string[]
  stock: Record<string, number>
  barcode: string
  reorderPoint: number
  active: boolean
  /** Piece packages for this cloth only (admin sets in inventory / products) */
  packageDeals?: ProductPackageDeal[]
}

export interface CartItem {
  productId: number
  size: string
  quantity: number
}

export interface OrderItem {
  productId: number
  name: string
  size: string
  quantity: number
  price: number
  image: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'transfer' | 'whatsapp' | 'paystack'

export type PaymentStatus = 'unpaid' | 'proof_sent' | 'paid' | 'refunded'

export type OrderChannel = 'retail' | 'wholesale'

export type ReceiptFlagCode =
  | 'duplicate_txn'
  | 'duplicate_image'
  | 'amount_mismatch'
  | 'missing_txn'
  | 'weak_txn'
  | 'ocr_failed'

export interface ReceiptFlag {
  code: ReceiptFlagCode
  severity: 'critical' | 'warning'
  message: string
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  customer: {
    name: string
    email: string
    phone: string
    city: string
    address: string
    state: string
  }
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  discountCode?: string
  bulkDiscount?: number
  bulkLabel?: string
  channel?: OrderChannel
  wholesalePercent?: number
  total: number
  notes?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  paymentProof?: string
  paymentReference?: string
  paymentProofHash?: string
  paymentAmountDetected?: number
  paymentFlags?: ReceiptFlag[]
  paymentScannedAt?: string
  courier?: string
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: string
  statusHistory?: { status: OrderStatus; at: string; note?: string }[]
  pointsEarned?: number
  pointsRedeemed?: number
  pointsDiscount?: number
}

export interface Subscriber {
  email: string
  subscribedAt: string
}

export interface DiscountCode {
  code: string
  percent: number
  active: boolean
  maxUses?: number
  usedCount: number
  minSubtotal?: number
}

export type ReturnStatus = 'requested' | 'approved' | 'received' | 'restocked' | 'rejected'

export interface ReturnRequest {
  id: string
  orderId: string
  createdAt: string
  reason: string
  status: ReturnStatus
  customerName: string
  customerPhone: string
  itemsSummary: string
}

export interface WaitlistEntry {
  id: string
  productId: number
  size: string
  email: string
  phone?: string
  createdAt: string
}

export interface AuditEntry {
  id: string
  at: string
  action: string
  detail: string
}

export interface LoyaltyAccount {
  phoneKey: string
  name?: string
  email?: string
  points: number
  lifetimePoints: number
  updatedAt: string
}

export type StaffRole = 'owner' | 'manager' | 'staff'

export interface StaffMember {
  id: string
  name: string
  pin: string
  role: StaffRole
  active: boolean
  createdAt: string
  note?: string
}

export const DEFAULT_CLOTH_CATEGORIES = [
  'Dresses',
  'Tops',
  'Skirts',
  'Sets',
  'Jumpsuits',
] as const
