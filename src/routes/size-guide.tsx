import { createFileRoute } from '@tanstack/react-router'
import { StoreChrome } from '@/components/storefront/StoreChrome'

export const Route = createFileRoute('/size-guide')({
  head: () => ({ meta: [{ title: 'Size guide · Big ITunes Collection' }] }),
  component: () => (
    <StoreChrome>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <h1 className="font-serif text-4xl">Size guide</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Measurements in inches. If you are between sizes, we usually recommend sizing up for a
          softer drape — or message us with your preferred fit.
        </p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Bust</th>
                <th className="py-3 pr-4">Waist</th>
                <th className="py-3">Hips</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['XS', '32–33', '24–25', '34–35'],
                ['S', '34–35', '26–27', '36–37'],
                ['M', '36–37', '28–29', '38–39'],
                ['L', '38–40', '30–32', '40–42'],
                ['XL', '41–43', '33–35', '43–45'],
                ['XXL', '44–46', '36–38', '46–48'],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-border/60">
                  {row.map((cell) => (
                    <td key={cell} className="py-3 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </StoreChrome>
  ),
})
