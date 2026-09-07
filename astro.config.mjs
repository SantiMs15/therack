import { execFileSync } from 'node:child_process'
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
    sitemap({
      serialize(entrada) {
        const fecha = entrada.url.endsWith('/tienda/') ? TIENDA : CATALOGO
        return fecha ? { ...entrada, lastmod: fecha } : entrada
      },
    }),
  ],
})
