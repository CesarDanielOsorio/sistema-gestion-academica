import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { unaRelacion } from '@/lib/relaciones'
import { useAuth } from '@/context/AuthContext'
import type { CicloAcademico } from '@/types/database'

interface CalRaw {
  zona1: number | null
  zona2: number | null
  examen_final: number | null
  nota_final: number | null
  aprobado: boolean | null
}

/**
 * Calificaciones (Épica 2 — HU-05, HU-06, HU-08).
 * Escala /100: zona1 (0-30) + zona2 (0-30) + examen_final (0-40). Aprueba con >= 61.
 * nota_final y aprobado los calcula la base de datos (columnas generadas).
 */

// ---------------------------------------------------------------------------
// Lado DOCENTE — ingreso de notas (HU-05, HU-08)
// ---------------------------------------------------------------------------

export interface CursoConInscritos {
  id: string
  codigo: string
  nombre: string
}

export interface EstudianteNota {
  inscripcionId: string
  nombre: string
  carnet: string
  zona1: number | null
  zona2: number | null
  examen_final: number | null
  nota_final: number | null
  aprobado: boolean | null
}

export function useCalificacionesDocente() {
  const [ciclo, setCiclo] = useState<CicloAcademico | null>(null)
  const [cursos, setCursos] = useState<CursoConInscritos[]>([])
  const [cursoId, setCursoId] = useState('')
  const [estudiantes, setEstudiantes] = useState<EstudianteNota[]>([])
  const [loading, setLoading] = useState(false)

  // Ciclo activo + cursos con estudiantes inscritos (aprobados)
  useEffect(() => {
    const init = async () => {
      const { data: cicloActivo } = await supabase
        .from('ciclos_academicos')
        .select('*')
        .eq('activo', true)
        .single()
      setCiclo((cicloActivo as CicloAcademico) ?? null)
      if (!cicloActivo) return

      const { data } = await supabase
        .from('inscripciones')
        .select('curso_id, cursos(id, codigo, nombre)')
        .eq('ciclo_id', cicloActivo.id)
        .eq('estado', 'aprobada')

      const mapa = new Map<string, CursoConInscritos>()
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const c = row.cursos as CursoConInscritos | null
        if (c && !mapa.has(c.id)) mapa.set(c.id, c)
      }
      setCursos([...mapa.values()])
    }
    init()
  }, [])

  const cargarEstudiantes = useCallback(async () => {
    if (!cursoId || !ciclo) {
      setEstudiantes([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('inscripciones')
      .select('id, estudiantes(carnet, usuarios(nombre)), calificaciones(zona1, zona2, examen_final, nota_final, aprobado)')
      .eq('curso_id', cursoId)
      .eq('ciclo_id', ciclo.id)
      .eq('estado', 'aprobada')

    const lista: EstudianteNota[] = ((data ?? []) as Record<string, unknown>[]).map((row) => {
      const est = unaRelacion<{ carnet?: string; usuarios?: { nombre?: string } | { nombre?: string }[] }>(
        row.estudiantes,
      )
      const usuario = unaRelacion<{ nombre?: string }>(est?.usuarios)
      const cal = unaRelacion<CalRaw>(row.calificaciones)
      return {
        inscripcionId: row.id as string,
        nombre: usuario?.nombre ?? '—',
        carnet: est?.carnet ?? '—',
        zona1: cal?.zona1 ?? null,
        zona2: cal?.zona2 ?? null,
        examen_final: cal?.examen_final ?? null,
        nota_final: cal?.nota_final ?? null,
        aprobado: cal?.aprobado ?? null,
      }
    })
    setEstudiantes(lista)
    setLoading(false)
  }, [cursoId, ciclo])

  useEffect(() => {
    cargarEstudiantes()
  }, [cargarEstudiantes])

  const guardar = async (
    inscripcionId: string,
    datos: { zona1: number | null; zona2: number | null; examen_final: number | null },
  ) => {
    const { error } = await supabase
      .from('calificaciones')
      .upsert({ inscripcion_id: inscripcionId, ...datos }, { onConflict: 'inscripcion_id' })
    if (error) throw error
  }

  return { ciclo, cursos, cursoId, setCursoId, estudiantes, loading, guardar, recargar: cargarEstudiantes }
}

// ---------------------------------------------------------------------------
// Panel del docente — resumen de cursos con inscritos
// ---------------------------------------------------------------------------

export interface CursoDocente {
  id: string
  codigo: string
  nombre: string
  numEstudiantes: number
  numPendientes: number
}

export function useDashboardDocente() {
  const [ciclo, setCiclo] = useState<CicloAcademico | null>(null)
  const [cursos, setCursos] = useState<CursoDocente[]>([])
  const [totalEstudiantes, setTotalEstudiantes] = useState(0)
  const [totalPendientes, setTotalPendientes] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      const { data: cicloActivo } = await supabase
        .from('ciclos_academicos')
        .select('*')
        .eq('activo', true)
        .single()
      setCiclo((cicloActivo as CicloAcademico) ?? null)
      if (!cicloActivo) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('inscripciones')
        .select('estudiante_id, curso_id, cursos(id, codigo, nombre), calificaciones(nota_final)')
        .eq('ciclo_id', cicloActivo.id)
        .eq('estado', 'aprobada')

      const mapa = new Map<string, CursoDocente>()
      const estudiantes = new Set<string>()
      let pendientes = 0

      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const curso = unaRelacion<{ id: string; codigo: string; nombre: string }>(row.cursos)
        if (!curso) continue
        const cal = unaRelacion<CalRaw>(row.calificaciones)
        const sinNota = !cal || cal.nota_final == null
        estudiantes.add(row.estudiante_id as string)
        if (sinNota) pendientes++

        const actual = mapa.get(curso.id) ?? {
          id: curso.id,
          codigo: curso.codigo,
          nombre: curso.nombre,
          numEstudiantes: 0,
          numPendientes: 0,
        }
        actual.numEstudiantes++
        if (sinNota) actual.numPendientes++
        mapa.set(curso.id, actual)
      }

      setCursos([...mapa.values()])
      setTotalEstudiantes(estudiantes.size)
      setTotalPendientes(pendientes)
      setLoading(false)
    }
    cargar()
  }, [])

  return { ciclo, cursos, totalEstudiantes, totalPendientes, loading }
}

