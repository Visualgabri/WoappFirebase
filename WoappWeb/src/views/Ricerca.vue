<template>
  <v-container 
    class="px-4 max-width-container min-height-screen pb-12"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-2' : (layoutEserciziGlobal === 'compatto' ? 'py-4' : 'py-8')"
  >
    <!-- Header Premium con stile AppSheet Evoluto (Coerente Dark Mode) -->
    <div 
      class="premium-header card-glass rounded-2xl d-flex align-center justify-space-between elevation-2 border-bottom-soft"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-2.5 mb-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-3 mb-4.5' : 'pa-4 mb-6')"
    >
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-transparent border-orange elevation-1 profile-avatar">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left">
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">Ricerca Wo</h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.62rem; letter-spacing: 0.05em;">Configurazione Atleta & Schede</span>
        </div>
      </div>
      <div class="header-actions">
        <v-btn icon color="orange-darken-3" variant="text" @click="caricaDatiAtleti" size="small"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- GUIDED STEPS FLOW -->
    <div class="steps-flow-container">

      <!-- STEP 1: SELEZIONE ATLETA -->
      <v-card 
        class="premium-card rounded-2xl text-left border position-relative" 
        :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3 mb-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4 mb-4' : 'pa-5 mb-5')"
        elevation="2"
      >
        <div class="d-flex align-start mb-4">
          <!-- Circular Step Badge -->
          <div class="step-badge mr-3 flex-shrink-0">01</div>
          <div class="text-left">
            <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Passo Uno</span>
            <h3 v-if="ruolo === 'atleta'" class="text-h6 font-weight-black text-slate-dark leading-tight mt-0.5">Atleta Connesso</h3>
            <h3 v-else class="text-h6 font-weight-black text-slate-dark leading-tight mt-0.5">Seleziona Atleta</h3>
          </div>
        </div>

        <!-- Dropdown Select Atleta per il Coach (Non editabile per evitare la tastiera su mobile) -->
        <v-select
          v-if="ruolo === 'coach'"
          v-model="atletaSelezionato"
          :items="itemsAtleti"
          item-title="title"
          item-value="value"
          label="Scegli Atleta..."
          variant="outlined"
          rounded="lg"
          color="orange-darken-3"
          prepend-inner-icon="mdi-account"
          class="search-select-field"
          hide-details
          @update:model-value="gestisciCambioAtleta"
          id="atleta-dropdown"
        ></v-select>
        
        <!-- Box bloccato per l'Atleta loggato -->
        <div v-else class="pa-4 rounded-xl bg-orange-darken-3-op border-orange d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="orange" class="mr-2.5">mdi-account-check</v-icon>
            <span class="font-weight-black text-slate-dark text-body-1">{{ utente?.email }}</span>
          </div>
          <v-chip color="orange-darken-3" size="small" class="font-weight-black">ID: {{ idCliente }}</v-chip>
        </div>

        <!-- Riepilogo Anagrafica Atleta (Premium Glassmorphic Grid) -->
        <div v-if="atletaSelezionato" class="mt-4 pa-4 rounded-xl border border-orange-darken-3-op card-glass position-relative overflow-hidden">
          <!-- Subtle backglow decoration -->
          <div class="decor-glow"></div>
          
          <div class="d-flex align-center justify-space-between mb-3 position-relative" style="z-index: 2;">
            <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Riepilogo Anagrafica Atleta</span>
            <v-chip 
              :color="isAtletaObsoleto(atletaSelezionato) ? 'red-darken-3' : 'green-darken-3'"
              size="x-small" 
              class="font-weight-black px-2.5 uppercase text-white"
              variant="flat"
            >
              {{ isAtletaObsoleto(atletaSelezionato) ? 'Obsoleto' : 'Attivo' }}
            </v-chip>
          </div>

          <div class="position-relative text-left" style="z-index: 2;">
            <!-- Nome ed Email -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="36" color="orange-darken-4" class="mr-3 border-orange text-white font-weight-black">
                {{ getNomeAtleta(atletaSelezionato) ? getNomeAtleta(atletaSelezionato).charAt(0).toUpperCase() : 'A' }}
              </v-avatar>
              <div class="text-left">
                <div class="text-body-1 font-weight-black text-slate-dark leading-none">
                  {{ getNomeAtleta(atletaSelezionato) || 'Atleta Sconosciuto' }}
                </div>
                <div class="text-caption text-muted mt-1.5 d-flex align-center gap-1">
                  <v-icon size="12" class="mr-1">mdi-email-outline</v-icon>
                  {{ getEmailAtleta(atletaSelezionato) || 'Nessuna email' }}
                </div>
              </div>
            </div>

            <!-- Griglia Parametri -->
            <v-row dense class="mt-2 border-top-soft pt-2">
              <v-col cols="6" class="border-right-soft">
                <div class="text-center py-1">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">Scheda Default</span>
                  <span class="text-body-2 font-weight-black text-orange-lighten-1 mt-0.5 d-inline-block">
                    Scheda {{ getSchedaSelezionataAtleta(atletaSelezionato) || 'N/D' }}
                  </span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-center py-1">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">Stile Dettagli</span>
                  <span class="text-body-2 font-weight-black text-slate-dark d-flex align-center justify-center gap-1 mt-0.5">
                    <v-icon size="14" :color="getVistaDettagliAtleta(atletaSelezionato) ? 'orange' : 'grey'" class="mr-0.5">
                      {{ getVistaDettagliAtleta(atletaSelezionato) ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
                    </v-icon>
                    {{ getVistaDettagliAtleta(atletaSelezionato) ? 'Dettagliata' : 'Semplice' }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card>

      <!-- STEP 2: SELEZIONE SCHEDA (MESOCICLO) -->
      <v-card 
        class="premium-card rounded-2xl text-left border position-relative transition-all" 
        :class="[
          !atletaSelezionato ? 'locked-card-state' : '',
          layoutEserciziGlobal === 'super_compatto' ? 'pa-3 mb-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4 mb-4' : 'pa-5 mb-5')
        ]"
        elevation="2"
      >
        <!-- Overlay di blocco se atleta non selezionato -->
        <div v-if="!atletaSelezionato" class="locked-card-overlay d-flex flex-column align-center justify-center text-center pa-6">
          <v-icon size="36" color="grey" class="mb-2">mdi-lock-outline</v-icon>
          <span class="text-caption font-weight-bold text-muted">Seleziona prima l'atleta al Passo 1 per sbloccare le schede</span>
        </div>

        <div v-else class="w-100">
          <div class="d-flex align-start mb-4">
            <div class="step-badge mr-3 flex-shrink-0">02</div>
            <div class="text-left flex-grow-1">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Passo Due</span>
              <h3 class="text-h6 font-weight-black text-slate-dark leading-tight mt-0.5">Scegli Scheda</h3>
            </div>
            <!-- Bottone Ultima Scheda a fianco o sopra -->
            <v-btn
              color="orange-darken-3"
              size="x-small"
              class="font-weight-black text-none py-1.5 px-3 rounded-lg text-white glowing-btn"
              @click="selezionaUltimaScheda"
              :disabled="listaSchede.length === 0"
              id="btn-ultima-scheda-small"
            >
              <v-icon size="12" class="mr-1">mdi-skip-next</v-icon>
              ULTIMA SCHEDA
            </v-btn>
          </div>

          <div v-if="caricamentoSchede" class="text-center my-6">
            <v-progress-circular indeterminate color="orange" size="32"></v-progress-circular>
            <p class="mt-2 text-caption text-muted">Caricamento schede disponibili...</p>
          </div>

          <div v-else-if="listaSchede.length === 0" class="text-center my-6 py-6 border-dashed rounded-xl">
            <v-icon color="grey-lighten-1" size="36" class="mb-2">mdi-clipboard-alert-outline</v-icon>
            <p class="text-caption text-muted px-4 leading-tight">Nessuna scheda trovata per questo atleta.</p>
          </div>

          <!-- Selettore schede a scorrimento orizzontale compatto -->
          <div v-else class="scheda-scroll-container">
            <button
              v-for="scheda in listaSchede"
              :key="scheda"
              class="scheda-scroll-btn"
              :class="{ 'scheda-scroll-btn-active': schedaSelezionata === scheda }"
              @click="gestisciSelezioneScheda(scheda)"
              :id="'btn-scheda-' + scheda"
            >
              <span class="scheda-num">{{ scheda }}</span>
              <span class="scheda-lbl">SCHEDA</span>
            </button>
          </div>
        </div>
      </v-card>

      <!-- STEP 3: ANTEPRIMA ALLENAMENTI & AVVIO -->
      <v-card 
        class="premium-card rounded-2xl text-left border position-relative transition-all" 
        :class="[
          !schedaSelezionata ? 'locked-card-state' : '',
          layoutEserciziGlobal === 'super_compatto' ? 'pa-3 mb-4' : (layoutEserciziGlobal === 'compatto' ? 'pa-4 mb-5' : 'pa-5 mb-6')
        ]"
        elevation="2"
      >
        <!-- Overlay di blocco se scheda non selezionata -->
        <div v-if="!schedaSelezionata" class="locked-card-overlay d-flex flex-column align-center justify-center text-center pa-6">
          <v-icon size="36" color="grey" class="mb-2">mdi-lock-outline</v-icon>
          <span class="text-caption font-weight-bold text-muted">Scegli una scheda al Passo 2 per vedere l'anteprima e iniziare</span>
        </div>

        <div v-else class="w-100">
          <div class="d-flex align-start mb-4">
            <div class="step-badge mr-3 flex-shrink-0">03</div>
            <div class="text-left">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Passo Tre</span>
              <h3 class="text-h6 font-weight-black text-slate-dark leading-tight mt-0.5">Anteprima Allenamenti</h3>
            </div>
          </div>

          <!-- Stato di caricamento preview -->
          <div v-if="caricamentoPreview" class="text-center my-6">
            <v-progress-circular indeterminate color="orange" size="32"></v-progress-circular>
            <p class="mt-2 text-caption text-muted">Generazione anteprima scheda...</p>
          </div>

          <!-- Lista preview dei giorni -->
          <div v-else-if="giorniPreview.length > 0" class="preview-days-stacked mb-5">
            <div 
              v-for="g in giorniPreview" 
              :key="g.giorno" 
              class="preview-day-card pa-3 mb-2.5 rounded-xl border-soft bg-slate-900-op position-relative overflow-hidden"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center min-width-0">
                  <div class="day-letter-badge mr-2 flex-shrink-0">{{ g.giorno }}</div>
                  <div class="min-width-0 text-left">
                    <h4 class="text-body-2 font-weight-black text-slate-dark text-truncate leading-tight" style="font-size: 0.82rem !important;">
                      Focus: {{ getFocusGiorno(g.exercises) }}
                    </h4>
                  </div>
                </div>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black px-2 flex-shrink-0" style="height: 16px; font-size: 0.55rem;">
                  Giorno {{ g.giorno }}
                </v-chip>
              </div>

              <!-- Griglia di Metriche Ultra Compatta -->
              <div class="d-flex flex-wrap gap-1.5 mt-1.5">
                <span class="preview-mini-pill">
                  🏋️ <span class="lbl">Ex:</span> <strong>{{ g.exercises.length }}</strong>
                </span>
                <span v-if="parseVolumes(g.ins_esercizio)" class="preview-mini-pill">
                  📊 <span class="lbl">Vol:</span> <strong>{{ parseVolumes(g.ins_esercizio).totale }}s</strong>
                </span>
                <span v-if="parseDayHeader(g.titolo)" class="preview-mini-pill">
                  ⏱️ <span class="lbl">Target:</span> <strong>{{ formattaDurataLeggibile(parseDayHeader(g.titolo).tempoMediaMins) }}</strong>
                </span>
                <span v-if="parseDayHeader(g.titolo)" class="preview-mini-pill">
                  ⚡ <span class="lbl">Dens:</span> <strong>{{ parseDayHeader(g.titolo).densitaMedia }}%</strong>
                </span>
                <span v-if="parseDayHeader(g.titolo)" class="preview-mini-pill">
                  🔥 <span class="lbl">Kcal:</span> <strong>{{ parseDayHeader(g.titolo).calorie }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Bottone di Avvio Scheda Primario Gigante e Glowing -->
          <div class="mt-2 w-100">
            <v-btn
              color="orange-darken-3"
              block
              size="x-large"
              rounded="xl"
              class="font-weight-black text-none py-4 text-white glowing-btn-giant animate-pulse-slow"
              @click="navigaAiWorkouts"
              id="btn-spazio-workouts"
            >
              <v-icon size="22" class="mr-2">mdi-dumbbell</v-icon>
              APRI SCHEDA WORKOUTS 🏋️
            </v-btn>
          </div>
        </div>
      </v-card>

    </div>

    <!-- Info Coach & email di riferimento in basso, discreta e premium -->
    <div v-if="atletaSelezionato && emailRiferimento" class="text-center mt-6 opacity-60">
      <span class="text-super-caption text-muted font-weight-bold uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">
        Coach di riferimento: <span class="text-orange-lighten-2 font-weight-black">{{ emailRiferimento }}</span>
      </span>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  utente, 
  idCliente, 
  ruolo, 
  selectedAthlete, 
  selectedSheet,
  setSelectedAthlete,
  setSelectedSheet,
  getNomeAtleta,
  getEmailAtleta,
  isAtletaObsoleto,
  getSchedaSelezionataAtleta,
  getVistaDettagliAtleta,
  ORDINE_ORIGINALE_ATLETI,
  layoutEserciziGlobal
} from '../authStore.js';

