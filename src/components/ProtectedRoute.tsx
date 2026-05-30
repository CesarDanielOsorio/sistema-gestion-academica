import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Rol } from '@/types/database'
import { useAuth } from '@/context/AuthContext'
import { homePorRol } from '@/lib/roles'

interface ProtectedRouteProps {
  /** Roles permitidos para esta ruta. Si se omite, basta con estar autenticado. */
  roles?: Rol[]
  children: ReactNode
}

/**
 * Protege una ruta: exige sesión activa y, opcionalmente, un rol permitido.
 * - Sin sesión -> redirige a /login.
 * - Rol no permitido -> redirige al inicio del rol del usuario.
 */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { session, rol, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
        Cargando…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (roles && rol && !roles.includes(rol)) {
    return <Navigate to={homePorRol(rol)} replace />
  }

  return <>{children}</>
}
