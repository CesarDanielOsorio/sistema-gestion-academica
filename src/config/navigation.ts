import type { Rol } from '@/types/database'

export interface NavItem {
  /** Clave única para marcar el item activo */
  key: string
  label: string
  icon: string
  to: string
}

/**
 * Navegación lateral por rol (unificada en español).
 * Reemplaza los sidebars dispersos (y en inglés) de las pantallas Stitch.
 */
export const NAV_BY_ROL: Record<Rol, NavItem[]> = {
  estudiante: [
    { key: 'dashboard', label: 'Panel', icon: 'dashboard', to: '/estudiante' },
    { key: 'inscripcion', label: 'Inscripción', icon: 'how_to_reg', to: '/estudiante/inscripcion' },
    { key: 'notas', label: 'Notas', icon: 'grade', to: '/estudiante/notas' },
    { key: 'pensum', label: 'Pensum', icon: 'account_tree', to: '/estudiante/pensum' },
    { key: 'constancias', label: 'Constancias', icon: 'description', to: '/estudiante/constancias' },
  ],
  docente: [
    { key: 'dashboard', label: 'Panel', icon: 'dashboard', to: '/docente' },
    { key: 'calificaciones', label: 'Ingreso de Notas', icon: 'edit_note', to: '/docente/calificaciones' },
  ],
  admin: [
    { key: 'dashboard', label: 'Panel', icon: 'dashboard', to: '/admin' },
    { key: 'usuarios', label: 'Usuarios', icon: 'group', to: '/admin/usuarios' },
    { key: 'estudiantes', label: 'Registrar Estudiante', icon: 'school', to: '/admin/estudiantes' },
    { key: 'carreras', label: 'Carreras', icon: 'account_balance', to: '/admin/carreras' },
    { key: 'pensum', label: 'Pensum y Cursos', icon: 'menu_book', to: '/admin/pensum' },
    { key: 'inscripciones', label: 'Inscripciones', icon: 'how_to_reg', to: '/admin/inscripciones' },
  ],
}

export const SUBTITULO_POR_ROL: Record<Rol, string> = {
  estudiante: 'Portal del Estudiante',
  docente: 'Portal Docente',
  admin: 'Portal Administrativo',
}
