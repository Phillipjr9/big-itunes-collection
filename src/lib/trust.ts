/** Trust content for product pages & checkout — edit freely for your brand */

export const SIZE_HINT =
  'Our pieces run true to size. If you are between sizes, size up for a softer fit or size down for a closer silhouette.'

export const SHIPPING_HINT =
  'Lagos orders usually leave within 1–2 working days. Outside Lagos, expect 2–5 working days once payment is confirmed.'

export const RETURN_HINT =
  'Unworn pieces with tags can be exchanged within 7 days. Message us on WhatsApp with your order ID — we keep it simple.'

export interface ProductReview {
  id: string
  productId?: number
  name: string
  city: string
  rating: 5 | 4 | 3
  text: string
}

/** Seed social proof — replace with real customer quotes when you have them */
export const SEED_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    name: 'Chioma',
    city: 'Lagos',
    rating: 5,
    text: 'Fabric quality is better than Instagram photos. Fit was exact to the size guide.',
  },
  {
    id: 'r2',
    name: 'Amina',
    city: 'Abuja',
    rating: 5,
    text: 'Ordered Friday, got it by midweek. WhatsApp updates made it stress-free.',
  },
  {
    id: 'r3',
    name: 'Tolu',
    city: 'Ibadan',
    rating: 5,
    text: 'Wore the set to a dinner — got compliments all night. Will bulk order next time.',
  },
  {
    id: 'r4',
    name: 'Blessing',
    city: 'Port Harcourt',
    rating: 4,
    text: 'Colour was true. Packaging felt premium. Sizing tip in the guide helped a lot.',
  },
]

export function reviewsForProduct(productId: number): ProductReview[] {
  const specific = SEED_REVIEWS.filter((r) => r.productId === productId)
  if (specific.length) return specific
  return SEED_REVIEWS.slice(0, 3)
}
