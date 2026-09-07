/**
 * Orden de la rejilla de productos.
 *
 * La logica vive aqui, fuera del componente, porque la usan los dos lados:
 * Astro ordena en el build para que el HTML salga ya en el orden por defecto,
 * y el script del navegador la reutiliza para reordenar sin recargar.
 */

export const ORDENES = ['destacados', 'novedades', 'precio-asc', 'precio-desc'] as const
export type Orden = (typeof ORDENES)[number]

/** Lo que ve el cliente al entrar: primero lo que la tienda quiere mover. */
export const ORDEN_POR_DEFECTO: Orden = 'destacados'

export const ETIQUETAS: Record<Orden, string> = {
  destacados: 'Destacados',
  novedades: 'Novedades',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
}

/**
 * Lo minimo que necesita una tarjeta para poder ordenarse. No es el producto
 * entero: el script del navegador reconstruye esto leyendo tres atributos
 * `data-` del <li>, sin volver a bajarse el catalogo.
 *
 * `indice` es la posicion de la tarjeta en el catalogo tal y como se escribe
 * en productos.ts. Mayor indice = anadida despues = mas nueva. No hay campo
 * de fecha: la convencion del repo es que las prendas nuevas se anaden al
 * final del array, asi que la posicion ya lleva esa informacion.
 */
export interface Ordenable {
  precio: number
  destacado: boolean
  indice: number
  /** Puesto en el reparto por marcas. Lo calcula `turnos`. */
  turno: number
}

/**
 * Devuelve la funcion de comparacion de un orden. Todos desempatan por
 * `indice`, asi que dos prendas del mismo precio no bailan entre recargas.
 */
export function comparador(orden: Orden): (a: Ordenable, b: Ordenable) => number {
  switch (orden) {
    case 'destacados':
      return (a, b) =>
        Number(b.destacado) - Number(a.destacado) || a.turno - b.turno || a.indice - b.indice
    case 'novedades':
      return (a, b) => b.indice - a.indice
    case 'precio-asc':
      return (a, b) => a.precio - b.precio || a.indice - b.indice
    case 'precio-desc':
      return (a, b) => b.precio - a.precio || a.indice - b.indice
  }
}

/** Ordena sin tocar el array recibido. */
export function ordenar<T extends Ordenable>(items: readonly T[], orden: Orden): T[] {
  return [...items].sort(comparador(orden))
}

/**
 * Valida lo que llega de fuera (el parametro `?orden=` de la URL, que
 * cualquiera puede escribir a mano). Sin esto un valor inventado dejaria la
 * rejilla ordenada por nada.
 */
export function esOrden(valor: unknown): valor is Orden {
  return typeof valor === 'string' && (ORDENES as readonly string[]).includes(valor)
}

/**
 * Lo que hace falta para repartir por marcas.
 *
 * `marca` es el slug, o null si la prenda no es de marca conocida: todas las
 * que no tienen marca cuentan como un grupo mas, no como una cada una.
 */
export interface Repartible {
  marca: string | null
  destacado: boolean
}

/**
 * Reparte las tarjetas entre las marcas, una de cada por ronda, y devuelve el
 * puesto que le toca a cada una. Es lo que ordena "Destacados".
 *
 * Sin esto la rejilla abria con cinco Lacoste seguidos, que es como estan
 * escritas en el catalogo: quien entra a la tienda veia una sola marca sin
 * bajar. Repartiendo, la primera fila lleva una prenda de cada.
 *
 * Con tres marcas y cuatro columnas la cuarta casilla repite marca a la
 * fuerza. Empieza la marca que aparece primero en el catalogo, asi que la
 * prenda que abria la rejilla la sigue abriendo.
 *
 * Destacadas y no destacadas se reparten por separado: `destacado` pesa mas
 * que el reparto en el comparador, asi que mezclarlas daria turnos que nadie
 * llega a mirar.
 *
 * Espera las tarjetas en orden de catalogo, que es como las construye la
 * rejilla: de ahi sale el orden de las marcas y el de las prendas dentro de
 * cada una.
 */
export function turnos(tarjetas: readonly Repartible[]): number[] {
  const puestos = new Array<number>(tarjetas.length).fill(0)
  let siguiente = 0

  for (const bloque of [true, false]) {
    // Map conserva el orden de insercion, que aqui es el del catalogo.
    const colas = new Map<string, number[]>()
    tarjetas.forEach((tarjeta, indice) => {
      if (tarjeta.destacado !== bloque) return
      const clave = tarjeta.marca ?? ''
      const cola = colas.get(clave)
      if (cola) cola.push(indice)
      else colas.set(clave, [indice])
    })

    const grupos = [...colas.values()]
    const masLarga = Math.max(0, ...grupos.map((grupo) => grupo.length))

    for (let ronda = 0; ronda < masLarga; ronda++) {
      for (const grupo of grupos) {
        const indice = grupo[ronda]
        if (indice !== undefined) puestos[indice] = siguiente++
      }
    }
  }

  return puestos
}
