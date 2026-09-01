import React from 'react'
import { PaymentPendingLottie } from '@/components/PaymentPendingLottie'
import { PaymentSuccessLottie } from '@/components/PaymentSuccessLottie'
import { PaymentFailedLottie } from '@/components/PaymentFailedLottie'

export default function DebugPayments() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Payment Lottie Debug</h1>

      <section>
        <h2 className="mb-2 text-lg">Pending</h2>
        <div className="w-40 h-40">
          <PaymentPendingLottie />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg">Success</h2>
        <div className="w-48 h-48">
          <PaymentSuccessLottie />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg">Failed</h2>
        <div className="w-40 h-40">
          <PaymentFailedLottie />
        </div>
      </section>
    </div>
  )
}
