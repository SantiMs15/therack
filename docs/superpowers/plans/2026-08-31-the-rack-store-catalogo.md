# The Rack store — Catálogo web · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un catálogo web estático para The Rack store que muestre 20-50 prendas con foto, precio y talla, y convierta a través de una conversación de WhatsApp con el mensaje ya redactado.

**Architecture:** Sitio Astro generado en build, sin servidor y sin base de datos. Un único archivo TypeScript (`src/data/productos.ts`) es la fuente de verdad; un esquema Zod lo valida al cargar el módulo, de modo que un dato inválido rompe el build en lugar de publicar una ficha rota. Las imágenes se resuelven desde `src/assets/productos/` mediante `import.meta.glob` y las optimiza `astro:assets`. La lógica pura (formato de precio, construcción del enlace de WhatsApp, resolución de imágenes) vive en `src/lib/` y se prueba con Vitest; las páginas `.astro` se verifican por build.

**Tech Stack:** Astro 7.2.10 · TypeScript · Zod 4.5.4 · Vitest 4.1.11 · sharp 0.35.4 · @fontsource/instrument-serif 5.3.0 · @fontsource-variable/geist 5.3.0 · Node ≥22.12 (verificado: 24.13.0) · npm 11.6.2

**Spec:** `docs/superpowers/specs/2026-08-31-the-rack-store-catalogo-design.md`

## Global Constraints

Copiadas literalmente del spec. Los requisitos de cada tarea las incluyen implícitamente.

- **Fondo `#FAFAF9`. Texto `#111111`. Negro puro `#000` solo en el logo. Sin color de acento.**
- **Titulares: Instrument Serif. Interfaz y cuerpo: Geist.** `Inter` y los serif por defecto del navegador están prohibidos.
- **El logo se usa siempre como imagen, nunca reescrito en texto.**
- **Precio COP: punto como separador de miles, sin decimales.** Formato exacto: `$89.000`.
- **Todas las fotos de producto en ratio 3:4 vertical.**
- **Categorías, exactamente estas cuatro:** `mujer`, `hombre`, `calzado`, `accesorios`.
- **Rejilla: 2 columnas en móvil, 3 en escritorio. Sin marco, sin sombra, sin tarjeta.**
- **CTA de WhatsApp en negro con icono blanco. Nunca el verde `#25D366`.**
- **Objetivo de rendimiento: LCP por debajo de 2,5 s en 4G móvil.**
- **Un producto inválido o que referencie una imagen inexistente debe romper el build.**
- **Fuera de alcance:** carrito, pasarela de pago, cuentas, panel de administración, buscador, filtros combinables, variantes de color.
- **Indicativo telefónico: +57 (Colombia).**

## Nota sobre riesgo técnico

Astro 7 es reciente. El API de `astro:assets` (`<Image />`, `ImageMetadata`) y `getStaticPaths` es estable desde Astro 3, pero **la Tarea 1 incluye una verificación temprana y deliberada de `astro:assets`**: ocho tareas posteriores dependen de él, y descubrir una diferencia de API en la Tarea 9 costaría rehacerlas. Si esa verificación falla, detente y ajusta el plan antes de continuar.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/formato.ts` | Formatear precios COP. Puro. |
| `src/lib/whatsapp.ts` | Construir el enlace `wa.me` con mensaje prellenado. Puro. |
| `src/lib/imagenes.ts` | Fábrica del resolvedor de imágenes. Puro, recibe el mapa por parámetro. |
| `src/lib/imagenes-productos.ts` | Enlaza la fábrica con el `import.meta.glob` real. |
| `src/data/schema.ts` | Esquema Zod, tipo `Producto`, validación del catálogo. |
| `src/data/productos.ts` | **Los datos.** Único archivo que se edita al añadir género. |
| `src/config.ts` | Teléfono, Instagram, dominio, datos de la tienda. |
| `src/styles/global.css` | Tokens de diseño y estilos base. |
| `src/layouts/Layout.astro` | Cabecera, pie, `<head>`, fuentes. |
| `src/components/TarjetaProducto.astro` | Una celda de la rejilla. |
| `src/components/RejillaProductos.astro` | La rejilla responsive. |
| `src/components/BotonWhatsApp.astro` | El CTA. |
| `src/pages/*` | Las seis rutas. |
| `scripts/generar-marcadores.mjs` | Genera imágenes 3:4 de relleno para desarrollar sin fotos reales. |

Cada archivo de `src/lib/` tiene una responsabilidad y se prueba aisladamente. La lógica pura se separa de los componentes `.astro` precisamente para que sea testeable sin renderizar.

---

### Task 1: Andamiaje del proyecto y verificación de `astro:assets`

**Files:**
- Create: `.nvmrc`, `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/pages/index.astro`
- Create: `src/assets/logo-negro.png` (copia renombrada del asset existente)

**Interfaces:**
- Consumes: nada (primera tarea)
- Produces: un proyecto Astro que compila; `src/assets/logo-negro.png` disponible para la Tarea 6

- [ ] **Step 1: Fijar la versión de Node**

```bash
echo "22.12.0" > .nvmrc
```

- [ ] **Step 2: Crear `package.json`**

```json
{
  "name": "the-rack-store",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "7.2.10"
  }
}
```

- [ ] **Step 3: Instalar**

Run: `npm install`
Expected: termina sin errores; se crea `package-lock.json` y `node_modules/`.

- [ ] **Step 4: Crear `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://therackstore.co',
  build: { format: 'directory' },
})
```

`site` es necesario para que las URL absolutas del mensaje de WhatsApp se generen bien. Se ajusta cuando el dominio esté confirmado (spec §12).

- [ ] **Step 5: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 6: Copiar el logo con un nombre usable**

El asset actual tiene espacios y `@` en el nombre, lo que complica importarlo.

```bash
mkdir -p src/assets
cp "The rack black@300x-8.png" src/assets/logo-negro.png
cp "The rack white@300x-8.png" src/assets/logo-blanco.png
```

- [ ] **Step 7: Página mínima que ejercita `astro:assets`**

Esta página existe para probar el API de imágenes, no para quedarse. Créala en `src/pages/index.astro`:

```astro
---
import { Image } from 'astro:assets'
import logo from '../assets/logo-negro.png'
---
<html lang="es">
  <head><meta charset="utf-8" /><title>The Rack store</title></head>
  <body>
    <Image src={logo} alt="The Rack store" width={400} />
  </body>
</html>
```

- [ ] **Step 8: Build y verificación del API de imágenes**

Run: `npm run build`
Expected: el build termina sin errores.

Run: `ls dist/_astro/`
Expected: contiene un archivo de imagen procesado (nombre con hash). **Si `dist/_astro/` no existe o el build falla con un error sobre `astro:assets`, DETENTE**: el API cambió en Astro 7 y el resto del plan necesita ajuste.

- [ ] **Step 9: Commit**

```bash
git add .nvmrc package.json package-lock.json astro.config.mjs tsconfig.json src/ .gitignore
git commit -m "chore: andamiaje Astro y verificacion de astro:assets"
```

---

### Task 2: Formato de precio colombiano

**Files:**
- Create: `src/lib/formato.ts`
- Test: `src/lib/formato.test.ts`
- Modify: `package.json` (añadir vitest)
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nada
- Produces: `formatearPrecio(valor: number): string`

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest@4.1.11
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
})
```

- [ ] **Step 3: Escribir el test que falla**

Crea `src/lib/formato.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatearPrecio } from './formato'

describe('formatearPrecio', () => {
  it('usa punto como separador de miles', () => {
    expect(formatearPrecio(89000)).toBe('$89.000')
  })

  it('agrupa millones correctamente', () => {
    expect(formatearPrecio(1200000)).toBe('$1.200.000')
  })

  it('no agrupa por debajo de mil', () => {
    expect(formatearPrecio(500)).toBe('$500')
  })

  it('formatea el cero', () => {
    expect(formatearPrecio(0)).toBe('$0')
  })

  it('redondea decimales', () => {
    expect(formatearPrecio(89000.6)).toBe('$89.001')
  })

  it('rechaza precios negativos', () => {
    expect(() => formatearPrecio(-1)).toThrow(/inv[aá]lido/i)
  })

  it('rechaza valores no numericos', () => {
    expect(() => formatearPrecio(NaN)).toThrow(/inv[aá]lido/i)
  })
})
```

- [ ] **Step 4: Ejecutar el test y verificar que falla**

Run: `npm test`
Expected: FAIL — no existe el módulo `./formato`.

- [ ] **Step 5: Implementar**

Crea `src/lib/formato.ts`:

```ts
/**
 * Formatea un valor en pesos colombianos: $89.000
 *
 * No se usa Intl.NumberFormat deliberadamente. Su salida para es-CO
 * varia entre versiones de ICU y en algunas inserta un espacio duro
 * entre el simbolo y la cifra, lo que produce un formato distinto
 * segun la maquina que haga el build. Esta implementacion es
 * deterministica.
 */
