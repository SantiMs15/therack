/**
 * La foto de la tarjeta de cada ficha, en /tarjeta/<slug>/<color>.jpg.
 *
 * Se genera en el build, una por color, desde la foto ORIGINAL de
 * src/assets y no desde la copia optimizada: esa es WebP y viene recortada
 * al ancho de la ficha. La composicion vive en tarjeta-compartir.ts, que es
 * donde esta probada.
 */
import path from 'node:path'
import type { APIRoute } from 'astro'
import { productos } from '../../../data/productos'
import { componerTarjeta } from '../../../lib/tarjeta-compartir'

export function getStaticPaths() {
  return productos.flatMap((producto) =>
    producto.variantes.map((variante) => ({
      params: { slug: producto.slug, color: variante.slug },
      // La misma foto que abre la ficha y la rejilla: hay prendas que se
      // venden por la espalda.
      props: {
        archivo: (variante.imagenes.find((foto) => foto.portada) ?? variante.imagenes[0]!).archivo,
      },
    }))
  )
}

export const GET: APIRoute = async ({ props }) => {
  // El build corre desde la raiz del proyecto; import.meta.url no sirve aqui
  // porque tras empaquetar ya no apunta a src/.
  const original = path.join(process.cwd(), 'src', 'assets', 'productos', props.archivo as string)
  const jpeg = await componerTarjeta(original)
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } })
}
