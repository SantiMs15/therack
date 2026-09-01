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
