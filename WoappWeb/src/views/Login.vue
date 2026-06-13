<template>
  <v-container class="fill-height justify-center px-4 py-12 login-background">
    <!-- Card Glassmorphic Premium per Utente Loggato -->
    <v-card v-if="utente" class="login-card rounded-2xl pa-8 elevation-8 text-center" max-width="480" width="100%">
      <!-- Logo ed Intestazione -->
      <div class="text-center mb-6">
        <v-avatar color="orange-darken-3" size="72" class="mb-4 elevation-3 border-orange text-white">
          <v-icon size="40">mdi-account</v-icon>
        </v-avatar>
        <h1 class="text-h4 font-weight-black text-slate-dark tracking-tight">
          Profilo <span class="text-gradient">Atleta</span>
        </h1>
        <p class="text-subtitle-2 text-muted mt-1">Gestione account e sessione attiva</p>
      </div>

      <!-- Anagrafica Premium Box -->
      <div class="pa-4 rounded-xl border border-orange-darken-3-op card-glass mb-6 text-left position-relative overflow-hidden">
        <div class="decor-glow"></div>
        <div class="d-flex align-center mb-4 position-relative" style="z-index: 2;">
          <v-avatar size="44" color="orange-darken-4" class="mr-3 border-orange text-white font-weight-black">
            {{ getNomeAtleta(idCliente) ? getNomeAtleta(idCliente).charAt(0).toUpperCase() : (ruolo === 'coach' ? 'C' : 'A') }}
          </v-avatar>
          <div class="text-left">
            <div class="text-h6 font-weight-black text-slate-dark leading-none">
              {{ ruolo === 'coach' ? 'Coach' : (getNomeAtleta(idCliente) || 'Atleta') }}
            </div>
            <div class="text-caption text-muted mt-1.5 d-flex align-center gap-1">
              <v-icon size="12" class="mr-1">mdi-email-outline</v-icon>
              {{ utente.email }}
            </div>
          </div>
        </div>

        <v-row dense class="border-top-soft pt-3 position-relative" style="z-index: 2;">
          <v-col cols="6" class="border-right-soft">
            <div class="text-center py-1">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">Ruolo</span>
              <v-chip color="orange-darken-3" size="x-small" class="font-weight-black mt-1 text-white" variant="flat">
                {{ ruolo === 'coach' ? 'Coach 📋' : 'Atleta 🏋️' }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="text-center py-1">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">ID Cliente</span>
              <span class="text-body-2 font-weight-black text-slate-dark mt-1 d-inline-block">
                {{ idCliente || 'N/D' }}
              </span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Pulsanti d'azione -->
      <div class="d-flex flex-column gap-3">
        <v-btn
          color="orange-darken-3"
          block
          size="large"
          rounded="xl"
          class="font-weight-bold text-none py-3 text-white glowing-btn"
          @click="router.push('/')"
        >
          <v-icon left class="mr-2">mdi-dumbbell</v-icon>
          Apri i tuoi Allenamenti
        </v-btn>

        <v-btn
          color="red-darken-2"
          variant="outlined"
          block
          size="large"
          rounded="xl"
          class="font-weight-bold text-none py-3"
          @click="disconnettiAccount"
        >
          <v-icon left class="mr-2">mdi-logout</v-icon>
          Disconnetti Account
        </v-btn>
      </div>
    </v-card>

    <!-- Card di Login (se non autenticato) -->
    <v-card v-else class="login-card rounded-2xl pa-8 elevation-8" max-width="480" width="100%">
      <!-- Logo ed Intestazione -->
      <div class="text-center mb-6">
        <v-avatar color="orange-darken-3" size="72" class="mb-4 elevation-3">
          <v-icon size="40" color="white">mdi-dumbbell</v-icon>
        </v-avatar>
        <h1 class="text-h4 font-weight-black text-slate-dark tracking-tight">
          Benvenuto su <span class="text-gradient">FlexCoach</span>
        </h1>
        <p class="text-subtitle-2 text-muted mt-1">Gestisci la tua forza, monitora i tuoi progressi.</p>
      </div>

      <!-- Messaggio di errore o info reattivo -->
      <v-alert
        v-if="errore"
        type="error"
        variant="tonal"
        closable
        class="mb-6 rounded-xl text-caption text-left"
        @click:close="errore = ''"
      >
        {{ errore }}
      </v-alert>

      <!-- Pulsante di Login con Google Premium -->
      <v-btn
        block
        size="x-large"
        rounded="xl"
        class="font-weight-black text-none py-4 google-btn shadow-md"
        style="background: #ffffff !important; color: #1f2937 !important; border: 1px solid #e5e7eb !important; height: 54px;"
        :loading="caricando"
        @click="accediConGoogle"
        id="btn-google-login"
      >
        <!-- Icona Google SVG -->
        <svg class="mr-3" width="20" height="20" viewBox="0 0 24 24" style="vertical-align: middle;">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Accedi con Google
      </v-btn>

      <div class="text-center mt-6 text-caption text-muted font-italic">
        L'accesso è consentito esclusivamente agli account Google pre-autorizzati.
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase.js';
import { 
  inizializzaSessione, 
  utente, 
  idCliente, 
  ruolo, 
  logout, 
  getNomeAtleta,
  MAPPA_CLIENTI
} from '../authStore.js';

const router = useRouter();

// Stato UI
const caricando = ref(false);
const errore = ref('');

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const disconnettiAccount = async () => {
  vibraTattile(15);
  await logout();
};

// Gestore Autenticazione con Google (Google Sign-In)
const accediConGoogle = async () => {
  errore.value = '';
  vibraTattile(15);
  caricando.value = true;
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (!user || !user.email) {
      throw new Error("Impossibile recuperare l'email dal tuo account Google.");
    }
    
    const emailPulita = user.email.trim().toLowerCase();
    
    // 1. Verifica se è il Coach
    if (emailPulita === 'visualgabri@gmail.com') {
      inizializzaSessione(user.email, '1', 'coach');
      router.push('/');
      return;
    }
    
    // 2. Cerca nella mappa dei clienti statica di authStore.js
    const matchedId = Object.keys(MAPPA_CLIENTI).find(
      id => MAPPA_CLIENTI[id].email && MAPPA_CLIENTI[id].email.toLowerCase().trim() === emailPulita
    );
    
    if (matchedId) {
      inizializzaSessione(user.email, matchedId, 'atleta');
      router.push('/');
      return;
    }
    
    // 3. Cerca nella collection UTENTI di Firestore (per utenti registrati dinamicamente)
    const userDocRef = doc(db, 'UTENTI', emailPulita);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      inizializzaSessione(data.email, data.ID_cliente, data.ruolo);
      router.push('/');
      return;
    }
    
    // 4. Utente non autorizzato: blocca e mostra errore
    errore.value = "Utente non abilitato all'accesso. Contatta il Coach per registrare la tua email.";
    await logout(); // Disconnette l'utente da Firebase Auth e pulisce la sessione locale
    
  } catch (err) {
    console.error("Errore durante il login con Google:", err);
    // Non mostrare l'errore se l'utente chiude semplicemente il popup
    if (err.code !== 'auth/popup-closed-by-user') {
      errore.value = "Si è verificato un errore durante l'accesso. Riprova.";
    }
  } finally {
    caricando.value = false;
  }
};
</script>

<style scoped>
.login-background {
  background: transparent !important;
  min-height: 100vh;
}

.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.decor-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0) 70%);
  z-index: 1;
  pointer-events: none;
}

.login-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.5) !important;
}

.text-gradient {
  background: linear-gradient(90deg, #f97316, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-slate-dark {
  color: #f8fafc !important;
}

.text-muted {
  color: #94a3b8 !important;
}

.glowing-btn {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
  transition: all 0.2s ease !important;
}

.google-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.google-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.15) !important;
}

.google-btn:active {
  transform: scale(0.97) !important;
}
</style>
