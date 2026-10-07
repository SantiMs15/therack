import type { ImageMetadata } from 'astro'
import { crearResolvedorImagenes } from './imagenes'

const mapa = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/productos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

export const resolverImagen = crearResolvedorImagenes(mapa)

const mapaMarcas = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/marcas/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

/** Fotos de portada y de galeria del archivo de marcas. */
export const resolverImagenMarca = crearResolvedorImagenes(mapaMarcas, 'src/assets/marcas/')

/**
 * Los logos, como URL y no como imagen: son SVG que se pintan tal cual en un
 * <img>, sin pasar por la optimizacion. Pesan poco, asi que Vite los incrusta
 * en el HTML en vez de servirlos aparte.
 */
const logos = import.meta.glob<string>('/src/assets/marcas/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function urlLogo(nombre: string): string {
  const url = logos[`/src/assets/marcas/${nombre}`]
  if (!url) throw new Error(`Logo no encontrado: "${nombre}". Colocalo en src/assets/marcas/.`)
  return url
}
