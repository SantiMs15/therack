import { describe, it, expect } from 'vitest'
import { validarCatalogo, type Producto, type Variante } from '../data/schema'
import { CONFIG, INSTAGRAM_URL, VENTA } from '../config'
import {
  fichaArchivo,
  fichaCategoria,
  fichaGrupo,
  fichaMarca,
  fichaMigas,
  fichaProducto,
  fichaSitio,
  fichaTienda,
  serializar,
} from './datos-estructurados'

function catalogo(campos: Record<string, unknown> = {}): Producto {
  return validarCatalogo([
    {
      slug: 'chaqueta-puffer',
      nombre: 'Puffer Jacket',
      marca: 'Tommy Hilfiger',
      categoria: 'hombre',
      tipo: 'chaqueta',
      precio: 390_000,
      tallas: ['S'],
      descripcion: 'Chaqueta acolchada.',
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['x.jpg'], disponible: true },
      ],
      destacado: true,
      ...campos,
    },
  ])[0]!
}

const URL_FICHA = 'https://therackstore.shop/producto/chaqueta-puffer/negro/'
const FOTOS = ['https://therackstore.shop/_astro/x.webp']

function ficha(producto: Producto, variante?: Variante) {
  return fichaProducto({
    producto,
    variante: variante ?? producto.variantes[0]!,
    url: URL_FICHA,
    imagenes: FOTOS,
  })
}

