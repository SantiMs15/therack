/**
 * La tarjeta que se pinta cuando alguien pega el enlace de una ficha en
 * WhatsApp, Instagram o Facebook.
 *
 * En esta tienda ese enlace es el escaparate: el boton de cada ficha abre el
 * chat con el enlace dentro. Quien lo recibe decide ahi si lo abre, y lo que
 * mas pesa en esa decision es el precio -- que la descripcion del buscador
 * no lleva, porque alli ya lo pone la ficha estructurada.
 */
import sharp from 'sharp'
import { descuento, type Producto } from '../data/schema'
import { formatearPrecio } from './formato'
import { VENTA } from '../config'

/**
 * 1200x630 es la proporcion que no recorta nadie: la de Facebook, la de las
 * tarjetas grandes de X, y la que WhatsApp pinta entera.
 */
export const TARJETA = { ancho: 1200, alto: 630 } as const

/**
 * El texto de la tarjeta: precio y envio delante, y detras la misma
 * descripcion que ve el buscador.
 *
 * Rebajada, lleva el precio de antes y el porcentaje: es lo que hace que una
 * rebaja se note sin abrir el enlace.
 */
export function descripcionTarjeta(producto: Producto, descripcion: string): string {
  const rebaja = descuento(producto)
  const precio =
    rebaja !== null && producto.precioAntes !== undefined
      ? `${formatearPrecio(producto.precio)} (antes ${formatearPrecio(producto.precioAntes)}, −${rebaja} %)`
      : formatearPrecio(producto.precio)
  const envio = VENTA.envio.costo === 0 ? 'Envío gratis a toda Colombia' : null
  return [precio, envio].filter(Boolean).join(' · ') + '. ' + descripcion
}

/**
 * Compone la foto de la tarjeta a partir de la foto original de la prenda.
 *
 * Las fotos de producto son verticales, y cada red recorta a su manera: una
 * vertical metida tal cual acababa sin cabeza en una y sin bajos en otra. Aqui
 * la foto va ENTERA y centrada, y los lados se rellenan con el color medio de
 * sus propios bordes izquierdo y derecho. En una foto de estudio ese color es
 * el del fondo, y la prenda queda sobre un fondo continuo sin costura; en una
 * foto con escenario las bandas son lisas, en un tono que sale de ella.
 *
 * Se probo antes con la misma foto ampliada y desenfocada detras: con fondo
 * blanco y prenda oscura quedaban dos bandas grises sucias a los lados.
 *
 * Sale en JPEG y no en WebP: hay versiones de WhatsApp y de otros clientes
 * que no pintan WebP en la vista previa, y el enlace llega sin foto.
 */
export async function componerTarjeta(original: string | Buffer): Promise<Buffer> {
  const { ancho, alto } = TARJETA
  const girada = await sharp(original).rotate().toBuffer()

  return sharp(girada)
    .resize(ancho, alto, { fit: 'contain', background: await colorDeBordes(girada) })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
}

/** Color medio de las dos franjas laterales de la foto, del 2 % de ancho. */
async function colorDeBordes(foto: Buffer) {
  const { width = 1, height = 1 } = await sharp(foto).metadata()
  const franja = Math.max(1, Math.round(width * 0.02))
  const medio = async (left: number) => {
    const { dominant, channels } = await sharp(foto)
      .extract({ left, top: 0, width: franja, height })
      .flatten({ background: '#ffffff' })
      .stats()
    // `dominant` y no la media: una manga que roza el borde no ensucia el
    // color de un fondo que ocupa casi toda la franja.
    return channels.length ? dominant : { r: 255, g: 255, b: 255 }
  }
  const [a, b] = await Promise.all([medio(0), medio(width - franja)])
  return {
    r: Math.round((a.r + b.r) / 2),
    g: Math.round((a.g + b.g) / 2),
    b: Math.round((a.b + b.b) / 2),
    alpha: 1,
  }
}
