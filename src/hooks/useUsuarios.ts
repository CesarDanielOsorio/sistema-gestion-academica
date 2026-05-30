import { useCallback, useEffect, useState } from 'react'
import { supabase, crearClienteRegistro } from '@/lib/supabase'
import type { Estudiante, Rol, Usuario } from '@/types/database'

interface NuevoUsuario {
  nombre: string
  email: string
  rol: Rol
  password: string
}

/** Genera una contraseña temporal razonable para cuentas creadas por el admin. */
function passwordTemporal(): string {
  return 'Tmp-' + crypto.randomUUID().slice(0, 8) + '!'
}

/**
 * Hook de administración de usuarios (Épica 5 — HU-15, HU-17).
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setUsuarios((data as Usuario[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  // HU-15: crear un usuario con rol (el trigger crea su perfil en `usuarios`).
  const crearUsuario = async ({ nombre, email, rol, password }: NuevoUsuario) => {
    const cliente = crearClienteRegistro()
    const { error: err } = await cliente.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    })
    if (err) throw err
    await cargar()
  }

  const editarUsuario = async (id: string, datos: Partial<Usuario>) => {
    const { error: err } = await supabase.from('usuarios').update(datos).eq('id', id)
    if (err) throw err
    await cargar()
  }

  const desactivarUsuario = (id: string) => editarUsuario(id, { activo: false })
  const activarUsuario = (id: string) => editarUsuario(id, { activo: true })
  const cambiarRol = (id: string, rol: Rol) => editarUsuario(id, { rol })

  // HU-17: registrar estudiante (usuario rol 'estudiante' + fila en `estudiantes`).
  // Devuelve la contraseña temporal generada para entregarla al estudiante.
  const registrarEstudiante = async (
    usuario: Pick<Usuario, 'nombre' | 'email'>,
    datos: Pick<Estudiante, 'carnet' | 'carrera_id' | 'ciclo_ingreso'>,
  ): Promise<string> => {
    const password = passwordTemporal()
    const cliente = crearClienteRegistro()
    const { data, error: err } = await cliente.auth.signUp({
      email: usuario.email,
      password,
      options: { data: { nombre: usuario.nombre, rol: 'estudiante' } },
    })
    if (err) throw err
    const nuevoId = data.user?.id
    if (!nuevoId) throw new Error('No se pudo crear la cuenta del estudiante.')

    const { error: errEst } = await supabase.from('estudiantes').insert({
      usuario_id: nuevoId,
      carnet: datos.carnet,
      carrera_id: datos.carrera_id,
      ciclo_ingreso: datos.ciclo_ingreso,
    })
    if (errEst) throw errEst

    await cargar()
    return password
  }

  return {
    usuarios,
    loading,
    error,
    cargar,
    crearUsuario,
    editarUsuario,
    desactivarUsuario,
    activarUsuario,
    cambiarRol,
    registrarEstudiante,
  }
}
