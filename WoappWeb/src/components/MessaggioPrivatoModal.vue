<template>
  <v-dialog
    v-model="mostraMessaggioPrivatoModal"
    max-width="540"
    scrollable
    transition="dialog-bottom-transition"
    class="dialog-messaggio-privato"
  >
    <v-card 
      class="card-glass-dark rounded-2xl border-soft overflow-hidden d-flex flex-column" 
      :style="{ 
        backdropFilter: 'blur(25px)', 
        background: '#0b111e !important', 
        border: modelloAttivo === 'guida_pesi' ? '1.5px solid rgba(245, 158, 11, 0.45) !important' : '1.5px solid rgba(168, 85, 247, 0.45) !important' 
      }"
    >
      
      <!-- 1. HEADER UNIFICATO -->
      <div 
        class="pa-3.5 d-flex align-center justify-space-between flex-shrink-0 border-bottom"
        :style="{ background: modelloAttivo === 'guida_pesi' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(147, 51, 234, 0.12)' }"
      >
        <div class="d-flex align-center gap-2.5 min-width-0">
          <v-avatar 
            size="36" 
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-4' : 'purple-darken-3'" 
            class="elevation-2 flex-shrink-0"
          >
            <v-icon :color="modelloAttivo === 'guida_pesi' ? 'amber-lighten-2' : 'purple-lighten-2'" size="20">
              {{ modelloAttivo === 'guida_pesi' ? 'mdi-lightbulb-on' : (targetAtletaId === 'tutti' ? 'mdi-bullhorn-outline' : 'mdi-comment-text-outline') }}
            </v-icon>
          </v-avatar>
          <div class="text-truncate">
            <h2 class="text-subtitle-1 font-weight-black text-white text-truncate mb-0" style="font-size: 0.95rem;">
              {{ modelloAttivo === 'guida_pesi' 
                  ? 'Consiglio del Coach: Guida Pesi' 
                  : (targetAtletaId === 'tutti' ? 'Comunicazione a Tutti gli Atleti' : (atletaSelezionatoNome ? `Comunicazione per ${atletaSelezionatoNome}` : 'Comunicazione Coach')) }}
            </h2>
            <div class="text-caption font-weight-bold" :class="modelloAttivo === 'guida_pesi' ? 'text-amber-lighten-3' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
              {{ targetAtletaId === 'tutti' ? 'Notifica in tempo reale per tutti gli atleti' : 'Notifica in tempo reale per l\'atleta' }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center gap-1">
          <v-chip 
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : (targetAtletaId === 'tutti' ? 'indigo-darken-3' : 'purple-darken-2')" 
            size="x-small" 
            variant="flat" 
            class="font-weight-black text-white" 
            style="font-size: 0.58rem; height: 20px;"
          >
            {{ targetAtletaId === 'tutti' ? 'A TUTTI' : 'COACH' }}
          </v-chip>
          <v-btn icon variant="text" size="small" color="grey" @click="chiudi">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 2. BODY SCROLLABILE UNICO (SENZA TAB RIPETITIVI) -->
      <v-card-text class="pa-4 text-left" style="max-height: 72vh; overflow-y: auto;">
        
        <!-- SELEZIONE DESTINATARIO (CON OPZIONE "A TUTTI") -->
        <div class="mb-3 pa-2.5 rounded-xl border-soft" style="background: rgba(255, 255, 255, 0.03);">
          <div class="d-flex align-center justify-space-between mb-1.5">
            <span class="text-caption font-weight-bold d-flex align-center gap-1" :class="modelloAttivo === 'guida_pesi' ? 'text-amber-lighten-2' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
              <v-icon size="13">mdi-account-group</v-icon>
              Destinatario
            </span>
            <span v-if="targetAtletaId !== 'tutti' && atletaSelezionatoNome" class="text-super-caption font-weight-bold text-slate-light" style="font-size: 0.62rem;">
              ID #{{ targetAtletaId }}
            </span>
            <v-chip v-else color="purple-darken-3" size="x-small" variant="flat" class="text-white font-weight-bold" style="font-size: 0.56rem; height: 16px;">
              BROADCAST
            </v-chip>
          </div>

          <v-select
            v-model="targetAtletaId"
            :items="listaDestinatari"
            item-title="title"
            item-value="value"
            placeholder="Seleziona destinatario..."
            variant="outlined"
            density="compact"
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            class="custom-compact-field"
            hide-details
          >
            <template v-slot:selection="{ item }">
              <div class="d-flex align-center gap-2">
                <v-avatar 
                  size="20" 
                  :color="item.raw?.value === 'tutti' ? 'amber-darken-4' : (modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2')" 
                  class="text-white font-weight-bold" 
                  style="font-size: 0.55rem;"
                >
                  <v-icon v-if="item.raw?.value === 'tutti'" size="12">mdi-account-multiple</v-icon>
                  <span v-else>{{ item.raw?.iniziali || 'AT' }}</span>
                </v-avatar>
                <span class="font-weight-bold text-white text-truncate" style="font-size: 0.78rem;">
                  {{ item.raw?.title || item.title }}
                </span>
              </div>
            </template>
          </v-select>
        </div>

        <!-- MODELLI RAPIDI PRECOMPILATI (PILLOLE 1-CLICK COMPRESA "GUIDA PESI") -->
        <div class="mb-3">
          <span class="text-caption font-weight-bold text-slate-light d-block mb-1.5" style="font-size: 0.65rem;">
            Modelli Rapidi Precompilati
          </span>
          <div class="d-flex align-center flex-wrap gap-1.5">
            <!-- 1. Chiudi Settimana -->
            <v-btn
              size="x-small"
              :variant="modelloAttivo === 'chiusura_settimana' ? 'flat' : 'tonal'"
              color="green-accent-3"
              rounded="pill"
              class="font-weight-black text-none px-2.5"
              :class="{ 'text-black': modelloAttivo === 'chiusura_settimana' }"
              style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(74, 222, 128, 0.4);"
              @click="selezionaModello('chiusura_settimana')"
            >
              <v-icon start size="13" :color="modelloAttivo === 'chiusura_settimana' ? 'black' : 'green-accent-3'">mdi-check-circle-outline</v-icon>
              Chiudi Settimana
            </v-btn>

            <!-- 2. Gradimenti & Feeling -->
            <v-btn
              size="x-small"
              :variant="modelloAttivo === 'gradimenti' ? 'flat' : 'tonal'"
              color="amber-accent-3"
              rounded="pill"
              class="font-weight-black text-none px-2.5"
              :class="{ 'text-black': modelloAttivo === 'gradimenti' }"
              style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(251, 191, 36, 0.4);"
              @click="selezionaModello('gradimenti')"
            >
              <v-icon start size="13" :color="modelloAttivo === 'gradimenti' ? 'black' : 'amber-accent-2'">mdi-star-shooting</v-icon>
              Gradimenti & Feeling
            </v-btn>

            <!-- 3. Guida Pesi Coach (Nuova Pillola Integrata) -->
            <v-btn
              size="x-small"
              :variant="modelloAttivo === 'guida_pesi' ? 'flat' : 'tonal'"
              color="amber-lighten-2"
              rounded="pill"
              class="font-weight-black text-none px-2.5"
              :class="{ 'text-black': modelloAttivo === 'guida_pesi' }"
              style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(245, 158, 11, 0.5);"
              @click="selezionaModello('guida_pesi')"
            >
              <v-icon start size="13" :color="modelloAttivo === 'guida_pesi' ? 'black' : 'amber-lighten-2'">mdi-lightbulb-on</v-icon>
              Guida Pesi
            </v-btn>

            <!-- 4. Testo Libero -->
            <v-btn
              size="x-small"
              :variant="modelloAttivo === 'libero' ? 'flat' : 'tonal'"
              color="purple-accent-2"
              rounded="pill"
              class="font-weight-black text-none px-2.5"
              :class="{ 'text-black': modelloAttivo === 'libero' }"
              style="font-size: 0.65rem; height: 26px; border: 1px solid rgba(168, 85, 247, 0.4);"
              @click="selezionaModello('libero')"
            >
              <v-icon start size="13" :color="modelloAttivo === 'libero' ? 'black' : 'purple-accent-2'">mdi-pencil-outline</v-icon>
              Testo Libero
            </v-btn>
          </div>
        </div>

        <!-- NOTA INFORMATIVA SULLE AZIONI CHE APPARIRANNO ALL'ATLETA -->
        <div v-if="modelloAttivo === 'gradimenti'" class="pa-2 rounded-lg mb-3 d-flex align-center gap-1.5" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25);">
          <v-icon color="amber-accent-3" size="15">mdi-information-outline</v-icon>
          <span class="text-caption text-amber-lighten-3 font-weight-bold" style="font-size: 0.68rem; line-height: 1.3;">
            All'atleta apparirà direttamente il pulsante <strong>"APRI LISTA ESERCIZI DA VOTARE"</strong> per compilare subito i propri voti.
          </span>
        </div>

        <div v-else-if="modelloAttivo === 'chiusura_settimana'" class="pa-2 rounded-lg mb-3 d-flex align-center gap-1.5" style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(74, 222, 128, 0.25);">
          <v-icon color="green-accent-3" size="15">mdi-information-outline</v-icon>
          <span class="text-caption text-green-lighten-3 font-weight-bold" style="font-size: 0.68rem; line-height: 1.3;">
            All'atleta apparirà direttamente il pulsante <strong>"VAI AL TAB WORKOUT"</strong> per completare la settimana.
          </span>
        </div>

        <!-- BOX ANTEPRIMA GRAFICA PER GUIDA PESI -->
        <div v-if="modelloAttivo === 'guida_pesi'" class="pa-3 rounded-xl mb-3 text-left" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.28);">
          <div class="d-flex align-center justify-space-between mb-1.5">
            <div class="d-flex align-center gap-1.5">
              <v-icon color="amber-accent-3" size="17">mdi-lightbulb-on</v-icon>
              <span class="text-caption font-weight-black text-amber-lighten-2 text-uppercase" style="font-size: 0.70rem;">
                Contenuto Guida Pesi
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
              Vedi Anteprima Completa
            </v-btn>
          </div>
          
          <p class="text-caption text-slate-300 mb-2" style="font-size: 0.72rem; line-height: 1.4;">
            {{ targetAtletaId === 'tutti' ? 'Tutti gli atleti riceveranno' : `L'atleta ${atletaSelezionatoNome || 'selezionato'} riceverà` }} il pop-up guidato sulle regole di scrittura carichi nelle caselle:
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

        <!-- CAMPO OGGETTO -->
        <div class="mb-2.5 text-left">
          <span class="text-caption font-weight-bold d-block mb-1" :class="modelloAttivo === 'guida_pesi' ? 'text-amber-lighten-2' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
            Oggetto Comunicazione
          </span>
          <v-text-field
            v-model="oggettoMessaggio"
            placeholder="Es: Messaggio dal Coach"
            variant="outlined"
            density="compact"
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            class="custom-compact-field"
            hide-details
          ></v-text-field>
        </div>

        <!-- CAMPO TESTO / NOTA COACH -->
        <div class="mb-3 text-left">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption font-weight-bold" :class="modelloAttivo === 'guida_pesi' ? 'text-amber-lighten-2' : 'text-purple-lighten-2'" style="font-size: 0.65rem;">
              {{ modelloAttivo === 'guida_pesi' ? 'Nota Personale Facoltativa del Coach (mostrata in testa alla guida)' : 'Testo del Messaggio' }}
            </span>
            <span class="text-super-caption text-slate-dark" style="font-size: 0.60rem;">
              {{ testoMessaggio.length }} caratteri
            </span>
          </div>
          <v-textarea
            v-model="testoMessaggio"
            :placeholder="modelloAttivo === 'guida_pesi' ? 'Es: Ciao! Guarda bene le regole per segnare i carichi prima di iniziare...' : 'Scrivi qui il messaggio per l\'atleta...'"
            variant="outlined"
            density="compact"
            :rows="modelloAttivo === 'guida_pesi' ? 2 : 4"
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            class="custom-compact-field"
            hide-details
          ></v-textarea>
        </div>

        <!-- Alert Errore -->
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

        <!-- Alert Successo -->
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
          
          <!-- Pulsante WhatsApp (abilitato solo per singolo atleta con testo messaggio) -->
          <v-btn
            v-if="modelloAttivo !== 'guida_pesi'"
            variant="tonal"
            color="green-accent-3"
            size="small"
            rounded="lg"
            class="font-weight-black text-none flex-shrink-0"
            style="height: 36px; font-size: 0.72rem; border: 1px solid rgba(74, 222, 128, 0.4);"
            @click="inviaWhatsApp"
            :disabled="targetAtletaId === 'tutti' || !testoMessaggio.trim()"
            :title="targetAtletaId === 'tutti' ? 'WhatsApp è disponibile solo selezionando un singolo atleta' : 'Invia testo su WhatsApp all\'atleta'"
          >
            <v-icon start size="16" color="green-accent-3">mdi-whatsapp</v-icon>
            WhatsApp
          </v-btn>

          <!-- Pulsante Principale Invio In-App -->
          <v-btn
            :color="modelloAttivo === 'guida_pesi' ? 'amber-darken-3' : 'purple-darken-2'"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-black text-none text-white flex-grow-1 elevation-2"
            :style="{ 
              height: '36px', 
              fontSize: '0.74rem',
              background: modelloAttivo === 'guida_pesi' 
                ? 'linear-gradient(135deg, #d97706, #f59e0b) !important' 
                : 'linear-gradient(135deg, #7e22ce, #a855f7) !important' 
            }"
            @click="eseguiInvio"
            :loading="inInvio"
            :disabled="modelloAttivo !== 'guida_pesi' && !testoMessaggio.trim()"
          >
            <v-icon start size="16">
              {{ modelloAttivo === 'guida_pesi' ? 'mdi-lightbulb-on' : 'mdi-send-circle-outline' }}
            </v-icon>
            {{ etichettaPulsanteInvio }}
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
          <div v-if="testoMessaggio?.trim() && modelloAttivo === 'guida_pesi'" class="pa-2.5 rounded-xl mb-3 text-amber-lighten-2 border-soft" style="background: rgba(245, 158, 11, 0.12); font-size: 0.82rem; line-height: 1.4;">
            <div class="d-flex align-center gap-1 mb-1 font-weight-black text-amber-accent-2" style="font-size: 0.70rem;">
              <v-icon size="14">mdi-message-text</v-icon>
              <span>NOTA DEL COACH:</span>
            </div>
            {{ testoMessaggio }}
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
  getTelefonoAtleta,
  formattaTelefonoPerWhatsApp,
  isAtletaAttivo,
  ORDINE_ORIGINALE_ATLETI,
  MAPPA_CLIENTI,
  MAPPA_CLIENTI_DINAMICI
} from '../authStore.js';

