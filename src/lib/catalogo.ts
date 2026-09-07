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
  marca: string | null
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
      genero: generoDe(tarjeta.producto.categoria),
      tipo: tarjeta.producto.tipo,
      marca: tarjeta.producto.marca ? slugMarca(tarjeta.producto.marca) : null,
    }))

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
    if (producto.marca) porSlug.set(slugMarca(producto.marca), producto.marca)
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
  const marcas = marcasDe(productos).map((m) => m.etiqueta)
  const tipos = tiposDe(productos).map((t) => t.etiqueta.toLowerCase())

  const partes = [`Ropa de ${quienes}`]
  if (marcas.length) partes.push(` de ${enumerar(marcas)}`)
  partes.push('.')
  if (tipos.length) partes.push(` ${capitalizar(enumerar(tipos))}.`)
  partes.push(` ${cierre}`)

  return partes.join('')
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
