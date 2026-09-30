# Plan del archivo de marcas

Documento vivo. Aqui se decide que marca entra al archivo (`/marca/<slug>`),
con que enfoque, y se registra cada avance en la **Bitacora** del final.

- Datos de marca: `src/data/fichas-marca.ts` (esquema y fichas)
- Lista de marcas y orden de busqueda: `src/data/marcas.ts`
- Vocabulario y anclas obligatorias: `docs/keywords-decisiones.md`
- Fotos: `src/assets/marcas/` (portada 3:2 horizontal, galeria de 2 a 6)

---

## Estado actual

| Marca | Ficha | Fotos | Stock en catalogo | Estado |
|---|---|---|---|---|
| Eme Studios | Si | Portada + galeria (5) | 1 | Publicada |
| Aimé Leon Dore | Si | No: usa el placeholder | 4 (una es la colaboracion con New Balance) | Publicada (falta portada) |
| Lacoste | No | No | 4 | **Siguiente** |
| Tommy Hilfiger | No | No | 4 | En cola |
| Hugo Boss | No | No | 0 | En cola |
| Ralph Lauren | No | No | 0 | En cola |
| Calvin Klein | No | No | 0 | En cola |
| Karl Lagerfeld | No | No | 0 | En cola |
| Essentials | No | No | 2 | Bloqueada: falta medir keyword correcta |

Actualizar esta tabla cada vez que cambie algo (y anotarlo en la Bitacora).

---

## Criterio de prioridad

Con un dominio nuevo NO se posiciona por la marca sola ("lacoste",
"calvin klein"): es busqueda navegacional y la gana la web oficial. Lo que si
se gana es **"marca + colombia"** y variantes con **KD por debajo de ~35**, que
es justo lo que ataca una pagina titulada "<Marca> en Colombia".

Se ordena por, en este orden:
1. Volumen de "marca + colombia" y de variantes con KD bajo.
2. Stock: una pagina que atrae trafico sin prendas que vender convierte poco.
3. Relevancia para el catalogo (ropa y tenis; no perfumes ni relojes).

Fuente de datos: Semrush Keyword Overview (plan gratuito, base Colombia),
2026-09-29. El KD es competencia global por enlaces y los volumenes son
estimados: sirven para ORDENAR, no como cifra exacta. Cuando Google Search
Console tenga 2-3 meses de datos, este orden se revisa con impresiones reales.

---

## Prioridad y datos

| # | Marca | Keyword objetivo (CO) | Vol. / KD | Vol. marca sola / KD | Stock |
|---|---|---|---|---|---|
| 1 | **Lacoste** | lacoste colombia | 8.1K / 36 | 18.1K / 58 | 4 |
| 2 | **Tommy Hilfiger** | tommy hilfiger colombia | 6.6K / 49 | 40.5K / 50 | 4 |
| 3 | **Hugo Boss** | zapatos hugo boss · gorras hugo boss | 5.4K / 18 · 3.6K / 22 | 27.1K / 34 | 0 |
| 4 | **Ralph Lauren** | polo ralph lauren colombia · camisa polo ralph lauren | 3.6K / 27 · 880 / 16 | 18.1K / 41 | 0 |
| 5 | **Calvin Klein** | boxer calvin klein · calvin klein colombia | 2.4K / 21 · 6.6K / 40 | 33.1K / 45 | 0 |
| 6 | **Karl Lagerfeld** | bolso karl lagerfeld · tenis karl lagerfeld | 1.9K / 19 · 1.3K / 24 | 18.1K / 33 | 0 |
| 7 | **Essentials** | (por medir: "fear of god essentials") | — | 5.4K / 31 (contaminada) | 2 |

Otras variantes vistas en los informes, por si sirven en el texto:
- Lacoste: zapatos lacoste 4.4K/31 · lacoste red 5.4K/23 (verificar intencion antes de usar) · "de donde es la marca lacoste" 110/29
- Tommy: zapatos tommy hilfiger 1.9K/31 · "de donde es la marca tommy hilfiger" 30/22
- Hugo Boss: hugo boss perfume 4.4K/17 (NO: no se vende)
- Calvin Klein: calvin klein perfume 2.9K/22 (NO)
- Karl Lagerfeld: zapatos karl lagerfeld 1.3K/20

---

## Enfoque por marca

### 1. Lacoste
- **Angulo:** herencia francesa, polo pique, el cocodrilo.
- **Titular (max 30):** "el cocodrilo francés"
- **Seccion clave:** como reconocer una Lacoste original (el grupo de
  keywords trae "marca del cocodrilo", "logo lacoste original"). Da confianza
  en una tienda de reventa.
- **Datos ficha:** Francia · 1933 · René Lacoste y André Gillier (verificar antes de publicar).

