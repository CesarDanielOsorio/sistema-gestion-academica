import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Rol, Usuario } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  usuario: Usuario | null
  rol: Rol | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carga el perfil (con el rol) desde la tabla `usuarios`.
  const cargarPerfil = async (userId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()
    setUsuario((data as Usuario) ?? null)
  }

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        cargarPerfil(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Cambios de sesión (login / logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        cargarPerfil(newSession.user.id)
      } else {
        setUsuario(null)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      const msg = signInError.message?.toLowerCase() ?? ''
      if (msg.includes('not confirmed')) {
        setError('Tu cuenta aún no está confirmada. Desactiva "Confirm email" en Supabase.')
      } else if (msg.includes('invalid login')) {
        setError('Correo o contraseña incorrectos.')
      } else {
        setError(signInError.message)
      }
      return false
    }
    return true
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  const value: AuthContextValue = {
    session,
    usuario,
    rol: usuario?.rol ?? null,
    loading,
    error,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
