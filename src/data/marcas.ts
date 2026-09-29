/**
 * Las marcas de la tienda: las que ya tienen prenda y las que van a tenerla.
 *
 * Es una lista escrita a mano, y no derivada del catalogo, porque el menu de
 * la cabecera anuncia lo que la tienda VENDE, que no es lo mismo que lo que
 * hay colgado hoy. `marcasDe(productos)` sigue existiendo y sigue diciendo lo
 * otro: es la que nombra las meta descriptions, y ahi no puede aparecer una
 * marca de la que no haya nada.
 *
 * Una marca sin stock lleva a /?marca=<slug> y la rejilla sale vacia, con su
 * mensaje. Es un estado honesto: dice
 * "de esta no queda nada" en vez de esconder la marca hasta que entre la
 * primera prenda. El dia que entre, deja de estar vacia sola.
 *
 * El slug NO se escribe: lo deriva `slugMarca` del nombre, igual que en el
 * catalogo. Escrito dos veces, un dia dejarian de coincidir y el enlace del
 * menu apuntaria a un filtro que no casa con ninguna tarjeta.
 *
 * Nombres tomados de docs/keywords-decisiones.md, que ya resolvio cuales
 * arrastran otra cosa en el buscador:
 * - `On` sola trae Onitsuka Tiger, asi que se guarda como "On Running".
 * - `Dime` a secas: MTL es solo como se la busca, no como se llama.
 * - "Aimé Leon Dore" con tilde, y no ALD, que es una marca de zapatos
 *   distinta (Aldo). La tilde no llega al slug: `slugMarca` normaliza, asi
 *   que sigue siendo `aime-leon-dore` y el enlace del menu no cambia.
 */
import { slugMarca, type Opcion } from '../lib/filtros'

/**
 * Las marcas que mas se buscan, en ese orden. Van delante cuando una
 * descripcion nombra marcas, tengan las prendas que tengan: el que busca
 * "eme studios" tiene que leerla en el resultado aunque sea la marca con
 * menos piezas colgadas.
 *
 * Lo dijo el dueno el 2026-09-29, a partir de lo que ve en el buscador.
 * Cuando GSC tenga meses de datos, este orden sale del informe de
 * rendimiento y no de la intuicion.
 */
export const MARCAS_MAS_BUSCADAS = ['Eme Studios', 'Lacoste', 'Tommy Hilfiger'] as const

/** En orden alfabetico, que es el que sale al menu. */
export const MARCAS = [
  'Adidas',
  'Aimé Leon Dore',
  'AMBUSH',
  'Asics',
  'Autry',
  'Axel Arigato',
  'Birkenstock',
  'Calvin Klein',
  'Diesel',
  'Dime',
  'Ed Hardy',
  'Eme Studios',
  'Essentials',
  'Hugo Boss',
  'Karl Lagerfeld',
  'KidSuper Studios',
  'Lacoste',
  'Maison Mihara Yasuhiro',
  'New Balance',
  'Nike',
  'On Running',
  'Onitsuka Tiger',
  'Pleasures',
  'Ralph Lauren',
  'Represent',
  'Salomon',
  'Tommy Hilfiger',
] as const

/**
 * Las marcas como opciones, con su slug. Se ordena aqui y no se confia en el
 * orden del array: anadir una marca es escribir una linea, y la linea acaba
 * donde el editor la deje.
 */
export function marcasTodas(): Opcion[] {
  return MARCAS.map((etiqueta) => ({ valor: slugMarca(etiqueta), etiqueta })).sort((a, b) =>
    a.etiqueta.localeCompare(b.etiqueta, 'es')
  )
}
