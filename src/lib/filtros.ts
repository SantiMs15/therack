/**
 * Filtrado de la rejilla: genero, tipo de prenda y marca.
 *
 * Como el orden, vive fuera del componente porque lo usan los dos lados:
 * Astro lo usa en el build y el script del navegador para esconder tarjetas
 * sin recargar.
 *
 * Las tres dimensiones son independientes y se acumulan: elegir Mujer y
 * Hoodies deja las prendas que cumplen las dos cosas, no la suma de ambas.
 *
 * IMPORTANTE: de `schema` solo se importan TIPOS, con `import type`, que
 * desaparecen al compilar. Traerse un valor de ahi (GENEROS, ETIQUETAS_TIPO,
 * generoDe) arrastraria zod hasta el navegador: son 84 KB de validacion que
 * en el cliente no valida nada. Lo que necesite valores del schema va en
 * catalogo.ts, que solo corre en el build.
 */
import type { Genero, Tipo } from '../data/schema'

/**
 * Lo minimo que necesita una tarjeta para poder filtrarse. Igual que con el
 * orden, el script lo reconstruye leyendo atributos `data-` del <li>.
 *
 * `genero` puede faltar: calzado y accesorios no lo tienen. `marca` tambien:
 * no toda prenda de la tienda es de marca conocida.
 */
export interface Filtrable {
  genero: Genero | null
  tipo: Tipo
  marca: string | null
}

/** null en un campo significa "sin filtrar por eso", no "sin valor". */
export interface Filtros {
  genero: Genero | null
  tipo: Tipo | null
  /** Slug, no nombre: es lo que viaja en la URL. */
  marca: string | null
}

export const SIN_FILTROS: Filtros = { genero: null, tipo: null, marca: null }

export function pasa(tarjeta: Filtrable, filtros: Filtros): boolean {
  if (filtros.genero && tarjeta.genero !== filtros.genero) return false
  if (filtros.tipo && tarjeta.tipo !== filtros.tipo) return false
  if (filtros.marca && tarjeta.marca !== filtros.marca) return false
  return true
}

export function hayFiltros(filtros: Filtros): boolean {
  return Boolean(filtros.genero || filtros.tipo || filtros.marca)
}

/**
 * Slug de una marca, para la URL y el atributo `data-`. La marca es texto
 * libre en el catalogo ("Tommy Hilfiger"), asi que se normaliza aqui en vez
 * de pedir que se escriba dos veces y confiar en que coincidan.
 */
export function slugMarca(marca: string): string {
  return marca
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Una entrada de desplegable o de menu: lo que se guarda y lo que se lee. */
export interface Opcion {
  valor: string
  etiqueta: string
  /**
   * Pagina propia de la opcion, si la tiene. El genero la tiene
   * (/catalogo/mujer/) y por eso navega en vez de esconder tarjetas; el tipo
   * de prenda no, y se queda filtrando en el navegador.
   */
  href?: string
}