export function formatearPrecio(valor: number): string {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error(`Precio invalido: ${valor}`)
  }
  const entero = Math.round(valor).toString()
  return '$' + entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
```

- [ ] **Step 6: Ejecutar el test y verificar que pasa**

Run: `npm test`
Expected: PASS — 7 tests.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/formato.ts src/lib/formato.test.ts
git commit -m "feat: formato de precio en pesos colombianos"
```

---

### Task 3: Esquema de producto y validación del catálogo

**Files:**
- Create: `src/data/schema.ts`
- Test: `src/data/schema.test.ts`
- Create: `src/data/productos.ts`
- Modify: `package.json` (añadir zod)

**Interfaces:**
- Consumes: nada
- Produces:
  - `CATEGORIAS: readonly ['mujer','hombre','calzado','accesorios']`
  - `type Producto` con campos `slug, nombre, categoria, precio, tallas, descripcion, imagenes, destacado, disponible`
  - `ProductoSchema` (Zod)
  - `validarCatalogo(datos: unknown[]): Producto[]` — lanza si algo es inválido
  - `productos: Producto[]` exportado desde `src/data/productos.ts`

- [ ] **Step 1: Instalar Zod**

```bash
npm install zod@4.5.4
```

- [ ] **Step 2: Escribir el test que falla**

Crea `src/data/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validarCatalogo, ProductoSchema, CATEGORIAS } from './schema'

const valido = {
  slug: 'blazer-lino-negro',
  nombre: 'Blazer de lino',
  categoria: 'mujer',
  precio: 189000,
  tallas: ['S', 'M', 'L'],
  descripcion: 'Corte recto, forro interior.',
  imagenes: ['blazer-lino-negro-1.jpg'],
  destacado: true,
  disponible: true,
}

describe('ProductoSchema', () => {
  it('acepta un producto completo', () => {
    expect(ProductoSchema.safeParse(valido).success).toBe(true)
  })

  it('expone exactamente las cuatro categorias del spec', () => {
    expect([...CATEGORIAS]).toEqual(['mujer', 'hombre', 'calzado', 'accesorios'])
  })
})

describe('validarCatalogo', () => {
  it('devuelve los productos cuando todos son validos', () => {
    expect(validarCatalogo([valido])).toHaveLength(1)
  })

  it('rompe si falta el precio', () => {
    const { precio, ...sinPrecio } = valido
    expect(() => validarCatalogo([sinPrecio])).toThrow(/precio/i)
  })

  it('rompe si la categoria no es una de las cuatro', () => {
    expect(() => validarCatalogo([{ ...valido, categoria: 'juguetes' }]))
      .toThrow(/categoria/i)
  })

  it('rompe si el precio no es entero positivo', () => {
    expect(() => validarCatalogo([{ ...valido, precio: -5 }])).toThrow(/precio/i)
  })

  it('rompe si el producto no tiene imagenes', () => {
    expect(() => validarCatalogo([{ ...valido, imagenes: [] }])).toThrow(/imagenes/i)
  })

  it('rompe si el producto no tiene tallas', () => {
    expect(() => validarCatalogo([{ ...valido, tallas: [] }])).toThrow(/tallas/i)
  })

  it('rompe si el slug tiene mayusculas o espacios', () => {
    expect(() => validarCatalogo([{ ...valido, slug: 'Blazer Lino' }])).toThrow(/slug/i)
  })

  it('rompe si dos productos comparten slug', () => {
    expect(() => validarCatalogo([valido, { ...valido, nombre: 'Otro' }]))
      .toThrow(/duplicado/i)
  })

  it('identifica que producto es el invalido', () => {
    expect(() => validarCatalogo([valido, { ...valido, slug: 'otro', precio: 'gratis' }]))
      .toThrow(/#1/)
  })
})
```

- [ ] **Step 3: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — no existe `./schema`.

- [ ] **Step 4: Implementar el esquema**

Crea `src/data/schema.ts`:

