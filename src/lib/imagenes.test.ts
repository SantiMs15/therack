import { describe, it, expect } from 'vitest'
import { crearResolvedorImagenes } from './imagenes'

const falsa = (n: string) => ({ default: { src: `/_astro/${n}`, width: 900, height: 1200, format: 'jpg' } })

const mapa = {
  '/src/assets/productos/blazer-lino-negro-1.jpg': falsa('blazer-lino-negro-1.jpg'),
  '/src/assets/productos/camisa-oxford-blanca-1.jpg': falsa('camisa-oxford-blanca-1.jpg'),
} as any

describe('crearResolvedorImagenes', () => {
  it('resuelve una imagen por su nombre de archivo', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(resolver('blazer-lino-negro-1.jpg').src).toBe('/_astro/blazer-lino-negro-1.jpg')
  })

  it('lanza si la imagen no existe', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/no-existe\.jpg/)
  })

  it('el error dice donde colocar el archivo', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/src\/assets\/productos/)
  })

  it('el error lista las imagenes disponibles', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/camisa-oxford-blanca-1\.jpg/)
  })

  it('funciona con un mapa vacio y lo dice', () => {
    const resolver = crearResolvedorImagenes({} as any)
    expect(() => resolver('cualquiera.jpg')).toThrow(/ninguna/)
  })
})
