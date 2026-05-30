import { describe, it, expect } from 'vitest'
import { unaRelacion } from './relaciones'

describe('unaRelacion', () => {
  it('devuelve el objeto cuando la relación viene como objeto', () => {
    const obj = { nombre: 'Juan' }
    expect(unaRelacion<{ nombre: string }>(obj)).toEqual(obj)
  })

  it('devuelve el primer elemento cuando viene como array', () => {
    const arr = [{ nombre: 'Ana' }, { nombre: 'Luis' }]
    expect(unaRelacion<{ nombre: string }>(arr)).toEqual({ nombre: 'Ana' })
  })

  it('devuelve null para null o undefined', () => {
    expect(unaRelacion(null)).toBeNull()
    expect(unaRelacion(undefined)).toBeNull()
  })

  it('devuelve null para un array vacío', () => {
    expect(unaRelacion([])).toBeNull()
  })
})
