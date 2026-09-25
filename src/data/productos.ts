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
    slug: 'intarsia-wool-sweater',
    nombre: 'Intarsia Branded Wool Sweater',
    marca: 'Lacoste',
    categoria: 'hombre',
    tipo: 'sweater',
    precio: 385000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Suéter Lacoste en lana, cuello redondo acanalado, mangas raglán y el nombre Lacoste Paris tejido en intarsia sobre el pecho.',
    variantes: [
      {
        color: 'Crudo',
        slug: 'crudo',
        imagenes: [
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-frente.jpg',
            alt: 'Suéter Lacoste de lana color crudo, vista frontal con el nombre Lacoste tejido en azul y verde y la palabra Paris en rosa debajo',
          },
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-espalda.jpg',
            alt: 'Suéter Lacoste de lana color crudo, vista de espalda lisa, con las costuras raglán y el bajo acanalado a la vista',
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
    tipo: 'hoodie',
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
    tipo: 'polo',
    precio: 285000,
    // Toda la escala de mujer. La M sigue a la vista, tachada: que la prenda
    // llegue de la XXS a la XXL importa aunque hoy falte una talla del medio.
    tallas: TALLAS_MUJER.map((talla) => ({ talla, disponible: talla !== 'M' })),
    descripcion:
      'Polo Lacoste de punto trenzado en algodón, cuello y puños con ribete blanco en contraste, tres botones y cocodrilo bordado en el pecho.',
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
            alt: 'Polo Lacoste de punto trenzado azul marino, vista de espalda de la prenda sola, lisa salvo el ribete blanco del cuello y de los puños',
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
    slug: 'crew-neck-lacoste',
    nombre: 'Classic Printed Crew Neck',
    marca: 'Lacoste',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 290000,
    tallas: [...TALLAS_HOMBRE],
    descripcion: 'Buzo Lacoste en algodón, corte clásico, estampado frontal Classic Logo.',
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
    slug: 'classic-quarter-zip-sweater',
    nombre: 'Classic Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'sweater',
    precio: 290000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Suéter Tommy Hilfiger de algodón, cuello alto acanalado con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Beige',
        slug: 'beige',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-frente.jpg',
            alt: 'Suéter Tommy Hilfiger beige, vista frontal de la prenda sola con la cremallera abierta hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-espalda.jpg',
            alt: 'Suéter Tommy Hilfiger beige, vista de espalda de la prenda sola, lisa, con la cinta a rayas asomando por el cuello',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-modelo.jpg',
            alt: 'Suéter Tommy Hilfiger beige puesto, plano medio de un modelo que lo lleva con una camiseta blanca debajo y pantalón chino',
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
    tipo: 'sweater',
    precio: 380000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Suéter Tommy Hilfiger de punto texturizado en algodón, cuello alto con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-frente.jpg',
            alt: 'Suéter Tommy Hilfiger azul marino, vista frontal de la prenda sola con la cremallera hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-espalda.jpg',
            alt: 'Suéter Tommy Hilfiger azul marino, vista de espalda de la prenda sola, con el punto texturizado en los hombros y las mangas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'crewneck-favorite-t-shirt',
    nombre: 'Crewneck Favorite T-Shirt',
    marca: 'Tommy Hilfiger',
    categoria: 'mujer',
    tipo: 'camiseta',
    precio: 120000,
    tallas: [...TALLAS_MUJER],
    descripcion:
      'Camiseta Tommy Hilfiger de algodón, cuello redondo acanalado, corte entallado y la bandera bordada en el pecho.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-crewneck-favorite-t-shirt-azul-marino-frente.jpg',
            alt: 'Camiseta Tommy Hilfiger azul marino, vista frontal de la prenda sola con el cuello redondo y la bandera bordada en el pecho',
          },
          {
            archivo: 'tommy-hilfiger-crewneck-favorite-t-shirt-azul-marino-modelo.jpg',
            alt: 'Camiseta Tommy Hilfiger azul marino puesta, plano medio de una modelo que la lleva por dentro de unos jeans con cinturón negro',
            // Mismo criterio que el polo de punto trenzado: una camiseta lisa
            // azul marino sola no dice como cae ni a que altura queda, y en la
            // rejilla se confunde con cualquier otra. La ficha abre por el
            // frente, donde se ve la bandera bordada.
            portada: true,
          },
          {
            archivo: 'tommy-hilfiger-crewneck-favorite-t-shirt-azul-marino-espalda.jpg',
            alt: 'Camiseta Tommy Hilfiger azul marino, vista de espalda de la prenda sola, lisa, con el cuello acanalado',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'essentials-fleece-hoodie-ii',
    nombre: 'Fleece Hoodie II',
    marca: 'Essentials',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 320000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Hoodie Essentials de Fear of God en tejido fleece de algodón, corte oversize, capucha forrada y el logo Essentials Fear of God en el pecho y en la espalda.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'essentials-fleece-hoodie-ii-negro-frente.jpg',
            alt: 'Hoodie Essentials negro, vista frontal de la prenda sola con capucha, corte oversize y el logo Essentials Fear of God en pequeño sobre el pecho',
          },
          {
            archivo: 'essentials-fleece-hoodie-ii-negro-espalda.jpg',
            alt: 'Hoodie Essentials negro, vista de espalda con el logo Essentials Fear of God impreso en grande y en blanco entre los hombros',
            // Mismo criterio que el hoodie de Lacoste: en la rejilla va la
            // espalda, porque el logo grande distingue la prenda y el frente,
            // con el logo pequeño en el pecho, no.
            portada: true,
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
  {
    slug: 'mixed-media-puffer-jacket',
    nombre: "Men's Mixed-Media Puffer Jacket",
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'chaqueta',
    precio: 390000,
    // Una sola talla, y es la que queda: la rejilla y la ficha lo avisan en
    // burdeos. No se declara la escala entera con las demas tachadas porque
    // de esta chaqueta no hay mas que esta pieza, y un rango tachado da a
    // entender que las otras tallas pueden volver.
    tallas: ['S'],
    descripcion:
      'Chaqueta acolchada Tommy Hilfiger en negro, de tejido mixto: hombros y cuello en mate, cuerpo en nylon brillante. Cuello alto, cremallera completa con tirador de cinta bandera, dos bolsillos con cremallera y puños ajustables con velcro.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-mixed-media-puffer-jacket-negro-frente.jpg',
            alt: 'Chaqueta acolchada Tommy Hilfiger Mixed-Media negra, vista frontal con el cuello alto levantado, la cremallera cerrada y la bandera Tommy bordada en el pecho',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
  {
    slug: 'essentials-fleece-hoodie',
    nombre: 'Fleece Hoodie',
    marca: 'Essentials',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 420000,
    // De la S a la XL: no se declara TALLAS_HOMBRE entera porque de esta no
    // hay ni XS ni XXL, y ofrecerlas tachadas daria a entender que vuelven.
    tallas: ['S', 'M', 'L', 'XL'],
    descripcion:
      'Hoodie Essentials de Fear of God en gris jaspeado, tejido fleece de algodón, corte oversize con hombros caídos, capucha sin cordones y puños y bajo acanalados. Lleva Fear of God Essentials en letras arqueadas sobre el pecho y la espalda lisa.',
    variantes: [
      {
        color: 'Heather Grey',
        slug: 'heather-grey',
        imagenes: [
          {
            archivo: 'essentials-fleece-hoodie-gris-frente.jpg',
            alt: 'Hoodie Essentials gris jaspeado, vista frontal de la prenda sola con capucha, corte oversize y Fear of God Essentials en letras arqueadas de color crudo sobre el pecho',
          },
          {
            archivo: 'essentials-fleece-hoodie-gris-espalda.jpg',
            alt: 'Hoodie Essentials gris jaspeado, vista de espalda, lisa y sin ningún logo',
          },
          // Sin `portada`: manda la primera, que es el frente. Al reves que el
          // hoodie negro, este lleva el logo grande DELANTE y la espalda
          // limpia, asi que lo que distingue la prenda ya esta en el frente.
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
  {
    slug: 'unisphere-tee',
    nombre: 'Unisphere Tee',
    marca: 'Aimé Leon Dore',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 390000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Camiseta Aimé Leon Dore en algodón color crudo, cuello redondo acanalado y corte recto. Lleva el escudo Unisphere de Queens estampado en verde: pequeño sobre el pecho y en grande en la espalda, con la firma Aimé Leon Dore y la leyenda Queens, New York · The World’s Borough.',
    variantes: [
      {
        color: 'Pristine',
        slug: 'pristine',
        imagenes: [
          {
            archivo: 'aime-leon-dore-unisphere-tee-pristine-frente.jpg',
            alt: 'Camiseta Aimé Leon Dore color crudo, vista frontal de la prenda sola con el cuello redondo acanalado y el escudo Unisphere en verde, pequeño, sobre el pecho',
          },
          {
            archivo: 'aime-leon-dore-unisphere-tee-pristine-espalda.jpg',
            alt: 'Camiseta Aimé Leon Dore color crudo, vista de espalda con el globo Unisphere y los árboles de Flushing Meadows estampados en verde oscuro sobre la firma Aimé Leon Dore y la leyenda Queens, New York · The World’s Borough',
            // Mismo criterio que el hoodie negro: manda la espalda, que es
            // donde va el estampado grande. El frente solo lleva el escudo
            // pequeño y en la rejilla pasaria por una camiseta lisa.
            portada: true,
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'unisphere-waffle-thermal',
    nombre: 'Long-Sleeve Unisphere Waffle Thermal',
    marca: 'Aimé Leon Dore',
    categoria: 'hombre',
    // Buzo y no camiseta: el waffle es termico y pesa como una prenda de
    // abrigo, y en Bogota quien la busca escribe "buzo", no "camiseta manga
    // larga". El tipo es lo que nombra el titulo de la ficha en el buscador.
    tipo: 'buzo',
    precio: 660000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Aimé Leon Dore en punto waffle azul marino, cuello redondo acanalado y puños y bajo en rib. Lleva el escudo Unisphere de Queens estampado en crudo: pequeño sobre el pecho y en grande en la espalda, con la firma Aimé Leon Dore y la leyenda Queens, New York · The World’s Borough.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'aime-leon-dore-unisphere-waffle-thermal-azul-marino-frente.jpg',
            alt: 'Buzo Aimé Leon Dore de punto waffle azul marino, vista frontal de la prenda sola con el cuello redondo acanalado y el escudo Unisphere en crudo, pequeño, sobre el pecho',
          },
          {
            archivo: 'aime-leon-dore-unisphere-waffle-thermal-azul-marino-espalda.jpg',
            alt: 'Buzo Aimé Leon Dore de punto waffle azul marino, vista de espalda con el globo Unisphere y los árboles de Flushing Meadows estampados en crudo sobre la firma Aimé Leon Dore y la leyenda Queens, New York · The World’s Borough',
            // Mismo criterio que la Unisphere Tee: manda la espalda, que es
            // donde va el estampado grande. El frente solo lleva el escudo
            // pequeño y en la rejilla pasaria por un buzo azul liso.
            portada: true,
          },
          {
            archivo: 'aime-leon-dore-unisphere-waffle-thermal-azul-marino-modelo-espalda.jpg',
            alt: 'Buzo Aimé Leon Dore de punto waffle azul marino puesto, plano medio de un modelo de espaldas que lo lleva con vaqueros claros',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'souvenir-tee',
    nombre: 'Aimé Souvenir Tee',
    marca: 'Aimé Leon Dore',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 390000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Camiseta Aimé Leon Dore en algodón blanco, cuello redondo acanalado y corte recto. Lleva AIMÉ en letra universitaria azul arqueada sobre el pecho, con NYC dentro de un óvalo azul marino debajo.',
    variantes: [
      {
        color: 'Blanco',
        slug: 'blanco',
        // Una sola foto: la prenda lleva el estampado delante y la espalda va
        // lisa. La tarjeta esconde sola las flechas cuando no hay segunda
        // foto que rotar.
        imagenes: [
          {
            archivo: 'aime-leon-dore-souvenir-tee-blanco-frente.jpg',
            alt: 'Camiseta Aimé Leon Dore blanca, vista frontal de la prenda sola con la palabra AIMÉ en letra universitaria azul arqueada y NYC dentro de un óvalo azul marino debajo',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'geo-print-crewneck',
    nombre: 'Off-White New Balance Geo Print Crewneck',
    /* La primera colaboracion del catalogo: la prenda es de las dos marcas,
       no de una con la otra invitada. Sale al filtrar por cualquiera de las
       dos y esta en las dos paginas del archivo. Dentro de una de esas dos
       paginas se presenta con el nombre de esa marca; fuera, con los dos. */
    marca: ['Aimé Leon Dore', 'New Balance'],
    categoria: 'hombre',
    tipo: 'sweater',
    precio: 580000,
    // Solo del medio de la escala. Las puntas siguen a la vista, tachadas: el
    // rango que cubre la prenda es informacion util aunque hoy falte una talla.
    tallas: TALLAS_HOMBRE.map((talla) => ({
      talla,
      disponible: talla === 'S' || talla === 'M' || talla === 'L',
    })),
    descripcion:
      'Suéter Aimé Leon Dore × New Balance en punto de algodón color hueso, cuello redondo acanalado y puños y bajo en rib. Lleva el globo terráqueo de New Balance tramado en puntos grises, que cruza el pecho y baja por una manga, y la firma AIMÉ tejida abajo a la derecha.',
    variantes: [
      {
        color: 'Off-White',
        slug: 'off-white',
        imagenes: [
          {
            archivo: 'aime-leon-dore-geo-print-crewneck-off-white-frente.jpg',
            alt: 'Suéter Aimé Leon Dore × New Balance color hueso, vista frontal de la prenda sola con el globo terráqueo tramado en puntos grises cruzando el pecho y la firma AIMÉ tejida abajo a la derecha',
          },
          {
            archivo: 'aime-leon-dore-geo-print-crewneck-off-white-espalda.jpg',
            alt: 'Suéter Aimé Leon Dore × New Balance color hueso, vista de espalda con la otra mitad del globo tramado en puntos grises, que sigue desde el hombro hasta la manga',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
