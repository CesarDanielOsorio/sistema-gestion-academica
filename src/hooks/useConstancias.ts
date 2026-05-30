import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { unaRelacion } from '@/lib/relaciones'
import { useAuth } from '@/context/AuthContext'
import {
  pdfConstanciaInscripcion,
  pdfConstanciaNotas,
  type CursoInscritoPDF,
  type CursoNotaPDF,
  type DatosConstancia,
} from '@/lib/pdf'
import type { TipoConstancia } from '@/types/database'

export interface CicloOpcion {
  id: string
  nombre: string
  activo: boolean
}

export interface ConstanciaHistorial {
  id: string
  tipo: TipoConstancia
  fecha_generacion: string
  cicloId: string
  cicloNombre: string
}

/**
 * Generación de constancias (Épica 4 — HU-12, HU-13).
 * El PDF se genera en el navegador (jsPDF) y se registra en la tabla `constancias`.
 */
export function useConstancias() {
  const { usuario } = useAuth()
  const [historial, setHistorial] = useState<ConstanciaHistorial[]>([])
  const [ciclos, setCiclos] = useState<CicloOpcion[]>([])
  const [loading, setLoading] = useState(false)
  const [generando, setGenerando] = useState(false)

  const cargar = useCallback(async () => {
    if (!usuario) return
    setLoading(true)

    const { data: ciclosData } = await supabase
      .from('ciclos_academicos')
      .select('id, nombre, activo')
      .order('fecha_inicio', { ascending: false })
    setCiclos((ciclosData as CicloOpcion[]) ?? [])

    const { data: est } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', usuario.id)
      .single()
    if (est) {
      const { data } = await supabase
        .from('constancias')
        .select('id, tipo, fecha_generacion, ciclo_id, ciclos_academicos(nombre)')
        .eq('estudiante_id', est.id)
        .order('fecha_generacion', { ascending: false })
      setHistorial(
        ((data ?? []) as Record<string, unknown>[]).map((row) => ({
          id: row.id as string,
          tipo: row.tipo as TipoConstancia,
          fecha_generacion: row.fecha_generacion as string,
          cicloId: row.ciclo_id as string,
          cicloNombre: unaRelacion<{ nombre?: string }>(row.ciclos_academicos)?.nombre ?? '—',
        })),
      )
    }
    setLoading(false)
  }, [usuario])

  useEffect(() => {
    cargar()
  }, [cargar])

  /** Reúne los datos del estudiante y los cursos/notas del ciclo para el PDF. */
  const construirDatos = async (tipo: TipoConstancia, cicloId: string) => {
    const { data: est } = await supabase
      .from('estudiantes')
      .select('id, carnet, carreras(nombre)')
      .eq('usuario_id', usuario!.id)
      .single()
    if (!est) throw new Error('No se encontró tu perfil de estudiante.')

    const cicloNombre = ciclos.find((c) => c.id === cicloId)?.nombre ?? '—'
    const base: DatosConstancia = {
      estudianteNombre: usuario?.nombre ?? '—',
      carnet: est.carnet,
      carrera: unaRelacion<{ nombre?: string }>(est.carreras)?.nombre ?? '—',
      cicloNombre,
      fecha: new Date().toLocaleDateString('es-GT'),
    }

    if (tipo === 'inscripcion') {
      const { data } = await supabase
        .from('inscripciones')
        .select('cursos(codigo, nombre, creditos)')
        .eq('estudiante_id', est.id)
        .eq('ciclo_id', cicloId)
        .eq('estado', 'aprobada')
      const cursos: CursoInscritoPDF[] = ((data ?? []) as Record<string, unknown>[]).map((r) => {
        const c = unaRelacion<{ codigo: string; nombre: string; creditos: number }>(r.cursos)
        return { codigo: c?.codigo ?? '—', nombre: c?.nombre ?? '—', creditos: c?.creditos ?? 0 }
      })
      return { base, cursosInscritos: cursos, cursosNotas: [] as CursoNotaPDF[] }
    } else {
      const { data } = await supabase
        .from('inscripciones')
        .select('cursos(codigo, nombre), calificaciones(nota_final, aprobado)')
        .eq('estudiante_id', est.id)
        .eq('ciclo_id', cicloId)
        .eq('estado', 'aprobada')
      const cursos: CursoNotaPDF[] = ((data ?? []) as Record<string, unknown>[]).map((r) => {
        const c = unaRelacion<{ codigo: string; nombre: string }>(r.cursos)
        const cal = unaRelacion<{ nota_final: number | null; aprobado: boolean | null }>(r.calificaciones)
        return {
          codigo: c?.codigo ?? '—',
          nombre: c?.nombre ?? '—',
          notaFinal: cal?.nota_final ?? null,
          aprobado: cal?.aprobado ?? null,
        }
      })
      return { base, cursosInscritos: [] as CursoInscritoPDF[], cursosNotas: cursos }
    }
  }

  const generarPDF = async (tipo: TipoConstancia, cicloId: string) => {
    const { base, cursosInscritos, cursosNotas } = await construirDatos(tipo, cicloId)
    if (tipo === 'inscripcion') pdfConstanciaInscripcion(base, cursosInscritos)
    else pdfConstanciaNotas(base, cursosNotas)
  }

  // HU-12 / HU-13: genera el PDF, lo descarga y registra la constancia.
  const generar = async (tipo: TipoConstancia, cicloId: string) => {
    if (!cicloId) throw new Error('Selecciona un ciclo académico.')
    setGenerando(true)
    try {
      await generarPDF(tipo, cicloId)
      const { data: est } = await supabase
        .from('estudiantes')
        .select('id')
        .eq('usuario_id', usuario!.id)
        .single()
      await supabase.from('constancias').insert({
        estudiante_id: est!.id,
        tipo,
        ciclo_id: cicloId,
      })
      await cargar()
    } finally {
      setGenerando(false)
    }
  }

  // Re-genera el PDF de una constancia ya registrada (HU-13: descargar).
  const descargar = async (item: ConstanciaHistorial) => {
    await generarPDF(item.tipo, item.cicloId)
  }

  return { historial, ciclos, loading, generando, generar, descargar }
}
