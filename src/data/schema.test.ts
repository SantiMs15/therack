import { describe, it, expect } from 'vitest'
import { validarCatalogo, ProductoSchema, CATEGORIAS } from './schema'

const valido = {
  slug: 'blazer-lino-negro',
  nombre: 'Blazer de lino',
  categoria: 'mujer',
  precio: 189000,
  tallas: ['S', 'M', 'L'],
  descripcion: 'Corte recto, forro interior.',
  imagenes: ['blazer-lino-negro-1.jpg'],
  destacado: true,
  disponible: true,
}

describe('ProductoSchema', () => {
  it('acepta un producto completo', () => {
    expect(ProductoSchema.safeParse(valido).success).toBe(true)
  })

  it('expone exactamente las cuatro categorias del spec', () => {
    expect([...CATEGORIAS]).toEqual(['mujer', 'hombre', 'calzado', 'accesorios'])
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

  it('rompe si la categoria no es una de las cuatro', () => {
    expect(() => validarCatalogo([{ ...valido, categoria: 'juguetes' }]))
      .toThrow(/categoria/i)
  })

  it('rompe si el precio no es entero positivo', () => {
    expect(() => validarCatalogo([{ ...valido, precio: -5 }])).toThrow(/precio/i)
  })

  it('rompe si el producto no tiene imagenes', () => {
    expect(() => validarCatalogo([{ ...valido, imagenes: [] }])).toThrow(/imagenes/i)
  })

  it('rompe si el producto no tiene tallas', () => {
    expect(() => validarCatalogo([{ ...valido, tallas: [] }])).toThrow(/tallas/i)
  })

  it('rompe si el slug tiene mayusculas o espacios', () => {
    expect(() => validarCatalogo([{ ...valido, slug: 'Blazer Lino' }])).toThrow(/slug/i)
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