const router = useRouter();

// Stato
const listaAtleti = ref([]);
const atletaSelezionato = ref(selectedAthlete.value || null);
const schedaSelezionata = ref(selectedSheet.value || null);
const listaSchede = ref([]);
const emailRiferimento = ref('');
const eserciziDellaScheda = ref([]);

// Loading states
const caricamentoAtleti = ref(true);
const caricamentoSchede = ref(false);
const caricamentoPreview = ref(false);

// Computed property per mappare la lista ID atleti a nomi reali leggibili per l'autocomplete
const itemsAtleti = computed(() => {
  // Ordina gli atleti in base alla sequenza originale del foglio Google
  const ordinati = [...listaAtleti.value].sort((a, b) => {
    const idxA = ORDINE_ORIGINALE_ATLETI.indexOf(String(a).trim());
    const idxB = ORDINE_ORIGINALE_ATLETI.indexOf(String(b).trim());
    
    // Se non trova l'ID (indice -1), lo posiziona in fondo
    const posA = idxA === -1 ? 999 : idxA;
    const posB = idxB === -1 ? 999 : idxB;
    
    return posA - posB;
  });

  return ordinati.map(id => {
    const nome = getNomeAtleta(id);
    return {
      title: nome ? `${nome} (ID: ${id})` : `Atleta ID: ${id}`,
      value: id
    };
  });
});

