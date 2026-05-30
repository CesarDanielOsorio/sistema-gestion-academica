import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppLayout, Card, Icon } from '@/components'
import { useCarreras } from '@/hooks/useCarreras'
import { usePensum } from '@/hooks/usePensum'
import type { Curso } from '@/types/database'

/**
 * Gestión de Pensum y Cursos (HU-09, HU-11) — conectada a Supabase.
 */
export function GestionPensumPage() {
  const { carreras } = useCarreras()
  const [carreraId, setCarreraId] = useState('')

  // Selecciona la primera carrera al cargar.
  useEffect(() => {
    if (!carreraId && carreras.length > 0) setCarreraId(carreras[0].id)
  }, [carreras, carreraId])

  const { cursos, loading, crearCurso, editarCurso, eliminarCurso, definirPrerrequisitos, prereqsDe } =
    usePensum(carreraId)

  const [menuId, setMenuId] = useState<string | null>(null)

  // Modal crear/editar curso
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Curso | null>(null)
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [creditos, setCreditos] = useState(4)
  const [cicloPensum, setCicloPensum] = useState(1)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Panel de prerrequisitos
  const [cursoPanel, setCursoPanel] = useState<Curso | null>(null)
  const [prereqSel, setPrereqSel] = useState<string[]>([])

  const codigoDe = (id: string) => cursos.find((c) => c.id === id)?.codigo ?? '—'

  // Agrupa cursos por ciclo del pensum
  const ciclos = useMemo(() => {
    const mapa = new Map<number, Curso[]>()
    for (const c of cursos) {
      const arr = mapa.get(c.ciclo_pensum) ?? []
      arr.push(c)
      mapa.set(c.ciclo_pensum, arr)
    }
    return [...mapa.entries()].sort((a, b) => a[0] - b[0])
  }, [cursos])

  const abrirNuevo = () => {
    setEditando(null)
    setCodigo('')
    setNombre('')
    setCreditos(4)
    setCicloPensum(1)
    setErrorForm(null)
    setModalAbierto(true)
  }

  const abrirEditar = (curso: Curso) => {
    setEditando(curso)
    setCodigo(curso.codigo)
    setNombre(curso.nombre)
    setCreditos(curso.creditos)
    setCicloPensum(curso.ciclo_pensum)
    setErrorForm(null)
    setModalAbierto(true)
    setMenuId(null)
  }

  const guardarCurso = async (e: FormEvent) => {
    e.preventDefault()
    setErrorForm(null)
    setGuardando(true)
    try {
      if (editando) {
        await editarCurso(editando.id, { codigo, nombre, creditos, ciclo_pensum: cicloPensum })
      } else {
        await crearCurso({ codigo, nombre, creditos, ciclo_pensum: cicloPensum, carrera_id: carreraId })
      }
      setModalAbierto(false)
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo guardar el curso.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (curso: Curso) => {
    setMenuId(null)
    if (confirm(`¿Eliminar el curso "${curso.nombre}"?`)) {
      await eliminarCurso(curso.id)
    }
  }

  const abrirPrereqs = (curso: Curso) => {
    setCursoPanel(curso)
    setPrereqSel(prereqsDe(curso.id))
    setMenuId(null)
  }

  const guardarPrereqs = async () => {
    if (!cursoPanel) return
    await definirPrerrequisitos(cursoPanel.id, prereqSel)
    setCursoPanel(null)
  }

  // Cursos candidatos a prerrequisito (de la carrera, excepto el propio y los ya elegidos)
  const candidatos = cursoPanel
    ? cursos.filter((c) => c.id !== cursoPanel.id && !prereqSel.includes(c.id))
    : []

  return (
    <AppLayout rol="admin" activeKey="pensum" title="Pensum y Cursos" subtitle="Portal Administrativo">
      <section className="mb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Gestión de Pensum
          </h1>
          <p className="text-on-surface-variant max-w-xl">
            Administra el plan de estudios por carrera, los cursos y sus prerrequisitos.
          </p>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-bold text-on-surface-variant ml-1">Carrera</label>
            <select
              value={carreraId}
              onChange={(e) => setCarreraId(e.target.value)}
              className="bg-surface-container-lowest ghost-border rounded-xl py-2.5 px-4 text-body-md font-medium text-on-surface min-w-[240px] focus:ring-1 focus:ring-primary"
            >
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={abrirNuevo}
            disabled={!carreraId}
            className="primary-gradient text-on-primary h-[46px] px-6 rounded-xl flex items-center gap-2 font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Icon name="add_circle" className="text-lg" />
            Nuevo curso
          </button>
        </div>
      </section>

      {loading ? (
        <p className="text-on-surface-variant">Cargando pensum…</p>
      ) : ciclos.length === 0 ? (
        <Card className="p-12 text-center text-on-surface-variant">
          Esta carrera aún no tiene cursos. Usa “Nuevo curso” para agregar el primero.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 items-start">
          {ciclos.map(([ciclo, lista]) => (
            <div key={ciclo} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-headline-sm font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-md">
                    {ciclo}
                  </span>
                  Ciclo {ciclo}
                </h3>
                <span className="text-label-md text-outline">
                  {lista.length} curso(s) • {lista.reduce((a, c) => a + c.creditos, 0)} créditos
                </span>
              </div>
              <div className="bg-surface-container-low rounded-3xl p-6 space-y-4">
                {lista.map((curso) => {
                  const prereqs = prereqsDe(curso.id)
                  return (
                    <Card key={curso.id} lift className="p-5 overflow-visible relative">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-label-sm font-bold text-primary tracking-wider">
                          {curso.codigo}
                        </span>
                        <button
                          onClick={() => setMenuId(menuId === curso.id ? null : curso.id)}
                          className="p-1 text-outline-variant hover:text-on-surface transition-colors"
                          aria-label="Opciones del curso"
                        >
                          <Icon name="more_vert" />
                        </button>
                        {menuId === curso.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                            <div className="absolute right-2 top-10 z-20 w-52 bg-surface-container-lowest rounded-xl ghost-border tonal-lift p-2">
                              <button
                                onClick={() => abrirEditar(curso)}
                                className="w-full text-left px-3 py-2 rounded-lg text-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-2"
                              >
                                <Icon name="edit" className="text-base" /> Editar curso
                              </button>
                              <button
                                onClick={() => abrirPrereqs(curso)}
                                className="w-full text-left px-3 py-2 rounded-lg text-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-2"
                              >
                                <Icon name="account_tree" className="text-base" /> Prerrequisitos
                              </button>
                              <button
                                onClick={() => handleEliminar(curso)}
                                className="w-full text-left px-3 py-2 rounded-lg text-body-sm hover:bg-error-container/20 text-error transition-colors flex items-center gap-2"
                              >
                                <Icon name="delete" className="text-base" /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      <h4 className="text-title-lg font-headline font-bold text-on-surface mb-1">
                        {curso.nombre}
                      </h4>
                      <p className="text-body-sm text-on-surface-variant mb-4">{curso.creditos} créditos</p>
                      <div className="flex flex-wrap gap-2">
                        {prereqs.length === 0 ? (
                          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm">
                            Sin prerrequisitos
                          </span>
                        ) : (
                          prereqs.map((pid) => (
                            <span
                              key={pid}
                              className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm"
                            >
                              {codigoDe(pid)}
                            </span>
                          ))
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar curso */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <Card className="w-full max-w-md tonal-lift p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name={editando ? 'edit' : 'add_circle'} filled className="text-primary" />
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {editando ? 'Editar curso' : 'Nuevo curso'}
              </h2>
            </div>
            <form className="space-y-5" onSubmit={guardarCurso}>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Código
                  </label>
                  <input
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="MAT101"
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-3 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Nombre
                  </label>
                  <input
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Cálculo Diferencial"
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-3 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Créditos
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={creditos}
                    onChange={(e) => setCreditos(Number(e.target.value))}
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-3 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Ciclo del pensum
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={cicloPensum}
                    onChange={(e) => setCicloPensum(Number(e.target.value))}
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-3 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {errorForm && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/20 text-on-error-container text-sm">
                  <Icon name="warning" className="text-error text-base" />
                  {errorForm}
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

      {/* Panel lateral: definir prerrequisitos */}
      {cursoPanel && (
        <>
          <div className="fixed inset-0 bg-on-background/30 z-40" onClick={() => setCursoPanel(null)} />
          <aside className="fixed right-0 top-0 h-full w-[400px] bg-surface-container-lowest tonal-lift z-50 p-8 border-l border-outline-variant/10 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <p className="text-label-md font-bold text-primary uppercase tracking-widest">
                  Configuración
                </p>
                <h3 className="text-headline-sm font-headline font-extrabold text-on-surface leading-tight">
                  Definir prerrequisitos
                </h3>
              </div>
              <button
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
                onClick={() => setCursoPanel(null)}
                aria-label="Cerrar"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-label-sm font-bold text-on-surface-variant mb-3">CURSO SELECCIONADO</p>
              <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  <Icon name="menu_book" />
                </div>
                <div>
                  <h4 className="text-body-md font-bold text-on-surface">{cursoPanel.nombre}</h4>
                  <span className="text-label-md text-on-surface-variant">
                    {cursoPanel.codigo} • {cursoPanel.creditos} créditos
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-label-sm font-bold text-on-surface-variant">AGREGAR PRERREQUISITO</label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setPrereqSel([...prereqSel, e.target.value])
                }}
                className="w-full bg-surface-container-lowest ghost-border rounded-xl py-3 px-4 text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="">Selecciona un curso…</option>
                {candidatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} — {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-label-sm font-bold text-on-surface-variant">
                CURSOS ASIGNADOS ({prereqSel.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {prereqSel.length === 0 && (
                  <span className="text-body-sm text-on-surface-variant italic">Ninguno todavía.</span>
                )}
                {prereqSel.map((pid) => (
                  <div
                    key={pid}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 bg-secondary-container text-on-secondary-container rounded-full text-label-md font-medium"
                  >
                    <span>
                      {codigoDe(pid)} {cursos.find((c) => c.id === pid)?.nombre}
                    </span>
                    <button
                      onClick={() => setPrereqSel(prereqSel.filter((x) => x !== pid))}
                      className="hover:text-error transition-colors"
                      aria-label="Quitar"
                    >
                      <Icon name="close" className="text-[16px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={guardarPrereqs}
                className="w-full primary-gradient text-on-primary py-4 rounded-xl font-bold transition-all active:scale-[0.99]"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setCursoPanel(null)}
                className="w-full py-4 text-on-surface-variant font-medium hover:text-on-surface transition-colors"
              >
                Cancelar
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  )
}
