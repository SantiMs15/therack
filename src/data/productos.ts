import { TALLAS_HOMBRE, TALLAS_MUJER, validarCatalogo, type Producto } from './schema'

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
    nombre: 'Classic Printed Crew Neck',
    marca: 'Lacoste',
    categoria: 'hombre',
    precio: 290000,
    tallas: [...TALLAS_HOMBRE],
    descripcion: 'Buzo Lacoste en algodon, corte clasico, estampado frontal Classic Logo.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'lacoste-classic-printed-crew-neck-negro-frente.jpg',
            alt: 'Buzo Lacoste Classic Printed Crew Neck negro, vista frontal con el cocodrilo estampado y el texto Lacoste Paris',
          },
          {
            archivo: 'lacoste-classic-printed-crew-neck-negro-espalda.jpg',
            alt: 'Buzo Lacoste Classic Printed Crew Neck negro, vista de espalda lisa sin estampado',
          },
        ],
        disponible: true,
      },
      {
        color: 'Verde',
        slug: 'verde',
        imagenes: [
          {
            archivo: 'lacoste-classic-printed-crew-neck-verde-frente.jpg',
            alt: 'Buzo Lacoste Classic Printed Crew Neck verde oscuro, vista frontal con el cocodrilo estampado y el texto Lacoste Paris',
          },
          {
            archivo: 'lacoste-classic-printed-crew-neck-verde-espalda.jpg',
            alt: 'Buzo Lacoste Classic Printed Crew Neck verde oscuro, vista de espalda lisa sin estampado',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'multi-print-fleece-hoodie',
    nombre: 'Multi Print Fleece Hoodie',
    marca: 'Lacoste',
    categoria: 'hombre',
    precio: 295000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Hoodie Lacoste en tejido fleece, capucha ajustable, bolsillo canguro y estampado Jeu Set et Match en pecho y espalda.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'lacoste-multi-print-fleece-hoodie-negro-frente.jpg',
            alt: 'Hoodie Lacoste Multi Print Fleece negro, vista frontal con capucha, bolsillo canguro y el logo Jeu Set et Match bordado en el pecho',
          },
          {
            archivo: 'lacoste-multi-print-fleece-hoodie-negro-espalda.jpg',
            alt: 'Hoodie Lacoste Multi Print Fleece negro, vista de espalda con el estampado grande Lacoste Jeu Set et Match y el cocodrilo en blanco',
            // En el catalogo va la espalda: el estampado grande distingue esta
            // prenda de un hoodie negro cualquiera, el frente no.
            portada: true,
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'striped-cable-knit-polo',
    nombre: 'Striped Cable Knit Polo',
    marca: 'Lacoste',
    categoria: 'mujer',
    precio: 285000,
    // Toda la escala de mujer. La M sigue a la vista, tachada: que la prenda
    // llegue de la XXS a la XXL importa aunque hoy falte una talla del medio.
    tallas: TALLAS_MUJER.map((talla) => ({ talla, disponible: talla !== 'M' })),
    descripcion:
      'Polo Lacoste de punto trenzado en algodon, cuello y punos con ribete blanco en contraste, tres botones y cocodrilo bordado en el pecho.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'lacoste-striped-cable-knit-polo-azul-marino-frente.jpg',
            alt: 'Polo Lacoste de punto trenzado azul marino, vista frontal de la prenda sola con el cuello ribeteado en blanco, tres botones y el cocodrilo bordado en el pecho',
          },
          {
            archivo: 'lacoste-striped-cable-knit-polo-azul-marino-modelo-busto.jpg',
            alt: 'Polo Lacoste de punto trenzado azul marino puesto, plano medio de una modelo que lo lleva con shorts vaqueros blancos',
            // En la rejilla va esta foto: la prenda sola no deja ver como cae
            // ni a que altura queda. La ficha abre por el frente, donde se
            // aprecian el punto y el cocodrilo, y sigue por esta.
            portada: true,
          },
          {
            archivo: 'lacoste-striped-cable-knit-polo-azul-marino-espalda.jpg',
            alt: 'Polo Lacoste de punto trenzado azul marino, vista de espalda de la prenda sola, lisa salvo el ribete blanco del cuello y de los punos',
          },
          {
            archivo: 'lacoste-striped-cable-knit-polo-azul-marino-modelo-completo.jpg',
            alt: 'Polo Lacoste de punto trenzado azul marino puesto, plano entero de una modelo con shorts vaqueros blancos y tenis blancos',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'intarsia-wool-sweater',
    nombre: 'Intarsia Branded Wool Sweater',
    marca: 'Lacoste',
    categoria: 'hombre',
    precio: 385000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Sueter Lacoste en lana, cuello redondo acanalado, mangas raglan y el nombre Lacoste Paris tejido en intarsia sobre el pecho.',
    variantes: [
      {
        color: 'Crudo',
        slug: 'crudo',
        imagenes: [
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-frente.jpg',
            alt: 'Sueter Lacoste de lana color crudo, vista frontal con el nombre Lacoste tejido en azul y verde y la palabra Paris en rosa debajo',
          },
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-espalda.jpg',
            alt: 'Sueter Lacoste de lana color crudo, vista de espalda lisa, con las costuras raglan y el bajo acanalado a la vista',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'classic-quarter-zip-sweater',
    nombre: 'Classic Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    precio: 290000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Sueter Tommy Hilfiger de algodon, cuello alto acanalado con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Beige',
        slug: 'beige',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-frente.jpg',
            alt: 'Sueter Tommy Hilfiger beige, vista frontal de la prenda sola con la cremallera abierta hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-espalda.jpg',
            alt: 'Sueter Tommy Hilfiger beige, vista de espalda de la prenda sola, lisa, con la cinta a rayas asomando por el cuello',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-modelo.jpg',
            alt: 'Sueter Tommy Hilfiger beige puesto, plano medio de un modelo que lo lleva con una camiseta blanca debajo y pantalon chino',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'quarter-zip-sweater',
    nombre: 'Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    precio: 380000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Sueter Tommy Hilfiger de punto texturizado en algodon, cuello alto con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-frente.jpg',
            alt: 'Sueter Tommy Hilfiger azul marino, vista frontal de la prenda sola con la cremallera hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-espalda.jpg',
            alt: 'Sueter Tommy Hilfiger azul marino, vista de espalda de la prenda sola, con el punto texturizado en los hombros y las mangas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