// Computed property per raggruppare gli esercizi per giorno in anteprima
const giorniPreview = computed(() => {
  if (eserciziDellaScheda.value.length === 0) return [];
  
  const giorniMap = {};
  eserciziDellaScheda.value.forEach(ex => {
    const giorno = (ex.des_giorno || '').trim().toUpperCase();
    if (!giorno) return;
    
    const rigaGiorno = parseInt(ex.num_riga_giorno) || 0;
    if (rigaGiorno === 0) {
      if (!giorniMap[giorno]) {
        giorniMap[giorno] = { giorno, titolo: ex.des_esercizio, ins_esercizio: ex.ins_esercizio, exercises: [] };
      } else {
        giorniMap[giorno].titolo = ex.des_esercizio;
        giorniMap[giorno].ins_esercizio = ex.ins_esercizio;
      }
    } else {
      if (!giorniMap[giorno]) {
        giorniMap[giorno] = { giorno, titolo: `Allenamento Giorno ${giorno}`, ins_esercizio: '', exercises: [] };
      }
      giorniMap[giorno].exercises.push(ex);
    }
  });
  
  return Object.values(giorniMap).sort((a, b) => a.giorno.localeCompare(b.giorno));
});

// Carica la lista degli atleti all'avvio
const caricaDatiAtleti = async () => {
  caricamentoAtleti.value = true;
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }

    if (ruolo.value === 'atleta') {
      atletaSelezionato.value = idCliente.value;
      setSelectedAthlete(idCliente.value);
    }

    if (atletaSelezionato.value) {
      await caricaSchedeAtleta();
      await caricaEmailRiferimento();
    }
  } catch (error) {
    console.error("Errore caricamento atleti:", error);
  } finally {
    caricamentoAtleti.value = false;
  }
};

