/**
 * /feed-google.xml: el catalogo para Google Merchant Center.
 *
 * Merchant lo descarga por su cuenta cada dia (feed programado), asi que un
 * deploy basta para que los precios y el stock nuevos lleguen alli. El
 * contenido lo arma lib/feed-google.ts; aqui solo se resuelven las fotos, que
 * necesitan el build de Astro.
 */
import type { APIRoute } from 'astro'
import { getImage } from 'astro:assets'
import { productos } from '../data/productos'
import type { Producto, Variante } from '../data/schema'
import { feedGoogle } from '../lib/feed-google'
import { resolverImagen } from '../lib/imagenes-productos'

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Astro.site no esta definido: revisa el campo `site` en astro.config.mjs')
  }

  // JPEG y no WebP: Merchant acepta los dos, pero el JPEG es el que ningun
  // destino de Google rechaza. La portada primero, que es la que se anuncia.
  const fotos = new Map<string, string[]>()
  for (const producto of productos) {
    for (const variante of producto.variantes) {
      const ordenadas = [...variante.imagenes].sort(
        (a, b) => Number(Boolean(b.portada)) - Number(Boolean(a.portada))
      )
      const urls = await Promise.all(
        ordenadas.map(async (foto) => {
          const imagen = await getImage({ src: resolverImagen(foto.archivo), format: 'jpg' })
          return new URL(imagen.src, site).href
        })
      )
      fotos.set(`${producto.slug}/${variante.slug}`, urls)
    }
  }

  const xml = feedGoogle({
    productos,
    sitio: site,
    imagenesDe: (p: Producto, v: Variante) => fotos.get(`${p.slug}/${v.slug}`) ?? [],
  })
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
