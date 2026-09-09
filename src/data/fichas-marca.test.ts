import { describe, expect, it } from 'vitest'
import { validarFichas } from './fichas-marca'

const MARCAS_DE_PRUEBA = ['Aimé Leon Dore', 'Nike'] as const

/** Una ficha completa y valida, para partir de ella y romperla campo a campo. */
function fichaValida() {
  return {
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    porQue: ['Primer parrafo.', 'Segundo parrafo.'],
    imagen: 'aime-leon-dore-campana.jpg',
    alt: 'Campaña de Aimé Leon Dore en una calle de Queens',
  }
}

describe('validarFichas', () => {
  it('acepta un archivo vacio: la ficha es opcional', () => {
    expect(validarFichas({}, MARCAS_DE_PRUEBA)).toEqual({})
  })

  it('devuelve la ficha valida bajo su slug', () => {
    const fichas = validarFichas({ 'aime-leon-dore': fichaValida() }, MARCAS_DE_PRUEBA)
    expect(fichas['aime-leon-dore']?.fundador).toBe('Teddy Santis')
  })

  it('rechaza un slug que no esta en marcas.ts, y lo nombra', () => {
    expect(() => validarFichas({ 'marca-inventada': fichaValida() }, MARCAS_DE_PRUEBA)).toThrow(
      /marca-inventada/
    )
  })

  it('acepta el slug derivado de un nombre con tilde', () => {
    // "Aimé Leon Dore" -> "aime-leon-dore". Si la comparacion se hiciera con
    // el nombre crudo, esta ficha se rechazaria por buena.
    expect(() => validarFichas({ 'aime-leon-dore': fichaValida() }, MARCAS_DE_PRUEBA)).not.toThrow()
  })

  it('rechaza una ficha a la que le falta un campo, y nombra marca y campo', () => {
    const { fundador, ...incompleta } = fichaValida()
    expect(() => validarFichas({ nike: incompleta }, MARCAS_DE_PRUEBA)).toThrow(/nike[\s\S]*fundador/)
  })

  it('rechaza una propuesta de mas de 160 caracteres', () => {
    const larga = { ...fichaValida(), propuesta: 'a'.repeat(161) }
    expect(() => validarFichas({ nike: larga }, MARCAS_DE_PRUEBA)).toThrow(/160/)
  })

  it('rechaza porQue sin ningun parrafo', () => {
    const sinTexto = { ...fichaValida(), porQue: [] }
    expect(() => validarFichas({ nike: sinTexto }, MARCAS_DE_PRUEBA)).toThrow(/porQue/)
  })

  it('rechaza un campo de mas: un nombre mal escrito no se ignora en silencio', () => {
    const conSobra = { ...fichaValida(), pias: 'Estados Unidos' }
    expect(() => validarFichas({ nike: conSobra }, MARCAS_DE_PRUEBA)).toThrow()
  })
})
