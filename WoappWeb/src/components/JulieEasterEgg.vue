<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="520"
    persistent
    transition="dialog-bottom-transition"
    class="julie-easter-egg-dialog"
  >
    <v-card class="julie-card-content rounded-xl border-orange-glow overflow-hidden elevation-24">
      <!-- HEADER DIALOG: SOLO ICONE FUOCO E DONNA CHE BALLA -->
      <div class="julie-header d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center gap-2">
          <v-icon color="orange-accent-3" class="animate-bounce-slow" size="24">mdi-fire</v-icon>
          <span style="font-size: 1.4rem; line-height: 1;">💃</span>
          <v-icon color="orange-accent-3" class="animate-bounce-slow" size="24">mdi-fire</v-icon>
        </div>
        <v-btn
          icon
          variant="text"
          color="white"
          size="small"
          class="rounded-circle btn-close-hover"
          @click="chiudiModal"
          title="Chiudi"
        >
          <v-icon size="22">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- CONTAINER VIDEO -->
      <div class="video-wrapper position-relative bg-black d-flex align-center justify-center">
        <video
          ref="videoRef"
          src="https://visualgabri.github.io/Esercizi/Altri/julieBallaProFiamma.mp4"
          autoplay
          loop
          playsinline
          :muted="isMuted"
          class="julie-video-player"
          @loadeddata="onVideoLoaded"
        ></video>

        <!-- OVERLAY BOTTONE AUDIO FLOATING -->
        <div class="audio-control-overlay position-absolute">
          <v-btn
            size="large"
            rounded="pill"
            :color="isMuted ? 'orange-darken-3' : 'green-accent-4'"
            class="audio-toggle-btn elevation-12 font-weight-bold px-5"
            @click="toggleAudio"
          >
            <v-icon size="24" class="mr-1.5">
              {{ isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}
            </v-icon>
            <span>{{ isMuted ? '🔊' : '🎵' }}</span>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const dialogVisible = ref(false);
const isMuted = ref(true);
const videoRef = ref(null);

watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      isMuted.value = true;
      nextTick(() => {
        if (videoRef.value) {
          videoRef.value.muted = true;
          videoRef.value.play().catch((err) => {
            console.warn('Autoplay video non riuscito:', err);
          });
        }
      });
    } else {
      stopVideo();
    }
  },
  { immediate: true }
);

watch(dialogVisible, (val) => {
  emit('update:modelValue', val);
  if (!val) {
    stopVideo();
  }
});

const toggleAudio = () => {
  isMuted.value = !isMuted.value;
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value;
    if (!isMuted.value) {
      videoRef.value.play().catch((e) => console.warn('Errore riproduzione audio:', e));
    }
  }
};

const onVideoLoaded = () => {
  if (videoRef.value && dialogVisible.value) {
    videoRef.value.muted = isMuted.value;
    videoRef.value.play().catch(() => {});
  }
};

const stopVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
  }
  isMuted.value = true;
};

const chiudiModal = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
.julie-card-content {
  background: rgba(15, 23, 42, 0.96) !important;
  backdrop-filter: blur(16px);
  border: 1.5px solid rgba(249, 115, 22, 0.4) !important;
  box-shadow: 0 0 35px rgba(249, 115, 22, 0.25) !important;
}

.julie-header {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border-bottom: 1px solid rgba(249, 115, 22, 0.2);
}

.btn-close-hover:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.video-wrapper {
  min-height: 320px;
  max-height: 70vh;
  width: 100%;
  overflow: hidden;
}

.julie-video-player {
  width: 100%;
  max-height: 68vh;
  object-fit: contain;
  display: block;
}

.audio-control-overlay {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.audio-toggle-btn {
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
  transition: all 0.25s ease;
}

.audio-toggle-btn:hover {
  transform: scale(1.05);
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-slow {
  animation: bounceSlow 2s infinite ease-in-out;
}
</style>
