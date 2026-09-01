/**
 * Payment receipt helpers: extract transaction references, fingerprint images,
 * and raise red flags for likely reuse / mismatch (not 100% fraud proof).
 */

export type ReceiptFlagCode =
  | 'duplicate_txn'
  | 'duplicate_image'
  | 'amount_mismatch'
  | 'missing_txn'
  | 'weak_txn'
  | 'ocr_failed'

export interface ReceiptFlag {
  code: ReceiptFlagCode
  severity: 'critical' | 'warning'
  message: string
}

export interface ReceiptScanResult {
  transactionId: string | null
  amountDetected: number | null
  imageHash: string | null
  ocrTextPreview?: string
  flags: ReceiptFlag[]
  scannedAt: string
}

/** Normalize bank refs for comparison */
export function normalizeTxnId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

/** Common Nigerian transfer / POS reference patterns */
const TXN_PATTERNS: RegExp[] = [
  /(?:transaction\s*(?:id|ref(?:erence)?)|ref(?:erence)?|rrn|stan|session\s*id|session\s*ids?|retrieval\s*ref(?:erence)?|payment\s*ref|trans\s*id|txn\s*(?:id|ref)?)[\s:#.*=\-]*([A-Z0-9]{8,32})/gi,
  /\b([0-9]{12,22})\b/g,
  /\b([A-Z]{2,4}[0-9]{8,18})\b/g,
  /\b([0-9]{6,10}[A-Z]{2,6}[0-9]{4,12})\b/gi,
]

const WEAK_TXN = new Set([
  '000000000000',
  '111111111111',
  '123456789012',
  'TEST',
  'TESTING',
  'ABCDEFGH',
])

export function extractTransactionIds(text: string): string[] {
  if (!text?.trim()) return []
  const found = new Set<string>()
  for (const re of TXN_PATTERNS) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const cand = normalizeTxnId(m[1] || m[0])
      if (cand.length >= 8 && cand.length <= 32) found.add(cand)
    }
  }
  return [...found]
}

export function extractAmountsNaira(text: string): number[] {
  if (!text?.trim()) return []
  const amounts = new Set<number>()
  const re =
    /(?:₦|NGN|N)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const n = Number(m[1].replace(/,/g, ''))
    if (Number.isFinite(n) && n >= 100) amounts.add(Math.round(n))
  }
  // bare large numbers near "amount"
  const near =
    /(?:amount|total|debit|credit|paid)[^0-9]{0,20}([0-9]{1,3}(?:,[0-9]{3})+)/gi
  while ((m = near.exec(text)) !== null) {
    const n = Number(m[1].replace(/,/g, ''))
    if (Number.isFinite(n) && n >= 100) amounts.add(Math.round(n))
  }
  return [...amounts]
}

