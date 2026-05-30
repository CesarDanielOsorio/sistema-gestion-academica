/**
 * Lógica de calificaciones (módulo puro, fácil de probar).
 * Escala /100: Zona 1 (0-30) + Zona 2 (0-30) + Examen final (0-40). Aprueba con >= 61.
 */

export const NOTA_APROBACION = 61
export const MAX_ZONA = 30
export const MAX_EXAMEN = 40
export const NOTA_MAXIMA = MAX_ZONA + MAX_ZONA + MAX_EXAMEN // 100

/** Suma las parciales (tratando null como 0) para obtener la nota final 0-100. */
export function calcularNotaFinal(
  zona1: number | null,
  zona2: number | null,
  examenFinal: number | null,
): number {
  return (zona1 ?? 0) + (zona2 ?? 0) + (examenFinal ?? 0)
}

/** Determina si una nota final aprueba (>= 61). */
export function estaAprobado(notaFinal: number): boolean {
  return notaFinal >= NOTA_APROBACION
}

/** Valida que una parcial esté dentro de su rango permitido. */
export function parcialValida(valor: number, tipo: 'zona' | 'examen'): boolean {
  const max = tipo === 'examen' ? MAX_EXAMEN : MAX_ZONA
  return valor >= 0 && valor <= max
}
