import { Link } from 'react-router-dom'
import { AppLayout, Card, KpiCard, Icon, StatusChip } from '@/components'
import { useDashboardAdmin } from '@/hooks/useDashboards'

/**
 * Panel del Administrador — conectado a Supabase.
 */
export function PanelAdminPage() {
  const { estudiantes, docentes, cursos, pendientes, ciclo, solicitudes, loading } =
    useDashboardAdmin()

  return (
    <AppLayout rol="admin" activeKey="dashboard" title="Panel" subtitle="Portal Administrativo">
      <section className="mb-10">
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
          Panel del Administrador
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-light">
          Resumen general de la actividad académica del sistema.
        </p>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard icon="person" value={estudiantes} label="Estudiantes activos" />
        <KpiCard icon="badge" value={docentes} label="Docentes" />
        <KpiCard icon="menu_book" value={cursos} label="Cursos" />
        <KpiCard
          icon="pending_actions"
          value={pendientes}
          label="Inscripciones pendientes"
          hint={pendientes > 0 ? 'Acción requerida' : 'Al día'}
          highlight={pendientes > 0}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Solicitudes recientes */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-title-lg font-headline font-bold text-on-surface">
              Solicitudes de inscripción pendientes
            </h3>
            <Link
              to="/admin/inscripciones"
              className="text-label-md font-bold text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant text-label-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Estudiante</th>
                  <th className="px-6 py-4 font-bold">Curso</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">
                      Cargando…
                    </td>
                  </tr>
                ) : solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">
                      No hay solicitudes pendientes.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                            {s.estudiante.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span className="text-body-md font-medium text-on-surface">{s.estudiante}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">{s.curso}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {new Date(s.fecha).toLocaleDateString('es-GT')}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip variant="pendiente">Pendiente</StatusChip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Ciclo activo + accesos */}
        <div className="space-y-6">
          <Card className="p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-title-md font-headline font-bold text-on-surface mb-1">
                Ciclo académico activo
              </h3>
              <div className="flex items-center gap-2 text-primary font-bold">
                <Icon name="event_repeat" className="text-sm" />
                <span className="text-body-md">{ciclo ? ciclo.nombre : 'Sin ciclo activo'}</span>
              </div>
              {ciclo && (
                <p className="text-label-sm text-on-surface-variant mt-2">
                  {new Date(ciclo.fecha_inicio).toLocaleDateString('es-GT')} —{' '}
                  {new Date(ciclo.fecha_fin).toLocaleDateString('es-GT')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Accesos directos
              </h3>
              <Link
                to="/admin/estudiantes"
                className="primary-gradient text-on-primary py-4 px-6 rounded-xl font-bold flex items-center gap-3 tonal-lift"
              >
                <Icon name="person_add" />
                Registrar estudiante
              </Link>
              <Link
                to="/admin/pensum"
                className="bg-surface-container-high text-on-surface py-4 px-6 rounded-xl font-bold flex items-center gap-3 hover:bg-surface-container-highest transition-colors"
              >
                <Icon name="edit_note" />
                Gestionar pensum
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </AppLayout>
  )
}
