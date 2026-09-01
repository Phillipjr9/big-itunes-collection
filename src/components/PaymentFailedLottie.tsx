import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

/** Free “Bouncy Fail” X mark — pairs with Payment Successful animation */
const LOTTIE_URL = 'https://assets10.lottiefiles.com/packages/lf20_qpwbiyxf.json'

export function PaymentFailedLottie({ className }: { className?: string }) {
  const [data, setData] = useState<object | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(LOTTIE_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load animation')
        return r.json()
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (failed) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`} aria-hidden>
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/15 text-4xl text-destructive">
          ✕
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`} aria-hidden>
        <div className="h-16 w-16 animate-pulse rounded-full bg-destructive/20" />
      </div>
    )
  }

  return (
    <div className={className} role="img" aria-label="Payment or order failed">
      <Lottie animationData={data} loop={false} autoplay style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
