import { describe, expect, it } from 'vitest'
import { crearResolvedorLogos } from './imagenes'

const mapa = {
  '/src/assets/marcas-logos/aime-leon-dore.svg': '/_astro/aime-leon-dore.svg',
  '/src/assets/marcas-logos/represent.svg': '/_astro/represent.svg',
}

describe('crearResolvedorLogos', () => {
  it('resuelve el logo por el slug de la marca', () => {
    expect(crearResolvedorLogos(mapa)('aime-leon-dore')).toBe('/_astro/aime-leon-dore.svg')
  })

  it('la marca sin logo devuelve null en vez de lanzar: es el caso normal', () => {
    expect(crearResolvedorLogos(mapa)('nike')).toBeNull()
  })

  it('con el directorio vacio ninguna marca tiene logo', () => {
    expect(crearResolvedorLogos({})('aime-leon-dore')).toBeNull()
  })

  it('ignora lo que no sea un SVG', () => {
    const conIntruso = { '/src/assets/marcas-logos/lea.png': '/_astro/lea.png' }
    expect(crearResolvedorLogos(conIntruso)('lea')).toBeNull()
  })
})
