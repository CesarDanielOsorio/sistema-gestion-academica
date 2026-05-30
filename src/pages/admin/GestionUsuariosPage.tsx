import { useMemo, useState, type FormEvent } from 'react'
import { AppLayout, Card, Icon, StatusChip } from '@/components'
import { useUsuarios } from '@/hooks/useUsuarios'
import type { Rol } from '@/types/database'

/**
 * Gestión de Usuarios (HU-15) — conectada a Supabase.
 */
const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
  docente: 'Docente',
  estudiante: 'Estudiante',
}

const ROLES: Rol[] = ['admin', 'docente', 'estudiante']

export function GestionUsuariosPage() {
  const {
    usuarios,
    loading,
    crearUsuario,
    cambiarRol,
    activarUsuario,
    desactivarUsuario,
  } = useUsuarios()

  // Filtros
  const [filtroRol, setFiltroRol] = useState<'Todos' | Rol>('Todos')
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos')
  const [busqueda, setBusqueda] = useState('')

  // Menú por fila
  const [menuId, setMenuId] = useState<string | null>(null)

  // Modal "Nuevo usuario"
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState<Rol>('estudiante')
  const [password, setPassword] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRol !== 'Todos' && u.rol !== filtroRol) return false
      if (filtroEstado === 'Activo' && !u.activo) return false
      if (filtroEstado === 'Inactivo' && u.activo) return false
      const q = busqueda.trim().toLowerCase()
      if (q && !u.nombre.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      return true
    })
  }, [usuarios, filtroRol, filtroEstado, busqueda])

  const abrirModal = () => {
    setNombre('')
    setEmail('')
    setRol('estudiante')
    setPassword('')
    setErrorForm(null)
    setModalAbierto(true)
  }

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault()
    setErrorForm(null)
    if (password.length < 6) {
      setErrorForm('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setGuardando(true)
    try {
      await crearUsuario({ nombre, email, rol, password })
      setModalAbierto(false)
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AppLayout rol="admin" activeKey="usuarios" title="Gestión de Usuarios" subtitle="Administra cuentas y roles del sistema">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Filtros + acción */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-bold text-on-surface-variant ml-1">Buscar</label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o email..."
                className="bg-surface-container-lowest ghost-border rounded-xl px-4 py-2.5 text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 min-w-[220px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-bold text-on-surface-variant ml-1">Rol</label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as 'Todos' | Rol)}
                className="bg-surface-container-lowest ghost-border rounded-xl px-4 py-2.5 text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
              >
                <option value="Todos">Todos</option>
                <option value="admin">Administrador</option>
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-bold text-on-surface-variant ml-1">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as 'Todos' | 'Activo' | 'Inactivo')}
                className="bg-surface-container-lowest ghost-border rounded-xl px-4 py-2.5 text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
              >
                <option>Todos</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>
          </div>
          <button
            onClick={abrirModal}
            className="primary-gradient text-on-primary font-bold px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon name="add" />
            Nuevo usuario
          </button>
        </section>

        {/* Tabla */}
        <Card className="overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-outline text-label-sm font-bold uppercase tracking-wider">
                  <th className="px-8 py-5">Nombre</th>
                  <th className="px-8 py-5">Email</th>
                  <th className="px-8 py-5">Rol</th>
                  <th className="px-8 py-5">Estado</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                      Cargando usuarios…
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                      No hay usuarios que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-headline">
                            {u.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span className="text-body-md font-semibold text-on-surface">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-body-md text-on-surface-variant">{u.email}</td>
                      <td className="px-8 py-6">
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-medium">
                          {ROL_LABEL[u.rol]}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusChip variant={u.activo ? 'activo' : 'inactivo'}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </StatusChip>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <button
                          onClick={() => setMenuId(menuId === u.id ? null : u.id)}
                          className="text-outline hover:text-on-surface transition-colors"
                          aria-label="Acciones"
                        >
                          <Icon name="more_vert" />
                        </button>
                        {menuId === u.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                            <div className="absolute right-8 top-14 z-20 w-56 bg-surface-container-lowest rounded-xl ghost-border tonal-lift p-3 text-left">
                              <p className="text-label-sm font-bold text-on-surface-variant px-2 mb-2">
                                Cambiar rol
                              </p>
                              <div className="flex flex-col">
                                {ROLES.map((r) => (
                                  <button
                                    key={r}
                                    onClick={async () => {
                                      await cambiarRol(u.id, r)
                                      setMenuId(null)
                                    }}
                                    className={`text-left px-2 py-1.5 rounded-lg text-body-sm hover:bg-surface-container-high transition-colors ${
                                      u.rol === r ? 'text-primary font-bold' : 'text-on-surface'
                                    }`}
                                  >
                                    {ROL_LABEL[r]}
                                  </button>
                                ))}
                              </div>
                              <div className="border-t border-outline-variant/10 my-2" />
                              <button
                                onClick={async () => {
                                  if (u.activo) await desactivarUsuario(u.id)
                                  else await activarUsuario(u.id)
                                  setMenuId(null)
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-body-sm hover:bg-surface-container-high transition-colors text-on-surface"
                              >
                                {u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4">
            <span className="text-label-sm text-on-surface-variant">
              {usuariosFiltrados.length} usuario(s)
            </span>
          </div>
        </Card>
      </div>

      {/* Modal Nuevo usuario */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <Card className="w-full max-w-md tonal-lift p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="person_add" filled className="text-primary" />
              <h2 className="text-xl font-headline font-bold text-on-surface">Nuevo usuario</h2>
            </div>
            <form className="space-y-5" onSubmit={handleCrear}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  Nombre completo
                </label>
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Rol
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as Rol)}
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Contraseña
                  </label>
                  <input
                    required
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mín. 6 caracteres"
                    className="w-full bg-surface-container-low ghost-border rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
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
                  {guardando ? 'Creando…' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
