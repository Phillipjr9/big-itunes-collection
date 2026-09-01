import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'
import { useStudioConfig } from '@/context/StudioConfigContext'
import { SharedAppLayout } from '@/layouts/shared-app-layout'
import { CLIENT_ADMIN_PIN } from '@/lib/neonClient'
import { Lock, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/app')({
  component: AppLayoutGate,
})

function AppLayoutGate() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#1a1218]">
          <div className="h-10 w-10 animate-pulse rounded-full bg-primary/40" />
          <p className="text-sm text-white/50">Opening your studio…</p>
        </div>
      }
    >
      <AdminGate />
    </BlinkClientBoundary>
  )
}

function AdminGate() {
  const { isStudioOpen, loginStudio, logoutStudio, session } = useStudioConfig()
  const { loginAdmin, logoutAdmin } = useShop()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const tryLogin = () => {
    const res = loginStudio(pin)
    if (!res.ok) {
      setError(res.message)
      return
    }
    setError('')
    if (pin.trim() === CLIENT_ADMIN_PIN) loginAdmin(pin.trim())
  }

  if (!isStudioOpen) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#1a1218_0%,#2d1a24_40%,#f8f4f1_40%,#f8f4f1_100%)]" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 rounded-2xl bg-white/90 p-4 shadow-lg shadow-primary/10 backdrop-blur">
              <BrandLogo className="[&_img]:h-12 [&_img]:max-w-[180px]" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
              <Sparkles className="h-3 w-3" /> Studio access
            </div>
            <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Owner and staff each use their own PIN. Create staff under Team after you sign in as
              owner.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/95 p-8 shadow-xl shadow-primary/5 backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="h-4 w-4 text-primary" />
              Access PIN
            </div>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError('')
              }}
              placeholder="••••••••"
              className="h-12 rounded-2xl border-border/80 bg-secondary/40 text-center text-lg tracking-[0.35em]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') tryLogin()
              }}
            />
            {error && (
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              className="mt-5 h-12 w-full rounded-2xl text-sm font-semibold shadow-md shadow-primary/25"
              onClick={tryLogin}
            >
              Enter studio
            </Button>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Owner demo PIN · <span className="font-mono text-foreground">itunes2026</span>
            </p>
          </div>

          <button
            type="button"
            className="mt-8 w-full text-center text-sm text-muted-foreground transition hover:text-primary"
            onClick={() => navigate({ to: '/' })}
          >
            ← Back to the boutique
          </button>
        </div>
      </div>
    )
  }

  return (
    <SharedAppLayout appName="Studio">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-card/80 px-4 py-3.5 backdrop-blur-md md:px-8">
        <div className="min-w-0">
          <p className="truncate font-serif text-lg tracking-tight text-foreground">Studio</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Signed in as {session?.name} · {session?.role}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/25 text-primary hover:bg-primary/5"
            onClick={() => navigate({ to: '/' })}
          >
            View shop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => {
              logoutStudio()
              logoutAdmin()
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-[radial-gradient(ellipse_at_top,_rgba(180,80,100,0.06),_transparent_50%),linear-gradient(to_bottom,#faf7f5,#f5f0ec)] p-4 md:p-8">
        <Outlet />
      </div>
    </SharedAppLayout>
  )
}
