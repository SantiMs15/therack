import { execFileSync } from 'node:child_process'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { productos } from './src/data/productos.ts'
import { enSale } from './src/data/schema.ts'
import { archivoDeMarcas, marcaIndexable } from './src/lib/archivo-marcas.ts'

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

// Todo el catalogo -- portada, categorias y fichas -- se pinta desde este
// archivo, asi que su fecha es la fecha en que cambio lo que se ve.
const CATALOGO = ultimoCambio('src/data/productos.ts')
// /tienda no muestra prendas: envios, pagos y cambios salen de la config.
const TIENDA = ultimoCambio('src/config.ts')
// Las paginas de marca se pintan desde las fichas, asi que su fecha es la
// fecha en que cambio lo que se lee en ellas. La foto de campana no cuenta:
// cambiarla no cambia lo que la pagina dice.
const ARCHIVO = ultimoCambio('src/data/fichas-marca.ts')

// /sale/ se publica siempre, pero sin rebajas lleva noindex: meterla en el
// sitemap seria pedirle a Google que indexe una pagina que le dice que no.
// La misma regla que `saleDe`, desde la misma funcion.
const HAY_SALE = productos.some(enSale)

// Lo mismo con las marcas sin ficha ni piezas: se publican con noindex para
// que el menu no lleve a un 404, y por eso no van al sitemap.
const MARCAS_SIN_INDEXAR = new Set(
  archivoDeMarcas()
    .filter((e) => !marcaIndexable(e.slug))
    .map((e) => `/marca/${e.slug}/`)
)

/**
 * En desarrollo, las fotos se sirven por /_image con la ruta del archivo en
 * la URL y un Cache-Control de un ano. Como las fotos se reemplazan con el
 * mismo nombre, el navegador seguia pintando la version vieja aunque el
 * servidor ya tuviera la nueva. Solo afecta a `astro dev`: el build pone un
 * hash del contenido en cada nombre, asi que alli la cache larga es correcta.
 */
const fotosSinCacheEnDev = {
  name: 'fotos-sin-cache-en-dev',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/_image')) {
        const setHeader = res.setHeader.bind(res)
        res.setHeader = (nombre, valor) =>
          nombre.toLowerCase() === 'cache-control'
            ? setHeader(nombre, 'no-store')
            : setHeader(nombre, valor)
      }
      next()
    })
  },
}

export default defineConfig({
  site: 'https://therackstore.shop',
  build: { format: 'directory' },
  vite: { plugins: [fotosSinCacheEnDev] },
  // El sitemap se genera solo a partir de las rutas del build y del `site` de
  // arriba. Hay que regenerarlo con cada despliegue, que es lo que ya pasa:
  // sale de `npm run build` como un archivo mas de dist/.
  integrations: [
    sitemap({
      filter: (url) => {
        const ruta = new URL(url).pathname
        if (ruta === '/sale/') return HAY_SALE
        return !MARCAS_SIN_INDEXAR.has(ruta)
      },
      serialize(entrada) {
        // Se compara el pathname y no el final de la URL entera: con tres
        // ramas, mirar sufijos es facil de romper.
        const ruta = new URL(entrada.url).pathname
        const fecha = ruta === '/tienda/'
          ? TIENDA
          : ruta.startsWith('/marca/')
            ? ARCHIVO
            : CATALOGO
        return fecha ? { ...entrada, lastmod: fecha } : entrada
      },
    }),
  ],
})
