import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useStudioConfig } from '@/context/StudioConfigContext'
import type { StaffRole } from '@/lib/types'

export const Route = createFileRoute('/app/staff')({
  head: () => ({ meta: [{ title: 'Staff · Studio' }] }),
  component: StaffPage,
})

function StaffPage() {
  const { staff, canManageStaff, upsertStaff, removeStaff, setStaffActive, session } =
    useStudioConfig()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState<StaffRole>('staff')
  const [note, setNote] = useState('')

  if (!canManageStaff) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="font-serif text-2xl">Staff accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only the owner can add or edit team PINs. You are signed in as {session?.name}.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Team</p>
        <h1 className="mt-1 font-serif text-3xl">Staff accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          When you hire someone, create a name and PIN here. They sign in at /app with that PIN —
          not your owner PIN.
        </p>
      </div>

      <form
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault()
          const res = upsertStaff({ name, pin, role, active: true, note: note || undefined })
          if (!res.ok) {
            toast.error(res.message)
            return
          }
          toast.success(res.message)
          setName('')
          setPin('')
          setNote('')
          setRole('staff')
        }}
      >
        <p className="text-sm font-medium">Add team member</p>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
        />
        <input
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Their login PIN (min 4 chars)"
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm font-mono"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="staff">Staff — orders & inventory</option>
          <option value="manager">Manager — catalog + orders + inventory</option>
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional) — e.g. WhatsApp number"
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-primary py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
        >
          Create staff account
        </button>
      </form>

      <div className="space-y-3">
        {staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff yet — add your first hire above.</p>
        ) : (
          staff.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.role} · PIN ····{s.pin.slice(-2)} · {s.active ? 'Active' : 'Disabled'}
                  {s.note ? ` · ${s.note}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1.5 text-xs"
                  onClick={() => {
                    setStaffActive(s.id, !s.active)
                    toast.message(s.active ? 'Disabled' : 'Activated')
                  }}
                >
                  {s.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive"
                  onClick={() => {
                    if (confirm(`Remove ${s.name}?`)) {
                      removeStaff(s.id)
                      toast.success('Removed')
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
