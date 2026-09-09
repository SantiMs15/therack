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
