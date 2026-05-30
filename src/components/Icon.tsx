interface IconProps {
  /** Nombre del icono de Material Symbols Outlined (ej. "dashboard") */
  name: string
  /** Relleno del icono (FILL 1) */
  filled?: boolean
  className?: string
  title?: string
}

/**
 * Envoltorio de Material Symbols Outlined.
 * Reemplaza los <span class="material-symbols-outlined"> repetidos en las pantallas Stitch.
 */
export function Icon({ name, filled = false, className = '', title }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      {name}
    </span>
  )
}
