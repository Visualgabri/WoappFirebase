<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="520"
    persistent
    transition="dialog-bottom-transition"
    class="pannemen-easter-egg-dialog"
  >
    <v-card class="pannemen-card-content rounded-xl overflow-hidden elevation-24">
      <!-- HEADER DIALOG -->
      <div class="pannemen-header d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center gap-2">
          <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" class="animate-bounce-slow" size="24">mdi-lightning-bolt</v-icon>
          <span class="font-weight-black text-subtitle-2 text-uppercase tracking-wider" :style="{ color: 'var(--theme-primary, #f97316)' }">PANNEMEN</span>
          <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" class="animate-bounce-slow" size="24">mdi-lightning-bolt</v-icon>
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
          src="https://visualgabri.github.io/Esercizi/Altri/ChrisPannemen.mp4"
          autoplay
          loop
          playsinline
          :muted="isMuted"
          class="pannemen-video-player"
          @loadeddata="onVideoLoaded"
        ></video>

        <!-- OVERLAY BOTTONE AUDIO FLOATING -->
        <div class="audio-control-overlay position-absolute">
          <v-btn
            size="large"
            rounded="pill"
            :color="isMuted ? 'primary' : 'green-accent-4'"
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
  if (!val) {
    emit('update:modelValue', false);
    stopVideo();
  }
});

const toggleAudio = () => {
  if (videoRef.value) {
    isMuted.value = !isMuted.value;
    videoRef.value.muted = isMuted.value;
    if (videoRef.value.paused) {
      videoRef.value.play();
    }
  }
};

const stopVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    isMuted.value = true;
  }
};

const chiudiModal = () => {
  dialogVisible.value = false;
  emit('update:modelValue', false);
  stopVideo();
};

const onVideoLoaded = () => {
  if (videoRef.value && dialogVisible.value) {
    videoRef.value.play().catch(() => {});
  }
};
</script>

<style scoped>
.pannemen-card-content {
  background: #090d16 !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(var(--v-theme-primary, 249, 115, 22), 0.35) !important;
}

.pannemen-header {
  background: linear-gradient(180deg, rgba(20, 24, 36, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.video-wrapper {
  width: 100%;
  min-height: 480px;
  max-height: 80vh;
  overflow: hidden;
  background: #000;
}

.pannemen-video-player {
  width: 100%;
  height: auto;
  max-height: 75vh;
  object-fit: contain;
  display: block;
}

.audio-control-overlay {
  bottom: 24px;
  z-index: 10;
}

.audio-toggle-btn {
  letter-spacing: 0.5px;
  text-transform: none;
  backdrop-filter: blur(8px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-toggle-btn:hover {
  transform: scale(1.06);
}

.btn-close-hover {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-close-hover:hover {
  transform: rotate(90deg);
  background-color: rgba(255, 255, 255, 0.15) !important;
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce-slow {
  animation: bounceSlow 1.8s infinite ease-in-out;
}
</style>
