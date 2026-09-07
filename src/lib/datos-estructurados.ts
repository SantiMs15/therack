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
  const tallas = tallasDisponibles(producto)
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
    ...(producto.marca ? { brand: { '@type': 'Brand', name: producto.marca } } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: VENTA.moneda,
      price: producto.precio,
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
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: VENTA.pais,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: VENTA.cambios.dias,
        // Cambio, no devolucion del dinero: es lo que ofrece la tienda.
        refundType: 'https://schema.org/ExchangeRefund',
      },
    },
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
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: urls.length,
      itemListElement: urls.map((u, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: u,
      })),
    },
  }
}

/** Un escalon del camino. El ultimo no lleva ruta: ya se esta ahi. */
export interface Miga {
  nombre: string
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
