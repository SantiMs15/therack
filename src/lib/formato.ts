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

/**
 * El titulo de una ficha en el resultado de busqueda.
 *
 * Quien busca el modelo exacto -- "lacoste classic printed crew neck" -- es
 * quien ya sabe lo que quiere comprar, y antes no lo veia en el resultado:
 * el nombre del fabricante solo estaba en el h1. Ahora entra si cabe, por
 * este orden:
 *
 *   1. "Buzo Lacoste Classic Printed Crew Neck · Negro — The Rack store"
 *   2. lo mismo sin el nombre de la tienda, que es lo que menos se busca
 *   3. "Buzo Lacoste · Negro — The Rack store", el de antes
 *   4. el de antes sin el nombre de la tienda
 *
 * `maximo` son los ~60 caracteres a partir de los que Google corta.
 */
export function tituloDeFicha({
  base,
  modelo,
  color,
  tienda,
  maximo = 60,
}: {
  /** Tipo y marca: "Buzo Lacoste". */
  base: string
  /** Nombre del fabricante: "Classic Printed Crew Neck". */
  modelo: string
  color: string
  /** Lo que se anade al final, con su separador: " — The Rack store". */
  tienda: string
  maximo?: number
}): { titulo: string; conTienda: boolean } {
  // "Aimé Souvenir Tee" detras de "Camiseta Aimé Leon Dore" repetiria el
  // Aimé: se sueltan las palabras con que abre el modelo si ya estan delante.
  const yaDichas = new Set(base.toLowerCase().split(/\s+/))
  const palabras = modelo.split(/\s+/)
  while (palabras.length > 1 && yaDichas.has(palabras[0]!.toLowerCase())) palabras.shift()
  const largo = `${base} ${palabras.join(' ')} · ${color}`
  const corto = `${base} · ${color}`

  const opciones = [
    { titulo: largo, conTienda: true },
    { titulo: largo, conTienda: false },
    { titulo: corto, conTienda: true },
  ]
  const cabe = opciones.find(
    (o) => (o.titulo + (o.conTienda ? tienda : '')).length <= maximo
  )
  // Ni el corto cabe con la tienda (una colaboracion de nombres largos): se
  // suelta la tienda antes que la marca o el color.
  return cabe ?? { titulo: corto, conTienda: false }
}
