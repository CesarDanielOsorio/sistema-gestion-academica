/**
 * Tipos del modelo de datos del Sistema de Gestión Académica.
 * Basado en el modelo ER de la Fase 1, con la escala de notas ajustada a /100.
 *
 * Escala de notas (decisión del equipo): Zona acumulada 0-60 + Examen final 0-40 = 100.
 * Se aprueba con nota_final >= 61.
 */

export type Rol = 'admin' | 'docente' | 'estudiante'

export type EstadoInscripcion = 'pendiente' | 'aprobada' | 'cancelada'

export type TipoConstancia = 'inscripcion' | 'notas'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Estudiante {
  id: string
  usuario_id: string
  carnet: string
  carrera_id: string
  ciclo_ingreso: number
}

export interface Docente {
  id: string
  usuario_id: string
  especialidad: string | null
}

export interface Carrera {
  id: string
  nombre: string
  codigo: string
  duracion_ciclos: number
}

export interface Curso {
  id: string
  nombre: string
  codigo: string
  creditos: number
  ciclo_pensum: number
  carrera_id: string
}

export interface Prerrequisito {
  curso_id: string
  prerrequisito_id: string
}

export interface CicloAcademico {
  id: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
}

export interface Inscripcion {
  id: string
  estudiante_id: string
  curso_id: string
  ciclo_id: string
  estado: EstadoInscripcion
  fecha_inscripcion: string
  /** Motivo cuando el admin rechaza (estado 'cancelada' por rechazo). */
  motivo_rechazo: string | null
}

export interface Calificacion {
  id: string
  inscripcion_id: string
  /** Primera zona (0-30) */
  zona1: number | null
  /** Segunda zona (0-30) */
  zona2: number | null
  /** Examen final (0-40) */
  examen_final: number | null
  /** Nota final acumulada (0-100), calculada automáticamente */
  nota_final: number | null
  /** True si nota_final >= 61 */
  aprobado: boolean | null
}

export interface Constancia {
  id: string
  estudiante_id: string
  tipo: TipoConstancia
  ciclo_id: string
  fecha_generacion: string
  url_pdf: string | null
}