```ts
import { z } from 'zod'

export const CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios'] as const
export type Categoria = (typeof CATEGORIAS)[number]

export const ProductoSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug: solo minusculas, numeros y guiones'),
  nombre: z.string().min(1, 'nombre: no puede estar vacio'),
  categoria: z.enum(CATEGORIAS),
  precio: z.number().int('precio: debe ser entero').positive('precio: debe ser positivo'),
  tallas: z.array(z.string().min(1)).min(1, 'tallas: al menos una'),
  descripcion: z.string().min(1, 'descripcion: no puede estar vacia'),
  imagenes: z.array(z.string().min(1)).min(1, 'imagenes: al menos una'),
  destacado: z.boolean(),
  disponible: z.boolean(),
})

export type Producto = z.infer<typeof ProductoSchema>

/**
 * Valida el catalogo entero. Lanza con un mensaje que identifica el
 * producto y el campo culpable: este error aparece en consola durante
 * el build, y quien lo lea puede no haber escrito nunca este codigo.
 */
export function validarCatalogo(datos: unknown[]): Producto[] {
  const productos = datos.map((dato, indice) => {
    const resultado = ProductoSchema.safeParse(dato)
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((i) => `    - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
        .join('\n')
      throw new Error(`Producto #${indice} invalido:\n${detalles}`)
    }
    return resultado.data
  })

  const vistos = new Set<string>()
  for (const producto of productos) {
    if (vistos.has(producto.slug)) {
      throw new Error(`slug duplicado: "${producto.slug}". Cada producto necesita uno unico.`)
    }
    vistos.add(producto.slug)
  }

  return productos
}
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — 11 tests entre los dos archivos más los 7 de la Tarea 2.

- [ ] **Step 6: Crear el catálogo con datos semilla**

Tres productos de ejemplo, uno por categoría usada, para poder construir antes de que lleguen los datos reales. Crea `src/data/productos.ts`:

```ts
import { validarCatalogo, type Producto } from './schema'

/**
 * FUENTE DE VERDAD DEL CATALOGO.
 *
 * Para anadir una prenda: anade un objeto a este array y deja sus fotos
 * en src/assets/productos/ con los nombres que declares en `imagenes`.
 * Las fotos deben ir en ratio 3:4 vertical.
 *
 * Si algo esta mal, el build falla con un mensaje que dice que producto
 * y que campo. No publica una ficha rota.
 *
 * DATOS SEMILLA: reemplazar por el catalogo real.
 */
const catalogo: unknown[] = [
  {
    slug: 'blazer-lino-negro',
    nombre: 'Blazer de lino',
    categoria: 'mujer',
    precio: 189000,
    tallas: ['S', 'M', 'L'],
    descripcion: 'Corte recto en lino, forro interior y boton forrado.',
    imagenes: ['blazer-lino-negro-1.jpg', 'blazer-lino-negro-2.jpg'],
    destacado: true,
    disponible: true,
  },
  {
    slug: 'camisa-oxford-blanca',
    nombre: 'Camisa Oxford',
    categoria: 'hombre',
    precio: 129000,
    tallas: ['M', 'L', 'XL'],
    descripcion: 'Algodon Oxford, cuello button-down, corte regular.',
    imagenes: ['camisa-oxford-blanca-1.jpg'],
    destacado: true,
    disponible: true,
  },
  {
    slug: 'botin-cuero-cafe',
    nombre: 'Botin de cuero',
    categoria: 'calzado',
    precio: 249000,
    tallas: ['38', '39', '40', '41'],
    descripcion: 'Cuero natural, suela de goma, cierre lateral.',
    imagenes: ['botin-cuero-cafe-1.jpg'],
    destacado: false,
    disponible: false,
  },
]

export const productos: Producto[] = validarCatalogo(catalogo)
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/data/
git commit -m "feat: esquema de producto validado y catalogo semilla"
```

---

### Task 4: Resolución de imágenes con fallo en build

**Files:**
- Create: `src/lib/imagenes.ts`
- Test: `src/lib/imagenes.test.ts`
- Create: `src/lib/imagenes-productos.ts`
- Create: `scripts/generar-marcadores.mjs`
- Create: `src/assets/productos/` (con marcadores generados)

**Interfaces:**
- Consumes: `productos` de la Tarea 3
- Produces:
  - `crearResolvedorImagenes(mapa): (nombre: string) => ImageMetadata`
  - `resolverImagen(nombre: string): ImageMetadata` desde `src/lib/imagenes-productos.ts`

- [ ] **Step 1: Escribir el test que falla**

La fábrica recibe el mapa por parámetro precisamente para poder probarla sin archivos reales. Crea `src/lib/imagenes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { crearResolvedorImagenes } from './imagenes'

const falsa = (n: string) => ({ default: { src: `/_astro/${n}`, width: 900, height: 1200, format: 'jpg' } })

const mapa = {
  '/src/assets/productos/blazer-lino-negro-1.jpg': falsa('blazer-lino-negro-1.jpg'),
  '/src/assets/productos/camisa-oxford-blanca-1.jpg': falsa('camisa-oxford-blanca-1.jpg'),
} as any

describe('crearResolvedorImagenes', () => {
  it('resuelve una imagen por su nombre de archivo', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(resolver('blazer-lino-negro-1.jpg').src).toBe('/_astro/blazer-lino-negro-1.jpg')
  })

  it('lanza si la imagen no existe', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/no-existe\.jpg/)
  })

  it('el error dice donde colocar el archivo', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/src\/assets\/productos/)
  })

  it('el error lista las imagenes disponibles', () => {
    const resolver = crearResolvedorImagenes(mapa)
    expect(() => resolver('no-existe.jpg')).toThrow(/camisa-oxford-blanca-1\.jpg/)
  })

  it('funciona con un mapa vacio y lo dice', () => {
    const resolver = crearResolvedorImagenes({} as any)
    expect(() => resolver('cualquiera.jpg')).toThrow(/ninguna/)
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — no existe `./imagenes`.

- [ ] **Step 3: Implementar la fábrica**

Crea `src/lib/imagenes.ts`:

```ts
import type { ImageMetadata } from 'astro'

type ModuloImagen = { default: ImageMetadata }

/**
 * Construye un resolvedor que traduce el nombre de archivo declarado en
 * productos.ts a los metadatos que necesita <Image />.
 *
 * Recibe el mapa por parametro en lugar de leerlo directamente para que
 * sea probable sin archivos en disco.
 */
