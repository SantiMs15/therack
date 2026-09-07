import { describe, it, expect } from 'vitest'
import { ORDENES, ORDEN_POR_DEFECTO, esOrden, ordenar, turnos, type Ordenable } from './orden'

/**
 * Cuatro tarjetas con precios e indices distintos. `barata` y `cara` estan
 * destacadas; el indice crece con el orden en que se escribieron en el
 * catalogo, asi que `nueva` es la ultima anadida.
 */
const barata: Ordenable = { precio: 100_000, destacado: true, indice: 0, turno: 0 }
const media: Ordenable = { precio: 200_000, destacado: false, indice: 1, turno: 1 }
const cara: Ordenable = { precio: 300_000, destacado: true, indice: 2, turno: 2 }
const nueva: Ordenable = { precio: 150_000, destacado: false, indice: 3, turno: 3 }

const tarjetas = [barata, media, cara, nueva]

describe('ordenar', () => {
  it('destacados: las destacadas primero, cada grupo en orden de catalogo', () => {
    expect(ordenar(tarjetas, 'destacados')).toEqual([barata, cara, media, nueva])
  })

  it('novedades: la ultima anadida al catalogo abre la rejilla', () => {
    expect(ordenar(tarjetas, 'novedades')).toEqual([nueva, cara, media, barata])
  })

  it('precio-asc: de menor a mayor', () => {
    expect(ordenar(tarjetas, 'precio-asc')).toEqual([barata, nueva, media, cara])
  })

  it('precio-desc: de mayor a menor', () => {
    expect(ordenar(tarjetas, 'precio-desc')).toEqual([cara, media, nueva, barata])
  })

  it('no muta el array recibido', () => {
    const original = [...tarjetas]
    ordenar(tarjetas, 'precio-desc')
    expect(tarjetas).toEqual(original)
  })

  it('desempata por indice, no por el orden de entrada', () => {
    const a: Ordenable = { precio: 90_000, destacado: false, indice: 5, turno: 5 }
    const b: Ordenable = { precio: 90_000, destacado: false, indice: 2, turno: 2 }
    expect(ordenar([a, b], 'precio-asc')).toEqual([b, a])
    expect(ordenar([a, b], 'precio-desc')).toEqual([b, a])
  })

  it('destacados manda el turno del reparto, no el orden de catalogo', () => {
    // Mismo bloque de destacadas: el reparto por marcas decide, y el indice
    // solo entra si dos comparten turno.
    const primera: Ordenable = { precio: 1, destacado: true, indice: 9, turno: 0 }
    const segunda: Ordenable = { precio: 1, destacado: true, indice: 1, turno: 1 }
    expect(ordenar([segunda, primera], 'destacados')).toEqual([primera, segunda])
  })

  it('destacado sigue pesando mas que el turno', () => {
    const sinDestacar: Ordenable = { precio: 1, destacado: false, indice: 0, turno: 0 }
    const destacada: Ordenable = { precio: 1, destacado: true, indice: 9, turno: 9 }
    expect(ordenar([sinDestacar, destacada], 'destacados')).toEqual([destacada, sinDestacar])
  })

  it('aguanta una rejilla vacia', () => {
    for (const orden of ORDENES) expect(ordenar([], orden)).toEqual([])
  })
})

describe('esOrden', () => {
  it('acepta los cuatro ordenes declarados', () => {
    for (const orden of ORDENES) expect(esOrden(orden)).toBe(true)
  })

  it('rechaza lo que llegue inventado en la URL', () => {
    expect(esOrden('precio')).toBe(false)
    expect(esOrden('')).toBe(false)
    expect(esOrden(undefined)).toBe(false)
    expect(esOrden(null)).toBe(false)
    expect(esOrden(3)).toBe(false)
  })
})

describe('ORDEN_POR_DEFECTO', () => {
  it('es uno de los ordenes declarados', () => {
    expect(esOrden(ORDEN_POR_DEFECTO)).toBe(true)
  })
})

describe('turnos', () => {
  const conMarca = (marca: string | null, destacado = true) => ({ marca, destacado })

  it('reparte una marca por ronda: la primera fila no repite', () => {
    // Cinco Lacoste, tres Tommy y una Essentials, como el catalogo real.
    const tarjetas = [
      ...Array.from({ length: 5 }, () => conMarca('lacoste')),
      ...Array.from({ length: 3 }, () => conMarca('tommy-hilfiger')),
      conMarca('essentials'),
    ]

    const puestos = turnos(tarjetas)
    // Los tres primeros puestos se los llevan tres marcas distintas.
    const primeros = [0, 1, 2].map((puesto) => tarjetas[puestos.indexOf(puesto)]!.marca)
    expect(new Set(primeros).size).toBe(3)
  })

  it('abre la marca que aparece primero en el catalogo', () => {
    const tarjetas = [conMarca('lacoste'), conMarca('essentials')]
    expect(turnos(tarjetas)).toEqual([0, 1])
  })

  it('dentro de una marca respeta el orden de catalogo', () => {
    const tarjetas = [conMarca('lacoste'), conMarca('lacoste'), conMarca('tommy-hilfiger')]
    const [primeraL, segundaL, unicaT] = turnos(tarjetas)
    expect(primeraL).toBeLessThan(unicaT!)
    expect(unicaT).toBeLessThan(segundaL!)
  })

  it('las destacadas se reparten antes que las demas', () => {
    const tarjetas = [conMarca('lacoste', false), conMarca('tommy-hilfiger', true)]
    const [sinDestacar, destacada] = turnos(tarjetas)
    expect(destacada).toBeLessThan(sinDestacar!)
  })

  it('las prendas sin marca cuentan como un grupo, no como una cada una', () => {
    const tarjetas = [conMarca(null), conMarca(null), conMarca('lacoste')]
    const [primeraSin, segundaSin, lacoste] = turnos(tarjetas)
    expect(primeraSin).toBeLessThan(lacoste!)
    expect(lacoste).toBeLessThan(segundaSin!)
  })

  it('da un puesto distinto a cada tarjeta', () => {
    const tarjetas = [
      conMarca('a'), conMarca('b'), conMarca('a'), conMarca('c', false), conMarca('b'),
    ]
    expect(new Set(turnos(tarjetas)).size).toBe(tarjetas.length)
  })

  it('aguanta una rejilla vacia', () => {
    expect(turnos([])).toEqual([])
  })
})
