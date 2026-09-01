import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const NOMBRES = [
  'blazer-lino-negro-1.jpg',
  'blazer-lino-negro-2.jpg',
  'camisa-oxford-blanca-1.jpg',
  'botin-cuero-cafe-1.jpg',
]

const ANCHO = 900
const ALTO = 1200 // ratio 3:4 exacto

await mkdir('src/assets/productos', { recursive: true })

for (const nombre of NOMBRES) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <rect width="100%" height="100%" fill="#E7E5E4"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="28"
          fill="#78716C" text-anchor="middle">${nombre}</text>
  </svg>`
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(`src/assets/productos/${nombre}`)
  console.log('generado', nombre)
}
