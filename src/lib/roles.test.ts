import { describe, it, expect } from 'vitest'
import { homePorRol } from './roles'

describe('homePorRol', () => {
  it('redirige a cada portal según el rol', () => {
    expect(homePorRol('admin')).toBe('/admin')
    expect(homePorRol('docente')).toBe('/docente')
    expect(homePorRol('estudiante')).toBe('/estudiante')
  })

  it('redirige a login cuando no hay rol', () => {
    expect(homePorRol(null)).toBe('/login')
  })
})
