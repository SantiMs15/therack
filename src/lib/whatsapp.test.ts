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

  it('incluye el color cuando se indica', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, color: 'Negro' })
    expect(decodeURIComponent(enlace)).toContain('(Negro)')
  })

  it('incluye color y talla juntos, en ese orden', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, color: 'Verde', talla: 'M' })
    expect(decodeURIComponent(enlace)).toContain('(Verde, talla M)')
  })

  it('omite el color cuando no se indica', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, talla: 'M' })
    expect(decodeURIComponent(enlace)).toContain('(talla M)')
    expect(decodeURIComponent(enlace)).not.toContain(',')
  })

  it('rechaza un telefono demasiado corto', () => {
    expect(() => construirEnlaceWhatsApp({ ...base, telefono: '300' }))
      .toThrow(/tel[eé]fono/i)
  })

  it('rechaza un numero nacional sin indicativo ni signo mas', () => {
    expect(() => construirEnlaceWhatsApp({ ...base, telefono: '3001234567' }))
      .toThrow(/tel[eé]fono/i)
  })

  it('rechaza un numero con indicativo pero sin el signo mas', () => {
    expect(() => construirEnlaceWhatsApp({ ...base, telefono: '57 300 123 4567' }))
      .toThrow(/tel[eé]fono/i)
  })
})
