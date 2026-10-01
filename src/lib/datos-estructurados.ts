/**
 * La ficha en JSON-LD que se incrusta en cada pagina de producto.
 *
 * Es lo que deja que un resultado de busqueda muestre precio, disponibilidad
 * y envio en vez de solo texto. Vive aqui y no en el .astro para poder
 * probarlo: son datos que van a un tercero, no se ven en la pagina, y nadie
 * se entera de que estan mal hasta que Google los rechaza.
 *
 * Solo se declara lo que se sostiene. Un dato inventado en una ficha
 * estructurada es peor que la ausencia del dato.
 */
import { tallasDisponibles, type Producto, type Variante } from '../data/schema'
import { CONFIG, INSTAGRAM_URL, VENTA } from '../config'

export interface DatosFicha {
  producto: Producto
  variante: Variante
  /** URL canonica de la ficha, absoluta y con barra final. */
  url: string
  /** Fotos de la variante, absolutas. */
  imagenes: string[]
}

export function fichaProducto({ producto, variante, url, imagenes }: DatosFicha) {
  // Agotado es tanto la variante marcada como tal como la que se quedo sin
  // ninguna talla pedible: por fuera es lo mismo, no se puede comprar.
  const tallas = tallasDisponibles(producto, variante)
  const hayStock = variante.disponible && tallas.length > 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${producto.nombre} - ${variante.color}`,
    description: producto.descripcion,
    image: imagenes,
    color: variante.color,
    size: tallas.map((t) => t.talla),
    // Google pide un identificador unico por producto. No hay codigos
    // internos, asi que sirve el par slug+color: identifica una pieza
    // concreta, es unico por construccion y no cambia con el tiempo.
    sku: `${producto.slug}-${variante.slug}`,
    // Sin marca no se declara `brand`: uno vacio es peor que ninguno. Con
    // una o con dos -- una colaboracion -- va solo la principal, la primera
    // escrita: Google marca una lista de Brand como campo duplicado.
    ...(producto.marcas.length
      ? { brand: { '@type': 'Brand', name: producto.marcas[0] } }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: VENTA.moneda,
      price: producto.precio,
      // Rebajada, el precio de antes va como tachado: es lo que deja que el
      // resultado de busqueda ensene la rebaja y no solo el precio final.
      ...(producto.precioAntes
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              priceType: 'https://schema.org/StrikethroughPrice',
              price: producto.precioAntes,
              priceCurrency: VENTA.moneda,
            },
          }
        : {}),
      availability: hayStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: VENTA.condicion,
      seller: { '@type': 'Organization', name: CONFIG.nombre },
      acceptedPaymentMethod: VENTA.pago.schema,
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: VENTA.envio.costo,
          currency: VENTA.moneda,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: VENTA.pais,
        },
        // Todo el plazo va en transitTime y no repartido con handlingTime:
        // Google suma los dos para dar el total, y de los 10-15 dias solo se
        // sabe el total, no cuanto es preparar y cuanto es transporte.
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: VENTA.entrega.minimo,
            maxValue: VENTA.entrega.maximo,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: politicaCambios(),
    },
  }
}

/**
 * La politica de cambios, una sola para la oferta y para la tienda.
 *
 * Va en los dos sitios porque Google la lee en los dos: en la oferta manda
 * para esa prenda, en la tienda es la que aplica cuando una oferta no dice
 * nada. Armarla en una funcion es lo que impide que las dos copias se
 * separen.
 */
function politicaCambios() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: VENTA.pais,
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: VENTA.cambios.dias,
    returnMethod: VENTA.cambios.metodo,
    returnFees: VENTA.cambios.costo,
    // Cambio, no devolucion del dinero: es lo que ofrece la tienda.
    refundType: 'https://schema.org/ExchangeRefund',
  }
}

/**
 * La ficha de una prenda que viene en varios colores.
 *
 * Sin esto cada color es para Google un producto suelto, sin relacion con
 * los otros: tres fichas que compiten entre si en vez de una prenda en tres
 * colores. El ProductGroup las junta bajo un mismo `productGroupID` y dice
 * que lo unico que cambia entre ellas es el color.
 *
 * Es el formato que Google documenta cuando cada variante tiene su propia
 * URL: la variante de ESTA pagina va completa, con su oferta; las demas van
 * solo con su URL, porque sus datos ya estan en su pagina y dos copias
 * acaban discrepando.
 *
 * Con un solo color no hay grupo: un ProductGroup de una variante no agrupa
 * nada. Quien pinta la pagina decide, y en ese caso usa `fichaProducto`.
 */
export function fichaGrupo(datos: DatosFicha) {
  const { producto, variante, url } = datos
  const { '@context': _, ...pieza } = fichaProducto(datos)
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: producto.nombre,
    description: producto.descripcion,
    productGroupID: producto.slug,
    variesBy: ['https://schema.org/color'],
    ...('brand' in pieza ? { brand: pieza.brand } : {}),
    hasVariant: producto.variantes.map((v) =>
      v.slug === variante.slug
        ? { ...pieza, inProductGroupWithID: producto.slug }
        : {
            '@type': 'Product',
            // Absoluta contra la de esta pagina: mismo sitio, otra ruta.
            url: new URL(`/producto/${producto.slug}/${v.slug}/`, url).href,
          }
    ),
  }
}

/**
 * Serializa la ficha para meterla en un <script>.
 *
 * Escapar el `<` corta cualquier "</script>" que llegara dentro de un dato y
 * cerrara la etiqueta antes de tiempo. Hoy el catalogo es de confianza, pero
 * esto no depende de que siga siendolo.
 */
export function serializar(ficha: unknown): string {
  return JSON.stringify(ficha).replace(/</g, '\\u003c')
}

/**
 * Un elemento de un listado: solo su URL.
 *
 * Es el formato que Google pide cuando cada elemento tiene pagina propia, y
 * es el que ya usaba `fichaCategoria`. Se saca aparte porque ahora lo arman
 * tres funciones y repetir el `.map` en las tres es repetir tambien el dia
 * que cambie.
 */
function listaDeUrls(urls: readonly string[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: urls.length,
    itemListElement: urls.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: u,
    })),
  }
}

/**
 * La ficha de una pagina de catalogo.
 *
 * Dice dos cosas que el HTML solo no deja claras: que esta pagina es un
 * LISTADO y no un articulo, y cuales son las fichas que lista. Sin esto,
 * /catalogo/hombre es para un buscador una pagina con un titulo y un monton
 * de enlaces, indistinguible de un blog.
 *
 * Cada entrada es solo la URL de su ficha, que es el formato que Google pide
 * cuando cada elemento tiene pagina propia: los datos de la prenda ya estan
 * alli, en su Product, y repetirlos aqui solo abre la puerta a que las dos
 * copias digan cosas distintas.
 *
 * El ORDEN importa: tiene que ser el mismo que se ve al entrar. Por eso las
 * tarjetas llegan ya ordenadas desde `tarjetasEnOrden`, la misma funcion que
 * usa la rejilla.
 */
export function fichaCategoria({
  nombre,
  descripcion,
  url,
  urls,
}: {
  nombre: string
  descripcion: string
  /** Canonica de la pagina de catalogo, absoluta. */
  url: string
  /** Fichas que lista, absolutas y en el orden en que se ven. */
  urls: readonly string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: nombre,
    description: descripcion,
    url,
    mainEntity: listaDeUrls(urls),
  }
}

/**
 * La ficha de una pagina de marca.
 *
 * Es una CollectionPage cuyo `about` es la marca: la pagina no ES la marca,
 * HABLA de la marca y ademas lista sus piezas. Declararla como Brand a secas
 * dejaria sin sitio a la lista de productos.
 *
 * `foundingDate` va como cadena porque schema.org espera una fecha, y un
 * numero suelto no lo es. El ano solo es una fecha valida.
 *
 * Sin piezas no se emite `mainEntity`. Un ItemList de cero elementos no dice
 * "no hay nada", dice "esto es un listado" -- y una marca que todavia no ha
 * llegado a la tienda no lo es.
 */
export function fichaMarca({
  nombre,
  propuesta,
  url,
  pais,
  ciudad,
  anio,
  fundador,
  imagen,
  urls,
}: {
  nombre: string
  /** La linea de propuesta: es la descripcion de la pagina y de la marca. */
  propuesta: string
  /** Canonica de la pagina de marca, absoluta. */
  url: string
  pais: string
  /** Si se sabe, el Place dice "ciudad, pais". */
  ciudad?: string
  anio: number
  /** Una Person por nombre: con uno solo va el objeto, con varios la lista. */
  fundador: string | readonly string[]
  /** Foto de campana, absoluta. */
  imagen: string
  /** Fichas que lista, absolutas y en el orden en que se ven. */
  urls: readonly string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: nombre,
    description: propuesta,
    url,
    about: {
      '@type': 'Brand',
      name: nombre,
      description: propuesta,
      foundingDate: String(anio),
      founder:
        typeof fundador === 'string'
          ? persona(fundador)
          : fundador.map(persona),
      foundingLocation: { '@type': 'Place', name: ciudad ? `${ciudad}, ${pais}` : pais },
      image: imagen,
    },
    ...(urls.length > 0 ? { mainEntity: listaDeUrls(urls) } : {}),
  }
}

function persona(name: string) {
  return { '@type': 'Person', name }
}

/**
 * La ficha del indice del archivo: un listado de paginas de marca.
 *
 * Cada entrada es solo su URL, por lo mismo que en las otras dos: los datos
 * de la marca ya estan en su pagina, y dos copias acaban discrepando.
 */
export function fichaArchivo({ url, urls }: { url: string; urls: readonly string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Archivo de marcas',
    description:
      'Las marcas que trae The Rack store al mercado colombiano, con su origen y su propuesta.',
    url,
    mainEntity: listaDeUrls(urls),
  }
}

/** Un escalon del camino. El ultimo no lleva ruta: ya se esta ahi. */
export interface Miga {
  nombre: string
  /**
   * Cuando el escalon lleva a mas de un sitio: una prenda de dos marcas se
   * alcanza desde las dos, y quien vino de cualquiera de ellas tiene que
   * poder volver por donde entro.
   *
   * Solo cambia lo que se VE. Al schema va `nombre` + `ruta`, uno solo: un
   * BreadcrumbList es un camino, y dos destinos en la misma posicion serian
   * dos caminos. Por eso el escalon sigue declarando los suyos aunque traiga
   * `partes`, y quien lo escribe pone ahi el primero.
   */
  partes?: { nombre: string; ruta: string }[]
  /**
   * Ruta del sitio, con barra final. RELATIVA a proposito: es lo que va en el
   * href que se pinta, y una absoluta ahi mandaria al dominio de produccion
   * desde el servidor de desarrollo. La absoluta que pide el schema la arma
   * `fichaMigas`, que es quien sabe cual es el sitio.
   */
  ruta?: string
}

/**
 * El camino hasta la pagina, en JSON-LD.
 *
 * Es lo que cambia la linea gris de un resultado de busqueda: en vez de la
 * URL cruda, "therackstore.shop > Hombre > Classic Printed Crew Neck". Se
 * lee mejor y dice donde cae la pagina dentro de la tienda antes de entrar.
 *
 * El ultimo escalon va sin `item` a proposito: es la pagina donde ya se esta,
 * y es asi como Google documenta que se marca el final del camino.
 *
 * La lista la arma quien pinta la pagina, no este modulo: las mismas migas
 * alimentan el rastro que se ve y este JSON, y tenerlas en un solo sitio es
 * lo que evita que digan cosas distintas.
 */
export function fichaMigas(migas: readonly Miga[], sitio: string | URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((miga, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: miga.nombre,
      ...(miga.ruta ? { item: new URL(miga.ruta, sitio).href } : {}),
    })),
  }
}

/**
 * El sitio, para la portada: es de donde Google saca el nombre que pone
 * encima de cada resultado. Sin el lo adivina, y puede quedarse con el
 * dominio pelado o con el titulo de alguna pagina.
 *
 * `alternateName` recoge como se la nombra de palabra, que es tambien como
 * la escribe quien la busca.
 */
export function fichaSitio({ url }: { url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: CONFIG.nombre,
    alternateName: ['The Rack', 'therackstore'],
    url,
  }
}

/**
 * La ficha de la tienda, para la portada.
 *
 * `OnlineStore` y no `LocalBusiness`: no hay local, y declarar un negocio
 * fisico sin direccion ni horario de puerta es pedirle a Google que la ponga
 * en un mapa donde no esta. El dia que abra un local, este es el tipo que
 * hay que cambiar.
 */
export function fichaTienda({ url, logo }: { url: string; logo: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: CONFIG.nombre,
    url,
    logo,
    image: logo,
    // Enlaza el sitio con el perfil de Instagram, que es donde esta la
    // actividad de la tienda: es lo que deja a un buscador entender que son
    // el mismo negocio.
    sameAs: [INSTAGRAM_URL],
    // La politica para toda la tienda: Google la usa en las fichas de
    // comercio de cualquier prenda cuya oferta no declare la suya.
    hasMerchantReturnPolicy: politicaCambios(),
    areaServed: { '@type': 'Country', name: 'Colombia' },
    paymentAccepted: VENTA.pago.texto,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: CONFIG.telefono,
      availableLanguage: 'Spanish',
    },
  }
}
