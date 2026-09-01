/** Delivery fees by Nigerian state — free over FREE_THRESHOLD after discount */
export const FREE_DELIVERY_THRESHOLD = 100_000

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

export type NigerianState = (typeof NIGERIAN_STATES)[number]

/** Base fees before free-threshold check */
const FEE_BY_STATE: Record<string, number> = {
  Lagos: 2500,
  Ogun: 3000,
  Oyo: 3500,
  Osun: 3500,
  Ondo: 4000,
  Ekiti: 4000,
  'FCT Abuja': 4500,
  Rivers: 4500,
  Delta: 4500,
  Edo: 4000,
  Anambra: 4500,
  Enugu: 4500,
  Imo: 4500,
  Abia: 4500,
  Kano: 5000,
  Kaduna: 5000,
}

const DEFAULT_FEE = 5500

export function deliveryFeeForState(state: string, amountAfterDiscount: number): number {
  if (amountAfterDiscount >= FREE_DELIVERY_THRESHOLD) return 0
  if (amountAfterDiscount <= 0) return 0
  return FEE_BY_STATE[state] ?? DEFAULT_FEE
}

export function deliveryNote(state: string): string {
  if (state === 'Lagos') return 'Usually 1–3 working days within Lagos.'
  if (state === 'FCT Abuja' || state === 'Rivers') return 'Usually 3–5 working days.'
  return 'Nationwide courier · typically 3–7 working days.'
}
