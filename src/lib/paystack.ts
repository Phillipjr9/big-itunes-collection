/**
 * Paystack Inline (client) scaffold.
 * Set VITE_PAYSTACK_PUBLIC_KEY in Vercel (pk_test_… or pk_live_…).
 * For production, also verify transactions on a server with the secret key.
 */

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (opts: Record<string, unknown>) => void
    }
  }
}

export function getPaystackPublicKey(): string | null {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined
  if (!key || !key.startsWith('pk_')) return null
  return key
}

export function isPaystackConfigured(): boolean {
  return Boolean(getPaystackPublicKey())
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('No window'))
      return
    }
    if (window.PaystackPop) {
      resolve()
      return
    }
    const existing = document.querySelector('script[data-paystack]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Paystack script failed')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v2/inline.js'
    s.async = true
    s.dataset.paystack = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Paystack'))
    document.head.appendChild(s)
  })
}

export async function openPaystackPopup(opts: {
  email: string
  amountNaira: number
  reference: string
  metadata?: Record<string, string>
  onSuccess: (ref: string) => void
  onCancel?: () => void
}): Promise<{ ok: boolean; message?: string }> {
  const key = getPaystackPublicKey()
  if (!key) {
    return {
      ok: false,
      message: 'Paystack is not configured. Add VITE_PAYSTACK_PUBLIC_KEY in Vercel.',
    }
  }
  try {
    await loadPaystackScript()
  } catch {
    return { ok: false, message: 'Could not load Paystack. Check your network.' }
  }
  if (!window.PaystackPop) {
    return { ok: false, message: 'Paystack popup unavailable.' }
  }

  const amountKobo = Math.round(opts.amountNaira * 100)
  const popup = new window.PaystackPop()
  popup.newTransaction({
    key,
    email: opts.email,
    amount: amountKobo,
    currency: 'NGN',
    ref: opts.reference,
    metadata: opts.metadata,
    onSuccess: (transaction: { reference?: string }) => {
      opts.onSuccess(transaction.reference ?? opts.reference)
    },
    onCancel: () => opts.onCancel?.(),
  })
  return { ok: true }
}