/** Simple dHash-style fingerprint from data URL (browser). */
export async function hashImageDataUrl(dataUrl: string): Promise<string | null> {
  if (typeof window === 'undefined' || !dataUrl?.startsWith('data:image')) return null
  try {
    const img = await loadImage(dataUrl)
    const size = 16
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)
    const grays: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      grays.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    }
    let bits = ''
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size - 1; x++) {
        const i = y * size + x
        bits += grays[i] > grays[i + 1] ? '1' : '0'
      }
    }
    // hex compress
    let hex = ''
    for (let i = 0; i < bits.length; i += 4) {
      hex += parseInt(bits.slice(i, i + 4), 2).toString(16)
    }
    return hex
  } catch {
    return null
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

/** Best-effort OCR via dynamic tesseract (optional — fails soft). */
export async function ocrReceiptText(dataUrl: string): Promise<string> {
  try {
    const Tesseract = await import('tesseract.js')
    const result = await Tesseract.recognize(dataUrl, 'eng', {
      logger: () => {},
    })
    return result.data.text || ''
  } catch {
    return ''
  }
}

export function evaluateReceipt(input: {
  manualTxnId?: string
  ocrText?: string
  imageHash?: string | null
  orderTotal: number
  existingOrders: {
    id: string
    paymentReference?: string
    paymentProofHash?: string
  }[]
  currentOrderId?: string
}): ReceiptScanResult {
  const flags: ReceiptFlag[] = []
  const fromManual = input.manualTxnId ? normalizeTxnId(input.manualTxnId) : ''
  const fromOcr = extractTransactionIds(input.ocrText || '')
  const transactionId =
    (fromManual.length >= 6 ? fromManual : null) || fromOcr[0] || null

  const amounts = extractAmountsNaira(input.ocrText || '')
  let amountDetected: number | null = null
  if (amounts.length) {
    // closest to order total
    amountDetected = amounts.reduce((best, a) =>
      Math.abs(a - input.orderTotal) < Math.abs(best - input.orderTotal) ? a : best,
    )
  }

  if (!transactionId) {
    flags.push({
      code: 'missing_txn',
      severity: 'warning',
      message: 'No transaction ID / reference found — ask customer for bank ref.',
    })
  } else {
    if (transactionId.length < 8 || WEAK_TXN.has(transactionId) || /^(0+|1+)$/.test(transactionId)) {
      flags.push({
        code: 'weak_txn',
        severity: 'warning',
        message: `Transaction ID looks weak or placeholder (${transactionId}).`,
      })
    }
    const dup = input.existingOrders.find(
      (o) =>
        o.id !== input.currentOrderId &&
        o.paymentReference &&
        normalizeTxnId(o.paymentReference) === transactionId,
    )
    if (dup) {
      flags.push({
        code: 'duplicate_txn',
        severity: 'critical',
        message: `Same transaction ID already used on order ${dup.id} — possible reused / fake receipt.`,
      })
    }
  }

  if (input.imageHash) {
    const dupImg = input.existingOrders.find(
      (o) =>
        o.id !== input.currentOrderId &&
        o.paymentProofHash &&
        o.paymentProofHash === input.imageHash,
    )
    if (dupImg) {
      flags.push({
        code: 'duplicate_image',
        severity: 'critical',
        message: `Same receipt image fingerprint as order ${dupImg.id} — likely reused screenshot.`,
      })
    }
  }

  if (amountDetected != null && input.orderTotal > 0) {
    const diff = Math.abs(amountDetected - input.orderTotal)
    const tol = Math.max(50, input.orderTotal * 0.02)
    if (diff > tol) {
      flags.push({
        code: 'amount_mismatch',
        severity: 'critical',
        message: `Receipt amount ~₦${amountDetected.toLocaleString('en-NG')} does not match order ₦${input.orderTotal.toLocaleString('en-NG')}.`,
      })
    }
  }

  return {
    transactionId,
    amountDetected,
    imageHash: input.imageHash ?? null,
    ocrTextPreview: input.ocrText?.slice(0, 280),
    flags,
    scannedAt: new Date().toISOString(),
  }
}

export async function scanPaymentProof(opts: {
  dataUrl?: string
  manualTxnId?: string
  orderTotal: number
  existingOrders: {
    id: string
    paymentReference?: string
    paymentProofHash?: string
  }[]
  currentOrderId?: string
  runOcr?: boolean
}): Promise<ReceiptScanResult> {
  let ocrText = ''
  let imageHash: string | null = null
  const flagsExtra: ReceiptFlag[] = []

  if (opts.dataUrl) {
    imageHash = await hashImageDataUrl(opts.dataUrl)
    if (opts.runOcr !== false) {
      ocrText = await ocrReceiptText(opts.dataUrl)
      if (!ocrText.trim() && !opts.manualTxnId) {
        flagsExtra.push({
          code: 'ocr_failed',
          severity: 'warning',
          message: 'Could not read text from image — enter transaction ID manually.',
        })
      }
    }
  }

  const result = evaluateReceipt({
    manualTxnId: opts.manualTxnId,
    ocrText,
    imageHash,
    orderTotal: opts.orderTotal,
    existingOrders: opts.existingOrders,
    currentOrderId: opts.currentOrderId,
  })
  result.flags = [...flagsExtra, ...result.flags]
  return result
}

export function hasCriticalFlags(flags: ReceiptFlag[] | undefined): boolean {
  return Boolean(flags?.some((f) => f.severity === 'critical'))
}
