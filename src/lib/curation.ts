/** Homepage / shop curation chips — edited collections, not raw categories */

export const CURATED_EDITS = [
  {
    id: 'new',
    label: 'New this week',
    hint: 'Just dropped',
    search: { badge: 'New' as const },
  },
  {
    id: 'under40',
    label: 'Under ₦40k',
    hint: 'Smart picks',
    maxPrice: 40000,
  },
  {
    id: 'best',
    label: 'Bestsellers',
    hint: 'Most loved',
    search: { badge: 'Bestseller' as const },
  },
  {
    id: 'sets',
    label: 'Matching sets',
    hint: 'Ready looks',
    search: { category: 'Sets' as const },
  },
  {
    id: 'sale',
    label: 'Sale',
    hint: 'Limited',
    search: { badge: 'Sale' as const },
  },
] as const
