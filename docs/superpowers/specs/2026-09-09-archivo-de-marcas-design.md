# The Rack store — Archivo de marcas

**Fecha:** 2026-09-09
**Estado:** diseño aprobado, pendiente de plan de implementación

## 1. Objetivo

The Rack store no quiere ser solo un sitio donde se compra ropa. Quiere ser
quien **introduce al mercado colombiano marcas de afuera que aquí no se
conocen**.

El problema concreto: en Colombia cuesta que alguien compre una prenda de una
marca que nunca ha visto. La tienda ataca esa desconfianza siendo la que
presenta la marca y explica por qué su propuesta vale para este mercado. Si
The Rack es quien te descubre la marca, es también la primera opción para
comprártela.

Hoy el sitio no cuenta nada de eso. Una marca es una etiqueta debajo del
nombre del producto y una entrada de menú que filtra la rejilla. El cliente
que no conoce Aimé Leon Dore sale de la página sin saber qué es Aimé Leon
Dore.

Este diseño crea el **Archivo de marcas**: una página por marca que la
presenta antes de venderla.

## 2. Alcance

**Incluye:**

- Ficha de marca como dato validado en el build.
- Página por marca en `/marca/<slug>/`, con la presentación arriba y las
  piezas disponibles abajo.
- Índice del archivo en `/marca/`.
- El menú de la cabecera pasa a llamarse "Archivo de marcas" y navega a esas
  páginas en vez de filtrar.
- Un filtro de marca en la columna izquierda del catálogo, para recuperar lo
  que el menú deja de hacer.
- Enlace desde la ficha de producto a la página de su marca.

**No incluye, deliberadamente:**

- Contenido editorial continuo (notas, lookbooks, guías de estilo). Exige que
  alguien escriba seguido; el archivo no.
- Página de marca para las 25 marcas de `marcas.ts`. La ficha es opcional.
- Colecciones de contenido de Astro. Ver decisión 3.3.

## 3. Decisiones

### 3.1 Campos fijos, no texto libre

Cada ficha declara los mismos campos y el build falla si falta uno. Todas las
páginas se leen igual y no hay marcas contadas a medias. El costo es rigidez:
una marca con una historia rara tiene que caber en el molde.

### 3.2 La ficha es opcional

Hay 25 marcas en `marcas.ts` y escribir 25 fichas antes de publicar bloquearía
el archivo indefinidamente. Así que:

- Marca **con** ficha → el menú lleva a `/marca/<slug>/`.
- Marca **sin** ficha → el menú lleva a `/?marca=<slug>`, como hoy.

El archivo se publica con las que estén escritas y crece solo. El costo
aceptado: el menú se comporta distinto según la marca, aunque el cliente no
tiene forma de notarlo.

### 3.3 Los datos en TypeScript, no en colecciones de contenido

Se evaluó `src/content/marcas/*.md`, que es lo idiomático en Astro y más
cómodo para escribir prosa. Se descarta: el repo tiene una convención fuerte
—datos en TS, validados con zod, build que falla nombrando el problema— y
meter un segundo patrón de datos por 25 fichas parte el proyecto en dos
estilos.

### 3.4 Foto de campaña arriba

Se eligió sobre la alternativa de solo tipografía. Se ve más editorial y
vende mejor la propuesta. Implica conseguir una imagen por marca; son fotos de
la marca, no de la tienda, así que conviene tener claro el permiso de uso
antes de publicar cada una.

## 4. Modelo de datos

**Archivo nuevo:** `src/data/fichas-marca.ts`

```ts
export interface FichaMarca {
  /** País de origen. */
  pais: string
  /** Año de fundación. */
  anio: number
  fundador: string
  /**
   * Qué propone la marca, en una línea. Hace dos trabajos: es el gancho de la
   * página y es su meta description, así que se escribe una sola vez.
   * Máximo 160 caracteres.
   */
  propuesta: string
  /** Por qué la trajimos. Un elemento por párrafo. */
  porQue: string[]
  /** Archivo en src/assets/marcas/, ratio 3:2 horizontal. */
  imagen: string
  alt: string
}

/** Clave = slug de la marca, el mismo que produce `slugMarca`. */
export const FICHAS: Record<string, FichaMarca>
```

