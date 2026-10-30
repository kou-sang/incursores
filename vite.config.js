import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Rutas de node_modules con separador / (Linux/Vercel) o \ (Windows).
const vendor = (packages) => new RegExp(`[\\\\/]node_modules[\\\\/](${packages})[\\\\/]`)

/*
 * Librerías en archivos propios: mismo peso total, pero
 *  1) se descargan en paralelo (Vite inyecta <link rel="modulepreload"> → sin cascada de requests);
 *  2) quedan cacheadas entre deploys: si solo cambia el código de la app, Firebase/React no se re-descargan.
 * Sin grupo "catch-all" de node_modules a propósito: Recharts/d3 deben seguir dentro del chunk
 * diferido de Analíticas y no cargarse al inicio.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'firebase-firestore', test: vendor('@firebase[\\\\/]firestore|@firebase[\\\\/]webchannel-wrapper'), priority: 40 },
            { name: 'firebase-core', test: vendor('@firebase|firebase|idb'), priority: 30 },
            { name: 'react-vendor', test: vendor('react|react-dom|scheduler'), priority: 20 },
            { name: 'motion', test: vendor('framer-motion|motion-dom|motion-utils'), priority: 10 },
          ],
        },
      },
    },
  },
})