export function crearResolvedorImagenes(mapa: Record<string, ModuloImagen>) {
  const porNombre = new Map<string, ImageMetadata>()
  for (const [ruta, modulo] of Object.entries(mapa)) {
    const nombre = ruta.split('/').pop()
    if (nombre) porNombre.set(nombre, modulo.default)
  }

  return function resolverImagen(nombre: string): ImageMetadata {
    const imagen = porNombre.get(nombre)
    if (!imagen) {
      const disponibles = [...porNombre.keys()].join(', ') || '(ninguna)'
      throw new Error(
        `Imagen no encontrada: "${nombre}".\n` +
          `  Colocala en src/assets/productos/ con ese nombre exacto.\n` +
          `  Disponibles ahora mismo: ${disponibles}`
      )
    }
    return imagen
  }
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — 5 tests nuevos.

- [ ] **Step 5: Enlazar con el glob real**

Crea `src/lib/imagenes-productos.ts`:

```ts
import type { ImageMetadata } from 'astro'
import { crearResolvedorImagenes } from './imagenes'

const mapa = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/productos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

export const resolverImagen = crearResolvedorImagenes(mapa)
```

- [ ] **Step 6: Script de marcadores para desarrollar sin fotos**

Las fotos reales todavía no están (spec §12). Este script genera imágenes 3:4 grises con el nombre escrito encima, para que el build funcione de extremo a extremo mientras tanto. Crea `scripts/generar-marcadores.mjs`:

```js
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const NOMBRES = [
  'blazer-lino-negro-1.jpg',
  'blazer-lino-negro-2.jpg',
  'camisa-oxford-blanca-1.jpg',
  'botin-cuero-cafe-1.jpg',
]

const ANCHO = 900
const ALTO = 1200 // ratio 3:4 exacto

await mkdir('src/assets/productos', { recursive: true })

for (const nombre of NOMBRES) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <rect width="100%" height="100%" fill="#E7E5E4"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="28"
          fill="#78716C" text-anchor="middle">${nombre}</text>
  </svg>`
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(`src/assets/productos/${nombre}`)
  console.log('generado', nombre)
}
```

- [ ] **Step 7: Instalar sharp y generar los marcadores**

```bash
npm install -D sharp@0.35.4
node scripts/generar-marcadores.mjs
```

Run: `ls src/assets/productos/`
Expected: los cuatro archivos `.jpg`.

- [ ] **Step 8: Verificar que una imagen ausente rompe el build**

Ésta es la garantía del spec §9; hay que comprobarla, no suponerla.

```bash
mv src/assets/productos/camisa-oxford-blanca-1.jpg /tmp/camisa.jpg
npm run build
```

Expected: **el build FALLA** con `Imagen no encontrada: "camisa-oxford-blanca-1.jpg"`.

> Nota: el build solo fallará si alguna página ya llama a `resolverImagen`. Si en este punto ninguna lo hace todavía, el build pasará; en ese caso repite esta comprobación al final de la Tarea 7, cuando la rejilla ya consuma imágenes, y anótalo aquí.

Restaurar:

```bash
mv /tmp/camisa.jpg src/assets/productos/camisa-oxford-blanca-1.jpg
```

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/lib/imagenes.ts src/lib/imagenes.test.ts src/lib/imagenes-productos.ts scripts/ src/assets/productos/
git commit -m "feat: resolucion de imagenes que rompe el build si falta un archivo"
```

---

### Task 5: Enlace de WhatsApp y configuración del sitio

**Files:**
- Create: `src/lib/whatsapp.ts`
- Test: `src/lib/whatsapp.test.ts`
- Create: `src/config.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `construirEnlaceWhatsApp(opciones: OpcionesEnlace): string`
  - `type OpcionesEnlace = { telefono: string; nombre: string; url: string; talla?: string }`
  - `CONFIG` desde `src/config.ts` con `telefono, instagram, dominio, direccion, ciudad, horarios`

- [ ] **Step 1: Escribir el test que falla**

Crea `src/lib/whatsapp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { construirEnlaceWhatsApp } from './whatsapp'

const base = {
  telefono: '+57 300 123 4567',
  nombre: 'Blazer de lino',
  url: 'https://therackstore.co/producto/blazer-lino-negro',
}

