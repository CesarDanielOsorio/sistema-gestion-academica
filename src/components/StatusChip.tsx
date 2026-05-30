type StatusVariant =
  | 'pendiente'
  | 'aprobada'
  | 'aprobado'
  | 'cancelada'
  | 'rechazada'
  | 'reprobado'
  | 'activo'
  | 'inactivo'
  | 'neutral'

interface StatusChipProps {
  variant: StatusVariant
  children: React.ReactNode
}

// "Estados suaves": fondo contenedor + texto on-container, nunca rojos/verdes fuertes.
const VARIANT_CLASSES: Record<StatusVariant, string> = {
  pendiente: 'bg-secondary-container text-on-secondary-container',
  aprobada: 'bg-primary-container/30 text-on-primary-container',
  aprobado: 'bg-primary-container/30 text-on-primary-container',
  activo: 'bg-primary-container/30 text-on-primary-container',
  cancelada: 'bg-surface-container-high text-on-surface-variant',
  inactivo: 'bg-surface-container-high text-on-surface-variant',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  rechazada: 'bg-error-container/20 text-on-error-container',
  reprobado: 'bg-error-container/20 text-on-error-container',
}

/**
 * Chip de estado tipo píldora (extraído de tablas y listas de las pantallas Stitch).
 */
export function StatusChip({ variant, children }: StatusChipProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  )
}
