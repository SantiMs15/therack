import { TALLA_UNICA, TALLAS_HOMBRE, TALLAS_MUJER, validarCatalogo, type Producto } from './schema'

/**
 * FUENTE DE VERDAD DEL CATALOGO.
 *
 * Para anadir una prenda: anade un objeto a este array y deja sus fotos en
 * src/assets/productos/ con los nombres que declares. Las fotos deben ir en
 * ratio 3:4 vertical.
 *
 * El slug de la prenda y el nombre de sus fotos empiezan por la marca
 * (lacoste-..., tommy-hilfiger-...): asi se ordenan solos en la carpeta y la
 * URL ya dice de quien es la prenda. Si cambias el slug de una prenda
 * publicada, anade su redireccion en public/.htaccess.
 *
 * Cada color es una VARIANTE con sus propias fotos, su propia disponibilidad
 * y su propia pagina (/producto/<slug>/<color>), para que el enlace del
 * mensaje de WhatsApp lleve al color exacto que miraba el cliente.
 *
 * La marca tiene que existir en src/data/marcas.ts: es la que da la pagina a
 * la que enlaza la ficha.
 *
 * Si algo esta mal, el build falla con un mensaje que dice que producto y que
 * campo. No publica una ficha rota.
 */
const catalogo: unknown[] = [
  {
    slug: 'lacoste-intarsia-wool-sweater',
    nombre: 'Intarsia Branded Wool Sweater',
    marca: 'Lacoste',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 483000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Lacoste en lana, cuello redondo acanalado, mangas raglán y el nombre Lacoste Paris tejido en intarsia sobre el pecho.',
    variantes: [
      {
        color: 'Crudo',
        slug: 'crudo',
        imagenes: [
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-frente.jpg',
            alt: 'Buzo Lacoste de lana color crudo, vista frontal con el nombre Lacoste tejido en azul y verde y la palabra Paris en rosa debajo',
          },
          {
            archivo: 'lacoste-intarsia-wool-sweater-crudo-espalda.jpg',
            alt: 'Buzo Lacoste de lana color crudo, vista de espalda lisa, con las costuras raglán y el bajo acanalado a la vista',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'lacoste-multi-print-fleece-hoodie',
    nombre: 'Multi Print Fleece Hoodie',
    marca: 'Lacoste',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 405000,
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
    slug: 'lacoste-striped-cable-knit-polo',
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
    slug: 'lacoste-classic-printed-crew-neck',
    nombre: 'Classic Printed Crew Neck',
    marca: 'Lacoste',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 353000,
    // Toda la escala: la del verde. El negro declara las suyas abajo.
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Lacoste Classic Printed Crew Neck original en algodón, corte clásico y estampado Classic Logo al frente.',
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
        // De la M a la XXL: sin XS ni S, y sin tacharlas, que daria a
        // entender que vuelven.
        tallas: ['M', 'L', 'XL', 'XXL'],
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
    slug: 'tommy-hilfiger-classic-quarter-zip-sweater',
    nombre: 'Classic Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 345000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Tommy Hilfiger de algodón, cuello alto acanalado con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Beige',
        slug: 'beige',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-frente.jpg',
            alt: 'Buzo Tommy Hilfiger beige, vista frontal de la prenda sola con la cremallera abierta hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-espalda.jpg',
            alt: 'Buzo Tommy Hilfiger beige, vista de espalda de la prenda sola, lisa, con la cinta a rayas asomando por el cuello',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-beige-modelo.jpg',
            alt: 'Buzo Tommy Hilfiger beige puesto, plano medio de un modelo que lo lleva con una camiseta blanca debajo y pantalón chino',
          },
        ],
        disponible: true,
      },
      {
        color: 'Borgoña',
        slug: 'borgona',
        // Mismo precio que el beige: lo hereda de la prenda.
        tallas: ['M'],
        imagenes: [
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-borgona-frente.jpg',
            alt: 'Buzo Tommy Hilfiger borgoña, vista frontal de la prenda sola con la cremallera abierta hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-classic-quarter-zip-sweater-borgona-espalda.jpg',
            alt: 'Buzo Tommy Hilfiger borgoña, vista de espalda de la prenda sola, lisa, con la cinta a rayas asomando por el cuello',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'tommy-hilfiger-quarter-zip-sweater',
    nombre: 'Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 380000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Tommy Hilfiger de punto texturizado en algodón, cuello alto con cremallera hasta el pecho y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-frente.jpg',
            alt: 'Buzo Tommy Hilfiger azul marino, vista frontal de la prenda sola con la cremallera hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-quarter-zip-sweater-azul-marino-espalda.jpg',
            alt: 'Buzo Tommy Hilfiger azul marino, vista de espalda de la prenda sola, con el punto texturizado en los hombros y las mangas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'tommy-hilfiger-crewneck-favorite-t-shirt',
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
    precio: 428000,
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
            // con el logo pequeno en el pecho, no.
            portada: true,
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'tommy-hilfiger-mixed-media-puffer-jacket',
    nombre: 'Men\'s Mixed-Media Puffer Jacket',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'chaqueta',
    precio: 515000,
    // Una sola talla, y es la que queda: la rejilla y la ficha lo avisan en
    // burdeos. No se declara la escala entera con las demas tachadas porque
    // de esta chaqueta no hay mas que esta pieza, y un rango tachado da a
    // entender que las otras tallas pueden volver.
    tallas: ['S'],
    // Comun a los dos colores: el negro es liso y brillante, el azul marino
    // lleva el monograma TH en jacquard. La ficha de cada uno ya dice su color.
    descripcion:
      'Chaqueta acolchada Tommy Hilfiger de tejido mixto: hombros y cuello en nylon mate, cuerpo acolchado. Cuello alto, cremallera completa con tirador de cinta bandera, dos bolsillos con cremallera y puños ajustables con velcro. En negro brillante o en azul marino con el monograma TH en jacquard.',
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
      {
        color: 'Print Navy Jacquard',
        slug: 'print-navy-jacquard',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-mixed-media-puffer-jacket-print-navy-jacquard-frente.jpg',
            alt: 'Chaqueta acolchada Tommy Hilfiger azul marino, vista frontal de la prenda sola con el canesú liso, el cuerpo y las mangas con el monograma TH en jacquard, la bandera en el pecho y el parche en la manga',
          },
          {
            archivo: 'tommy-hilfiger-mixed-media-puffer-jacket-print-navy-jacquard-modelo.jpg',
            alt: 'Chaqueta acolchada Tommy Hilfiger azul marino puesta, plano medio de un modelo con las manos en los bolsillos, camiseta blanca debajo y jeans claros',
          },
          {
            archivo: 'tommy-hilfiger-mixed-media-puffer-jacket-print-navy-jacquard-espalda.jpg',
            alt: 'Chaqueta acolchada Tommy Hilfiger azul marino, vista de espalda de la prenda sola con el canesú liso y el monograma TH en jacquard en el cuerpo y las mangas',
          },
        ],
        // Solo este color va a Sale: rebajado desde el precio del negro, que
        // sigue completo. Tambien una sola S.
        precio: 390000,
        precioAnterior: 515000,
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
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'aime-leon-dore-unisphere-tee',
    nombre: 'Unisphere Tee',
    marca: 'Aimé Leon Dore',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 382000,
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
            // En la rejilla va la espalda: el escudo grande es lo que se
            // reconoce de lejos; el frente lo lleva pequeno.
            portada: true,
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'aime-leon-dore-unisphere-waffle-thermal',
    nombre: 'Long-Sleeve Unisphere Waffle Thermal',
    marca: 'Aimé Leon Dore',
    categoria: 'hombre',
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
            // Igual que la camiseta Unisphere: el escudo grande de la espalda
            // es el que vende la prenda en la rejilla.
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
    slug: 'aime-leon-dore-souvenir-tee',
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
    slug: 'aime-leon-dore-new-balance-geo-print-crewneck',
    nombre: 'Off-White New Balance Geo Print Crewneck',
    marca: ['Aimé Leon Dore', 'New Balance'],
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 580000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: !['XS', 'XL', 'XXL'].includes(talla) })),
    descripcion:
      'Buzo Aimé Leon Dore × New Balance en punto de algodón color hueso, cuello redondo acanalado y puños y bajo en rib. Lleva el globo terráqueo de New Balance tramado en puntos grises, que cruza el pecho y baja por una manga, y la firma AIMÉ tejida abajo a la derecha.',
    variantes: [
      {
        color: 'Off-White',
        slug: 'off-white',
        imagenes: [
          {
            archivo: 'aime-leon-dore-geo-print-crewneck-off-white-frente.jpg',
            alt: 'Buzo Aimé Leon Dore × New Balance color hueso, vista frontal de la prenda sola con el globo terráqueo tramado en puntos grises cruzando el pecho y la firma AIMÉ tejida abajo a la derecha',
          },
          {
            archivo: 'aime-leon-dore-geo-print-crewneck-off-white-espalda.jpg',
            alt: 'Buzo Aimé Leon Dore × New Balance color hueso, vista de espalda con la otra mitad del globo tramado en puntos grises, que sigue desde el hombro hasta la manga',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'kidsuper-studios-astronaut-tee',
    nombre: 'Astronaut Tee',
    marca: 'KidSuper Studios',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 217000,
    tallas: ['M'],
    descripcion:
      'Camiseta KidSuper Studios en algodón color crudo, cuello redondo acanalado y corte holgado de hombro caído. Lleva al frente un astronauta pintado a mano en acuarela, flotando con un libro abierto, y la firma de la marca con la leyenda A discovery tour of our universe.',
    variantes: [
      {
        color: 'Blanco',
        slug: 'blanco',
        imagenes: [
          {
            archivo: 'kidsuper-studios-astronaut-tee-blanco-frente.jpg',
            alt: 'Camiseta KidSuper Studios color crudo, vista frontal de la prenda sola con un astronauta en acuarela azul y amarillo flotando con un libro abierto y la firma de la marca en azul a la derecha',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'pleasures-twitch-studded-crewneck-t-shirt',
    nombre: 'Twitch Studded Crewneck T-Shirt',
    marca: 'Pleasures',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 217000,
    tallas: ['M', 'L'],
    descripcion:
      'Camiseta Pleasures en algodón, cuello redondo acanalado y corte holgado. Cruza el pecho el logo Pleasures en letra gótica arqueada, aplicado en cuero sintético negro y tachonado con remaches plateados. En negro con lavado desgastado o en blanco.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'pleasures-twitch-studded-crewneck-t-shirt-negro-frente.jpg',
            alt: 'Camiseta Pleasures negra desgastada, vista frontal de la prenda sola con el logo Pleasures en letra gótica arqueada, aplicado en cuero negro con remaches plateados, y la etiqueta roja en el cuello',
          },
        ],
        disponible: true,
        // Del negro queda una sola talla; del blanco, dos.
        tallas: ['M'],
      },
      {
        color: 'Blanco',
        slug: 'blanco',
        imagenes: [
          {
            archivo: 'pleasures-twitch-studded-crewneck-t-shirt-blanco-frente.jpg',
            alt: 'Camiseta Pleasures blanca, vista frontal de la prenda sola con el logo Pleasures en letra gótica arqueada, aplicado en cuero negro con remaches plateados, y la etiqueta roja en el cuello',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'eme-studios-pinstripe-night-sky-knit-sweater',
    nombre: 'Pinstripe Night Sky Knit Sweater',
    marca: 'Eme Studios',
    categoria: 'hombre',
    // Corte sin genero: tambien sale en el catalogo de mujer.
    tambienEn: ['mujer'],
    tipo: 'buzo',
    precio: 441000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Eme Studios de punto grueso a rayas finas blancas sobre azul marino, cuello redondo acanalado, hombro caído y corte amplio. Lleva EME en granate aplicado sobre el pecho. Unisex.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'eme-studios-pinstripe-night-sky-knit-sweater-azul-marino-frente.jpg',
            alt: 'Buzo Eme Studios azul marino con rayas finas blancas, vista frontal de la prenda sola con EME en letras granate sobre el pecho',
          },
          {
            archivo: 'eme-studios-pinstripe-night-sky-knit-sweater-azul-marino-modelo-hombre.jpg',
            alt: 'Chico de cuerpo entero con el buzo Eme Studios azul marino a rayas y EME en granate, jean ancho y una gorra granate colgada del bolsillo',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'tommy-hilfiger-back-flag-logo-pullover-hoodie',
    nombre: 'Back Flag Logo Pullover Hoodie',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 370000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: ['XS', 'L', 'XL'].includes(talla) })),
    descripcion:
      'Hoodie Tommy Hilfiger en felpa de algodón, capucha con cordones, bolsillo canguro, bandera bordada al frente y gran bandera tricolor en la espalda con el nombre de la marca en relieve.',
    variantes: [
      {
        color: 'Crema',
        slug: 'crema',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-back-flag-logo-pullover-hoodie-crema-frente.jpg',
            alt: 'Hoodie Tommy Hilfiger crema, vista frontal de la prenda sola con capucha de cordones, bolsillo canguro y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-back-flag-logo-pullover-hoodie-crema-espalda.jpg',
            alt: 'Hoodie Tommy Hilfiger crema, vista de espalda con la gran bandera azul marino y roja y el nombre Tommy Hilfiger en relieve',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'tommy-hilfiger-cable-knit-quarter-zip-sweater',
    nombre: 'Cable Knit Quarter-Zip Sweater',
    marca: 'Tommy Hilfiger',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 365000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Buzo Tommy Hilfiger de punto trenzado en algodón, cuello alto con cremallera hasta el pecho, cinta tricolor en el cuello y bandera bordada en el costado.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'tommy-hilfiger-cable-knit-quarter-zip-sweater-negro-frente.jpg',
            alt: 'Buzo Tommy Hilfiger negro de punto trenzado, vista frontal de la prenda sola con la cremallera hasta el pecho y la bandera bordada a la derecha',
          },
          {
            archivo: 'tommy-hilfiger-cable-knit-quarter-zip-sweater-negro-espalda.jpg',
            alt: 'Buzo Tommy Hilfiger negro de punto trenzado, vista de espalda de la prenda sola con la cinta tricolor en el cuello',
          },
          {
            archivo: 'tommy-hilfiger-cable-knit-quarter-zip-sweater-negro-modelo.jpg',
            alt: 'Buzo Tommy Hilfiger negro puesto, plano medio de un modelo que lo lleva con camisa blanca debajo y jean azul',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'ralph-lauren-loopback-fleece-hoodie',
    nombre: 'Loopback Fleece Hoodie',
    marca: 'Ralph Lauren',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 312000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Hoodie Polo Ralph Lauren en felpa loopback de algodón, capucha con cordones, bolsillo canguro y el jugador de polo bordado tono sobre tono en el pecho.',
    variantes: [
      {
        color: 'Crema',
        slug: 'crema',
        imagenes: [
          {
            archivo: 'ralph-lauren-loopback-fleece-hoodie-crema-frente.jpg',
            alt: 'Hoodie Polo Ralph Lauren crema, vista frontal de la prenda sola con capucha de cordones, bolsillo canguro y el jugador de polo bordado a la derecha',
          },
          {
            archivo: 'ralph-lauren-loopback-fleece-hoodie-crema-modelo.jpg',
            alt: 'Hoodie Polo Ralph Lauren crema puesto, plano medio de un modelo que lo lleva con camiseta blanca debajo, gorra beige y pantalón caqui',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'diesel-zip-shoulder-hoodie',
    nombre: 'Zip Shoulder Hoodie',
    marca: 'Diesel',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 550000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: ['S', 'M', 'L', 'XL'].includes(talla) })),
    descripcion:
      'Hoodie Diesel en felpa de algodón, corte amplio con mangas raglán, paneles blancos con cremalleras en los hombros, capucha con cordones, bolsillo canguro y logo Diesel en el pecho.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'diesel-zip-shoulder-hoodie-negro-frente.jpg',
            alt: 'Hoodie Diesel negro, vista frontal de la prenda sola con paneles blancos y cremalleras en los hombros, bolsillo canguro y logo Diesel en el pecho',
          },
          {
            archivo: 'diesel-zip-shoulder-hoodie-negro-modelo.jpg',
            alt: 'Hoodie Diesel negro puesto, plano medio de un modelo que lo lleva con pantalón negro',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'diesel-ginn-crewneck-sweatshirt',
    nombre: 'Ginn Crewneck Sweatshirt',
    marca: 'Diesel',
    categoria: 'hombre',
    tipo: 'buzo',
    precio: 310000,
    tallas: ['M'],
    descripcion:
      'Buzo Diesel en felpa de algodón, cuello redondo acanalado y estampado Diesel Industry Denim Division en el pecho.',
    variantes: [
      {
        color: 'Azul marino',
        slug: 'azul-marino',
        imagenes: [
          {
            archivo: 'diesel-ginn-crewneck-sweatshirt-azul-marino-frente.jpg',
            alt: 'Buzo Diesel azul marino, vista frontal de la prenda sola con el estampado Diesel Industry Denim Division en azul y rojo en el pecho',
          },
          {
            archivo: 'diesel-ginn-crewneck-sweatshirt-azul-marino-modelo.jpg',
            alt: 'Buzo Diesel azul marino puesto, plano medio de frente de un modelo que lo lleva con jean gris',
          },
          {
            archivo: 'diesel-ginn-crewneck-sweatshirt-azul-marino-modelo-espalda.jpg',
            alt: 'Buzo Diesel azul marino puesto, vista de espalda lisa de un modelo que lo lleva con jean gris',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'diesel-successful-living-hoodie',
    nombre: 'Successful Living Hoodie',
    marca: 'Diesel',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 430000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: ['S', 'M', 'L'].includes(talla) })),
    descripcion:
      'Hoodie Diesel en felpa de algodón, capucha con cordones, bolsillo canguro con costuras en contraste, logo Diesel en la manga y estampado Successful Living en la espalda, ambos en rosa.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'diesel-successful-living-hoodie-negro-frente.jpg',
            alt: 'Hoodie Diesel negro, vista frontal de la prenda sola con capucha de cordones, bolsillo canguro y el logo Diesel en rosa en la manga',
          },
          {
            archivo: 'diesel-successful-living-hoodie-negro-espalda.jpg',
            alt: 'Hoodie Diesel negro, vista de espalda de la prenda sola con el estampado Successful Living en rosa',
          },
          {
            archivo: 'diesel-successful-living-hoodie-negro-detalle.jpg',
            alt: 'Hoodie Diesel negro puesto, detalle de la manga con el logo Diesel en rosa y el bolsillo canguro',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'adidas-szn-french-terry-loose-pants',
    nombre: 'SZN French Terry Loose Pants',
    marca: 'Adidas',
    // Corte unisex: va en el catalogo de mujer y sale tambien en el de hombre.
    categoria: 'mujer',
    tambienEn: ['hombre'],
    tipo: 'pantalon',
    precio: 161000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Pantalón Adidas en french terry de algodón, corte holgado, cintura elástica con cordón, puños elásticos en el tobillo y el logo Adidas tono sobre tono en la pierna.',
    variantes: [
      {
        color: 'Beige',
        slug: 'beige',
        imagenes: [
          {
            archivo: 'adidas-szn-french-terry-loose-pants-beige-frente.jpg',
            alt: 'Pantalón Adidas beige, vista frontal de la prenda sola con cintura elástica y cordón, puños en el tobillo y el logo Adidas en la pierna',
          },
          {
            archivo: 'adidas-szn-french-terry-loose-pants-beige-modelo.jpg',
            alt: 'Pantalón Adidas beige puesto, plano de la cintura para abajo de una persona que lo lleva con buzo a juego y tenis blancos',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'adidas-adilenium-season-5-cargo-pants',
    nombre: 'Adilenium Season 5 Cargo Pants',
    marca: 'Adidas',
    categoria: 'hombre',
    tipo: 'pantalon',
    precio: 330000,
    // Una sola pieza, en talla de cintura: la ficha la avisa como ultima talla.
    tallas: ['34'],
    descripcion:
      'Pantalón cargo Adidas Originals en ripstop negro, corte ancho, cintura elástica con botón, bolsillo cargo con el trébol bordado y franjas laterales estampadas con las tres rayas.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'adidas-adilenium-season-5-cargo-pants-negro-frente.jpg',
            alt: 'Pantalón cargo Adidas negro, vista frontal de la prenda sola con franjas laterales estampadas, las tres rayas y el bolsillo cargo con el trébol',
          },
          {
            archivo: 'adidas-adilenium-season-5-cargo-pants-negro-modelo.jpg',
            alt: 'Pantalón cargo Adidas negro puesto, plano de la cintura para abajo de un modelo con camiseta negra y tenis Superstar negros',
          },
          {
            archivo: 'adidas-adilenium-season-5-cargo-pants-negro-detalle.jpg',
            alt: 'Pantalón cargo Adidas negro puesto, detalle del bolsillo cargo con el trébol bordado sobre la franja estampada con las tres rayas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'adidas-adicolor-spacer-oversized-hoodie',
    nombre: 'Adicolor Spacer Oversized Hoodie',
    marca: 'Adidas',
    categoria: 'hombre',
    tipo: 'hoodie',
    precio: 255000,
    tallas: [...TALLAS_HOMBRE],
    descripcion:
      'Hoodie Adidas Originals de corte oversize en tejido spacer, cremallera completa, capucha con cordones, bolsillos canguro, las tres rayas en las mangas y el trébol en el pecho.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'adidas-adicolor-spacer-oversized-hoodie-negro-frente.jpg',
            alt: 'Hoodie Adidas negro con cremallera, vista frontal de la prenda sola con las tres rayas blancas en las mangas y el trébol blanco en el pecho',
          },
          {
            archivo: 'adidas-adicolor-spacer-oversized-hoodie-negro-modelo.jpg',
            alt: 'Hoodie Adidas negro puesto y abierto, plano medio de un modelo que lo lleva con camiseta negra y jean negro ancho',
          },
          {
            archivo: 'adidas-adicolor-spacer-oversized-hoodie-negro-modelo-espalda.jpg',
            alt: 'Hoodie Adidas negro puesto, vista de espalda lisa con la capucha caída y las rayas blancas en el hombro',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'nike-flyfree-shield-101',
    nombre: 'Flyfree Shield 101',
    marca: 'Nike',
    // Accesorio sin genero: sale tambien en los catalogos de mujer y hombre.
    categoria: 'accesorios',
    tambienEn: ['mujer', 'hombre'],
    tipo: 'gafas',
    precio: 315000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Gafas de sol deportivas Nike de media montura blanca, lente envolvente espejada Nike Max Optics en rojo y violeta y patillas azul marino con agarre.',
    variantes: [
      {
        color: 'Blanco',
        slug: 'blanco',
        imagenes: [
          {
            archivo: 'nike-flyfree-shield-101-blanco-frente.jpg',
            alt: 'Gafas Nike Flyfree Shield blancas, vista de frente con la lente envolvente espejada en rojo y violeta y el puente azul marino',
          },
          {
            archivo: 'nike-flyfree-shield-101-blanco-lado.jpg',
            alt: 'Gafas Nike Flyfree Shield blancas, vista de lado con la lente espejada, el swoosh negro y la patilla azul marino',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-short-sleeve-logo-rashguard',
    nombre: 'Short-Sleeve Logo Rashguard',
    marca: 'Karl Lagerfeld',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 235000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: talla !== 'XS' })),
    descripcion:
      'Camiseta Karl Lagerfeld de manga corta tipo rashguard, en tejido elástico, cuello redondo acanalado y el logo Karl Lagerfeld Paris en blanco sobre el pecho.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-short-sleeve-logo-rashguard-negro-frente.jpg',
            alt: 'Camiseta Karl Lagerfeld negra de manga corta, vista frontal de la prenda sola con el logo Karl Lagerfeld Paris en blanco sobre el pecho',
          },
          {
            archivo: 'karl-lagerfeld-short-sleeve-logo-rashguard-negro-espalda.jpg',
            alt: 'Camiseta Karl Lagerfeld negra de manga corta, vista de espalda lisa de la prenda sola',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-crewneck-t-shirt',
    nombre: 'Crewneck T-Shirt',
    marca: 'Karl Lagerfeld',
    categoria: 'hombre',
    tipo: 'camiseta',
    precio: 270000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: !['XS', 'XXL'].includes(talla) })),
    descripcion:
      'Camiseta Karl Lagerfeld de algodón, cuello redondo acanalado y la figura de Karl con gafas oscuras y el logo Karl Lagerfeld Paris estampados en pequeño sobre el pecho.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-crewneck-t-shirt-negro-frente.jpg',
            alt: 'Camiseta Karl Lagerfeld negra, vista frontal de la prenda sola con la figura de Karl con gafas oscuras y el logo estampados en el pecho',
          },
          {
            archivo: 'karl-lagerfeld-crewneck-t-shirt-negro-espalda.jpg',
            alt: 'Camiseta Karl Lagerfeld negra, vista de espalda lisa de la prenda sola',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-bomber-jacket-sherpa-collar',
    nombre: 'Bomber Jacket with Sherpa Collar',
    marca: 'Karl Lagerfeld',
    categoria: 'hombre',
    tipo: 'chaqueta',
    precio: 415000,
    tallas: TALLAS_HOMBRE.map((talla) => ({ talla, disponible: talla !== 'XS' })),
    descripcion:
      'Chaqueta bomber acolchada Karl Lagerfeld en negro, cuello alto forrado en sherpa, cremallera doble, bolsillos laterales, puños y bajo en rib y placa con el logo en la manga.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-bomber-jacket-sherpa-collar-negro-frente.jpg',
            alt: 'Chaqueta bomber Karl Lagerfeld negra, vista frontal de la prenda sola acolchada, con cuello de sherpa negro y cremallera plateada',
          },
          {
            archivo: 'karl-lagerfeld-bomber-jacket-sherpa-collar-negro-detalle.jpg',
            alt: 'Chaqueta bomber Karl Lagerfeld negra puesta, detalle del cuello de sherpa y la placa con el logo en la manga',
          },
          {
            archivo: 'karl-lagerfeld-bomber-jacket-sherpa-collar-negro-modelo-espalda.jpg',
            alt: 'Chaqueta bomber Karl Lagerfeld negra puesta, vista de espalda de cuerpo entero de un modelo con jean negro y botas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-adele-small-bucket-handbag',
    nombre: 'Adele Small Bucket Handbag',
    marca: 'Karl Lagerfeld',
    categoria: 'accesorios',
    tambienEn: ['mujer'],
    tipo: 'bolso',
    // En Sale: el precio de la hoja es el rebajado.
    precio: 447000,
    precioAnterior: 760000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Bolso tipo bucket Karl Lagerfeld en negro, cierre de cordón, asa corta y correa larga ajustable con el logo Karl Lagerfeld Paris, apliques metálicos de corazones, flores y la firma Karl, y forro estampado con bolsillo interior.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-adele-small-bucket-handbag-negro-frente.jpg',
            alt: 'Bolso bucket Karl Lagerfeld negro, vista frontal con cierre de cordón, apliques plateados de corazones y la firma Karl y correa con el logo en blanco y negro',
          },
          {
            archivo: 'karl-lagerfeld-adele-small-bucket-handbag-negro-modelo.jpg',
            alt: 'Modelo de cuerpo entero con el bolso Karl Lagerfeld negro cruzado con la correa del logo, top y pantalón blancos',
          },
          {
            archivo: 'karl-lagerfeld-adele-small-bucket-handbag-negro-interior.jpg',
            alt: 'Bolso Karl Lagerfeld negro abierto visto desde arriba, con el forro gris estampado con la silueta de Karl y un bolsillo para tarjetas',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-maybelle-crossbody',
    nombre: 'Maybelle Crossbody',
    marca: 'Karl Lagerfeld',
    categoria: 'accesorios',
    tambienEn: ['mujer'],
    tipo: 'bolso',
    precio: 370000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Bolso cruzado Karl Lagerfeld en negro, cubierto de pedrería con la firma Karl en cristales blancos, dos compartimentos con cremallera, forro estampado y correa ajustable con el logo Karl Lagerfeld Paris.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-maybelle-crossbody-negro-frente.jpg',
            alt: 'Bolso cruzado Karl Lagerfeld negro, vista frontal cubierta de pedrería con la firma Karl en cristales blancos y el logo arriba',
          },
          {
            archivo: 'karl-lagerfeld-maybelle-crossbody-negro-interior.jpg',
            alt: 'Bolso Karl Lagerfeld negro abierto visto desde arriba, con dos compartimentos con cremallera, forro estampado y la correa con el logo',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-maybelle-small-crossbody-handbag',
    nombre: 'Maybelle Small Crossbody Handbag',
    marca: 'Karl Lagerfeld',
    categoria: 'accesorios',
    tambienEn: ['mujer'],
    tipo: 'bolso',
    precio: 400000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Bolso cruzado pequeño Karl Lagerfeld en negro, con las caras de Karl y su gata Choupette bordadas en pedrería, logo Karl Lagerfeld Paris metálico, dos compartimentos con cremallera, forro estampado y correa ajustable.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-maybelle-small-crossbody-handbag-negro-frente.jpg',
            alt: 'Bolso cruzado Karl Lagerfeld negro, vista frontal con las caras de Karl y Choupette en pedrería y el logo metálico arriba',
          },
          {
            archivo: 'karl-lagerfeld-maybelle-small-crossbody-handbag-negro-interior.jpg',
            alt: 'Bolso Karl Lagerfeld negro abierto visto desde arriba, con dos compartimentos de cremallera plateada y forro estampado',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-khloe-logo-backpack',
    nombre: 'Khloe Logo Backpack',
    marca: 'Karl Lagerfeld',
    categoria: 'accesorios',
    tambienEn: ['mujer'],
    tipo: 'morral',
    precio: 554000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Morral Karl Lagerfeld en negro con acabado granulado, herrajes dorados, bolsillo frontal con el nombre Karl Lagerfeld en relieve y apliques de Karl, Choupette y la torre Eiffel, asa superior y tiras ajustables con el logo tejido.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-khloe-logo-backpack-negro-frente.jpg',
            alt: 'Morral Karl Lagerfeld negro, vista frontal con el logo dorado arriba y el bolsillo con Karl Lagerfeld en relieve y los apliques de Karl y Choupette',
          },
          {
            archivo: 'karl-lagerfeld-khloe-logo-backpack-negro-lado.jpg',
            alt: 'Morral Karl Lagerfeld negro, vista de tres cuartos con las cremalleras doradas y una tira con el logo tejido',
          },
          {
            archivo: 'karl-lagerfeld-khloe-logo-backpack-negro-espalda.jpg',
            alt: 'Morral Karl Lagerfeld negro, vista de espalda con las dos tiras ajustables tejidas con el logo Karl Lagerfeld Paris y hebillas doradas',
          },
          {
            archivo: 'karl-lagerfeld-khloe-logo-backpack-negro-interior.jpg',
            alt: 'Morral Karl Lagerfeld negro abierto visto desde arriba, con forro negro, bolsillo interior con cremallera y etiqueta de la marca',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-khloe-monogram-backpack',
    nombre: 'Khloe Monogram Backpack',
    marca: 'Karl Lagerfeld',
    categoria: 'accesorios',
    tambienEn: ['mujer'],
    tipo: 'morral',
    precio: 554000,
    tallas: [TALLA_UNICA],
    descripcion:
      'Morral Karl Lagerfeld con el monograma de la L en gris y negro, ribetes negros, herrajes plateados, bolsillo frontal con los apliques de Karl y Choupette, asa superior y tiras ajustables con el logo tejido.',
    variantes: [
      {
        color: 'Gris',
        slug: 'gris',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-khloe-monogram-backpack-gris-frente.jpg',
            alt: 'Morral Karl Lagerfeld con monograma gris y negro, vista frontal con el logo plateado arriba y los apliques de Karl y Choupette en el bolsillo',
          },
          {
            archivo: 'karl-lagerfeld-khloe-monogram-backpack-gris-lado.jpg',
            alt: 'Morral Karl Lagerfeld con monograma gris y negro, vista de tres cuartos con las cremalleras y una tira con el logo tejido',
          },
          {
            archivo: 'karl-lagerfeld-khloe-monogram-backpack-gris-espalda.jpg',
            alt: 'Morral Karl Lagerfeld con monograma gris y negro, vista de espalda con las tiras ajustables tejidas con el logo y hebillas plateadas',
          },
          {
            archivo: 'karl-lagerfeld-khloe-monogram-backpack-gris-interior.jpg',
            alt: 'Morral Karl Lagerfeld con monograma abierto visto desde arriba, con forro negro, bolsillos interiores y etiqueta de la marca',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-logo-zip-up-polo-top',
    nombre: 'Logo Zip Up Polo Top',
    marca: 'Karl Lagerfeld',
    categoria: 'mujer',
    tipo: 'polo',
    precio: 270000,
    tallas: TALLAS_MUJER.map((talla) => ({ talla, disponible: talla !== 'XXL' })),
    descripcion:
      'Polo Karl Lagerfeld de mujer en punto acanalado blanco, cuello camisero con cremallera hasta el pecho, logo Karl Lagerfeld Paris bordado en negro y franjas laterales a rayas con el nombre Karl.',
    variantes: [
      {
        color: 'Blanco',
        slug: 'blanco',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-logo-zip-up-polo-top-blanco-frente.jpg',
            alt: 'Polo Karl Lagerfeld blanco, vista frontal de la prenda sola con cremallera negra hasta el pecho, logo bordado y franjas laterales a rayas',
          },
          {
            archivo: 'karl-lagerfeld-logo-zip-up-polo-top-blanco-espalda.jpg',
            alt: 'Polo Karl Lagerfeld blanco, vista de espalda lisa con las franjas laterales a rayas y el nombre Karl',
          },
          {
            archivo: 'karl-lagerfeld-logo-zip-up-polo-top-blanco-modelo.jpg',
            alt: 'Polo Karl Lagerfeld blanco puesto, plano medio de una modelo que lo lleva con pantalón negro',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },

  {
    slug: 'karl-lagerfeld-choupette-crewneck-sweatshirt',
    nombre: 'Choupette Crewneck Sweatshirt',
    marca: 'Karl Lagerfeld',
    categoria: 'mujer',
    tipo: 'buzo',
    precio: 319000,
    // Una sola pieza: la ficha la avisa como ultima talla.
    tallas: ['XS'],
    descripcion:
      'Buzo Karl Lagerfeld de mujer en felpa de algodón, corte amplio con hombros caídos, cuello redondo acanalado con pico y Choupette con gafas oscuras estampada en grande sobre el logo Karl Lagerfeld Paris.',
    variantes: [
      {
        color: 'Negro',
        slug: 'negro',
        imagenes: [
          {
            archivo: 'karl-lagerfeld-choupette-crewneck-sweatshirt-negro-frente.jpg',
            alt: 'Buzo Karl Lagerfeld negro, vista frontal de la prenda sola con Choupette con gafas oscuras estampada en el pecho y el logo Karl Lagerfeld Paris',
          },
          {
            archivo: 'karl-lagerfeld-choupette-crewneck-sweatshirt-negro-espalda.jpg',
            alt: 'Buzo Karl Lagerfeld negro, vista de espalda lisa de la prenda sola',
          },
          {
            archivo: 'karl-lagerfeld-choupette-crewneck-sweatshirt-negro-modelo.jpg',
            alt: 'Buzo Karl Lagerfeld negro con Choupette puesto, plano medio de una modelo que lo lleva con jean azul',
          },
        ],
        disponible: true,
      },
    ],
    destacado: true,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
