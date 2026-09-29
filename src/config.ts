/**
 * Datos del negocio. El texto de quienes somos vive en src/data/tienda.ts.
 */
export const CONFIG = {
  nombre: 'The Rack store',
  telefono: '+57 305 439 9454',
  instagram: 'therack.st',
  // El dominio vive en astro.config.mjs (campo `site`).
  //
  // No hay direccion: la tienda es solo online. Cuando abra un local hay que
  // anadirla aqui, ponerla en el pie y en /tienda, y cambiar el schema de
  // OnlineStore a LocalBusiness, que es lo que la mete en el mapa.
  ciudad: 'Bogotá',
  horarios: 'Lunes a sábado, 10:00 - 19:00',
} as const

/**
 * Condiciones de venta. Viven aqui y no en cada prenda porque son de la
 * tienda entera: cambiarlas es cambiar este bloque, no diez fichas.
 *
 * Van a la ficha estructurada de cada producto, que es lo que deja que un
 * resultado de busqueda muestre "Envio gratis" al lado del precio. Declarar
 * aqui algo que luego no se cumple se paga caro, asi que solo esta lo que se
 * sostiene.
 */
export const VENTA = {
  /** ISO 3166-1 alpha-2. */
  pais: 'CO',
  moneda: 'COP',
  /** Toda la ropa es nueva; no hay piezas de segunda. */
  condicion: 'https://schema.org/NewCondition',
  /** Costo del envio en COP. Cero es envio gratis. */
  envio: { costo: 0 },
  /** Dias que tarda en llegar, de minimo a maximo. */
  entrega: { minimo: 10, maximo: 15 },
  /**
   * Cambios, no devoluciones de dinero. El cliente manda la prenda por
   * mensajeria y paga ese envio: por eso `ReturnFeesCustomerResponsibility` y
   * no `ReturnShippingFees`, que pediria declarar un monto fijo que no existe
   * -- depende de la transportadora que elija.
   */
  cambios: {
    dias: 30,
    costo: 'https://schema.org/ReturnFeesCustomerResponsibility',
    metodo: 'https://schema.org/ReturnByMail',
  },
  /**
   * Como se paga. El identificador es el de GoodRelations, que es el
   * vocabulario que schema.org usa para metodos de pago; el texto es para
   * las personas.
   */
  pago: {
    texto: 'Transferencia bancaria',
    schema: 'http://purl.org/goodrelations/v1#ByBankTransferInAdvance',
  },
} as const

/**
 * La forma exacta con la que responde Instagram: con www y con barra final.
 * Sin ellas hay una redireccion en cada clic, y en el `sameAs` del schema
 * conviene dar la URL definitiva del perfil, no una que rebota.
 */
export const INSTAGRAM_URL = `https://www.instagram.com/${CONFIG.instagram}/`
