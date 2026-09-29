import { describe, it, expect } from 'vitest'
import { MARCAS_CLASICAS, MARCAS_QUE_PRESENTAMOS } from './tienda'
import { marcaIndexable } from '../lib/archivo-marcas'
import { slugMarca } from '../lib/filtros'

describe('texto de /tienda/', () => {
  it('solo enlaza marcas con pagina indexable', () => {
    // Si una marca se queda sin piezas ni ficha, su pagina pasa a noindex y
    // el enlace desde quienes somos llevaria a una pagina vacia.
    for (const marca of [...MARCAS_QUE_PRESENTAMOS, ...MARCAS_CLASICAS]) {
      expect(marcaIndexable(slugMarca(marca)), marca).toBe(true)
    }
  })
})