describe('construirEnlaceWhatsApp', () => {
  it('apunta a wa.me con el telefono en digitos', () => {
    expect(construirEnlaceWhatsApp(base)).toContain('https://wa.me/573001234567?text=')
  })

  it('elimina espacios, guiones y el signo mas del telefono', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, telefono: '+57-300-123-4567' })
    expect(enlace).toContain('wa.me/573001234567')
  })

  it('incluye el nombre del producto en el mensaje', () => {
    const enlace = construirEnlaceWhatsApp(base)
    expect(decodeURIComponent(enlace)).toContain('Blazer de lino')
  })

  it('incluye la talla cuando se indica', () => {
    const enlace = construirEnlaceWhatsApp({ ...base, talla: 'M' })
    expect(decodeURIComponent(enlace)).toContain('(talla M)')
  })

  it('omite la talla cuando no se indica', () => {
    expect(decodeURIComponent(construirEnlaceWhatsApp(base))).not.toContain('talla')
  })

  it('incluye la url del producto', () => {
    expect(decodeURIComponent(construirEnlaceWhatsApp(base))).toContain(base.url)
  })

  it('codifica el salto de linea', () => {
    expect(construirEnlaceWhatsApp(base)).toContain('%0A')
  })

  it('rechaza un telefono demasiado corto', () => {
    expect(() => construirEnlaceWhatsApp({ ...base, telefono: '300' }))
      .toThrow(/tel[eé]fono/i)
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — no existe `./whatsapp`.

- [ ] **Step 3: Implementar**

Crea `src/lib/whatsapp.ts`:

```ts
export type OpcionesEnlace = {
  /** Con indicativo de pais. Se limpian espacios, guiones y el signo mas. */
  telefono: string
  nombre: string
  /** URL absoluta de la ficha del producto. */
  url: string
  talla?: string
}

/**
 * Construye el enlace wa.me con el mensaje ya redactado.
 *
 * El prellenado es el valor entero del modelo catalogo->DM: sin el,
 * llegan mensajes de "hola, info?" y se gastan veinte mensajes
 * averiguando de que prenda se habla.
 */
export function construirEnlaceWhatsApp({ telefono, nombre, url, talla }: OpcionesEnlace): string {
  const digitos = telefono.replace(/\D/g, '')
  if (digitos.length < 10) {
    throw new Error(`Telefono invalido: "${telefono}". Necesita indicativo de pais y numero.`)
  }
  const detalle = talla ? ` (talla ${talla})` : ''
  const texto = `Hola! Me interesa el ${nombre}${detalle}\n${url}`
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — 8 tests nuevos.

- [ ] **Step 5: Crear la configuración**

Los valores marcados están pendientes del cliente (spec §12). Crea `src/config.ts`:

```ts
/**
 * Datos del negocio. PENDIENTE: reemplazar los marcados antes de publicar.
 */
export const CONFIG = {
  nombre: 'The Rack store',
  telefono: '+57 300 000 0000',        // PENDIENTE
  instagram: 'therackstore',            // PENDIENTE
  dominio: 'https://therackstore.co',   // PENDIENTE
  direccion: 'Calle 00 #00-00',         // PENDIENTE
  ciudad: 'Bogota',                     // PENDIENTE
  horarios: 'Lunes a sabado, 10:00 - 19:00', // PENDIENTE
} as const
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp.test.ts src/config.ts
git commit -m "feat: enlace de whatsapp con mensaje prellenado"
```

---

### Task 6: Tokens de diseño y layout base

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro`
- Modify: `package.json` (fuentes)

**Interfaces:**
- Consumes: `CONFIG` (Tarea 5), `src/assets/logo-negro.png` (Tarea 1)
- Produces: `Layout.astro` con props `{ titulo: string; descripcion?: string }`

- [ ] **Step 1: Instalar las fuentes autoalojadas**

Autoalojadas y no desde el CDN de Google: elimina una conexión a un tercer dominio, que es coste directo de LCP en 4G.

```bash
npm install @fontsource/instrument-serif@5.3.0 @fontsource-variable/geist@5.3.0
```

- [ ] **Step 2: Crear los tokens**

Crea `src/styles/global.css`:

```css
:root {
  --fondo: #FAFAF9;
  --texto: #111111;
  --texto-suave: #57534E;
  --linea: #E7E5E4;

  --fuente-titular: 'Instrument Serif', Georgia, serif;
  --fuente-ui: 'Geist Variable', system-ui, sans-serif;

  --ancho-max: 1400px;
  --espacio-1: 0.5rem;
  --espacio-2: 1rem;
  --espacio-3: 2rem;
  --espacio-4: 4rem;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--fondo);
  color: var(--texto);
  font-family: var(--fuente-ui);
  font-size: 1rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--fuente-titular);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}

h1 { font-size: clamp(2.25rem, 5vw, 3.75rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); }

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

.contenedor {
  max-width: var(--ancho-max);
  margin-inline: auto;
  padding-inline: var(--espacio-2);
}

@media (min-width: 768px) {
  .contenedor { padding-inline: var(--espacio-3); }
}

@media (min-width: 1200px) {
  .contenedor { padding-inline: var(--espacio-4); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Crear el layout**

Crea `src/layouts/Layout.astro`:

```astro
---
import { Image } from 'astro:assets'
import '@fontsource/instrument-serif'
import '@fontsource-variable/geist'
import '../styles/global.css'
import logo from '../assets/logo-negro.png'
import { CONFIG } from '../config'

interface Props {
  titulo: string
  descripcion?: string
}

const { titulo, descripcion = 'Tienda de ropa en ' + CONFIG.ciudad } = Astro.props
const enlaces = [
  { href: '/catalogo/mujer', texto: 'Mujer' },
  { href: '/catalogo/hombre', texto: 'Hombre' },
  { href: '/catalogo/calzado', texto: 'Calzado' },
  { href: '/catalogo/accesorios', texto: 'Accesorios' },
  { href: '/tienda', texto: 'Tienda' },
]
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo} — {CONFIG.nombre}</title>
    <meta name="description" content={descripcion} />
  </head>
  <body>
    <header class="cabecera contenedor">
      <a href="/" aria-label={CONFIG.nombre}>
        <Image src={logo} alt={CONFIG.nombre} width={180} loading="eager" />
      </a>
      <nav>
        {enlaces.map((e) => <a href={e.href}>{e.texto}</a>)}
      </nav>
    </header>

    <main><slot /></main>

    <footer class="pie contenedor">
      <p>{CONFIG.nombre} · {CONFIG.direccion}, {CONFIG.ciudad}</p>
      <p><a href={`https://instagram.com/${CONFIG.instagram}`}>Instagram</a></p>
    </footer>
  </body>
</html>

<style>
  .cabecera {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espacio-2);
    align-items: center;
    justify-content: space-between;
    padding-block: var(--espacio-3);
  }
  .cabecera nav { display: flex; gap: var(--espacio-2); flex-wrap: wrap; }
  .cabecera nav a { font-size: 0.9375rem; }
  .cabecera nav a:hover { text-decoration: underline; }
  .pie {
    border-top: 1px solid var(--linea);
    margin-top: var(--espacio-4);
    padding-block: var(--espacio-3);
    color: var(--texto-suave);
    font-size: 0.875rem;
  }
</style>
```

- [ ] **Step 4: Usar el layout en la portada**

Reemplaza `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
---
<Layout titulo="Inicio">
  <div class="contenedor">
    <h1>The Rack store</h1>
  </div>
</Layout>
```

- [ ] **Step 5: Verificar el build y revisar en el navegador**

Run: `npm run build`
Expected: PASS.

Run: `npm run dev` y abrir `http://localhost:4321`
Expected: logo arriba, navegación con las cuatro categorías, fondo hueso `#FAFAF9`, titular en serif. **Comprueba que el titular NO se ve con la serif por defecto del navegador** (Instrument Serif tiene un contraste de trazo marcado; si parece Times, la fuente no cargó).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/ src/layouts/ src/pages/index.astro
git commit -m "feat: tokens de diseno y layout base"
```

---

### Task 7: Tarjeta de producto y rejilla

**Files:**
- Create: `src/components/TarjetaProducto.astro`
- Create: `src/components/RejillaProductos.astro`

**Interfaces:**
- Consumes: `Producto` (Tarea 3), `resolverImagen` (Tarea 4), `formatearPrecio` (Tarea 2)
- Produces:
  - `TarjetaProducto` con props `{ producto: Producto }`
  - `RejillaProductos` con props `{ productos: Producto[] }`

- [ ] **Step 1: Crear la tarjeta**

Crea `src/components/TarjetaProducto.astro`:

```astro
---
import { Image } from 'astro:assets'
import type { Producto } from '../data/schema'
import { resolverImagen } from '../lib/imagenes-productos'
import { formatearPrecio } from '../lib/formato'

interface Props { producto: Producto }
const { producto } = Astro.props
const imagen = resolverImagen(producto.imagenes[0])
---
<a class="tarjeta" href={`/producto/${producto.slug}`}>
  <div class="marco">
    <Image
      src={imagen}
      alt={producto.nombre}
      widths={[300, 600, 900]}
      sizes="(max-width: 767px) 50vw, 33vw"
      loading="lazy"
    />
    {!producto.disponible && <span class="agotado">Agotado</span>}
  </div>
  <h3 class="nombre">{producto.nombre}</h3>
  <p class="precio">{formatearPrecio(producto.precio)}</p>
</a>

<style>
  .tarjeta { display: block; }
  .marco {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--linea);
  }
  .marco :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 400ms ease;
  }
  .tarjeta:hover .marco :global(img) { transform: scale(1.03); }
  .agotado {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    background: var(--texto);
    color: var(--fondo);
    text-align: center;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding-block: var(--espacio-1);
  }
  .nombre {
    font-family: var(--fuente-ui);
    font-size: 0.9375rem;
    font-weight: 400;
    margin-block: var(--espacio-1) 0;
  }
  .precio { margin: 0; color: var(--texto-suave); font-size: 0.875rem; }
