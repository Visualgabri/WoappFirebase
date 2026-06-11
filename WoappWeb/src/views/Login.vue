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

    <!-- Card originale di Login (se non autenticato) -->
    <v-card v-else class="login-card rounded-2xl pa-8 elevation-8" max-width="480" width="100%">
      
      <!-- Logo ed Intestazione -->
      <div class="text-center mb-6">
        <v-avatar color="orange-darken-3" size="72" class="mb-4 elevation-3">
          <v-icon size="40" color="white">mdi-dumbbell</v-icon>
        </v-avatar>
        <h1 class="text-h4 font-weight-black text-slate-dark tracking-tight">
          Benvenuto su <span class="text-gradient">Woapp</span>
        </h1>
        <p class="text-subtitle-2 text-muted mt-1">Gestisci la tua forza, monitora i tuoi progressi.</p>
      </div>

      <!-- ACCESSO RAPIDO COACH (Entra Liberamente) -->
      <v-btn
        color="orange-darken-3"
        variant="elevated"
        block
        size="large"
        rounded="xl"
        class="font-weight-bold text-none mb-6 py-3 coach-quick-btn"
        @click="entraComeCoach"
        id="btn-quick-coach"
      >
        Entra come Coach 📋
        <v-icon right class="ml-2">mdi-account-multiple-outline</v-icon>
      </v-btn>

      <div class="d-flex align-center mb-6">
        <v-divider></v-divider>
        <span class="px-3 text-caption text-muted font-weight-bold text-uppercase">Oppure con Email</span>
        <v-divider></v-divider>
      </div>

      <!-- Toggle tra Login e Registrazione Email -->
      <v-tabs
        v-model="tabScelta"
        grow
        color="orange-darken-3"
        class="mb-6"
      >
        <v-tab value="accedi" class="font-weight-bold">Accedi con Email</v-tab>
        <v-tab value="registrati" class="font-weight-bold">Registrati</v-tab>
      </v-tabs>

      <!-- Messaggio di errore o info reattivo -->
      <v-alert
        v-if="errore"
        type="error"
        variant="tonal"
        closable
        class="mb-4 rounded-xl text-caption"
        @click:close="errore = ''"
      >
        {{ errore }}
      </v-alert>

      <v-form @submit.prevent="gestisciAutenticazione" ref="formAuth">
        <!-- Campo Email (Passwordless) -->
        <v-text-field
          v-model="email"
          label="Indirizzo Email Atleta o Coach"
          type="email"
          required
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-email-outline"
          color="orange-darken-3"
          placeholder="es. atleta@esempio.com"
          class="mb-4"
          id="login-email"
        ></v-text-field>

        <!-- Campi speciali visibili solo su REGISTRAZIONE -->
        <v-window v-model="tabScelta">
          <v-window-item value="registrati" class="py-2">
            <!-- Selezione del Ruolo -->
            <div class="text-subtitle-2 font-weight-bold text-slate-dark mb-2">Seleziona il tuo Ruolo</div>
            <v-radio-group
              v-model="ruoloScelto"
              inline
              color="orange-darken-3"
              class="mb-4"
            >
              <v-radio label="Atleta 🏋️" value="atleta" id="role-atleta"></v-radio>
              <v-radio label="Coach 📋" value="coach" id="role-coach"></v-radio>
            </v-radio-group>

            <!-- Selezione ID_cliente (solo per Atleti in registrazione) -->
            <v-autocomplete
              v-if="ruoloScelto === 'atleta'"
              v-model="idClienteScelto"
              :items="listaAtleti"
              :loading="caricamentoAtleti"
              label="Seleziona il tuo ID Atleta"
              placeholder="Associa il tuo ID della scheda..."
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-card-account-details-outline"
              color="orange-darken-3"
              class="mb-4"
              no-data-text="Nessun ID atleta disponibile"
              id="register-athlete-id"
            ></v-autocomplete>
            <div v-if="ruoloScelto === 'atleta'" class="text-caption text-orange-darken-4 font-weight-medium mb-4 bg-orange-lighten-5 pa-3 rounded-lg">
              <v-icon size="16" class="mr-1">mdi-alert-circle-outline</v-icon>
              Associa la tua email all'ID corretto per caricare subito i tuoi esercizi e note.
            </div>
          </v-window-item>
        </v-window>

        <!-- Pulsante di Invio -->
        <v-btn
          type="submit"
          variant="flat"
          block
          size="large"
          rounded="xl"
          class="font-weight-bold text-none mt-2 py-3 text-white"
          style="background: linear-gradient(135deg, #ea580c, #f97316) !important;"
          :loading="caricando"
          id="btn-auth-submit"
        >
          {{ tabScelta === 'accedi' ? 'Entra' : 'Registra ed Entra' }}
          <v-icon right class="ml-2">mdi-arrow-right</v-icon>
        </v-btn>
      </v-form>

    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  inizializzaSessione, 
  utente, 
  idCliente, 
  ruolo, 
  logout, 
  getNomeAtleta 
} from '../authStore.js';

