import { Link } from 'react-router-dom'
import type { Rol } from '@/types/database'
import { NAV_BY_ROL, SUBTITULO_POR_ROL } from '@/config/navigation'
import { Icon } from './Icon'

interface SidebarProps {
  rol: Rol
  /** Clave del item activo (ver NAV_BY_ROL) */
  activeKey: string
  /** Nombre a mostrar en el pie del sidebar */
  nombreUsuario?: string
  onLogout?: () => void
}

/**
 * Barra lateral reutilizable (extraída de las pantallas Stitch).
 * Misma estructura para los 3 roles; los items vienen de la config de navegación.
 */
export function Sidebar({ rol, activeKey, nombreUsuario = 'Usuario', onLogout }: SidebarProps) {
  const items = NAV_BY_ROL[rol]

  return (
    <aside className="h-screen w-72 shrink-0 sticky top-0 left-0 z-30 bg-surface-container-low flex flex-col py-8 px-6">
      {/* Marca */}
      <div className="mb-8 px-2">
        <h1 className="text-headline-sm font-headline font-bold tracking-tight text-on-surface leading-tight">
          The Academic Atelier
        </h1>
        <p className="text-label-sm font-label text-on-surface-variant opacity-70 mt-1 uppercase tracking-widest">
          {SUBTITULO_POR_ROL[rol]}
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = item.key === activeKey
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                isActive
                  ? 'flex items-center gap-3 px-4 py-3 rounded-l-lg text-primary font-bold border-r-4 border-primary bg-surface-container-lowest transition-all'
                  : 'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors'
              }
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="text-body-md font-body">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Pie: usuario + logout */}
      <div className="mt-auto pt-4 border-t border-outline-variant/10 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold font-headline">
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-label-md font-bold text-on-surface">{nombreUsuario}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {rol}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container/10 rounded-lg transition-colors"
        >
          <Icon name="logout" />
          <span className="text-label-md">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
