import { describe, it, expect } from 'vitest'
import { validarCatalogo, type Producto } from '../data/schema'
import { descripcionDeCategoria, enRebaja, enumerar, generosDe, marcasDe, tiposDe } from './catalogo'

/**
 * Productos de mentira, pero pasados por el mismo validador que el catalogo
 * real: si el schema cambia, estos tests se enteran en vez de seguir
 * comprobando una forma que ya no existe.
 */
function producto(campos: Record<string, unknown>): Producto {
  return validarCatalogo([
    {
      slug: 'prenda',
      nombre: 'Prenda',
      categoria: 'hombre',
      tipo: 'sweater',
      precio: 100_000,
      tallas: ['M'],
      descripcion: 'Una prenda.',
      variantes: [{ color: 'Negro', slug: 'negro', imagenes: ['x.jpg'], disponible: true }],
      destacado: false,
      ...campos,
    },
  ])[0]!
}

describe('marcasDe', () => {
  const catalogo = [
    producto({ slug: 'a', marca: 'Tommy Hilfiger' }),
    producto({ slug: 'b', marca: 'Lacoste' }),
    producto({ slug: 'c', marca: 'Lacoste' }),
    producto({ slug: 'd', marca: 'Essentials' }),
  ]

  it('no repite marcas y las devuelve en orden alfabetico', () => {
    expect(marcasDe(catalogo)).toEqual([
      { valor: 'essentials', etiqueta: 'Essentials' },
      { valor: 'lacoste', etiqueta: 'Lacoste' },
      { valor: 'tommy-hilfiger', etiqueta: 'Tommy Hilfiger' },
    ])
  })

  it('ignora las prendas sin marca', () => {
    expect(marcasDe([producto({ slug: 'e' })])).toEqual([])
  })
})

describe('generosDe', () => {
  it('solo devuelve los que tienen prendas, en el orden del schema', () => {
    const catalogo = [
      producto({ slug: 'a', categoria: 'mujer' }),
      producto({ slug: 'b', categoria: 'hombre' }),
      producto({ slug: 'c', categoria: 'hombre' }),
    ]
    expect(generosDe(catalogo)).toEqual([
      { valor: 'mujer', etiqueta: 'Mujer', href: '/catalogo/mujer/' },
      { valor: 'hombre', etiqueta: 'Hombre', href: '/catalogo/hombre/' },
    ])
  })

  it('una sola categoria deja un solo genero: ahi el desplegable sobra', () => {
    expect(generosDe([producto({ categoria: 'mujer' })])).toHaveLength(1)
  })

  it('calzado y accesorios no aportan genero', () => {
    const catalogo = [
      producto({ slug: 'a', categoria: 'calzado' }),
      producto({ slug: 'b', categoria: 'accesorios' }),
    ]
    expect(generosDe(catalogo)).toEqual([])
  })
})

describe('tiposDe', () => {
  it('solo devuelve los presentes, en el orden del schema', () => {
    const catalogo = [
      producto({ slug: 'a', tipo: 'sweater' }),
      producto({ slug: 'b', tipo: 'buzo' }),
      producto({ slug: 'c', tipo: 'hoodie' }),
      producto({ slug: 'd', tipo: 'buzo' }),
    ]
    expect(tiposDe(catalogo)).toEqual([
      { valor: 'buzo', etiqueta: 'Buzos' },
      { valor: 'hoodie', etiqueta: 'Hoodies' },
      { valor: 'sweater', etiqueta: 'Suéteres' },
    ])
  })
})

describe('enumerar', () => {
  it('separa con comas y cierra con una y', () => {
    expect(enumerar(['Essentials', 'Lacoste', 'Tommy Hilfiger']))
      .toBe('Essentials, Lacoste y Tommy Hilfiger')
  })

  it('con dos solo pone la y', () => {
    expect(enumerar(['Lacoste', 'Tommy Hilfiger'])).toBe('Lacoste y Tommy Hilfiger')
  })

  it('con uno lo devuelve tal cual, y con ninguno queda vacio', () => {
    expect(enumerar(['Lacoste'])).toBe('Lacoste')
    expect(enumerar([])).toBe('')
  })
})

describe('descripcionDeCategoria', () => {
  const catalogo = [
    producto({ slug: 'a', marca: 'Lacoste', tipo: 'buzo' }),
    producto({ slug: 'b', marca: 'Tommy Hilfiger', tipo: 'chaqueta' }),
    producto({ slug: 'c', marca: 'Lacoste', tipo: 'buzo' }),
  ]
  const cierre = 'Envío gratis a toda Colombia.'

  it('nombra las marcas y los tipos que hay de verdad', () => {
    expect(descripcionDeCategoria(catalogo, 'hombre', cierre))
      .toBe('Ropa de hombre de Lacoste y Tommy Hilfiger. Buzos y chaquetas. Envío gratis a toda Colombia.')
  })

  it('no repite una marca que tiene varias prendas', () => {
    const d = descripcionDeCategoria(catalogo, 'hombre', cierre)
    expect(d.match(/Lacoste/g)).toHaveLength(1)
  })

  it('cabe en lo que muestra un resultado de busqueda', () => {
    expect(descripcionDeCategoria(catalogo, 'hombre', cierre).length).toBeLessThanOrEqual(160)
  })

  it('aguanta una categoria sin prendas sin dejar frases a medias', () => {
    const d = descripcionDeCategoria([], 'calzado', cierre)
    expect(d).toBe('Ropa de calzado. Envío gratis a toda Colombia.')
    expect(d).not.toContain('  ')
  })
})

describe('enRebaja', () => {
  const base = {
    slug: 'buzo',
    nombre: 'Buzo',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 290000,
    tallas: ['M'],
    descripcion: 'Buzo.',
    destacado: true,
  }
  const color = (slug: string, extra: object = {}) => ({
    color: slug,
    slug,
    imagenes: [`buzo-${slug}.jpg`],
    disponible: true,
    ...extra,
  })

  it('deja solo los colores rebajados de cada prenda', () => {
    const [prenda] = enRebaja(
      validarCatalogo([
        { ...base, variantes: [color('beige'), color('borgona', { precio: 248000, precioAnterior: 290000 })] },
      ])
    )
    expect(prenda!.variantes.map((v) => v.slug)).toEqual(['borgona'])
  })

  it('la rebaja de la prenda entra con todos sus colores', () => {
    const [prenda] = enRebaja(
      validarCatalogo([{ ...base, precioAnterior: 450000, variantes: [color('negro'), color('gris')] }])
    )
    expect(prenda!.variantes).toHaveLength(2)
  })

  it('una prenda sin ningun color rebajado no entra', () => {
    expect(enRebaja(validarCatalogo([{ ...base, variantes: [color('negro')] }]))).toEqual([])
  })
})
