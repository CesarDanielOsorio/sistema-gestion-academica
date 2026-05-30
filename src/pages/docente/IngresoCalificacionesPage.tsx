import { useEffect, useState } from 'react'
import { AppLayout, Card, Icon, StatusChip } from '@/components'
import { useCalificacionesDocente, type EstudianteNota } from '@/hooks/useCalificaciones'
import { NOTA_APROBACION, calcularNotaFinal } from '@/lib/notas'

/**
 * Ingreso de Calificaciones (HU-05, HU-08) — conectada a Supabase.
 * Escala /100: Zona1 (0-30) + Zona2 (0-30) + Examen final (0-40). Aprueba con >= 61.
 */
type Edicion = Record<string, { zona1: string; zona2: string; examen_final: string }>

function numOrNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export function IngresoCalificacionesPage() {
  const { ciclo, cursos, cursoId, setCursoId, estudiantes, loading, guardar, recargar } =
    useCalificacionesDocente()

  const [edicion, setEdicion] = useState<Edicion>({})
  const [guardando, setGuardando] = useState(false)

  // Inicializa el formulario local cuando cambian los estudiantes cargados.
  useEffect(() => {
    const inicial: Edicion = {}
    for (const e of estudiantes) {
      inicial[e.inscripcionId] = {
        zona1: e.zona1?.toString() ?? '',
        zona2: e.zona2?.toString() ?? '',
        examen_final: e.examen_final?.toString() ?? '',
      }
    }
    setEdicion(inicial)
  }, [estudiantes])

  const setCampo = (id: string, campo: keyof Edicion[string], valor: string) => {
    setEdicion((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }))
  }

  const totalDe = (id: string) => {
    const e = edicion[id]
    if (!e) return 0
    return calcularNotaFinal(numOrNull(e.zona1), numOrNull(e.zona2), numOrNull(e.examen_final))
  }

  const tieneAlgo = (id: string) => {
    const e = edicion[id]
    return e && (e.zona1 !== '' || e.zona2 !== '' || e.examen_final !== '')
  }

  const guardarTodo = async () => {
    setGuardando(true)
    try {
      for (const e of estudiantes) {
        const v = edicion[e.inscripcionId]
        if (!v) continue
        await guardar(e.inscripcionId, {
          zona1: numOrNull(v.zona1),
          zona2: numOrNull(v.zona2),
          examen_final: numOrNull(v.examen_final),
        })
      }
      await recargar()
      alert('Calificaciones guardadas correctamente.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudieron guardar las notas.')
    } finally {
      setGuardando(false)
    }
  }

  const promedio =
    estudiantes.filter((e) => e.nota_final != null).length > 0
      ? (
          estudiantes.reduce((a, e) => a + (e.nota_final ?? 0), 0) /
          estudiantes.filter((e) => e.nota_final != null).length
        ).toFixed(1)
      : '—'

  return (
    <AppLayout rol="docente" activeKey="calificaciones" title="Ingreso de Notas" subtitle="Portal Docente">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
            Ingreso de Calificaciones
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Selecciona un curso y registra las notas de tus estudiantes inscritos.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-outline uppercase">Ciclo</label>
            <div className="bg-surface-container-low rounded-lg px-4 py-2 text-sm text-on-surface min-w-[160px]">
              {ciclo ? ciclo.nombre : 'Sin ciclo activo'}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-outline uppercase">Curso</label>
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="bg-surface-container-lowest ghost-border rounded-lg px-4 py-2 text-sm focus:ring-4 focus:ring-primary-container/30 outline-none transition-all min-w-[260px]"
            >
              <option value="">Selecciona un curso…</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {cursos.length === 0 && (
        <Card className="p-8 text-center text-on-surface-variant mb-8">
          No hay cursos con estudiantes inscritos (aprobados) en el ciclo activo. Cuando el admin
          apruebe inscripciones, aparecerán aquí.
        </Card>
      )}

      {/* Resumen */}
      {cursoId && (
        <div className="grid grid-cols-12 gap-6 mb-8">
          <Card className="col-span-12 md:col-span-8 p-6 flex items-center gap-8">
            <div>
              <p className="text-xs font-bold text-outline uppercase">Total estudiantes</p>
              <p className="text-3xl font-extrabold text-on-surface">{estudiantes.length}</p>
            </div>
            <div className="h-10 w-px bg-outline-variant/20" />
            <div>
              <p className="text-xs font-bold text-outline uppercase">Promedio grupal</p>
              <p className="text-3xl font-extrabold text-on-surface">{promedio}</p>
            </div>
          </Card>
          <div className="col-span-12 md:col-span-4 bg-primary-container/30 rounded-xl p-6 flex items-center gap-3">
            <Icon name="info" className="text-primary text-2xl" />
            <p className="text-xs text-on-primary-container">
              Escala: Zona 1 (0-30) + Zona 2 (0-30) + Examen (0-40). Aprueba con 61.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de ingreso */}
      {cursoId && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr className="text-xs font-bold text-outline uppercase tracking-widest">
                  <th className="px-6 py-4">Carnet</th>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Zona 1 (30)</th>
                  <th className="px-6 py-4">Zona 2 (30)</th>
                  <th className="px-6 py-4">Examen (40)</th>
                  <th className="px-6 py-4">Nota Final</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                      Cargando estudiantes…
                    </td>
                  </tr>
                ) : estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                      No hay estudiantes inscritos en este curso.
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((e: EstudianteNota, i) => {
                    const total = totalDe(e.inscripcionId)
                    const hay = tieneAlgo(e.inscripcionId)
                    const aprobado = total >= NOTA_APROBACION
                    return (
                      <tr key={e.inscripcionId} className={i % 2 === 1 ? 'bg-surface-container-low/20' : ''}>
                        <td className="px-6 py-4 text-sm font-semibold text-on-surface">{e.carnet}</td>
                        <td className="px-6 py-4 text-sm text-on-surface">{e.nombre}</td>
                        {(['zona1', 'zona2', 'examen_final'] as const).map((campo) => (
                          <td key={campo} className="px-6 py-4">
                            <input
                              type="number"
                              min={0}
                              max={campo === 'examen_final' ? 40 : 30}
                              value={edicion[e.inscripcionId]?.[campo] ?? ''}
                              onChange={(ev) => setCampo(e.inscripcionId, campo, ev.target.value)}
                              className="w-20 bg-surface-container-low border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/40 font-semibold outline-none"
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          {hay ? (
                            <span className={`text-sm font-extrabold ${aprobado ? 'text-primary' : 'text-error'}`}>
                              {total}
                            </span>
                          ) : (
                            <span className="text-sm text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hay ? (
                            <StatusChip variant={aprobado ? 'aprobado' : 'reprobado'}>
                              {aprobado ? 'Aprobado' : 'Reprobado'}
                            </StatusChip>
                          ) : (
                            <StatusChip variant="neutral">Pendiente</StatusChip>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {estudiantes.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-end bg-surface-container-low/30">
              <button
                onClick={guardarTodo}
                disabled={guardando}
                className="primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-headline font-bold text-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60"
              >
                <Icon name="save" className="text-sm" />
                {guardando ? 'Guardando…' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </Card>
      )}
    </AppLayout>
  )
}
