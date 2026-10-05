import { z } from 'zod'
import { slugMarca } from '../lib/filtros'

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
 * `tallas` es opcional y, si se declara, MANDA sobre las de la prenda: hay
 * colores de los que queda una talla mientras del otro quedan dos, y con un
 * solo campo por prenda la ficha del negro y la del blanco mentirian a la vez.
 */
export const VarianteSchema = z.strictObject({
  color: z.string().min(1, 'color: no puede estar vacio'),
  slug: z.string().regex(SLUG, 'variante.slug: solo minusculas, numeros y guiones'),
  imagenes: z.array(ImagenSchema).min(1, 'imagenes: al menos una'),
  disponible: z.boolean(),
  tallas: z.array(TallaSchema).min(1, 'variante.tallas: al menos una si se declara').optional(),
  /**
   * Opcionales y, si se declaran, MANDAN sobre los de la prenda: el mismo
   * criterio que `tallas`. Hay colores que se rebajan mientras el otro sigue
   * a precio normal, y solo ese color entra en /sale.
   */
  precio: z.number().int('variante.precio: debe ser entero').positive().optional(),
  precioAnterior: z.number().int('variante.precioAnterior: debe ser entero').positive().optional(),
})

export type Variante = z.infer<typeof VarianteSchema>

export const ProductoSchema = z.strictObject({
  slug: z.string().regex(SLUG, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  /**
   * Opcional: no toda prenda de la tienda es de marca conocida.
   *
   * Una colaboracion se declara con la lista de sus marcas, la que firma
   * primero delante: la prenda sale en la pagina de las dos, se ve como
   * "Aimé Leon Dore × New Balance", y la ficha estructurada nombra solo a la
   * primera, que es la que la vende.
   */
  marca: z
    .union([
      z.string().min(1, 'marca: no puede estar vacia si se declara'),
      z.array(z.string().min(1)).min(2, 'marca: una colaboracion son al menos dos marcas'),
    ])
    .optional(),
  categoria: z.enum(CATEGORIAS),
  /**
   * Otros generos en cuyo catalogo tambien sale la prenda. Una prenda de corte
   * sin genero se declara en una categoria -- la que manda en las migas y en
   * la tarjeta -- y aparece ademas en la rejilla de la otra.
   */
  tambienEn: z.array(z.enum(GENEROS)).min(1).optional(),
  tipo: z.enum(TIPOS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  /**
   * Precio de antes de la rebaja. Declararlo es lo que mete la prenda en
   * /sale y pinta el precio tachado con el descuento: no hay otro interruptor
   * que mantener aparte y que pueda contradecirlo.
   */
  precioAnterior: z
    .number()
    .int('precioAnterior: debe ser entero')
    .positive('precioAnterior: debe ser positivo')
    .optional(),
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
    for (const v of producto.variantes) {
      const precio = precioDe(producto, v)
      const antes = precioAnteriorDe(producto, v)
      if (antes !== undefined && antes <= precio) {
        throw new Error(
          `Producto "${producto.slug}", color "${v.slug}": precioAnterior (${antes}) tiene que ser ` +
            `mayor que precio (${precio}). Si ya no esta rebajada, borra precioAnterior.`
        )
      }
    }
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

/** Las tallas de un color: las suyas si las declara, si no las de la prenda. */
export function tallasDe(producto: Producto, variante: Variante): Talla[] {
  return variante.tallas ?? producto.tallas
}

/** El precio de un color: el suyo si lo declara, si no el de la prenda. */
export function precioDe(producto: Producto, variante: Variante): number {
  return variante.precio ?? producto.precio
}

/**
 * El precio de antes de un color rebajado. Si el color declara su propio
 * precio, la rebaja tambien tiene que ser suya: heredar el precioAnterior de
 * la prenda pintaria un descuento que nadie decidio.
 */
export function precioAnteriorDe(producto: Producto, variante: Variante): number | undefined {
  if (variante.precioAnterior !== undefined) return variante.precioAnterior
  return variante.precio === undefined ? producto.precioAnterior : undefined
}

/** Las tallas que hoy se pueden pedir. Las agotadas siguen en la ficha, tachadas. */
export function tallasDisponibles(producto: Producto, variante: Variante): Talla[] {
  return tallasDe(producto, variante).filter((talla) => talla.disponible)
}

/** Las marcas de una prenda como lista: una, varias si es colaboracion, o ninguna. */
export function marcasDeProducto(producto: Producto): string[] {
  if (!producto.marca) return []
  return typeof producto.marca === 'string' ? [producto.marca] : producto.marca
}

/**
 * Como se nombra la marca de una prenda a la vista: "Lacoste", o
 * "Aimé Leon Dore × New Balance" en una colaboracion. Es la forma en que las
 * propias marcas firman sus colaboraciones, y la que se busca.
 */
export function nombreMarca(producto: Producto): string | undefined {
  const lista = marcasDeProducto(producto)
  return lista.length ? lista.join(' × ') : undefined
}

/**
 * Los generos en cuyo catalogo sale la prenda: el de su categoria y los de
 * `tambienEn`. Calzado y accesorios no tienen genero propio.
 */
export function generosDeProducto(producto: Producto): Genero[] {
  const propio = generoDe(producto.categoria)
  return [...new Set([...(propio ? [propio] : []), ...(producto.tambienEn ?? [])])]
}

/**
 * Una marca del archivo. El slug no se declara: sale del nombre.
 *
 * `ficha` es el relato de la marca. Sin ella la marca tiene pagina igual, y
 * la pagina dice que la ficha esta en camino.
 */
export const FichaMarcaSchema = z.strictObject({
  /**
   * Como la escribe quien la busca, si no es el nombre: "Polo Ralph Lauren".
   * Solo va al titulo y a la descripcion para el buscador; en la pagina manda
   * el nombre de la marca.
   */
  nombreBusqueda: z.string().min(1).optional(),
  pais: z.string().min(1, 'ficha.pais: no puede estar vacio'),
  /** Opcional: de algunas marcas se cuenta el pais y basta. */
  ciudad: z.string().min(1).optional(),
  fundacion: z.number().int().min(1800).max(2100),
  fundadores: z.array(z.string().min(1)).min(1, 'ficha.fundadores: al menos uno'),
  /** Una frase. Se lee bajo los datos, en el archivo y en el buscador. */
  propuesta: z.string().min(1, 'ficha.propuesta: no puede estar vacia'),
  /** Remate del titulo para el buscador: "Lacoste en Colombia: <lema>". */
  lema: z.string().min(1).optional(),
  /** Los parrafos de "Por que trajimos <marca> a Colombia". */
  texto: z.array(z.string().min(1)).min(1, 'ficha.texto: al menos un parrafo'),
})

export const ImagenMarcaSchema = z.strictObject({
  archivo: z.string().min(1),
  alt: z.string().min(1, 'alt: no puede estar vacio'),
})

export const MarcaSchema = z.strictObject({
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  ficha: FichaMarcaSchema.optional(),
  portada: ImagenMarcaSchema.extend({
    /** Ruta en public/. La foto queda de poster y para quien pide menos movimiento. */
    video: z.string().startsWith('/').optional(),
  }).optional(),
  /** SVG en blanco en src/assets/marcas/: sustituye al nombre sobre la portada. */
  logo: z.string().min(1).optional(),
  galeria: z.array(ImagenMarcaSchema).min(2, 'galeria: al menos dos fotos').optional(),
})

export type FichaMarca = z.infer<typeof FichaMarcaSchema>
export type Marca = z.infer<typeof MarcaSchema> & { slug: string }

/** Valida el archivo de marcas. Mismo criterio que el catalogo: falla en el build. */
export function validarMarcas(datos: unknown[]): Marca[] {
  const vistas = new Set<string>()
  return datos.map((dato, indice) => {
    const resultado = MarcaSchema.safeParse(dato)
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((i) => `    - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
        .join('\n')
      throw new Error(`Marca #${indice} invalida:\n${detalles}`)
    }
    const slug = slugMarca(resultado.data.nombre)
    if (vistas.has(slug)) {
      throw new Error(`Marca repetida en el archivo: "${resultado.data.nombre}".`)
    }
    vistas.add(slug)
    return { ...resultado.data, slug }
  })
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
export function ultimaTalla(producto: Producto, variante: Variante): Talla | null {
  const quedan = tallasDisponibles(producto, variante)
  return quedan.length === 1 ? quedan[0]! : null
}
