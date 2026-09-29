import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { validarCatalogo, type Producto } from '../data/schema'
import { componerTarjeta, descripcionTarjeta, TARJETA } from './tarjeta-compartir'

function catalogo(campos: Record<string, unknown> = {}): Producto {
  return validarCatalogo([
    {
      slug: 'chaqueta-puffer',
      nombre: 'Puffer Jacket',
      marca: 'Tommy Hilfiger',
      categoria: 'hombre',
      tipo: 'chaqueta',
      precio: 390_000,
      tallas: ['S'],
      descripcion: 'Chaqueta acolchada.',
      variantes: [
        { color: 'Negro', slug: 'negro', imagenes: ['x.jpg'], disponible: true },
      ],
      destacado: true,
      ...campos,
    },
  ])[0]!
}

describe('descripcionTarjeta', () => {
  it('abre con el precio y el envio, y sigue con la descripcion', () => {
    expect(descripcionTarjeta(catalogo(), 'Chaqueta Tommy Hilfiger acolchada.')).toBe(
      '$390.000 · Envío gratis a toda Colombia. Chaqueta Tommy Hilfiger acolchada.'
    )
  })

  it('rebajada, dice el precio de antes y cuanto baja', () => {
    const p = catalogo({ precio: 195_000, precioAntes: 390_000 })
    expect(descripcionTarjeta(p, 'X.')).toBe(
      '$195.000 (antes $390.000, −50 %) · Envío gratis a toda Colombia. X.'
    )
  })
})

describe('componerTarjeta', () => {
  it('saca un JPEG de 1200x630 aunque la foto sea vertical', async () => {
    const vertical = await sharp({
      create: { width: 300, height: 400, channels: 3, background: '#336699' },
    })
      .png()
      .toBuffer()
    const meta = await sharp(await componerTarjeta(vertical)).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(TARJETA.ancho)
    expect(meta.height).toBe(TARJETA.alto)
  })
})
