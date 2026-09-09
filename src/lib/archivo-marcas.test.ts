import { describe, expect, it } from 'vitest'
import { archivoDeMarcas, hrefDeMarca, tieneFicha } from './archivo-marcas'
import type { FichaMarca } from '../data/fichas-marca'

const MARCAS_DE_PRUEBA = ['Nike', 'Aimé Leon Dore', 'Represent'] as const

function ficha(pais: string, anio: number): FichaMarca {
  return {
    pais,
    anio,
    fundador: 'Alguien',
    propuesta: 'Una linea.',
    porQue: ['Un parrafo.'],
    imagen: 'x.jpg',
    alt: 'Una foto',
  }
}

const FICHAS_DE_PRUEBA: Record<string, FichaMarca> = {
  'aime-leon-dore': ficha('Estados Unidos', 2014),
  represent: ficha('Reino Unido', 2011),
}

describe('tieneFicha', () => {
  it('es cierto para la marca que la tiene', () => {
    expect(tieneFicha('represent', FICHAS_DE_PRUEBA)).toBe(true)
  })

  it('es falso para la marca que no', () => {
    expect(tieneFicha('nike', FICHAS_DE_PRUEBA)).toBe(false)
  })
})

describe('hrefDeMarca', () => {
  it('con ficha lleva a su pagina, con barra final', () => {
    expect(hrefDeMarca('aime-leon-dore', FICHAS_DE_PRUEBA)).toBe('/marca/aime-leon-dore/')
  })

  it('sin ficha lleva al filtro de la portada, como antes del archivo', () => {
    expect(hrefDeMarca('nike', FICHAS_DE_PRUEBA)).toBe('/?marca=nike')
  })
})

describe('archivoDeMarcas', () => {
  it('lista solo las marcas con ficha', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas.map((e) => e.slug)).toEqual(['aime-leon-dore', 'represent'])
  })

  it('devuelve el nombre con su tilde, no el slug', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas[0]?.nombre).toBe('Aimé Leon Dore')
  })

  it('ordena alfabeticamente en espanol, no por el orden de MARCAS', () => {
    const alReves = ['Represent', 'Aimé Leon Dore'] as const
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, alReves)
    expect(entradas.map((e) => e.nombre)).toEqual(['Aimé Leon Dore', 'Represent'])
  })

  it('trae la ficha entera, para que el indice pinte pais y ano', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas[1]?.ficha.pais).toBe('Reino Unido')
  })

  it('con el archivo vacio no devuelve nada', () => {
    expect(archivoDeMarcas({}, MARCAS_DE_PRUEBA)).toEqual([])
  })
})