describe('fichaProducto', () => {
  it('declara un Product con nombre, color y fotos', () => {
    const f = ficha(catalogo()) as any
    expect(f['@context']).toBe('https://schema.org')
    expect(f['@type']).toBe('Product')
    expect(f.name).toBe('Puffer Jacket - Negro')
    expect(f.color).toBe('Negro')
    expect(f.image).toEqual(FOTOS)
  })

  it('el sku identifica la pieza, no el modelo', () => {
    // Dos colores del mismo producto son dos piezas distintas y no pueden
    // compartir identificador.
    const p = catalogo({
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['a.jpg'], disponible: true },
        { color: 'Verde', slug: 'verde', imagenes: ['b.jpg'], disponible: true },
      ],
    })
    const a = ficha(p, p.variantes[0]) as any
    const b = ficha(p, p.variantes[1]) as any
    expect(a.sku).toBe('chaqueta-puffer-negro')
    expect(b.sku).toBe('chaqueta-puffer-verde')
    expect(a.sku).not.toBe(b.sku)
  })

  it('declara la marca cuando la hay', () => {
    expect((ficha(catalogo()) as any).brand)
      .toEqual({ '@type': 'Brand', name: 'Tommy Hilfiger' })
  })

  it('una colaboracion declara solo la marca principal, la primera escrita', () => {
    const f = ficha(catalogo({ marca: ['Aimé Leon Dore', 'New Balance'] })) as any
    expect(f.brand).toEqual({ '@type': 'Brand', name: 'Aimé Leon Dore' })
  })

  it('brand es siempre un objeto, nunca una lista', () => {
    // Una lista de dos Brand es lo que Google marca como campo duplicado.
    expect(Array.isArray((ficha(catalogo()) as any).brand)).toBe(false)
    const colab = ficha(catalogo({ marca: ['Aimé Leon Dore', 'New Balance'] })) as any
    expect(Array.isArray(colab.brand)).toBe(false)
  })

  it('omite brand del todo cuando la prenda no tiene marca', () => {
    // `marca` es opcional en el catalogo. Un brand vacio o nulo es peor que
    // ninguno: Google lo lee como campo mal declarado.
    const f = ficha(catalogo({ marca: undefined })) as any
    expect('brand' in f).toBe(false)
  })

  it('size lista solo lo que se puede pedir', () => {
    const p = catalogo({ tallas: ['S', { talla: 'M', disponible: false }, 'L'] })
    expect((ficha(p) as any).size).toEqual(['S', 'L'])
  })

  describe('disponibilidad', () => {
    it('en stock cuando la variante esta y queda talla', () => {
      expect((ficha(catalogo()) as any).offers.availability)
        .toBe('https://schema.org/InStock')
    })

    it('agotado cuando la variante no esta', () => {
      const p = catalogo({
        variantes: [{ color: 'Negro', slug: 'negro', imagenes: ['x.jpg'], disponible: false }],
      })
      expect((ficha(p) as any).offers.availability)
        .toBe('https://schema.org/OutOfStock')
    })

    it('agotado cuando la variante esta pero no queda ninguna talla', () => {
      const p = catalogo({ tallas: [{ talla: 'S', disponible: false }] })
      expect((ficha(p) as any).offers.availability)
        .toBe('https://schema.org/OutOfStock')
    })
  })

  describe('oferta', () => {
    const o = () => (ficha(catalogo()) as any).offers

    it('lleva precio, moneda y la URL canonica de la ficha', () => {
      expect(o().price).toBe(390_000)
      expect(o().priceCurrency).toBe('COP')
      expect(o().url).toBe(URL_FICHA)
    })

    it('una prenda rebajada declara el precio de antes como tachado', () => {
      const oferta = (ficha(catalogo({ precio: 195_000, precioAntes: 390_000 })) as any).offers
      expect(oferta.price).toBe(195_000)
      expect(oferta.priceSpecification).toEqual({
        '@type': 'UnitPriceSpecification',
        priceType: 'https://schema.org/StrikethroughPrice',
        price: 390_000,
        priceCurrency: 'COP',
      })
    })

    it('una prenda a precio completo no declara precio tachado', () => {
      expect(o()).not.toHaveProperty('priceSpecification')
    })

    it('declara la ropa como nueva', () => {
      expect(o().itemCondition).toBe('https://schema.org/NewCondition')
    })

    it('declara envio gratis a Colombia', () => {
      expect(o().shippingDetails.shippingRate.value).toBe(0)
      expect(o().shippingDetails.shippingRate.currency).toBe('COP')
      expect(o().shippingDetails.shippingDestination.addressCountry).toBe('CO')
    })

    it('declara cambios a 30 dias, no devolucion del dinero', () => {
      const d = o().hasMerchantReturnPolicy
      expect(d.merchantReturnDays).toBe(VENTA.cambios.dias)
      expect(d.returnPolicyCategory)
        .toBe('https://schema.org/MerchantReturnFiniteReturnWindow')
      expect(d.refundType).toBe('https://schema.org/ExchangeRefund')
      expect(d.applicableCountry).toBe('CO')
    })

    it('el cambio va por mensajeria y el envio lo paga el cliente', () => {
      const d = o().hasMerchantReturnPolicy
      expect(d.returnMethod).toBe('https://schema.org/ReturnByMail')
      expect(d.returnFees).toBe('https://schema.org/ReturnFeesCustomerResponsibility')
    })

    it('declara el plazo de entrega completo en transitTime', () => {
      const t = o().shippingDetails.deliveryTime.transitTime
      expect(t.minValue).toBe(VENTA.entrega.minimo)
      expect(t.maxValue).toBe(VENTA.entrega.maximo)
      expect(t.unitCode).toBe('DAY')
      expect(t.minValue).toBeLessThanOrEqual(t.maxValue)
    })

    it('declara el pago por transferencia con el vocabulario de GoodRelations', () => {
      expect(o().acceptedPaymentMethod).toBe(VENTA.pago.schema)
      expect(o().acceptedPaymentMethod).toMatch(/goodrelations/)
    })

    it('nombra a la tienda como vendedor', () => {
      expect(o().seller).toEqual({ '@type': 'Organization', name: CONFIG.nombre })
    })
  })

  it('no deja ningun campo en undefined: JSON.stringify los borraria en silencio', () => {
    const f = ficha(catalogo())
    expect(JSON.stringify(f)).not.toContain('undefined')
    const recorrer = (o: unknown): void => {
      if (o && typeof o === 'object') {
        for (const v of Object.values(o)) {
          expect(v).not.toBeUndefined()
          recorrer(v)
        }
      }
    }
    recorrer(f)
  })
})

