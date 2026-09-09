# Archivo de marcas — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a cada marca una página que la presente antes de venderla, en `/marca/<slug>/`, y mover el filtro de marca del menú de la cabecera a la columna de filtros del catálogo.

**Architecture:** Una ficha de marca opcional, declarada en TypeScript y validada con zod en el build, igual que el catálogo. Si una marca tiene ficha se genera su página y todo lo que la nombra enlaza allí; si no la tiene, no hay ruta y los enlaces siguen llevando al filtro de la portada, como hoy. El filtro de marca pasa a ser un tercer `Desplegable` en la columna izquierda, reusando el modo «filtro» que el componente ya implementa para Prenda.

**Tech Stack:** Astro 5 estático, TypeScript, zod para validación en build, vitest para las pruebas. Sin framework de UI.

**Spec:** `docs/superpowers/specs/2026-09-09-archivo-de-marcas-design.md`

## Global Constraints

- **Comentarios y mensajes de commit sin tildes** (`catalogo`, `pagina`, `anadir`). El texto que ve el cliente sí las lleva.
- **Cada commit termina con estas dos líneas**, separadas del cuerpo por una línea en blanco:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
  ```
- **Rutas internas con barra final** (`/marca/aime-leon-dore/`). Sin ella el servidor redirige en cada clic.
- **Nada de `src/data/schema.ts` puede llegar al navegador.** Importar un *valor* de ahí en código que corre en el cliente arrastra zod (84 KB). En el script de `FiltrosProductos.astro` solo se importan tipos, con `import type`.
- **`propuesta`: máximo 160 caracteres.** Es la meta description; más largo, el buscador lo corta.
- **Imagen de marca: ratio 3:2 horizontal**, en `src/assets/marcas/`.
- **`Astro.site` es obligatorio** en toda página que emita JSON-LD; se comprueba y se lanza, como ya hace `catalogo/[categoria].astro`.
- Pruebas: `npm test`. Build completo: `npm run build`.

## Estructura de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `src/data/fichas-marca.ts` | La ficha de marca: schema zod, validación y los datos. Fuente de verdad. |
| `src/data/fichas-marca.test.ts` | Pruebas de la validación. |
| `src/lib/imagenes-marcas.ts` | Resolvedor de `src/assets/marcas/`, hermano de `imagenes-productos.ts`. |
| `src/lib/archivo-marcas.ts` | Las preguntas que el resto del sitio le hace al archivo: ¿tiene ficha?, ¿a dónde enlaza?, ¿qué marcas lo componen? |
| `src/lib/archivo-marcas.test.ts` | Pruebas de lo anterior. |
| `src/pages/marca/[slug].astro` | La página de una marca. |
| `src/pages/marca/index.astro` | El índice del archivo. |
| `src/assets/marcas/` | Las fotos de campaña. |

**Se modifican:**

| Archivo | Cambio |
|---|---|
| `src/lib/imagenes.ts` | El mensaje de error nombra el directorio; hoy dice «productos» siempre. |
| `src/lib/datos-estructurados.ts` | Dos constructores nuevos: `fichaMarca` y `fichaArchivo`. |
| `src/lib/datos-estructurados.test.ts` | Sus pruebas. |
| `src/lib/filtros.test.ts` | El filtro de marca acumulado con los otros dos. |
| `src/components/FiltrosProductos.astro` | Desplegable de marca; fuera el distintivo. |
| `src/components/RejillaProductos.astro` | Pasa dos listas de marcas en vez de una. |
| `src/components/MenuPantallaCompleta.astro` | «Archivo de marcas»; enlaces que navegan. |
| `src/pages/producto/[slug]/[color].astro` | La marca pasa a ser enlace si tiene ficha. |
| `astro.config.mjs` | `lastmod` de las rutas `/marca/*`. |

---

### Task 1: La ficha de marca como dato validado

**Files:**
- Create: `src/data/fichas-marca.ts`
- Create: `src/data/fichas-marca.test.ts`
- Create: `src/lib/imagenes-marcas.ts`
- Modify: `src/lib/imagenes.ts:12-33`
- Modify: `src/lib/imagenes.test.ts`

**Interfaces:**
- Consumes: `MARCAS` de `src/data/marcas.ts`; `slugMarca` de `src/lib/filtros.ts`; `crearResolvedorImagenes` de `src/lib/imagenes.ts`.
- Produces:
  - `FichaMarca` — `{ pais: string; anio: number; fundador: string; propuesta: string; porQue: string[]; imagen: string; alt: string }`
  - `validarFichas(datos: Record<string, unknown>, marcas: readonly string[]): Record<string, FichaMarca>`
  - `FICHAS: Record<string, FichaMarca>` — clave = slug de la marca
  - `resolverImagenMarca(nombre: string): ImageMetadata`

- [ ] **Step 1: Escribir las pruebas de validación**

Crea `src/data/fichas-marca.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validarFichas } from './fichas-marca'

const MARCAS_DE_PRUEBA = ['Aimé Leon Dore', 'Nike'] as const

/** Una ficha completa y valida, para partir de ella y romperla campo a campo. */
function fichaValida() {
  return {
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    porQue: ['Primer parrafo.', 'Segundo parrafo.'],
    imagen: 'aime-leon-dore-campana.jpg',
    alt: 'Campaña de Aimé Leon Dore en una calle de Queens',
  }
}

