import { describe, it, expect } from 'vitest'
import { productos } from './productos'
import { MARCAS, marcasTodas } from './marcas'
import { marcasDe } from '../lib/catalogo'

describe('MARCAS', () => {
  it('no repite ningun nombre', () => {
    expect(new Set(MARCAS).size).toBe(MARCAS.length)
  })

  it('no repite ningun slug', () => {
    const slugs = marcasTodas().map((m) => m.valor)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('ningun slug queda vacio', () => {
    expect(marcasTodas().every((m) => m.valor.length > 0)).toBe(true)
  })
})

describe('marcasTodas', () => {
  it('devuelve las marcas en orden alfabetico', () => {
    const etiquetas = marcasTodas().map((m) => m.etiqueta)
    const ordenadas = [...etiquetas].sort((a, b) => a.localeCompare(b, 'es'))
    expect(etiquetas).toEqual(ordenadas)
  })

  /**
   * El menu se pinta de esta lista y el filtro de la rejilla valida contra
   * ella. Una marca que se vende y no este aqui desaparece del menu, y su
   * `?marca=<slug>` deja de filtrar: se ignora y se ve el catalogo entero.
   */
  it('contiene todas las marcas que hay en el catalogo', () => {
    const enCatalogo = marcasDe(productos).map((m) => m.valor)
    const todas = new Set(marcasTodas().map((m) => m.valor))
    for (const slug of enCatalogo) expect(todas).toContain(slug)
  })
})