describe('fichaGrupo', () => {
  const p = () =>
    catalogo({
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['a.jpg'], disponible: true },
        { color: 'Verde', slug: 'verde', imagenes: ['b.jpg'], disponible: true },
      ],
    })
  const grupo = (i = 0) => {
    const prod = p()
    return fichaGrupo({
      producto: prod,
      variante: prod.variantes[i]!,
      url: `https://therackstore.shop/producto/chaqueta-puffer/${prod.variantes[i]!.slug}/`,
      imagenes: FOTOS,
    }) as any
  }

  it('declara un ProductGroup que varia por color', () => {
    const g = grupo()
    expect(g['@context']).toBe('https://schema.org')
    expect(g['@type']).toBe('ProductGroup')
    expect(g.name).toBe('Puffer Jacket')
    expect(g.productGroupID).toBe('chaqueta-puffer')
    expect(g.variesBy).toEqual(['https://schema.org/color'])
    expect(g.brand).toEqual({ '@type': 'Brand', name: 'Tommy Hilfiger' })
  })

  it('lista todos los colores, en el orden del catalogo', () => {
    expect(grupo().hasVariant).toHaveLength(2)
  })

  it('la variante de la pagina va completa y apunta al grupo', () => {
    const v = grupo(1).hasVariant[1]
    expect(v['@type']).toBe('Product')
    expect(v.sku).toBe('chaqueta-puffer-verde')
    expect(v.inProductGroupWithID).toBe('chaqueta-puffer')
    expect(v.offers.url).toBe('https://therackstore.shop/producto/chaqueta-puffer/verde/')
    expect('@context' in v).toBe(false)
  })

  it('las otras variantes van solo con su URL absoluta', () => {
    expect(grupo(1).hasVariant[0]).toEqual({
      '@type': 'Product',
      url: 'https://therackstore.shop/producto/chaqueta-puffer/negro/',
    })
  })

  it('sin marca, el grupo tampoco declara brand', () => {
    const prod = catalogo({
      marca: undefined,
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['a.jpg'], disponible: true },
        { color: 'Verde', slug: 'verde', imagenes: ['b.jpg'], disponible: true },
      ],
    })
    const g = fichaGrupo({ producto: prod, variante: prod.variantes[0]!, url: URL_FICHA, imagenes: FOTOS })
    expect('brand' in g).toBe(false)
  })
})

describe('serializar', () => {
  it('devuelve JSON valido', () => {
    expect(JSON.parse(serializar(ficha(catalogo())))).toMatchObject({ '@type': 'Product' })
  })

  it('escapa el < para que un dato no pueda cerrar el <script>', () => {
    const p = catalogo({ descripcion: 'Rota la etiqueta </script><img onerror=x>' })
    const texto = serializar(ficha(p))
    expect(texto).not.toContain('</script>')
    expect(texto).toContain('\\u003c/script')
    // Y el dato sigue siendo el mismo al leerlo de vuelta.
    expect(JSON.parse(texto).description).toContain('</script>')
  })
})

describe('fichaTienda', () => {
  const t = () =>
    fichaTienda({
      url: 'https://therackstore.shop/',
      logo: 'https://therackstore.shop/og.png',
    }) as any

  it('es OnlineStore, no LocalBusiness: no hay local que poner en un mapa', () => {
    expect(t()['@type']).toBe('OnlineStore')
  })

  it('no declara ninguna direccion fisica', () => {
    const texto = JSON.stringify(t())
    expect(texto).not.toContain('address')
    expect(texto).not.toContain('geo')
    expect(texto).not.toContain('openingHours')
  })

  it('enlaza el Instagram, que es donde vive la tienda', () => {
    expect(t().sameAs).toContain(INSTAGRAM_URL)
  })

  it('declara Colombia como zona de venta y el pago en texto', () => {
    expect(t().areaServed).toEqual({ '@type': 'Country', name: 'Colombia' })
    expect(t().paymentAccepted).toBe(VENTA.pago.texto)
  })

  it('declara la misma politica de cambios que las fichas', () => {
    const d = t().hasMerchantReturnPolicy
    expect(d).toEqual((ficha(catalogo()) as any).offers.hasMerchantReturnPolicy)
    expect(d.merchantReturnDays).toBe(VENTA.cambios.dias)
  })

  it('da el telefono como punto de contacto', () => {
    expect(t().contactPoint.telephone).toBe(CONFIG.telefono)
  })
})

