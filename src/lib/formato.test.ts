import { describe, it, expect } from 'vitest'
import { formatearPrecio } from './formato'

describe('formatearPrecio', () => {
  it('usa punto como separador de miles', () => {
    expect(formatearPrecio(89000)).toBe('$89.000')
  })

  it('agrupa millones correctamente', () => {
    expect(formatearPrecio(1200000)).toBe('$1.200.000')
  })

  it('no agrupa por debajo de mil', () => {
    expect(formatearPrecio(500)).toBe('$500')
  })

  it('formatea el cero', () => {
    expect(formatearPrecio(0)).toBe('$0')
  })

  it('redondea decimales', () => {
    expect(formatearPrecio(89000.6)).toBe('$89.001')
  })

  it('rechaza precios negativos', () => {
    expect(() => formatearPrecio(-1)).toThrow(/inv[aá]lido/i)
  })

  it('rechaza valores no numericos', () => {
    expect(() => formatearPrecio(NaN)).toThrow(/inv[aá]lido/i)
  })
})
