import { z } from 'zod'
import { MARCAS } from './marcas'
import { slugMarca } from '../lib/filtros'

/**
 * LA FICHA DE UNA MARCA: lo que se cuenta de ella antes de venderle nada a
 * nadie.
 *
 * Es opcional. Una marca sin ficha no tiene pagina y sus enlaces siguen
 * llevando al filtro de la portada, que es como funcionaba todo hasta ahora.
 * Escribir las veinticinco antes de publicar habria dejado el archivo
 * esperando indefinidamente.
 *
 * Los campos son fijos y todos obligatorios: asi las paginas se leen igual y
 * no hay marcas contadas a medias. El build falla nombrando la marca y el
 * campo, que es la misma promesa que hace el catalogo.
 */
export const FichaMarcaSchema = z.strictObject({
  pais: z.string().min(1, 'pais: no puede estar vacio'),
  anio: z
    .number()
    .int('anio: debe ser entero')
    .gte(1800, 'anio: fuera de rango')
    .lte(2100, 'anio: fuera de rango'),
  fundador: z.string().min(1, 'fundador: no puede estar vacio'),
  /**
   * Que propone la marca, en una linea. Hace dos trabajos: es el gancho de la
   * pagina y es su meta description. Se escribe una vez para que no puedan
   * acabar diciendo cosas distintas.
   */
  propuesta: z
    .string()
    .min(1, 'propuesta: no puede estar vacia')
    .max(160, 'propuesta: maximo 160 caracteres, que es lo que muestra el buscador'),
  /** Por que la trajimos. Un elemento por parrafo. */
  porQue: z
    .array(z.string().min(1, 'porQue: ningun parrafo puede estar vacio'))
    .min(1, 'porQue: al menos un parrafo'),
  /** Archivo en src/assets/marcas/, en ratio 3:2 horizontal. */
  imagen: z.string().min(1, 'imagen: no puede estar vacia'),
  alt: z.string().min(1, 'alt: no puede estar vacio'),
})

export type FichaMarca = z.infer<typeof FichaMarcaSchema>

/**
 * Valida el archivo entero.
 *
 * Recibe la lista de marcas por parametro, y no la importa, para poder
 * probarse sin arrastrar las veinticinco de verdad.
 *
 * La comprobacion que no es obvia es la del slug: una clave mal escrita
 * generaria una pagina que nada enlaza y que nadie descubriria hasta que
 * alguien contara las URLs del sitemap. Se compara contra `slugMarca` del
 * nombre, no contra el nombre, porque es el slug lo que viaja en la URL.
 */
export function validarFichas(
  datos: Record<string, unknown>,
  marcas: readonly string[]
): Record<string, FichaMarca> {
  const slugs = new Set(marcas.map(slugMarca))
  const fichas: Record<string, FichaMarca> = {}

  for (const [slug, dato] of Object.entries(datos)) {
    if (!slugs.has(slug)) {
      throw new Error(
        `Ficha de marca "${slug}": no hay ninguna marca con ese slug en marcas.ts.\n` +
          `  O la marca falta en MARCAS, o el slug esta mal escrito.`
      )
    }

    const resultado = FichaMarcaSchema.safeParse(dato)
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((i) => `    - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
        .join('\n')
      throw new Error(`Ficha de marca "${slug}" invalida:\n${detalles}`)
    }

    fichas[slug] = resultado.data
  }

  return fichas
}

/**
 * FUENTE DE VERDAD DEL ARCHIVO.
 *
 * Para anadir una marca al archivo: deja su foto en src/assets/marcas/ en
 * ratio 3:2 y anade una entrada aqui, con el slug de la marca por clave.
 */
const archivo: Record<string, unknown> = {}

export const FICHAS = validarFichas(archivo, MARCAS)