**Validación en el build** (zod, mismo patrón que `src/data/schema.ts`):

- Todos los campos presentes y no vacíos; `porQue` con al menos un párrafo.
- `propuesta` no pasa de 160 caracteres. Más largo, el buscador lo corta.
- La clave de cada ficha **existe en `MARCAS`**. Sin esta comprobación, un
  slug mal escrito genera una página huérfana que nada enlaza y nadie ve.
- `imagen` existe en `src/assets/marcas/`.

Un fallo detiene el build y nombra la marca y el campo.

**Imágenes:** `src/assets/marcas/`, con su propio resolvedor construido con
`crearResolvedorImagenes`, hermano de `imagenes-productos.ts`. Directorio
aparte del de productos porque el ratio y el uso son otros.

## 5. Rutas

### 5.1 `/marca/<slug>/` — la página de la marca

Se genera **solo** para las marcas con ficha. Sin ficha no hay ruta, y el
menú lo sabe.

De arriba abajo:

1. **Migas:** `Inicio > Archivo de marcas > <Marca>`. Reusa `Migas.astro` y su
   `BreadcrumbList`, que salen de la misma lista.
2. **`<h1>`** con el nombre de la marca.
3. **Línea de datos:** `<País> · <Año> · <Fundador>`. Tipografía chica; es la
   credencial, no el argumento.
4. **Propuesta** en grande. Es el gancho.
5. **Foto de campaña**, ancha.
6. **`porQue`**, en párrafos. Aquí es donde se convence.
7. **`<h2>Piezas disponibles</h2>`** y `RejillaProductos` con las prendas de
   esa marca. Las mismas tarjetas del catálogo, **sin barra de filtros**: ya
   se está dentro de un filtro, y con tres piezas un desplegable solo estorba.
8. **Marca con ficha y sin stock:** el `<h2>` no se pinta. En su lugar, una
   línea que dice que ahora mismo no hay piezas de esa marca y enlaza al
   catálogo. La marca queda presentada aunque no haya nada que vender, que es
   exactamente para lo que existe el archivo.

### 5.2 `/marca/` — el índice del archivo

Lista las marcas **con ficha**: nombre, país y año, y la propuesta de una
línea. Da al menú un destino propio y da a un buscador una página que enumera
la curaduría de la tienda.

## 6. Cambios en lo existente

### 6.1 `MenuPantallaCompleta.astro`

- El botón de la cabecera dice **"Archivo de marcas"** en vez de "Marcas".
  Igual el `aria-label` del `<nav>`.
- Cada entrada resuelve su destino según tenga ficha o no (ver 3.2).
- Al bloque aparte, donde ya está "Tienda", entra **"Archivo de marcas"** →
  `/marca/`.
- El comentario de cabecera del componente afirma hoy que no hay página por
  marca y explica por qué. Deja de ser cierto: hay que reescribirlo, no
  borrarlo — la razón nueva es que la marca ahora se presenta, no solo se
  filtra.

### 6.2 `FiltrosProductos.astro`

- Tercer `Desplegable`, `clave="marca"`, **en modo filtro** (sin `hrefTodos`),
  junto a Género y Prenda. El componente ya soporta los dos modos y el script
  ya maneja `estado.marca` y el parámetro `?marca=`: es cablear, no inventar.
- **Opciones del desplegable:** las marcas con prenda en esa página
  (`marcasDe(productos)`). Un desplegable de 25 entradas de las que 6 tienen
  algo solo puede decepcionar.
- **Validación de `?marca=`:** sigue siendo la lista completa
  (`marcasTodas()`). Si se estrechara a las que tienen stock, el enlace del
  menú a una marca sin prendas se descartaría por inválido y se vería el
  catálogo entero, que es lo contrario de lo que el cliente pidió. Son dos
  listas porque son dos trabajos: una ofrece, la otra admite.
- **El distintivo de marca se elimina.** Existía porque la marca no tenía
  desplegable; ahora el desplegable muestra cuál está puesta y cómo quitarla.
  Mantener los dos son dos formas de apagar lo mismo.
