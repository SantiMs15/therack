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
 * Prefiere cerrar en un punto: una frase completa se lee mejor que una
 * cortada con puntos suspensivos. Pero solo si ese punto aprovecha tres
 * cuartos del espacio: la primera frase de una ficha es la generica (tela,
 * cuello, corte) y la que distingue la prenda es la segunda, asi que parar
 * pronto dejaba un resultado igual para media tienda. Si no, sigue y recorta
 * por palabra.
 */
export function resumir(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto

  const punto = texto.lastIndexOf('. ', maximo)
  if (punto > maximo * 0.75) return texto.slice(0, punto + 1)

  const espacio = texto.lastIndexOf(' ', maximo - 1)
  // Sin la coma o los dos puntos en que caiga el corte: "arqueada,…" se lee
  // como un error.
  return texto.slice(0, espacio > 0 ? espacio : maximo - 1).replace(/[\s,;:]+$/, '') + '…'
}
