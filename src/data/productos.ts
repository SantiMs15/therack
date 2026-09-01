import { validarCatalogo, type Producto } from './schema'

/**
 * FUENTE DE VERDAD DEL CATALOGO.
 *
 * Para anadir una prenda: anade un objeto a este array y deja sus fotos
 * en src/assets/productos/ con los nombres que declares en `imagenes`.
 * Las fotos deben ir en ratio 3:4 vertical.
 *
 * Si algo esta mal, el build falla con un mensaje que dice que producto
 * y que campo. No publica una ficha rota.
 *
 * DATOS SEMILLA: reemplazar por el catalogo real.
 */
const catalogo: unknown[] = [
  {
    slug: 'blazer-lino-negro',
    nombre: 'Blazer de lino',
    categoria: 'mujer',
    precio: 189000,
    tallas: ['S', 'M', 'L'],
    descripcion: 'Corte recto en lino, forro interior y boton forrado.',
    imagenes: ['blazer-lino-negro-1.jpg', 'blazer-lino-negro-2.jpg'],
    destacado: true,
    disponible: true,
  },
  {
    slug: 'camisa-oxford-blanca',
    nombre: 'Camisa Oxford',
    categoria: 'hombre',
    precio: 129000,
    tallas: ['M', 'L', 'XL'],
    descripcion: 'Algodon Oxford, cuello button-down, corte regular.',
    imagenes: ['camisa-oxford-blanca-1.jpg'],
    destacado: true,
    disponible: true,
  },
  {
    slug: 'botin-cuero-cafe',
    nombre: 'Botin de cuero',
    categoria: 'calzado',
    precio: 249000,
    tallas: ['38', '39', '40', '41'],
    descripcion: 'Cuero natural, suela de goma, cierre lateral.',
    imagenes: ['botin-cuero-cafe-1.jpg'],
    destacado: false,
    disponible: false,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
