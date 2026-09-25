import { describe, expect, it } from 'vitest'
import { descuento, enSale, validarCatalogo } from './schema'

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

describe('precio de sale', () => {
  it('sin precioAntes la prenda no esta en sale', () => {
    const p = producto({})
    expect(p.precioAntes).toBeUndefined()
    expect(enSale(p)).toBe(false)
  })

  it('con precioAntes mayor que el precio, esta en sale', () => {
    expect(enSale(producto({ precio: 70000, precioAntes: 100000 }))).toBe(true)
  })

  it('rechaza un precioAntes igual al precio: no es una rebaja', () => {
    expect(() => producto({ precio: 100000, precioAntes: 100000 })).toThrow(/precioAntes/)
  })

  it('rechaza un precioAntes menor que el precio: seria una subida', () => {
    expect(() => producto({ precio: 100000, precioAntes: 90000 })).toThrow(/precioAntes/)
  })

  it('rechaza un precioAntes con decimales', () => {
    expect(() => producto({ precio: 70000, precioAntes: 100000.5 })).toThrow(/precioAntes/)
  })
})

describe('descuento', () => {
  it('es el porcentaje rebajado, redondeado', () => {
    expect(descuento(producto({ precio: 70000, precioAntes: 100000 }))).toBe(30)
    expect(descuento(producto({ precio: 290000, precioAntes: 390000 }))).toBe(26)
  })

  it('nunca dice 0 %: una rebaja minima se anuncia como 1 %', () => {
    expect(descuento(producto({ precio: 389000, precioAntes: 390000 }))).toBe(1)
  })

  it('sin sale no hay descuento', () => {
    expect(descuento(producto({}))).toBeNull()
  })
})
