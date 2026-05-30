import { Card } from './Card'
import { Icon } from './Icon'

interface KpiCardProps {
  icon: string
  value: string | number
  label: string
  /** Texto secundario (ej. tendencia) */
  hint?: string
  /** Resalta la tarjeta como "acción requerida" */
  highlight?: boolean
}

/**
 * Tarjeta de métrica (KPI) de los dashboards.
 */
export function KpiCard({ icon, value, label, hint, highlight = false }: KpiCardProps) {
  return (
    <Card
      lift
      className={`p-6 flex flex-col gap-4 ${highlight ? 'bg-primary-container/20 border-l-4 border-primary' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`p-3 rounded-lg ${
            highlight ? 'bg-primary-container text-on-primary-container' : 'bg-primary-container/30 text-primary'
          }`}
        >
          <Icon name={icon} />
        </div>
        {hint && (
          <span
            className={`text-label-sm font-medium ${highlight ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            {hint}
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-display-sm font-headline font-bold ${
            highlight ? 'text-on-primary-container' : 'text-on-surface'
          }`}
        >
          {value}
        </p>
        <p
          className={`text-label-md font-medium ${
            highlight ? 'text-on-primary-container/80' : 'text-on-surface-variant'
          }`}
        >
          {label}
        </p>
      </div>
    </Card>
  )
}