// ---------------------------------------------------------------------------
// Lado ESTUDIANTE — consulta de notas (HU-06)
// ---------------------------------------------------------------------------

export interface NotaEstudiante {
  cursoNombre: string
  cursoCodigo: string
  cicloId: string
  cicloNombre: string
  zona1: number | null
  zona2: number | null
  examen_final: number | null
  nota_final: number | null
  aprobado: boolean | null
  tieneNota: boolean
}

export function useMisCalificaciones() {
  const { usuario } = useAuth()
  const [notas, setNotas] = useState<NotaEstudiante[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!usuario) return
      setLoading(true)
      const { data: est } = await supabase
        .from('estudiantes')
        .select('id')
        .eq('usuario_id', usuario.id)
        .single()
      if (!est) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('inscripciones')
        .select('cursos(codigo, nombre), ciclos_academicos(id, nombre), calificaciones(zona1, zona2, examen_final, nota_final, aprobado)')
        .eq('estudiante_id', est.id)
        .eq('estado', 'aprobada')

      const lista: NotaEstudiante[] = ((data ?? []) as Record<string, unknown>[]).map((row) => {
        const curso = unaRelacion<{ codigo?: string; nombre?: string }>(row.cursos)
        const ciclo = unaRelacion<{ id?: string; nombre?: string }>(row.ciclos_academicos)
        const cal = unaRelacion<CalRaw>(row.calificaciones)
        return {
          cursoNombre: curso?.nombre ?? '—',
          cursoCodigo: curso?.codigo ?? '—',
          cicloId: ciclo?.id ?? '',
          cicloNombre: ciclo?.nombre ?? '—',
          zona1: cal?.zona1 ?? null,
          zona2: cal?.zona2 ?? null,
          examen_final: cal?.examen_final ?? null,
          nota_final: cal?.nota_final ?? null,
          aprobado: cal?.aprobado ?? null,
          tieneNota: cal?.nota_final != null,
        }
      })
      setNotas(lista)
      setLoading(false)
    }
    cargar()
  }, [usuario])

  return { notas, loading }
}
