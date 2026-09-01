import { describe, it, expect } from 'vitest'
import { construirEnlaceWhatsApp } from './whatsapp'

const base = {
  telefono: '+57 300 123 4567',
  nombre: 'Blazer de lino',
  url: 'https://therackstore.co/producto/blazer-lino-negro',
}

describe('construirEnlaceWhatsApp', () => {
  it('apunta a wa.me con el telefono en digitos', () => {
    expect(construirEnlaceWhatsApp(base)).toContain('https://wa.me/573001234567?text=')
  })

  it('elimina espacios, guiones y el signo mas del telefono', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, telefono: '+57-300-123-4567' })
    expect(enlace).toContain('wa.me/573001234567')
  })

  it('incluye el nombre del producto en el mensaje', () => {
    const enlace = construirEnlaceWhatsApp(base)
    expect(decodeURIComponent(enlace)).toContain('Blazer de lino')
  })

  it('incluye la talla cuando se indica', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, talla: 'M' })
    expect(decodeURIComponent(enlace)).toContain('(talla M)')
  })

  it('omite la talla cuando no se indica', () => {
    expect(decodeURIComponent(construirEnlaceWhatsApp(base))).not.toContain('talla')
  })

  it('incluye la url del producto', () => {
    expect(decodeURIComponent(construirEnlaceWhatsApp(base))).toContain(base.url)
  })

  it('codifica el salto de linea', () => {
    expect(construirEnlaceWhatsApp(base)).toContain('%0A')
  })

  it('rechaza un telefono demasiado corto', () => {
    expect(() => construirEnlaceWhatsApp({ ...base, telefono: '300' }))
      .toThrow(/tel[eé]fono/i)
  })
})
