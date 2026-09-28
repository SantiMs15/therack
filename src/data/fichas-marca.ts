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
  /**
   * Video de la portada, en public/videos/. Opcional: se reproduce mudo y en
   * bucle detras del logo, y `imagen` queda como su poster y como la foto de
   * quien pide menos movimiento.
   */
  video: z.string().min(1, 'video: no puede estar vacio').optional(),
  /**
   * Fotos de la galeria que va junto al texto. Opcional: sin ella la pagina
   * se queda como estaba. De 2 a 6 porque es un acordeon -- con una sola no
   * hay nada que abrir, y con mas de 6 las cerradas se quedan en rayas.
   */
  galeria: z
    .array(
      z.strictObject({
        /** Archivo en src/assets/marcas/, como `imagen`. */
        imagen: z.string().min(1, 'imagen: no puede estar vacia'),
        alt: z.string().min(1, 'alt: no puede estar vacio'),
      })
    )
    .min(2, 'galeria: al menos 2 fotos')
    .max(6, 'galeria: maximo 6 fotos')
    .optional(),
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
const archivo: Record<string, unknown> = {
  'aime-leon-dore': {
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    porQue: [
      'Teddy Santis creció en Queens y montó la marca sin venir de la moda: abrió una tienda en el Lower East Side y se puso a vestir a la gente que ya conocía. Esa es toda la historia, y se nota en la ropa.',
      'La trajimos porque resuelve algo que en Colombia falta: prendas que se ven caras sin gritar el logo. Un polo de punto, una sudadera de peso, una gorra con la M de Mets bordada pequeña. Se ponen un lunes.',
    ],
    // PROVISIONAL: silueta urbana generada, no es material de la marca.
    // Reemplazar por la campana real antes de publicar.
    imagen: 'placeholder-ciudad.jpg',
    alt: 'Siluetas de edificios de una ciudad en blanco y negro',
  },
  'eme-studios': {
    pais: 'España',
    anio: 2017,
    fundador: 'Conra Martínez y Gabriel Morón',
    propuesta: 'Streetwear de Elche fabricado entre España y Portugal. Cortes sin género y drops que se agotan.',
    porQue: [
      'Conra Martínez y Gabriel Morón la montaron en Elche en 2017. No tenían tienda ni distribuidor: vendían por redes y sacaban algo nuevo cada dos semanas. La primera tienda física, en Madrid, llegó siete años después. Su lema, Always Grateful, va para la gente que les compró desde el principio.',
      'Se puede decir que abrió una tendencia, y hoy muchas marcas se miran en ella. La trajimos porque toma cortes que ya estaban encasillados para cierto público y los rejuvenece.',
    ],
    // Primer fotograma del video: es lo que se ve mientras carga.
    imagen: 'eme-studios-portada.jpg',
    alt: 'Un avión cruza un cielo azul dejando dos estelas',
    video: 'eme-studios-portada.mp4',
    galeria: [
      { imagen: 'eme-studios-galeria-01.jpg', alt: 'Chico con rastas, cárdigan de rayas azules y verdes y camiseta gris de Eme Studios, delante de una estantería de libros' },
      { imagen: 'eme-studios-galeria-02.jpg', alt: 'Dos personas de espaldas caminan de noche por Madrid; una lleva una chaqueta negra con Emestudios Madrid Always Grateful' },
      { imagen: 'eme-studios-galeria-03.jpg', alt: 'Chica rubia con chaqueta de chándal blanca y granate de Eme Studios y pantalón cargo marrón, en un salón con discos' },
      { imagen: 'eme-studios-galeria-04.jpg', alt: 'Pareja con pantalones de paracaídas rojos contra una pared azul y amarilla' },
      { imagen: 'eme-studios-galeria-05.jpg', alt: 'Chica de espaldas con un jersey azul marino con Studios tejido en granate y blanco' },
    ],
  },
}

export const FICHAS = validarFichas(archivo, MARCAS)
