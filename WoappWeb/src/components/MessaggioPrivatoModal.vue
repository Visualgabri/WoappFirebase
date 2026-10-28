<template>
  <v-dialog
    v-model="mostraMessaggioPrivatoModal"
    max-width="540"
    scrollable
    transition="dialog-bottom-transition"
    class="dialog-messaggio-privato"
  >
    <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden d-flex flex-column" :style="{ backdropFilter: 'blur(25px)', background: '#0b111e !important', border: tipoInvio === 'guida_pesi' ? '1.5px solid rgba(245, 158, 11, 0.45) !important' : '1.5px solid rgba(168, 85, 247, 0.45) !important' }">
      
      <!-- 1. HEADER COMPATTO -->
      <div 
        class="pa-3.5 d-flex align-center justify-space-between flex-shrink-0 border-bottom"
        :style="{ background: tipoInvio === 'guida_pesi' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(147, 51, 234, 0.12)' }"
      >
        <div class="d-flex align-center gap-2.5 min-width-0">
          <v-avatar 
            size="36" 
            :color="tipoInvio === 'guida_pesi' ? 'amber-darken-4' : 'purple-darken-3'" 
            class="elevation-2 flex-shrink-0"
          >
            <v-icon :color="tipoInvio === 'guida_pesi' ? 'amber-lighten-2' : 'purple-lighten-2'" size="20">
              {{ tipoInvio === 'guida_pesi' ? 'mdi-lightbulb-on' : 'mdi-comment-text-outline' }}
            </v-icon>
          </v-avatar>
          <div class="text-truncate">
            <h2 class="text-subtitle-1 font-weight-black text-white text-truncate mb-0" style="font-size: 0.95rem;">
              {{ tipoInvio === 'guida_pesi' ? 'Consiglio del Coach: Guida Pesi' : 'Messaggio Privato Coach' }}
            </h2>
            <div class="text-caption font-weight-bold" :class="tipoInvio === 'guida_pesi' ? 'text-amber-lighten-3' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
              Notifica diretta e istantanea all'atleta
            </div>
          </div>
        </div>

        <div class="d-flex align-center gap-1">
          <v-chip 
            :color="tipoInvio === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'" 
            size="x-small" 
            variant="flat" 
            class="font-weight-black text-white" 
            style="font-size: 0.58rem; height: 20px;"
          >
            COACH
          </v-chip>
          <v-btn icon variant="text" size="small" color="grey" @click="chiudi">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 2. BODY SCROLLABILE -->
      <v-card-text class="pa-4 text-left" style="max-height: 72vh; overflow-y: auto;">
        
        <!-- SELEZIONE TIPO COMUNICAZIONE (MESSAGGIO vs GUIDA PESI) -->
        <div class="mb-3">
          <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.64rem;">
            Tipologia Comunicazione
          </span>
          <v-btn-toggle
            v-model="tipoInvio"
            mandatory
            density="compact"
            rounded="lg"
            class="w-100 card-glass border overflow-hidden"
            style="height: 32px;"
          >
            <v-btn 
              value="messaggio" 
              class="font-weight-black flex-grow-1 text-none"
              :class="tipoInvio === 'messaggio' ? 'bg-purple-darken-2 text-white' : 'text-slate-dark'"
              style="font-size: 0.68rem;"
            >
              <v-icon start size="14">mdi-comment-text-outline</v-icon>
              Messaggio / Promemoria
            </v-btn>
            <v-btn 
              value="guida_pesi" 
              class="font-weight-black flex-grow-1 text-none"
              :class="tipoInvio === 'guida_pesi' ? 'bg-amber-darken-3 text-white' : 'text-slate-dark'"
              style="font-size: 0.68rem;"
            >
              <v-icon start size="14">mdi-lightbulb-on</v-icon>
              💡 Guida Pesi Coach
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- SELEZIONE ATLETA DESTINATARIO -->
        <div class="mb-3 pa-2.5 rounded-xl border-soft" style="background: rgba(255, 255, 255, 0.03);">
          <div class="d-flex align-center justify-space-between mb-1.5">
            <span class="text-caption font-weight-bold d-flex align-center gap-1" :class="tipoInvio === 'guida_pesi' ? 'text-amber-lighten-2' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
              <v-icon size="13">mdi-account-circle</v-icon>
              Atleta Destinatario
            </span>
            <span v-if="atletaSelezionatoNome" class="text-super-caption font-weight-bold text-slate-light" style="font-size: 0.62rem;">
              ID #{{ targetAtletaId }}
            </span>
          </div>

          <v-select
            v-model="targetAtletaId"
            :items="listaAtletiSoloSingoli"
            item-title="title"
            item-value="value"
            placeholder="Seleziona atleta..."
            variant="outlined"
            density="compact"
            :color="tipoInvio === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            class="custom-compact-field"
            hide-details
          >
            <template v-slot:selection="{ item }">
              <div class="d-flex align-center gap-2">
                <v-avatar size="20" :color="tipoInvio === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'" class="text-white font-weight-bold" style="font-size: 0.55rem;">
                  {{ item.raw?.iniziali || 'AT' }}
                </v-avatar>
                <span class="font-weight-bold text-white text-truncate" style="font-size: 0.78rem;">
                  {{ item.raw?.nome || item.title }}
                </span>
              </div>
            </template>
          </v-select>
        </div>

        <!-- AMBIENTE 1: MESSAGGIO PRIVATO CON MODELLI RAPIDI -->
        <template v-if="tipoInvio === 'messaggio'">
          <!-- Modelli Rapidi Promemoria -->
          <div class="mb-3">
            <span class="text-caption font-weight-bold text-purple-lighten-2 d-block mb-1.5" style="font-size: 0.65rem;">
              Modelli Rapidi Precompilati
            </span>
            <div class="d-flex align-center flex-wrap gap-1.5">
              <!-- 1. Promemoria Chiusura Settimana -->
              <v-btn
                size="x-small"
                variant="tonal"
                color="green-accent-3"
                rounded="pill"
                class="font-weight-black text-none px-2.5"
                style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(74, 222, 128, 0.4); background: rgba(34, 197, 94, 0.12);"
                @click="applicaTemplateChiusura"
              >
                <v-icon start size="13" color="green-accent-3">mdi-check-circle-outline</v-icon>
                ✅ Chiudi Settimana
              </v-btn>

              <!-- 2. Promemoria Gradimenti & Feeling -->
              <v-btn
                size="x-small"
                variant="tonal"
                color="amber-accent-3"
                rounded="pill"
                class="font-weight-black text-none px-2.5"
                style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(251, 191, 36, 0.4); background: rgba(245, 158, 11, 0.12);"
                @click="applicaTemplateGradimenti"
              >
                <v-icon start size="13" color="amber-accent-2">mdi-star-shooting</v-icon>
                ⭐ Gradimenti & Feeling
              </v-btn>

              <!-- 3. Messaggio Libero -->
              <v-btn
                size="x-small"
                variant="tonal"
                color="purple-accent-2"
                rounded="pill"
                class="font-weight-black text-none px-2.5"
                style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.12);"
                @click="applicaTemplateLibero"
              >
                <v-icon start size="13" color="purple-accent-2">mdi-pencil-outline</v-icon>
                ✍️ Testo Libero
              </v-btn>
            </div>
          </div>

          <!-- Oggetto -->
          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-bold text-purple-lighten-2 d-block mb-1" style="font-size: 0.65rem;">
              Oggetto Messaggio
            </span>
            <v-text-field
              v-model="oggettoMessaggio"
              placeholder="Es: 💬 Messaggio dal Coach"
              variant="outlined"
              density="compact"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-text-field>
          </div>

          <!-- Testo Messaggio -->
          <div class="mb-3 text-left">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption font-weight-bold text-purple-lighten-2" style="font-size: 0.65rem;">
                Testo del Messaggio
              </span>
              <span class="text-super-caption text-slate-dark" style="font-size: 0.60rem;">
                {{ testoMessaggio.length }} caratteri
              </span>
            </div>
            <v-textarea
              v-model="testoMessaggio"
              placeholder="Scrivi qui il messaggio per l'atleta..."
              variant="outlined"
              density="compact"
              rows="4"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-textarea>
          </div>
        </template>

        <!-- AMBIENTE 2: GUIDA SCRITTURA PESI COACH -->
        <template v-else-if="tipoInvio === 'guida_pesi'">
          <div class="pa-3 rounded-xl mb-3 text-left" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.28);">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-1.5">
                <v-icon color="amber-accent-3" size="18">mdi-lightbulb-on</v-icon>
                <span class="text-caption font-weight-black text-amber-lighten-2 text-uppercase" style="font-size: 0.70rem;">
                  Guida Scrittura Pesi
                </span>
              </div>
              <v-btn
                variant="text"
                size="x-small"
                color="amber-accent-2"
                class="px-1 text-none font-weight-bold"
                style="height: 22px; font-size: 0.62rem;"
                @click="mostraAnteprimaGuida = true"
              >
                <v-icon size="13" class="mr-1">mdi-eye-outline</v-icon>
                Anteprima Grafica
              </v-btn>
            </div>
            
            <p class="text-caption text-slate-300 mb-2" style="font-size: 0.72rem; line-height: 1.4;">
              L'atleta <strong>{{ atletaSelezionatoNome || 'selezionato' }}</strong> riceverà un pop-up interattivo in tempo reale con le istruzioni illustrate per la corretta scrittura dei pesi nelle caselle:
            </p>

            <div class="d-flex flex-wrap gap-1 mb-1">
              <v-chip size="x-small" color="amber-darken-4" variant="flat" class="text-white font-mono font-weight-bold" style="font-size: 0.60rem; height: 20px;">
                Ramping: 45 45 47,5 50
              </v-chip>
              <v-chip size="x-small" color="sky-darken-4" variant="flat" class="text-white font-mono font-weight-bold" style="font-size: 0.60rem; height: 20px;">
                Reps: 42,5x11r
              </v-chip>
            </div>
          </div>

          <!-- Nota Facoltativa del Coach -->
          <div class="mb-3 text-left">
            <span class="text-caption font-weight-bold text-amber-lighten-2 d-block mb-1" style="font-size: 0.65rem;">
              Nota Personale Facoltativa del Coach (mostrata in cima al pop-up)
            </span>
            <v-textarea
              v-model="notaCoachGuida"
              placeholder="Es: Ciao! Guarda bene come inserire i pesi prima di cominciare il workout di oggi..."
              variant="outlined"
              density="compact"
              rows="3"
              color="amber-darken-3"
              class="custom-compact-field"
              hide-details
            ></v-textarea>
          </div>
        </template>

        <!-- Feedback Alert in caso di errore -->
        <v-alert
          v-if="messaggioErrore"
          type="error"
          variant="tonal"
          density="compact"
          class="rounded-lg text-caption font-weight-bold mb-2"
          closable
          @click:close="messaggioErrore = ''"
        >
          {{ messaggioErrore }}
        </v-alert>

        <!-- Feedback di Successo -->
        <v-alert
          v-if="messaggioSuccesso"
          type="success"
          variant="tonal"
          density="compact"
          class="rounded-lg text-caption font-weight-bold mb-2"
        >
          {{ messaggioSuccesso }}
        </v-alert>
      </v-card-text>

      <!-- 3. ACTIONS DI INVIO -->
      <div class="pa-3 border-top flex-shrink-0" :style="{ background: '#0b111e' }">
        <div class="d-flex align-center gap-2">
          
          <!-- Pulsante WhatsApp (solo per tipo messaggio) -->
          <v-btn
            v-if="tipoInvio === 'messaggio'"
            variant="tonal"
            color="green-accent-3"
            size="small"
            rounded="lg"
            class="font-weight-black text-none flex-shrink-0"
            style="height: 36px; font-size: 0.72rem; border: 1px solid rgba(74, 222, 128, 0.4);"
            @click="inviaWhatsApp"
            :disabled="!targetAtletaId || !testoMessaggio"
            title="Invia testo via WhatsApp all'atleta"
          >
            <v-icon start size="16" color="green-accent-3">mdi-whatsapp</v-icon>
            WhatsApp
          </v-btn>

          <!-- Pulsante Invio Notifica In-App Real-Time -->
          <v-btn
            :color="tipoInvio === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-black text-none text-white flex-grow-1 elevation-2"
            :style="{ 
              height: '36px', 
              fontSize: '0.74rem',
              background: tipoInvio === 'guida_pesi' 
                ? 'linear-gradient(135deg, #d97706, #f59e0b) !important' 
                : 'linear-gradient(135deg, #7e22ce, #a855f7) !important' 
            }"
            @click="eseguiInvio"
            :loading="inInvio"
            :disabled="!targetAtletaId || (tipoInvio === 'messaggio' && !testoMessaggio.trim())"
          >
            <v-icon start size="16">
              {{ tipoInvio === 'guida_pesi' ? 'mdi-send' : 'mdi-send-circle-outline' }}
            </v-icon>
            {{ tipoInvio === 'guida_pesi' 
                ? `INVIA GUIDA A ${atletaSelezionatoNomeUpper || 'ATLETA'}` 
                : `INVIA NOTIFICA A ${atletaSelezionatoNomeUpper || 'ATLETA'}` 
            }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Dialog Anteprima Guida Pesi (Coach Preview) -->
    <v-dialog v-model="mostraAnteprimaGuida" max-width="480">
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: #0b111e !important; border: 1.5px solid rgba(245, 158, 11, 0.45) !important;">
        <div class="pa-4 pb-2.5 d-flex align-center justify-space-between bg-slate-900 border-bottom">
          <div class="d-flex align-center gap-2">
            <v-avatar size="32" color="amber-darken-4" class="elevation-2">
              <v-icon color="amber-lighten-2" size="20">mdi-lightbulb-on</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-black text-white" style="line-height: 1.2;">
                Consiglio del Coach
              </div>
              <div class="text-super-caption text-amber-lighten-3 font-weight-bold" style="font-size: 0.65rem;">
                COME SCRIVERE I PESI NELLE CASELLE
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraAnteprimaGuida = false"></v-btn>
        </div>

        <v-card-text class="pa-4 text-left" style="max-height: 70vh; overflow-y: auto;">
          <div v-if="notaCoachGuida?.trim()" class="pa-2.5 rounded-xl mb-3 text-amber-lighten-2 border-soft" style="background: rgba(245, 158, 11, 0.12); font-size: 0.82rem; line-height: 1.4;">
            <div class="d-flex align-center gap-1 mb-1 font-weight-black text-amber-accent-2" style="font-size: 0.70rem;">
              <v-icon size="14">mdi-message-text</v-icon>
              <span>NOTA DEL COACH:</span>
            </div>
            {{ notaCoachGuida }}
          </div>

          <div class="pa-3 rounded-xl mb-3 text-slate-200" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.84rem; line-height: 1.45;">
            Scrivi i pesi di tutte le serie <strong>separati da uno spazio</strong>, puoi anche andare a capo, tanto le caselle di testo sono intelligenti.
          </div>

          <div class="pa-3 rounded-xl mb-3" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.28);">
            <div class="d-flex align-center gap-1.5 mb-1.5">
              <v-icon color="amber-accent-3" size="18">mdi-arrow-decision-outline</v-icon>
              <span class="text-caption font-weight-black text-amber-lighten-2 text-uppercase" style="letter-spacing: 0.03em;">
                Esempio 1 — Ramping (es. un 4x9)
              </span>
            </div>
            <div class="pa-2 rounded-lg font-mono font-weight-black text-amber-lighten-3 text-center mb-2 tracking-wider" style="background: rgba(0, 0, 0, 0.5); border: 1px dashed rgba(245, 158, 11, 0.4); font-size: 0.95rem;">
              45 45 47,5 50
            </div>
            <p class="text-caption text-slate-300 mb-0" style="font-size: 0.78rem; line-height: 1.4;">
              Così il sistema capisce che hai fatto un ramping e userà il peso maggiore come riferimento per la week successiva.
            </p>
          </div>

          <div class="pa-3 rounded-xl mb-2" style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.28);">
            <div class="d-flex align-center gap-1.5 mb-1.5">
              <v-icon color="sky-lighten-2" size="18">mdi-numeric-positive-1</v-icon>
              <span class="text-caption font-weight-black text-sky-lighten-2 text-uppercase" style="letter-spacing: 0.03em;">
                Esempio 2 — Più Reps (stesso peso, +2 reps)
              </span>
            </div>
            <div class="pa-2 rounded-lg font-mono font-weight-black text-sky-lighten-3 text-center mb-2 tracking-wider" style="background: rgba(0, 0, 0, 0.5); border: 1px dashed rgba(56, 189, 248, 0.4); font-size: 0.95rem;">
              42,5x11r
            </div>
            <p class="text-caption text-slate-300 mb-0" style="font-size: 0.78rem; line-height: 1.4;">
              Scrivi <strong>"42,5x11r"</strong> se fai ripetizioni in più rispetto a quelle prescritte per tenerne conto nella progressione.
            </p>
          </div>
        </v-card-text>

        <div class="pa-3 border-top bg-slate-900">
          <v-btn
            variant="flat"
            color="amber-darken-3"
            block
            class="font-weight-black text-none text-white rounded-xl"
            style="background: linear-gradient(135deg, #d97706, #f59e0b) !important; height: 38px; font-size: 0.80rem;"
            @click="mostraAnteprimaGuida = false"
          >
            Chiudi Anteprima
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import {
  mostraMessaggioPrivatoModal,
  messaggioPrivatoTargetAtletaId,
  messaggioPrivatoTipoIniziale,
  messaggioPrivatoTemplateIniziale,
  chiudiMessaggioPrivatoModal,
  inviaNotificaDeploy,
  getNomeAtleta,
  isAtletaAttivo,
  ORDINE_ORIGINALE_ATLETI,
  MAPPA_CLIENTI,
  MAPPA_CLIENTI_DINAMICI
} from '../authStore.js';

