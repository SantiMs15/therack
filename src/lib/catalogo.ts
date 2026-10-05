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
  generoDe,
  generosDeProducto,
  marcasDeProducto,
  precioAnteriorDe,
  precioDe,
  type Categoria,
  type Genero,
  type Producto,
  type Tipo,
  type Variante,
} from '../data/schema'
import { ORDEN_POR_DEFECTO, ordenar, turnos } from './orden'
import { slugMarca, type Opcion } from './filtros'

/** Una tarjeta de la rejilla: una prenda en UN color. */
export interface Tarjeta {
  producto: Producto
  variante: Variante
  indice: number
  precio: number
  destacado: boolean
  genero: Genero | null
  tipo: Tipo
  /** La primera marca, que es con la que la prenda entra en el reparto. */
  marca: string | null
  /** Todas, en slug: una colaboracion sale al filtrar por cualquiera. */
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
      precio: precioDe(tarjeta.producto, tarjeta.variante),
      destacado: tarjeta.producto.destacado,
      genero: generoDe(tarjeta.producto.categoria),
      tipo: tarjeta.producto.tipo,
      marcas: marcasDeProducto(tarjeta.producto).map(slugMarca),
    }))
    .map((tarjeta) => ({ ...tarjeta, marca: tarjeta.marcas[0] ?? null }))

  const puestos = turnos(base)
  return ordenar(
    base.map((tarjeta, i) => ({ ...tarjeta, turno: puestos[i]! })),
    ORDEN_POR_DEFECTO
  )
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
    for (const marca of marcasDeProducto(producto)) porSlug.set(slugMarca(marca), marca)
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
    const genero = generoDe(producto.categoria)
    if (genero) presentes.add(genero)
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
 * Las prendas de un genero: las de su categoria y las que se declaran
 * `tambienEn` el. Es lo que llena /catalogo/<genero>.
 */
export function deGenero(productos: readonly Producto[], genero: Genero): Producto[] {
  return productos.filter((producto) => generosDeProducto(producto).includes(genero))
}

/**
 * Las prendas de una categoria. En las de genero entran tambien las que se
 * declaran `tambienEn` el: una prenda sin genero sale en los dos catalogos.
 */
export function prendasDeCategoria(productos: readonly Producto[], categoria: Categoria): Producto[] {
  const genero = generoDe(categoria)
  return genero
    ? deGenero(productos, genero)
    : productos.filter((producto) => producto.categoria === categoria)
}

/** Las prendas de una marca, contando las colaboraciones en las que entra. */
export function deMarca(productos: readonly Producto[], slug: string): Producto[] {
  return productos.filter((producto) => marcasDeProducto(producto).map(slugMarca).includes(slug))
}

/**
 * Las prendas rebajadas, cada una solo con sus colores rebajados: un color
 * puede estar en rebaja mientras el otro sigue a precio normal, y en /sale
 * solo entra el que de verdad esta rebajado.
 */
export function enRebaja(productos: readonly Producto[]): Producto[] {
  return productos
    .map((producto) => ({
      ...producto,
      variantes: producto.variantes.filter((v) => precioAnteriorDe(producto, v) !== undefined),
    }))
    .filter((producto) => producto.variantes.length > 0)
}

/**
 * Las marcas de un catalogo para nombrarlas en un texto: primero las que la
 * tienda quiere que se lean (`primero`, en su orden) y despues el resto por
 * orden alfabetico.
 *
 * Con el orden alfabetico a secas la descripcion de /catalogo/hombre abria
 * con la marca que empieza por A, que no es la que mas se busca ni la que
 * trae a la gente. Con mas de `maximo` se cortan y se cierra con "y más": la
 * meta description no da para nombrar ocho marcas.
 */
export function marcasParaTexto(
  productos: readonly Producto[],
  primero: readonly string[],
  maximo: number
): string {
  const presentes = marcasDe(productos).map((m) => m.etiqueta)
  const puesto = (marca: string) => {
    const i = primero.indexOf(marca)
    return i === -1 ? primero.length : i
  }
  const ordenadas = [...presentes].sort(
    (a, b) => puesto(a) - puesto(b) || a.localeCompare(b, 'es')
  )
  const nombradas = ordenadas.slice(0, maximo)
  return enumerar(ordenadas.length > maximo ? [...nombradas, 'más'] : nombradas)
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
/** Lo que muestra un resultado de busqueda antes de cortar. */
const LIMITE_DESCRIPCION = 155

export function descripcionDeCategoria(
  productos: readonly Producto[],
  quienes: string,
  cierre: string,
  primero: readonly string[] = [],
  /** Version corta de `cierre`, para cuando la larga no cabe con los tipos. */
  cierreCorto: string = cierre
): string {
  const marcas = marcasParaTexto(productos, primero, 3)
  const tipos = tiposDe(productos).map((t) => t.etiqueta.toLowerCase())

  // "Ropa de hombre", pero "Accesorios de Nike": calzado y accesorios ya
  // nombran lo que se vende, y "ropa de accesorios" no lo dice nadie.
  const inicio =
    ((GENEROS as readonly string[]).includes(quienes) ? `Ropa de ${quienes}` : capitalizar(quienes)) +
    (marcas ? ` de ${marcas}` : '') +
    '.'
  const tiposTexto = tipos.length ? ` ${capitalizar(enumerar(tipos))}.` : ''
  // Con muchos tipos de prenda se pasaba de lo que muestra el buscador y se
  // cortaba el envio, que es lo que mas convence. Primero se acorta el envio;
  // si aun no cabe sobran los tipos, que la pagina enumera en el filtro.
  const opciones = [
    `${inicio}${tiposTexto} ${cierre}`,
    `${inicio}${tiposTexto} ${cierreCorto}`,
    `${inicio} ${cierre}`,
  ]
  return opciones.find((o) => o.length <= LIMITE_DESCRIPCION) ?? opciones[opciones.length - 1]!
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