// Stato locale form
const targetAtletaId = ref('tutti');
const modelloAttivo = ref('libero'); // 'chiusura_settimana' | 'gradimenti' | 'guida_pesi' | 'libero'
const oggettoMessaggio = ref('💬 Messaggio dal Coach');
const testoMessaggio = ref('');
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

// Computed lista destinatari: In cima "👥 A TUTTI", seguito da tutti i singoli attivi
const listaDestinatari = computed(() => {
  const items = [
    {
      title: '👥 A TUTTI (Tutti gli atleti)',
      value: 'tutti',
      nome: 'A TUTTI',
      iniziali: 'ALL'
    }
  ];

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

  ordinati.forEach(id => {
    const nome = getNomeAtleta(id) || `Atleta #${id}`;
    const parts = nome.trim().split(' ');
    const iniziali = parts.length >= 2 
      ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
      : (nome.substring(0, 2) || 'AT').toUpperCase();
    items.push({
      title: `${nome} (ID: ${id})`,
      value: String(id),
      nome,
      iniziali
    });
  });

  return items;
});

// Helper per nome atleta
const atletaSelezionatoNome = computed(() => {
  if (!targetAtletaId.value || targetAtletaId.value === 'tutti') return '';
  return getNomeAtleta(targetAtletaId.value) || `Atleta #${targetAtletaId.value}`;
});

