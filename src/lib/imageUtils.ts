/** Compress images for localStorage-friendly data URLs (high visual quality, smaller payload). */

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export async function compressImageFile(
  file: File,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<string> {
  const maxWidth = opts.maxWidth ?? 1600
  const maxHeight = opts.maxHeight ?? 2000
  const quality = opts.quality ?? 0.85

  const dataUrl = await fileToDataUrl(file)
  return compressDataUrl(dataUrl, { maxWidth, maxHeight, quality })
}

export async function compressDataUrl(
  dataUrl: string,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<string> {
  const maxWidth = opts.maxWidth ?? 1600
  const maxHeight = opts.maxHeight ?? 2000
  const quality = opts.quality ?? 0.85

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not available'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = dataUrl
  })
}

export function estimateDataUrlKb(dataUrl: string): number {
  return Math.round((dataUrl.length * 3) / 4 / 1024)
}