</style>
```

`aspect-ratio: 3/4` más `object-fit: cover` es lo que garantiza la rejilla uniforme del spec aunque una foto llegue con otra proporción.

- [ ] **Step 2: Crear la rejilla**

Crea `src/components/RejillaProductos.astro`:

```astro
---
import type { Producto } from '../data/schema'
import TarjetaProducto from './TarjetaProducto.astro'

interface Props { productos: Producto[] }
const { productos } = Astro.props
---
{productos.length === 0 ? (
  <p class="vacio">Todavia no hay prendas en esta categoria.</p>
) : (
  <ul class="rejilla">
    {productos.map((producto) => (
      <li><TarjetaProducto producto={producto} /></li>
    ))}
  </ul>
)}

<style>
  .rejilla {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--espacio-2);
  }
  @media (min-width: 768px) {
    .rejilla {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--espacio-3);
    }
  }
  .vacio { color: var(--texto-suave); }

  /* Entrada suave al hacer scroll (spec §6).
     CSS puro: animation-timeline no necesita JavaScript. Donde el
     navegador no lo soporta, las tarjetas aparecen sin animacion,
     que es la degradacion correcta. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .rejilla li {
        animation: aparecer linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }
    }
  }

  @keyframes aparecer {
    from { opacity: 0; transform: translateY(1rem); }
    to   { opacity: 1; transform: none; }
  }
</style>
```

- [ ] **Step 3: Verificar en la portada**

Modifica temporalmente `src/pages/index.astro` para renderizar la rejilla con todos los productos:

```astro
---
import Layout from '../layouts/Layout.astro'
import RejillaProductos from '../components/RejillaProductos.astro'
import { productos } from '../data/productos'
---
<Layout titulo="Inicio">
  <div class="contenedor">
    <h1>The Rack store</h1>
    <RejillaProductos productos={productos} />
  </div>
</Layout>
```

Run: `npm run build`
Expected: PASS.

Run: `npm run dev`
Expected: 3 marcadores en rejilla, 2 columnas en móvil y 3 en escritorio, el botín con la banda "Agotado", precios como `$189.000`.

- [ ] **Step 4: Reejecutar la comprobación de imagen ausente (Tarea 4, paso 8)**

Ahora sí hay una página que consume imágenes, así que la garantía se puede verificar de verdad.

```bash
mv src/assets/productos/camisa-oxford-blanca-1.jpg /tmp/camisa.jpg
npm run build
```

Expected: **FALLA** con `Imagen no encontrada: "camisa-oxford-blanca-1.jpg"`.

```bash
mv /tmp/camisa.jpg src/assets/productos/camisa-oxford-blanca-1.jpg
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/pages/index.astro
git commit -m "feat: tarjeta de producto y rejilla responsive"
```

---

### Task 8: Rutas de catálogo

**Files:**
- Create: `src/pages/catalogo/index.astro`
- Create: `src/pages/catalogo/[categoria].astro`

**Interfaces:**
- Consumes: `productos` (Tarea 3), `CATEGORIAS` (Tarea 3), `RejillaProductos` (Tarea 7)
- Produces: rutas `/catalogo` y `/catalogo/{mujer,hombre,calzado,accesorios}`

- [ ] **Step 1: Catálogo completo**

Crea `src/pages/catalogo/index.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro'
import RejillaProductos from '../../components/RejillaProductos.astro'
import { productos } from '../../data/productos'
---
<Layout titulo="Catalogo">
  <div class="contenedor">
    <h1>Catalogo</h1>
    <RejillaProductos productos={productos} />
  </div>
</Layout>
```

- [ ] **Step 2: Catálogo por categoría**

Crea `src/pages/catalogo/[categoria].astro`:

```astro
---
import Layout from '../../layouts/Layout.astro'
import RejillaProductos from '../../components/RejillaProductos.astro'
import { productos } from '../../data/productos'
import { CATEGORIAS, type Categoria } from '../../data/schema'

export function getStaticPaths() {
  return CATEGORIAS.map((categoria) => ({ params: { categoria } }))
}

const { categoria } = Astro.params as { categoria: Categoria }
const deLaCategoria = productos.filter((p) => p.categoria === categoria)
const titulos: Record<Categoria, string> = {
  mujer: 'Mujer',
  hombre: 'Hombre',
  calzado: 'Calzado',
  accesorios: 'Accesorios',
}
---
<Layout titulo={titulos[categoria]}>
  <div class="contenedor">
    <h1>{titulos[categoria]}</h1>
    <RejillaProductos productos={deLaCategoria} />
  </div>
</Layout>
```

Las cuatro rutas se generan siempre, aunque una categoría esté vacía: la navegación del layout las enlaza, y un 404 desde el menú principal es peor que una rejilla vacía con su mensaje.

- [ ] **Step 3: Verificar que se generan las cinco rutas**

Run: `npm run build`
Expected: PASS.

Run: `ls dist/catalogo/ dist/catalogo/*/`
Expected: `index.html` en `dist/catalogo/` y en `mujer/`, `hombre/`, `calzado/`, `accesorios/`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalogo/
git commit -m "feat: rutas de catalogo completo y por categoria"
```

---

### Task 9: Ficha de producto con selector de talla

**Files:**
- Create: `src/components/BotonWhatsApp.astro`
- Create: `src/pages/producto/[slug].astro`

**Interfaces:**
- Consumes: `productos`, `resolverImagen`, `formatearPrecio`, `construirEnlaceWhatsApp`, `CONFIG`
- Produces: ruta `/producto/{slug}` por cada producto

**Nota sobre JavaScript:** el spec fija "cero JavaScript por defecto". Esta página es la única excepción y es deliberada: el selector de talla necesita ~15 líneas para reescribir el enlace. Sin ellas, el mensaje no llevaría talla y se perdería la mitad del valor del prellenado. No se carga ningún framework.

- [ ] **Step 1: Crear el botón**

Crea `src/components/BotonWhatsApp.astro`:

```astro
---
interface Props { href: string; children?: unknown }
const { href } = Astro.props
---
<a class="boton" href={href} target="_blank" rel="noopener noreferrer" data-whatsapp>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
  <slot />
</a>

<style>
  .boton {
    display: inline-flex;
    align-items: center;
    gap: var(--espacio-1);
    background: var(--texto);
    color: var(--fondo);
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
    border: 0;
    cursor: pointer;
    transition: transform 150ms ease, opacity 150ms ease;
  }
  .boton:hover { opacity: 0.85; }
  .boton:active { transform: translateY(1px); }
</style>
```

Negro, no `#25D366`: es la decisión del spec §7. El icono aporta el reconocimiento.

- [ ] **Step 2: Crear la ficha**

Crea `src/pages/producto/[slug].astro`:

