import { validarCatalogo, type Producto } from './schema'

/**
 * FUENTE DE VERDAD DEL CATALOGO.
 *
 * Para anadir una prenda: anade un objeto a este array y deja sus fotos en
 * src/assets/productos/ con los nombres que declares. Las fotos deben ir en
 * ratio 3:4 vertical.
 *
 * Cada color es una VARIANTE con sus propias fotos, su propia disponibilidad
 * y su propia pagina (/producto/<slug>/<color>), para que el enlace del
 * mensaje de WhatsApp lleve al color exacto que miraba el cliente.
 *
 * Si algo esta mal, el build falla con un mensaje que dice que producto y que
 * campo. No publica una ficha rota.
 */
const catalogo: unknown[] = [
  {
    slug: 'crew-neck-lacoste',
    nombre: 'Camiseta Classic Printed Crew Neck',
    categoria: 'hombre',
    // PENDIENTE: precio real en COP. El 1 es un marcador deliberado: se ve
    // como "$1" en la ficha, imposible de confundir con un precio real.
    precio: 1,
    tallas: ['S', 'M', 'L', 'XL'], // PENDIENTE: confirmar tallas disponibles
    descripcion: 'PENDIENTE: descripcion del producto.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: ['crew-neck-lacoste-negro-1.jpg', 'crew-neck-lacoste-negro-2.jpg'],
        disponible: true,
      },
      {
        color: 'Verde',
        slug: 'verde',
        imagenes: [
          'crew-neck-lacoste-verde-1.jpg',
          'crew-neck-lacoste-verde-2.jpg',
          'crew-neck-lacoste-verde-3.jpg',
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  // --- DATOS SEMILLA: reemplazar por catalogo real ---
  {
    slug: 'blazer-lino-negro',
    nombre: 'Blazer de lino',
    categoria: 'mujer',
    precio: 189000,
    tallas: ['S', 'M', 'L'],
    descripcion: 'Corte recto en lino, forro interior y boton forrado.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: ['blazer-lino-negro-1.jpg', 'blazer-lino-negro-2.jpg'],
        disponible: true,
      },
    ],
    destacado: true,
  },
  {
    slug: 'camisa-oxford-blanca',
    nombre: 'Camisa Oxford',
    categoria: 'hombre',
    precio: 129000,
    tallas: ['M', 'L', 'XL'],
    descripcion: 'Algodon Oxford, cuello button-down, corte regular.',
    variantes: [
      {
        color: 'Blanco',
        slug: 'blanco',
        imagenes: ['camisa-oxford-blanca-1.jpg'],
        disponible: true,
      },
    ],
    destacado: true,
  },
  {
    slug: 'botin-cuero-cafe',
    nombre: 'Botin de cuero',
    categoria: 'calzado',
    precio: 249000,
    tallas: ['38', '39', '40', '41'],
    descripcion: 'Cuero natural, suela de goma, cierre lateral.',
    variantes: [
      {
        color: 'Cafe',
        slug: 'cafe',
        imagenes: ['botin-cuero-cafe-1.jpg'],
        disponible: false,
      },
    ],
    destacado: false,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