const atletaSelezionatoNomeUpper = computed(() => {
  const nome = atletaSelezionatoNome.value;
  return nome ? nome.toUpperCase() : '';
});

// Generazione del saluto: Se "tutti" -> semplice "Ciao!", se singolo -> "Ciao [Nome]!"
const generaSaluto = () => {
  if (targetAtletaId.value === 'tutti') {
    return 'Ciao!';
  }
  const raw = atletaSelezionatoNome.value;
  if (!raw) return 'Ciao!';
  const primo = raw.trim().split(' ')[0];
  const nomeCap = primo.charAt(0).toUpperCase() + primo.slice(1).toLowerCase();
  return `Ciao ${nomeCap}!`;
};

// Seleziona modello rapido
const selezionaModello = (modello) => {
  modelloAttivo.value = modello;
  const saluto = generaSaluto();

  if (modello === 'chiusura_settimana') {
    oggettoMessaggio.value = 'Promemoria: Chiudi il tuo Workout';
    testoMessaggio.value = `${saluto} Ricordati di chiudere il workout quando lo hai completato: entra nel tab Workout e metti la spunta sulla settimana completata premendo 'Completa Giorno' in fondo alla scheda (oppure dal pulsante rapido Play ⚡). In questo modo i tuoi progressi saranno sempre registrati e aggiornati!`;
  } else if (modello === 'gradimenti') {
    oggettoMessaggio.value = 'Promemoria Gradimenti & Feeling';
    testoMessaggio.value = `${saluto} Ricordati di inserire i gradimenti e il feeling per gli esercizi svolti! Trovi la lista rapida direttamente nella Home oppure puoi inserire i voti in fondo a ciascun esercizio.`;
  } else if (modello === 'guida_pesi') {
    oggettoMessaggio.value = 'Consiglio del Coach: Come scrivere i pesi';
    testoMessaggio.value = ''; // Campo opzionale per la nota personale
  } else {
    // Libero
    oggettoMessaggio.value = 'Comunicazione dal Coach';
    testoMessaggio.value = '';
  }
};

