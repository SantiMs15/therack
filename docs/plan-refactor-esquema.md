# Plan: separar genero, categoria y tipo

Estado: PROPUESTA. No se ha tocado nada todavia.

## El problema

Hoy `categoria` mezcla dos ejes distintos:

```ts
CATEGORIAS = ['mujer', 'hombre', 'calzado', 'accesorios']
                ^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^
                genero            clase de producto
```

El propio schema lo admite en un comentario, y con nueve prendas de ropa era
un compromiso razonable. Deja de serlo en cuanto entra calzado o un bolso:

```ts
generoDe('accesorios') -> null    // un bolso de mujer pierde su genero
generoDe('calzado')    -> null    // un tenis de mujer, igual
```

Un tenis de mujer y un bolso de hombre no se pueden representar. Y la
investigacion de keywords dice que el genero esta en la consulta SIEMPRE:

    tenis nike mujer · bandolera hombre · bolso mujer · buzo lacoste hombre

## El modelo propuesto

Tres campos independientes, cada uno con una sola pregunta que responder:

```ts
GENEROS    = ['mujer', 'hombre', 'unisex']        // para quien es
CATEGORIAS = ['ropa', 'calzado', 'accesorios']    // que clase de cosa es
TIPOS      = [...]                                 // que es exactamente
```

`genero` pasa a ser un CAMPO del producto, no algo derivado. Desaparece
`generoDe()`.

### Los tipos, con el vocabulario ya decidido

Sale de `keywords-decisiones.md`. Cada palabra esta comprobada contra el
español colombiano, no elegida a ojo.

| categoria | tipos |
|---|---|
| ropa | buzo, camiseta, camisa, chaqueta, hoodie, polo, jean, boxer |
| calzado | tenis, sandalia |
| accesorios | gorra, bolso-cruzado, bolso-hombro, bolso-tote, billetera, tarjetero, maleta |

Cambios respecto a hoy:

- `sweater` DESAPARECE -> pasa a `buzo` (3 fichas afectadas)
- Etiqueta "Sueteres" -> "Buzos"
- Se anaden 11 tipos nuevos

### Validacion cruzada

Un `tipo` solo vale dentro de su `categoria`. Zod puede comprobarlo, y asi el
build falla si alguien declara una camiseta dentro de calzado:

```ts
const TIPOS_POR_CATEGORIA = {
  ropa:       ['buzo', 'camiseta', 'camisa', 'chaqueta', 'hoodie', 'polo', 'jean', 'boxer'],
  calzado:    ['tenis', 'sandalia'],
  accesorios: ['gorra', 'bolso-cruzado', 'bolso-hombro', 'bolso-tote',
               'billetera', 'tarjetero', 'maleta'],
} as const
```

Es el mismo criterio que ya usa el catalogo: preferir que el build falle a
publicar una ficha que no aparece en ningun filtro.

## Las URLs NO cambian

Decision importante: `/catalogo/mujer/` y `/catalogo/hombre/` se quedan donde
estan, con las mismas direcciones. Lo unico que cambia es de donde sale la
lista -- de `genero` en vez de `categoria`.

Motivo: esas dos URLs ya estan en el sitemap y GSC las conoce. Cambiarlas
obligaria a redirecciones y a perder lo poco que se haya acumulado, a cambio
de nada. El refactor es del MODELO DE DATOS, no del direccionamiento.

`/catalogo/ropa/`, `/catalogo/tenis/` o `/marca/<slug>/` son decisiones
aparte, para cuando haya inventario que las justifique.

### Que hacer con `unisex`

Muchos tenis y sandalias lo son. Un producto `unisex` aparece en las DOS
paginas de genero:

```ts
productos.filter((p) => p.genero === genero || p.genero === 'unisex')
```

Asi un Samba unisex sale buscando "tenis adidas mujer" y "tenis adidas
hombre", que es como se busca de verdad.

## Migracion de las nueve fichas actuales

Mecanica y sin ambiguedad:

```
categoria: 'hombre'  ->  genero: 'hombre',  categoria: 'ropa'
categoria: 'mujer'   ->  genero: 'mujer',   categoria: 'ropa'
tipo: 'sweater'      ->  tipo: 'buzo'
```

## Archivos que se tocan

| Archivo | Que |
|---|---|
| `src/data/schema.ts` | Nucleo: GENEROS, CATEGORIAS, TIPOS, ETIQUETAS_*, ProductoSchema, fuera `generoDe()` |
| `src/data/productos.ts` | 9 fichas: anadir `genero`, cambiar `categoria`, 3 cambios de `tipo` |
| `src/data/schema.test.ts` | Nuevos enums, validacion cruzada, fuera los tests de `generoDe` |
| `src/lib/catalogo.ts` | `generosDe`, `tarjetasEnOrden`, `descripcionDeCategoria` leen `genero` |
| `src/lib/catalogo.test.ts` | Ajustar los productos de prueba |
| `src/lib/datos-estructurados.test.ts` | Ajustar los productos de prueba |
| `src/pages/catalogo/[categoria].astro` | getStaticPaths sobre GENEROS; filtrar con `unisex` |
| `src/pages/producto/[slug]/[color].astro` | Migas usan `genero`, no `categoria` |
| `src/lib/filtros.ts` | El tipo `Filtrable` ya lleva `genero`: sin cambios de forma |

Nueve archivos. La rejilla, los filtros, el sitemap y las migas NO cambian de
comportamiento: solo cambia de donde leen el genero.

## Fases

Cada fase deja el sitio funcionando y los tests en verde.

**1. Esquema y datos**
   - Reescribir los enums y ProductoSchema con la validacion cruzada
   - Migrar las 9 fichas
   - Actualizar `schema.test.ts`
   - Verde: `npm test`

**2. Consumidores**
   - `catalogo.ts` y sus tests
   - `datos-estructurados.test.ts`
   - Verde: `npm test`

**3. Rutas y vistas**
   - `[categoria].astro` genera desde GENEROS y admite `unisex`
   - Migas de la ficha
   - Verde: `npm run build` + comprobar que salen las 14 URLs de siempre

**4. Comprobacion**
   - El sitemap sigue teniendo las MISMAS 14 URLs
   - `/catalogo/hombre/` y `/catalogo/mujer/` con las mismas prendas que ahora
   - Schema de producto y migas, intactos

## Coste y riesgo

Un par de horas. El riesgo real es bajo: 133 tests cubren schema, catalogo,
datos estructurados y filtros, asi que un despiste sale en verde o en rojo, no
en produccion.

Con 200 fichas cargadas esto seria reetiquetar 200 productos a mano. Ese es el
unico motivo para hacerlo YA y no despues.

## Antes de empezar

Conviene commitear y desplegar lo que hay (24 archivos: barras finales, migas,
lastmod, www, HSTS, filtros, scrollbar). Asi el refactor arranca de una base
limpia y las mejoras de hoy llegan a Google mientras tanto.

## Fuera de alcance

Se decide aparte, cuando haya catalogo:

- Paginas por tipo (`/catalogo/tenis/`) o por marca (`/marca/<slug>/`)
- Ramificar la formula de titulo por categoria (calzado = modelo + marca)
- `mpn` con el codigo de articulo del fabricante para calzado
- Campo de peso para maletas (10 kg / 23 kg)
