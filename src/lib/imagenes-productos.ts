import type { ImageMetadata } from 'astro'
import { crearResolvedorImagenes } from './imagenes'

const mapa = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/productos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

export const resolverImagen = crearResolvedorImagenes(mapa)
