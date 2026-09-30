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

  it('acepta varios fundadores como lista', () => {
    const ficha = { ...fichaValida(), fundador: ['Conra Martínez', 'Gabriel Morón'] }
    const fichas = validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)
    expect(fichas.nike?.fundador).toEqual(['Conra Martínez', 'Gabriel Morón'])
  })

  it('rechaza una lista de un solo fundador: uno va como texto', () => {
    const ficha = { ...fichaValida(), fundador: ['Teddy Santis'] }
    expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/fundador/)
  })

  it('acepta un nombre de busqueda distinto del nombre de la marca', () => {
    const ficha = { ...fichaValida(), nombreBusqueda: 'Polo Ralph Lauren' }
    const fichas = validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)
    expect(fichas.nike?.nombreBusqueda).toBe('Polo Ralph Lauren')
  })

  it('rechaza un nombre de busqueda vacio', () => {
    const ficha = { ...fichaValida(), nombreBusqueda: '' }
    expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/nombreBusqueda/)
  })

  it('rechaza un titular que cortaria el titulo del buscador', () => {
    const ficha = { ...fichaValida(), titular: 'x'.repeat(31) }
    expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/titular/)
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

  describe('galeria', () => {
    function foto(n: number) {
      return { imagen: `foto-${n}.jpg`, alt: `Foto ${n}` }
    }

    it('es opcional: una ficha sin galeria sigue siendo valida', () => {
      const fichas = validarFichas({ nike: fichaValida() }, MARCAS_DE_PRUEBA)
      expect(fichas.nike?.galeria).toBeUndefined()
    })

    it('acepta de 2 a 6 fotos', () => {
      const ficha = { ...fichaValida(), galeria: [foto(1), foto(2), foto(3)] }
      const fichas = validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)
      expect(fichas.nike?.galeria).toHaveLength(3)
    })

    it('rechaza una galeria de una sola foto: no hay acordeon que abrir', () => {
      const ficha = { ...fichaValida(), galeria: [foto(1)] }
      expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/galeria/)
    })

    it('rechaza mas de 6 fotos: las cerradas quedarian como rayas', () => {
      const ficha = { ...fichaValida(), galeria: [1, 2, 3, 4, 5, 6, 7].map(foto) }
      expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/galeria/)
    })

    it('rechaza una foto sin alt, y nombra el campo', () => {
      const { alt, ...sinAlt } = foto(2)
      const ficha = { ...fichaValida(), galeria: [foto(1), sinAlt] }
      expect(() => validarFichas({ nike: ficha }, MARCAS_DE_PRUEBA)).toThrow(/galeria\.1\.alt/)
    })
  })

  it('rechaza un campo de mas: un nombre mal escrito no se ignora en silencio', () => {
    const conSobra = { ...fichaValida(), pias: 'Estados Unidos' }
    expect(() => validarFichas({ nike: conSobra }, MARCAS_DE_PRUEBA)).toThrow()
  })
})
