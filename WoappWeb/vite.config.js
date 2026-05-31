import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Woapp - La Tua Scheda Palestra',
        short_name: 'Woapp',
        description: 'Traccia i tuoi allenamenti, gestisci i carichi e analizza i volumi in palestra',
        theme_color: '#ef6c00',
        background_color: '#f5f5f5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})