// Stato locale form
const tipoInvio = ref('messaggio'); // 'messaggio' | 'guida_pesi'
const targetAtletaId = ref('');
const oggettoMessaggio = ref('💬 Messaggio dal Coach');
const testoMessaggio = ref('');
const notaCoachGuida = ref('');
const inInvio = ref(false);
const messaggioErrore = ref('');
const messaggioSuccesso = ref('');
const mostraAnteprimaGuida = ref(false);

// Lista atleti per la select
const listaAtleti = ref([]);

const caricaListaAtleti = async () => {
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
  } catch (err) {
    console.warn("Errore caricamento lista atleti in MessaggioPrivatoModal:", err);
  }
};

onMounted(() => {
  caricaListaAtleti();
});

// Computed lista atleti filtrata per singoli e attivi
const listaAtletiSoloSingoli = computed(() => {
  const idsSet = new Set([
    ...(listaAtleti.value || []),
    ...(ORDINE_ORIGINALE_ATLETI || []),
    ...Object.keys(MAPPA_CLIENTI || {}),
    ...Object.keys(MAPPA_CLIENTI_DINAMICI.value || {})
  ]);

  const ordinati = Array.from(idsSet)
    .map(id => String(id).trim())
    .filter(id => id && isAtletaAttivo(id))
    .sort((a, b) => {
      const idxA = ORDINE_ORIGINALE_ATLETI ? ORDINE_ORIGINALE_ATLETI.indexOf(a) : -1;
      const idxB = ORDINE_ORIGINALE_ATLETI ? ORDINE_ORIGINALE_ATLETI.indexOf(b) : -1;
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      if (posA !== posB) return posA - posB;
      return a.localeCompare(b, undefined, { numeric: true });
    });

  return ordinati.map(id => {
    const nome = getNomeAtleta(id) || `Atleta #${id}`;
    const parts = nome.trim().split(' ');
    const iniziali = parts.length >= 2 
      ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
      : (nome.substring(0, 2) || 'AT').toUpperCase();
    return {
      title: `${nome} (ID: ${id})`,
      value: String(id),
      nome,
      iniziali
    };
  });
});

