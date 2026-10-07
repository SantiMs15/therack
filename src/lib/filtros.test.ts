import { describe, it, expect } from 'vitest'
import { SIN_FILTROS, hayFiltros, pasa, slugMarca, type Filtrable } from './filtros'

const hoodieLacosteHombre: Filtrable = { genero: 'hombre', tipo: 'hoodie', marcas: ['lacoste'] }
const camisetaTommyMujer: Filtrable = { genero: 'mujer', tipo: 'camiseta', marcas: ['tommy-hilfiger'] }
const zapatoSinMarca: Filtrable = { genero: null, tipo: 'sweater', marcas: [] }

describe('pasa', () => {
  it('sin filtros pasa todo', () => {
    for (const tarjeta of [hoodieLacosteHombre, camisetaTommyMujer, zapatoSinMarca]) {
      expect(pasa(tarjeta, SIN_FILTROS)).toBe(true)
    }
  })

  it('filtra por genero', () => {
    const filtros = { ...SIN_FILTROS, genero: 'mujer' as const }
    expect(pasa(camisetaTommyMujer, filtros)).toBe(true)
    expect(pasa(hoodieLacosteHombre, filtros)).toBe(false)
  })

  it('filtra por tipo', () => {
    const filtros = { ...SIN_FILTROS, tipo: 'hoodie' as const }
    expect(pasa(hoodieLacosteHombre, filtros)).toBe(true)
    expect(pasa(camisetaTommyMujer, filtros)).toBe(false)
  })

  it('filtra por marca', () => {
    const filtros = { ...SIN_FILTROS, marca: 'lacoste' }
    expect(pasa(hoodieLacosteHombre, filtros)).toBe(true)
    expect(pasa(camisetaTommyMujer, filtros)).toBe(false)
  })

  it('los tres filtros se acumulan, no se suman', () => {
    const filtros = { genero: 'hombre' as const, tipo: 'hoodie' as const, marca: 'lacoste' }
    expect(pasa(hoodieLacosteHombre, filtros)).toBe(true)
    // Cumple genero y tipo, pero no la marca: no pasa.
    expect(pasa({ ...hoodieLacosteHombre, marcas: ['essentials'] }, filtros)).toBe(false)
  })

  it('una prenda sin genero cae fuera de cualquier filtro de genero', () => {
    expect(pasa(zapatoSinMarca, { ...SIN_FILTROS, genero: 'hombre' })).toBe(false)
  })

  it('una prenda sin marca cae fuera de cualquier filtro de marca', () => {
    expect(pasa(zapatoSinMarca, { ...SIN_FILTROS, marca: 'lacoste' })).toBe(false)
  })
})

describe('hayFiltros', () => {
  it('es falso solo cuando no hay ninguno', () => {
    expect(hayFiltros(SIN_FILTROS)).toBe(false)
    expect(hayFiltros({ ...SIN_FILTROS, genero: 'mujer' })).toBe(true)
    expect(hayFiltros({ ...SIN_FILTROS, tipo: 'polo' })).toBe(true)
    expect(hayFiltros({ ...SIN_FILTROS, marca: 'lacoste' })).toBe(true)
  })
})

describe('slugMarca', () => {
  it('junta las palabras con guion', () => {
    expect(slugMarca('Tommy Hilfiger')).toBe('tommy-hilfiger')
  })

  it('quita tildes y enes', () => {
    expect(slugMarca('Piñón & Cía')).toBe('pinon-cia')
  })

  it('no deja guiones colgando en los bordes', () => {
    expect(slugMarca('  Lacoste!  ')).toBe('lacoste')
  })

  it('es estable: el mismo nombre da el mismo slug', () => {
    expect(slugMarca('Lacoste')).toBe(slugMarca('lacoste'))
  })
})
