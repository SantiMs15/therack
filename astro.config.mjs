import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

/**
 * Fecha del ultimo commit que toco un archivo.
 *
 * Se usa para el `lastmod` del sitemap, y sale de git y NO de la fecha de
 * build a proposito: con la de build las catorce URLs dirian que cambiaron en
 * cada despliegue, Google vendria a mirar, encontraria lo mismo, y acabaria
 * ignorando el dato en todo el sitio. Un lastmod que miente vale menos que no
 * tener ninguno.
 *
 * Si git no esta o no sabe la fecha devuelve undefined, y esa URL sale sin
 * lastmod: preferible a inventarse uno.
 */
function ultimoCambio(archivo) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', archivo], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return iso ? new Date(iso) : undefined
  } catch {
    return undefined
  }
}

/**
 * Las paginas que piden `noindex` (una marca sin ficha ni piezas, el sale sin
 * rebajas) no van al sitemap: un sitemap que pide rastrear lo que la propia
 * pagina pide no indexar es una contradiccion que Search Console marca como
 * error. La decision vive en cada pagina (prop `sinIndexar` del layout); aqui
 * solo se lee el HTML ya generado, asi que no hay una segunda lista que
 * mantener.
 */
let carpetaSalida
const recordarSalida = {
  name: 'recordar-carpeta-salida',
  hooks: {
    'astro:config:done': ({ config }) => {
      carpetaSalida = config.outDir
    },
  },
}
function pideNoIndexar(url) {
  if (!carpetaSalida) return false
  const ruta = new URL(`.${new URL(url).pathname}index.html`, carpetaSalida)
  try {
    return /<meta name="robots" content="[^"]*noindex/.test(readFileSync(fileURLToPath(ruta), 'utf8'))
  } catch {
    return false
  }
}

// Todo el catalogo -- portada, categorias y fichas -- se pinta desde este
// archivo, asi que su fecha es la fecha en que cambio lo que se ve.
const CATALOGO = ultimoCambio('src/data/productos.ts')
// /tienda no muestra prendas: envios, pagos y cambios salen de la config.
const TIENDA = ultimoCambio('src/config.ts')

export default defineConfig({
  site: 'https://therackstore.shop',
  build: { format: 'directory' },
  // El sitemap se genera solo a partir de las rutas del build y del `site` de
  // arriba. Hay que regenerarlo con cada despliegue, que es lo que ya pasa:
  // sale de `npm run build` como un archivo mas de dist/.
  integrations: [
    recordarSalida,
    sitemap({
      filter: (pagina) => !pideNoIndexar(pagina),
      serialize(entrada) {
        const fecha = entrada.url.endsWith('/tienda/') ? TIENDA : CATALOGO
        return fecha ? { ...entrada, lastmod: fecha } : entrada
      },
    }),
  ],
})
