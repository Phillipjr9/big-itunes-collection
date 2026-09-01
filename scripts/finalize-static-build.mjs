/**
 * Flatten TanStack Start client build into static `dist/` for Vercel/static hosts.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const SRC = '.vite-out/client'
const DEST = 'dist'

if (!existsSync(SRC)) {
  console.error(`[finalize] build output missing: ${SRC} — did "vite build" run?`)
  process.exit(1)
}

mkdirSync(DEST, { recursive: true })

for (const entry of readdirSync(SRC)) {
  try {
    cpSync(join(SRC, entry), join(DEST, entry), { recursive: true, force: true })
  } catch (e) {
    if (entry === '_redirects') {
      console.warn(`[finalize] skip ${entry}: ${e.code || e.message}`)
    } else {
      console.error(`[finalize] FAILED copying ${entry}: ${e.code || e.message}`)
      process.exit(1)
    }
  }
}

const indexPath = join(DEST, 'index.html')
if (!existsSync(indexPath)) {
  const assetsDir = join(DEST, 'assets')
  if (!existsSync(assetsDir)) {
    console.error('[finalize] no assets/ and no index.html — aborting')
    process.exit(1)
  }
  const files = readdirSync(assetsDir)
  const css = files.filter((f) => f.endsWith('.css')).sort((a, b) => {
    return statSync(join(assetsDir, b)).size - statSync(join(assetsDir, a)).size
  })[0]
  // Prefer the largest index-*.js as the main client entry
  const indexJs = files
    .filter((f) => /^index-.*\.js$/.test(f))
    .sort((a, b) => statSync(join(assetsDir, b)).size - statSync(join(assetsDir, a)).size)[0]
  if (!indexJs) {
    console.error('[finalize] could not find main index-*.js in assets/')
    process.exit(1)
  }
  const cssTag = css ? `  <link rel="stylesheet" href="/assets/${css}" />\n` : ''
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Big ITunes Collection</title>
  <meta name="theme-color" content="#c02668" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
${cssTag}</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${indexJs}"></script>
</body>
</html>
`
  writeFileSync(indexPath, html)
  console.log(`[finalize] generated SPA index.html → assets/${indexJs}`)
}

rmSync('.vite-out', { recursive: true, force: true })

if (!existsSync(indexPath)) {
  console.error('[finalize] dist/index.html missing after flatten')
  process.exit(1)
}

console.log('[finalize] ✓ static build ready at dist/index.html')