onMounted(() => {
  caricaDatiAtleti();
});

// Carica tutti i numeri scheda univoci dell'atleta
const caricaSchedeAtleta = async () => {
  if (!atletaSelezionato.value) return;
  
  caricamentoSchede.value = true;
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const querySnapshot = await getDocs(q);
    
    let schedeSet = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.num_scheda) {
        schedeSet.add(data.num_scheda.trim());
      }
    });

    listaSchede.value = Array.from(schedeSet).sort((a, b) => Number(a) - Number(b));

    if (selectedSheet.value && listaSchede.value.includes(selectedSheet.value)) {
      schedaSelezionata.value = selectedSheet.value;
    } else if (listaSchede.value.length > 0) {
      schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
      setSelectedSheet(schedaSelezionata.value);
    } else {
      schedaSelezionata.value = null;
      setSelectedSheet('');
    }
  } catch (error) {
    console.warn("Errore caricamento schede atleta da Firestore (quota esaurita), provo da backup locale:", error);
    try {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      const filtrati = allData.filter(
        item => String(item.ID_cliente) === String(atletaSelezionato.value)
      );
      let schedeSet = new Set();
      filtrati.forEach((item) => {
        if (item.num_scheda) {
          schedeSet.add(item.num_scheda.trim());
        }
      });
      listaSchede.value = Array.from(schedeSet).sort((a, b) => Number(a) - Number(b));
      
      if (selectedSheet.value && listaSchede.value.includes(selectedSheet.value)) {
        schedaSelezionata.value = selectedSheet.value;
      } else if (listaSchede.value.length > 0) {
        schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
        setSelectedSheet(schedaSelezionata.value);
      } else {
        schedaSelezionata.value = null;
        setSelectedSheet('');
      }
    } catch (errBackup) {
      console.error("Errore nel caricamento del backup locale in Ricerca:", errBackup);
    }
  } finally {
    caricamentoSchede.value = false;
  }
};

