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
