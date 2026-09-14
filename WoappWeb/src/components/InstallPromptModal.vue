<template>
  <v-dialog
    v-model="showGuideModal"
    max-width="520"
    class="pwa-install-dialog"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card 
      class="rounded-2xl border overflow-hidden pwa-modal-card"
      :style="{
        background: 'var(--card-bg-glass, rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--card-border, rgba(255, 255, 255, 0.12))'
      }"
    >
      <!-- Header della Finestra -->
      <v-card-title 
        class="d-flex align-center justify-space-between pa-4 border-bottom"
        :style="{ background: 'var(--card-bg-dark, #0f172a)' }"
      >
        <div class="d-flex align-center min-width-0">
          <v-avatar size="38" class="mr-3 rounded-xl elevation-2 flex-shrink-0" style="background: #030712; border: 1.5px solid var(--theme-primary, #ea580c);">
            <v-img src="/logo.png" alt="FlexCoach Logo" />
          </v-avatar>
          <div class="text-left min-width-0">
            <div class="font-weight-black text-slate-dark text-truncate leading-tight" style="font-size: 0.95rem; letter-spacing: -0.01em;">
              Installa FlexCoach
            </div>
            <div class="text-caption text-muted text-truncate font-weight-medium" style="font-size: 0.7rem;">
              Icona su Schermata Home
            </div>
          </div>
        </div>

        <v-btn
          icon
          variant="text"
          width="32"
          height="32"
          color="grey"
          @click="chiudi"
          id="btn-close-pwa-modal"
        >
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Selettore Piattaforma (iPhone / Android) -->
      <div class="px-4 pt-3 pb-1">
        <v-btn-toggle
          v-model="activeTab"
          mandatory
          density="compact"
          rounded="lg"
          class="w-100 border pwa-tab-toggle"
          style="height: 34px; background: rgba(0,0,0,0.25);"
        >
          <v-btn 
            value="ios" 
            class="font-weight-bold flex-grow-1 text-none"
            :class="{ 'bg-theme-primary text-white': activeTab === 'ios' }"
            style="font-size: 0.75rem;"
          >
            <v-icon size="15" class="mr-1.5">mdi-apple</v-icon>
            iPhone / iPad
          </v-btn>
          <v-btn 
            value="android" 
            class="font-weight-bold flex-grow-1 text-none"
            :class="{ 'bg-theme-primary text-white': activeTab === 'android' }"
            style="font-size: 0.75rem;"
          >
            <v-icon size="15" class="mr-1.5">mdi-android</v-icon>
            Android
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Contenuto scorrevole -->
      <v-card-text class="pa-4 text-left">
        
        <!-- ======================= GUIDA IPHONE (iOS) ======================= -->
        <div v-if="activeTab === 'ios'" class="animate-fade-in">
          <!-- Avviso speciale se utente è su Chrome iOS o in-app browser -->
          <v-alert
            v-if="deviceInfo.isChromeIOS"
            type="warning"
            variant="tonal"
            density="compact"
            class="rounded-xl mb-3 text-caption font-weight-medium"
            style="font-size: 0.72rem; line-height: 1.35;"
          >
            <span class="font-weight-bold">Stai usando Chrome su iOS:</span> Per aggiungere l'icona alla schermata Home, apri questo link in <strong>Safari</strong> toccando Condividi ➔ "Apri in Safari".
          </v-alert>

          <div class="mb-3 pa-3 rounded-xl border text-slate-dark" style="background: rgba(234, 88, 12, 0.08); border-color: rgba(234, 88, 12, 0.25) !important;">
            <div class="d-flex align-start">
              <span class="mr-2" style="font-size: 1.1rem;">💡</span>
              <div class="text-caption font-weight-medium leading-snug" style="font-size: 0.74rem;">
                Apple non permette l'installazione automatica in 1 clic. Segui questi <strong>3 semplici passaggi su Safari</strong>:
              </div>
            </div>
          </div>

          <!-- STEP 1 -->
          <div class="step-card pa-3 mb-2.5 rounded-xl border d-flex align-center">
            <div class="step-number mr-3">1</div>
            <div class="flex-grow-1 min-width-0 pr-2">
              <div class="text-body-2 font-weight-black text-slate-dark leading-tight mb-0.5" style="font-size: 0.82rem;">
                Tocca "Condividi"
              </div>
              <div class="text-caption text-muted leading-tight" style="font-size: 0.7rem;">
                Nella barra in basso di Safari (il quadrato con la freccia in alto).
              </div>
            </div>
            <!-- Icona iOS Share SVG autentica -->
            <div class="ios-icon-box flex-shrink-0" title="Icona Condividi iOS">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="step-card pa-3 mb-2.5 rounded-xl border d-flex align-center">
            <div class="step-number mr-3">2</div>
            <div class="flex-grow-1 min-width-0 pr-2">
              <div class="text-body-2 font-weight-black text-slate-dark leading-tight mb-0.5" style="font-size: 0.82rem;">
                "Aggiungi a schermata Home"
              </div>
              <div class="text-caption text-muted leading-tight" style="font-size: 0.7rem;">
                Scorri le opzioni verso il basso e tocca questa voce con l'icona <strong>+</strong>.
              </div>
            </div>
            <!-- Icona iOS Add to Home SVG autentica -->
            <div class="ios-icon-box flex-shrink-0" title="Aggiungi a Home">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
          </div>

          <!-- STEP 3 -->
          <div class="step-card pa-3 mb-3 rounded-xl border d-flex align-center">
            <div class="step-number mr-3">3</div>
            <div class="flex-grow-1 min-width-0 pr-2">
              <div class="text-body-2 font-weight-black text-slate-dark leading-tight mb-0.5" style="font-size: 0.82rem;">
                Tocca "Aggiungi" in alto a destra
              </div>
              <div class="text-caption text-muted leading-tight" style="font-size: 0.7rem;">
                L'icona di FlexCoach apparirà tra le tue app come un'app nativa a tutto schermo!
              </div>
            </div>
            <div class="ios-icon-box ios-icon-check flex-shrink-0">
              <v-icon size="20" color="green-accent-3">mdi-check-bold</v-icon>
            </div>
          </div>

          <!-- Indicatore animato verso il basso (pulsante Safari) -->
          <div v-if="deviceInfo.isIOS" class="safari-down-pointer pa-2 rounded-xl text-center">
            <div class="pointer-arrow-animation">
              <v-icon color="primary" size="20">mdi-arrow-down-bold</v-icon>
            </div>
            <span class="text-super-caption font-weight-bold text-slate-dark d-block" style="font-size: 0.68rem;">
              Troverai l'icona Condividi <span class="d-inline-block ios-share-inline">⎋</span> nella barra in fondo allo schermo
            </span>
          </div>
        </div>

        <!-- ======================= GUIDA ANDROID ======================= -->
        <div v-else class="animate-fade-in">
          <!-- Vantaggi PWA -->
          <div class="android-perks pa-3 rounded-xl border mb-3 text-slate-dark" style="background: rgba(37, 99, 235, 0.07); border-color: rgba(37, 99, 235, 0.25) !important;">
            <div class="font-weight-black text-body-2 mb-2 d-flex align-center" style="color: #60a5fa; font-size: 0.82rem;">
              <v-icon size="16" class="mr-1.5" color="blue">mdi-lightning-bolt</v-icon>
              Esperienza Nativa al 100%
            </div>
            <ul class="pl-4 text-caption leading-relaxed font-weight-medium text-muted" style="font-size: 0.72rem; list-style-type: disc;">
              <li>Si apre all'istante senza la barra dell'indirizzo del browser.</li>
              <li>Funziona a schermo intero e consuma meno batteria.</li>
              <li>Accesso rapido alla tua scheda con un solo tocco dall'icona.</li>
            </ul>
          </div>

          <!-- Se il prompt nativo è pronto (1 Clic) -->
          <div v-if="canInstallAndroid" class="text-center py-2">
            <v-btn
              block
              size="large"
              color="orange-darken-3"
              class="rounded-xl font-weight-black text-white text-none shadow-lg glowing-btn py-3"
              @click="eseguiInstallazioneAndroid"
              id="btn-trigger-android-pwa-install"
            >
              <v-icon size="20" class="mr-2">mdi-download-circle-outline</v-icon>
              Installa FlexCoach Ora (1 Clic)
            </v-btn>
            <div class="text-super-caption text-muted mt-2" style="font-size: 0.65rem;">
              Si aprirà la finestra di conferma del tuo telefono.
            </div>
          </div>

          <!-- Se il prompt non è intercettato (es. browser Firefox o menu 3 puntini) -->
          <div v-else>
            <div class="text-caption font-weight-bold text-slate-dark mb-2" style="font-size: 0.75rem;">
              Se il pulsante automatico non risponde:
            </div>
            <div class="step-card pa-3 mb-2 rounded-xl border d-flex align-center">
              <div class="step-number mr-3">1</div>
              <div class="flex-grow-1 min-width-0">
                <div class="text-body-2 font-weight-black text-slate-dark leading-tight" style="font-size: 0.8rem;">
                  Tocca i 3 puntini ⋮ in alto a destra
                </div>
                <div class="text-caption text-muted leading-tight" style="font-size: 0.68rem;">
                  Nel menu principale di Google Chrome o del tuo browser.
                </div>
              </div>
            </div>
            <div class="step-card pa-3 rounded-xl border d-flex align-center">
              <div class="step-number mr-3">2</div>
              <div class="flex-grow-1 min-width-0">
                <div class="text-body-2 font-weight-black text-slate-dark leading-tight" style="font-size: 0.8rem;">
                  Seleziona "Installa app" o "Aggiungi a Home"
                </div>
                <div class="text-caption text-muted leading-tight" style="font-size: 0.68rem;">
                  Tocca "Aggiungi" per confermare l'installazione.
                </div>
              </div>
            </div>
          </div>
        </div>

      </v-card-text>

      <!-- Footer con opzioni di chiusura -->
      <v-card-actions 
        class="pa-3 border-top justify-space-between" 
        :style="{ background: 'var(--card-bg-dark, #0f172a)' }"
      >
        <v-btn
          variant="text"
          size="small"
          class="text-caption text-muted text-none px-2"
          style="font-size: 0.7rem;"
          @click="congedaPerUnaSettimana"
        >
          Non mostrare per 7 giorni
        </v-btn>

        <v-btn
          variant="flat"
          color="orange-darken-3"
          size="small"
          class="rounded-lg font-weight-bold text-white text-none px-4"
          style="font-size: 0.75rem;"
          @click="chiudi"
        >
          Ho capito
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { usePwaInstall } from '../utils/usePwaInstall.js';

