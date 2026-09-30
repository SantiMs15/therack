/**
 * Opciones que se derivan del catalogo: que marcas, que generos y que tipos
 * de prenda hay realmente.
 *
 * Solo corre en el BUILD. Importa valores de `schema`, y con ellos zod, asi
 * que nada de esto puede acabar en un script del navegador: lo que el
 * cliente necesita esta en filtros.ts, que solo importa tipos.
 */
import {
  ETIQUETAS_GENERO,
  ETIQUETAS_TIPO,
  GENEROS,
  TIPOS,
  enSale,
  generoDe,
  type Genero,
  type Producto,
  type Tipo,
  type Variante,
} from '../data/schema'
import { ORDEN_POR_DEFECTO, ordenar, turnos } from './orden'
import { slugMarca, type Opcion } from './filtros'
import { MARCAS_MAS_BUSCADAS } from '../data/marcas'

/** Una tarjeta de la rejilla: una prenda en UN color. */
export interface Tarjeta {
  producto: Producto
  variante: Variante
  indice: number
  precio: number
  destacado: boolean
  genero: Genero | null
  tipo: Tipo
  /** Los slugs de sus marcas. Vacia si la prenda no es de marca conocida. */
  marcas: string[]
  turno: number
}

/**
 * Las tarjetas de una rejilla, en el orden en que se ven al entrar.
 *
 * Una tarjeta por COLOR, no por prenda: el cliente ve el negro y el verde
 * como dos piezas, que es como los mira en una tienda.
 *
 * Vive aqui, y no en el componente que las pinta, porque hay dos que
 * necesitan este orden exacto: la rejilla y el `ItemList` que declara esa
 * misma rejilla para el buscador. Calculado en dos sitios, el dia que cambie
 * el criterio uno de los dos se queda viejo -- y el que se queda viejo es el
 * que nadie ve, que es justo el que le estamos contando a Google.
 *
 * El `indice` cuenta tarjetas y sale del orden en que estan escritas en
 * productos.ts: es lo que ordena "Novedades" y lo que desempata el resto.
 * El `turno` es el reparto por marcas, para que la primera fila no sea toda
 * de la misma.
 */
export function tarjetasEnOrden(productos: readonly Producto[]): Tarjeta[] {
  const base = productos
    .flatMap((producto) => producto.variantes.map((variante) => ({ producto, variante })))
    .map((tarjeta, indice) => ({
      ...tarjeta,
      indice,
      precio: tarjeta.producto.precio,
      destacado: tarjeta.producto.destacado,
      genero: generoDe(tarjeta.producto.categorias[0]!),
      tipo: tarjeta.producto.tipo,
      marcas: tarjeta.producto.marcas.map(slugMarca),
    }))

  /* El reparto por marcas solo entiende de una: es una cola por marca, y una
     prenda no puede estar en dos colas sin salir dos veces en la rejilla. Se
     reparte por la PRIMERA, que es la que la prenda lleva delante. */
  const puestos = turnos(
    base.map((tarjeta) => ({ marca: tarjeta.marcas[0] ?? null, destacado: tarjeta.destacado }))
  )
  return ordenar(
    base.map((tarjeta, i) => ({ ...tarjeta, turno: puestos[i]! })),
    ORDEN_POR_DEFECTO
  )
}

/**
 * Las dos secciones del catalogo. Cada prenda esta en UNA: Exclusives es la
 * coleccion a precio completo y Sale la rebajada, sin repetir fotos entre
 * las dos. Lo decide `precioAntes` y nada mas.
 *
 * Las paginas de genero y de marca no pasan por aqui: muestran todo lo suyo,
 * y la prenda rebajada se reconoce alli por su precio tachado.
 */
export function exclusivesDe(productos: readonly Producto[]): Producto[] {
  return productos.filter((producto) => !enSale(producto))
}

export function saleDe(productos: readonly Producto[]): Producto[] {
  return productos.filter(enSale)
}

/**
 * Las marcas de un catalogo, sin repetir y en orden alfabetico. Alfabetico y
 * no por numero de prendas: el menu de la cabecera es una lista que se
 * recorre con la vista, y que una marca cambie de sitio porque entro una
 * prenda nueva la vuelve imposible de encontrar dos veces seguidas.
 */