- **Consecuencia en las props y en el script.** `FiltrosProductos` pasa a
  recibir dos listas de marcas —`marcas` (las que se ofrecen, con stock) y
  `marcasValidas` (las 25, las que se admiten en la URL)— y
  `RejillaProductos` le pasa `marcasDe(productos)` y `marcasTodas()`
  respectivamente. El script deriva hoy su conjunto de marcas válidas de los
  botones del distintivo, que dejan de existir: pasa a leerlo de un atributo
  `data-` que el build escribe con la lista completa.
- La condición que decide si se pinta la columna suma la nueva dimensión:
  `generos.length > 1 || tipos.length > 1 || marcas.length > 1`.

### 6.3 `src/pages/producto/[slug]/[color].astro`

El `<p class="marca">` pasa a ser enlace a `/marca/<slug>/` **solo si la marca
tiene ficha**. Sin ficha se queda como texto plano: un enlace a un 404 es peor
que ningún enlace. Quien está mirando la prenda es justo quien más necesita
saber quién es la marca.

## 7. Buscadores

### 7.1 Nota sobre la investigación previa

`docs/keywords-decisiones.md` recomienda expresamente **no** hacer página de
marca a las de nicho: Maison Mihara Yasuhiro, Represent y Dime tienen 0
sugerencias con "colombia"; Aimé Leon Dore y Eme Studios, 1.

Esa recomendación sigue siendo correcta **para captar búsquedas**, y este
diseño no la contradice: no se hace la página esperando tráfico de buscador.
Se hace para convertir a quien llega por Instagram sin conocer la marca. Es
una página de confianza, no de captación.

**Consecuencia práctica:** estas páginas no se miden por impresiones ni por
posición. Si dentro de unos meses alguna acumula impresiones en GSC, eso es
ganancia, no el objetivo.

### 7.2 Datos estructurados

En `src/lib/datos-estructurados.ts`, con sus pruebas, como el resto:

- Página de marca: `Brand` (`name`, `foundingDate`, `founder`, `description`,
  `image`) más `BreadcrumbList`. Si hay piezas, un `ItemList` con las URLs de
  sus fichas, igual que hace `fichaCategoria`: solo la URL, porque los datos
  de la prenda ya viven en su `Product` y dos copias acaban discrepando.
- `/marca/`: `CollectionPage` con el `ItemList` de las marcas con ficha.

### 7.3 Títulos y descripciones

- `<title>`: `<Marca> en Colombia | The Rack store`.
- Meta description: el campo `propuesta`, tal cual.
- Trampa confirmada en el doc de keywords: `<marca> bogota` es gente buscando
  tienda física, no compra en línea. No se persigue.

### 7.4 Sitemap

`astro.config.mjs` descubre las rutas solo, pero el `lastmod` está cableado a
dos archivos. Se añade un tercero: las rutas `/marca/*` fechan por
`src/data/fichas-marca.ts`.

## 8. Pruebas

Con vitest, junto a las que ya existen:

- **`fichas-marca`:** falta un campo → el build falla nombrando la marca;
  `propuesta` de más de 160 caracteres → falla; slug que no está en `MARCAS` →
  falla; imagen declarada que no existe en `src/assets/marcas/` → falla.
- **Rutas:** `getStaticPaths` genera una entrada por marca con ficha y
  ninguna por marca sin ella.
- **Menú:** una marca con ficha produce `/marca/<slug>/`; una sin ficha,
  `/?marca=<slug>`.
- **`filtros.test.ts`:** el filtro de marca esconde lo que no es de esa marca
  y se acumula con género y prenda.
- **`datos-estructurados.test.ts`:** el `Brand` de una marca, el `ItemList` de
  sus piezas, y el caso de la marca sin stock, que no debe emitir un
  `ItemList` vacío.

## 9. Riesgos

- **Las imágenes de campaña son de terceros.** Cada ficha nueva exige una
  imagen que la tienda no produjo. Conviene resolver el permiso de uso antes
  de publicar, no después.
- **Escribir las fichas es el trabajo real.** El código queda listo en un par
  de días; convencer en dos párrafos por marca es lo que cuesta. Que la ficha
  sea opcional existe precisamente para que ese trabajo no bloquee el
  despliegue.
