import type { ImageMetadata } from 'astro'
import { crearResolvedorImagenes } from './imagenes'

/**
 * Las fotos de campana de las marcas. Directorio propio y no el de productos:
 * el ratio es otro (3:2 horizontal, no 3:4 vertical) y el uso tambien, asi
 * que mezclarlas invitaria a colar una en el sitio equivocado.
 */
const mapa = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/marcas/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

export const resolverImagenMarca = crearResolvedorImagenes(mapa, 'src/assets/marcas/')
