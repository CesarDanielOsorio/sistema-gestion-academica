import { AppLayout, Card, Icon } from '@/components'
import { useMiPensum, type EstadoCursoPensum } from '@/hooks/usePensum'

/**
 * Mi Pensum (HU-10) — avance académico real, conectado a Supabase.
 */
const ESTILO_BORDE: Record<EstadoCursoPensum, string> = {
  aprobado: 'border-primary',
  en_curso: 'border-tertiary',
  pendiente: 'border-outline-variant/40',
}

const ESTILO_CHIP: Record<EstadoCursoPensum, string> = {
  aprobado: 'bg-primary-container/40 text-on-primary-container',
  en_curso: 'bg-tertiary-container/50 text-on-tertiary-container',
  pendiente: 'bg-surface-container-high text-on-surface-variant',
}

const ETIQUETA: Record<EstadoCursoPensum, string> = {
  aprobado: 'Aprobado',
  en_curso: 'En curso',
  pendiente: 'Pendiente',
}

export function PensumPage() {
  const { carreraNombre, ciclos, resumen, loading } = useMiPensum()

  return (
    <AppLayout rol="estudiante" activeKey="pensum" title="Pensum" subtitle="Portal del Estudiante">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            Mi Pensum
          </h1>
          <p className="text-on-surface-variant max-w-md">
            {carreraNombre ? `Carrera: ${carreraNombre}.` : ''} Visualiza tu trayectoria y avance
            académico.
          </p>
        </div>
        <Card className="p-6 w-full md:w-80">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-primary tracking-wide">PROGRESO TOTAL</span>
            <span className="text-2xl font-black text-on-surface">{resumen.avance}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
            <div className="primary-gradient h-full rounded-full" style={{ width: `${resumen.avance}%` }} />
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold text-outline-variant uppercase">
            <span>{resumen.creditosAprobados} créditos</span>
            <span>{resumen.creditosTotales} totales</span>
          </div>
        </Card>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: 'check_circle', valor: resumen.aprobados, label: 'Cursos Aprobados', color: 'bg-primary-container text-on-primary-container' },
          { icon: 'sync', valor: resumen.enCurso, label: 'En Curso', color: 'bg-tertiary-container text-on-tertiary-container' },
          { icon: 'hourglass_empty', valor: resumen.pendientes, label: 'Pendientes', color: 'bg-surface-container-high text-outline' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-low p-5 rounded-xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.color}`}>
              <Icon name={s.icon} filled />
            </div>
            <div>
              <div className="text-2xl font-bold text-on-surface">{s.valor}</div>
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mapa del pensum */}
      {loading ? (
        <p className="text-on-surface-variant">Cargando pensum…</p>
      ) : ciclos.length === 0 ? (
        <Card className="p-12 text-center text-on-surface-variant">
          Tu carrera aún no tiene cursos en el pensum.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {ciclos.map((sem) => (
            <section key={sem.ciclo}>
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold font-headline text-on-surface">Ciclo {sem.ciclo}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sem.cursos.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-surface-container-lowest p-4 rounded-xl border-l-4 ${ESTILO_BORDE[c.estado]} tonal-lift`}
                  >
                    <div className="text-[10px] font-bold text-outline uppercase mb-1">{c.codigo}</div>
                    <h3 className="text-sm font-bold text-on-surface mb-3 leading-tight">{c.nombre}</h3>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${ESTILO_CHIP[c.estado]}`}>
                        {ETIQUETA[c.estado]}
                      </span>
                      {c.nota != null && (
                        <span className="text-xs font-bold text-on-surface">{c.nota}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
