import { crearResolvedorLogos } from './imagenes'

/**
 * Los logos de las marcas. Directorio propio y no el de las fotos de campana:
 * son SVG y no pasan por el pipeline de <Image /> -- un vector no tiene
 * densidades ni formatos que negociar -- asi que se piden como URL y se
 * sirven tal cual.
 *
 * `?url` y no `?raw`: el SVG que sale de Illustrator lleva sus estilos dentro,
 * en clases genericas (`.cls-1`). Incrustado en la pagina esas reglas caen en
 * el CSS global y el segundo logo que llegue pisaria el color del primero.
 * Como <img> cada archivo es su propio documento y no se hablan entre ellos.
 */
const mapa = import.meta.glob<string>('/src/assets/marcas-logos/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const resolverLogoMarca = crearResolvedorLogos(mapa)
