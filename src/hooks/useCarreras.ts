import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Carrera } from '@/types/database'

/**
 * Hook de carreras: lectura (para selectores) + administración (HU admin).
 * Los selectores solo usan `carreras`; la pantalla de gestión usa el CRUD.
 */
export function useCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('carreras').select('*').order('nombre')
    setCarreras((data as Carrera[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = async (datos: Omit<Carrera, 'id'>) => {
    const { error } = await supabase.from('carreras').insert(datos)
    if (error) throw error
    await cargar()
  }

  const editar = async (id: string, datos: Partial<Carrera>) => {
    const { error } = await supabase.from('carreras').update(datos).eq('id', id)
    if (error) throw error
    await cargar()
  }

  const eliminar = async (id: string) => {
    const { error } = await supabase.from('carreras').delete().eq('id', id)
    if (error) throw error
    await cargar()
  }

  return { carreras, loading, cargar, crear, editar, eliminar }
}
