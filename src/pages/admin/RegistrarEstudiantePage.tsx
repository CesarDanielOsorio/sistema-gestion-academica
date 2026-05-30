import { useState, type FormEvent } from 'react'
import { AppLayout, Card, Icon } from '@/components'
import { useUsuarios } from '@/hooks/useUsuarios'
import { useCarreras } from '@/hooks/useCarreras'

/**
 * Registrar Estudiante (HU-17) — conectada a Supabase.
 */
const ANIO_ACTUAL = new Date().getFullYear()

export function RegistrarEstudiantePage() {
  const { registrarEstudiante } = useUsuarios()
  const { carreras } = useCarreras()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [carnet, setCarnet] = useState('')
  const [carreraId, setCarreraId] = useState('')
  const [cicloIngreso, setCicloIngreso] = useState(ANIO_ACTUAL)

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<{ email: string; password: string } | null>(null)

  const limpiar = () => {
    setNombre('')
    setEmail('')
    setCarnet('')
    setCarreraId('')
    setCicloIngreso(ANIO_ACTUAL)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!carreraId) {
      setError('Selecciona una carrera.')
      return
    }
    setGuardando(true)
    try {
      const password = await registrarEstudiante(
        { nombre, email },
        { carnet, carrera_id: carreraId, ciclo_ingreso: cicloIngreso },
      )
      setExito({ email, password })
      limpiar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el estudiante.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AppLayout rol="admin" activeKey="estudiantes" title="Registrar Estudiante" subtitle="Portal Administrativo">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            Registrar Nuevo Estudiante
          </h1>
          <p className="text-lg text-on-surface-variant font-light">
            Crea la cuenta académica del estudiante para el ciclo vigente.
          </p>
        </div>

        {/* Mensaje de éxito con credenciales generadas */}
        {exito && (
          <Card lift className="p-6 mb-8 border-l-4 border-primary">
            <div className="flex items-start gap-4">
              <Icon name="check_circle" filled className="text-primary text-2xl" />
              <div className="flex-1">
                <h3 className="font-headline font-bold text-on-surface mb-1">
                  Estudiante registrado correctamente
                </h3>
                <p className="text-sm text-on-surface-variant mb-3">
                  Entrega estas credenciales temporales al estudiante (debería cambiarla luego):
                </p>
                <div className="bg-surface-container-low rounded-lg p-4 text-sm font-mono space-y-1">
                  <div>
                    <span className="text-on-surface-variant">Email: </span>
                    <span className="font-bold text-on-surface">{exito.email}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Contraseña: </span>
                    <span className="font-bold text-on-surface">{exito.password}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExito(null)}
                className="text-outline hover:text-on-surface transition-colors"
                aria-label="Cerrar"
              >
                <Icon name="close" />
              </button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Formulario */}
          <div className="xl:col-span-2">
            <Card lift className="p-10">
              <form className="space-y-12" onSubmit={handleSubmit}>
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <Icon name="person_add" filled className="text-primary" />
                    <h3 className="font-headline text-xl font-bold">Datos personales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                        Nombre completo
                      </label>
                      <input
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Juan Pérez García"
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl ghost-border text-on-surface focus:ring-4 focus:ring-primary-container/30 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan.perez@demo.com"
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl ghost-border text-on-surface focus:ring-4 focus:ring-primary-container/30 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                        Carnet
                      </label>
                      <input
                        required
                        value={carnet}
                        onChange={(e) => setCarnet(e.target.value)}
                        placeholder="ISW2026010"
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl ghost-border text-on-surface focus:ring-4 focus:ring-primary-container/30 focus:border-primary outline-none transition-all"
                      />
                      <p className="mt-2 text-[11px] text-on-surface-variant/70 italic flex items-center gap-1">
                        <Icon name="info" className="text-[14px]" />
                        El número de carnet debe ser único
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <Icon name="history_edu" filled className="text-primary" />
                    <h3 className="font-headline text-xl font-bold">Datos académicos</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                        Carrera
                      </label>
                      <select
                        required
                        value={carreraId}
                        onChange={(e) => setCarreraId(e.target.value)}
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl ghost-border text-on-surface outline-none focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all"
                      >
                        <option value="">Selecciona carrera</option>
                        {carreras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                        Ciclo de ingreso
                      </label>
                      <input
                        type="number"
                        value={cicloIngreso}
                        onChange={(e) => setCicloIngreso(Number(e.target.value))}
                        className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl ghost-border text-on-surface outline-none focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/20 text-on-error-container text-sm">
                    <Icon name="warning" className="text-error text-base" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-6">
                  <button
                    type="button"
                    onClick={limpiar}
                    className="font-headline font-bold text-on-surface-variant hover:text-primary transition-colors text-sm px-4"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="primary-gradient text-on-primary font-headline font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {guardando ? 'Registrando…' : 'Registrar estudiante'}
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Info lateral */}
          <div className="xl:col-span-1">
            <div className="bg-primary-container/30 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm">
                <Icon name="auto_awesome" filled />
              </div>
              <h4 className="font-headline font-bold text-on-primary-container text-lg mb-4 leading-snug">
                Generación Automática
              </h4>
              <p className="text-on-primary-container/80 text-sm leading-relaxed mb-6">
                Al registrar, el sistema crea la cuenta del estudiante y genera una contraseña
                temporal que se mostrará en pantalla para entregársela.
              </p>
              <ul className="space-y-4">
                {['Cuenta de acceso creada', 'Contraseña temporal generada', 'Perfil de estudiante vinculado a su carrera'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Icon name="check_circle" className="text-primary text-[20px]" />
                      <span className="text-xs font-medium text-on-primary-container/70">{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
