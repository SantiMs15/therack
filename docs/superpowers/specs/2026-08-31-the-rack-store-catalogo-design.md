# The Rack store — Catálogo web

**Fecha:** 2026-08-31
**Estado:** diseño aprobado, pendiente de plan de implementación

## 1. Objetivo

Web pública de catálogo para The Rack store (tienda de ropa, Colombia). Muestra el género con foto, precio y talla, y convierte a través de una conversación de WhatsApp ya redactada. No vende en línea.

## 2. Alcance

**Incluye:** portada, catálogo completo, catálogo por categoría, ficha de producto, página de tienda, 404.

**No incluye, deliberadamente:**

- Carrito y checkout. Prometen un pago que no existe y obligan a mantener estado entre páginas.
- Pasarela de pago, gestión de stock, cuentas de usuario.
- Panel de administración. El catálogo lo mantiene un perfil técnico editando el archivo de datos.
- Buscador y filtros combinables (por talla, por precio). La navegación por categoría sí existe como ruta propia; lo que se descarta es filtrar dentro de ella. A 20-50 prendas el usuario ve la categoría entera desplazándose.
- Variantes de color. Cada color es una prenda con sus propias fotos.

## 3. Stack

- **Astro** en modo estático. Genera HTML en build; cero JavaScript enviado al cliente por defecto.
- **TypeScript** para el archivo de datos y la validación.
- Sin framework de UI. No hay estado de cliente que justifique React.
- **Motivo de la elección:** la optimización de imágenes integrada. Un catálogo de ropa son 50-150 fotos de móvil de 3-5 MB; servidas en crudo, el sitio es inusable con datos móviles. Astro las convierte a AVIF/WebP en varios tamaños automáticamente.

## 4. Estructura del sitio

| Ruta | Contenido |
|---|---|
| `/` | Marca, 4 categorías, selección de destacados |
| `/catalogo` | Rejilla con todo el género |
| `/catalogo/[categoria]` | Rejilla filtrada. Categorías: `mujer`, `hombre`, `calzado`, `accesorios` |
| `/producto/[slug]` | Galería, precio, tallas, descripción, CTA de WhatsApp |
| `/tienda` | Quiénes somos, ubicación, horarios, redes |
| `/404` | Marca y salida al catálogo |

Todas las rutas se generan en build. Ninguna es dinámica en servidor.

## 5. Modelo de datos

Fuente de verdad única: `src/data/productos.ts`.

```ts
type Producto = {
  slug: string          // identificador en URL, derivado del nombre
  nombre: string
  categoria: 'mujer' | 'hombre' | 'calzado' | 'accesorios'
  precio: number        // entero en COP, sin decimales
  tallas: string[]
  descripcion: string
  imagenes: string[]    // nombres de archivo, la primera es la principal
  destacado: boolean    // aparece en portada
  disponible: boolean   // false = agotado
}
```

Añadir una prenda = añadir un objeto al array y dejar sus fotos en la carpeta correspondiente.

**Agotados:** `disponible: false` mantiene la ficha viva (sigue indexada y compartida) mostrando "Agotado" y retirando el CTA. Nunca se borra un producto: borrarlo produce enlaces rotos.

## 6. Dirección de arte

**Principio rector:** la marca es monocroma; el color lo aporta la ropa. Cualquier color corporativo competiría con las prendas.

**Tipografía** — dos familias. El logo se usa siempre como imagen, nunca reescrito en texto.

- Titulares: **Instrument Serif**
- Interfaz y cuerpo: **Geist**
- Se descartan `Inter` y los serif por defecto del navegador, conforme al `DESIGN.md` ya presente en el proyecto.

**Color**

| Rol | Valor |
|---|---|
| Fondo | `#FAFAF9` |
| Texto | `#111111` |
| Negro puro `#000` | solo en el logo |

Sin color de acento. `#000` sobre blanco vibra en pantalla; de ahí el negro suave.

**Rejilla de producto:** foto en 3:4 vertical, sin marco, sin sombra, sin tarjeta. Debajo solo nombre y precio. 2 columnas en móvil, 3 en escritorio.

**Requisito sobre las fotos:** todas al mismo ratio 3:4. Proporciones mezcladas delatan un catálogo amateur. El recorte se hace en build, por lo que el producto debe ir centrado y con margen suficiente para sobrevivirlo.

**Formato de precio:** `$89.000` — punto como separador de miles, sin decimales (convención COP).

**Movimiento:** entrada suave al hacer scroll y zoom leve de la foto al pasar el ratón. Sin carruseles automáticos, contadores ni indicadores de scroll.

## 7. Mecanismo de conversión

Cada ficha lleva un CTA que abre WhatsApp con el mensaje ya redactado:

```
Hola! Me interesa el Blazer de lino (talla M)
https://<dominio>/producto/blazer-lino-negro
```

La talla seleccionada en la ficha alimenta el mensaje. Enlace secundario a Instagram DM.

**Razón de ser:** sin prellenado llegan mensajes de "hola, info?" y se gastan veinte mensajes identificando la prenda. Con él, el vendedor conoce producto y talla antes de responder. Es el valor entero del modelo catálogo→DM.

**Estilo del botón:** negro con icono en blanco, **no** el verde `#25D366` de WhatsApp. Ese verde rompe la sobriedad de la paleta en el elemento más repetido del sitio; el icono y la etiqueta bastan para el reconocimiento. Reversible en una línea si la conversión lo desaconseja.

## 8. Rendimiento

- AVIF/WebP en varios tamaños con `srcset` y carga diferida, generados por Astro.
- **Objetivo: LCP por debajo de 2,5 s en 4G.** Verificado con Lighthouse en móvil antes de dar por buena la entrega.

## 9. Errores y validación

- **Validación en build:** un producto sin precio, sin fotos, con categoría inválida o que referencia un archivo inexistente **rompe el build**. Un despliegue que se niega a salir es preferible a una tienda con fichas rotas.
- 404 con marca y salida al catálogo.

## 10. Pruebas

Un sitio de contenido estático no se beneficia de tests unitarios; escribirlos sería teatro. Lo que se verifica:

1. La validación de datos en build falla ante datos incompletos.
2. Todas las rutas se generan (una por producto, una por categoría).
3. Lighthouse móvil cumple el objetivo de LCP.

## 11. Despliegue

- Repositorio git (a inicializar: la carpeta no lo es hoy).
- Netlify o Vercel, plan gratuito, despliegue automático en cada cambio.

## 12. Datos pendientes del cliente

Necesarios antes del despliegue, no antes de implementar:

- Número de WhatsApp (+57).
- Usuario de Instagram.
- Dominio.
- Dirección, horarios y texto de `/tienda`.
- Carpeta de fotos organizada (la prepara el cliente).
- Los propios productos: nombre, precio, tallas, descripción.

## 13. Decisiones abiertas a revisión

Tomadas por criterio propio; revertibles si la realidad del negocio las desmiente:

1. CTA en negro en lugar del verde de WhatsApp.
2. Sin variantes de color en el modelo.
3. Agotados conservados en vez de borrados.
4. Sin buscador ni filtros en la primera versión.
