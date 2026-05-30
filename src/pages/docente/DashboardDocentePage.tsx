import { useNavigate } from 'react-router-dom'
import { AppLayout, Card, KpiCard, Icon } from '@/components'
import { useDashboardDocente } from '@/hooks/useCalificaciones'

/**
 * Panel del Docente — conectado a Supabase.
 * Muestra los cursos del ciclo activo que tienen estudiantes inscritos (aprobados).
 */
export function DashboardDocentePage() {
  const navigate = useNavigate()
  const { ciclo, cursos, totalEstudiantes, totalPendientes, loading } = useDashboardDocente()

  return (
    <AppLayout rol="docente" activeKey="dashboard" title="Panel" subtitle="Portal Docente">
      <section className="mb-12 space-y-1">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Panel del Docente
        </h1>
        <p className="text-lg text-on-surface-variant/80">
          Aquí tienes un resumen de tus cursos del ciclo actual.
        </p>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <KpiCard
          icon="auto_stories"
          value={cursos.length}
          label="Cursos con estudiantes"
          hint={ciclo ? ciclo.nombre : '—'}
        />
        <KpiCard icon="group" value={totalEstudiantes} label="Total de estudiantes" />
        <KpiCard
          icon="assignment_late"
          value={totalPendientes}
          label="Notas pendientes"
          hint={totalPendientes > 0 ? 'Por calificar' : 'Al día'}
          highlight={totalPendientes > 0}
        />
      </section>

      {/* Mis cursos */}
      <section className="space-y-6">
        <h3 className="font-headline text-2xl font-bold text-on-surface">Mis Cursos Actuales</h3>

        {loading ? (
          <p className="text-on-surface-variant">Cargando cursos…</p>
        ) : cursos.length === 0 ? (
          <Card className="p-8 text-center text-on-surface-variant">
            Aún no tienes cursos con estudiantes inscritos en el ciclo activo. Aparecerán aquí cuando
            el administrador apruebe inscripciones.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cursos.map((c) => (
              <Card key={c.id} lift className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <Icon name="menu_book" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">{c.nombre}</h4>
                    <p className="text-sm text-on-surface-variant">
                      {c.codigo} • {c.numEstudiantes} estudiante(s)
                      {c.numPendientes > 0 && (
                        <span className="text-error font-semibold"> • {c.numPendientes} sin nota</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/docente/calificaciones')}
                  className="primary-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Icon name="edit_note" className="text-sm" />
                  Ingresar notas
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
