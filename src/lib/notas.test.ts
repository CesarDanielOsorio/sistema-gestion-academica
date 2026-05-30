import { describe, it, expect } from 'vitest'
import {
  calcularNotaFinal,
  estaAprobado,
  parcialValida,
  NOTA_APROBACION,
  NOTA_MAXIMA,
} from './notas'

describe('calcularNotaFinal', () => {
  it('suma las tres parciales', () => {
    expect(calcularNotaFinal(30, 30, 40)).toBe(100)
    expect(calcularNotaFinal(25, 28, 35)).toBe(88)
  })

  it('trata los valores null como cero', () => {
    expect(calcularNotaFinal(null, null, null)).toBe(0)
    expect(calcularNotaFinal(30, null, 10)).toBe(40)
  })

  it('nunca supera la nota máxima con valores válidos', () => {
    expect(calcularNotaFinal(30, 30, 40)).toBeLessThanOrEqual(NOTA_MAXIMA)
  })
})

describe('estaAprobado', () => {
  it('aprueba exactamente en el umbral (61)', () => {
    expect(estaAprobado(NOTA_APROBACION)).toBe(true)
    expect(estaAprobado(61)).toBe(true)
  })

  it('reprueba por debajo del umbral', () => {
    expect(estaAprobado(60)).toBe(false)
    expect(estaAprobado(0)).toBe(false)
  })

  it('aprueba notas altas', () => {
    expect(estaAprobado(100)).toBe(true)
  })
})

describe('parcialValida', () => {
  it('valida zonas entre 0 y 30', () => {
    expect(parcialValida(0, 'zona')).toBe(true)
    expect(parcialValida(30, 'zona')).toBe(true)
    expect(parcialValida(31, 'zona')).toBe(false)
    expect(parcialValida(-1, 'zona')).toBe(false)
  })

  it('valida el examen entre 0 y 40', () => {
    expect(parcialValida(40, 'examen')).toBe(true)
    expect(parcialValida(41, 'examen')).toBe(false)
  })
})
