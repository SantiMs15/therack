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

  it('cierra en el punto cuando hay uno util', () => {
    const t = 'Primera frase completa y bastante larga. Segunda frase que ya no cabe entera.'
    expect(resumir(t, 45)).toBe('Primera frase completa y bastante larga.')
  })

  it('no deja una coma colgando antes de los puntos suspensivos', () => {
    const r = resumir('Cruza el pecho el logo en letra gótica, aplicado en cuero', 40)
    expect(r).toBe('Cruza el pecho el logo en letra gótica…')
  })

  it('no se queda en una primera frase corta si cabe parte de la segunda', () => {
    // La primera frase de una ficha es la generica (tela, cuello, corte) y
    // la que distingue la prenda es la segunda: cortar en el primer punto
    // dejaba un resultado de busqueda igual para media tienda.
    const t = 'Camiseta Pleasures en algodón. Lleva el logo gótico tachonado con remaches.'
    const r = resumir(t, 50)
    expect(r.startsWith('Camiseta Pleasures en algodón. Lleva el')).toBe(true)
    expect(r.endsWith('…')).toBe(true)
    expect(r.length).toBeLessThanOrEqual(50)
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
