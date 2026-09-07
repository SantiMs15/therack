# Decisiones de vocabulario y nombrado

Lo que ya esta resuelto y por que. Sirve para no volver a discutirlo, y para
que quien cargue catalogo sepa como nombrar cada cosa.

Fuente: autocompletado de Google (gl=co, hl=es, ~60 consultas) + Google Trends.

---

## CERRADO

### Prendas y productos

| Concepto | Palabra | Por que |
|---|---|---|
| Gorra | **gorra** | Trends: gana a `cachucha` en Colombia |
| Prenda de punto | **buzo** | Ver "el test de la fuga" abajo. Confirmado por 3 metodos |
| Bolso | **bolso** | `bolsos dafiti` 10 sugerencias vs `carteras dafiti` 3. `bolsos mujer` trae "bogota" del #2 |
| Calzado deportivo | **tenis** | 4 confirmaciones independientes. `zapatillas` es Espana: trae El Corte Ingles, Madrid, rebajas |
| Equipaje | **maleta** | Es equipaje de viaje. `morral`/`mochila` son mochila de espalda: NO se venden |
| Jean | **jean** | `jean diesel original` confirmado |
| Boxer | **boxer** | `boxer calvin klein original` confirmado |

### Prohibido usar

| Termino | Por que |
|---|---|
| **ropa americana** | En Colombia significa ropa USADA, de segunda mano |
| **saco** | Ademas de fuga a Mexico/Espana, choca con "sacos de dormir" y "sacos navidenos" |
| **sueter / sweater** | Mexico y Argentina respectivamente. En Colombia se dice `buzo` |
| **cartera** | Arrastra marcas chilenas (Amphora, Josefa Saez, Secret) |
| **zapatillas** | Espanol de Espana |
| **sudadera** | Espanol de Espana. En Colombia es `buzo` |

### Marcas que NO pueden ir solas en un titulo

La marca desnuda trae otra cosa. Hay que anclarla siempre.

| Marca | Sola trae | Ancla obligatoria |
|---|---|---|
| Dime | dimenhidrinato, dimensiones, dimero d | El nombre del modelo. `hoodie dime` trae "hoodie dimensions" (medidas), asi que ni la marca sola ni prenda+marca bastan |
| Represent | representante legal, Congreso de Bogota | `Represent Owners Club` |
| On | Onitsuka Tiger | `On Running` / `On Cloud` |
| ALD | Aldo (¡otra marca de zapatos!) | `Aime Leon Dore` |

### Nombres correctos

La marca se guarda SIEMPRE con su nombre real. El problema de busqueda se
resuelve en el titulo, no reescribiendo el catalogo.

- **Dime** (a secas; MTL es solo como se la busca) -> slug `dime`
- **Eme Studios** (dos palabras) -> slug `eme-studios`
- **Aime Leon Dore** (con acento en la e) -> slug `aime-leon-dore`
- **On**: guardar como `On Running` si el slug `on` resulta incomodo

### Formula de titulo, por categoria

| Categoria | Formula | Ejemplo |
|---|---|---|
| Ropa | `Tipo + Marca + genero` | `Chaqueta Tommy Hilfiger hombre` |
| Calzado | **`Modelo + Marca`** | `New Balance 530` |
| Represent / Dime / ALD | Linea o modelo, en ingles | `Represent Owners Club Hoodie` |

La formula actual (`ETIQUETAS_TIPO_UNA + marca`) solo sirve para ropa. En
calzado da "Tenis New Balance" para el 530 Y para el 9060: pierde la unica
palabra que se busca.

### Modificadores que aparecen en las 25 marcas

- **original** -> va en la meta description, no en el titulo
- **precio**
- **hombre** / **mujer** -> mas volumen que `original`
- **color** -> en calzado es LA consulta (samba negros, 550 green, xt 6 negros)
- **peso** -> solo en maletas: 10 kg (cabina), 23 kg (bodega)

### Ejes de busqueda por categoria

| Categoria | Manda |
|---|---|
| Ropa | talla, marca |
| Calzado | **modelo + color** |
| Maletas | **peso permitido en avion** |

---

## EL TEST DE LA FUGA

El metodo que resolvio el vocabulario sin necesidad de volumenes.

Se pregunta al autocompletado por el termino en PLURAL y se mira que nombres
propios arrastra. Cada palabra se autodelata por el pais de las tiendas y
marcas que la acompanan:

    buzos hombre     -> koaj, bogota, falabella      COLOMBIA
    sacos hombre     -> zara, h&m                    Espana (+ sacos de dormir)
    sueteres hombre  -> liverpool, suburbia, guatemala   MEXICO
    sweaters hombre  -> avellaneda, argentina, ripley    ARGENTINA / CHILE

Segunda comprobacion: cuantas sugerencias da el termino junto a una tienda
colombiana. Una categoria que existe de verdad las llena; una que no, se queda
en tres.

    buzos falabella  10      sueteres falabella  3
    bolsos dafiti    10      carteras dafiti     3

Sirve para cualquier duda de vocabulario que quede. No hace falta Trends.

---

## ABIERTO (esperando datos)

1. Volumenes para ordenar los 643 terminos. Necesita Bing Webmaster o
   Keyword Planner. NO bloquea ninguna decision de nombrado.

2. Marcas de nicho sin senal local medible:

   | Marca | Sugerencias con "colombia" |
   |---|---|
   | Maison Mihara Yasuhiro | 0 |
   | Represent | 0 (todo en ingles) |
   | Dime | 0 (todo en ingles) |
   | Aime Leon Dore | 1 |
   | Eme Studios | 1 |
   | Axel Arigato | aparece en la #5 |

   RECOMENDACION: no les hagas pagina de marca todavia. Se venden por
   Instagram, no por buscador. Revisar cuando GSC lleve unos meses: si alguna
   acumula impresiones, entonces si.

## OPORTUNIDADES DETECTADAS

- **Salomon x Feid (Ferxxo)** -- `tenis salomon colombia feid` y variantes.
  Demanda colombiana, local, con precio. Casi nadie la trabaja.
- **Aime Leon Dore x New Balance** -- 550, 993, 1906r, 860v2. Usa dos marcas
  que ya vendes en una sola consulta.
- **Onitsuka Mexico 66** -- "donde comprar tenis onitsuka tiger en colombia".
- **buzo medio cierre** -- termino colombiano para el quarter-zip. Nadie lo usa.

## TRAMPAS CONFIRMADAS

- `adidas originals colombia` = camiseta RETRO DE LA SELECCION, no la linea
- `hoodie dime` = medidas de sudadera (hoodie dimensions)
- `ropa importada` = mayorista, China, Argentina
- `lacoste colombia` = pulseras, perfumes, zapatos
- `<marca> bogota` = buscador de tienda fisica, no compra online
