import { Camera, ImagePlus, Link2, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { compressImageFile, estimateDataUrlKb } from '@/lib/imageUtils'

/** Upload file, paste URL, or capture photo from device camera. */
export function ImageSourcePicker({
  value,
  onChange,
  label = 'Product photo',
  aspectHint = 'Portrait clothing shots work best',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
  aspectHint?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [urlDraft, setUrlDraft] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function handleFile(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    setBusy(true)
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1600, maxHeight: 2000, quality: 0.85 })
      const kb = estimateDataUrlKb(dataUrl)
      if (kb > 1800) {
        toast.error('Image is still too large after compression. Try a smaller photo.')
        return
      }
      onChange(dataUrl)
      toast.success(`Photo ready (~${kb} KB)`)
    } catch {
      toast.error('Could not process image')
    } finally {
      setBusy(false)
    }
  }

  async function openLiveCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      // Fallback: mobile capture input
      cameraRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play()
        }
      })
    } catch {
      cameraRef.current?.click()
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  function captureFrame() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    onChange(dataUrl)
    toast.success(`Photo captured (~${estimateDataUrlKb(dataUrl)} KB)`)
    closeCamera()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{aspectHint}</p>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-md border bg-secondary">
          <img src={value} alt="Preview" className="mx-auto max-h-56 w-full object-contain" />
          <button
            type="button"
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
            onClick={() => onChange('')}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="mr-1.5 h-4 w-4" />
          Upload
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void openLiveCamera()}>
          <Camera className="mr-1.5 h-4 w-4" />
          Take photo
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowUrl((v) => !v)}>
          <Link2 className="mr-1.5 h-4 w-4" />
          Image URL
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {showUrl && (
        <div className="flex gap-2">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://… or leave blank"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const u = urlDraft.trim()
              if (!u) {
                toast.error('Paste an image URL')
                return
              }
              onChange(u)
              setShowUrl(false)
              setUrlDraft('')
              toast.success('Image URL set')
            }}
          >
            Apply
          </Button>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 p-4">
          <div className="mb-3 flex items-center justify-between text-white">
            <p className="text-sm font-medium">Camera</p>
            <button type="button" aria-label="Close camera" onClick={closeCamera}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <video ref={videoRef} playsInline muted className="mx-auto max-h-[70vh] w-full max-w-lg rounded-lg object-cover" />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="button" variant="outline" onClick={closeCamera}>
              Cancel
            </Button>
            <Button type="button" onClick={captureFrame}>
              Capture photo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
