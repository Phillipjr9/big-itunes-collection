import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'

export const Route = createFileRoute('/app/discounts')({
  head: () => ({ meta: [{ title: 'Discounts · Admin' }] }),
  component: DiscountsAdmin,
})

function DiscountsAdmin() {
  const { discounts, upsertDiscount } = useShop()
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discount codes</h1>
        <p className="text-sm text-muted-foreground">Seed codes: LAGOS10, WELCOME5, BIGITUNES15</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="CODE"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="max-w-[140px]"
        />
        <Input
          type="number"
          min={1}
          max={50}
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          className="max-w-[100px]"
        />
        <Button
          onClick={() => {
            if (!code.trim()) return
            upsertDiscount({
              code: code.trim().toUpperCase(),
              percent,
              active: true,
              usedCount: 0,
            })
            toast.success('Discount saved')
            setCode('')
          }}
        >
          Add / update
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">%</th>
              <th className="p-3">Used</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.code} className="border-t">
                <td className="p-3 font-mono">{d.code}</td>
                <td className="p-3">{d.percent}%</td>
                <td className="p-3">
                  {d.usedCount}
                  {d.maxUses != null ? ` / ${d.maxUses}` : ''}
                </td>
                <td className="p-3">{d.active ? 'Yes' : 'No'}</td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      upsertDiscount({ ...d, active: !d.active })
                      toast.message(d.active ? 'Deactivated' : 'Activated')
                    }}
                  >
                    Toggle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
