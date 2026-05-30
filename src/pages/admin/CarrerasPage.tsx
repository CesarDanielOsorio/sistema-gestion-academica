import { useState, type FormEvent } from 'react'
import { AppLayout, Card, Icon } from '@/components'
import { useCarreras } from '@/hooks/useCarreras'
import type { Carrera } from '@/types/database'

/**
 * Gestión de Carreras — administración del catálogo de carreras.
 * Al crear/editar carreras, los selectores de Pensum y Registrar Estudiante
 * se actualizan automáticamente (leen de la misma tabla).
 */
export function CarrerasPage() {
  const { carreras, loading, crear, editar, eliminar } = useCarreras()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Carrera | null>(null)
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [duracion, setDuracion] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const abrirNuevo = () => {
    setEditando(null)
    setNombre('')
    setCodigo('')
    setDuracion(10)
    setError(null)
    setModalAbierto(true)
  }

  const abrirEditar = (c: Carrera) => {
    setEditando(c)
    setNombre(c.nombre)
    setCodigo(c.codigo)
    setDuracion(c.duracion_ciclos)
    setError(null)
    setModalAbierto(true)
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      if (editando) {
        await editar(editando.id, { nombre, codigo, duracion_ciclos: duracion })
      } else {
        await crear({ nombre, codigo, duracion_ciclos: duracion })
      }
      setModalAbierto(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la carrera.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (c: Carrera) => {
    if (!confirm(`¿Eliminar la carrera "${c.nombre}"? Se eliminarán también sus cursos.`)) return
    try {
      await eliminar(c.id)
    } catch (err) {
      alert(
        err instanceof Error
          ? `No se pudo eliminar: ${err.message}. (Quizás tiene estudiantes asignados.)`
          : 'No se pudo eliminar la carrera.',
      )
    }
  }

  return (
    <AppLayout rol="admin" activeKey="carreras" title="Carreras" subtitle="Portal Administrativo">
      <section className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Gestión de Carreras
          </h1>
          <p className="text-on-surface-variant max-w-xl">
            Administra las carreras de la institución. Cada carrera tiene su propio pensum de cursos.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="primary-gradient text-on-primary font-bold px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Icon name="add" />
          Nueva carrera
        </button>
      </section>

      {loading ? (
        <p className="text-on-surface-variant">Cargando carreras…</p>
      ) : carreras.length === 0 ? (
        <Card className="p-12 text-center text-on-surface-variant">
          Aún no hay carreras. Crea la primera con “Nueva carrera”.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carreras.map((c) => (
            <Card key={c.id} lift className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <Icon name="account_balance" />
                </div>
                <span className="text-label-sm font-bold text-primary tracking-wider bg-primary-container/30 px-3 py-1 rounded-full">
                  {c.codigo}
                </span>
              </div>
              <h3 className="text-title-lg font-headline font-bold text-on-surface mb-1">{c.nombre}</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">{c.duracion_ciclos} ciclos</p>
              <div className="flex items-center gap-2 border-t border-outline-variant/10 pt-4">
                <button
                  onClick={() => abrirEditar(c)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-body-sm hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  <Icon name="edit" className="text-base" /> Editar
                </button>
                <button
                  onClick={() => handleEliminar(c)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-body-sm hover:bg-error-container/20 text-error transition-colors"
                >
                  <Icon name="delete" className="text-base" /> Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <Card className="w-full max-w-md tonal-lift p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name={editando ? 'edit' : 'account_balance'} filled className="text-primary" />
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {editando ? 'Editar carrera' : 'Nueva carrera'}
              </h2>
            </div>
            <form className="space-y-5" onSubmit={guardar}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  Nombre de la carrera
                </label>
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ingeniería en Sistemas"
                  className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Código
                  </label>
                  <input
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="ISI"
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Duración (ciclos)
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/20 text-on-error-container text-sm">
                  <Icon name="warning" className="text-error text-base" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="font-headline font-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="primary-gradient text-on-primary font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-60"
                >
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
