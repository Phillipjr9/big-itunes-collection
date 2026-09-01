import { useEffect, useState } from 'react'

export type LiveOrderStatus = {
  id: string
  status: string
  paymentStatus: string
  paymentReference?: string | null
  trackingNumber?: string | null
  courier?: string | null
  updatedHint?: string
}

/**
 * Poll Neon-backed order status so confirmation page updates when
 * Paystack webhook marks payment paid (real-time-ish).
 */
export function useOrderLiveStatus(
  orderId: string | undefined,
  opts?: { enabled?: boolean; intervalMs?: number },
) {
  const enabled = opts?.enabled !== false && Boolean(orderId)
  const intervalMs = opts?.intervalMs ?? 6000
  const [live, setLive] = useState<LiveOrderStatus | null>(null)

  useEffect(() => {
    if (!enabled || !orderId) return
    let cancelled = false

    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/status?id=${encodeURIComponent(orderId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data?.ok) {
          setLive({
            id: data.id,
            status: data.status,
            paymentStatus: data.paymentStatus,
            paymentReference: data.paymentReference,
            trackingNumber: data.trackingNumber,
            courier: data.courier,
            updatedHint: data.updatedHint,
          })
        }
      } catch {
        /* offline / cold start */
      }
    }

    void tick()
    const t = window.setInterval(tick, intervalMs)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [orderId, enabled, intervalMs])

  return live
}
