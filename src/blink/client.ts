import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'itunes-fashion-store-ujavjsx5',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || '',
  authRequired: false,
  auth: { mode: 'managed' },
})