describe('validarFichas', () => {
  it('acepta un archivo vacio: la ficha es opcional', () => {
    expect(validarFichas({}, MARCAS_DE_PRUEBA)).toEqual({})
  })

  it('devuelve la ficha valida bajo su slug', () => {
    const fichas = validarFichas({ 'aime-leon-dore': fichaValida() }, MARCAS_DE_PRUEBA)
    expect(fichas['aime-leon-dore']?.fundador).toBe('Teddy Santis')
  })

  it('rechaza un slug que no esta en marcas.ts, y lo nombra', () => {
    expect(() => validarFichas({ 'marca-inventada': fichaValida() }, MARCAS_DE_PRUEBA)).toThrow(
      /marca-inventada/
    )
  })

  it('acepta el slug derivado de un nombre con tilde', () => {
    // "Aimé Leon Dore" -> "aime-leon-dore". Si la comparacion se hiciera con
    // el nombre crudo, esta ficha se rechazaria por buena.
    expect(() => validarFichas({ 'aime-leon-dore': fichaValida() }, MARCAS_DE_PRUEBA)).not.toThrow()
  })

  it('rechaza una ficha a la que le falta un campo, y nombra marca y campo', () => {
    const { fundador, ...incompleta } = fichaValida()
    expect(() => validarFichas({ nike: incompleta }, MARCAS_DE_PRUEBA)).toThrow(/nike[\s\S]*fundador/)
  })

  it('rechaza una propuesta de mas de 160 caracteres', () => {
    const larga = { ...fichaValida(), propuesta: 'a'.repeat(161) }
    expect(() => validarFichas({ nike: larga }, MARCAS_DE_PRUEBA)).toThrow(/160/)
  })

  it('rechaza porQue sin ningun parrafo', () => {
    const sinTexto = { ...fichaValida(), porQue: [] }
    expect(() => validarFichas({ nike: sinTexto }, MARCAS_DE_PRUEBA)).toThrow(/porQue/)
  })

  it('rechaza un campo de mas: un nombre mal escrito no se ignora en silencio', () => {
    const conSobra = { ...fichaValida(), pias: 'Estados Unidos' }
    expect(() => validarFichas({ nike: conSobra }, MARCAS_DE_PRUEBA)).toThrow()
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm test -- src/data/fichas-marca.test.ts`
Expected: FAIL — no existe el módulo `./fichas-marca`.

- [ ] **Step 3: Escribir `src/data/fichas-marca.ts`**

```ts
import { z } from 'zod'
import { MARCAS } from './marcas'
import { slugMarca } from '../lib/filtros'

/**
 * LA FICHA DE UNA MARCA: lo que se cuenta de ella antes de venderle nada a
 * nadie.
 *
 * Es opcional. Una marca sin ficha no tiene pagina y sus enlaces siguen
 * llevando al filtro de la portada, que es como funcionaba todo hasta ahora.
 * Escribir las veinticinco antes de publicar habria dejado el archivo
 * esperando indefinidamente.
 *
 * Los campos son fijos y todos obligatorios: asi las paginas se leen igual y
 * no hay marcas contadas a medias. El build falla nombrando la marca y el
 * campo, que es la misma promesa que hace el catalogo.
 */
export const FichaMarcaSchema = z.strictObject({
  pais: z.string().min(1, 'pais: no puede estar vacio'),
  anio: z
    .number()
    .int('anio: debe ser entero')
    .gte(1800, 'anio: fuera de rango')
    .lte(2100, 'anio: fuera de rango'),
  fundador: z.string().min(1, 'fundador: no puede estar vacio'),
  /**
   * Que propone la marca, en una linea. Hace dos trabajos: es el gancho de la
   * pagina y es su meta description. Se escribe una vez para que no puedan
   * acabar diciendo cosas distintas.
   */
  propuesta: z
    .string()
    .min(1, 'propuesta: no puede estar vacia')
    .max(160, 'propuesta: maximo 160 caracteres, que es lo que muestra el buscador'),
  /** Por que la trajimos. Un elemento por parrafo. */
  porQue: z
    .array(z.string().min(1, 'porQue: ningun parrafo puede estar vacio'))
    .min(1, 'porQue: al menos un parrafo'),
  /** Archivo en src/assets/marcas/, en ratio 3:2 horizontal. */
  imagen: z.string().min(1, 'imagen: no puede estar vacia'),
  alt: z.string().min(1, 'alt: no puede estar vacio'),
})

export type FichaMarca = z.infer<typeof FichaMarcaSchema>

/**
 * Valida el archivo entero.
 *
 * Recibe la lista de marcas por parametro, y no la importa, para poder
 * probarse sin arrastrar las veinticinco de verdad.
 *
 * La comprobacion que no es obvia es la del slug: una clave mal escrita
 * generaria una pagina que nada enlaza y que nadie descubriria hasta que
 * alguien contara las URLs del sitemap. Se compara contra `slugMarca` del
 * nombre, no contra el nombre, porque es el slug lo que viaja en la URL.
 */
export function validarFichas(
  datos: Record<string, unknown>,
  marcas: readonly string[]
): Record<string, FichaMarca> {
  const slugs = new Set(marcas.map(slugMarca))
  const fichas: Record<string, FichaMarca> = {}

  for (const [slug, dato] of Object.entries(datos)) {
    if (!slugs.has(slug)) {
      throw new Error(
        `Ficha de marca "${slug}": no hay ninguna marca con ese slug en marcas.ts.\n` +
          `  O la marca falta en MARCAS, o el slug esta mal escrito.`
      )
    }

    const resultado = FichaMarcaSchema.safeParse(dato)
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((i) => `    - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
        .join('\n')
      throw new Error(`Ficha de marca "${slug}" invalida:\n${detalles}`)
    }

    fichas[slug] = resultado.data
  }

  return fichas
}

/**
 * FUENTE DE VERDAD DEL ARCHIVO.
 *
 * Para anadir una marca al archivo: deja su foto en src/assets/marcas/ en
 * ratio 3:2 y anade una entrada aqui, con el slug de la marca por clave.
 */
const archivo: Record<string, unknown> = {}

export const FICHAS = validarFichas(archivo, MARCAS)
```

- [ ] **Step 4: Ejecutar las pruebas**

Run: `npm test -- src/data/fichas-marca.test.ts`
Expected: PASS, 8 pruebas.

- [ ] **Step 5: Parametrizar el directorio en el mensaje de error del resolvedor**

En `src/lib/imagenes.ts`, el error dice siempre «src/assets/productos/». Con dos resolvedores eso manda a la carpeta equivocada. Cambia la firma:

```ts
export function crearResolvedorImagenes(
  mapa: Record<string, ModuloImagen>,
  directorio = 'src/assets/productos/'
) {
```

y dentro, en el `throw`:

```ts
      throw new Error(
        `Imagen no encontrada: "${nombre}".\n` +
          `  Colocala en ${directorio} con ese nombre exacto.\n` +
          `  Disponibles ahora mismo: ${disponibles}`
      )
```

El valor por defecto deja intacta la llamada de `imagenes-productos.ts` y las pruebas que ya existen.

- [ ] **Step 6: Probar el directorio en el mensaje**

Añade a `src/lib/imagenes.test.ts`:

```ts
  it('el error nombra el directorio que se le paso', () => {
    const resolver = crearResolvedorImagenes({}, 'src/assets/marcas/')
    expect(() => resolver('no-existe.jpg')).toThrow(/src\/assets\/marcas\//)
  })
```

Run: `npm test -- src/lib/imagenes.test.ts`
Expected: PASS, incluida la nueva.

- [ ] **Step 7: Crear el resolvedor de marcas**

Crea el directorio y un `.gitkeep`, porque hasta la primera foto está vacío y git no guarda directorios vacíos:

```bash
mkdir -p src/assets/marcas && touch src/assets/marcas/.gitkeep
```

Crea `src/lib/imagenes-marcas.ts`:

```ts
import type { ImageMetadata } from 'astro'
import { crearResolvedorImagenes } from './imagenes'

/**
 * Las fotos de campana de las marcas. Directorio propio y no el de productos:
 * el ratio es otro (3:2 horizontal, no 3:4 vertical) y el uso tambien, asi
 * que mezclarlas invitaria a colar una en el sitio equivocado.
 */
const mapa = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/marcas/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
)

export const resolverImagenMarca = crearResolvedorImagenes(mapa, 'src/assets/marcas/')
```

- [ ] **Step 8: Comprobar que el proyecto sigue compilando y construyendo**

Run: `npm test`
Expected: PASS, todo.

Run: `npm run build`
Expected: build correcto. El archivo está vacío, así que todavía no hay página nueva.

- [ ] **Step 9: Commit**

```bash
git add src/data/fichas-marca.ts src/data/fichas-marca.test.ts src/lib/imagenes.ts src/lib/imagenes.test.ts src/lib/imagenes-marcas.ts src/assets/marcas/.gitkeep
git commit -F - <<'MSG'
feat: la ficha de marca como dato validado

Cada marca puede declarar pais, ano, fundador, una linea de propuesta y
los parrafos de por que la trajimos. Es opcional: el archivo arranca
vacio y crece marca a marca, para que escribir veinticinco fichas no
bloquee el despliegue.

Se valida en el build como el catalogo: falta un campo y falla nombrando
la marca y el campo. Tambien se comprueba que el slug de la ficha existe
en marcas.ts, que es lo que evita una pagina huerfana que nada enlaza.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 2: Las preguntas que el sitio le hace al archivo

Tres sitios necesitan saber lo mismo —el menú, la ficha de producto y las dos páginas nuevas—, y ninguno debería resolverlo por su cuenta.

**Files:**
- Create: `src/lib/archivo-marcas.ts`
- Create: `src/lib/archivo-marcas.test.ts`

**Interfaces:**
- Consumes: `FICHAS`, `FichaMarca` de `src/data/fichas-marca.ts`; `MARCAS` de `src/data/marcas.ts`; `slugMarca` de `src/lib/filtros.ts`.
- Produces:
  - `EntradaArchivo` — `{ slug: string; nombre: string; ficha: FichaMarca }`
  - `tieneFicha(slug: string, fichas?: Record<string, FichaMarca>): boolean`
  - `hrefDeMarca(slug: string, fichas?: Record<string, FichaMarca>): string`
  - `archivoDeMarcas(fichas?: Record<string, FichaMarca>, marcas?: readonly string[]): EntradaArchivo[]`

- [ ] **Step 1: Escribir las pruebas**

Crea `src/lib/archivo-marcas.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { archivoDeMarcas, hrefDeMarca, tieneFicha } from './archivo-marcas'
import type { FichaMarca } from '../data/fichas-marca'

const MARCAS_DE_PRUEBA = ['Nike', 'Aimé Leon Dore', 'Represent'] as const

function ficha(pais: string, anio: number): FichaMarca {
  return {
    pais,
    anio,
    fundador: 'Alguien',
    propuesta: 'Una linea.',
    porQue: ['Un parrafo.'],
    imagen: 'x.jpg',
    alt: 'Una foto',
  }
}

const FICHAS_DE_PRUEBA: Record<string, FichaMarca> = {
  'aime-leon-dore': ficha('Estados Unidos', 2014),
  represent: ficha('Reino Unido', 2011),
}

describe('tieneFicha', () => {
  it('es cierto para la marca que la tiene', () => {
    expect(tieneFicha('represent', FICHAS_DE_PRUEBA)).toBe(true)
  })

  it('es falso para la marca que no', () => {
    expect(tieneFicha('nike', FICHAS_DE_PRUEBA)).toBe(false)
  })
})

describe('hrefDeMarca', () => {
  it('con ficha lleva a su pagina, con barra final', () => {
    expect(hrefDeMarca('aime-leon-dore', FICHAS_DE_PRUEBA)).toBe('/marca/aime-leon-dore/')
  })

  it('sin ficha lleva al filtro de la portada, como antes del archivo', () => {
    expect(hrefDeMarca('nike', FICHAS_DE_PRUEBA)).toBe('/?marca=nike')
  })
})

describe('archivoDeMarcas', () => {
  it('lista solo las marcas con ficha', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas.map((e) => e.slug)).toEqual(['aime-leon-dore', 'represent'])
  })

  it('devuelve el nombre con su tilde, no el slug', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas[0]?.nombre).toBe('Aimé Leon Dore')
  })

  it('ordena alfabeticamente en espanol, no por el orden de MARCAS', () => {
    const alReves = ['Represent', 'Aimé Leon Dore'] as const
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, alReves)
    expect(entradas.map((e) => e.nombre)).toEqual(['Aimé Leon Dore', 'Represent'])
  })

  it('trae la ficha entera, para que el indice pinte pais y ano', () => {
    const entradas = archivoDeMarcas(FICHAS_DE_PRUEBA, MARCAS_DE_PRUEBA)
    expect(entradas[1]?.ficha.pais).toBe('Reino Unido')
  })

  it('con el archivo vacio no devuelve nada', () => {
    expect(archivoDeMarcas({}, MARCAS_DE_PRUEBA)).toEqual([])
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm test -- src/lib/archivo-marcas.test.ts`
Expected: FAIL — no existe el módulo `./archivo-marcas`.

- [ ] **Step 3: Escribir `src/lib/archivo-marcas.ts`**

```ts
import { FICHAS, type FichaMarca } from '../data/fichas-marca'
import { MARCAS } from '../data/marcas'
import { slugMarca } from './filtros'

/** Una marca del archivo: su slug, su nombre tal como se escribe, y su ficha. */
export interface EntradaArchivo {
  slug: string
  nombre: string
  ficha: FichaMarca
}

/**
 * Las tres preguntas que el resto del sitio le hace al archivo.
 *
 * Viven aqui y no en cada pagina porque las hacen cuatro sitios distintos --
 * el menu, la ficha de producto, la pagina de marca y el indice -- y la
 * respuesta tiene que ser la misma en todos. El dia que una marca deje de
 * tener ficha, el menu deja de enlazar a su pagina en el mismo commit en que
 * la pagina deja de generarse.
 *
 * Las fichas y las marcas llegan por parametro, con la lista real por
 * defecto, para poder probarlas sin depender de lo que haya escrito hoy.
 */
export function tieneFicha(slug: string, fichas: Record<string, FichaMarca> = FICHAS): boolean {
  return Object.hasOwn(fichas, slug)
}

/**
 * A donde lleva el nombre de una marca.
 *
 * Con ficha, a su pagina. Sin ficha, al filtro de la portada, que es lo que
 * hacia todo el menu antes de que existiera el archivo: un enlace a una
 * pagina que no se genera seria un 404, y esconder la marca hasta que alguien
 * escriba su ficha contaria menos de lo que la tienda vende.
 */
export function hrefDeMarca(slug: string, fichas: Record<string, FichaMarca> = FICHAS): string {
  return tieneFicha(slug, fichas) ? `/marca/${slug}/` : `/?marca=${slug}`
}

/**
 * Las marcas que componen el archivo, en orden alfabetico.
 *
 * Se ordena aqui y no se confia en el orden de MARCAS ni en el de las claves
 * del objeto: anadir una ficha es escribir una entrada, y la entrada acaba
 * donde el editor la deje.
 */
export function archivoDeMarcas(
  fichas: Record<string, FichaMarca> = FICHAS,
  marcas: readonly string[] = MARCAS
): EntradaArchivo[] {
  return marcas
    .map((nombre) => ({ slug: slugMarca(nombre), nombre }))
    .filter((marca) => tieneFicha(marca.slug, fichas))
    .map((marca) => ({ ...marca, ficha: fichas[marca.slug]! }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
```

- [ ] **Step 4: Ejecutar las pruebas**

Run: `npm test -- src/lib/archivo-marcas.test.ts`
Expected: PASS, 8 pruebas.

- [ ] **Step 5: Commit**

```bash
git add src/lib/archivo-marcas.ts src/lib/archivo-marcas.test.ts
git commit -F - <<'MSG'
feat: las preguntas que el sitio le hace al archivo de marcas

tieneFicha, hrefDeMarca y archivoDeMarcas. Cuatro sitios necesitan saber
si una marca tiene pagina y a donde enlazarla; resolverlo en cada uno
seria cuatro respuestas que un dia dejan de coincidir.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 3: Los datos estructurados del archivo

**Files:**
- Modify: `src/lib/datos-estructurados.ts` (añadir al final, antes de `fichaTienda` si prefieres agrupar los de listado)
- Modify: `src/lib/datos-estructurados.test.ts`

**Interfaces:**
- Consumes: nada nuevo.
- Produces:
  - `fichaMarca({ nombre, propuesta, url, pais, anio, fundador, imagen, urls }): object`
  - `fichaArchivo({ url, urls }): object`

- [ ] **Step 1: Escribir las pruebas**

Añade a `src/lib/datos-estructurados.test.ts`:

```ts
import { fichaArchivo, fichaMarca } from './datos-estructurados'

describe('fichaMarca', () => {
  const base = {
    nombre: 'Aimé Leon Dore',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    url: 'https://therackstore.shop/marca/aime-leon-dore/',
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    imagen: 'https://therackstore.shop/_astro/ald.jpg',
  }

  it('declara la marca como Brand dentro de la pagina', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha['@type']).toBe('CollectionPage')
    expect(ficha.about['@type']).toBe('Brand')
    expect(ficha.about.name).toBe('Aimé Leon Dore')
  })

  it('el ano de fundacion viaja como cadena, que es lo que pide schema.org', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.about.foundingDate).toBe('2014')
  })

  it('el fundador es una Person y el pais un Place', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.about.founder).toEqual({ '@type': 'Person', name: 'Teddy Santis' })
    expect(ficha.about.foundingLocation).toEqual({ '@type': 'Place', name: 'Estados Unidos' })
  })

  it('lista las piezas en el orden en que se ven', () => {
    const urls = ['https://therackstore.shop/a/', 'https://therackstore.shop/b/']
    const ficha = fichaMarca({ ...base, urls }) as any
    expect(ficha.mainEntity.numberOfItems).toBe(2)
    expect(ficha.mainEntity.itemListElement.map((i: any) => i.url)).toEqual(urls)
    expect(ficha.mainEntity.itemListElement[0].position).toBe(1)
  })

  it('sin piezas no emite ItemList: una lista vacia declara un listado que no hay', () => {
    const ficha = fichaMarca({ ...base, urls: [] }) as any
    expect(ficha.mainEntity).toBeUndefined()
  })
})

describe('fichaArchivo', () => {
  it('lista las paginas de marca', () => {
    const urls = ['https://therackstore.shop/marca/represent/']
    const ficha = fichaArchivo({ url: 'https://therackstore.shop/marca/', urls }) as any
    expect(ficha['@type']).toBe('CollectionPage')
    expect(ficha.mainEntity.numberOfItems).toBe(1)
    expect(ficha.mainEntity.itemListElement[0].url).toBe(urls[0])
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm test -- src/lib/datos-estructurados.test.ts`
Expected: FAIL — `fichaMarca` y `fichaArchivo` no están exportadas.

- [ ] **Step 3: Escribir los dos constructores**

Añade a `src/lib/datos-estructurados.ts`:

```ts
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
  anio: number
  fundador: string
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
      founder: { '@type': 'Person', name: fundador },
      foundingLocation: { '@type': 'Place', name: pais },
      image: imagen,
    },
    ...(urls.length > 0 ? { mainEntity: listaDeUrls(urls) } : {}),
  }
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
```

Sustituye también el cuerpo de `mainEntity` en `fichaCategoria` por `listaDeUrls(urls)`, que produce exactamente el mismo objeto:

```ts
    mainEntity: listaDeUrls(urls),
```

- [ ] **Step 4: Ejecutar las pruebas**

Run: `npm test -- src/lib/datos-estructurados.test.ts`
Expected: PASS. Las pruebas que ya existían de `fichaCategoria` siguen pasando: `listaDeUrls` devuelve el mismo objeto que había escrito en línea.

- [ ] **Step 5: Commit**

```bash
git add src/lib/datos-estructurados.ts src/lib/datos-estructurados.test.ts
git commit -F - <<'MSG'
feat: datos estructurados de la pagina de marca y del archivo

CollectionPage con la marca en `about` como Brand, y la lista de piezas
solo si hay piezas: un ItemList vacio declara un listado que no existe.

El .map de la lista de URLs, que ya repetian dos funciones, sale a
listaDeUrls.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 4: La página de la marca

**Files:**
- Create: `src/pages/marca/[slug].astro`

**Interfaces:**
- Consumes: `archivoDeMarcas` de `src/lib/archivo-marcas.ts`; `resolverImagenMarca` de `src/lib/imagenes-marcas.ts`; `fichaMarca`, `fichaMigas`, `serializar`, `Miga` de `src/lib/datos-estructurados.ts`; `tarjetasEnOrden` de `src/lib/catalogo.ts`; `slugMarca` de `src/lib/filtros.ts`; `productos` de `src/data/productos.ts`; `RejillaProductos`, `Migas`, `Layout`.
- Produces: la ruta `/marca/<slug>/`.

- [ ] **Step 1: Escribir la página**

Crea `src/pages/marca/[slug].astro`:

```astro
---
/**
 * LA PAGINA DE UNA MARCA.
 *
 * La tienda no solo vende: presenta. En Colombia cuesta que alguien compre
 * una prenda de una marca que nunca ha visto, y esta pagina es donde se
 * responde a la pregunta que el cliente no llega a hacer en voz alta: quien
 * es esta gente y por que deberia importarme.
 *
 * Solo existe para las marcas con ficha. Sin ficha no hay ruta, y quien
 * enlaza marcas -- el menu, la ficha de producto -- lo sabe por
 * `hrefDeMarca`, asi que el sitio no puede apuntar a una pagina que no se
 * genera.
 */
import { Image } from 'astro:assets'
import Layout from '../../layouts/Layout.astro'
import Migas from '../../components/Migas.astro'
import RejillaProductos from '../../components/RejillaProductos.astro'
import { productos } from '../../data/productos'
import { archivoDeMarcas, type EntradaArchivo } from '../../lib/archivo-marcas'
import { tarjetasEnOrden } from '../../lib/catalogo'
import { slugMarca } from '../../lib/filtros'
import { resolverImagenMarca } from '../../lib/imagenes-marcas'
import {
  fichaMarca,
  fichaMigas,
  serializar,
  type Miga,
} from '../../lib/datos-estructurados'

export function getStaticPaths() {
  return archivoDeMarcas().map((entrada) => ({
    params: { slug: entrada.slug },
    props: { entrada },
  }))
}

const { entrada } = Astro.props as { entrada: EntradaArchivo }
const { nombre, slug, ficha } = entrada

// Las piezas de esta marca, en el mismo orden con el que abre el catalogo.
const suyas = productos.filter((p) => p.marca && slugMarca(p.marca) === slug)
const enOrden = tarjetasEnOrden(suyas)

if (!Astro.site) {
  throw new Error('Astro.site no esta definido: revisa el campo `site` en astro.config.mjs')
}

const imagen = resolverImagenMarca(ficha.imagen)

const migas: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Archivo de marcas', ruta: '/marca/' },
  { nombre },
]
const migasJson = serializar(fichaMigas(migas, Astro.site))

const marcaJson = serializar(
  fichaMarca({
    nombre,
    propuesta: ficha.propuesta,
    url: new URL(`/marca/${slug}/`, Astro.site).href,
    pais: ficha.pais,
    anio: ficha.anio,
    fundador: ficha.fundador,
    imagen: new URL(imagen.src, Astro.site).href,
    urls: enOrden.map(
      ({ producto, variante }) =>
        new URL(`/producto/${producto.slug}/${variante.slug}/`, Astro.site).href
    ),
  })
)
---

<Layout titulo={`${nombre} en Colombia`} descripcion={ficha.propuesta}>
  <script type="application/ld+json" is:inline set:html={migasJson}></script>
  <script type="application/ld+json" is:inline set:html={marcaJson}></script>

  <div class="contenedor marca-pagina">
    <Migas migas={migas} />

    <header class="marca__cabecera">
      <h1 class="marca__nombre">{nombre}</h1>
      {/* Pais, ano y fundador en una linea: es la credencial de la marca, no
          el argumento. El argumento viene debajo. */}
      <p class="marca__datos">
        <span>{ficha.pais}</span>
        <span aria-hidden="true">·</span>
        <span>{ficha.anio}</span>
        <span aria-hidden="true">·</span>
        <span>{ficha.fundador}</span>
      </p>
      <p class="marca__propuesta">{ficha.propuesta}</p>
    </header>

    {/* La foto de campana va debajo de la propuesta y no encima del nombre:
        quien llega aqui viene de un enlace que decia el nombre de la marca, y
        lo primero que necesita leer es de que va, no una imagen sin pie. */}
    <Image
      class="marca__foto"
      src={imagen}
      alt={ficha.alt}
      widths={[640, 960, 1280]}
      sizes="(min-width: 60rem) 60rem, 100vw"
      loading="eager"
    />

    <div class="marca__texto">
      {ficha.porQue.map((parrafo) => <p>{parrafo}</p>)}
    </div>

    {enOrden.length > 0 ? (
      <section class="marca__piezas">
        <h2>Piezas disponibles</h2>
        {/* Sin barra de filtros: ya se esta dentro de un filtro, y con tres
            piezas un desplegable de prenda solo puede estorbar. */}
        <RejillaProductos productos={suyas} />
      </section>
    ) : (
      /* La marca queda presentada aunque no haya nada que vender. Es
         exactamente para lo que existe el archivo: se presenta antes de
         tener, no despues. */
      <p class="marca__sin-piezas">
        Ahora mismo no hay piezas de {nombre} en la tienda.
        <a href="/">Mira el resto del catálogo</a>.
      </p>
    )}
  </div>
</Layout>

<style>
  .marca-pagina { padding-block: var(--espacio-2) var(--espacio-4); }

  .marca__cabecera { margin-block: var(--espacio-3); }

  .marca__nombre { margin: 0; }

  /* La misma typewriter chica que las migas y la barra de filtros: es un dato
     de referencia, no una voz mas de la pagina. */
  .marca__datos {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5ch;
    margin-block: var(--espacio-1) var(--espacio-2);
    color: var(--texto-tenue);
    font-family: var(--fuente-marca);
    font-size: 0.8125rem;
  }

  .marca__propuesta {
    max-width: 34ch;
    margin: 0;
    font-family: var(--fuente-titulo);
    font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.25rem);
    line-height: 1.15;
  }

  .marca__foto {
    width: 100%;
    height: auto;
    aspect-ratio: 3 / 2;
    object-fit: cover;
  }

  /* Medida de lectura: los parrafos son el sitio donde se convence, y a todo
     el ancho de la pagina no se leen. */
  .marca__texto {
    max-width: 62ch;
    margin-block: var(--espacio-3);
  }

  .marca__texto p + p { margin-block-start: var(--espacio-2); }

  .marca__piezas { margin-block-start: var(--espacio-4); }

  .marca__piezas h2 {
    margin-block-end: var(--espacio-2);
    padding-block-end: var(--espacio-2);
    border-block-end: 1px solid var(--linea);
  }

  .marca__sin-piezas {
    margin-block-start: var(--espacio-4);
    color: var(--texto-tenue);
  }

  .marca__sin-piezas a { color: inherit; }
</style>
```

- [ ] **Step 2: Comprobar los tokens de estilo que se han usado**

Run: `grep -nE -- '--texto-tenue|--fuente-marca|--fuente-titulo|--linea|--espacio-4' src/styles/global.css`
Expected: las cinco variables aparecen definidas. Si alguna no existe con ese nombre, sustitúyela por la que el proyecto sí define para ese papel; no inventes una nueva ni la declares aquí.

- [ ] **Step 3: Escribir una ficha real para poder ver la página**

El archivo está vacío, así que no hay ruta que mirar. Necesitas una foto de campaña y su ficha. Pide al dueño de la tienda la imagen de una marca —la que quiera estrenar— y déjala en `src/assets/marcas/` en ratio 3:2.

Con la imagen en su sitio, rellena `archivo` en `src/data/fichas-marca.ts`. Ejemplo con datos reales de Aimé Leon Dore, para que se vea la forma exacta:

```ts
const archivo: Record<string, unknown> = {
  'aime-leon-dore': {
    pais: 'Estados Unidos',
    anio: 2014,
    fundador: 'Teddy Santis',
    propuesta: 'El Nueva York de los noventa hecho ropa de todos los días.',
    porQue: [
      'Teddy Santis creció en Queens y montó la marca sin venir de la moda: abrió una tienda en el Lower East Side y se puso a vestir a la gente que ya conocía. Esa es toda la historia, y se nota en la ropa.',
      'La trajimos porque resuelve algo que en Colombia falta: prendas que se ven caras sin gritar el logo. Un polo de punto, una sudadera de peso, una gorra con la M de Mets bordada pequeña. Se ponen un lunes.',
    ],
    imagen: 'aime-leon-dore-campana.jpg',
    alt: 'Campaña de Aimé Leon Dore: dos personas en una cancha de baloncesto de Nueva York',
  },
}
```

Si el dueño todavía no ha decidido con qué marca estrenar, no inventes la ficha: deja el archivo vacío, salta al paso 5 y vuelve a este cuando la tengas. El build sigue siendo verde con el archivo vacío.

- [ ] **Step 4: Ver la página en el navegador**

Run: `npm run dev`
Abre `http://localhost:4321/marca/aime-leon-dore/`.
Expected: migas, nombre, la línea de datos, la propuesta grande, la foto en 3:2, los párrafos, y la rejilla bajo «Piezas disponibles» si esa marca tiene prendas en el catálogo. Si no las tiene, la línea que lo dice.

- [ ] **Step 5: Construir**

Run: `npm run build`
Expected: build correcto. En la salida aparece una ruta `/marca/<slug>/` por cada ficha escrita, y ninguna si el archivo está vacío.

- [ ] **Step 6: Commit**

```bash
git add src/pages/marca/ src/data/fichas-marca.ts src/assets/marcas/
git commit -F - <<'MSG'
feat: la pagina de cada marca

Presentacion arriba -- pais, ano, fundador, la propuesta y por que la
trajimos -- y las piezas disponibles debajo, con las mismas tarjetas del
catalogo y sin barra de filtros: ya se esta dentro de un filtro.

La marca con ficha y sin stock no pinta la rejilla vacia: dice que no hay
piezas y sigue presentada. Presentar antes de tener es justo para lo que
existe el archivo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 5: El índice del archivo

**Files:**
- Create: `src/pages/marca/index.astro`

**Interfaces:**
- Consumes: `archivoDeMarcas`; `fichaArchivo`, `fichaMigas`, `serializar`, `Miga`; `Layout`, `Migas`.
- Produces: la ruta `/marca/`.

- [ ] **Step 1: Escribir la página**

Crea `src/pages/marca/index.astro`:

```astro
---
/**
 * EL ARCHIVO: la lista de las marcas que la tienda presenta.
 *
 * Le da al menu de la cabecera un destino propio -- hasta ahora "Marcas" solo
 * abria un panel -- y le da a un buscador una pagina que enumera la curaduria
 * de la tienda en vez de tener que deducirla de las fichas de producto.
 *
 * Lista solo las marcas CON ficha. Las otras no tienen pagina a la que
 * enlazar, y una entrada muerta en un indice es peor que una entrada menos.
 */
import Layout from '../../layouts/Layout.astro'
import Migas from '../../components/Migas.astro'
import { archivoDeMarcas } from '../../lib/archivo-marcas'
import {
  fichaArchivo,
  fichaMigas,
  serializar,
  type Miga,
} from '../../lib/datos-estructurados'

const entradas = archivoDeMarcas()

if (!Astro.site) {
  throw new Error('Astro.site no esta definido: revisa el campo `site` en astro.config.mjs')
}

const migas: Miga[] = [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Archivo de marcas' }]
const migasJson = serializar(fichaMigas(migas, Astro.site))

const archivoJson = serializar(
  fichaArchivo({
    url: new URL('/marca/', Astro.site).href,
    urls: entradas.map((e) => new URL(`/marca/${e.slug}/`, Astro.site).href),
  })
)

const descripcion =
  'Las marcas que The Rack store trae a Colombia: de dónde vienen, quién las fundó y por qué las escogimos.'
---

<Layout titulo="Archivo de marcas" descripcion={descripcion}>
  <script type="application/ld+json" is:inline set:html={migasJson}></script>
  <script type="application/ld+json" is:inline set:html={archivoJson}></script>

  <div class="contenedor archivo">
    <Migas migas={migas} />

    <header class="archivo__cabecera">
      <h1>Archivo de marcas</h1>
      <p class="archivo__entrada">{descripcion}</p>
    </header>

    {entradas.length === 0 ? (
      <p class="archivo__vacio">Todavía no hay marcas en el archivo.</p>
    ) : (
      <ul class="archivo__lista">
        {entradas.map((entrada) => (
          <li>
            <a href={`/marca/${entrada.slug}/`}>
              <h2>{entrada.nombre}</h2>
              <p class="archivo__datos">
                {entrada.ficha.pais} · {entrada.ficha.anio}
              </p>
              <p class="archivo__propuesta">{entrada.ficha.propuesta}</p>
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
</Layout>

<style>
  .archivo { padding-block: var(--espacio-2) var(--espacio-4); }

  .archivo__cabecera { margin-block: var(--espacio-3); }

  .archivo__entrada {
    max-width: 52ch;
    color: var(--texto-tenue);
  }

  .archivo__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    border-block-start: 1px solid var(--linea);
  }

  .archivo__lista li { border-block-end: 1px solid var(--linea); }

  /* El enlace ocupa la fila entera: la marca, el dato y la propuesta son un
     solo destino, y tres enlaces al mismo sitio se tabulan tres veces. */
  .archivo__lista a {
    display: block;
    padding-block: var(--espacio-3);
    color: inherit;
    text-decoration: none;
  }

  .archivo__lista a:hover h2 { text-decoration: underline; }

  .archivo__lista h2 { margin: 0; }

  .archivo__datos {
    margin-block: 0.25rem;
    color: var(--texto-tenue);
    font-family: var(--fuente-marca);
    font-size: 0.8125rem;
  }

  .archivo__propuesta {
    max-width: 52ch;
    margin: 0;
  }

  .archivo__vacio { color: var(--texto-tenue); }
</style>
```

- [ ] **Step 2: Ver el índice**

Run: `npm run dev`
Abre `http://localhost:4321/marca/`.
Expected: el titular, la entradilla y una fila por marca con ficha. Con el archivo vacío, la línea que lo dice.

- [ ] **Step 3: Construir**

Run: `npm run build`
Expected: build correcto, con `/marca/` entre las rutas.

- [ ] **Step 4: Commit**

```bash
git add src/pages/marca/index.astro
git commit -F - <<'MSG'
feat: indice del archivo de marcas

Da al menu de la cabecera un destino propio y a un buscador una pagina
que enumera la curaduria de la tienda. Lista solo las marcas con ficha:
una entrada que no lleva a ningun sitio es peor que una entrada menos.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 6: El filtro de marca baja a la columna

Hasta ahora la marca se elegía en el menú de la cabecera. El menú deja de filtrar en la tarea siguiente, así que el filtro tiene que existir **antes**: si se hace al revés, entre un commit y otro no hay forma de filtrar por marca.

**Files:**
- Modify: `src/components/FiltrosProductos.astro` (props, marcado, script)
- Modify: `src/components/RejillaProductos.astro:36-46`
- Modify: `src/lib/filtros.test.ts`

**Interfaces:**
- Consumes: `Desplegable`, `marcasDe`, `marcasTodas`, `pasa`, `Filtros`.
- Produces: `FiltrosProductos` pasa a recibir `marcas: Opcion[]` (las que ofrece) y `marcasValidas: Opcion[]` (las que admite en la URL).

- [ ] **Step 1: Probar que el filtro de marca se acumula con los otros dos**

`pasa` ya sabe filtrar por marca; lo que no hay es una prueba de que las tres dimensiones se acumulan. Añade a `src/lib/filtros.test.ts`:

```ts
  it('marca, genero y tipo se acumulan: no es la suma de los tres', () => {
    const hoodieLacosteHombre = { genero: 'hombre' as const, tipo: 'hoodie' as const, marca: 'lacoste' }
    const hoodieNikeHombre = { genero: 'hombre' as const, tipo: 'hoodie' as const, marca: 'nike' }
    const camisetaLacosteHombre = {
      genero: 'hombre' as const,
      tipo: 'camiseta' as const,
      marca: 'lacoste',
    }
    const filtros = { genero: 'hombre' as const, tipo: 'hoodie' as const, marca: 'lacoste' }

    expect(pasa(hoodieLacosteHombre, filtros)).toBe(true)
    expect(pasa(hoodieNikeHombre, filtros)).toBe(false)
    expect(pasa(camisetaLacosteHombre, filtros)).toBe(false)
  })

  it('la prenda sin marca no pasa un filtro de marca', () => {
    const sinMarca = { genero: null, tipo: 'camiseta' as const, marca: null }
    expect(pasa(sinMarca, { genero: null, tipo: null, marca: 'lacoste' })).toBe(false)
  })
```

Run: `npm test -- src/lib/filtros.test.ts`
Expected: PASS. Son pruebas de red: `pasa` ya se comporta así, y a partir de ahora hay quien avise si deja de hacerlo.

- [ ] **Step 2: Cambiar las props de `FiltrosProductos.astro`**

Sustituye el bloque `interface Props` y su desestructurado (líneas ~27-37) por:

```ts
interface Props {
  /** Los del catalogo ENTERO, con su href: el desplegable navega. */
  generos: Opcion[]
  tipos: Opcion[]
  /** Las que se OFRECEN: solo las que tienen prenda en esta pagina. */
  marcas: Opcion[]
  /**
   * Las que se ADMITEN en la URL: todas las de la tienda.
   *
   * Son dos listas porque son dos trabajos. Si la validacion se estrechara a
   * las que tienen stock, un enlace a /?marca=<marca sin prendas> se
   * descartaria por invalido y se veria el catalogo entero, que es lo
   * contrario de lo que pidio quien hizo clic.
   */
  marcasValidas: Opcion[]
  /** Genero de la pagina actual, o null en la portada. */
  generoActivo?: string | null
}

const { generos, tipos, marcas, marcasValidas, generoActivo = null } = Astro.props
```

- [ ] **Step 3: Publicar las marcas admitidas en el marcado y añadir el desplegable**

En el `<div class="filtros">` (línea ~40), añade el atributo con la lista completa. Es de donde el script las leerá, ahora que los distintivos desaparecen:

```astro
<div
  class="filtros"
  data-filtros
  data-estado="cerrado"
  data-marcas-validas={marcasValidas.map((m) => m.valor).join(' ')}
>
```

En `filtros__desplegables`, detrás del de Prenda:

```astro
          {marcas.length > 1 && (
            <Desplegable clave="marca" etiqueta="Marca" opciones={marcas} todos="Todas" />
          )}
```

Y la condición que decide si se pinta la columna, en las dos apariciones (línea ~55 y línea ~137), pasa a:

```astro
  {(generos.length > 1 || tipos.length > 1 || marcas.length > 1) && (
```

- [ ] **Step 4: Quitar el distintivo**

Borra el bloque entero `{marcas.length > 0 && (<p class="filtros__activos" ...>...</p>)}` (líneas ~159-180) y el comentario que lo precede. Borra también su CSS: el bloque que arranca en `/* --- Distintivo de marca --- */` (línea ~530) hasta donde terminen las reglas `.distintivo*`.

Existía porque la marca no tenía desplegable. Ahora el desplegable dice cuál está puesta y su primera opción, «Todas», es cómo se quita: dos formas de apagar lo mismo son una de más.

- [ ] **Step 5: Ajustar el script**

Cinco cambios en el `<script>`:

1. Borra las dos constantes de los distintivos (línea ~667):

```ts
    const distintivos = [...raiz.querySelectorAll<HTMLButtonElement>('[data-quitar-marca]')]
    const zonaDistintivos = raiz.querySelector<HTMLElement>('[data-filtros-activos]')
```

2. Sustituye el origen de `marcasValidas` (línea ~716):

```ts
      // Lo que el desplegable OFRECE y lo que la URL ADMITE no es lo mismo: el
      // desplegable lista las marcas con prenda en esta pagina, y la URL
      // acepta cualquiera de la tienda, para que un enlace a una marca sin
      // stock llegue y ensene la rejilla vacia en vez de que se le ignore el
      // parametro y se vea el catalogo entero.
      const marcasValidas = new Set(
        (raiz.dataset.marcasValidas ?? '').split(' ').filter(Boolean)
      )
```

3. En `sincronizar`, borra el bloque final de los distintivos (línea ~927):

```ts
        for (const distintivo of distintivos) {
          distintivo.hidden = distintivo.dataset.quitarMarca !== estado.marca
        }
        if (zonaDistintivos) zonaDistintivos.hidden = estado.marca === null
```

4. Borra el listener de los distintivos (línea ~925):

```ts
      for (const distintivo of distintivos) {
        distintivo.addEventListener('click', () => {
          estado.marca = null
          aplicar(false)
        })
      }
```

5. Ensancha las dos aserciones de `clave`, que hoy dicen que el único desplegable con estado es el de prenda. Hay dos, una en `sincronizar` (línea ~783) y otra en el bucle de listeners (línea ~862). En ambas:

```ts
          const clave = desplegable.dataset.desplegable as 'tipo' | 'marca'
```

Y en `sincronizar`, el comentario de encima —«Solo el de prenda tiene opciones con [data-valor]»— pasa a decir «El de genero navega: sus opciones son enlaces y este bucle no encuentra ninguna». `estado` ya tiene `tipo` y `marca`, así que `estado[clave]` sigue comprobando.

- [ ] **Step 6: Pasar las dos listas desde `RejillaProductos.astro`**

Sustituye el comentario y la llamada (líneas ~36-46) por:

```astro
      {/* Dos listas de marcas, dos trabajos. `marcas` es lo que el desplegable
          ofrece: las que tienen prenda en esta pagina, porque una entrada que
          deja la rejilla vacia solo puede decepcionar. `marcasValidas` es lo
          que la URL admite: todas las de la tienda, para que un enlace a una
          marca sin stock llegue y lo diga. */}
      {ordenable && (
        <FiltrosProductos
          generos={generosDe(CATALOGO)}
          tipos={tiposDe(productos)}
          marcas={marcasDe(productos)}
          marcasValidas={marcasTodas()}
          generoActivo={generoActivo}
        />
      )}
```

Y añade `marcasDe` al import que ya trae `generosDe`, `tarjetasEnOrden` y `tiposDe` de `../lib/catalogo`.

- [ ] **Step 7: Probar a mano las cinco cosas que pueden romperse**

Run: `npm run dev`

En `http://localhost:4321/`:
1. El desplegable «Marca» aparece junto a Género y Prenda, y solo lista marcas que tienen prendas a la vista.
2. Elegir una esconde el resto; el botón del desplegable muestra la elegida.
3. «Todas» la quita, y la URL pierde el `?marca=`.
4. Marca + Prenda a la vez dejan solo lo que cumple las dos.
5. Entrar directo a `http://localhost:4321/?marca=represent` (una marca sin stock, de las de `marcas.ts`): la rejilla sale vacía con su mensaje, **no** con el catálogo entero. Esta es la que se rompe si `data-marcas-validas` no llegó al HTML.

- [ ] **Step 8: Construir**

Run: `npm test` — Expected: PASS.
Run: `npm run build` — Expected: build correcto.

- [ ] **Step 9: Commit**

```bash
git add src/components/FiltrosProductos.astro src/components/RejillaProductos.astro src/lib/filtros.test.ts
git commit -F - <<'MSG'
feat: la marca se filtra desde la columna, como genero y prenda

Tercer desplegable junto a Genero y Prenda. Ofrece solo las marcas con
prenda en la pagina; la URL sigue admitiendo las veinticinco, para que un
enlace a una marca sin stock llegue y lo diga en vez de que se le ignore
el parametro.

Fuera el distintivo: existia porque la marca no tenia desplegable, y
ahora el desplegable dice cual esta puesta y como quitarla.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 7: El menú pasa a ser el archivo

**Files:**
- Modify: `src/components/MenuPantallaCompleta.astro:1-70`

**Interfaces:**
- Consumes: `hrefDeMarca` de `src/lib/archivo-marcas.ts`; `marcasTodas` de `src/data/marcas.ts`.
- Produces: nada que otros consuman.

- [ ] **Step 1: Reescribir el comentario y los enlaces**

En el bloque de cabecera del componente, el comentario dice hoy que no hay página por marca y explica por qué. Ha dejado de ser cierto. Sustituye ese comentario (el que empieza «El menu lista las MARCAS del catalogo…») y el array `enlaces` por:

```ts
import { marcasTodas } from '../data/marcas'
import { hrefDeMarca } from '../lib/archivo-marcas'

/**
 * El menu lista las MARCAS de la tienda, no las categorias: genero, prenda y
 * ahora tambien marca se eligen en la barra de filtros de la rejilla, y
 * repetirlos aqui daria dos caminos para lo mismo.
 *
 * Aqui la marca no filtra: PRESENTA. Cada nombre lleva a la pagina donde se
 * cuenta de donde viene esa marca y por que esta en la tienda, que es lo que
 * el cliente que no la conoce necesita antes que ver diez prendas suyas.
 *
 * La marca sin ficha todavia no tiene esa pagina, asi que sigue llevando al
 * filtro de la portada. Lo decide `hrefDeMarca`, en un solo sitio: el dia que
 * se escriba su ficha, el menu cambia de destino sin tocar este archivo.
 *
 * La lista es la de marcas.ts, no la del catalogo: el menu anuncia lo que la
 * tienda vende, y una marca sin stock hoy lleva a una rejilla vacia que lo
 * dice. Esconderla hasta que entre la primera prenda seria contar menos de lo
 * que hay.
 */
const enlaces = [
  ...marcasTodas().map((marca) => ({
    href: hrefDeMarca(marca.valor),
    texto: marca.etiqueta,
    aparte: false,
  })),
  // Ni el archivo ni la tienda son marcas: se separan para que no se lean
  // como dos mas de la lista.
  { href: '/marca/', texto: 'Archivo de marcas', aparte: true },
  { href: '/tienda/', texto: 'Tienda', aparte: true },
]
```

- [ ] **Step 2: Renombrar el botón y el rótulo del panel**

En el `<button class="boton-menu">`:

```astro
  <span class="boton-menu__textos">
    <span>Archivo de marcas</span>
    <span>Cerrar</span>
  </span>
```

Y el `<nav>`:

```astro
  <nav class="menu__panel" aria-label="Archivo de marcas">
```

- [ ] **Step 3: Comprobar que el botón más largo no rompe la cabecera**

`.boton-menu__textos` tiene `height: 1.5em` y `overflow: hidden`, y las dos palabras se apilan. «Archivo de marcas» es bastante más ancho que «Marcas» y bastante más que «Cerrar».

Run: `npm run dev` y mira la cabecera en móvil (360 px de ancho) y en escritorio.
Expected: el botón cabe en una sola línea y el logo no se desplaza. Si en 360 px se parte en dos líneas, el `overflow: hidden` cortaría la segunda: añade `white-space: nowrap` a `.boton-menu__textos span`. Si aun así no cabe, reduce el `font-size` del botón en la consulta de medios que ya exista para móvil — no acortes el texto, que es el nombre que el dueño pidió.

- [ ] **Step 4: Comprobar los dos destinos**

Abre el menú:
1. Una marca **con** ficha lleva a `/marca/<slug>/`.
2. Una marca **sin** ficha lleva a `/?marca=<slug>` y filtra la portada como siempre.
3. «Archivo de marcas», abajo, lleva a `/marca/`.

- [ ] **Step 5: Construir**

Run: `npm run build`
Expected: build correcto.

- [ ] **Step 6: Commit**

```bash
git add src/components/MenuPantallaCompleta.astro
git commit -F - <<'MSG'
feat: el menu de la cabecera es el archivo de marcas

Cada nombre lleva a la pagina donde se presenta la marca, no a un filtro:
quien no la conoce necesita saber quien es antes de ver diez prendas
suyas. La marca sin ficha sigue llevando al filtro de la portada.

El filtro que el menu deja de hacer vive desde el commit anterior en la
columna de la izquierda.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 8: La marca de la ficha de producto enlaza a su página

**Files:**
- Modify: `src/pages/producto/[slug]/[color].astro:216` y el bloque de imports

**Interfaces:**
- Consumes: `hrefDeMarca`, `tieneFicha` de `src/lib/archivo-marcas.ts`; `slugMarca` de `src/lib/filtros.ts`.
- Produces: nada.

- [ ] **Step 1: Calcular el destino en el frontmatter**

Añade a los imports:

```ts
import { hrefDeMarca, tieneFicha } from '../../../lib/archivo-marcas'
import { slugMarca } from '../../../lib/filtros'
```

Y, junto al resto de constantes del frontmatter:

```ts
/**
 * Quien esta mirando la prenda es justo quien mas necesita saber quien es la
 * marca. Si tiene pagina, el nombre lleva alli.
 *
 * Sin ficha se queda como texto plano y no como enlace al filtro: desde una
 * ficha de producto, ir a la portada filtrada por su propia marca es volver
 * casi al mismo sitio. Y un enlace a una pagina que no se genera seria un
 * 404.
 */
const marcaSlug = producto.marca ? slugMarca(producto.marca) : null
const hrefMarca = marcaSlug && tieneFicha(marcaSlug) ? hrefDeMarca(marcaSlug) : null
```

- [ ] **Step 2: Pintar el enlace**

Sustituye la línea 216:

```astro
        {producto.marca && <p class="marca">{producto.marca}</p>}
```

por:

```astro
        {producto.marca && (
          <p class="marca">
            {hrefMarca ? <a href={hrefMarca}>{producto.marca}</a> : producto.marca}
          </p>
        )}
```

- [ ] **Step 3: Que el enlace se vea como enlace, sin cambiar de tamaño**

Junto a la regla `.marca` (línea ~528), añade:

```css
  /* Subrayado fino y del color del texto: es un enlace, pero no compite con
     el nombre de la prenda que tiene encima. */
  .marca a {
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
```

- [ ] **Step 4: Comprobar los dos casos**

Run: `npm run dev`
1. Abre la ficha de una prenda cuya marca **tenga** ficha: el nombre está subrayado y lleva a `/marca/<slug>/`.
2. Abre la de una marca **sin** ficha: texto plano, sin subrayado, sin enlace.

- [ ] **Step 5: Construir**

Run: `npm run build`
Expected: build correcto.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/producto/[slug]/[color].astro"
git commit -F - <<'MSG'
feat: desde la prenda a la pagina de su marca

El nombre de la marca en la ficha lleva a su pagina cuando la tiene.
Quien esta mirando la prenda es quien mas necesita saber quien es la
marca.

Sin ficha se queda texto plano: un enlace a una pagina que no se genera
seria un 404, y llevar al filtro de la portada desde una ficha es volver
casi al mismo sitio.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 9: El sitemap fecha las páginas de marca

**Files:**
- Modify: `astro.config.mjs:29-47`

**Interfaces:**
- Consumes: `ultimoCambio`, que ya existe en el archivo.
- Produces: nada.

- [ ] **Step 1: Añadir la tercera fecha**

Junto a `CATALOGO` y `TIENDA`:

```js
// Las paginas de marca se pintan desde las fichas, asi que su fecha es la
// fecha en que cambio lo que se lee en ellas. La foto de campana no cuenta:
// cambiarla no cambia lo que la pagina dice.
const ARCHIVO = ultimoCambio('src/data/fichas-marca.ts')
```

Y sustituye el cuerpo de `serialize` entero por este:

```js
      serialize(entrada) {
        const ruta = new URL(entrada.url).pathname
        const fecha = ruta === '/tienda/'
          ? TIENDA
          : ruta.startsWith('/marca/')
            ? ARCHIVO
            : CATALOGO
        return fecha ? { ...entrada, lastmod: fecha } : entrada
      },
```

El `endsWith('/tienda/')` de antes se sustituye por la comparación del pathname: con tres ramas, comparar sufijos de la URL completa se vuelve fácil de romper.

- [ ] **Step 2: Comprobar el sitemap**

Run: `npm run build`
Run: `cat dist/sitemap-0.xml`
Expected: las URLs de `/marca/` y `/marca/<slug>/` aparecen, y su `<lastmod>` es la fecha del último commit que tocó `src/data/fichas-marca.ts`, distinta de la de las páginas de catálogo. Si el archivo de marcas está vacío no hay rutas de marca todavía; comprueba entonces que las que ya existían no han cambiado de fecha.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -F - <<'MSG'
fix: el sitemap fecha las paginas de marca por sus fichas

Sin esto heredaban la fecha de productos.ts y decian haber cambiado cada
vez que entra una prenda. Un lastmod que miente vale menos que ninguno.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

### Task 10: Documentar cómo se añade una marca al archivo

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Añadir la sección**

Detrás de «Anadir una prenda», añade:

```markdown
## Anadir una marca al archivo

1. Deja la foto de campana en `src/assets/marcas/`, en ratio **3:2 horizontal**.
2. Anade una entrada a `archivo` en `src/data/fichas-marca.ts`, con el slug de
   la marca por clave. El slug sale del nombre: "Aimé Leon Dore" es
   `aime-leon-dore`.
3. `npm run build`.

La ficha es opcional. La marca que no la tiene no tiene pagina, y su nombre en
el menu sigue llevando al catalogo filtrado, como antes. En cuanto se escribe
la ficha, el menu, la ficha de producto y el indice de `/marca/` la enlazan
solos.

Si algo esta mal —falta un campo, la propuesta pasa de 160 caracteres, el slug
no coincide con ninguna marca de `marcas.ts`, la foto no existe— **el build
falla y dice cual es el problema**.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -F - <<'MSG'
docs: como anadir una marca al archivo

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012AKfxC6uUPfQWNQMssFunY
MSG
```

---

## Verificación final

- [ ] `npm test` — todas las pruebas pasan.
- [ ] `npm run build` — build correcto.
- [ ] `grep -rn "data-quitar-marca\|filtros__activos\|distintivo" src/` — no queda nada del distintivo.
- [ ] En `dist/`, ninguna página enlaza a `/marca/<slug>/` de una marca sin ficha:
      `grep -rho 'href="/marca/[^"]*"' dist/ | sort -u` y comprobar que cada slug listado tiene entrada en `src/data/fichas-marca.ts`.
- [ ] La portada con `?marca=` de una marca sin stock muestra la rejilla vacía, no el catálogo entero.
