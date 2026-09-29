import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { productos } from './productos'
import { slugMarca } from '../lib/filtros'

describe('slugs del catalogo', () => {
  it('cada prenda empieza por su marca, como los nombres de las fotos', () => {
    // La URL es lo que se lee debajo del resultado de busqueda y en el
    // enlace pegado en un chat: quien no conoce la marca la lee ahi antes de
    // abrir. Una colaboracion lleva las dos, en el orden en que se escriben.
    for (const p of productos) {
      if (!p.marcas.length) continue
      const prefijo = p.marcas.map(slugMarca).join('-') + '-'
      expect(p.slug, p.nombre).toMatch(new RegExp(`^${prefijo}`))
    }
  })

  it('cada 301 del .htaccess lleva a una ficha que existe', () => {
    // Una redireccion a un slug que se volvio a cambiar deja el enlace viejo
    // en un 404, y nadie se entera.
    const htaccess = readFileSync(new URL('../../public/.htaccess', import.meta.url), 'utf8')
    const destinos = [...htaccess.matchAll(/RewriteRule \^producto\/[^( ]+\S* \/producto\/([a-z0-9-]+)\$1/g)]
      .map((m) => m[1])
    expect(destinos.length).toBeGreaterThan(0)
    const slugs = new Set(productos.map((p) => p.slug))
    for (const destino of destinos) expect(slugs.has(destino!), destino).toBe(true)
  })
})
