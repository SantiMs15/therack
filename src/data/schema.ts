import { z } from 'zod'

export const CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Como se nombra cada categoria a la vista. Vive aqui y no en la pagina que
 * la pinta porque ahora la usan tres: el titulo de /catalogo/<categoria>, las
 * migas de esa pagina y las de cada ficha. Escrita tres veces, tarde o
 * temprano una se queda vieja.
 */
export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  mujer: 'Mujer',
  hombre: 'Hombre',
  calzado: 'Calzado',
  accesorios: 'Accesorios',
}

/**
 * Genero al que se dirige la prenda. No es un campo: sale de `categoria`.
 * Las cuatro categorias del sitio mezclan dos ejes, genero (mujer, hombre) y
 * clase de producto (calzado, accesorios), asi que solo las dos primeras
 * responden a esta pregunta y las otras dos devuelven null. Duplicar el dato
 * en un campo propio abriria la puerta a que se contradijeran.
 */
export const GENEROS = ['mujer', 'hombre'] as const
export type Genero = (typeof GENEROS)[number]

export const ETIQUETAS_GENERO: Record<Genero, string> = {
  mujer: 'Mujer',
  hombre: 'Hombre',
}

export function generoDe(categoria: Categoria): Genero | null {
  return categoria === 'mujer' || categoria === 'hombre' ? categoria : null
}

/**
 * Clase de prenda. Es lo que el cliente pide por su nombre cuando entra
 * buscando algo concreto: "un hoodie", "una camiseta". Va en orden
 * alfabetico porque es el orden en que se pinta el desplegable.
 *
 * Anadir un tipo aqui obliga a declararlo en cada producto: el build falla
 * si una prenda se queda sin el, que es preferible a una prenda que no
 * aparece en ningun filtro.
 */
export const TIPOS = ['buzo', 'camiseta', 'chaqueta', 'hoodie', 'polo', 'sweater'] as const
export type Tipo = (typeof TIPOS)[number]

/** En plural: el desplegable nombra grupos de prendas, no una prenda. */
export const ETIQUETAS_TIPO: Record<Tipo, string> = {
  buzo: 'Buzos',
  camiseta: 'Camisetas',
  chaqueta: 'Chaquetas',
  hoodie: 'Hoodies',
  polo: 'Polos',
  sweater: 'Suéteres',
}

/**
 * En singular, para nombrar UNA prenda: es lo que abre el titulo de la ficha
 * en los resultados de busqueda. Un cliente en Bogota escribe "chaqueta tommy
 * hilfiger", no el nombre de catalogo del fabricante, y hasta ahora ninguno
 * de los diez titulos llevaba esa palabra.
 */
export const ETIQUETAS_TIPO_UNA: Record<Tipo, string> = {
  buzo: 'Buzo',
  camiseta: 'Camiseta',
  chaqueta: 'Chaqueta',
  hoodie: 'Hoodie',
  polo: 'Polo',
  sweater: 'Suéter',
}

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

/**
 * De quien es una prenda. Se escribe como texto -- `marca: 'Lacoste'` -- y
 * como lista cuando es una colaboracion: `marca: ['Aimé Leon Dore', 'New
 * Balance']`.
 *
 * Un solo campo para las dos formas, y no una `marca` mas una
 * `colaboracion`: serian dos sitios donde mirar para responder la misma
 * pregunta, y el dia que alguien rellene solo uno la prenda desaparece de
 * media tienda.
 *
 * El orden de la lista es el que se escribe, y es el que se ve: la primera
 * manda donde solo cabe una (el reparto de la rejilla, el escalon de las
 * migas).
 */
const MarcaSchema = z.union([
  z.string().min(1, 'marca: no puede estar vacia si se declara'),
  z
    .array(z.string().min(1, 'marca: ninguna marca de la lista puede estar vacia'))
    .min(1, 'marca: la lista no puede estar vacia'),
])

const ProductoBase = z.strictObject({
  slug: z.string().regex(SLUG, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  /** Opcional: no toda prenda de la tienda es de marca conocida. */
  marca: MarcaSchema.optional(),
  categoria: z.enum(CATEGORIAS),
  tipo: z.enum(TIPOS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  tallas: z.array(TallaSchema).min(1, 'tallas: al menos una'),
  descripcion: z.string().min(1, 'descripcion: no puede estar vacia'),
  variantes: z.array(VarianteSchema).min(1, 'variantes: al menos un color'),
  destacado: z.boolean(),
})

/**
 * Fuera del validador, una prenda ya no tiene `marca`: tiene `marcas`, una
 * lista, vacia si no es de marca conocida. Asi nadie tiene que preguntarse si
 * lo que recibe es un texto, una lista o nada -- se recorre y ya.
 *
 * OJO: una lista vacia es `truthy` en JavaScript. Para saber si la prenda
 * tiene marca se mira `marcas.length`, nunca `if (producto.marcas)`.
 */
export const ProductoSchema = ProductoBase.transform(({ marca, ...resto }) => ({
  ...resto,
  marcas: marca === undefined ? [] : typeof marca === 'string' ? [marca] : marca,
}))

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

/** Las tallas que hoy se pueden pedir. Las agotadas siguen en la ficha, tachadas. */
export function tallasDisponibles(producto: Producto): Talla[] {
  return producto.tallas.filter((talla) => talla.disponible)
}

/**
 * Queda UNA sola talla, y cual. Es lo que enciende el aviso en burdeos de la
 * rejilla y de la ficha.
 *
 * Devuelve la talla y no un booleano porque quien avisa suele querer decir
 * cual es, y calcularlo dos veces invita a que las dos cuentas se separen.
 *
 * Cero tallas disponibles no es "ultima talla" sino agotado, que la ficha ya
 * resuelve por su cuenta con `variante.disponible`.
 */
export function ultimaTalla(producto: Producto): Talla | null {
  const quedan = tallasDisponibles(producto)
  return quedan.length === 1 ? quedan[0]! : null
}
