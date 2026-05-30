import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { unaRelacion } from '@/lib/relaciones'
import { useAuth } from '@/context/AuthContext'
import type { CicloAcademico, Curso, Inscripcion } from '@/types/database'

// ---------------------------------------------------------------------------
// Oferta de inscripción (lado ESTUDIANTE) — HU-01, HU-02, HU-04
// ---------------------------------------------------------------------------

export interface CursoOferta {
  curso: Curso
  prereqsCumplidos: boolean
  prereqFaltantes: string[] // códigos de cursos faltantes
  inscripcion: Inscripcion | null // inscripción del ciclo activo, si existe
}

export function useOfertaInscripcion() {
  const { usuario } = useAuth()
  const [ciclo, setCiclo] = useState<CicloAcademico | null>(null)
  const [oferta, setOferta] = useState<CursoOferta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!usuario) return
    setLoading(true)
    setError(null)
    try {
      // Estudiante actual
      const { data: est } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('usuario_id', usuario.id)
        .single()
      if (!est) throw new Error('Tu usuario no tiene un perfil de estudiante asociado.')

      // Ciclo activo
      const { data: cicloActivo } = await supabase
        .from('ciclos_academicos')
        .select('*')
        .eq('activo', true)
        .single()
      setCiclo((cicloActivo as CicloAcademico) ?? null)

      // Cursos de su carrera
      const { data: cursosData } = await supabase
        .from('cursos')
        .select('*')
        .eq('carrera_id', est.carrera_id)
        .order('ciclo_pensum')
        .order('codigo')
      const cursos = (cursosData as Curso[]) ?? []

      // Prerrequisitos de esos cursos
      const { data: prereqData } = await supabase
        .from('prerrequisitos')
        .select('*')
        .in('curso_id', cursos.length ? cursos.map((c) => c.id) : ['00000000-0000-0000-0000-000000000000'])
      const prereqs = prereqData ?? []

      // Inscripciones del estudiante (con sus notas para saber qué aprobó)
      const { data: inscData } = await supabase
        .from('inscripciones')
        .select('*, calificaciones(aprobado)')
        .eq('estudiante_id', est.id)
      const inscripciones = (inscData ?? []) as (Inscripcion & {
        calificaciones: unknown
      })[]

      const aprobados = new Set(
        inscripciones
          .filter((i) => unaRelacion<{ aprobado: boolean | null }>(i.calificaciones)?.aprobado === true)
          .map((i) => i.curso_id),
      )

      const codigoPorId = new Map(cursos.map((c) => [c.id, c.codigo]))

      const nuevaOferta: CursoOferta[] = cursos.map((curso) => {
        const reqs = prereqs.filter((p) => p.curso_id === curso.id).map((p) => p.prerrequisito_id)
        const faltantes = reqs.filter((r) => !aprobados.has(r))
        const inscCiclo =
          inscripciones.find(
            (i) => i.curso_id === curso.id && i.ciclo_id === cicloActivo?.id && i.estado !== 'cancelada',
          ) ?? null
        return {
          curso,
          prereqsCumplidos: faltantes.length === 0,
          prereqFaltantes: faltantes.map((r) => codigoPorId.get(r) ?? '—'),
          inscripcion: inscCiclo,
        }
      })

      setOferta(nuevaOferta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la oferta.')
    } finally {
      setLoading(false)
    }
  }, [usuario])

  useEffect(() => {
    cargar()
  }, [cargar])

  const inscribir = async (cursoId: string) => {
    if (!ciclo) throw new Error('No hay un ciclo académico activo.')
    const { data: est } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('usuario_id', usuario!.id)
      .single()
    if (!est) throw new Error('No se encontró tu perfil de estudiante.')
    // upsert: si ya existía una inscripción (p. ej. cancelada) la reactiva como pendiente.
    const { error: err } = await supabase.from('inscripciones').upsert(
      {
        estudiante_id: est.id,
        curso_id: cursoId,
        ciclo_id: ciclo.id,
        estado: 'pendiente',
        motivo_rechazo: null,
      },
      { onConflict: 'estudiante_id,curso_id,ciclo_id' },
    )
    if (err) throw err
    await cargar()
  }

  const cancelar = async (inscripcionId: string) => {
    const { error: err } = await supabase
      .from('inscripciones')
      .update({ estado: 'cancelada' })
      .eq('id', inscripcionId)
    if (err) throw err
    await cargar()
  }

  return { ciclo, oferta, loading, error, cargar, inscribir, cancelar }
}

// ---------------------------------------------------------------------------
// Gestión de solicitudes (lado ADMIN) — HU-03
// ---------------------------------------------------------------------------

export interface SolicitudInscripcion {
  id: string
  estado: Inscripcion['estado']
  fecha_inscripcion: string
  motivo_rechazo: string | null
  estudianteNombre: string
  carnet: string
  cursoNombre: string
  cursoCodigo: string
  cicloNombre: string
}

function mapSolicitud(row: Record<string, unknown>): SolicitudInscripcion {
  const est = row.estudiantes as { carnet?: string; usuarios?: { nombre?: string } } | null
  const curso = row.cursos as { nombre?: string; codigo?: string } | null
  const ciclo = row.ciclos_academicos as { nombre?: string } | null
  return {
    id: row.id as string,
    estado: row.estado as Inscripcion['estado'],
    fecha_inscripcion: row.fecha_inscripcion as string,
    motivo_rechazo: (row.motivo_rechazo as string | null) ?? null,
    estudianteNombre: est?.usuarios?.nombre ?? '—',
    carnet: est?.carnet ?? '—',
    cursoNombre: curso?.nombre ?? '—',
    cursoCodigo: curso?.codigo ?? '—',
    cicloNombre: ciclo?.nombre ?? '—',
  }
}

export function useGestionInscripciones() {
  const [solicitudes, setSolicitudes] = useState<SolicitudInscripcion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('inscripciones')
      .select(
        '*, estudiantes(carnet, usuarios(nombre)), cursos(nombre, codigo), ciclos_academicos(nombre)',
      )
      .order('fecha_inscripcion', { ascending: false })
    if (err) setError(err.message)
    else setSolicitudes(((data ?? []) as Record<string, unknown>[]).map(mapSolicitud))
    setLoading(false)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const aprobar = async (id: string) => {
    const { error: err } = await supabase
      .from('inscripciones')
      .update({ estado: 'aprobada', motivo_rechazo: null })
      .eq('id', id)
    if (err) throw err
    await cargar()
  }

  const rechazar = async (id: string, motivo: string) => {
    const { error: err } = await supabase
      .from('inscripciones')
      .update({ estado: 'cancelada', motivo_rechazo: motivo })
      .eq('id', id)
    if (err) throw err
    await cargar()
  }

  return { solicitudes, loading, error, cargar, aprobar, rechazar }
}