export function marcasDe(productos: readonly Producto[]): Opcion[] {
  const porSlug = new Map<string, string>()
  for (const producto of productos) {
    // Todas las suyas: una colaboracion tiene que salir en el desplegable de
    // las dos marcas, no solo en el de la que lleva delante.
    for (const marca of producto.marcas) porSlug.set(slugMarca(marca), marca)
  }
  return [...porSlug]
    .map(([valor, etiqueta]) => ({ valor, etiqueta }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'))
}

/**
 * Los generos presentes en un catalogo, cada uno con su pagina.
 *
 * El genero NO se filtra en el navegador: cada uno tiene una pagina de
 * verdad, con su titulo y su descripcion, y mandar alli es mejor que esconder
 * tarjetas en la portada. El valor del genero coincide con el slug de su
 * categoria ('mujer', 'hombre'), asi que el enlace sale del propio valor.
 *
 * Se le pasa el catalogo ENTERO, no el de la pagina: en /catalogo/hombre solo
 * hay un genero presente, y aun asi el desplegable tiene que poder llevar a
 * mujer.
 */
export function generosDe(productos: readonly Producto[]): Opcion[] {
  const presentes = new Set<Genero>()
  for (const producto of productos) {
    for (const categoria of producto.categorias) {
      const genero = generoDe(categoria)
      if (genero) presentes.add(genero)
    }
  }
  // Se recorre GENEROS y no el Set para que el orden sea siempre el declarado
  // en el schema, no el de aparicion en el catalogo.
  return GENEROS.filter((genero) => presentes.has(genero)).map((genero) => ({
    valor: genero,
    etiqueta: ETIQUETAS_GENERO[genero],
    // Con barra final: es la forma canonica del sitio, y sin ella el servidor
    // redirige en cada clic.
    href: `/catalogo/${genero}/`,
  }))
}

/** Los tipos de prenda presentes, en el orden declarado en el schema. */
export function tiposDe(productos: readonly Producto[]): Opcion[] {
  const presentes = new Set<Tipo>(productos.map((producto) => producto.tipo))
  return TIPOS.filter((tipo) => presentes.has(tipo)).map((tipo) => ({
    valor: tipo,
    etiqueta: ETIQUETAS_TIPO[tipo],
  }))
}

/** "Lacoste, Tommy Hilfiger y Essentials". Con dos, solo la "y". */
export function enumerar(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

/**
 * La meta description de una pagina de catalogo.
 *
 * Cinco paginas compartian "Tienda de ropa en Bogota", 24 caracteres de los
 * ~155 que se ven en un resultado. Se compone del catalogo real, asi que
 * nombra las marcas y los tipos que hay de verdad en esa categoria y se
 * actualiza sola cuando entra una prenda de una marca nueva.
 *
 * `cierre` es la frase de condiciones de venta, que la pagina pasa desde la
 * configuracion: este modulo no tiene por que saber cuanto cuesta el envio.
 */
export function descripcionDeCategoria(
  productos: readonly Producto[],
  quienes: string,
  cierre: string
): string {
  const marcas = marcasPorPeso(productos)
  const tipos = tiposDe(productos).map((t) => t.etiqueta.toLowerCase())
  const resto = `${tipos.length ? ` ${capitalizar(enumerar(tipos))}.` : ''} ${cierre}`

  if (!marcas.length) return `Ropa de ${quienes}.${resto}`
  return marcasQueQuepan(marcas, (lista) => `Ropa de ${quienes} de ${lista}.${resto}`)
}

/**
 * Las marcas de un catalogo, en el orden en que las nombra una descripcion.
 *
 * Primero las de `prioridad` -- las que mas se buscan -- si hay prendas de
 * ellas; luego el resto, de la que mas prendas tiene a la que menos. Para
 * las descripciones, no para el menu: cuando no caben todas, las que se
 * nombran tienen que ser las que el que llega busca y va a encontrar de
 * verdad. A igualdad, alfabetico, para que el orden no dependa del de la
 * lista.
 */
export function marcasPorPeso(
  productos: readonly Producto[],
  prioridad: readonly string[] = MARCAS_MAS_BUSCADAS
): string[] {
  const cuenta = new Map<string, number>()
  for (const producto of productos) {
    for (const marca of producto.marcas) cuenta.set(marca, (cuenta.get(marca) ?? 0) + 1)
  }
  const puesto = (marca: string) => {
    const i = prioridad.indexOf(marca)
    return i === -1 ? prioridad.length : i
  }
  return [...cuenta]
    .sort(([a, na], [b, nb]) => puesto(a) - puesto(b) || nb - na || a.localeCompare(b, 'es'))
    .map(([marca]) => marca)
}

/**
 * Compone un texto con tantas marcas como quepan en `maximo` caracteres.
 *
 * Con todas si caben. Si no, va soltando las ultimas y cierra con "y más":
 * enumerar las siete marcas de la tienda dejaba la portada en 174 caracteres
 * y a Google cortando el envio, que es lo que hace clicar. Nunca baja de una.
 */
export function marcasQueQuepan(
  marcas: readonly string[],
  componer: (lista: string) => string,
  maximo = 160
): string {
  for (let n = marcas.length; n >= 1; n--) {
    const lista = n === marcas.length ? enumerar(marcas) : `${marcas.slice(0, n).join(', ')} y más`
    const texto = componer(lista)
    if (texto.length <= maximo || n === 1) return texto
  }
  return componer('')
}

/**
 * La meta description de una pagina de marca.
 *
 * Todas compartian "X en The Rack store: las piezas de la marca disponibles
 * en Colombia", y la de la marca con ficha era solo su propuesta, sin el
 * nombre ni el pais: justo las dos palabras con las que se busca ("lacoste
 * colombia"). Ahora abre con las dos, sigue con la propuesta si la hay y
 * nombra los tipos de prenda que hay de verdad.
 *
 * Si no cabe en los ~160 caracteres de un resultado, se prueba el cierre
 * corto, y si tampoco cabe sobra el cierre: las condiciones de venta se
 * repiten en todo el sitio, la propuesta no.
 *
 * Sin piezas y sin ficha no se anuncia envio de nada: se dice lo unico que
 * es cierto.
 */
export function descripcionDeMarca(
  nombre: string,
  propuesta: string | undefined,
  productos: readonly Producto[],
  cierre: string,
  /** Version corta del cierre, para cuando el largo no cabe en 160. */
  cierreCorto?: string
): string {
  if (!productos.length && !propuesta) {
    return `${nombre} en el archivo de marcas de The Rack store.`
  }
  const tipos = tiposDe(productos).map((t) => t.etiqueta.toLowerCase())

  const partes = [`${nombre} en Colombia.`]
  if (propuesta) partes.push(propuesta)
  if (tipos.length) partes.push(`${capitalizar(enumerar(tipos))}.`)

  for (const c of [cierre, cierreCorto]) {
    if (!c) continue
    const conCierre = [...partes, c].join(' ')
    if (conCierre.length <= 160) return conCierre
  }
  return partes.join(' ')
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Una foto de la galeria de una marca: archivo de src/assets/productos y su alt. */
export interface FotoDePieza {
  archivo: string
  alt: string
}

/**
 * La galeria de respaldo de una pagina de marca: fotos de sus piezas.
 *
 * La galeria de verdad es la de la ficha, con fotos de campana. Casi ninguna
 * marca la tiene todavia, y sin ella la pagina se quedaba en un texto solo;
 * con esto toda marca con piezas tiene galeria desde el primer dia, y el dia
 * que llegan las fotos de campana la sustituyen sin tocar nada mas.
 *
 * Una foto por prenda antes de repetir prenda, para que la galeria ensene la
 * marca y no un solo buzo desde cinco angulos. De cada prenda van primero las
 * fotos con modelo -- una prenda puesta se parece mas a una campana que una
 * prenda sola sobre blanco --, luego la de portada y luego el resto.
 *
 * De 2 a `maximo`: con una sola no hay acordeon que abrir, asi que por
 * debajo de dos devuelve la lista vacia y la pagina se queda sin galeria.
 */
export function galeriaDePiezas(
  tarjetas: readonly { producto: Producto; variante: Variante }[],
  maximo = 6
): FotoDePieza[] {
  const colas = tarjetas.map(({ producto, variante }) => {
    const alternativo = [producto.marcas.join(' × '), producto.nombre, variante.color]
      .filter(Boolean)
      .join(' ')
    const peso = (foto: Variante['imagenes'][number]) =>
      foto.archivo.includes('-modelo') ? 0 : foto.portada ? 1 : 2
    return [...variante.imagenes]
      .sort((a, b) => peso(a) - peso(b))
      .map((foto) => ({ archivo: foto.archivo, alt: foto.alt ?? alternativo }))
  })

  const fotos: FotoDePieza[] = []
  for (let vuelta = 0; fotos.length < maximo; vuelta++) {
    const deEstaVuelta = colas.map((cola) => cola[vuelta]).filter((f) => f !== undefined)
    if (!deEstaVuelta.length) break
    fotos.push(...deEstaVuelta.slice(0, maximo - fotos.length))
  }
  return fotos.length >= 2 ? fotos : []
}
