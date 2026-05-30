import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components'
import { LoginPage } from '@/pages/LoginPage'

// Estudiante
import { DashboardEstudiantePage } from '@/pages/estudiante/DashboardEstudiantePage'
import { InscripcionPage } from '@/pages/estudiante/InscripcionPage'
import { MisNotasPage } from '@/pages/estudiante/MisNotasPage'
import { PensumPage } from '@/pages/estudiante/PensumPage'
import { ConstanciasPage } from '@/pages/estudiante/ConstanciasPage'

// Docente
import { DashboardDocentePage } from '@/pages/docente/DashboardDocentePage'
import { IngresoCalificacionesPage } from '@/pages/docente/IngresoCalificacionesPage'

// Admin
import { PanelAdminPage } from '@/pages/admin/PanelAdminPage'
import { GestionUsuariosPage } from '@/pages/admin/GestionUsuariosPage'
import { RegistrarEstudiantePage } from '@/pages/admin/RegistrarEstudiantePage'
import { CarrerasPage } from '@/pages/admin/CarrerasPage'
import { GestionPensumPage } from '@/pages/admin/GestionPensumPage'
import { AprobacionInscripcionesPage } from '@/pages/admin/AprobacionInscripcionesPage'

/**
 * Rutas de la aplicación.
 * TODO (Fase 2): proteger las rutas por rol según la sesión de Supabase.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Estudiante */}
        <Route path="/estudiante" element={<ProtectedRoute roles={['estudiante']}><DashboardEstudiantePage /></ProtectedRoute>} />
        <Route path="/estudiante/inscripcion" element={<ProtectedRoute roles={['estudiante']}><InscripcionPage /></ProtectedRoute>} />
        <Route path="/estudiante/notas" element={<ProtectedRoute roles={['estudiante']}><MisNotasPage /></ProtectedRoute>} />
        <Route path="/estudiante/pensum" element={<ProtectedRoute roles={['estudiante']}><PensumPage /></ProtectedRoute>} />
        <Route path="/estudiante/constancias" element={<ProtectedRoute roles={['estudiante']}><ConstanciasPage /></ProtectedRoute>} />

        {/* Docente */}
        <Route path="/docente" element={<ProtectedRoute roles={['docente']}><DashboardDocentePage /></ProtectedRoute>} />
        <Route path="/docente/calificaciones" element={<ProtectedRoute roles={['docente']}><IngresoCalificacionesPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><PanelAdminPage /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><GestionUsuariosPage /></ProtectedRoute>} />
        <Route path="/admin/estudiantes" element={<ProtectedRoute roles={['admin']}><RegistrarEstudiantePage /></ProtectedRoute>} />
        <Route path="/admin/carreras" element={<ProtectedRoute roles={['admin']}><CarrerasPage /></ProtectedRoute>} />
        <Route path="/admin/pensum" element={<ProtectedRoute roles={['admin']}><GestionPensumPage /></ProtectedRoute>} />
        <Route path="/admin/inscripciones" element={<ProtectedRoute roles={['admin']}><AprobacionInscripcionesPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