// Aggiorna dinamicamente il testo quando cambia il destinatario (tra Tutti e singolo atleta)
watch(targetAtletaId, () => {
  if (modelloAttivo.value === 'chiusura_settimana' || modelloAttivo.value === 'gradimenti') {
    const nuovoSaluto = generaSaluto();
    if (testoMessaggio.value.includes('settimana completata') && testoMessaggio.value.includes('Ricordati di chiudere')) {
      testoMessaggio.value = testoMessaggio.value.replace(/^Ciao.*?!/, nuovoSaluto);
    } else if (testoMessaggio.value.includes('gradimenti') && testoMessaggio.value.includes('feeling')) {
      testoMessaggio.value = testoMessaggio.value.replace(/^Ciao.*?!/, nuovoSaluto);
    }
  }
});

// Etichetta dinamica per il pulsante di invio
const etichettaPulsanteInvio = computed(() => {
  const isTutti = targetAtletaId.value === 'tutti';
  const isGuida = modelloAttivo.value === 'guida_pesi';

  if (isTutti) {
    return isGuida ? 'INVIA GUIDA PESI A TUTTI GLI ATLETI' : 'INVIA COMUNICAZIONE A TUTTI GLI ATLETI';
  } else {
    const nome = atletaSelezionatoNomeUpper.value || 'ATLETA';
    return isGuida ? `INVIA GUIDA A ${nome}` : `INVIA COMUNICAZIONE A ${nome}`;
  }
});