### 2. Tommy Hilfiger
- **Angulo:** preppy americano. Alinear con el carrusel Preppy de Instagram.
- **Titular:** "preppy de Nueva York"
- **Datos ficha:** Estados Unidos · Nueva York · 1985 · Tommy Hilfiger (verificar).

### 3. Hugo Boss
- **Angulo:** sastreria alemana, enfocada en gorras y calzado (donde esta la
  demanda facil).
- **Titular:** "sastrería alemana"
- **Condicion:** vale la pena de verdad cuando entre stock de gorras/calzado.
- **Datos ficha:** Alemania · Metzingen · 1924 · Hugo Boss (verificar).

### 4. Ralph Lauren
- **Angulo:** preppy clasico americano.
- **Ancla obligatoria:** en Colombia se busca "**polo** ralph lauren". El
  titulo debe decir "Polo Ralph Lauren en Colombia" sin renombrar la marca en
  el catalogo (mismo caso que Dime / Represent).
- **Datos ficha:** Estados Unidos · Nueva York · 1967 · Ralph Lauren (verificar).

### 5. Calvin Klein
- **Angulo:** minimalismo neoyorquino; entrada por ropa interior (boxer).
- **Titular:** "minimalismo de Nueva York"
- **Datos ficha:** Estados Unidos · Nueva York · 1968 · Calvin Klein y Barry Schwartz (verificar).

### 6. Karl Lagerfeld
- **Angulo:** moda parisina, publico mujer, bolsos.
- **Ojo:** los resultados mezclan mucha biografia del diseñador; la ficha
  debe hablar de la marca, no de la persona.
- **Datos ficha:** Francia · Paris · 1984 · Karl Lagerfeld (verificar).

### 7. Essentials
- **Bloqueo:** "essentials" sola trae aceites esenciales, "essential mod",
  "lacoste essential". Volver a medir en Semrush "fear of god essentials" y
  "essentials fear of god colombia" antes de escribir la ficha.
- **Ancla obligatoria:** "Fear of God Essentials". Añadir a la tabla de
  anclas de `keywords-decisiones.md`.

---

## Reglas para todas las fichas

1. **Responder "¿de donde es la marca X?"** en la primera linea de `porQue`.
   La pregunta aparece en todas las marcas y los campos `pais`, `ciudad`,
   `anio` y `fundador` ya la resuelven en datos estructurados.
2. **No perseguir perfume ni reloj** aunque tengan volumen: atraen trafico
   que no compra y diluyen la relevancia de ropa.
3. **"Zapatos" si se puede usar** como variante natural en el texto (tiene
   volumen), aunque la categoria del catalogo siga siendo "tenis".
4. **"Original" va en `propuesta`** (meta description), no en el titular.
5. `propuesta` max 160 caracteres; `titular` max 30.
6. Respetar el vocabulario cerrado: buzo, tenis, gorra, bolso, jean, boxer.
   Prohibido: ropa americana, saco, sueter, cartera, zapatillas, sudadera.

## Checklist por ficha

- [ ] Keyword objetivo confirmada (Semrush / Trends)
- [ ] Datos verificados: pais, ciudad, año, fundador
- [ ] `titular` (≤30) y `propuesta` (≤160) con keyword y "original"
- [ ] `porQue` (primer parrafo responde de donde es la marca)
- [ ] Portada 3:2 en `src/assets/marcas/<slug>-portada.jpg` + `alt`
- [ ] Galeria 2-6 fotos (opcional) + `alt`
- [ ] Video de portada (opcional) en `public/videos/`
- [ ] Tests y build en verde
- [ ] Publicada y enviada a indexar en Search Console
- [ ] Registrada en la Bitacora

---

## Pendientes abiertos

- [ ] Escribir ficha de Lacoste
- [ ] Escribir ficha de Tommy Hilfiger
- [ ] Conseguir portada 3:2 (y galeria) de Aimé Leon Dore: hoy usa el placeholder
- [ ] Medir "fear of god essentials" en Semrush
- [ ] Añadir "Polo Ralph Lauren" y "Fear of God Essentials" a las anclas de `keywords-decisiones.md`
- [ ] Cuando GSC tenga 2-3 meses: revisar este orden con impresiones reales

---

## Bitacora

Formato: `AAAA-MM-DD — que se hizo — quien`. Lo mas reciente arriba.

- **2026-09-29** — Creado este plan. Priorizacion a partir de informes Semrush
  (Tommy Hilfiger, Ralph Lauren, Lacoste, Essentials, Calvin Klein, Hugo Boss,
  Karl Lagerfeld). Orden: Lacoste > Tommy > Hugo Boss > Ralph Lauren >
  Calvin Klein > Karl Lagerfeld > Essentials. Fichas existentes: Eme Studios,
  Aimé Leon Dore. — Santiago + Claude
