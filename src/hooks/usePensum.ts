import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { unaRelacion } from '@/lib/relaciones'
import { useAuth } from '@/context/AuthContext'
import type { Curso, Prerrequisito } from '@/types/database'

/**
 * Hook de gestión de pensum (Épica 3 — HU-09, HU-11).
 * Carga los cursos (y sus prerrequisitos) de una carrera.
 */
export function usePensum(carreraId?: string) {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [prerrequisitos, setPrerrequisitos] = useState<Prerrequisito[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!carreraId) {
      setCursos([])
      setPrerrequisitos([])
      return
    }
    setLoading(true)
    setError(null)
    const { data: cursosData, error: errCursos } = await supabase
      .from('cursos')
      .select('*')
      .eq('carrera_id', carreraId)
      .order('ciclo_pensum')
      .order('codigo')

    if (errCursos) {
      setError(errCursos.message)
      setLoading(false)
      return
    }
    const lista = (cursosData as Curso[]) ?? []
    setCursos(lista)

    if (lista.length > 0) {
      const { data: prereqData } = await supabase
        .from('prerrequisitos')
        .select('*')
        .in('curso_id', lista.map((c) => c.id))
      setPrerrequisitos((prereqData as Prerrequisito[]) ?? [])
    } else {
      setPrerrequisitos([])
    }
    setLoading(false)
  }, [carreraId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crearCurso = async (curso: Omit<Curso, 'id'>) => {
    const { error: err } = await supabase.from('cursos').insert(curso)
    if (err) throw err
    await cargar()
  }

  const editarCurso = async (id: string, datos: Partial<Curso>) => {
    const { error: err } = await supabase.from('cursos').update(datos).eq('id', id)
    if (err) throw err
    await cargar()
  }

  const eliminarCurso = async (id: string) => {
    const { error: err } = await supabase.from('cursos').delete().eq('id', id)
    if (err) throw err
    await cargar()
  }

  // HU-11: reemplaza el conjunto de prerrequisitos de un curso.
  const definirPrerrequisitos = async (cursoId: string, prerrequisitoIds: string[]) => {
    const { error: errDel } = await supabase
      .from('prerrequisitos')
      .delete()
      .eq('curso_id', cursoId)
    if (errDel) throw errDel

    if (prerrequisitoIds.length > 0) {
      const filas = prerrequisitoIds.map((pid) => ({ curso_id: cursoId, prerrequisito_id: pid }))
      const { error: errIns } = await supabase.from('prerrequisitos').insert(filas)
      if (errIns) throw errIns
    }
    await cargar()
  }

  /** Devuelve los prerrequisitos (ids de curso) de un curso dado. */
  const prereqsDe = (cursoId: string) =>
    prerrequisitos.filter((p) => p.curso_id === cursoId).map((p) => p.prerrequisito_id)

  return {
    cursos,
    prerrequisitos,
    loading,
    error,
    cargar,
    crearCurso,
    editarCurso,
    eliminarCurso,
    definirPrerrequisitos,
    prereqsDe,
  }
}

// ---------------------------------------------------------------------------
// Pensum del ESTUDIANTE — avance académico (HU-10)
// ---------------------------------------------------------------------------

export type EstadoCursoPensum = 'aprobado' | 'en_curso' | 'pendiente'

export interface CursoMiPensum {
  id: string
  codigo: string
  nombre: string
  creditos: number
  cicloPensum: number
  estado: EstadoCursoPensum
  nota: number | null
}

export interface ResumenPensum {
  aprobados: number
  enCurso: number
  pendientes: number
  total: number
  avance: number // porcentaje 0-100
  creditosAprobados: number
  creditosTotales: number
}

export function useMiPensum() {
  const { usuario } = useAuth()
  const [carreraNombre, setCarreraNombre] = useState('')
  const [ciclos, setCiclos] = useState<{ ciclo: number; cursos: CursoMiPensum[] }[]>([])
  const [resumen, setResumen] = useState<ResumenPensum>({
    aprobados: 0,
    enCurso: 0,
    pendientes: 0,
    total: 0,
    avance: 0,
    creditosAprobados: 0,
    creditosTotales: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!usuario) return
      setLoading(true)

      const { data: est } = await supabase
        .from('estudiantes')
        .select('id, carrera_id, carreras(nombre)')
        .eq('usuario_id', usuario.id)
        .single()
      if (!est) {
        setLoading(false)
        return
      }
      setCarreraNombre(unaRelacion<{ nombre?: string }>(est.carreras)?.nombre ?? '')

      const { data: cursosData } = await supabase
        .from('cursos')
        .select('*')
        .eq('carrera_id', est.carrera_id)
        .order('ciclo_pensum')
        .order('codigo')
      const cursos = (cursosData as Curso[]) ?? []

      const { data: inscData } = await supabase
        .from('inscripciones')
        .select('curso_id, estado, calificaciones(nota_final, aprobado)')
        .eq('estudiante_id', est.id)
      const inscripciones = (inscData ?? []) as Record<string, unknown>[]

      const lista: CursoMiPensum[] = cursos.map((curso) => {
        const insc = inscripciones.filter((i) => i.curso_id === curso.id)
        let estado: EstadoCursoPensum = 'pendiente'
        let nota: number | null = null
        for (const i of insc) {
          const cal = unaRelacion<{ nota_final: number | null; aprobado: boolean | null }>(i.calificaciones)
          if (cal?.aprobado === true) {
            estado = 'aprobado'
            nota = cal.nota_final
            break
          }
          if (i.estado === 'aprobada' || i.estado === 'pendiente') {
            estado = 'en_curso'
          }
        }
        return {
          id: curso.id,
          codigo: curso.codigo,
          nombre: curso.nombre,
          creditos: curso.creditos,
          cicloPensum: curso.ciclo_pensum,
          estado,
          nota,
        }
      })

      // Agrupar por ciclo
      const mapa = new Map<number, CursoMiPensum[]>()
      for (const c of lista) {
        const arr = mapa.get(c.cicloPensum) ?? []
        arr.push(c)
        mapa.set(c.cicloPensum, arr)
      }
      setCiclos([...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([ciclo, cursos]) => ({ ciclo, cursos })))

      const aprobados = lista.filter((c) => c.estado === 'aprobado')
      const enCurso = lista.filter((c) => c.estado === 'en_curso').length
      const total = lista.length
      const creditosTotales = lista.reduce((a, c) => a + c.creditos, 0)
      const creditosAprobados = aprobados.reduce((a, c) => a + c.creditos, 0)
      setResumen({
        aprobados: aprobados.length,
        enCurso,
        pendientes: total - aprobados.length - enCurso,
        total,
        avance: total > 0 ? Math.round((aprobados.length / total) * 100) : 0,
        creditosAprobados,
        creditosTotales,
      })
      setLoading(false)
    }
    cargar()
  }, [usuario])

  return { carreraNombre, ciclos, resumen, loading }
}
