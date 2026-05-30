import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { homePorRol } from '@/lib/roles'
import { Icon } from '@/components'

/**
 * Pantalla de inicio de sesión (HU-16).
 * Migrada de stitch-export/LoginSistema.html.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, error, session, rol } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Cuando hay sesión y ya se cargó el rol, redirige al portal correspondiente.
  useEffect(() => {
    if (session && rol) {
      navigate(homePorRol(rol), { replace: true })
    }
  }, [session, rol, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    await signIn(username.trim(), password)
    setEnviando(false)
    // La redirección la hace el efecto de arriba al actualizarse la sesión/rol.
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Marca */}
        <div className="mb-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-container rounded-xl flex items-center justify-center mb-6">
            <Icon name="account_balance" className="text-primary text-4xl" />
          </div>
          <h1 className="text-on-background text-2xl font-extrabold tracking-tight text-center font-headline">
            Sistema de Gestión Académica
          </h1>
          <p className="text-on-surface-variant font-body text-sm mt-2">The Academic Atelier</p>
        </div>

        {/* Formulario */}
        <main className="w-full bg-surface-container-lowest rounded-xl p-8 tonal-lift ghost-border">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-2">Bienvenido</h2>
            <p className="text-on-surface-variant text-sm">
              Ingrese sus credenciales para acceder al portal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                htmlFor="username"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline-variant">
                  <Icon name="mail" className="text-lg" />
                </div>
                <input
                  id="username"
                  type="email"
                  autoComplete="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. estudiante@demo.com"
                  className="block w-full pl-10 pr-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline-variant">
                  <Icon name="lock" className="text-lg" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:ring-4 focus:ring-primary-container/30 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-error-container/20 border border-error/10">
                <Icon name="warning" className="text-error" />
                <p className="text-on-error-container text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container"
                />
                <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Recordarme
                </span>
              </label>
              <a
                className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
                href="#"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 px-4 primary-gradient text-on-primary font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span>{enviando ? 'Ingresando…' : 'Iniciar Sesión'}</span>
              {!enviando && (
                <Icon
                  name="arrow_forward"
                  className="text-lg transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-xs text-on-surface-variant/60 font-body">
            © {new Date().getFullYear()} Sistema de Gestión Académica
          </p>
        </footer>
      </div>
    </div>
  )
}