// Carica la preview di tutti gli allenamenti della scheda per lo Step 3
const caricaPreviewScheda = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value) {
    eserciziDellaScheda.value = [];
    return;
  }
  
  caricamentoPreview.value = true;
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value),
      where('num_scheda', '==', String(schedaSelezionata.value))
    );
    const snap = await getDocs(q);
    let temp = [];
    snap.forEach(doc => {
      temp.push({ id: doc.id, ...doc.data() });
    });
    
    if (temp.length === 0) {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      temp = allData.filter(
        item => String(item.ID_cliente) === String(atletaSelezionato.value) &&
        String(item.num_scheda) === String(schedaSelezionata.value)
      );
    }
    eserciziDellaScheda.value = temp;
  } catch (err) {
    console.warn("Errore caricamento preview, carico da backup:", err);
    try {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      eserciziDellaScheda.value = allData.filter(
        item => String(item.ID_cliente) === String(atletaSelezionato.value) &&
        String(item.num_scheda) === String(schedaSelezionata.value)
      );
    } catch (e) {}
  } finally {
    caricamentoPreview.value = false;
  }
};

// Carica email di riferimento da UTENTI
const caricaEmailRiferimento = async () => {
  if (!atletaSelezionato.value) return;
  emailRiferimento.value = '';

  try {
    const q = query(
      collection(db, 'UTENTI'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      emailRiferimento.value = doc.data().email || '';
    });

    if (!emailRiferimento.value && atletaSelezionato.value === idCliente.value) {
      emailRiferimento.value = utente.value?.email || '';
    }
  } catch (error) {
    console.error("Errore caricamento email ref:", error);
  }
};

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Gestisce il cambio dell'atleta
const gestisciCambioAtleta = async () => {
  vibraTattile(12);
  if (!atletaSelezionato.value) {
    setSelectedAthlete('');
    setSelectedSheet('');
    schedaSelezionata.value = null;
    listaSchede.value = [];
    eserciziDellaScheda.value = [];
    return;
  }

  setSelectedAthlete(atletaSelezionato.value);
  setSelectedSheet(''); // Azzera la scheda salvata dal precedente atleta
  schedaSelezionata.value = null;
  await caricaSchedeAtleta();
  await caricaEmailRiferimento();
};

