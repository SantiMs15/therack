export type OpcionesEnlace = {
  /** Con indicativo de pais. Se limpian espacios, guiones y el signo mas. */
  telefono: string
  nombre: string
  /** URL absoluta de la ficha del producto. */
  url: string
  talla?: string
}

/**
 * Construye el enlace wa.me con el mensaje ya redactado.
 *
 * El prellenado es el valor entero del modelo catalogo->DM: sin el,
 * llegan mensajes de "hola, info?" y se gastan veinte mensajes
 * averiguando de que prenda se habla.
 */
export function construirEnlaceWhatsApp({ telefono, nombre, url, talla }: OpcionesEnlace): string {
  const digitos = telefono.replace(/\D/g, '')
  if (digitos.length < 10) {
    throw new Error(`Telefono invalido: "${telefono}". Necesita indicativo de pais y numero.`)
  }
  const detalle = talla ? ` (talla ${talla})` : ''
  const texto = `Hola! Me interesa el ${nombre}${detalle}\n${url}`
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`
}