// Sincronizzazione all'apertura del modale
watch(mostraMessaggioPrivatoModal, (visibile) => {
  if (visibile) {
    messaggioErrore.value = '';
    messaggioSuccesso.value = '';

    // Imposta destinatario
    if (messaggioPrivatoTargetAtletaId.value) {
      targetAtletaId.value = String(messaggioPrivatoTargetAtletaId.value);
    } else {
      targetAtletaId.value = 'tutti';
    }

    // Imposta modello iniziale
    const tipo = messaggioPrivatoTipoIniziale.value || 'messaggio';
    const tpl = messaggioPrivatoTemplateIniziale.value || 'libero';

    if (tipo === 'guida_pesi') {
      selezionaModello('guida_pesi');
    } else if (tpl === 'chiusura_settimana') {
      selezionaModello('chiusura_settimana');
    } else if (tpl === 'gradimenti') {
      selezionaModello('gradimenti');
    } else {
      selezionaModello('libero');
    }
  }
});

// Invio WhatsApp (consentito solo su singolo atleta)
const inviaWhatsApp = () => {
  if (targetAtletaId.value === 'tutti') {
    messaggioErrore.value = "Seleziona un singolo atleta per inviare su WhatsApp.";
    return;
  }
  if (!testoMessaggio.value?.trim()) return;
  const tel = formattaTelefonoPerWhatsApp(getTelefonoAtleta(targetAtletaId.value));
  const baseUrl = tel ? `https://wa.me/${tel}` : 'https://wa.me/';
  const url = `${baseUrl}?text=${encodeURIComponent(testoMessaggio.value.trim())}`;
  window.open(url, '_blank');
};

