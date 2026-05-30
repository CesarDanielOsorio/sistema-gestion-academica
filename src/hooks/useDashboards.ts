import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { unaRelacion } from '@/lib/relaciones'
import { useAuth } from '@/context/AuthContext'
import type { CicloAcademico } from '@/types/database'

// ---------------------------------------------------------------------------
// Panel del ESTUDIANTE
// ---------------------------------------------------------------------------

export interface NotaReciente {
  curso: string
  nota: number | null
  aprobado: boolean | null
}

export function useDashboardEstudiante() {
  const { usuario } = useAuth()
  const [cursosInscritos, setCursosInscritos] = useState(0)
  const [promedio, setPromedio] = useState<string>('—')
  const [avance, setAvance] = useState(0)
  const [constancias, setConstancias] = useState(0)
  const [notasRecientes, setNotasRecientes] = useState<NotaReciente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!usuario) return
      setLoading(true)

      const { data: est } = await supabase
        .from('estudiantes')
        .select('id, carrera_id')
        .eq('usuario_id', usuario.id)
        .single()
      if (!est) {
        setLoading(false)
        return
      }

      const { data: cicloActivo } = await supabase
        .from('ciclos_academicos')
        .select('id')
        .eq('activo', true)
        .single()

      // Total de cursos de la carrera (para el % de avance)
      const { count: totalCursos } = await supabase
        .from('cursos')
        .select('*', { count: 'exact', head: true })
        .eq('carrera_id', est.carrera_id)

      // Inscripciones del estudiante con notas y curso
      const { data: inscData } = await supabase
        .from('inscripciones')
        .select('estado, ciclo_id, cursos(nombre), calificaciones(nota_final, aprobado)')
        .eq('estudiante_id', est.id)
      const inscripciones = (inscData ?? []) as Record<string, unknown>[]

      // Cursos inscritos en el ciclo activo (activos: pendiente o aprobada)
      setCursosInscritos(
        inscripciones.filter(
          (i) =>
            i.ciclo_id === cicloActivo?.id &&
            (i.estado === 'aprobada' || i.estado === 'pendiente'),
        ).length,
      )

      // Promedio y notas recientes
      const conNota = inscripciones
        .map((i) => ({
          curso: unaRelacion<{ nombre?: string }>(i.cursos)?.nombre ?? '—',
          cal: unaRelacion<{ nota_final: number | null; aprobado: boolean | null }>(i.calificaciones),
        }))
        .filter((x) => x.cal?.nota_final != null)
      if (conNota.length > 0) {
        setPromedio((conNota.reduce((a, x) => a + (x.cal!.nota_final ?? 0), 0) / conNota.length).toFixed(1))
      }
      setNotasRecientes(
        conNota.slice(0, 5).map((x) => ({ curso: x.curso, nota: x.cal!.nota_final, aprobado: x.cal!.aprobado })),
      )

      // Avance: aprobados / total de cursos de la carrera
      const aprobados = inscripciones.filter(
        (i) => unaRelacion<{ aprobado: boolean | null }>(i.calificaciones)?.aprobado === true,
      ).length
      setAvance(totalCursos && totalCursos > 0 ? Math.round((aprobados / totalCursos) * 100) : 0)

      // Constancias generadas
      const { count: numConstancias } = await supabase
        .from('constancias')
        .select('*', { count: 'exact', head: true })
        .eq('estudiante_id', est.id)
      setConstancias(numConstancias ?? 0)

      setLoading(false)
    }
    cargar()
  }, [usuario])

  return { cursosInscritos, promedio, avance, constancias, notasRecientes, loading }
}

// ---------------------------------------------------------------------------
// Panel del ADMINISTRADOR
// ---------------------------------------------------------------------------

export interface SolicitudReciente {
  id: string
  estudiante: string
  curso: string
  fecha: string
}

export function useDashboardAdmin() {
  const [estudiantes, setEstudiantes] = useState(0)
  const [docentes, setDocentes] = useState(0)
  const [cursos, setCursos] = useState(0)
  const [pendientes, setPendientes] = useState(0)
  const [ciclo, setCiclo] = useState<CicloAcademico | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudReciente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      const cuenta = async (tabla: string, filtros: Record<string, unknown> = {}) => {
        let q = supabase.from(tabla).select('*', { count: 'exact', head: true })
        for (const [k, v] of Object.entries(filtros)) q = q.eq(k, v)
        const { count } = await q
        return count ?? 0
      }

      setEstudiantes(await cuenta('usuarios', { rol: 'estudiante', activo: true }))
      setDocentes(await cuenta('usuarios', { rol: 'docente', activo: true }))
      setCursos(await cuenta('cursos'))
      setPendientes(await cuenta('inscripciones', { estado: 'pendiente' }))

      const { data: cicloActivo } = await supabase
        .from('ciclos_academicos')
        .select('*')
        .eq('activo', true)
        .single()
      setCiclo((cicloActivo as CicloAcademico) ?? null)

      const { data } = await supabase
        .from('inscripciones')
        .select('id, fecha_inscripcion, estudiantes(usuarios(nombre)), cursos(nombre)')
        .eq('estado', 'pendiente')
        .order('fecha_inscripcion', { ascending: false })
        .limit(5)
      setSolicitudes(
        ((data ?? []) as Record<string, unknown>[]).map((row) => {
          const est = unaRelacion<{ usuarios?: unknown }>(row.estudiantes)
          const u = unaRelacion<{ nombre?: string }>(est?.usuarios)
          return {
            id: row.id as string,
            estudiante: u?.nombre ?? '—',
            curso: unaRelacion<{ nombre?: string }>(row.cursos)?.nombre ?? '—',
            fecha: row.fecha_inscripcion as string,
          }
        }),
      )
      setLoading(false)
    }
    cargar()
  }, [])

  return { estudiantes, docentes, cursos, pendientes, ciclo, solicitudes, loading }
}
