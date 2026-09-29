import { FICHAS, type FichaMarca } from '../data/fichas-marca'
import { MARCAS } from '../data/marcas'
import { productos } from '../data/productos'
import { slugMarca } from './filtros'

/**
 * Como se nombra a la marca -- o a las marcas -- de una prenda.
 *
 * Una colaboracion es de dos, y cual de las dos se dice depende de DONDE se
 * diga. Dentro de /marca/new-balance/ la prenda es una New Balance: quien
 * esta ahi acaba de leer quien es New Balance, y responderle "Aimé Leon Dore
 * x New Balance" le hace dudar de si esta viendo lo que pidio. Fuera de una
 * pagina de marca -- la portada, el catalogo, la ficha -- no hay a quien
 * preferir, y se dicen las dos: esconder media prenda seria peor.
 *
 * `contexto` es un SLUG, no un nombre: es lo que la pagina de marca sabe de
 * si misma. Si la prenda no es de esa marca se ignora, que es lo que hace
 * que la rejilla de la portada no tenga que pensarlo.
 */
export function nombreDeMarcas(
  marcas: readonly string[],
  contexto?: string | null
): string {
  if (marcas.length === 0) return ''
  if (contexto) {
    const suya = marcas.find((marca) => slugMarca(marca) === contexto)
    if (suya) return suya
  }
  // Con la cruz de multiplicar (U+00D7) y no una equis: es como se escribe
  // una colaboracion, y no se lee como una palabra cortada.
  return marcas.join(' × ')
}

/**
 * Una marca del archivo: su slug, su nombre tal como se escribe, y su ficha.
 *
 * La ficha puede faltar. TODA marca de la tienda tiene pagina en el archivo:
 * la ficha es lo que se ha escrito de ella hasta hoy, no el permiso para
 * existir. Sin ficha la pagina presenta lo que ya se sabe -- el nombre y sus
 * piezas -- y espera al texto.
 */
export interface EntradaArchivo {
  slug: string
  nombre: string
  ficha: FichaMarca | null
}

/**
 * Las tres preguntas que el resto del sitio le hace al archivo.
 *
 * Viven aqui y no en cada pagina porque las hacen cuatro sitios distintos --
 * el menu, la ficha de producto, la pagina de marca y el indice -- y la
 * respuesta tiene que ser la misma en todos.
 *
 * `tieneFicha` ya no decide a donde se va: decide QUE se pinta al llegar.
 *
 * Las fichas y las marcas llegan por parametro, con la lista real por
 * defecto, para poder probarlas sin depender de lo que haya escrito hoy.
 */
export function tieneFicha(slug: string, fichas: Record<string, FichaMarca> = FICHAS): boolean {
  return Object.hasOwn(fichas, slug)
}

/**
 * Si la pagina de una marca tiene algo que ensenarle a un buscador.
 *
 * La tiene si hay ficha escrita o si hay piezas de la marca en la tienda.
 * Sin ninguna de las dos la pagina solo dice "todavia se esta escribiendo" y
 * "no hay piezas": indexada, Google la lee como una pagina vacia -- que resta
 * al sitio entero -- y quien busca "adidas colombia" aterriza en ella.
 *
 * Se sigue publicando, con noindex y fuera del sitemap, por lo mismo que
 * /sale/ sin rebajas: el menu la enlaza y no puede llevar a un 404. El dia
 * que llegue la ficha o la primera pieza se indexa sola.
 */
export function marcaIndexable(
  slug: string,
  fichas: Record<string, FichaMarca> = FICHAS,
  catalogo: readonly { marcas: readonly string[] }[] = productos
): boolean {
  return (
    tieneFicha(slug, fichas) ||
    catalogo.some((p) => p.marcas.some((m) => slugMarca(m) === slug))
  )
}

/**
 * A donde lleva el nombre de una marca: siempre a su pagina del archivo.
 *
 * Antes la marca sin ficha caia en /?marca=<slug>, la portada filtrada. Eran
 * dos destinos para el mismo gesto, y el que no conocia la marca -- que es
 * justo quien pulsa su nombre -- acababa en una rejilla de prendas sin saber
 * de quien eran. Ahora todas las marcas tienen pagina, asi que el nombre
 * lleva siempre al mismo sitio.
 */
export function hrefDeMarca(slug: string): string {
  return `/marca/${slug}/`
}

/**
 * Las marcas que componen el archivo, en orden alfabetico: TODAS las de la
 * tienda, tengan ficha o no.
 *
 * Se ordena aqui y no se confia en el orden de MARCAS ni en el de las claves
 * del objeto: anadir una ficha es escribir una entrada, y la entrada acaba
 * donde el editor la deje.
 */
export function archivoDeMarcas(
  fichas: Record<string, FichaMarca> = FICHAS,
  marcas: readonly string[] = MARCAS
): EntradaArchivo[] {
  return marcas
    .map((nombre) => {
      const slug = slugMarca(nombre)
      return { slug, nombre, ficha: fichas[slug] ?? null }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
