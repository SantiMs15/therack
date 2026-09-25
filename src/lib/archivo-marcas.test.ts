import { describe, expect, it } from 'vitest'
import { archivoDeMarcas, hrefDeMarca, nombreDeMarcas, tieneFicha } from './archivo-marcas'
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
  it('lleva a su pagina, con barra final', () => {
    expect(hrefDeMarca('aime-leon-dore')).toBe('/marca/aime-leon-dore/')
  })

  it('la marca sin ficha lleva al mismo sitio: su pagina, no un filtro', () => {
    expect(hrefDeMarca('nike')).toBe('/marca/nike/')
  })
})

describe('archivoDeMarcas', () => {
  it('lista todas las marcas, tengan ficha o no', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas.map((e) => e.slug)).toEqual(['aime-leon-dore', 'nike', 'represent'])
  })

  it('la marca sin ficha viene con la ficha en nulo, no fuera de la lista', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas.find((e) => e.slug === 'nike')?.ficha).toBeNull()
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
    expect(entradas.find((e) => e.slug === 'represent')?.ficha?.pais).toBe('Reino Unido')
  })

  it('sin ninguna ficha escrita sigue habiendo una pagina por marca', () => {
    const entradas = archivoDeMarcas({}, MARCAS_DE_PRUEBA)
    expect(entradas.map((e) => e.slug)).toEqual(['aime-leon-dore', 'nike', 'represent'])
    expect(entradas.every((e) => e.ficha === null)).toBe(true)
  })
})

describe('nombreDeMarcas', () => {
  const colaboracion = ['Aimé Leon Dore', 'New Balance']

  it('una sola marca se dice tal cual', () => {
    expect(nombreDeMarcas(['Lacoste'])).toBe('Lacoste')
  })

  it('sin marca no dice nada', () => {
    expect(nombreDeMarcas([])).toBe('')
  })

  it('sin contexto, la colaboracion se dice entera', () => {
    expect(nombreDeMarcas(colaboracion)).toBe('Aimé Leon Dore × New Balance')
  })

  it('dentro de la pagina de una de las dos, manda esa', () => {
    expect(nombreDeMarcas(colaboracion, 'new-balance')).toBe('New Balance')
    expect(nombreDeMarcas(colaboracion, 'aime-leon-dore')).toBe('Aimé Leon Dore')
  })

  it('un contexto que no es suyo se ignora: se dicen las dos', () => {
    expect(nombreDeMarcas(colaboracion, 'lacoste')).toBe('Aimé Leon Dore × New Balance')
  })

  it('el contexto no estorba a la prenda de una sola marca', () => {
    expect(nombreDeMarcas(['Lacoste'], 'lacoste')).toBe('Lacoste')
    expect(nombreDeMarcas(['Lacoste'], 'nike')).toBe('Lacoste')
  })
})
