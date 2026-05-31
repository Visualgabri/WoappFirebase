<template>
  <v-app>
    <!-- BARRA SUPERIORE PREMIUM (Mostrata solo se l'utente è autenticato) -->
    <v-app-bar
      v-if="utente"
      flat
      color="transparent"
      class="card-glass border-bottom px-4"
      density="comfortable"
    >
      <v-app-bar-title class="font-weight-black text-slate-dark">
        <v-icon color="orange-darken-3" class="mr-2">mdi-dumbbell</v-icon>
        Woapp<span class="orange-dot">.</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Profilo utente e Logout -->
      <div class="d-none d-sm-flex flex-column align-end mr-4">
        <span class="text-caption font-weight-bold text-slate-dark">{{ utente.email }}</span>
        <span class="text-caption text-orange-darken-4 font-weight-bold">
          {{ ruolo === 'coach' ? 'Coach 📋' : 'Atleta #' + idCliente }}
        </span>
      </div>

      <v-btn
        icon
        color="red-darken-2"
        variant="tonal"
        size="small"
        class="rounded-lg"
        @click="eseguiLogout"
        id="btn-logout"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    
    <!-- L'AREA CENTRALE: Qui appariranno le pagine del Router -->
    <v-main style="background-color: transparent; padding-bottom: 80px;">
      <router-view></router-view>
    </v-main>

    <!-- LA BARRA INFERIORE DI NAVIGAZIONE (Mostrata solo se l'utente è autenticato) -->
    <v-bottom-navigation
      v-if="utente"
      grow
      color="orange-darken-3"
      fixed
      elevation="4"
      class="premium-nav"
    >
      <v-btn to="/login" id="nav-atleta" @click="vibraTattile(8)">
        <v-icon>mdi-account</v-icon>
        <span>Atleta</span>
      </v-btn>

      <v-btn to="/ricerca" id="nav-ricerca" @click="vibraTattile(8)">
        <v-icon>mdi-magnify</v-icon>
        <span>Ricerca Wo</span>
      </v-btn>

      <v-btn to="/home" id="nav-home" @click="vibraTattile(8)">
        <v-icon>mdi-home</v-icon>
        <span>Home Wo</span>
      </v-btn>

      <v-btn to="/" id="nav-workouts" @click="vibraTattile(8)">
        <v-icon>mdi-dumbbell</v-icon>
        <span>WORKOUTS</span>
      </v-btn>

      <v-btn to="/grafici" id="nav-grafici" @click="vibraTattile(8)">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Grafici</span>
      </v-btn>

    </v-bottom-navigation>

    <!-- WIDGET TIMER DI RECUPERO GLOBALE FLOATING (Premium UX) -->
    <v-fade-transition>
      <v-card
        v-if="activeTimer"
        class="global-timer-pill card-glass rounded-xl pa-3 d-flex align-center justify-space-between elevation-4"
      >
        <div class="d-flex align-center min-width-0 flex-grow-1 mr-3">
          <!-- Circular Progress Circle -->
          <v-progress-circular
            :model-value="(activeTimer.remainingSeconds / activeTimer.totalSeconds) * 100"
            color="orange-darken-3"
            size="36"
            width="3.5"
            class="mr-3"
          >
            <span class="text-caption font-weight-black text-slate-dark" style="font-size: 0.65rem;">
              {{ activeTimer.remainingSeconds }}s
            </span>
          </v-progress-circular>

          <div class="text-left min-width-0">
            <div class="text-super-caption text-orange-lighten-2 uppercase font-weight-black" style="font-size: 0.6rem;">
              Recupero Attivo
            </div>
            <div class="text-caption font-weight-bold text-slate-dark text-truncate" style="max-width: 160px;">
              {{ activeTimer.label }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center">
          <!-- Play / Pause Button -->
          <v-btn
            icon
            variant="text"
            color="orange-lighten-1"
            size="small"
            class="mr-1"
            @click="activeTimer.isPaused ? riprendiTimer() : mettiInPausaTimer()"
          >
            <v-icon size="20">
              {{ activeTimer.isPaused ? 'mdi-play-circle-outline' : 'mdi-pause-circle-outline' }}
            </v-icon>
          </v-btn>

          <!-- Stop / Close Button -->
          <v-btn
            icon
            variant="text"
            color="red-lighten-2"
            size="small"
            @click="cancellaTimer()"
          >
            <v-icon size="20">mdi-stop-circle-outline</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-fade-transition>

  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { utente, idCliente, ruolo, logout, activeTimer, pauseGlobalTimer, resumeGlobalTimer, stopGlobalTimer } from './authStore.js';

const router = useRouter();

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 8) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const mettiInPausaTimer = () => {
  vibraTattile(10);
  pauseGlobalTimer();
};

const riprendiTimer = () => {
  vibraTattile(15);
  resumeGlobalTimer();
};

const cancellaTimer = () => {
  vibraTattile(20);
  stopGlobalTimer();
};

const eseguiLogout = async () => {
  try {
    vibraTattile(12);
    await logout();
    router.push({ name: 'Login' });
  } catch (error) {
    console.error("Errore durante il logout:", error);
  }
};
</script>

<style scoped>
.text-slate-dark {
  color: #f8fafc !important;
}

.orange-dot {
  color: #f97316;
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.premium-nav {
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Transizioni fluide sui pulsanti della barra inferiore */
.v-bottom-navigation .v-btn {
  transition: transform 0.2s ease;
}

.v-bottom-navigation .v-btn--active {
  transform: translateY(-2px);
}

/* Timer Pill Floating Premium */
.global-timer-pill {
  position: fixed;
  bottom: 86px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 400px;
  z-index: 999;
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
  background: rgba(15, 23, 42, 0.8) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(249, 115, 22, 0.15) !important;
  animation: pulse-border 2s infinite alternate;
}

@keyframes pulse-border {
  0% {
    border-color: rgba(249, 115, 22, 0.2) !important;
  }
  100% {
    border-color: rgba(249, 115, 22, 0.5) !important;
  }
}
</style>