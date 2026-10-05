import { describe, it, expect } from 'vitest'
import {
  validarCatalogo,
  ProductoSchema,
  CATEGORIAS,
  TIPOS,
  generoDe,
  precioAnteriorDe,
  precioDe,
  tallasDisponibles,
  ultimaTalla,
} from './schema'

const valido = {
  slug: 'blazer-lino-negro',
  nombre: 'Blazer de lino',
  categoria: 'mujer',
  tipo: 'sweater',
  precio: 189000,
  tallas: ['S', 'M', 'L'],
  descripcion: 'Corte recto, forro interior.',
  variantes: [
    { color: 'Negro', slug: 'negro', imagenes: ['blazer-lino-negro-1.jpg'], disponible: true },
  ],
  destacado: true,
}

describe('ProductoSchema', () => {
  it('acepta un producto completo', () => {
    expect(ProductoSchema.safeParse(valido).success).toBe(true)
  })

  it('expone exactamente las cuatro categorias del spec', () => {
    expect([...CATEGORIAS]).toEqual(['mujer', 'hombre', 'calzado', 'accesorios'])
  })

  it('expone los tipos en orden alfabetico, que es como se pintan', () => {
    expect([...TIPOS]).toEqual([...TIPOS].sort())
  })
})

describe('generoDe', () => {
  it('mujer y hombre son genero', () => {
    expect(generoDe('mujer')).toBe('mujer')
    expect(generoDe('hombre')).toBe('hombre')
  })

  it('calzado y accesorios no lo son: son clase de producto', () => {
    expect(generoDe('calzado')).toBeNull()
    expect(generoDe('accesorios')).toBeNull()
  })
})