// Helper per nome atleta selezionato
const atletaSelezionatoNome = computed(() => {
  if (!targetAtletaId.value) return '';
  return getNomeAtleta(targetAtletaId.value) || `Atleta #${targetAtletaId.value}`;
});

const atletaSelezionatoNomeUpper = computed(() => {
  const nome = atletaSelezionatoNome.value;
  return nome ? nome.toUpperCase() : '';
});

const atletaSelezionatoPrimoNome = computed(() => {
  const raw = atletaSelezionatoNome.value;
  if (!raw) return 'Atleta';
  const primo = raw.trim().split(' ')[0];
  return primo.charAt(0).toUpperCase() + primo.slice(1).toLowerCase();
});

// Template rapidi
const applicaTemplateChiusura = () => {
  oggettoMessaggio.value = '✅ Promemoria: Chiudi il tuo Workout';
  const nome = atletaSelezionatoPrimoNome.value;
  const saluto = nome ? `Ciao ${nome}!` : 'Ciao!';
  testoMessaggio.value = `${saluto} Ricordati di chiudere il workout quando lo hai completato: entra nel tab Workout e metti la spunta sulla settimana completata premendo 'Completa Giorno' in fondo alla scheda (oppure dal pulsante rapido Play ⚡). In questo modo i tuoi progressi saranno sempre registrati e aggiornati!`;
};

