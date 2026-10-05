import { describe, it, expect } from 'vitest'
import { formatearPrecio, resumir } from './formato'

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

describe('resumir', () => {
  it('deja intacto lo que ya cabe', () => {
    expect(resumir('Corto.', 100)).toBe('Corto.')
  })

  it('cierra en el punto cuando la frase llena casi todo el espacio', () => {
    const t = 'Primera frase bastante completa. Segunda frase que ya no cabe entera.'
    expect(resumir(t, 38)).toBe('Primera frase bastante completa.')
  })

  it('no cierra en un punto temprano: corta por palabra y aprovecha el espacio', () => {
    const t = 'Frase corta. Segunda frase que sigue y sigue hasta pasarse del limite.'
    const r = resumir(t, 40)
    expect(r.endsWith('…')).toBe(true)
    expect(r.length).toBeGreaterThan(30)
  })

  it('recorta por palabra si la primera frase ya se pasa', () => {
    const t = 'Una sola frase muy larga que no tiene ningun punto donde cortar antes del limite'
    const r = resumir(t, 30)
    expect(r.length).toBeLessThanOrEqual(31)
    expect(r.endsWith('…')).toBe(true)
    expect(r).not.toContain(' …')
  })

  it('nunca parte una palabra por la mitad', () => {
    const t = 'palabras sueltas separadas correctamente por espacios simples'
    const r = resumir(t, 25).replace('…', '').trimEnd()
    expect(t.startsWith(r)).toBe(true)
    expect(t[r.length] === ' ' || r.length === t.length).toBe(true)
  })
})