describe('validarCatalogo', () => {
  it('devuelve los productos cuando todos son validos', () => {
    expect(validarCatalogo([valido])).toHaveLength(1)
  })

  it('rompe si falta el precio', () => {
    const { precio, ...sinPrecio } = valido
    expect(() => validarCatalogo([sinPrecio])).toThrow(/precio/i)
  })

  it('rompe si falta el tipo de prenda', () => {
    const { tipo, ...sinTipo } = valido
    expect(() => validarCatalogo([sinTipo])).toThrow(/tipo/i)
  })

  it('rompe si el tipo no es uno de los declarados', () => {
    expect(() => validarCatalogo([{ ...valido, tipo: 'gabardina' }])).toThrow(/tipo/i)
  })

  it('rompe si la categoria no es una de las cuatro', () => {
    expect(() => validarCatalogo([{ ...valido, categoria: 'juguetes' }]))
      .toThrow(/categoria/i)
  })

  it('rompe si el precio no es entero positivo', () => {
    expect(() => validarCatalogo([{ ...valido, precio: -5 }])).toThrow(/precio/i)
  })

  it('rompe si una variante no tiene imagenes', () => {
    const sinFotos = { ...valido, variantes: [{ ...valido.variantes[0], imagenes: [] }] }
    expect(() => validarCatalogo([sinFotos])).toThrow(/imagenes/i)
  })

  it('acepta un producto sin marca', () => {
    const { marca, ...sinMarca } = { ...valido, marca: 'Lacoste' }
    expect(() => validarCatalogo([sinMarca])).not.toThrow()
  })

  it('rompe si la marca se declara vacia', () => {
    expect(() => validarCatalogo([{ ...valido, marca: '' }])).toThrow(/marca/i)
  })

  it('rompe si el producto no tiene ninguna variante', () => {
    expect(() => validarCatalogo([{ ...valido, variantes: [] }])).toThrow(/variantes/i)
  })

  it('rompe si dos variantes del mismo producto comparten color', () => {
    const repetido = {
      ...valido,
      variantes: [valido.variantes[0], { ...valido.variantes[0] }],
    }
    expect(() => validarCatalogo([repetido])).toThrow(/color duplicado/i)
  })

  it('rompe si el producto no tiene tallas', () => {
    expect(() => validarCatalogo([{ ...valido, tallas: [] }])).toThrow(/tallas/i)
  })

  it('rompe si el slug tiene mayusculas o espacios', () => {
    expect(() => validarCatalogo([{ ...valido, slug: 'Blazer Lino' }])).toThrow(/slug/i)
  })

  it('rompe si el producto trae una clave desconocida', () => {
    expect(() => validarCatalogo([{ ...valido, colores: ['negro'] }])).toThrow()
  })

  it('rompe si dos productos comparten slug', () => {
    expect(() => validarCatalogo([valido, { ...valido, nombre: 'Otro' }]))
      .toThrow(/duplicado/i)
  })

  it('identifica que producto es el invalido', () => {
    expect(() => validarCatalogo([valido, { ...valido, slug: 'otro', precio: 'gratis' }]))
      .toThrow(/#1/)
  })
})

describe('ultimaTalla', () => {
  const conTallas = (tallas: unknown[]) => validarCatalogo([{ ...valido, tallas }])[0]!
  // La cuenta es por color: sin `tallas` propias, el color usa las de la prenda.
  const ultima = (producto: ReturnType<typeof conTallas>) => ultimaTalla(producto, producto.variantes[0]!)

  it('devuelve la talla cuando solo queda una', () => {
    expect(ultima(conTallas(['S']))?.talla).toBe('S')
  })

  it('la cuenta es de tallas DISPONIBLES, no de tallas declaradas', () => {
    // La escala entera a la vista, pero solo la M se puede pedir.
    const producto = conTallas([
      { talla: 'S', disponible: false },
      'M',
      { talla: 'L', disponible: false },
    ])
    expect(ultima(producto)?.talla).toBe('M')
  })

  it('no avisa si quedan dos o mas', () => {
    expect(ultima(conTallas(['S', 'M']))).toBeNull()
    expect(ultima(conTallas([{ talla: 'S', disponible: false }, 'M', 'L']))).toBeNull()
  })

  it('sin ninguna disponible no es ultima talla, es agotado', () => {
    const agotado = conTallas([
      { talla: 'S', disponible: false },
      { talla: 'M', disponible: false },
    ])
    expect(ultima(agotado)).toBeNull()
  })
})

describe('tallasDisponibles', () => {
  it('deja fuera las agotadas y conserva el orden declarado', () => {
    const producto = validarCatalogo([
      { ...valido, tallas: ['S', { talla: 'M', disponible: false }, 'L'] },
    ])[0]!
    expect(tallasDisponibles(producto, producto.variantes[0]!).map((t) => t.talla)).toEqual(['S', 'L'])
  })
})

describe('precio por color', () => {
  const dosColores = (blanco: object, extra: object = {}) =>
    validarCatalogo([
      {
        ...valido,
        ...extra,
        variantes: [
          valido.variantes[0],
          { ...valido.variantes[0], color: 'Blanco', slug: 'blanco', ...blanco },
        ],
      },
    ])[0]!

  it('sin precio propio, el color usa el de la prenda', () => {
    const p = dosColores({})
    expect(precioDe(p, p.variantes[1]!)).toBe(189000)
  })

  it('el precio del color manda sobre el de la prenda', () => {
    const p = dosColores({ precio: 150000, precioAnterior: 189000 })
    expect(precioDe(p, p.variantes[0]!)).toBe(189000)
    expect(precioDe(p, p.variantes[1]!)).toBe(150000)
    expect(precioAnteriorDe(p, p.variantes[0]!)).toBeUndefined()
    expect(precioAnteriorDe(p, p.variantes[1]!)).toBe(189000)
  })

  it('un color con precio propio no hereda la rebaja de la prenda', () => {
    const p = dosColores({ precio: 150000 }, { precioAnterior: 250000 })
    expect(precioAnteriorDe(p, p.variantes[0]!)).toBe(250000)
    expect(precioAnteriorDe(p, p.variantes[1]!)).toBeUndefined()
  })

  it('rompe si la rebaja de un color no baja el precio', () => {
    expect(() => dosColores({ precio: 200000, precioAnterior: 189000 })).toThrow(/blanco/)
  })
})
