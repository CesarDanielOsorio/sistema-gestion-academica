import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Aplica el efecto de elevación tonal */
  lift?: boolean
}

/**
 * Contenedor base: tarjeta blanca sobre el fondo claro, sin bordes duros.
 * Es el "lienzo de papel" del sistema de diseño.
 */
export function Card({ children, className = '', lift = false }: CardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl ghost-border ${
        lift ? 'tonal-lift' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
