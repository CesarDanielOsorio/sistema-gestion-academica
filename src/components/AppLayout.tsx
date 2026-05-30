import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Rol } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppLayoutProps {
  rol: Rol
  activeKey: string
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  topbarActions?: ReactNode
  children: ReactNode
}

/**
 * Layout principal de la app: Sidebar + Topbar + área de contenido.
 * Envuelve todas las pantallas internas (no el Login).
 */
export function AppLayout({
  rol,
  activeKey,
  title,
  subtitle,
  searchPlaceholder,
  topbarActions,
  children,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const { usuario, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar
        rol={rol}
        activeKey={activeKey}
        nombreUsuario={usuario?.nombre}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          searchPlaceholder={searchPlaceholder}
          actions={topbarActions}
        />
        <div className="flex-1 p-8 md:p-10">{children}</div>
      </main>
    </div>
  )
}
