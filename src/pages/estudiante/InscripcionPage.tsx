import { useState } from 'react'
import { AppLayout, Card, Icon, StatusChip } from '@/components'
import { useOfertaInscripcion } from '@/hooks/useInscripciones'

/**
 * Inscripción de Cursos (HU-01, HU-02, HU-04) — conectada a Supabase.
 */
export function InscripcionPage() {
  const { ciclo, oferta, loading, error, inscribir, cancelar } = useOfertaInscripcion()
  const [accionId, setAccionId] = useState<string | null>(null)

  const creditosInscritos = oferta
    .filter((o) => o.inscripcion && o.inscripcion.estado !== 'cancelada')
    .reduce((a, o) => a + o.curso.creditos, 0)

  const ejecutar = async (id: string, fn: () => Promise<void>) => {
    setAccionId(id)
    try {
      await fn()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? 'Ocurrió un error.'
      alert(msg)
    } finally {
      setAccionId(null)
    }
  }

  return (
    <AppLayout rol="estudiante" activeKey="inscripcion" title="Inscripción" subtitle="Portal del Estudiante">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
          Inscripción de Cursos
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          Selecciona los cursos disponibles para inscribirte. Las solicitudes quedan pendientes de
          aprobación del administrador.
        </p>
      </header>

      {/* Estado del ciclo */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-primary-container p-6 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-on-primary-container text-lg">
              {ciclo ? `Ciclo ${ciclo.nombre}` : 'Sin ciclo activo'}
            </h3>
            <p className="text-on-primary-container/80 text-sm">
              {ciclo ? 'Periodo de inscripción abierto.' : 'No hay un ciclo académico activo en este momento.'}
            </p>
          </div>
          <Icon name="event_available" className="text-on-primary-container text-4xl" />
        </div>
        <Card className="p-6 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-outline font-bold">Créditos inscritos</p>
          <p className="text-3xl font-black text-primary">{creditosInscritos}</p>
        </Card>
      </section>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-error-container/20 text-on-error-container text-sm">
          <Icon name="warning" className="text-error" />
          {error}
        </div>
      )}

      {/* Tabla de cursos */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-outline text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nombre del Curso</th>
                <th className="px-6 py-4 text-center">Créditos</th>
                <th className="px-6 py-4">Prerrequisitos</th>
                <th className="px-6 py-4 text-right">Estado / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Cargando oferta…
                  </td>
                </tr>
              ) : oferta.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    No hay cursos disponibles para tu carrera.
                  </td>
                </tr>
              ) : (
                oferta.map(({ curso, prereqsCumplidos, prereqFaltantes, inscripcion }) => {
                  const procesando = accionId === curso.id || accionId === inscripcion?.id
                  return (
                    <tr key={curso.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="px-6 py-5 font-mono text-sm text-primary font-bold">{curso.codigo}</td>
                      <td className="px-6 py-5 font-headline font-bold text-on-surface">{curso.nombre}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-xs font-bold">
                          {curso.creditos}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {prereqsCumplidos ? (
                          <span className="flex items-center gap-2 text-xs font-semibold text-on-primary-container bg-primary-container/40 px-2 py-1 rounded-full w-fit">
                            <Icon name="check_circle" className="text-[14px]" />
                            Cumplidos
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-xs font-semibold text-error bg-error-container/20 px-2 py-1 rounded-full w-fit">
                            <Icon name="lock" className="text-[14px]" />
                            Falta: {prereqFaltantes.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {inscripcion ? (
                          <div className="flex items-center justify-end gap-3">
                            <StatusChip variant={inscripcion.estado === 'aprobada' ? 'aprobada' : 'pendiente'}>
                              {inscripcion.estado === 'aprobada' ? 'Aprobada' : 'Pendiente'}
                            </StatusChip>
                            <button
                              disabled={procesando}
                              onClick={() => ejecutar(inscripcion.id, () => cancelar(inscripcion.id))}
                              className="text-xs font-bold text-error hover:underline disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : prereqsCumplidos ? (
                          <button
                            disabled={procesando || !ciclo}
                            onClick={() => ejecutar(curso.id, () => inscribir(curso.id))}
                            className="bg-primary hover:bg-primary-dim text-on-primary px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                          >
                            {procesando ? 'Inscribiendo…' : 'Inscribir'}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-outline-variant text-on-surface/40 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed"
                          >
                            Bloqueado
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}
