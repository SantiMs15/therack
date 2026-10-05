/**
 * Lo que se deriva del archivo de marcas: titulos, descripciones, el texto de
 * los datos y la galeria de cada pagina.
 *
 * Solo corre en el BUILD, igual que catalogo.ts: importa el schema y con el
 * zod, que no tiene nada que hacer en el navegador.
 */
import type { ImageMetadata } from 'astro'
import { marcasDeProducto, type FichaMarca, type Marca, type Producto } from '../data/schema'
import { CONFIG, VENTA } from '../config'
import { capitalizar, enumerar, tiposDe } from './catalogo'
import { slugMarca } from './filtros'
import { resumir } from './formato'

/**
 * Lo que mide como mucho una meta description antes de que el buscador la
 * corte. Las de las marcas se acercan: una propuesta larga mas los tipos de
 * prenda llenan casi todo el espacio.
 */
const LIMITE_DESCRIPCION = 155

/** "Elche, España", o el pais a secas si la ficha no cuenta la ciudad. */
export function lugarDe(ficha: FichaMarca): string {
  return ficha.ciudad ? `${ficha.ciudad}, ${ficha.pais}` : ficha.pais
}

/**
 * El titulo de la pagina de una marca, sin el nombre de la tienda: lo anade
 * el layout si cabe.
 *
 * Con el nombre con que se busca ("Polo Ralph Lauren") y "en Colombia", que
 * es la otra mitad de la busqueda: quien escribe "eme studios" quiere saber
 * si se consigue aqui. El lema remata lo que es la marca para quien no la
 * conoce.
 */
export function tituloMarca(marca: Marca): string {
  const nombre = marca.ficha?.nombreBusqueda ?? marca.nombre
  const lema = marca.ficha?.lema
  return `${nombre} en Colombia${lema ? `: ${lema}` : ''}`
}

/**
 * La meta description de la pagina de una marca.
 *
 * Se arma con lo que hay: la propuesta si hay ficha, los tipos de prenda si
 * hay prendas, y al final las condiciones de envio -- la larga si cabe, la
 * corta si no, ninguna si ni la corta cabe. Antes que cortar una frase a la
 * mitad se prefiere no decir el envio, que ya se lee en cada ficha.
 *
 * Una marca sin ficha ni prendas no tiene nada que contar todavia, y lo dice.
 */
export function descripcionMarca(marca: Marca, prendas: readonly Producto[]): string {
  const tipos = tiposDe(prendas).map((t) => t.etiqueta.toLowerCase())
  if (!marca.ficha && tipos.length === 0) {
    return `${marca.nombre} en el archivo de marcas de ${CONFIG.nombre}.`
  }

  const nombre = marca.ficha?.nombreBusqueda ?? marca.nombre
  const inicio = [`${nombre} en Colombia.`, marca.ficha?.propuesta].filter(Boolean).join(' ')
  const tiposTexto = tipos.length ? ` ${capitalizar(enumerar(tipos))}.` : ''
  const largo = ` Envío gratis a toda Colombia en ${VENTA.entrega.minimo} a ${VENTA.entrega.maximo} días.`
  const corto = ' Envío gratis a toda Colombia.'

  // De la mas completa a la mas escueta: se queda la primera que cabe. Lo
  // ultimo en caer es la propuesta, que es lo que distingue a la marca.
  const opciones = [
    inicio + tiposTexto + largo,
    inicio + tiposTexto + corto,
    inicio + corto,
    inicio + tiposTexto,
    inicio,
  ]
  return opciones.find((o) => o.length <= LIMITE_DESCRIPCION) ?? resumir(inicio, LIMITE_DESCRIPCION)
}

/** Una foto de la galeria, ya resuelta. */
export interface FotoGaleria {
  datos: ImageMetadata
  alt: string
}

/** Cuantas fotos lleva como mucho la galeria armada con las prendas. */
const MAXIMO_GALERIA = 5

/**
 * La galeria de la pagina de una marca.
 *
 * Si la marca declara la suya, esa. Si no, se arma con las fotos de sus
 * prendas, una por color en el orden del catalogo y despues una segunda
 * vuelta, hasta cinco. De cada color va primero la foto con modelo: la
 * galeria es la parte de la pagina que cuenta como se lleva la marca, y para
 * la prenda sola ya estan las tarjetas de abajo.
 *
 * Con menos de dos fotos no hay galeria -- una sola no tiene entre que
 * elegir --, salvo en una marca con ficha: ahi el hueco se llena con la foto
 * de reserva, para que la pagina no se desequilibre mientras llegan las de
 * campaña.
 */
export function galeriaDeMarca(
  marca: Marca,
  prendas: readonly Producto[],
  resolver: (archivo: string, carpeta: 'productos' | 'marcas') => ImageMetadata,
  reserva: FotoGaleria
): FotoGaleria[] {
  if (marca.galeria) {
    return marca.galeria.map((foto) => ({ datos: resolver(foto.archivo, 'marcas'), alt: foto.alt }))
  }

  const colas = prendas.flatMap((producto) =>
    producto.variantes.map((variante) => {
      const fotos = [...variante.imagenes]
      const conModelo = fotos.findIndex((foto) => foto.archivo.includes('-modelo'))
      const portada = fotos.findIndex((foto) => foto.portada)
      const primera = conModelo !== -1 ? conModelo : Math.max(0, portada)
      return [fotos[primera]!, ...fotos.filter((_, i) => i !== primera)]
    })
  )

  const elegidas: FotoGaleria[] = []
  const vueltas = Math.max(0, ...colas.map((cola) => cola.length))
  for (let vuelta = 0; vuelta < vueltas && elegidas.length < MAXIMO_GALERIA; vuelta++) {
    for (const cola of colas) {
      const foto = cola[vuelta]
      if (!foto || elegidas.length >= MAXIMO_GALERIA) continue
      elegidas.push({ datos: resolver(foto.archivo, 'productos'), alt: foto.alt ?? marca.nombre })
    }
  }

  if (elegidas.length >= 2) return elegidas
  return marca.ficha ? Array.from({ length: MAXIMO_GALERIA }, () => reserva) : []
}

/**
 * Comprueba que cada marca del catalogo esta en el archivo. Una prenda de una
 * marca que no esta enlazaria a una pagina que no existe.
 */
export function comprobarMarcas(productos: readonly Producto[], marcas: readonly Marca[]): void {
  const conocidas = new Set(marcas.map((m) => m.slug))
  for (const producto of productos) {
    for (const marca of marcasDeProducto(producto)) {
      if (!conocidas.has(slugMarca(marca))) {
        throw new Error(
          `Producto "${producto.slug}": la marca "${marca}" no esta en src/data/marcas.ts. ` +
            'Anadela alli (basta con el nombre) para que tenga pagina.'
        )
      }
    }
  }
}
