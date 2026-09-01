import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useShop } from '@/context/ShopContext'
import { formatDate } from '@/lib/format'
import type { ReturnStatus } from '@/lib/types'

const STATUSES: ReturnStatus[] = ['requested', 'approved', 'received', 'restocked', 'rejected']

export const Route = createFileRoute('/app/returns')({
  head: () => ({ meta: [{ title: 'Returns · Admin' }] }),
  component: ReturnsAdmin,
})

function ReturnsAdmin() {
  const { returns, updateReturnStatus } = useShop()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Returns</h1>
        <p className="text-sm text-muted-foreground">{returns.length} requests</p>
      </div>
      {returns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No return requests yet.</p>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="rounded-md border p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-mono font-medium">{r.id}</p>
                  <p className="text-muted-foreground">
                    Order {r.orderId} · {formatDate(r.createdAt)}
                  </p>
                  <p className="mt-1">
                    {r.customerName} · {r.customerPhone}
                  </p>
                  <p className="mt-2">{r.itemsSummary}</p>
                  <p className="mt-1 text-muted-foreground">{r.reason}</p>
                </div>
                <select
                  className="h-fit rounded-md border px-2 py-1 capitalize"
                  value={r.status}
                  onChange={(e) => {
                    updateReturnStatus(r.id, e.target.value as ReturnStatus)
                    toast.success('Return updated')
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
