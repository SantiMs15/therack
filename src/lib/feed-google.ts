/**
 * El feed de productos para Google Merchant Center, en RSS 2.0 con el espacio
 * de nombres g:.
 *
 * Merchant no lee las paginas HTML: pide un archivo con una entrada por cada
 * cosa que se puede comprar. Aqui eso es una talla de un color: Google trata
 * cada combinacion como un articulo propio, y las une en una sola prenda con
 * item_group_id, que es el slug del producto.
 *
 * Vive aqui y no en el endpoint para poder probarlo sin build: igual que la
 * ficha estructurada, son datos que van a un tercero y nadie ve hasta que los
 * rechaza.
 */
import {
  ETIQUETAS_CATEGORIA,
  ETIQUETAS_TIPO,
  generosDeProducto,
  marcasDeProducto,
  nombreMarca,
  precioAnteriorDe,
  precioDe,
  tallasDe,
  type Producto,
  type Variante,
} from '../data/schema'
import { CONFIG, VENTA } from '../config'

export interface OpcionesFeed {
  productos: readonly Producto[]
  /** Raiz del sitio, absoluta. */
  sitio: string | URL
  /** Fotos de una variante, absolutas y con la portada primero. */
  imagenesDe: (producto: Producto, variante: Variante) => string[]
}

/** Escapa lo que romperia el XML: un "&" en una descripcion basta. */
export function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** "390000.00 COP": Google pide numero y moneda ISO en el mismo campo. */
function precio(valor: number): string {
  return `${valor.toFixed(2)} ${VENTA.moneda}`
}

/**
 * male, female o unisex. Accesorios y calzado no tienen genero en el sitio:
 * van como unisex, y lo mismo una prenda que esta en los dos catalogos.
 */
function generoGoogle(producto: Producto): 'male' | 'female' | 'unisex' {
  const generos = generosDeProducto(producto)
  if (generos.length !== 1) return 'unisex'
  return generos[0] === 'hombre' ? 'male' : 'female'
}

/**
 * Un id estable y unico: slug, color y talla. Google lo limita a 50
 * caracteres, y recortado a secas dos tallas de un slug largo acababan con
 * el mismo id: Merchant se queda con una y descarta la otra. Si no cabe, se
 * corta y se le cuelga un hash del id entero, que lo sigue haciendo unico y
 * no cambia entre builds.
 */
const MAXIMO_ID = 50

export function idDe(producto: Producto, variante: Variante, talla: string): string {
  const tallaSlug = talla
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  const completo = `${producto.slug}-${variante.slug}-${tallaSlug}`
  if (completo.length <= MAXIMO_ID) return completo
  const huella = fnv1a(completo)
  return `${completo.slice(0, MAXIMO_ID - huella.length - 1)}-${huella}`
}

/** FNV-1a de 32 bits en hexadecimal: corto, determinista y sin dependencias. */
function fnv1a(texto: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export interface ItemFeed {
  [campo: string]: string | string[]
}

export function itemsFeed({ productos, sitio, imagenesDe }: OpcionesFeed): ItemFeed[] {
  return productos.flatMap((producto) => {
    const marca = marcasDeProducto(producto)
    return producto.variantes.flatMap((variante) => {
      const imagenes = imagenesDe(producto, variante)
      const link = new URL(`/producto/${producto.slug}/${variante.slug}/`, sitio).href
      const actual = precioDe(producto, variante)
      const anterior = precioAnteriorDe(producto, variante)
      const titulo = [nombreMarca(producto), producto.nombre].filter(Boolean).join(' ')

      return tallasDe(producto, variante).map(({ talla, disponible }) => {
        const item: ItemFeed = {
          'g:id': idDe(producto, variante, talla),
          'g:item_group_id': producto.slug,
          'g:title': `${titulo} - ${variante.color}`.slice(0, 150),
          'g:description': producto.descripcion,
          'g:link': link,
          'g:image_link': imagenes[0]!,
          'g:availability': variante.disponible && disponible ? 'in_stock' : 'out_of_stock',
          // En rebaja, price es el de antes y sale_price el de ahora: asi es
          // como Google pinta el tachado.
          'g:price': precio(anterior ?? actual),
          'g:condition': 'new',
          'g:color': variante.color,
          'g:size': talla,
          'g:gender': generoGoogle(producto),
          'g:age_group': 'adult',
          'g:product_type': `${ETIQUETAS_CATEGORIA[producto.categoria]} > ${ETIQUETAS_TIPO[producto.tipo]}`,
          // No hay GTIN ni referencia del fabricante para estas piezas.
          'g:identifier_exists': 'no',
        }
        if (imagenes.length > 1) item['g:additional_image_link'] = imagenes.slice(1, 11)
        if (anterior !== undefined) item['g:sale_price'] = precio(actual)
        if (marca.length > 0) item['g:brand'] = marca[0]!
        return item
      })
    })
  })
}

/** El envio va dentro de cada item: es gratis y a todo el pais. */
function envioXml(): string {
  return [
    '      <g:shipping>',
    `        <g:country>${VENTA.pais}</g:country>`,
    `        <g:price>${precio(VENTA.envio.costo)}</g:price>`,
    `        <g:min_transit_time>${VENTA.entrega.minimo}</g:min_transit_time>`,
    `        <g:max_transit_time>${VENTA.entrega.maximo}</g:max_transit_time>`,
    '      </g:shipping>',
  ].join('\n')
}

export function feedGoogle(opciones: OpcionesFeed): string {
  const items = itemsFeed(opciones).map((item) => {
    const campos = Object.entries(item).flatMap(([campo, valor]) =>
      (Array.isArray(valor) ? valor : [valor]).map(
        (v) => `      <${campo}>${escaparXml(v)}</${campo}>`
      )
    )
    return ['    <item>', ...campos, envioXml(), '    </item>'].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    `    <title>${escaparXml(CONFIG.nombre)}</title>`,
    `    <link>${new URL('/', opciones.sitio).href}</link>`,
    `    <description>${escaparXml(`Catálogo de ${CONFIG.nombre}`)}</description>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
