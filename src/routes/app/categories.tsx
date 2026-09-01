import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useStudioConfig } from '@/context/StudioConfigContext'
import { useShop } from '@/context/ShopContext'

export const Route = createFileRoute('/app/categories')({
  head: () => ({ meta: [{ title: 'Cloth types · Studio' }] }),
  component: CategoriesPage,
})

function CategoriesPage() {
  const { categories, addCategory, removeCategory, canEditCatalog } = useStudioConfig()
  const { products } = useShop()
  const [name, setName] = useState('')

  if (!canEditCatalog) {
    return (
      <p className="text-sm text-muted-foreground">Only owner or manager can edit cloth types.</p>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 animate-fade-in">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Catalog</p>
        <h1 className="mt-1 font-serif text-3xl">Types of clothes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add any type that is not on the site yet — e.g. Kimono, Abaya, Two-piece, Outerwear.
          New types appear when you add products and in the shop filters.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const res = addCategory(name)
          if (!res.ok) toast.error(res.message)
          else {
            toast.success(res.message)
            setName('')
          }
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New type name"
          className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c).length
          return (
            <li
              key={c}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium">{c}</p>
                <p className="text-xs text-muted-foreground">{count} piece{count === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                className="text-xs text-destructive underline"
                onClick={() => {
                  if (count > 0) {
                    toast.error('Move or re-category products first')
                    return
                  }
                  removeCategory(c)
                  toast.message('Removed')
                }}
              >
                Remove
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
