import { z } from 'zod'

export const CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Escala de tallas de la ropa de mujer, de la mas pequena a la mas grande.
 * Es el rango que maneja la tienda, no lo que hay de cada prenda: el campo
 * `tallas` de un producto declara solo las que se pueden pedir hoy, asi que
 * una prenda a la que le falte una talla la quita de esta lista.
 */
export const TALLAS_MUJER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

/** La misma escala para la ropa de hombre, que empieza una talla mas arriba. */
export const TALLAS_HOMBRE = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

/**
 * Una foto. Se acepta el nombre del archivo suelto o un objeto con `alt`
 * propio: el texto alternativo describe LA FOTO, no la prenda, asi que una
 * vista frontal y una de espalda no pueden compartirlo. Donde no se declara
 * se compone uno a partir de marca, nombre y color, que es mejor que repetir
 * el nombre del producto en cada imagen.
 *
 * `portada` elige que foto representa la prenda en la rejilla del catalogo.
 * Sin ella manda la primera, que es lo habitual; se declara cuando la que
 * mejor vende la prenda no es la que conviene abrir en la ficha, como una
 * espalda con el estampado grande.
 */
export const ImagenSchema = z
  .union([
    z.string().min(1),
    z.strictObject({
      archivo: z.string().min(1),
      alt: z.string().min(1, 'alt: no puede estar vacio si se declara'),
      portada: z.boolean().optional(),
    }),
  ])
  .transform((valor) =>
    typeof valor === 'string'
      ? { archivo: valor, alt: undefined, portada: undefined }
      : valor
  )

export type Imagen = z.infer<typeof ImagenSchema>

/**
 * Una variante es un color concreto de una prenda. Cada una tiene sus
 * propias fotos, su propia disponibilidad y su propia pagina, para que el
 * enlace que viaja en el mensaje de WhatsApp lleve al color exacto que el
 * cliente miraba y no a una ficha generica donde tenga que volver a elegir.
 */
export const VarianteSchema = z.strictObject({
  color: z.string().min(1, 'color: no puede estar vacio'),
  slug: z.string().regex(SLUG, 'variante.slug: solo minusculas, numeros y guiones'),
  imagenes: z.array(ImagenSchema).min(1, 'imagenes: al menos una'),
  disponible: z.boolean(),
})

export type Variante = z.infer<typeof VarianteSchema>

/**
 * Una talla. Se acepta el nombre suelto, que se da por disponible, o un
 * objeto que declara `disponible: false`: la talla agotada sigue apareciendo
 * en la ficha, tachada, porque el rango que cubre la prenda es informacion
 * util aunque hoy falte una talla intermedia.
 */
export const TallaSchema = z
  .union([
    z.string().min(1),
    z.strictObject({
      talla: z.string().min(1, 'talla: no puede estar vacia'),
      disponible: z.boolean(),
    }),
  ])
  .transform((valor) =>
    typeof valor === 'string' ? { talla: valor, disponible: true } : valor
  )

export type Talla = z.infer<typeof TallaSchema>

export const ProductoSchema = z.strictObject({
  slug: z.string().regex(SLUG, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  /** Opcional: no toda prenda de la tienda es de marca conocida. */
  marca: z.string().min(1, 'marca: no puede estar vacia si se declara').optional(),
  categoria: z.enum(CATEGORIAS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  tallas: z.array(TallaSchema).min(1, 'tallas: al menos una'),
  descripcion: z.string().min(1, 'descripcion: no puede estar vacia'),
  variantes: z.array(VarianteSchema).min(1, 'variantes: al menos un color'),
  destacado: z.boolean(),
})

export type Producto = z.infer<typeof ProductoSchema>

/**
 * Valida el catalogo entero. Lanza con un mensaje que identifica el
 * producto y el campo culpable: este error aparece en consola durante
 * el build, y quien lo lea puede no haber escrito nunca este codigo.
 */
export function validarCatalogo(datos: unknown[]): Producto[] {
  const productos = datos.map((dato, indice) => {
    const resultado = ProductoSchema.safeParse(dato)
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((i) => `    - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
        .join('\n')
      throw new Error(`Producto #${indice} invalido:\n${detalles}`)
    }
    return resultado.data
  })

  for (const producto of productos) {
    const colores = new Set<string>()
    for (const v of producto.variantes) {
      if (colores.has(v.slug)) {
        throw new Error(`Producto "${producto.slug}": color duplicado "${v.slug}".`)
      }
      colores.add(v.slug)
    }
  }

  const vistos = new Set<string>()
  for (const producto of productos) {
    if (vistos.has(producto.slug)) {
      throw new Error(`slug duplicado: "${producto.slug}". Cada producto necesita uno unico.`)
    }
    vistos.add(producto.slug)
  }

  return productos
}
