<template>
  <transition name="pwa-banner-slide">
    <div
      v-if="shouldShowBanner"
      class="pwa-floating-banner"
      :class="{ 'has-bottom-nav': isUserLoggedIn }"
    >
      <div class="pwa-banner-content d-flex align-center justify-space-between pa-2.5 rounded-xl border">
        <!-- Logo e Testo -->
        <div class="d-flex align-center min-width-0 mr-2" @click="apriInstallazione" style="cursor: pointer;">
          <v-avatar size="34" class="mr-2.5 rounded-lg flex-shrink-0 elevation-1" style="background: #030712; border: 1.5px solid var(--theme-primary, #ea580c);">
            <v-img src="/logo.png" alt="Logo" />
          </v-avatar>
          <div class="text-left min-width-0">
            <div class="font-weight-black text-slate-dark text-truncate leading-tight" style="font-size: 0.78rem;">
              {{ deviceInfo.isIOS ? 'Aggiungi alla schermata Home' : 'Installa FlexCoach' }}
            </div>
            <div class="text-caption text-muted text-truncate" style="font-size: 0.65rem; line-height: 1.2;">
              {{ deviceInfo.isIOS ? 'Per usarla come app a schermo intero' : 'Tocca per installare l\'app nativa' }}
            </div>
          </div>
        </div>

        <!-- Azioni: Bottone Installa / Guida + Chiudi -->
        <div class="d-flex align-center gap-1.5 flex-shrink-0">
          <v-btn
            size="x-small"
            color="orange-darken-3"
            variant="flat"
            class="font-weight-black text-white text-none rounded-lg px-2.5 py-1 elevation-2"
            style="font-size: 0.68rem; height: 26px;"
            @click="apriInstallazione"
            id="btn-pwa-banner-action"
          >
            <v-icon size="12" class="mr-1">
              {{ deviceInfo.isIOS ? 'mdi-apple' : 'mdi-download' }}
            </v-icon>
            {{ deviceInfo.isIOS ? 'Come fare' : 'Installa' }}
          </v-btn>

          <v-btn
            icon
            variant="text"
            width="24"
            height="24"
            class="text-muted ml-0.5"
            @click="chiudiBanner"
            title="Non mostrare per 7 giorni"
            id="btn-pwa-banner-close"
          >
            <v-icon size="15">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { usePwaInstall } from '../utils/usePwaInstall.js';

const props = defineProps({
  isUserLoggedIn: {
    type: Boolean,
    default: false
  }
});

const {
  shouldShowBanner,
  deviceInfo,
  dismissBanner,
  openInstallGuide,
  triggerInstall
} = usePwaInstall();

function apriInstallazione() {
  if (deviceInfo.isAndroid) {
    triggerInstall();
  } else {
    openInstallGuide();
  }
}

function chiudiBanner() {
  dismissBanner();
}
</script>

<style scoped>
.pwa-floating-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 16px;
  z-index: 1005;
  max-width: 460px;
  margin: 0 auto;
  pointer-events: auto;
}

/* Se l'utente è loggato, c'è la barra di navigazione inferiore a 64px + safe area */
.pwa-floating-banner.has-bottom-nav {
  bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}

.pwa-banner-content {
  background: var(--card-bg-glass, rgba(15, 23, 42, 0.94));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-color: rgba(234, 88, 12, 0.35) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(234, 88, 12, 0.15);
}

.pwa-banner-slide-enter-active,
.pwa-banner-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.pwa-banner-slide-enter-from,
.pwa-banner-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
