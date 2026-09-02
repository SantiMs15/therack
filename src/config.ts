/**
 * Datos del negocio. PENDIENTE: reemplazar los marcados antes de publicar.
 */
export const CONFIG = {
  nombre: 'The Rack store',
  telefono: '+57 305 439 9454',
  instagram: 'therack.st',
  // El dominio vive en astro.config.mjs (campo `site`) — PENDIENTE cambiarlo alli antes de publicar.
  direccion: 'Calle 00 #00-00',         // PENDIENTE
  ciudad: 'Bogota',                     // PENDIENTE
  horarios: 'Lunes a sabado, 10:00 - 19:00', // PENDIENTE
  sobre: 'PENDIENTE: texto de quienes somos', // PENDIENTE
} as const

export const INSTAGRAM_URL = `https://instagram.com/${CONFIG.instagram}`
