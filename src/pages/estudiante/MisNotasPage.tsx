import { useMemo, useState } from 'react'
import { AppLayout, Card, Icon, StatusChip } from '@/components'
import { useMisCalificaciones } from '@/hooks/useCalificaciones'

/**
 * Mis Calificaciones (HU-06) — conectada a Supabase.
 * Escala /100: Zona1 (0-30) + Zona2 (0-30) + Final (0-40). Aprueba con >= 61.
 */
export function MisNotasPage() {
  const { notas, loading } = useMisCalificaciones()
  const [cicloId, setCicloId] = useState<string>('')

  // Ciclos disponibles (únicos)
  const ciclos = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const n of notas) if (n.cicloId) mapa.set(n.cicloId, n.cicloNombre)
    return [...mapa.entries()]
  }, [notas])

  const filtradas = cicloId ? notas.filter((n) => n.cicloId === cicloId) : notas

  const conNota = filtradas.filter((n) => n.tieneNota)
  const aprobados = conNota.filter((n) => n.aprobado).length
  const reprobados = conNota.length - aprobados
  const promedio =
    conNota.length > 0
      ? (conNota.reduce((a, n) => a + (n.nota_final ?? 0), 0) / conNota.length).toFixed(1)
      : '—'

  return (
    <AppLayout rol="estudiante" activeKey="notas" title="Mis Calificaciones" subtitle="Portal del Estudiante">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
            Resumen Académico
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-lg">
            Consulta tu rendimiento por curso y ciclo.
          </p>
        </div>
        {ciclos.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              Ciclo:
            </label>
            <select
              value={cicloId}
              onChange={(e) => setCicloId(e.target.value)}
              className="bg-surface-container-lowest ghost-border rounded-lg px-6 py-2.5 text-sm font-bold text-primary focus:ring-4 focus:ring-primary-container/30 transition-all"
            >
              <option value="">Todos los ciclos</option>
              {ciclos.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card lift className="p-8 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary-container/30 rounded-xl flex items-center justify-center">
            <Icon name="insights" className="text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Promedio</p>
            <h3 className="text-4xl font-headline font-extrabold text-primary mt-1">
              {promedio}
              <span className="text-lg opacity-40 ml-1">/100</span>
            </h3>
          </div>
        </Card>
        <Card lift className="p-8 flex flex-col gap-4">
          <div className="w-12 h-12 bg-tertiary-container/30 rounded-xl flex items-center justify-center">
            <Icon name="verified" className="text-tertiary" />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Cursos Aprobados</p>
            <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-1">{aprobados}</h3>
          </div>
        </Card>
        <Card lift className="p-8 flex flex-col gap-4">
          <div className="w-12 h-12 bg-error-container/20 rounded-xl flex items-center justify-center">
            <Icon name="warning" className="text-error" />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Cursos Reprobados</p>
            <h3 className="text-4xl font-headline font-extrabold text-error mt-1">{reprobados}</h3>
          </div>
        </Card>
      </div>

      {/* Tabla */}
      <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Detalle de Calificaciones</h3>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-6">Curso</th>
                <th className="px-6 py-6">Ciclo</th>
                <th className="px-6 py-6">Zona 1</th>
                <th className="px-6 py-6">Zona 2</th>
                <th className="px-6 py-6">Final</th>
                <th className="px-6 py-6">Total</th>
                <th className="px-8 py-6 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/30">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">
                    Cargando notas…
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant">
                    Aún no tienes cursos con calificaciones.
                  </td>
                </tr>
              ) : (
                filtradas.map((n, i) => (
                  <tr key={`${n.cursoCodigo}-${i}`} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{n.cursoNombre}</span>
                        <span className="text-xs text-on-surface-variant/70 font-mono">{n.cursoCodigo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-on-surface-variant">{n.cicloNombre}</td>
                    <td className="px-6 py-6 font-medium">{n.zona1 ?? '—'}</td>
                    <td className="px-6 py-6 font-medium">{n.zona2 ?? '—'}</td>
                    <td className="px-6 py-6 font-medium">{n.examen_final ?? '—'}</td>
                    <td className="px-6 py-6">
                      {n.tieneNota ? (
                        <span className={`text-lg font-extrabold ${n.aprobado ? 'text-primary' : 'text-error'}`}>
                          {n.nota_final}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {n.tieneNota ? (
                        <StatusChip variant={n.aprobado ? 'aprobado' : 'reprobado'}>
                          {n.aprobado ? 'Aprobado' : 'Reprobado'}
                        </StatusChip>
                      ) : (
                        <StatusChip variant="neutral">Sin nota</StatusChip>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}
