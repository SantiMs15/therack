/**
 * El texto de /tienda/: quienes somos y de donde sale la ropa.
 *
 * Es la pagina a la que va quien duda antes de transferir, y la que Google
 * lee para decidir si el negocio es de fiar. Por eso solo dice lo que se
 * sostiene: de donde se compra, que llega nuevo y con etiquetas. NO promete
 * factura ni certificado, porque no se entregan.
 *
 * Vocabulario segun docs/keywords-decisiones.md:
 *   - "original" va en la descripcion, no en el titulo.
 *   - Nada de "ropa importada" (en Colombia trae mayoristas) ni "ropa
 *     americana" (significa usada). Se dice "traemos" y "ropa de marca".
 *   - Aimé Leon Dore con su nombre entero, nunca ALD (trae Aldo).
 */

/**
 * Las marcas que se nombran en el texto, cada una enlazada a su pagina del
 * archivo. Primero las que la tienda PRESENTA -- las que en Colombia casi no
 * se conocen, que es el oficio de la tienda -- y luego las clasicas, que son
 * las que se buscan.
 *
 * Solo marcas con pagina indexable: enlazar desde aqui a una pagina vacia con
 * noindex seria mandar al cliente que duda a un "todavia no hay nada". Lo
 * comprueba tienda.test.ts.
 */
export const MARCAS_QUE_PRESENTAMOS = [
  'Aimé Leon Dore',
  'Eme Studios',
  'KidSuper Studios',
  'Pleasures',
] as const
export const MARCAS_CLASICAS = ['Lacoste', 'Tommy Hilfiger'] as const

/** De donde se compra. Es la base de "original", asi que va literal. */
export const ORIGEN =
  'tiendas oficiales de cada marca y distribuidores autorizados de Estados Unidos y Europa'
