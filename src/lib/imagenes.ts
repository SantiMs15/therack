import type { ImageMetadata } from 'astro'

type ModuloImagen = { default: ImageMetadata }

/**
 * Construye un resolvedor que traduce el nombre de archivo declarado en
 * productos.ts a los metadatos que necesita <Image />.
 *
 * Recibe el mapa por parametro en lugar de leerlo directamente para que
 * sea probable sin archivos en disco.
 */
export function crearResolvedorImagenes(
  mapa: Record<string, ModuloImagen>,
  directorio = 'src/assets/productos/'
) {
  const porNombre = new Map<string, ImageMetadata>()
  for (const [ruta, modulo] of Object.entries(mapa)) {
    const nombre = ruta.split('/').pop()
    if (nombre) porNombre.set(nombre, modulo.default)
  }

  return function resolverImagen(nombre: string): ImageMetadata {
    const imagen = porNombre.get(nombre)
    if (!imagen) {
      const disponibles = [...porNombre.keys()].join(', ') || '(ninguna)'
      throw new Error(
        `Imagen no encontrada: "${nombre}".\n` +
          `  Colocala en ${directorio} con ese nombre exacto.\n` +
          `  Disponibles ahora mismo: ${disponibles}`
      )
    }
    return imagen
  }
}

/**
 * Construye un resolvedor de logos: el mismo mapa por nombre de archivo, pero
 * devuelve null en vez de lanzar.
 *
 * La diferencia con `crearResolvedorImagenes` no es de forma, es de contrato.
 * Una foto que falta es un error: alguien la nombro en productos.ts y no esta.
 * Un logo que falta es lo normal -- son veinticinco marcas y los SVG llegan de
 * uno en uno -- y la pagina ya sabe presentarse sin el: pinta el nombre en
 * texto, que es lo que hacia antes de que hubiera logos.
 *
 * La clave es el slug, no el nombre completo: el archivo se llama
 * `aime-leon-dore.svg` porque asi cae solo en su pagina sin tener que
 * escribirlo en ninguna lista.
 */
export function crearResolvedorLogos(mapa: Record<string, string>) {
  const porSlug = new Map<string, string>()
  for (const [ruta, url] of Object.entries(mapa)) {
    const nombre = ruta.split('/').pop()
    if (nombre?.endsWith('.svg')) porSlug.set(nombre.slice(0, -'.svg'.length), url)
  }

  return function resolverLogo(slug: string): string | null {
    return porSlug.get(slug) ?? null
  }
}