describe('fichaMigas', () => {
  const SITIO = 'https://therackstore.shop'
  const CAMINO = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Hombre', ruta: '/catalogo/hombre/' },
    { nombre: 'Puffer Jacket' },
  ]
  const migas = (camino = CAMINO) => fichaMigas(camino, SITIO) as any

  it('un escalon de varias marcas viaja al schema con UNA sola, la primera', () => {
    // El rastro que se ve puede ofrecer dos caminos de vuelta; un
    // BreadcrumbList no: cada posicion es un sitio, y declarar dos seria
    // decir que la prenda cuelga de los dos a la vez.
    const f = migas([
      { nombre: 'Inicio', ruta: '/' },
      {
        nombre: 'Aimé Leon Dore',
        ruta: '/marca/aime-leon-dore/',
        partes: [
          { nombre: 'Aimé Leon Dore', ruta: '/marca/aime-leon-dore/' },
          { nombre: 'New Balance', ruta: '/marca/new-balance/' },
        ],
      },
      { nombre: 'Geo Print Crewneck' },
    ])
    expect(f.itemListElement).toHaveLength(3)
    expect(f.itemListElement[1].name).toBe('Aimé Leon Dore')
    expect(f.itemListElement[1].item).toBe('https://therackstore.shop/marca/aime-leon-dore/')
    expect('partes' in f.itemListElement[1]).toBe(false)
  })

  it('declara un BreadcrumbList con un escalon por miga', () => {
    const f = migas()
    expect(f['@context']).toBe('https://schema.org')
    expect(f['@type']).toBe('BreadcrumbList')
    expect(f.itemListElement).toHaveLength(3)
  })

  it('numera desde uno y en orden', () => {
    const f = migas()
    expect(f.itemListElement.map((e: any) => e.position)).toEqual([1, 2, 3])
    expect(f.itemListElement.map((e: any) => e.name)).toEqual([
      'Inicio',
      'Hombre',
      'Puffer Jacket',
    ])
  })

  it('absolutiza la ruta contra el sitio: el schema no admite relativas', () => {
    const f = migas()
    expect(f.itemListElement[0].item).toBe('https://therackstore.shop/')
    expect(f.itemListElement[1].item).toBe('https://therackstore.shop/catalogo/hombre/')
  })

  it('el ultimo escalon va sin item: es la pagina donde ya se esta', () => {
    expect(migas().itemListElement[2]).not.toHaveProperty('item')
  })

  it('un camino de un solo escalon sigue siendo una lista valida', () => {
    expect(migas([{ nombre: 'Inicio' }]).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio' },
    ])
  })
})