// Invio Notifica In-App
const eseguiInvio = async () => {
  try {
    inInvio.value = true;
    messaggioErrore.value = '';

    const isGuida = modelloAttivo.value === 'guida_pesi';
    const isTutti = targetAtletaId.value === 'tutti';
    const targetId = isTutti ? null : String(targetAtletaId.value);

    // Azione che si attiverà sul dispositivo dell'atleta
    let azione = null;
    if (!isGuida) {
      if (modelloAttivo.value === 'gradimenti' || (oggettoMessaggio.value || '').toLowerCase().includes('gradiment') || (testoMessaggio.value || '').toLowerCase().includes('gradiment')) {
        azione = 'apri_gradimenti';
      } else if (modelloAttivo.value === 'chiusura_settimana' || (oggettoMessaggio.value || '').toLowerCase().includes('chius') || (testoMessaggio.value || '').toLowerCase().includes('settimana completata')) {
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

    // Se guida pesi con nota personale
    if (isGuida && testoMessaggio.value?.trim()) {
      if (targetId) {
        payload.notes_per_athlete[targetId] = testoMessaggio.value.trim();
      } else {
        // Se a tutti, la nota viene mostrata in cima alla guida
        payload.message_general = testoMessaggio.value.trim();
      }
    }

    await inviaNotificaDeploy(payload);

    if (isTutti) {
      messaggioSuccesso.value = isGuida 
        ? "💡 Guida Pesi inviata in tempo reale a tutti gli atleti!" 
        : "📢 Comunicazione inviata in tempo reale a tutti gli atleti!";
    } else {
      messaggioSuccesso.value = isGuida 
        ? `💡 Guida Pesi inviata in tempo reale a ${atletaSelezionatoNome.value}!` 
        : `📢 Comunicazione inviata in tempo reale a ${atletaSelezionatoNome.value}!`;
    }

    setTimeout(() => {
      chiudi();
    }, 1200);

  } catch (err) {
    console.error("Errore invio notifica:", err);
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