```astro
---
import { Image } from 'astro:assets'
import Layout from '../../layouts/Layout.astro'
import BotonWhatsApp from '../../components/BotonWhatsApp.astro'
import { productos } from '../../data/productos'
import { resolverImagen } from '../../lib/imagenes-productos'
import { formatearPrecio } from '../../lib/formato'
import { construirEnlaceWhatsApp } from '../../lib/whatsapp'
import { CONFIG } from '../../config'

export function getStaticPaths() {
  return productos.map((producto) => ({
    params: { slug: producto.slug },
    props: { producto },
  }))
}

const { producto } = Astro.props
const imagenes = producto.imagenes.map((n) => ({ nombre: n, datos: resolverImagen(n) }))
const url = new URL(`/producto/${producto.slug}`, CONFIG.dominio).href
const enlaceBase = construirEnlaceWhatsApp({
  telefono: CONFIG.telefono,
  nombre: producto.nombre,
  url,
})
---
<Layout titulo={producto.nombre} descripcion={producto.descripcion}>
  <div class="contenedor ficha">
    <div class="galeria">
      {imagenes.map((img, i) => (
        <Image
          src={img.datos}
          alt={producto.nombre}
          widths={[600, 900, 1200]}
          sizes="(max-width: 767px) 100vw, 50vw"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>

    <div class="detalle">
      <h1>{producto.nombre}</h1>
      <p class="precio">{formatearPrecio(producto.precio)}</p>
      <p class="descripcion">{producto.descripcion}</p>

      {producto.disponible ? (
        <>
          <fieldset class="tallas">
            <legend>Talla</legend>
            {producto.tallas.map((talla, i) => (
              <label>
                <input type="radio" name="talla" value={talla} checked={i === 0} />
                <span>{talla}</span>
              </label>
            ))}
          </fieldset>

          <BotonWhatsApp href={enlaceBase}>Consultar por WhatsApp</BotonWhatsApp>

          <p class="secundario">
            O escribenos por <a href={`https://instagram.com/${CONFIG.instagram}`}>Instagram</a>
          </p>
        </>
      ) : (
        <p class="agotado-aviso">Agotado</p>
      )}
    </div>
  </div>
</Layout>

<script define:vars={{ enlaceBase }}>
  // Reescribe el enlace de WhatsApp con la talla elegida.
  const boton = document.querySelector('[data-whatsapp]')
  const radios = document.querySelectorAll('input[name="talla"]')
  const [inicio, resto] = enlaceBase.split('?text=')
  const textoBase = decodeURIComponent(resto)

  function actualizar() {
    const elegida = document.querySelector('input[name="talla"]:checked')
    if (!boton || !elegida) return
    const [linea1, linea2] = textoBase.split('\n')
    const texto = `${linea1} (talla ${elegida.value})\n${linea2}`
    boton.href = `${inicio}?text=${encodeURIComponent(texto)}`
  }

  radios.forEach((r) => r.addEventListener('change', actualizar))
  actualizar()
</script>

<style>
  .ficha { display: grid; gap: var(--espacio-3); padding-block: var(--espacio-3); }
  @media (min-width: 900px) {
    .ficha { grid-template-columns: 1fr 1fr; gap: var(--espacio-4); align-items: start; }
  }
  .galeria { display: grid; gap: var(--espacio-1); }
  .galeria :global(img) { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }
  .precio { font-size: 1.25rem; margin-block: var(--espacio-1) var(--espacio-2); }
  .descripcion { color: var(--texto-suave); max-width: 55ch; }
  .tallas { border: 0; padding: 0; margin-block: var(--espacio-3) var(--espacio-2); }
  .tallas legend {
    padding: 0;
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--texto-suave);
    margin-bottom: var(--espacio-1);
  }
  .tallas label { display: inline-block; margin-inline-end: var(--espacio-1); }
  .tallas input { position: absolute; opacity: 0; pointer-events: none; }
  .tallas span {
    display: inline-block;
    border: 1px solid var(--linea);
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .tallas input:checked + span { border-color: var(--texto); background: var(--texto); color: var(--fondo); }
  .tallas input:focus-visible + span { outline: 2px solid var(--texto); outline-offset: 2px; }
  .secundario { font-size: 0.875rem; color: var(--texto-suave); margin-top: var(--espacio-2); }
  .secundario a { text-decoration: underline; }
  .agotado-aviso {
    margin-top: var(--espacio-3);
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--texto-suave);
  }
</style>
```

- [ ] **Step 3: Verificar**

Run: `npm run build`
Expected: PASS.

Run: `ls dist/producto/`
Expected: una carpeta por producto (`blazer-lino-negro/`, `camisa-oxford-blanca/`, `botin-cuero-cafe/`).

Run: `npm run dev`, abrir `/producto/blazer-lino-negro`
Expected:
- Cambiar de talla y **pasar el ratón por el botón** muestra en la barra de estado una URL cuyo `text=` incluye la talla nueva.
- `/producto/botin-cuero-cafe` muestra "Agotado" y **no** muestra el botón.
- Con JavaScript desactivado, el botón sigue funcionando sin talla (degradación correcta).

- [ ] **Step 4: Commit**

```bash
git add src/components/BotonWhatsApp.astro src/pages/producto/
git commit -m "feat: ficha de producto con selector de talla y CTA de whatsapp"
```

---

### Task 10: Portada

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `productos`, `RejillaProductos`, `CONFIG`
- Produces: ruta `/` definitiva

- [ ] **Step 1: Escribir la portada**

Reemplaza `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
import RejillaProductos from '../components/RejillaProductos.astro'
import { productos } from '../data/productos'

const destacados = productos.filter((p) => p.destacado && p.disponible)
const categorias = [
  { slug: 'mujer', titulo: 'Mujer' },
  { slug: 'hombre', titulo: 'Hombre' },
  { slug: 'calzado', titulo: 'Calzado' },
  { slug: 'accesorios', titulo: 'Accesorios' },
]
---
<Layout titulo="Inicio">
  <section class="contenedor portada">
    <h1>Ropa escogida<br />una prenda a la vez.</h1>
  </section>

  <nav class="contenedor categorias" aria-label="Categorias">
    {categorias.map((c) => (
      <a href={`/catalogo/${c.slug}`}>{c.titulo}</a>
    ))}
  </nav>

  {destacados.length > 0 && (
    <section class="contenedor">
      <h2>Destacados</h2>
      <RejillaProductos productos={destacados} />
      <p class="ver-todo"><a href="/catalogo">Ver todo el catalogo</a></p>
    </section>
  )}
</Layout>

