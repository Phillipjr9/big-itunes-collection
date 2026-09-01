import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ShopProvider } from '@/context/ShopContext'
import { StudioConfigProvider } from '@/context/StudioConfigContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ShopProvider>
      <StudioConfigProvider>
        <Outlet />
      </StudioConfigProvider>
    </ShopProvider>
  )
}