// Seleziona la scheda più alta (ULTIMA SCHEDA)
const selezionaUltimaScheda = () => {
  if (listaSchede.value.length === 0) return;
  
  vibraTattile(15);
  const ultima = listaSchede.value[listaSchede.value.length - 1];
  schedaSelezionata.value = ultima;
  setSelectedSheet(ultima);
};

// Gestisce la scelta manuale della scheda nella griglia
const gestisciSelezioneScheda = (scheda) => {
  vibraTattile(12);
  schedaSelezionata.value = { value: scheda }.value;
  setSelectedSheet(scheda);
};

// Mappa l'anagrafica muscolare per visualizzare focus premium
const getFocusGiorno = (exercises) => {
  const sectors = exercises.map(e => e.des_settore).filter(Boolean);
  if (sectors.length === 0) return 'Corpo Libero';
  
  const counts = {};
  sectors.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  
  const humanize = (s) => {
    const map = {
      'PectoralSternal': 'Petto Basso',
      'BackGeneral': 'Dorsali',
      'Obliques': 'Obliqui',
      'Ischiocrurali': 'Femorali',
      'PectoralClavicular': 'Petto Alto',
      'DeltoidPosterior': 'Deltoidi Post.',
      'Triceps': 'Tricipiti',
      'Quadriceps': 'Quadricipiti',
      'GluteusMaximus': 'Glutei',
      'DeltoidLateral': 'Deltoidi Lat.',
      'DeltoidAnterior': 'Deltoidi Ant.',
      'LatissimusDorsi': 'Dorsali Lat',
      'Biceps': 'Bicipiti'
    };
    return map[s] || s;
  };
  
  return sorted.slice(0, 2).map(humanize).join(' & ');
};

// Monitora se cambia la combinazione atleta/scheda per ricaricare l'anteprima Step 3
watch([atletaSelezionato, schedaSelezionata], () => {
  caricaPreviewScheda();
}, { immediate: true });

// Navigazione
const navigaAiWorkouts = () => {
  vibraTattile(15);
  router.push('/');
};

