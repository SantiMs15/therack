import { z } from 'zod'

export const CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const ProductoSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  categoria: z.enum(CATEGORIAS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  tallas: z.array(z.string().min(1)).min(1, 'tallas: al menos una'),
  descripcion: z.string().min(1, 'descripcion: no puede estar vacia'),
  imagenes: z.array(z.string().min(1)).min(1, 'imagenes: al menos una'),
  destacado: z.boolean(),
  disponible: z.boolean(),
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

  const vistos = new Set<string>()
  for (const producto of productos) {
    if (vistos.has(producto.slug)) {
      throw new Error(`slug duplicado: "${producto.slug}". Cada producto necesita uno unico.`)
    }
    vistos.add(producto.slug)
  }

  return productos
}