<style>
  .portada { padding-block: var(--espacio-4) var(--espacio-3); }
  .categorias {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espacio-2);
    padding-block: var(--espacio-2) var(--espacio-4);
    border-bottom: 1px solid var(--linea);
    margin-bottom: var(--espacio-4);
  }
  .categorias a {
    border: 1px solid var(--linea);
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
  }
  .categorias a:hover { border-color: var(--texto); }
  .ver-todo { margin-top: var(--espacio-3); }
  .ver-todo a { text-decoration: underline; }
</style>
```

El titular es asimétrico y alineado a la izquierda, conforme al spec §6. El texto es provisional: sustituir cuando el cliente aporte el suyo.

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: PASS.

Run: `npm run dev`, abrir `/`
Expected: titular grande en serif, cuatro enlaces de categoría, rejilla de destacados (2 productos: blazer y camisa; el botín no sale por estar agotado).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: portada con categorias y destacados"
```

---

### Task 11: Página de tienda y 404

**Files:**
- Create: `src/pages/tienda.astro`
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `CONFIG`
- Produces: rutas `/tienda` y `/404`

- [ ] **Step 1: Página de tienda**

Crea `src/pages/tienda.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
import { CONFIG } from '../config'
---
<Layout titulo="La tienda">
  <div class="contenedor tienda">
    <h1>La tienda</h1>
    <dl>
      <dt>Direccion</dt>
      <dd>{CONFIG.direccion}, {CONFIG.ciudad}</dd>
      <dt>Horarios</dt>
      <dd>{CONFIG.horarios}</dd>
      <dt>Instagram</dt>
      <dd><a href={`https://instagram.com/${CONFIG.instagram}`}>@{CONFIG.instagram}</a></dd>
    </dl>
  </div>
</Layout>

<style>
  .tienda { padding-block: var(--espacio-3) var(--espacio-4); max-width: 55ch; }
  dl { margin-top: var(--espacio-3); }
  dt {
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--texto-suave);
    margin-top: var(--espacio-2);
  }
  dd { margin: 0; }
  dd a { text-decoration: underline; }
</style>
```

- [ ] **Step 2: Página 404**

Crea `src/pages/404.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
---
<Layout titulo="Pagina no encontrada">
  <div class="contenedor error">
    <h1>Esta pagina no existe</h1>
    <p><a href="/catalogo">Ver el catalogo</a></p>
  </div>
</Layout>

<style>
  .error { padding-block: var(--espacio-4); }
  .error a { text-decoration: underline; }
</style>
```

- [ ] **Step 3: Verificar**

Run: `npm run build`
Expected: PASS. Existen `dist/tienda/index.html` y `dist/404.html`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/tienda.astro src/pages/404.astro
git commit -m "feat: pagina de tienda y 404"
```

---

### Task 12: Verificación final y despliegue

**Files:**
- Create: `netlify.toml`
- Create: `README.md`

**Interfaces:**
- Consumes: todo lo anterior
- Produces: sitio verificado y desplegable

- [ ] **Step 1: Suite completa en verde**

Run: `npm test`
Expected: PASS — **31 tests**: 7 de `formato`, 11 de `schema`, 5 de `imagenes`, 8 de `whatsapp`.

- [ ] **Step 2: Inventario de rutas generadas**

Run: `npm run build && find dist -name "*.html" | sort`
Expected exactamente estas 11 rutas con los datos semilla:

```
dist/404.html
dist/catalogo/accesorios/index.html
dist/catalogo/calzado/index.html
dist/catalogo/hombre/index.html
dist/catalogo/index.html
dist/catalogo/mujer/index.html
dist/index.html
dist/producto/blazer-lino-negro/index.html
dist/producto/botin-cuero-cafe/index.html
dist/producto/camisa-oxford-blanca/index.html
dist/tienda/index.html
```

- [ ] **Step 3: Verificar que las imágenes salen optimizadas**

Run: `ls dist/_astro/ | head -20`
Expected: archivos de imagen con hash. **Comprueba que hay varios tamaños del mismo producto** (el `widths` de la Tarea 7): si solo hay uno por imagen, el `srcset` no se generó y el objetivo de LCP está en riesgo.

- [ ] **Step 4: Medir LCP**

```bash
npm run build && npm run preview
```

En otra terminal:

```bash
npx lighthouse http://localhost:4321 --preset=desktop --quiet --chrome-flags="--headless" --only-categories=performance
npx lighthouse http://localhost:4321 --quiet --chrome-flags="--headless" --only-categories=performance
```

Expected: **LCP móvil por debajo de 2,5 s** (spec §8). Si no lo cumple, mira primero el peso de la imagen del primer pliegue: es casi siempre la causa.

> Con marcadores grises el LCP será artificialmente bueno. **Repite esta medición cuando entren las fotos reales**, que es cuando la cifra significa algo.

- [ ] **Step 5: Configuración de Netlify**

Crea `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.12.0"
```

- [ ] **Step 6: README para quien mantenga esto**

Crea `README.md`:

```markdown
# The Rack store — catalogo web

Sitio estatico en Astro. Muestra el catalogo y convierte por WhatsApp.
No vende en linea: no hay carrito ni pasarela de pago.

## Comandos

    npm install      # instalar
    npm run dev      # desarrollo en localhost:4321
    npm run build    # generar dist/
    npm test         # pruebas

## Anadir una prenda

1. Deja las fotos en `src/assets/productos/`, en ratio **3:4 vertical**.
2. Anade un objeto al array de `src/data/productos.ts`.
3. `npm run build`.

Si algo esta mal —falta el precio, la categoria no es una de las cuatro,
una foto no existe— **el build falla y dice cual es el problema**. Eso es
deliberado: prefiere un despliegue que no sale a una tienda con fichas rotas.

## Pendiente antes de publicar

Los valores marcados `PENDIENTE` en `src/config.ts`: telefono de WhatsApp,
usuario de Instagram, dominio, direccion y horarios.

## Documentacion

- Diseno: `docs/superpowers/specs/2026-08-31-the-rack-store-catalogo-design.md`
- Plan: `docs/superpowers/plans/2026-08-31-the-rack-store-catalogo.md`
```

- [ ] **Step 7: Commit final**

```bash
git add netlify.toml README.md
git commit -m "chore: configuracion de despliegue y documentacion"
```

---

## Pendiente del cliente antes de publicar

Ninguno bloquea la implementación; todos bloquean el despliegue (spec §12).

1. Número de WhatsApp con indicativo +57 → `src/config.ts`
2. Usuario de Instagram → `src/config.ts`
3. Dominio → `src/config.ts` y `astro.config.mjs`
4. Dirección, ciudad y horarios → `src/config.ts`
5. Texto de la portada (ahora hay uno provisional)
6. **Las fotos reales en ratio 3:4** → `src/assets/productos/`, reemplazando los marcadores
7. Los productos reales → `src/data/productos.ts`, reemplazando los tres semilla
