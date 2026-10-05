import { validarMarcas, type Marca } from './schema'

/**
 * EL ARCHIVO DE MARCAS.
 *
 * Todas las marcas que la tienda trae o va a traer, tengan hoy prendas o no.
 * Cada una tiene su pagina en /marca/<slug>/ y aparece en el menu de la
 * cabecera: el archivo cuenta de donde viene cada marca y por que la
 * escogimos, que es lo que hace falta para animarse con una que nunca se ha
 * visto en Colombia.
 *
 * El slug no se escribe: sale del nombre con la misma regla que las prendas
 * usan para enlazar a su marca, asi que "Tommy Hilfiger" en productos.ts y
 * aqui llevan a la misma pagina sin tener que coincidir a mano.
 *
 * `ficha` es el relato: origen, fundacion, fundadores, la propuesta en una
 * frase y el texto de por que la trajimos. Una marca sin ficha sigue teniendo
 * pagina -- con sus prendas, si las hay -- y dice que la ficha esta en camino.
 *
 * Sin `portada` va la foto de ciudad de reserva. Sin `galeria`, la pagina la
 * arma con las fotos de las prendas de la marca.
 *
 * Si algo esta mal -- una marca repetida, una prenda de una marca que no esta
 * aqui -- el build falla y dice cual.
 */
