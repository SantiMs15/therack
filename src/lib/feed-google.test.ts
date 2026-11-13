import { describe, it, expect } from 'vitest'
import { validarCatalogo, type Producto } from '../data/schema'
import { escaparXml, feedGoogle, idDe, itemsFeed } from './feed-google'

const SITIO = 'https://therackstore.shop'

function catalogo(campos: Record<string, unknown> = {}): Producto[] {
  return validarCatalogo([
    {
      slug: 'chaqueta-puffer',
      nombre: 'Puffer Jacket',
      marca: 'Tommy Hilfiger',
      categoria: 'hombre',
      tipo: 'chaqueta',
      precio: 390_000,
      tallas: ['S', { talla: 'M', disponible: false }],
      descripcion: 'Chaqueta acolchada & ligera.',
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['a.jpg', 'b.jpg'], disponible: true },
      ],
      destacado: true,
      ...campos,
    },
  ])
}

const imagenesDe = () => [`${SITIO}/a.jpg`, `${SITIO}/b.jpg`]
const items = (campos?: Record<string, unknown>) =>
  itemsFeed({ productos: catalogo(campos), sitio: SITIO, imagenesDe })

describe('itemsFeed', () => {
  it('un articulo por talla de cada color, agrupados por prenda', () => {
    const lista = items()
    expect(lista.map((i) => i['g:id'])).toEqual(['chaqueta-puffer-negro-s', 'chaqueta-puffer-negro-m'])
    expect(lista.every((i) => i['g:item_group_id'] === 'chaqueta-puffer')).toBe(true)
  })

  it('la talla agotada va como out_of_stock', () => {
    const [s, m] = items()
    expect(s!['g:availability']).toBe('in_stock')
    expect(m!['g:availability']).toBe('out_of_stock')
  })

  it('un color agotado deja todas sus tallas sin stock', () => {
    const lista = items({
      variantes: [{ color: 'Negro', slug: 'negro', imagenes: ['a.jpg'], disponible: false }],
    })
    expect(lista.every((i) => i['g:availability'] === 'out_of_stock')).toBe(true)
  })

  it('precio con moneda, y sin sale_price fuera de rebaja', () => {
    const [s] = items()
    expect(s!['g:price']).toBe('390000.00 COP')
    expect(s!['g:sale_price']).toBeUndefined()
  })

  it('en rebaja: price es el de antes y sale_price el de ahora', () => {
    const [s] = items({ precio: 300_000, precioAnterior: 390_000 })
    expect(s!['g:price']).toBe('390000.00 COP')
    expect(s!['g:sale_price']).toBe('300000.00 COP')
  })

  it('enlaza la ficha del color y separa la foto principal de las demas', () => {
    const [s] = items()
    expect(s!['g:link']).toBe(`${SITIO}/producto/chaqueta-puffer/negro/`)
    expect(s!['g:image_link']).toBe(`${SITIO}/a.jpg`)
    expect(s!['g:additional_image_link']).toEqual([`${SITIO}/b.jpg`])
  })

  it('titulo con marca, nombre y color; marca, genero y edad', () => {
    const [s] = items()
    expect(s!['g:title']).toBe('Tommy Hilfiger Puffer Jacket - Negro')
    expect(s!['g:brand']).toBe('Tommy Hilfiger')
    expect(s!['g:gender']).toBe('male')
    expect(s!['g:age_group']).toBe('adult')
    expect(s!['g:condition']).toBe('new')
  })

  it('accesorios y prendas de los dos catalogos van como unisex', () => {
    expect(items({ categoria: 'accesorios', tipo: 'bolso' })[0]!['g:gender']).toBe('unisex')
    expect(items({ tambienEn: ['mujer'] })[0]!['g:gender']).toBe('unisex')
  })

  it('sin marca no declara brand', () => {
    expect(items({ marca: undefined })[0]!['g:brand']).toBeUndefined()
  })

  it('la talla con tilde da un id ascii', () => {
    const [u] = items({ categoria: 'accesorios', tipo: 'bolso', tallas: ['Única'] })
    expect(u!['g:id']).toBe('chaqueta-puffer-negro-unica')
    expect(u!['g:size']).toBe('Única')
  })
})

describe('idDe', () => {
  it('un slug largo no hace chocar las tallas: siguen siendo distintas y caben en 50', () => {
    const [p] = catalogo({ slug: 'karl-lagerfeld-floating-chest-karl-graphic-tee' })
    const v = p!.variantes[0]!
    const ids = ['S', 'M', 'L', 'XL'].map((t) => idDe(p!, v, t))
    expect(new Set(ids).size).toBe(4)
    expect(ids.every((id) => id.length <= 50)).toBe(true)
  })

  it('es el mismo en cada build', () => {
    const [p] = catalogo({ slug: 'karl-lagerfeld-floating-chest-karl-graphic-tee' })
    expect(idDe(p!, p!.variantes[0]!, 'M')).toBe(idDe(p!, p!.variantes[0]!, 'M'))
  })
})

describe('feedGoogle', () => {
  const xml = feedGoogle({ productos: catalogo(), sitio: SITIO, imagenesDe })

  it('es RSS 2.0 con el espacio de nombres de Google', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">')
  })

  it('escapa el texto: un & no rompe el XML', () => {
    expect(xml).toContain('Chaqueta acolchada &amp; ligera.')
    expect(xml).not.toContain('acolchada & ligera')
  })

  it('declara envio gratis a Colombia en cada articulo', () => {
    expect(xml.match(/<g:shipping>/g)).toHaveLength(2)
    expect(xml).toContain('<g:price>0.00 COP</g:price>')
    expect(xml).toContain('<g:country>CO</g:country>')
  })
})

describe('escaparXml', () => {
  it('escapa los cinco caracteres reservados', () => {
    expect(escaparXml(`<a & "b" 'c'>`)).toBe('&lt;a &amp; &quot;b&quot; &apos;c&apos;&gt;')
  })
})
