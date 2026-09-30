import { describe, it, expect } from 'vitest'
import { validarCatalogo, type Producto } from '../data/schema'
import {
  descripcionDeCategoria,
  descripcionDeMarca,
  enumerar,
  exclusivesDe,
  generosDe,
  marcasDe,
  marcasPorPeso,
  galeriaDePiezas,
  marcasQueQuepan,
  saleDe,
  tiposDe,
} from './catalogo'

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
      tipo: 'polo',
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

  it('una colaboracion aporta sus DOS marcas a la lista', () => {
    const conColaboracion = [
      producto({ slug: 'e', marca: ['Aimé Leon Dore', 'New Balance'] }),
    ]
    expect(marcasDe(conColaboracion)).toEqual([
      { valor: 'aime-leon-dore', etiqueta: 'Aimé Leon Dore' },
      { valor: 'new-balance', etiqueta: 'New Balance' },
    ])
  })

  it('la marca que solo aparece en una colaboracion no se repite si tambien va sola', () => {
    const catalogo = [
      producto({ slug: 'a', marca: 'New Balance' }),
      producto({ slug: 'b', marca: ['Aimé Leon Dore', 'New Balance'] }),
    ]
    expect(marcasDe(catalogo).map((m) => m.valor)).toEqual(['aime-leon-dore', 'new-balance'])
  })

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
      producto({ slug: 'a', tipo: 'polo' }),
      producto({ slug: 'b', tipo: 'buzo' }),
      producto({ slug: 'c', tipo: 'hoodie' }),
      producto({ slug: 'd', tipo: 'buzo' }),
    ]
    expect(tiposDe(catalogo)).toEqual([
      { valor: 'buzo', etiqueta: 'Buzos' },
      { valor: 'hoodie', etiqueta: 'Hoodies' },
      { valor: 'polo', etiqueta: 'Polos' },
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

describe('marcasQueQuepan', () => {
  const componer = (lista: string) => `Ropa de ${lista}. Envío gratis.`

  it('si caben todas las nombra todas, con su "y"', () => {
    expect(marcasQueQuepan(['Lacoste', 'Dime'], componer, 160)).toBe('Ropa de Lacoste y Dime. Envío gratis.')
  })

  it('si no caben suelta las ultimas y cierra con "y más"', () => {
    const d = marcasQueQuepan(['Lacoste', 'Tommy Hilfiger', 'Aimé Leon Dore'], componer, 55)
    expect(d).toBe('Ropa de Lacoste, Tommy Hilfiger y más. Envío gratis.')
  })

  it('nunca se queda sin ninguna marca', () => {
    expect(marcasQueQuepan(['Maison Mihara Yasuhiro', 'Dime'], componer, 10))
      .toBe('Ropa de Maison Mihara Yasuhiro y más. Envío gratis.')
  })
})

describe('marcasPorPeso', () => {
  it('ordena por numero de prendas, y a igualdad por nombre', () => {
    const catalogo = [
      producto({ slug: 'a', marca: 'Tommy Hilfiger' }),
      producto({ slug: 'b', marca: 'Lacoste' }),
      producto({ slug: 'c', marca: 'Lacoste' }),
      producto({ slug: 'd', marca: 'Dime' }),
    ]
    expect(marcasPorPeso(catalogo, [])).toEqual(['Lacoste', 'Dime', 'Tommy Hilfiger'])
  })

  it('las mas buscadas van delante aunque tengan menos prendas', () => {
    const catalogo = [
      producto({ slug: 'a', marca: 'Dime' }),
      producto({ slug: 'b', marca: 'Dime' }),
      producto({ slug: 'c', marca: 'Eme Studios' }),
      producto({ slug: 'd', marca: 'Lacoste' }),
    ]
    expect(marcasPorPeso(catalogo, ['Eme Studios', 'Lacoste', 'Tommy Hilfiger']))
      .toEqual(['Eme Studios', 'Lacoste', 'Dime'])
  })
})

describe('descripcionDeMarca: largo', () => {
  it('si ni sin cierre cabe, suelta los tipos antes que la propuesta', () => {
    const piezas = [producto({ slug: 'a', marca: 'Lacoste', tipo: 'buzo' })]
    const propuesta = 'x'.repeat(140)
    const d = descripcionDeMarca('Lacoste', propuesta, piezas, 'Cierre.')
    expect(d).toBe(`Lacoste en Colombia. ${propuesta}`)
  })
})

describe('descripcionDeMarca', () => {
  const piezas = [
    producto({ slug: 'a', marca: 'Lacoste', tipo: 'buzo' }),
    producto({ slug: 'b', marca: 'Lacoste', tipo: 'polo' }),
  ]
  const cierre = 'Envío gratis a toda Colombia en 10 a 15 días.'

  it('sin ficha nombra la marca, el pais y lo que hay de ella', () => {
    expect(descripcionDeMarca('Lacoste', undefined, piezas, cierre))
      .toBe('Lacoste en Colombia. Buzos y polos. Envío gratis a toda Colombia en 10 a 15 días.')
  })

  it('con ficha mete la propuesta despues del nombre', () => {
    expect(descripcionDeMarca('Lacoste', 'Tenis de pista llevado a la calle.', piezas, cierre))
      .toBe('Lacoste en Colombia. Tenis de pista llevado a la calle. Buzos y polos. Envío gratis a toda Colombia en 10 a 15 días.')
  })

  it('si no cabe en un resultado de busqueda suelta el cierre antes que la propuesta', () => {
    const larga = 'El Nueva York de los noventa hecho ropa de todos los días, sin gritar el logo.'
    const d = descripcionDeMarca('Aimé Leon Dore', larga, piezas, cierre)
    expect(d.length).toBeLessThanOrEqual(160)
    expect(d).toContain(larga)
    expect(d).not.toContain('Envío')
  })

  it('si el cierre largo no cabe prueba el corto antes de soltarlo', () => {
    const propuesta = 'Streetwear de Elche fabricado entre España y Portugal. Cortes sin género y drops que se agotan.'
    const d = descripcionDeMarca('Eme Studios', propuesta, [], cierre, 'Envío gratis a toda Colombia.')
    expect(d).toBe(`Eme Studios en Colombia. ${propuesta} Envío gratis a toda Colombia.`)
    expect(d.length).toBeLessThanOrEqual(160)
  })

  it('sin piezas ni ficha no promete prendas que no hay', () => {
    const d = descripcionDeMarca('Nike', undefined, [], cierre)
    expect(d).not.toContain('Envío')
    expect(d).toContain('Nike')
  })
})

describe('exclusivesDe y saleDe', () => {
  const catalogo = [
    producto({ slug: 'a' }),
    producto({ slug: 'b', precio: 70_000, precioAntes: 100_000 }),
    producto({ slug: 'c' }),
  ]

  it('exclusives son las prendas a precio completo, en su orden', () => {
    expect(exclusivesDe(catalogo).map((p) => p.slug)).toEqual(['a', 'c'])
  })

  it('sale son las rebajadas', () => {
    expect(saleDe(catalogo).map((p) => p.slug)).toEqual(['b'])
  })

  it('cada prenda esta en una sola seccion, y ninguna se queda fuera', () => {
    const repartidas = [...exclusivesDe(catalogo), ...saleDe(catalogo)].map((p) => p.slug).sort()
    expect(repartidas).toEqual(['a', 'b', 'c'])
  })

  it('sin rebajas, sale queda vacia', () => {
    expect(saleDe([producto({ slug: 'a' })])).toEqual([])
  })
})

describe('galeriaDePiezas', () => {
  const pieza = (slug: string, archivos: string[]) => {
    const p = producto({
      slug,
      marca: 'Lacoste',
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: archivos, disponible: true },
      ],
    })
    return { producto: p, variante: p.variantes[0]! }
  }

  it('una foto por prenda antes de repetir prenda', () => {
    const fotos = galeriaDePiezas([
      pieza('a', ['a-frente.jpg', 'a-espalda.jpg']),
      pieza('b', ['b-frente.jpg', 'b-espalda.jpg']),
    ])
    expect(fotos.map((f) => f.archivo)).toEqual([
      'a-frente.jpg',
      'b-frente.jpg',
      'a-espalda.jpg',
      'b-espalda.jpg',
    ])
  })

  it('de cada prenda van primero las fotos con modelo', () => {
    const fotos = galeriaDePiezas([
      pieza('a', ['a-frente.jpg', 'a-modelo.jpg']),
      pieza('b', ['b-frente.jpg']),
    ])
    expect(fotos[0]!.archivo).toBe('a-modelo.jpg')
  })

  it('no pasa del maximo', () => {
    const muchas = ['a', 'b', 'c', 'd'].map((s) => pieza(s, [`${s}-1.jpg`, `${s}-2.jpg`]))
    expect(galeriaDePiezas(muchas, 6)).toHaveLength(6)
  })

  it('con una sola foto no hay galeria', () => {
    expect(galeriaDePiezas([pieza('a', ['a.jpg'])])).toEqual([])
  })

  it('sin alt propio compone uno con marca, nombre y color', () => {
    const [foto] = galeriaDePiezas([pieza('a', ['a-1.jpg', 'a-2.jpg'])])
    expect(foto!.alt).toBe('Lacoste Prenda Negro')
  })
})
