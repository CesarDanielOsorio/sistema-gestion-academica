// La lógica de autenticación vive en el contexto global de Auth.
// Se re-exporta aquí para mantener compatibilidad con los imports existentes.
export { useAuth } from '@/context/AuthContext'
