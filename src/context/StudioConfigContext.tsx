import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CLIENT_ADMIN_PIN, fetchShopFromNeon, saveShopToNeon } from '@/lib/neonClient'
import { loadJSON, saveJSON } from '@/lib/persist'
import { DEFAULT_CLOTH_CATEGORIES, type StaffMember, type StaffRole } from '@/lib/types'

const OWNER_PIN = CLIENT_ADMIN_PIN

type Session = {
  kind: 'owner' | 'staff'
  staffId?: string
  name: string
  role: StaffRole
}

interface StudioConfigValue {
  ready: boolean
  categories: string[]
  staff: StaffMember[]
  session: Session | null
  isStudioOpen: boolean
  canManageStaff: boolean
  canEditCatalog: boolean
  loginStudio: (pin: string) => { ok: boolean; message: string }
  logoutStudio: () => void
  addCategory: (name: string) => { ok: boolean; message: string }
  removeCategory: (name: string) => { ok: boolean; message: string }
  upsertStaff: (member: Omit<StaffMember, 'id' | 'createdAt'> & { id?: string }) => {
    ok: boolean
    message: string
  }
  removeStaff: (id: string) => void
  setStaffActive: (id: string, active: boolean) => void
}

const StudioConfigContext = createContext<StudioConfigValue | null>(null)

function staffId() {
  return `STF-${Date.now().toString(36).toUpperCase()}`
}

export function StudioConfigProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CLOTH_CATEGORIES])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const localSession = loadJSON<Session | null>('studio_session', null)
      const localCats = loadJSON<string[]>('categories', [...DEFAULT_CLOTH_CATEGORIES])
      const localStaff = loadJSON<StaffMember[]>('staff', [])

      const remote = await fetchShopFromNeon()
      if (cancelled) return

      if (remote?.neon) {
        if (Array.isArray(remote.categories) && (remote.categories as string[]).length > 0) {
          setCategories(remote.categories as string[])
        } else {
          setCategories(localCats)
        }
        if (Array.isArray(remote.staff)) {
          setStaff(remote.staff as StaffMember[])
        } else {
          setStaff(localStaff)
        }
      } else {
        setCategories(localCats)
        setStaff(localStaff)
      }
      setSession(localSession)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    saveJSON('categories', categories)
  }, [categories, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('staff', staff)
  }, [staff, ready])
  useEffect(() => {
    if (!ready) return
    saveJSON('studio_session', session)
  }, [session, ready])

  useEffect(() => {
    if (!ready || !session || session.kind !== 'owner') return
    const t = window.setTimeout(() => {
      void saveShopToNeon({ categories, staff }, OWNER_PIN)
    }, 800)
    return () => window.clearTimeout(t)
  }, [categories, staff, ready, session])

  const loginStudio = useCallback(
    (pin: string) => {
      const trimmed = pin.trim()
      if (!trimmed) return { ok: false, message: 'Enter your PIN' }
      if (trimmed === OWNER_PIN) {
        setSession({ kind: 'owner', name: 'Owner', role: 'owner' })
        return { ok: true, message: 'Welcome, owner' }
      }
      const member = staff.find((s) => s.active && s.pin === trimmed)
      if (!member) return { ok: false, message: 'That PIN doesn’t match any active account.' }
      setSession({
        kind: 'staff',
        staffId: member.id,
        name: member.name,
        role: member.role,
      })
      return { ok: true, message: `Welcome, ${member.name}` }
    },
    [staff],
  )

  const logoutStudio = useCallback(() => setSession(null), [])

  const addCategory = useCallback((name: string) => {
    const n = name.trim()
    if (!n) return { ok: false, message: 'Enter a category name' }
    setCategories((list) => {
      if (list.some((c) => c.toLowerCase() === n.toLowerCase())) return list
      return [...list, n]
    })
    return { ok: true, message: `Added “${n}”` }
  }, [])

  const removeCategory = useCallback((name: string) => {
    setCategories((list) => list.filter((c) => c !== name))
    return { ok: true, message: 'Removed' }
  }, [])

  const upsertStaff = useCallback(
    (input: Omit<StaffMember, 'id' | 'createdAt'> & { id?: string }) => {
      if (!input.name.trim()) return { ok: false, message: 'Name is required' }
      if (!input.pin.trim() || input.pin.trim().length < 4) {
        return { ok: false, message: 'PIN must be at least 4 characters' }
      }
      if (input.pin.trim() === OWNER_PIN) {
        return { ok: false, message: 'Choose a different PIN (not the owner PIN)' }
      }
      const pinTaken = staff.some(
        (s) => s.pin === input.pin.trim() && s.id !== input.id,
      )
      if (pinTaken) return { ok: false, message: 'That PIN is already used by someone else' }

      if (input.id) {
        setStaff((list) =>
          list.map((s) =>
            s.id === input.id
              ? {
                  ...s,
                  name: input.name.trim(),
                  pin: input.pin.trim(),
                  role: input.role,
                  active: input.active,
                  note: input.note,
                }
              : s,
          ),
        )
        return { ok: true, message: 'Staff updated' }
      }
      const member: StaffMember = {
        id: staffId(),
        name: input.name.trim(),
        pin: input.pin.trim(),
        role: input.role,
        active: input.active,
        note: input.note,
        createdAt: new Date().toISOString(),
      }
      setStaff((list) => [member, ...list])
      return { ok: true, message: `${member.name} can sign in with their PIN` }
    },
    [staff],
  )

  const removeStaff = useCallback((id: string) => {
    setStaff((list) => list.filter((s) => s.id !== id))
  }, [])

  const setStaffActive = useCallback((id: string, active: boolean) => {
    setStaff((list) => list.map((s) => (s.id === id ? { ...s, active } : s)))
  }, [])

  const isStudioOpen = Boolean(session)
  const canManageStaff = session?.role === 'owner'
  const canEditCatalog = session?.role === 'owner' || session?.role === 'manager'

  const value = useMemo(
    () => ({
      ready,
      categories,
      staff,
      session,
      isStudioOpen,
      canManageStaff,
      canEditCatalog,
      loginStudio,
      logoutStudio,
      addCategory,
      removeCategory,
      upsertStaff,
      removeStaff,
      setStaffActive,
    }),
    [
      ready,
      categories,
      staff,
      session,
      isStudioOpen,
      canManageStaff,
      canEditCatalog,
      loginStudio,
      logoutStudio,
      addCategory,
      removeCategory,
      upsertStaff,
      removeStaff,
      setStaffActive,
    ],
  )

  return (
    <StudioConfigContext.Provider value={value}>{children}</StudioConfigContext.Provider>
  )
}

export function useStudioConfig() {
  const ctx = useContext(StudioConfigContext)
  if (!ctx) throw new Error('useStudioConfig must be used within StudioConfigProvider')
  return ctx
}