const formattaDurataLeggibile = (totalMins) => {
  if (!totalMins) return '0 min';
  const mins = Math.round(totalMins);
  if (mins < 60) {
    return `${mins} min`;
  } else {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMins}m`;
  }
};

// Intestazione & Volume Parser
const parseDayHeader = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /WO\s+([A-D])\s*\[\s*([^%]+?)\s+(\d+)\s*%\s*\/\s*([^%]+?)\s+(\d+)\s*%\s*\]\s*K:\s*(\d+)/i;
  const match = cleanStr.match(regex);
  if (match) {
    const giorno = match[1];
    const t1 = match[2];
    const d1 = parseInt(match[3]);
    const t2 = match[4];
    const d2 = parseInt(match[5]);
    const calorie = parseInt(match[6]);
    
    const parseTimeToMins = (tStr) => {
      if (!tStr) return 0;
      let clean = tStr.toLowerCase().trim();
      if (clean.includes('h')) {
        const parts = clean.split('h');
        const hours = parseInt(parts[0], 10) || 0;
        const minsStr = parts[1] ? parts[1].replace('min', '').replace('m', '').trim() : '';
        const mins = parseInt(minsStr, 10) || 0;
        return hours * 60 + mins;
      }
      clean = clean.replace('min', '').replace('m', '').trim();
      if (clean.includes(':')) {
        const parts = clean.split(':');
        if (parts.length === 2) {
          return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
        }
      }
      return parseInt(clean, 10) || 0;
    };
    
    const m1 = parseTimeToMins(t1);
    const m2 = parseTimeToMins(t2);
    const mediaMins = Math.round((m1 + m2) / 2);
    
    const densitaMedia = Math.round((d1 + d2) / 2);
    
    return {
      giorno,
      tempo1Raw: t1.trim(),
      tempo1Mins: m1,
      densita1: d1,
      tempo2Raw: t2.trim(),
      tempo2Mins: m2,
      densita2: d2,
      tempoMediaMins: mediaMins,
      densitaMedia,
      calorie
    };
  }
  return null;
};

const parseVolumes = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /VOL:\s*([\d,.]+)\s+A:\s*([\d,.]+)\s+B:\s*([\d,.]+)(?:\s+C:\s*([\d,.]+))?/i;
  const match = cleanStr.match(regex);
  if (match) {
    const cleanFloat = (valStr) => {
      if (!valStr) return 0;
      const clean = valStr.replace(',', '.');
      return parseFloat(clean) || 0;
    };
    return {
      totale: cleanFloat(match[1]),
      alta: cleanFloat(match[2]),
      bassa: cleanFloat(match[3]),
      centrale: match[4] ? cleanFloat(match[4]) : 0
    };
  }
  return null;
};
</script>

<style scoped>
.max-width-container {
  max-width: 600px;
  margin: 0 auto;
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

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.text-slate-dark {
  color: #f8fafc !important;
}

.text-slate {
  color: #cbd5e1 !important;
}

.text-muted {
  color: #94a3b8 !important;
}

.uppercase {
  text-transform: uppercase;
}

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-slate-900-op {
  background: rgba(15, 23, 42, 0.5) !important;
}

.bg-orange-darken-3-op {
  background: rgba(249, 115, 22, 0.08) !important;
}

.border-orange {
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.premium-header {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.profile-avatar {
  border: 2px solid rgba(249, 115, 22, 0.4);
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.2);
}

.premium-card {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Stile Step guided badges */
.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.9rem;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.4);
}

/* Stato bloccato per i passaggi successivi */
.locked-card-state {
  opacity: 0.38;
  pointer-events: none;
  filter: grayscale(80%) blur(0.5px);
  transform: scale(0.98);
}

.locked-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: rgba(15, 23, 42, 0.15);
  border-radius: inherit;
}

/* Selettore schede a scorrimento orizzontale compatto */
.scheda-scroll-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 8px 2px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
.scheda-scroll-container::-webkit-scrollbar {
  height: 4px;
}
.scheda-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.3);
  border-radius: 4px;
}
.scheda-scroll-btn {
  flex: 0 0 auto;
  width: 58px;
  height: 52px;
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  font-weight: 800;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.scheda-scroll-btn:hover {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}
.scheda-scroll-btn:active {
  transform: scale(0.95);
}
.scheda-scroll-btn-active {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  border-color: #f97316 !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.35) !important;
}
.scheda-num {
  font-size: 1.15rem;
  line-height: 1.1;
  font-weight: 900;
}
.scheda-lbl {
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.75;
}

/* Micro pillole per l'anteprima Step 3 */
.preview-mini-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 0.62rem;
  font-weight: 600;
  color: #cbd5e1;
  gap: 3px;
  white-space: nowrap;
}
.preview-mini-pill .lbl {
  color: #94a3b8;
  font-weight: 500;
}
.preview-mini-pill strong {
  color: #f8fafc;
}

/* Anteprime dei giorni */
.preview-day-card {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 4px solid #ea580c !important;
  transition: background-color 0.2s ease;
}

.preview-day-card:hover {
  background: rgba(255, 255, 255, 0.03) !important;
}

.day-letter-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #fb923c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.95rem;
}

/* Glowing buttons */
.glowing-btn {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
  transition: all 0.2s ease !important;
}

.glowing-btn-giant {
  box-shadow: 0 8px 30px -4px rgba(249, 115, 22, 0.5) !important;
  transition: all 0.25s ease !important;
}

.glowing-btn-giant:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px -2px rgba(249, 115, 22, 0.65) !important;
}

.glowing-btn-giant:active {
  transform: scale(0.97);
}

/* Autocomplete field custom styling */
.search-autocomplete-field :deep(.v-field) {
  background: rgba(0, 0, 0, 0.2) !important;
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite alternate;
}

@keyframes pulse-slow {
  0% {
    box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.35) !important;
  }
  100% {
    box-shadow: 0 8px 30px 2px rgba(249, 115, 22, 0.5) !important;
  }
}
</style>