const {
  showGuideModal,
  canInstallAndroid,
  deviceInfo,
  dismissBanner,
  triggerInstall,
  closeInstallGuide
} = usePwaInstall();

// Tab attiva predefinita in base al sistema operativo del dispositivo
const activeTab = ref('ios');

onMounted(() => {
  if (deviceInfo.isAndroid) {
    activeTab.value = 'android';
  } else {
    activeTab.value = 'ios';
  }
});

// Sincronizza tab se cambia stato o dispositivo
watch(
  () => showGuideModal.value,
  (aperto) => {
    if (aperto) {
      if (deviceInfo.isAndroid) {
        activeTab.value = 'android';
      } else {
        activeTab.value = 'ios';
      }
    }
  }
);

function chiudi() {
  closeInstallGuide();
}

function congedaPerUnaSettimana() {
  dismissBanner();
  closeInstallGuide();
}

async function eseguiInstallazioneAndroid() {
  await triggerInstall();
}
</script>

<style scoped>
.pwa-install-dialog {
  z-index: 999999 !important;
}

.pwa-modal-card {
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6) !important;
}

.border-bottom {
  border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
}

.border-top {
  border-top: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
}

.step-card {
  background: var(--card-bg-glass, rgba(255, 255, 255, 0.04));
  border-color: var(--card-border, rgba(255, 255, 255, 0.08)) !important;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.step-card:hover {
  transform: translateY(-1px);
  border-color: rgba(234, 88, 12, 0.4) !important;
}

.step-number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--theme-primary, #ea580c);
  color: #ffffff;
  font-weight: 900;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4);
}

.ios-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(234, 88, 12, 0.12);
  color: var(--theme-primary, #ea580c);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(234, 88, 12, 0.25);
}

.ios-icon-check {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.safari-down-pointer {
  background: rgba(234, 88, 12, 0.07);
  border: 1px dashed rgba(234, 88, 12, 0.3);
}

.pointer-arrow-animation {
  animation: bounceDown 1.4s infinite ease-in-out;
}

@keyframes bounceDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

.ios-share-inline {
  font-size: 1.1em;
  vertical-align: middle;
  padding: 0 2px;
}

.glowing-btn {
  box-shadow: 0 4px 18px rgba(234, 88, 12, 0.45);
  transition: all 0.25s ease;
}

.glowing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(234, 88, 12, 0.6);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