const applicaTemplateGradimenti = () => {
  oggettoMessaggio.value = '⭐ Promemoria Gradimenti & Feeling';
  const nome = atletaSelezionatoPrimoNome.value;
  const saluto = nome ? `Ciao ${nome}! ` : '';
  testoMessaggio.value = `${saluto}Ricordati di inserire i gradimenti e il feeling per gli esercizi svolti! Trovi la lista rapida direttamente nella Home oppure puoi inserire i voti in fondo a ciascun esercizio.`;
};

const applicaTemplateLibero = () => {
  oggettoMessaggio.value = '💬 Messaggio dal Coach';
  testoMessaggio.value = '';
};

// Sincronizzazione all'apertura del modale
watch(mostraMessaggioPrivatoModal, (visibile) => {
  if (visibile) {
    messaggioErrore.value = '';
    messaggioSuccesso.value = '';

    // Imposta tipo (messaggio vs guida_pesi)
    tipoInvio.value = messaggioPrivatoTipoIniziale.value || 'messaggio';

    // Imposta atleta target
    if (messaggioPrivatoTargetAtletaId.value) {
      targetAtletaId.value = String(messaggioPrivatoTargetAtletaId.value);
    } else if (!targetAtletaId.value && listaAtletiSoloSingoli.value.length > 0) {
      targetAtletaId.value = String(listaAtletiSoloSingoli.value[0].value);
    }

    // Imposta eventuale template
    const tpl = messaggioPrivatoTemplateIniziale.value || 'libero';
    if (tipoInvio.value === 'messaggio') {
      if (tpl === 'chiusura_settimana') {
        applicaTemplateChiusura();
      } else if (tpl === 'gradimenti') {
        applicaTemplateGradimenti();
      } else {
        applicaTemplateLibero();
      }
    } else {
      notaCoachGuida.value = '';
    }
  }
});

