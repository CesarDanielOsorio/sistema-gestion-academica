import { Link } from 'react-router-dom'
import { AppLayout, Card, KpiCard, StatusChip, Icon } from '@/components'
import { useDashboardEstudiante } from '@/hooks/useDashboards'
import { useAuth } from '@/context/AuthContext'

/**
 * Panel del Estudiante — conectado a Supabase.
 */
export function DashboardEstudiantePage() {
  const { usuario } = useAuth()
  const { cursosInscritos, promedio, avance, constancias, notasRecientes, loading } =
    useDashboardEstudiante()

  return (
    <AppLayout rol="estudiante" activeKey="dashboard" title="Sistema de Gestión Académica" subtitle="Portal del Estudiante">
      <header className="mb-10 max-w-5xl">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
          Panel del Estudiante
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-light">
          Bienvenido{usuario?.nombre ? `, ${usuario.nombre}` : ''}. Aquí tienes un resumen de tu
          actividad académica.
        </p>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <KpiCard icon="class" value={cursosInscritos} label="Cursos Inscritos" hint="Ciclo actual" />
        <KpiCard icon="analytics" value={promedio} label="Promedio General" />
        <KpiCard icon="moving" value={`${avance}%`} label="Avance Pensum" />
        <KpiCard icon="description" value={constancias} label="Constancias Generadas" />
      </div>

      {/* Calificaciones recientes */}
      <Card className="overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              Calificaciones Recientes
            </h2>
            <p className="text-sm text-on-surface-variant">Tus últimas notas registradas.</p>
          </div>
          <Link to="/estudiante/notas" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-8 py-4 font-semibold">Curso</th>
                <th className="px-8 py-4 font-semibold">Estado</th>
                <th className="px-8 py-4 font-semibold text-right">Nota Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-on-surface-variant">
                    Cargando…
                  </td>
                </tr>
              ) : notasRecientes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-on-surface-variant">
                    Aún no tienes notas registradas.
                  </td>
                </tr>
              ) : (
                notasRecientes.map((n, i) => (
                  <tr key={`${n.curso}-${i}`} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-5 font-medium text-on-surface">{n.curso}</td>
                    <td className="px-8 py-5">
                      <StatusChip variant={n.aprobado ? 'aprobado' : 'reprobado'}>
                        {n.aprobado ? 'Aprobado' : 'Reprobado'}
                      </StatusChip>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-on-surface">{n.nota}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { to: '/estudiante/inscripcion', icon: 'how_to_reg', label: 'Inscribir cursos' },
          { to: '/estudiante/pensum', icon: 'account_tree', label: 'Ver mi pensum' },
          { to: '/estudiante/constancias', icon: 'description', label: 'Generar constancia' },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-xl p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name={a.icon} />
            </div>
            <span className="font-bold text-on-surface">{a.label}</span>
          </Link>
        ))}
      </div>
    </AppLayout>
  )
}
