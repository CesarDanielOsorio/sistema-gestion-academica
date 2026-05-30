import type { Rol } from '@/types/database'

/** Ruta de inicio (portal) según el rol del usuario. */
export function homePorRol(rol: Rol | null): string {
  switch (rol) {
    case 'admin':
      return '/admin'
    case 'docente':
      return '/docente'
    case 'estudiante':
      return '/estudiante'
    default:
      return '/login'
  }
}