const router = useRouter();

const disconnettiAccount = async () => {
  vibraTattile(15);
  await logout();
};

// Stato Form
const tabScelta = ref('accedi');
const email = ref('');
const ruoloScelto = ref('atleta');
const idClienteScelto = ref(null);

// Stato UI
const caricando = ref(false);
const errore = ref('');
const listaAtleti = ref([]);
const caricamentoAtleti = ref(true);

// Carica ID Atleti univoci per l'associazione
onMounted(async () => {
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
  } catch (error) {
    console.error("Errore caricamento atleti:", error);
  } finally {
    caricamentoAtleti.value = false;
  }
});

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Accesso rapido come Coach (Senza password e senza email obbligatoria)
const entraComeCoach = () => {
  vibraTattile(20);
  inizializzaSessione('coach@woapp.com', '', 'coach');
  router.push('/');
};

// Gestore Autenticazione Passwordless (Accedi / Registrati)
const gestisciAutenticazione = async () => {
  errore.value = '';
  vibraTattile(15);
  
  if (!email.value || !email.value.includes('@')) {
    errore.value = 'Inserisci un indirizzo email valido.';
    return;
  }

  const emailPulita = email.value.trim().toLowerCase();
  caricando.value = true;
  
  try {
    const userDocRef = doc(db, 'UTENTI', emailPulita);

    if (tabScelta.value === 'accedi') {
      // ACCESSO PASSWORDLESS
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        inizializzaSessione(data.email, data.ID_cliente, data.ruolo);
        router.push('/');
      } else {
        errore.value = 'Email non trovata. Se è la prima volta che entri, clicca sulla scheda "Registrati" per creare il tuo profilo!';
      }
    } else {
      // REGISTRAZIONE PASSWORDLESS
      if (ruoloScelto.value === 'atleta' && !idClienteScelto.value) {
        errore.value = 'Seleziona il tuo ID Atleta per completare la registrazione.';
        caricando.value = false;
        return;
      }

      // Controlla se l'email esiste già
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        errore.value = 'Questa email è già registrata. Prova ad effettuare l\'accesso!';
        caricando.value = false;
        return;
      }

      // Crea il profilo utente su Firestore
      const nuovoProfilo = {
        email: emailPulita,
        ID_cliente: ruoloScelto.value === 'atleta' ? idClienteScelto.value : '',
        ruolo: ruoloScelto.value,
        creatoIl: new Date().toISOString()
      };

      await setDoc(userDocRef, nuovoProfilo);
      inizializzaSessione(nuovoProfilo.email, nuovoProfilo.ID_cliente, nuovoProfilo.ruolo);
      
      router.push('/');
    }
  } catch (err) {
    console.error("Errore autenticazione passwordless:", err);
    errore.value = 'Si è verificato un errore durante l\'accesso. Verifica la tua connessione.';
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

.bg-orange-lighten-5 {
  background: rgba(249, 115, 22, 0.1) !important;
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
  border-left: 4px solid #f97316 !important;
  color: #ea580c !important;
}

.coach-quick-btn {
  box-shadow: 0 8px 20px -8px rgba(239, 108, 0, 0.5) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.coach-quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(239, 108, 0, 0.6) !important;
}
</style>
