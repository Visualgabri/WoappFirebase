import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js' // Percorso super esplicito
import './style.css' // Importa gli stili globali (inclusi font, sfondi e blocco di selezione testo)

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' 

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#030712', // Slate 950 OLED
          surface: '#0f172a',    // Slate 900 surface
          primary: '#f97316',    // Orange primary
          secondary: '#3b82f6',  // Blue
          success: '#10b981',    // Green
          error: '#ef4444',
        }
      }
    }
  }
})

const app = createApp(App)
app.use(router) // Usiamo il router
app.use(vuetify)
app.mount('#app')