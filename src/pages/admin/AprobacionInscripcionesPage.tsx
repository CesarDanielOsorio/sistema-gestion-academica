import { useMemo, useState } from 'react'
import { AppLayout, Card, Icon, StatusChip } from '@/components'
import { useGestionInscripciones, type SolicitudInscripcion } from '@/hooks/useInscripciones'

/**
 * Aprobación de Inscripciones (HU-03) — conectada a Supabase.
 */
const tabs = ['Pendientes', 'Aprobadas', 'Rechazadas'] as const

export function AprobacionInscripcionesPage() {
  const { solicitudes, loading, aprobar, rechazar } = useGestionInscripciones()
  const [tabActiva, setTabActiva] = useState<(typeof tabs)[number]>('Pendientes')
  const [rechazando, setRechazando] = useState<SolicitudInscripcion | null>(null)
  const [motivo, setMotivo] = useState('')
  const [accionId, setAccionId] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    if (tabActiva === 'Pendientes') return solicitudes.filter((s) => s.estado === 'pendiente')
    if (tabActiva === 'Aprobadas') return solicitudes.filter((s) => s.estado === 'aprobada')
    return solicitudes.filter((s) => s.estado === 'cancelada' && s.motivo_rechazo) // rechazadas
  }, [solicitudes, tabActiva])

  const pendientesCount = solicitudes.filter((s) => s.estado === 'pendiente').length

  const handleAprobar = async (id: string) => {
    setAccionId(id)
    try {
      await aprobar(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo aprobar la solicitud.')
    } finally {
      setAccionId(null)
    }
  }

  const confirmarRechazo = async () => {
    if (!rechazando) return
    setAccionId(rechazando.id)
    try {
      await rechazar(rechazando.id, motivo.trim() || 'Sin especificar')
      setRechazando(null)
      setMotivo('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo rechazar la solicitud.')
    } finally {
      setAccionId(null)
    }
  }

  return (
    <AppLayout rol="admin" activeKey="inscripciones" title="Inscripciones" subtitle="Portal Administrativo">
      <section className="mb-6">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
          Solicitudes de Inscripción
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          Revisa y resuelve las solicitudes de los estudiantes.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-8 items-center border-b border-outline-variant/10 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTabActiva(t)}
            className={
              t === tabActiva
                ? 'pb-4 text-primary font-bold border-b-2 border-primary transition-all flex items-center gap-2'
                : 'pb-4 text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2'
            }
          >
            {t}
            {t === 'Pendientes' && pendientesCount > 0 && (
              <span className="bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full">
                {pendientesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-on-surface-variant">Cargando solicitudes…</p>
      ) : filtradas.length === 0 ? (
        <Card className="p-12 text-center text-on-surface-variant">
          No hay solicitudes {tabActiva.toLowerCase()}.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 px-6 py-2 text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.1em]">
            <div className="col-span-3">Estudiante</div>
            <div className="col-span-3">Curso</div>
            <div className="col-span-2">Ciclo</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2 text-right">Estado / Acciones</div>
          </div>
          {filtradas.map((s) => (
            <Card key={s.id} lift className="grid grid-cols-12 items-center p-6 group">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline font-bold text-sm">
                  {s.estudianteNombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">{s.estudianteNombre}</p>
                  <p className="text-xs text-on-surface-variant">{s.carnet}</p>
                </div>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-on-surface">{s.cursoNombre}</p>
                <p className="text-xs text-on-surface-variant">{s.cursoCodigo}</p>
              </div>
              <div className="col-span-2 text-sm text-on-surface">{s.cicloNombre}</div>
              <div className="col-span-2 text-sm text-on-surface">
                {new Date(s.fecha_inscripcion).toLocaleDateString()}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                {s.estado === 'pendiente' ? (
                  <>
                    <button
                      disabled={accionId === s.id}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors disabled:opacity-50"
                      title="Aprobar"
                      onClick={() => handleAprobar(s.id)}
                    >
                      <Icon name="check_circle" />
                    </button>
                    <button
                      disabled={accionId === s.id}
                      className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors disabled:opacity-50"
                      title="Rechazar"
                      onClick={() => {
                        setRechazando(s)
                        setMotivo('')
                      }}
                    >
                      <Icon name="cancel" />
                    </button>
                  </>
                ) : s.estado === 'aprobada' ? (
                  <StatusChip variant="aprobada">Aprobada</StatusChip>
                ) : (
                  <StatusChip variant="rechazada">Rechazada</StatusChip>
                )}
              </div>
              {tabActiva === 'Rechazadas' && s.motivo_rechazo && (
                <div className="col-span-12 mt-3 text-xs text-on-surface-variant italic border-t border-outline-variant/10 pt-3">
                  Motivo: {s.motivo_rechazo}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal rechazar */}
      {rechazando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <Card className="w-full max-w-md tonal-lift p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="warning" filled className="text-error" />
              <h2 className="text-xl font-headline font-bold text-on-surface">Rechazar solicitud</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Indica el motivo del rechazo de la inscripción de{' '}
              <strong>{rechazando.estudianteNombre}</strong> en{' '}
              <strong>{rechazando.cursoNombre}</strong>. Será visible para el estudiante.
            </p>
            <div className="mb-8">
              <label className="block font-headline font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                Motivo del rechazo
              </label>
              <textarea
                rows={4}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. No cumple con los prerrequisitos necesarios..."
                className="w-full bg-background ghost-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <button
                className="px-5 py-2.5 font-headline font-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setRechazando(null)}
              >
                Cancelar
              </button>
              <button
                disabled={accionId === rechazando.id}
                className="bg-error-container text-on-error-container px-6 py-2.5 rounded-xl font-headline font-bold text-sm active:scale-95 transition-all disabled:opacity-60"
                onClick={confirmarRechazo}
              >
                {accionId === rechazando.id ? 'Rechazando…' : 'Confirmar rechazo'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
