import { FICHAS, type FichaMarca } from '../data/fichas-marca'
import { MARCAS } from '../data/marcas'
import { slugMarca } from './filtros'

/** Una marca del archivo: su slug, su nombre tal como se escribe, y su ficha. */
export interface EntradaArchivo {
  slug: string
  nombre: string
  ficha: FichaMarca
}

/**
 * Las tres preguntas que el resto del sitio le hace al archivo.
 *
 * Viven aqui y no en cada pagina porque las hacen cuatro sitios distintos --
 * el menu, la ficha de producto, la pagina de marca y el indice -- y la
 * respuesta tiene que ser la misma en todos. El dia que una marca deje de
 * tener ficha, el menu deja de enlazar a su pagina en el mismo commit en que
 * la pagina deja de generarse.
 *
 * Las fichas y las marcas llegan por parametro, con la lista real por
 * defecto, para poder probarlas sin depender de lo que haya escrito hoy.
 */
export function tieneFicha(slug: string, fichas: Record<string, FichaMarca> = FICHAS): boolean {
  return Object.hasOwn(fichas, slug)
}

/**
 * A donde lleva el nombre de una marca.
 *
 * Con ficha, a su pagina. Sin ficha, al filtro de la portada, que es lo que
 * hacia todo el menu antes de que existiera el archivo: un enlace a una
 * pagina que no se genera seria un 404, y esconder la marca hasta que alguien
 * escriba su ficha contaria menos de lo que la tienda vende.
 */
export function hrefDeMarca(slug: string, fichas: Record<string, FichaMarca> = FICHAS): string {
  return tieneFicha(slug, fichas) ? `/marca/${slug}/` : `/?marca=${slug}`
}

/**
 * Las marcas que componen el archivo, en orden alfabetico.
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
    .map((nombre) => ({ slug: slugMarca(nombre), nombre }))
    .filter((marca) => tieneFicha(marca.slug, fichas))
    .map((marca) => ({ ...marca, ficha: fichas[marca.slug]! }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
