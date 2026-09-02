export type OpcionesEnlace = {
  /** Con indicativo de pais. Se limpian espacios, guiones y el signo mas. */
  telefono: string
  nombre: string
  /** URL absoluta de la ficha del producto. */
  url: string
  talla?: string
  /** Color de la variante, cuando la prenda tiene mas de uno. */
  color?: string
}

/**
 * Construye el enlace wa.me con el mensaje ya redactado.
 *
 * El prellenado es el valor entero del modelo catalogo->DM: sin el,
 * llegan mensajes de "hola, info?" y se gastan veinte mensajes
 * averiguando de que prenda se habla.
 */
export function construirEnlaceWhatsApp({ telefono, nombre, url, talla, color }: OpcionesEnlace): string {
  const digitos = telefono.replace(/\D/g, '')
  const tieneMas = telefono.trim().startsWith('+')
  if (!tieneMas || digitos.length < 11 || digitos.length > 15) {
    throw new Error(`Telefono invalido: "${telefono}". Necesita formato internacional con indicativo de pais, p.ej. +57 300 123 4567.`)
  }
  const partes = [color, talla && `talla ${talla}`].filter(Boolean)
  const detalle = partes.length ? ` (${partes.join(', ')})` : ''
  const texto = `Hola! Me interesa el ${nombre}${detalle}\n${url}`
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`
}