describe('fichaCategoria', () => {
  const URLS = [
    'https://therackstore.shop/producto/a/negro/',
    'https://therackstore.shop/producto/b/verde/',
    'https://therackstore.shop/producto/c/crudo/',
  ]
  const cat = (urls: readonly string[] = URLS) =>
    fichaCategoria({
      nombre: 'Hombre',
      descripcion: 'Ropa de hombre de Lacoste y Tommy Hilfiger.',
      url: 'https://therackstore.shop/catalogo/hombre/',
      urls,
    }) as any

  it('declara un CollectionPage que envuelve un ItemList', () => {
    const f = cat()
    expect(f['@context']).toBe('https://schema.org')
    expect(f['@type']).toBe('CollectionPage')
    expect(f.name).toBe('Hombre')
    expect(f.url).toBe('https://therackstore.shop/catalogo/hombre/')
    expect(f.mainEntity['@type']).toBe('ItemList')
  })

  it('cuenta las fichas que lista', () => {
    expect(cat().mainEntity.numberOfItems).toBe(3)
    expect(cat([URLS[0]!]).mainEntity.numberOfItems).toBe(1)
  })

  it('numera desde uno y CONSERVA el orden recibido: es el que se ve', () => {
    const f = cat()
    expect(f.mainEntity.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, url: URLS[0] },
      { '@type': 'ListItem', position: 2, url: URLS[1] },
      { '@type': 'ListItem', position: 3, url: URLS[2] },
    ])
  })

  it('una categoria vacia da una lista vacia, no una ficha rota', () => {
    const f = cat([])
    expect(f.mainEntity.numberOfItems).toBe(0)
    expect(f.mainEntity.itemListElement).toEqual([])
  })
})

describe('fichaMarca', () => {
  const base = {
    nombre: 'Aimé Leon Dore',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    url: 'https://therackstore.shop/marca/aime-leon-dore/',
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    imagen: 'https://therackstore.shop/_astro/ald.jpg',
  }

  it('declara la marca como Brand dentro de la pagina', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha['@type']).toBe('CollectionPage')
    expect(ficha.about['@type']).toBe('Brand')
    expect(ficha.about.name).toBe('Aimé Leon Dore')
  })

  it('el ano de fundacion viaja como cadena, que es lo que pide schema.org', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.about.foundingDate).toBe('2014')
  })

  it('el fundador es una Person y el pais un Place', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.about.founder).toEqual({ '@type': 'Person', name: 'Teddy Santis' })
    expect(ficha.about.foundingLocation).toEqual({ '@type': 'Place', name: 'Estados Unidos' })
  })

  it('con varios fundadores declara una Person por cada uno', () => {
    const ficha = fichaMarca({ ...base, fundador: ['Conra Martínez', 'Gabriel Morón'], urls: [] }) as any
    expect(ficha.about.founder).toEqual([
      { '@type': 'Person', name: 'Conra Martínez' },
      { '@type': 'Person', name: 'Gabriel Morón' },
    ])
  })

  it('con ciudad el Place dice ciudad y pais', () => {
    const ficha = fichaMarca({ ...base, ciudad: 'Queens', urls: [] }) as any
    expect(ficha.about.foundingLocation.name).toBe('Queens, Estados Unidos')
  })

  it('lista las piezas en el orden en que se ven', () => {
    const urls = ['https://therackstore.shop/a/', 'https://therackstore.shop/b/']
    const ficha = fichaMarca({ ...base, urls }) as any
    expect(ficha.mainEntity.numberOfItems).toBe(2)
    expect(ficha.mainEntity.itemListElement.map((i: any) => i.url)).toEqual(urls)
    expect(ficha.mainEntity.itemListElement[0].position).toBe(1)
  })

  it('sin piezas no emite ItemList: una lista vacia declara un listado que no hay', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.mainEntity).toBeUndefined()
  })
})

describe('fichaArchivo', () => {
  it('lista las paginas de marca', () => {
    const urls = ['https://therackstore.shop/marca/represent/']
    const ficha = fichaArchivo({ url: 'https://therackstore.shop/marca/', urls }) as any
    expect(ficha['@type']).toBe('CollectionPage')
    expect(ficha.mainEntity.numberOfItems).toBe(1)
    expect(ficha.mainEntity.itemListElement[0].url).toBe(urls[0])
  })
})

describe('fichaSitio', () => {
  it('declara el WebSite con el nombre de la tienda y la URL de la portada', () => {
    const f = fichaSitio({ url: 'https://therackstore.shop/' }) as any
    expect(f['@type']).toBe('WebSite')
    expect(f.name).toBe(CONFIG.nombre)
    expect(f.url).toBe('https://therackstore.shop/')
    expect(f.alternateName).toContain('The Rack')
  })
})
