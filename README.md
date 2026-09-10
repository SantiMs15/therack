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

## Anadir una marca al archivo

1. Deja la foto de campana en `src/assets/marcas/`, en ratio **3:2 horizontal**.
2. Anade una entrada a `archivo` en `src/data/fichas-marca.ts`, con el slug de
   la marca por clave. El slug sale del nombre: "Aime Leon Dore" es
   `aime-leon-dore`.
3. `npm run build`.

La ficha es opcional. La marca que no la tiene no tiene pagina, y su nombre en
el menu sigue llevando al catalogo filtrado, como antes. En cuanto se escribe
la ficha, el menu, la ficha de producto y el indice de `/marca/` la enlazan
solos.

Si algo esta mal —falta un campo, la propuesta pasa de 160 caracteres, el slug
no coincide con ninguna marca de `marcas.ts`, la foto no existe— **el build
falla y dice cual es el problema**.

## Pendiente antes de publicar

Los valores marcados `PENDIENTE` en `src/config.ts`: telefono de WhatsApp,
usuario de Instagram, direccion, ciudad, horarios y el texto de "quienes
somos" (`sobre`).

El dominio **no** esta en `src/config.ts`: vive en el campo `site` de
`astro.config.mjs`, y de ahi se construye el enlace del producto que va
dentro de cada mensaje de WhatsApp. Cambialo ahi antes de publicar.

## Documentacion

- Diseno: `docs/superpowers/specs/2026-08-31-the-rack-store-catalogo-design.md`
- Plan: `docs/superpowers/plans/2026-08-31-the-rack-store-catalogo.md`

## Despliegue

Cada push a `master` construye el sitio y lo sincroniza con Hostinger por FTP.
Trabajar en otra rama no publica nada.

    npm run dev      revisar en local antes de confirmar
    git push         publica (2-3 min)

Si las pruebas o el build fallan, no se sube nada.

### Secrets que necesita GitHub

En el repo: Settings -> Secrets and variables -> Actions -> New repository secret

| Secret | Valor |
|---|---|
| `FTP_SERVIDOR` | host FTP de hPanel (p.ej. `ftp.therackstore.shop`) |
| `FTP_USUARIO` | usuario FTP |
| `FTP_PASSWORD` | contrasena FTP |
| `FTP_DIRECTORIO` | `./public_html/` o `./` — ver abajo |

`FTP_DIRECTORIO` depende de donde aterrice la cuenta FTP al conectar:

- si al entrar ves una carpeta `public_html` -> `./public_html/`
- si al entrar ya ves `index.html` y `_astro` -> `./`

Una equivocacion aqui publica el sitio en la carpeta incorrecta. Se corrige
cambiando el secret y relanzando el workflow desde la pestana Actions.