const archivo: unknown[] = [
  {
    nombre: 'Adidas',
  },

  {
    nombre: 'Aimé Leon Dore',
    logo: 'aime-leon-dore-logo.svg',
    ficha: {
      pais: 'Estados Unidos',
      fundacion: 2014,
      fundadores: ['Teddy Santis'],
      propuesta:
        'El Nueva York de los noventa hecho ropa de todos los días.',
      texto: [
        'Teddy Santis creció en Queens y montó la marca sin venir de la moda: abrió una tienda en el Lower East Side y se puso a vestir a la gente que ya conocía. Esa es toda la historia, y se nota en la ropa.',
        'La trajimos porque resuelve algo que en Colombia falta: prendas que se ven caras sin gritar el logo. Un polo de punto, una sudadera de peso, una gorra con la M de Mets bordada pequeña. Se ponen un lunes.',
      ],
    },
  },

  {
    nombre: 'AMBUSH',
  },

  {
    nombre: 'Asics',
  },

  {
    nombre: 'Autry',
  },

  {
    nombre: 'Axel Arigato',
  },

  {
    nombre: 'Birkenstock',
  },

  {
    nombre: 'Calvin Klein',
    ficha: {
      pais: 'Estados Unidos',
      ciudad: 'Nueva York',
      fundacion: 1968,
      fundadores: ['Calvin Klein', 'Barry Schwartz'],
      propuesta:
        'Minimalismo de Nueva York, original: el boxer con el nombre en el elástico, jeans y básicos sin adornos.',
      lema: 'minimalismo de Nueva York',
      texto: [
        'Calvin Klein es una marca de Estados Unidos. Calvin Klein la fundó en Nueva York en 1968 con Barry Schwartz, su amigo de infancia, y empezaron haciendo abrigos.',
        'Su sello es el minimalismo: líneas limpias, pocos colores y nada que sobre. En los ochenta puso su nombre en el elástico de la ropa interior, y el boxer Calvin Klein se volvió la prenda más reconocible de la marca, junto a sus jeans.',
        'La trajimos porque son los básicos que se usan todos los días, y en los básicos es donde más se nota la diferencia de llevar algo original.',
      ],
    },
  },

  {
    nombre: 'Diesel',
    ficha: {
      pais: 'Italia',
      ciudad: 'Molvena',
      fundacion: 1978,
      fundadores: ['Renzo Rosso'],
      propuesta:
        'El denim italiano que se atrevió a ser irreverente: buzos y hoodies originales con el logo Oval D.',
      lema: 'el denim italiano',
      texto: [
        'Diesel es una marca de Italia. Renzo Rosso la fundó en 1978 en Molvena, un pueblo del Véneto, con una idea sencilla: hacer jeans que no se parecieran a los de nadie más.',
        'En los noventa se hizo famosa por sus campañas provocadoras con el lema For Successful Living, el mismo que hoy aparece estampado en sus prendas. Desde 2020 la dirige Glenn Martens, que recuperó el logo Oval D y le dio a la marca un aire más joven y experimental.',
        'La trajimos porque es streetwear con historia: buzos y hoodies con diseño propio, que se reconocen de lejos y aquí se consiguen originales.',
      ],
    },
  },

  {
    nombre: 'Dime',
  },

  {
    nombre: 'Ed Hardy',
  },

  {
    nombre: 'Eme Studios',
    // El video se ve encima de la foto, que queda como poster y como lo
    // que recibe quien pide menos movimiento o un buscador.
    portada: {
      archivo: 'eme-studios-portada.jpg',
      alt: 'Un avión cruza un cielo azul dejando dos estelas',
      video: '/videos/eme-studios-portada.mp4',
    },
    logo: 'eme-studios-logo.svg',
    galeria: [
      {
        archivo: 'eme-studios-galeria-01.webp',
        alt: 'Chico con rastas, cárdigan de rayas azules y verdes y camiseta gris de Eme Studios, delante de una estantería de libros',
      },
      {
        archivo: 'eme-studios-galeria-02.webp',
        alt: 'Dos personas de espaldas caminan de noche por Madrid; una lleva una chaqueta negra con Emestudios Madrid Always Grateful',
      },
      {
        archivo: 'eme-studios-galeria-03.webp',
        alt: 'Chica rubia con chaqueta de chándal blanca y granate de Eme Studios y pantalón cargo marrón, en un salón con discos',
      },
      {
        archivo: 'eme-studios-galeria-04.webp',
        alt: 'Pareja con pantalones de paracaídas rojos contra una pared azul y amarilla',
      },
      {
        archivo: 'eme-studios-galeria-05.webp',
        alt: 'Chica de espaldas con un jersey azul marino con Studios tejido en granate y blanco',
      },
    ],
    ficha: {
      pais: 'España',
      ciudad: 'Elche',
      fundacion: 2017,
      fundadores: ['Conra Martínez', 'Gabriel Morón'],
      propuesta:
        'Streetwear de Elche fabricado entre España y Portugal. Cortes sin género y drops que se agotan.',
      lema: 'streetwear de Elche',
      texto: [
        'Conra Martínez y Gabriel Morón la montaron en Elche en 2017. No tenían tienda ni distribuidor: vendían por redes y sacaban algo nuevo cada dos semanas. La primera tienda física, en Madrid, llegó siete años después. Su lema, Always Grateful, va para la gente que les compró desde el principio.',
        'Se puede decir que abrió una tendencia, y hoy muchas marcas se miran en ella. La trajimos porque toma cortes que ya estaban encasillados para cierto público y los rejuvenece.',
      ],
    },
  },

  {
    nombre: 'Essentials',
  },

  {
    nombre: 'Hugo Boss',
    ficha: {
      pais: 'Alemania',
      ciudad: 'Metzingen',
      fundacion: 1924,
      fundadores: ['Hugo Boss'],
      propuesta:
        'Sastrería alemana llevada a la calle: gorras, zapatos y ropa original con el corte limpio de BOSS.',
      lema: 'sastrería alemana',
      texto: [
        'Hugo Boss es una marca alemana. Hugo Boss abrió su taller de confección en 1924 en Metzingen, un pueblo del sur de Alemania donde la marca sigue teniendo su sede.',
        'Se hizo un nombre con la sastrería: trajes de corte preciso que en los años ochenta vistieron a medio mundo. Hoy tiene dos líneas, BOSS, la más clásica, y HUGO, la más joven, y la misma precisión llega a gorras, zapatos y ropa de diario.',
        'La trajimos porque es la forma de llevar esa sastrería sin ponerse un traje: una gorra, unos zapatos o una prenda de BOSS suben cualquier pinta sin que se note el esfuerzo.',
      ],
    },
  },

  {
    nombre: 'Karl Lagerfeld',
    ficha: {
      pais: 'Francia',
      ciudad: 'París',
      fundacion: 1984,
      fundadores: ['Karl Lagerfeld'],
      propuesta:
        'Bolsos y ropa original con la silueta de Karl, la coleta y las gafas oscuras: París en blanco y negro.',
      lema: 'el estilo de París',
      texto: [
        'Karl Lagerfeld es una marca francesa, nacida en París en 1984 con el nombre del diseñador que la creó.',
        'Su firma es fácil de reconocer: la silueta de Karl, con la coleta blanca y las gafas oscuras, y una paleta que casi no sale del blanco y el negro. Con esa identidad hace bolsos, ropa y accesorios, sobre todo para mujer.',
        'La trajimos porque es moda de París a un precio que se puede alcanzar, y sus bolsos son de las piezas que más se buscan de la marca en Colombia.',
      ],
    },
  },

  {
    nombre: 'KidSuper Studios',
  },

  {
    nombre: 'Lacoste',
    ficha: {
      pais: 'Francia',
      ciudad: 'París',
      fundacion: 1933,
      fundadores: ['René Lacoste', 'André Gillier'],
      propuesta:
        'El polo de piqué que nació en las canchas de tenis en 1933, original y con el cocodrilo en el pecho.',
      lema: 'el cocodrilo francés',
      texto: [
        'Lacoste es una marca francesa. Nació en 1933, cuando el tenista René Lacoste se asoció con André Gillier, dueño de una fábrica de punto, para hacer la camisa que él mismo usaba en la cancha: un polo de piqué de algodón, de manga corta, más fresco que las camisas de la época.',
        'El cocodrilo viene de un apodo. La prensa de Estados Unidos empezó a llamar así a René Lacoste por una apuesta sobre una maleta de piel de cocodrilo, y él se lo hizo bordar en la chaqueta. Cuando salió el polo, el cocodrilo fue al pecho, y fue de los primeros logos que se vieron por fuera de una prenda.',
        'La trajimos porque es de las marcas que más se buscan en Colombia, y comprarla original no debería ser una apuesta. Aquí no solo está el polo clásico: también hay buzos, hoodies y polos de punto de la temporada.',
      ],
    },
  },

  {
    nombre: 'Maison Mihara Yasuhiro',
  },

  {
    nombre: 'New Balance',
  },

  {
    nombre: 'Nike',
  },

  {
    nombre: 'On Running',
  },

  {
    nombre: 'Onitsuka Tiger',
  },

  {
    nombre: 'Pleasures',
  },

  {
    nombre: 'Ralph Lauren',
    ficha: {
      nombreBusqueda: 'Polo Ralph Lauren',
      pais: 'Estados Unidos',
      ciudad: 'Nueva York',
      fundacion: 1967,
      fundadores: ['Ralph Lauren'],
      propuesta:
        'La camisa polo con el jugador bordado en el pecho, original: el clásico americano que nació en Nueva York.',
      lema: 'el clásico americano',
      texto: [
        'Ralph Lauren es una marca de Estados Unidos. Ralph Lauren, que creció en el Bronx, la empezó en Nueva York en 1967 vendiendo corbatas anchas, y a esa primera línea la llamó Polo.',
        'En 1972 sacó la camisa polo con el jugador de polo bordado en el pecho, y esa prenda se volvió la marca: por eso en Colombia casi nadie dice Ralph Lauren a secas, sino polo Ralph Lauren. Detrás vino todo un estilo, el del clásico americano: camisas oxford, buzos de punto y chaquetas que no pasan de moda.',
        'La trajimos porque es la prenda de marca que se puede llevar en cualquier ocasión, del trabajo a un fin de semana, y aquí se consigue original.',
      ],
    },
  },

  {
    nombre: 'Represent',
  },

  {
    nombre: 'Salomon',
  },

  {
    nombre: 'Tommy Hilfiger',
    ficha: {
      pais: 'Estados Unidos',
      ciudad: 'Nueva York',
      fundacion: 1985,
      fundadores: ['Tommy Hilfiger'],
      propuesta:
        'El preppy americano original: polos, camisas oxford y buzos medio cierre, con la bandera de la marca.',
      lema: 'preppy de Nueva York',
      texto: [
        'Tommy Hilfiger es una marca de Estados Unidos. Tommy Hilfiger, que había empezado vendiendo jeans en una tienda de su pueblo, Elmira, la lanzó en Nueva York en 1985.',
        'Arrancó con una valla en Times Square que ponía su nombre junto al de los grandes diseñadores americanos del momento, cuando casi nadie lo conocía. Funcionó: la bandera roja, blanca y azul se volvió la firma del preppy americano, esa ropa de universidad de la costa este hecha de polos, camisas oxford y buzos de punto.',
        'La trajimos porque es el preppy que mejor aguanta el día a día: prendas que combinan con todo y se ven cuidadas sin esfuerzo. Aquí se consigue original, incluido el buzo medio cierre, que en Colombia casi nadie ofrece de la marca.',
      ],
    },
  },

]

export const marcas: Marca[] = validarMarcas(archivo)
