import { z } from 'zod'

export const CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Una variante es un color concreto de una prenda. Cada una tiene sus
 * propias fotos, su propia disponibilidad y su propia pagina, para que el
 * enlace que viaja en el mensaje de WhatsApp lleve al color exacto que el
 * cliente miraba y no a una ficha generica donde tenga que volver a elegir.
 */
export const VarianteSchema = z.strictObject({
  color: z.string().min(1, 'color: no puede estar vacio'),
  slug: z.string().regex(SLUG, 'variante.slug: solo minusculas, numeros y guiones'),
  imagenes: z.array(z.string().min(1)).min(1, 'imagenes: al menos una'),
  disponible: z.boolean(),
})

export type Variante = z.infer<typeof VarianteSchema>

export const ProductoSchema = z.strictObject({
  slug: z.string().regex(SLUG, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  /** Opcional: no toda prenda de la tienda es de marca conocida. */
  marca: z.string().min(1, 'marca: no puede estar vacia si se declara').optional(),
  categoria: z.enum(CATEGORIAS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  tallas: z.array(z.string().min(1)).min(1, 'tallas: al menos una'),
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
