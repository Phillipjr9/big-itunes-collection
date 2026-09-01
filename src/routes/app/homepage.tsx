import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'
import { DEFAULT_HOMEPAGE, type HomepageSettings } from '@/lib/homepage'

export const Route = createFileRoute('/app/homepage')({
  head: () => ({ meta: [{ title: 'Homepage · Admin' }] }),
  component: HomepageAdmin,
})

function HomepageAdmin() {
  const { homepage, updateHomepage, products, activeProducts } = useShop()
  const [draft, setDraft] = useState<HomepageSettings>({ ...homepage })

  function setField<K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function useProductImage(slot: keyof HomepageSettings | 'Dresses' | 'Tops' | 'Sets' | 'Jumpsuits') {
    return (
      <select
        className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        defaultValue=""
        onChange={(e) => {
          const id = Number(e.target.value)
          const p = products.find((x) => x.id === id)
          if (!p) return
          if (slot === 'Dresses' || slot === 'Tops' || slot === 'Sets' || slot === 'Jumpsuits') {
            setDraft((d) => ({
              ...d,
              categoryImages: { ...d.categoryImages, [slot]: p.image },
            }))
          } else {
            setField(slot as keyof HomepageSettings, p.image as never)
          }
          toast.success(`Using photo from ${p.name}`)
          e.target.value = ''
        }}
      >
        <option value="">Or pick from a product photo…</option>
        {activeProducts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Homepage images</h1>
          <p className="text-sm text-muted-foreground">
            Choose the clothing photos shoppers see on the home page. Upload, take a photo, paste a
            URL, or reuse a product image.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft({ ...DEFAULT_HOMEPAGE })
              toast.message('Reset to defaults (not saved yet)')
            }}
          >
            Reset defaults
          </Button>
          <Button
            onClick={() => {
              updateHomepage(draft)
              toast.success('Homepage saved — refresh the store to see changes')
            }}
          >
            Save homepage
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="font-medium">Hero banner</h2>
        <ImageSourcePicker
          label="Main hero photo"
          value={draft.heroImage}
          onChange={(v) => setField('heroImage', v)}
        />
        {useProductImage('heroImage')}
        <Input
          value={draft.heroTitleLine1}
          onChange={(e) => setField('heroTitleLine1', e.target.value)}
          placeholder="Title line 1"
        />
        <Input
          value={draft.heroTitleLine2}
          onChange={(e) => setField('heroTitleLine2', e.target.value)}
          placeholder="Title line 2"
        />
        <textarea
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          rows={2}
          value={draft.heroSubtitle}
          onChange={(e) => setField('heroSubtitle', e.target.value)}
          placeholder="Subtitle"
        />
      </section>

      <section className="space-y-6 rounded-lg border p-5">
        <h2 className="font-medium">Shop-by-category tiles</h2>
        {(['Dresses', 'Tops', 'Sets', 'Jumpsuits'] as const).map((cat) => (
          <div key={cat} className="border-t pt-4 first:border-t-0 first:pt-0">
            <ImageSourcePicker
              label={`${cat} tile`}
              value={draft.categoryImages[cat]}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  categoryImages: { ...d.categoryImages, [cat]: v },
                }))
              }
            />
            {useProductImage(cat)}
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="font-medium">Just-in / editorial photos</h2>
        <ImageSourcePicker
          label="Just-in left"
          value={draft.justInImage1}
          onChange={(v) => setField('justInImage1', v)}
        />
        {useProductImage('justInImage1')}
        <ImageSourcePicker
          label="Just-in right"
          value={draft.justInImage2}
          onChange={(v) => setField('justInImage2', v)}
        />
        {useProductImage('justInImage2')}
        <ImageSourcePicker
          label="Brand story photo"
          value={draft.brandStoryImage}
          onChange={(v) => setField('brandStoryImage', v)}
        />
        {useProductImage('brandStoryImage')}
      </section>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="font-medium">Featured products on homepage</h2>
        <p className="text-sm text-muted-foreground">
          Leave empty to show all active products. Tick pieces to curate the collection grid.
        </p>
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {products.map((p) => {
            const checked = draft.featuredProductIds.includes(p.id)
            return (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setDraft((d) => ({
                      ...d,
                      featuredProductIds: checked
                        ? d.featuredProductIds.filter((id) => id !== p.id)
                        : [...d.featuredProductIds, p.id],
                    }))
                  }}
                />
                <img src={p.image} alt="" className="h-8 w-6 object-cover" />
                <span className={!p.active ? 'text-muted-foreground line-through' : ''}>
                  {p.name}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            updateHomepage(draft)
            toast.success('Homepage saved')
          }}
        >
          Save homepage
        </Button>
      </div>
    </div>
  )
}
