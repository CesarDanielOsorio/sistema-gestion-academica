import { createClient } from '@supabase/supabase-js'

/**
 * Cliente único de Supabase para toda la app.
 * Las credenciales se leen de variables de entorno (ver .env.example).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso temprano durante el desarrollo si falta la configuración.
  console.warn(
    '[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env y rellena tus credenciales.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

/**
 * Cliente transitorio para registrar usuarios SIN tocar la sesión actual.
 * Se usa cuando un admin crea cuentas (signUp) y no debe perder su propia sesión.
 */
export function crearClienteRegistro() {
  return createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
