/**
 * Formatea un valor en pesos colombianos: $89.000
 *
 * No se usa Intl.NumberFormat deliberadamente. Su salida para es-CO
 * varia entre versiones de ICU y en algunas inserta un espacio duro
 * entre el simbolo y la cifra, lo que produce un formato distinto
 * segun la maquina que haga el build. Esta implementacion es
 * deterministica.
 */
export function formatearPrecio(valor: number): string {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error(`Precio invalido: ${valor}`)
  }
  const entero = Math.round(valor).toString()
  return '$' + entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Recorta un texto para la meta description, que es donde un buscador corta
 * hacia los 155 caracteres y deja la frase a medias.
 *
 * Prefiere cerrar en un punto: una descripcion completa hasta la primera
 * frase se lee mejor que una frase larga cortada con puntos suspensivos. Solo
 * si la primera frase ya se pasa recorta por palabra.
 */
export function resumir(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto

  const punto = texto.lastIndexOf('. ', maximo)
  // Cerrar en el punto solo si la frase llena casi todo el espacio: cortar a
  // la mitad dejaba descripciones de 80 caracteres donde caben 150, y el
  // buscador rellena el hueco con texto de la pagina que no elegimos.
  if (punto >= maximo * 0.8) return texto.slice(0, punto + 1)

  const espacio = texto.lastIndexOf(' ', maximo - 1)
  return texto.slice(0, espacio > 0 ? espacio : maximo - 1).trimEnd() + '…'
}
