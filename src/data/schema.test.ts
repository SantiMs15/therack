import { describe, expect, it } from 'vitest'
import { validarCatalogo } from './schema'

/**
 * La forma minima que acepta el validador. Cada test cambia solo lo que
 * mira, para que se lea que es lo que esta probando.
 */
function producto(campos: Record<string, unknown>) {
  return validarCatalogo([
    {
      slug: 'prenda',
      nombre: 'Prenda',
      categoria: 'hombre',
      tipo: 'camiseta',
      precio: 100000,
      tallas: ['M'],
      descripcion: 'Una prenda.',
      variantes: [{ color: 'Negro', slug: 'negro', imagenes: ['a.jpg'], disponible: true }],
      destacado: false,
      ...campos,
    },
  ])[0]!
}

describe('marcas de un producto', () => {
  it('una marca suelta se guarda como lista de una', () => {
    expect(producto({ marca: 'Lacoste' }).marcas).toEqual(['Lacoste'])
  })

  it('una colaboracion guarda las dos marcas, en el orden escrito', () => {
    expect(producto({ marca: ['Aimé Leon Dore', 'New Balance'] }).marcas).toEqual([
      'Aimé Leon Dore',
      'New Balance',
    ])
  })

  it('sin marca la lista queda vacia, no null: quien la lee siempre puede recorrerla', () => {
    expect(producto({}).marcas).toEqual([])
  })

  it('no queda rastro del campo `marca` en el producto validado', () => {
    expect('marca' in producto({ marca: 'Lacoste' })).toBe(false)
  })

  it('rechaza la lista vacia: declarar marca y no dar ninguna es un descuido', () => {
    expect(() => producto({ marca: [] })).toThrow(/marca/)
  })

  it('rechaza una marca vacia dentro de la lista', () => {
    expect(() => producto({ marca: ['Lacoste', ''] })).toThrow(/marca/)
  })
})