// Se cambia l'atleta mentre il template di chiusura o gradimenti è selezionato, aggiorna il saluto
watch(targetAtletaId, (nuovoId) => {
  if (!nuovoId || tipoInvio.value !== 'messaggio' || !testoMessaggio.value) return;
  const nome = atletaSelezionatoPrimoNome.value;
  const saluto = nome ? `Ciao ${nome}!` : 'Ciao!';
  if (testoMessaggio.value.includes('settimana completata') && testoMessaggio.value.includes('Ricordati di chiudere')) {
    testoMessaggio.value = testoMessaggio.value.replace(/^Ciao.*?!/, saluto);
  } else if (testoMessaggio.value.includes('gradimenti') && testoMessaggio.value.includes('feeling')) {
    testoMessaggio.value = testoMessaggio.value.replace(/^Ciao.*?!/, `${saluto} `);
  }
});

// Invio WhatsApp
const inviaWhatsApp = () => {
  if (!testoMessaggio.value?.trim()) return;
  const url = `https://wa.me/?text=${encodeURIComponent(testoMessaggio.value.trim())}`;
  window.open(url, '_blank');
};

// Invio Notifica In-App
const eseguiInvio = async () => {
  if (!targetAtletaId.value) {
    messaggioErrore.value = "Seleziona un atleta destinatario.";
    return;
  }

  try {
    inInvio.value = true;
    messaggioErrore.value = '';

    const isGuida = tipoInvio.value === 'guida_pesi';
    const targetId = String(targetAtletaId.value);

    let azione = null;
    if (!isGuida) {
      const msgLower = (testoMessaggio.value || '').toLowerCase();
      const objLower = (oggettoMessaggio.value || '').toLowerCase();
      if (msgLower.includes('gradiment') || objLower.includes('gradiment')) {
        azione = 'apri_gradimenti';
      } else if (msgLower.includes('chiudere il workout') || msgLower.includes('settimana completata') || objLower.includes('chius')) {
        azione = 'apri_workouts';
      }
    }

    const payload = {
      tipo: isGuida ? 'guida_pesi' : 'messaggio',
      titolo: isGuida ? '💡 Consiglio del Coach' : (oggettoMessaggio.value?.trim() || '💬 Messaggio dal Coach'),
      message_general: isGuida ? 'Come scrivere i pesi nelle caselle' : testoMessaggio.value.trim(),
      target_atleta_id: targetId,
      notes_per_athlete: {},
      azione: azione
    };

    if (isGuida && notaCoachGuida.value?.trim()) {
      payload.notes_per_athlete[targetId] = notaCoachGuida.value.trim();
    }

    await inviaNotificaDeploy(payload);

    messaggioSuccesso.value = isGuida 
      ? `💡 Guida Pesi inviata in tempo reale a ${atletaSelezionatoNome.value}!`
      : `💬 Messaggio inviato in tempo reale a ${atletaSelezionatoNome.value}!`;

    setTimeout(() => {
      chiudi();
    }, 1200);

  } catch (err) {
    console.error("Errore invio messaggio privato:", err);
    messaggioErrore.value = "Errore durante l'invio: " + (err.message || 'Verifica la connessione');
  } finally {
    inInvio.value = false;
  }
};

const chiudi = () => {
  chiudiMessaggioPrivatoModal();
};
</script>

<style scoped>
.custom-compact-field :deep(.v-field__input) {
  min-height: 32px !important;
  font-size: 0.78rem !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

.custom-compact-field :deep(.v-field) {
  border-radius: 10px !important;
}
</style>
