/**
 * La tarjeta que se pinta al compartir una ficha: la foto de portada entera,
 * centrada sobre un fondo de su propio color, en 1200x630.
 *
 * Es la proporcion que recortan WhatsApp, Instagram y X. Con la foto
 * vertical recortada a ella se veia una franja del pecho de la prenda, sin
 * cuello ni bajo. Entera y con el hueco relleno del color que domina la foto
 * -- el gris claro del estudio en la mayoria --, la tarjeta se lee como una
 * sola imagen y no como una foto con bandas.
 *
 * Se genera en el build, una por color, y sale como un .jpg mas de dist/.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { productos } from '../../../data/productos'
import type { Producto, Variante } from '../../../data/schema'

export const getStaticPaths = (() =>
  productos.flatMap((producto) =>
    producto.variantes.map((variante) => ({
      params: { slug: producto.slug, color: variante.slug },
      props: { producto, variante },
    }))
  )) satisfies GetStaticPaths

const ANCHO = 1200
const ALTO = 630

export const GET: APIRoute = async ({ props }) => {
  const { variante } = props as { producto: Producto; variante: Variante }
  // La misma foto que abre la prenda en la rejilla.
  const portada =
    variante.imagenes.find((foto) => foto.portada) ?? variante.imagenes[0]!
  // Desde la raiz del proyecto y no relativo a este archivo: en el build el
  // modulo se ejecuta desde dist/, donde las fotos originales no estan.
  const original = await readFile(join(process.cwd(), 'src/assets/productos', portada.archivo))

  const { dominant } = await sharp(original).stats()
  const tarjeta = await sharp(original)
    .resize(ANCHO, ALTO, { fit: 'contain', background: dominant })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  return new Response(new Uint8Array(tarjeta), { headers: { 'Content-Type': 'image/jpeg' } })
}
