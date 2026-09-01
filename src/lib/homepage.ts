/** Admin-curated homepage imagery — clothing photos, hero, categories, editorials. */

export interface HomepageSettings {
  heroImage: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroSubtitle: string
  categoryImages: {
    Dresses: string
    Tops: string
    Sets: string
    Jumpsuits: string
  }
  /** Featured product IDs for "The Collection" strip (empty = all active) */
  featuredProductIds: number[]
  editorialLeftImage: string
  editorialRightImage: string
  brandStoryImage: string
  justInImage1: string
  justInImage2: string
}

export const DEFAULT_HOMEPAGE: HomepageSettings = {
  heroImage:
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1300&q=90',
  heroTitleLine1: 'Style',
  heroTitleLine2: 'Made for Her.',
  heroSubtitle:
    'Discover beautiful women’s fashion designed to make every woman feel confident, stylish, and effortlessly beautiful.',
  categoryImages: {
    Dresses:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85',
    Tops: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85',
    Sets: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    Jumpsuits:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  },
  featuredProductIds: [],
  editorialLeftImage:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  editorialRightImage:
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  brandStoryImage:
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85',
  justInImage1:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  justInImage2:
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
}
