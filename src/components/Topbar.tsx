import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface TopbarProps {
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  /** Acciones extra a la derecha (opcional) */
  actions?: ReactNode
}

/**
 * Barra superior reutilizable con efecto "frosted glass".
 * Extraída de las cabeceras repetidas de las pantallas Stitch.
 */
export function Topbar({
  title,
  subtitle,
  searchPlaceholder = 'Buscar...',
  actions,
}: TopbarProps) {
  return (
    <header className="glass-header sticky top-0 z-20 flex justify-between items-center px-8 py-4 w-full shadow-sm">
      <div className="flex flex-col min-w-0">
        {title && (
          <h2 className="text-headline-sm font-headline font-bold text-on-surface truncate">
            {title}
          </h2>
        )}
        {subtitle && <p className="text-label-sm text-on-surface-variant truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 ghost-border focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <Icon name="search" className="text-outline-variant text-lg" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-transparent border-none focus:ring-0 text-body-sm text-on-surface w-56 ml-2 outline-none placeholder:text-outline-variant"
          />
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Notificaciones"
          >
            <Icon name="notifications" />
          </button>
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Ayuda"
          >
            <Icon name="help_outline" />
          </button>
        </div>
      </div>
    </header>
  )
}
