<template>
  <div class="workout-time-picker-root">
    <!-- 1. BARRA PRINCIPALE AZIONI RAPIDE LIVE -->
    <v-row dense class="mb-3 gap-2">
      <!-- Bottone Inizio Wo -->
      <v-col cols="6" class="flex-grow-1">
        <div class="d-flex flex-column text-center">
          <v-btn
            :color="modelStart ? 'green-darken-3' : 'orange-darken-3'"
            variant="tonal"
            rounded="lg"
            class="font-weight-black text-none py-2 btn-quick-log"
            :class="{ 'btn-logged-success glow-green': !!modelStart }"
            @click="handleQuickStart"
            height="44"
          >
            <v-icon size="16" class="mr-1">
              {{ modelStart ? 'mdi-check-circle' : 'mdi-play-circle-outline' }}
            </v-icon>
            Inizio Wo
          </v-btn>
          <span
            class="text-super-caption font-weight-bold d-block mt-1.5 text-truncate px-1"
            :class="modelStart ? 'text-green-lighten-2' : 'text-muted'"
            style="font-size: 0.62rem;"
          >
            {{ modelStart ? formatFriendlyTime(modelStart) : 'Non registrato' }}
          </span>
        </div>
      </v-col>

      <!-- Bottone Fine Wo -->
      <v-col cols="6" class="flex-grow-1">
        <div class="d-flex flex-column text-center">
          <v-btn
            :color="modelEnd ? 'green-darken-3' : 'orange-darken-3'"
            variant="tonal"
            rounded="lg"
            class="font-weight-black text-none py-2 btn-quick-log"
            :class="{ 'btn-logged-success glow-green': !!modelEnd }"
            @click="handleQuickEnd"
            height="44"
            :disabled="!modelStart && !modelEnd"
          >
            <v-icon size="16" class="mr-1">
              {{ modelEnd ? 'mdi-check-circle' : 'mdi-stop-circle-outline' }}
            </v-icon>
            Fine Wo
          </v-btn>
          <span
            class="text-super-caption font-weight-bold d-block mt-1.5 text-truncate px-1"
            :class="modelEnd ? 'text-green-lighten-2' : 'text-muted'"
            style="font-size: 0.62rem;"
          >
            {{ modelEnd ? formatFriendlyTime(modelEnd) : 'Non registrato' }}
          </span>
        </div>
      </v-col>
    </v-row>

    <!-- 2. TIME RANGE SUMMARY CARD (Soluzione 2 / Entry Point) -->
    <div
      class="time-range-summary-card pa-3 rounded-xl cursor-pointer border-soft"
      :class="{ 'has-data': !!modelStart }"
      @click="openModal"
    >
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center gap-1.5 min-width-0">
          <v-icon size="16" color="orange-lighten-2">mdi-clock-time-four-outline</v-icon>
          <span class="text-caption font-weight-black text-slate-dark text-truncate">
            {{ displayDateLabel }}
          </span>
        </div>

        <v-chip
          size="x-small"
          variant="flat"
          color="orange-darken-3"
          class="font-weight-black px-2 flex-shrink-0"
          style="font-size: 0.62rem;"
        >
          ⏱️ {{ computedDurationStr }}
        </v-chip>
      </div>

      <!-- Time Interval Display -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <div class="time-badge start-badge">
            <span class="badge-label">INIZIO</span>
            <span class="badge-val">{{ formatHourOnly(modelStart) }}</span>
          </div>

          <v-icon size="14" color="grey">mdi-arrow-right</v-icon>

          <div class="time-badge end-badge">
            <span class="badge-label">FINE</span>
            <span class="badge-val">{{ modelEnd ? formatHourOnly(modelEnd) : (modelStart ? 'In corso...' : '--:--') }}</span>
          </div>
        </div>

        <!-- Edit Button Trigger -->
        <div class="edit-pill d-flex align-center px-2 py-1 rounded-lg">
          <v-icon size="13" color="orange-lighten-2" class="mr-1">mdi-tune-variant</v-icon>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black" style="font-size: 0.62rem;">
            Regola
          </span>
        </div>
      </div>

      <!-- In-Card Quick Nudges (Micro-regolazioni immediate a 1 tocco) -->
      <div v-if="modelStart" class="d-flex align-center justify-space-between mt-2 pt-2 border-top-soft" @click.stop>
        <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.58rem;">
          Micro-regolazione:
        </span>
        <div class="d-flex gap-1">
          <button class="nudge-chip" @click="nudgeMinutes(-config.stepMinutes)">
            -{{ config.stepMinutes }}m
          </button>
          <button class="nudge-chip" @click="nudgeMinutes(config.stepMinutes)">
            +{{ config.stepMinutes }}m
          </button>
          <button class="nudge-chip" @click="nudgeMinutes(15)">
            +15m
          </button>
          <button class="nudge-chip highlight" @click="applyPresetFinishedNow">
            ⚡ Adesso
          </button>
        </div>
      </div>
    </div>

    <!-- 3. BOTTOM SHEET / DIALOG DI REGOLAZIONE AVANZATA -->
    <v-dialog
      v-model="modalOpen"
      max-width="520"
      location="bottom"
      transition="dialog-bottom-transition"
      class="workout-time-dialog"
    >
      <v-card class="time-modal-card rounded-t-2xl pa-4">
        <!-- Top Drag Indicator Handle -->
        <div class="d-flex justify-center mb-2">
          <div class="modal-drag-handle"></div>
        </div>

        <!-- Modal Header -->
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-2">
            <v-avatar color="orange-darken-3" size="28">
              <v-icon size="16" color="white">mdi-timer-cog-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-black text-slate-dark" style="line-height: 1.1;">
                Registro Orario Wo
              </div>
              <div class="text-super-caption text-muted font-weight-bold" style="font-size: 0.6rem;">
                Settimana {{ week }} • Auto-salvataggio
              </div>
            </div>
          </div>

          <div class="d-flex align-center gap-1">
            <v-btn
              icon="mdi-cog-outline"
              size="x-small"
              variant="text"
              color="grey"
              @click="activeTab = 'settings'"
            ></v-btn>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="grey"
              @click="closeModal"
            ></v-btn>
          </div>
        </div>

        <!-- Date Quick Chips -->
        <div class="date-selector-row mb-3">
          <div class="d-flex align-center gap-1.5 flex-wrap">
            <button
              v-for="dOption in datePresets"
              :key="dOption.key"
              class="date-pill"
              :class="{ active: selectedDateKey === dOption.key }"
              @click="applyDatePreset(dOption)"
            >
              {{ dOption.label }}
            </button>
            
            <!-- Custom Date Picker Trigger -->
            <div class="custom-date-wrap">
              <input
                type="date"
                v-model="customDateInput"
                class="custom-date-hidden-input"
                @change="onCustomDateChange"
              />
              <button class="date-pill date-pill-custom" :class="{ active: selectedDateKey === 'custom' }">
                <v-icon size="12" class="mr-0.5">mdi-calendar</v-icon>
                {{ customDateDisplay || 'Altra data' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mode Segmented Control (Tabs) -->
        <div class="segmented-control mb-4">
          <button
            class="segment-btn"
            :class="{ active: activeTab === 'wheel' }"
            @click="switchTab('wheel')"
          >
            <v-icon size="13" class="mr-1">mdi-tune</v-icon>
            Rulli & Stepper
          </button>
          <button
            class="segment-btn"
            :class="{ active: activeTab === 'timeline' }"
            @click="switchTab('timeline')"
          >
            <v-icon size="13" class="mr-1">mdi-chart-timeline-variant</v-icon>
            Timeline
          </button>
          <button
            class="segment-btn"
            :class="{ active: activeTab === 'presets' }"
            @click="switchTab('presets')"
          >
            <v-icon size="13" class="mr-1">mdi-lightning-bolt</v-icon>
            Preset
          </button>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 1: 🎛️ RULLI & STEPPER (Soluzione 2 + Best Practices)      -->
        <!-- ============================================================= -->
        <div v-show="activeTab === 'wheel'" class="tab-content">
          <div class="d-flex align-center justify-space-between gap-3 mb-3">
            <!-- Start Time Column -->
            <div class="time-picker-box flex-1">
              <div class="box-header text-caption font-weight-black text-orange-lighten-2 uppercase">
                Inizio
              </div>

              <div class="time-digit-display my-2">
                <span class="digit-hours">{{ tempStartHourStr }}</span>
                <span class="digit-colon">:</span>
                <span class="digit-mins">{{ tempStartMinStr }}</span>
              </div>

              <!-- Steppers -->
              <div class="d-flex align-center justify-center gap-1.5 mb-2">
                <button class="stepper-btn" @click="stepStartTime(-config.stepMinutes)">
                  -{{ config.stepMinutes }}
                </button>
                <button class="stepper-btn" @click="stepStartTime(config.stepMinutes)">
                  +{{ config.stepMinutes }}
                </button>
              </div>

              <div class="d-flex justify-center">
                <button class="quick-chip-micro" @click="setStartToNow">
                  Ora
                </button>
                <button class="quick-chip-micro ml-1" @click="setStartToOneHourAgo">
                  -1h
                </button>
              </div>
            </div>

            <!-- Arrow & Duration Badge Center -->
            <div class="d-flex flex-column align-center justify-center flex-shrink-0 px-1">
              <v-icon size="18" color="orange-lighten-2" class="mb-1">mdi-arrow-right-bold</v-icon>
              <div class="duration-pill-center">
                <span class="dur-text">{{ tempDurationFormatted }}</span>
              </div>
            </div>

            <!-- End Time Column -->
            <div class="time-picker-box flex-1">
              <div class="box-header text-caption font-weight-black text-orange-lighten-2 uppercase">
                Fine
              </div>

              <div class="time-digit-display my-2">
                <span class="digit-hours">{{ tempEndHourStr }}</span>
                <span class="digit-colon">:</span>
                <span class="digit-mins">{{ tempEndMinStr }}</span>
              </div>

              <!-- Steppers -->
              <div class="d-flex align-center justify-center gap-1.5 mb-2">
                <button class="stepper-btn" @click="stepEndTime(-config.stepMinutes)">
                  -{{ config.stepMinutes }}
                </button>
                <button class="stepper-btn" @click="stepEndTime(config.stepMinutes)">
                  +{{ config.stepMinutes }}
                </button>
              </div>

              <div class="d-flex justify-center">
                <button class="quick-chip-micro highlight" @click="setEndToNow">
                  ⚡ Adesso
                </button>
              </div>
            </div>
          </div>

          <!-- Direct Duration Slider / Control Bar -->
          <div class="duration-slider-section pa-2.5 rounded-xl bg-slate-900 border-soft mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.6rem;">
                ⏱️ Regola Durata Totale:
              </span>
              <span class="text-caption text-orange-lighten-2 font-weight-black" style="font-size: 0.72rem;">
                {{ tempDurationMinutes }} minuti
              </span>
            </div>

            <div class="d-flex align-center gap-1.5">
              <button class="dur-quick-btn" @click="setDurationMinutes(30)">30m</button>
              <button class="dur-quick-btn" @click="setDurationMinutes(45)">45m</button>
              <button class="dur-quick-btn" @click="setDurationMinutes(60)">60m</button>
              <button class="dur-quick-btn" @click="setDurationMinutes(75)">75m</button>
              <button class="dur-quick-btn" @click="setDurationMinutes(90)">90m</button>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 2: 📊 TIMELINE GRAFICA (Soluzione 3)                      -->
        <!-- ============================================================= -->
        <div v-show="activeTab === 'timeline'" class="tab-content">
          <div class="timeline-container pa-3 rounded-xl bg-slate-900 border-soft mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.6rem;">
                Fascia 24h della giornata
              </span>
              <span class="text-super-caption text-orange-lighten-2 font-weight-black">
                {{ tempStartHourStr }}:{{ tempStartMinStr }} ➔ {{ tempEndHourStr }}:{{ tempEndMinStr }} ({{ tempDurationFormatted }})
              </span>
            </div>

            <!-- Visual Bar Representation -->
            <div class="visual-timeline-track mb-3">
              <!-- Period Background markers -->
              <div class="track-period period-morning" title="Mattina (06-12)"><span>06:00</span></div>
              <div class="track-period period-afternoon" title="Pomeriggio (12-18)"><span>12:00</span></div>
              <div class="track-period period-evening" title="Sera (18-24)"><span>18:00</span></div>

              <!-- Active Highlight Block -->
              <div
                class="active-range-highlight"
                :style="activeRangeStyle"
              >
                <div class="range-handle-start"></div>
                <div class="range-handle-end"></div>
              </div>
            </div>

            <!-- Dual Sliders for Touch control -->
            <div class="timeline-sliders-wrapper">
              <div class="d-flex align-center justify-space-between text-super-caption text-slate mb-1">
                <span>🟢 Inizio: <b>{{ tempStartHourStr }}:{{ tempStartMinStr }}</b></span>
                <span>🔴 Fine: <b>{{ tempEndHourStr }}:{{ tempEndMinStr }}</b></span>
              </div>

              <!-- Range Sliders (Minuti da inizio giornata 0-1440) -->
              <div class="slider-row mb-2">
                <input
                  type="range"
                  min="360"
                  max="1380"
                  :step="config.stepMinutes"
                  v-model.number="tempStartMinutesFromMidnight"
                  @input="onTimelineStartInput"
                  class="timeline-slider-input slider-start"
                />
              </div>

              <div class="slider-row mb-1">
                <input
                  type="range"
                  min="360"
                  max="1435"
                  :step="config.stepMinutes"
                  v-model.number="tempEndMinutesFromMidnight"
                  @input="onTimelineEndInput"
                  class="timeline-slider-input slider-end"
                />
              </div>
            </div>

            <!-- Shift Whole Session Controls -->
            <div class="d-flex align-center justify-space-between pt-2 border-top-soft">
              <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.58rem;">
                Sposta l'intera sessione:
              </span>
              <div class="d-flex gap-1">
                <button class="nudge-chip" @click="shiftSessionMinutes(-30)">◀ -30m</button>
                <button class="nudge-chip" @click="shiftSessionMinutes(-15)">-15m</button>
                <button class="nudge-chip" @click="shiftSessionMinutes(15)">+15m</button>
                <button class="nudge-chip" @click="shiftSessionMinutes(30)">+30m ▶</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 3: ⚡ PRESET RAPIDI INTELLIGENTI (Soluzione 4)             -->
        <!-- ============================================================= -->
        <div v-show="activeTab === 'presets'" class="tab-content">
          <div class="presets-section mb-3">
            <div class="text-super-caption text-orange-lighten-2 font-weight-black uppercase mb-1.5" style="font-size: 0.6rem;">
              ⚡ Appena terminato (In base all'ora attuale)
            </div>

            <div class="preset-grid mb-3">
              <button
                v-for="p in livePresets"
                :key="p.id"
                class="preset-card"
                @click="applyLivePreset(p)"
              >
                <div class="d-flex align-center justify-space-between">
                  <span class="preset-title">{{ p.title }}</span>
                  <span class="preset-dur">{{ p.durationText }}</span>
                </div>
                <div class="preset-times">{{ p.startFormatted }} ➔ {{ p.endFormatted }}</div>
              </button>
            </div>

            <div class="text-super-caption text-orange-lighten-2 font-weight-black uppercase mb-1.5" style="font-size: 0.6rem;">
              🕒 Fasce Orarie Tipiche
            </div>

            <div class="preset-grid">
              <button
                v-for="r in routinePresets"
                :key="r.id"
                class="preset-card"
                @click="applyRoutinePreset(r)"
              >
                <div class="d-flex align-center justify-space-between">
                  <span class="preset-title">{{ r.emoji }} {{ r.title }}</span>
                  <span class="preset-dur">{{ r.durationText }}</span>
                </div>
                <div class="preset-times">{{ r.startFormatted }} ➔ {{ r.endFormatted }}</div>
              </button>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 4: ⚙️ PARAMETRI E PERSONALIZZAZIONE                        -->
        <!-- ============================================================= -->
        <div v-show="activeTab === 'settings'" class="tab-content">
          <div class="settings-box pa-3 rounded-xl bg-slate-900 border-soft mb-3">
            <div class="text-caption font-weight-black text-slate-dark mb-2">
              ⚙️ Parametri & Preferenze
            </div>

            <!-- Step Minutes Config -->
            <div class="setting-item mb-2.5">
              <label class="setting-label">Passo Minuti (Step)</label>
              <div class="d-flex gap-1.5">
                <button
                  v-for="s in [1, 5, 10, 15]"
                  :key="s"
                  class="config-chip"
                  :class="{ active: config.stepMinutes === s }"
                  @click="updateConfig('stepMinutes', s)"
                >
                  {{ s }} min {{ s === 5 ? '⭐' : '' }}
                </button>
              </div>
            </div>

            <!-- Default Duration Config -->
            <div class="setting-item mb-2.5">
              <label class="setting-label">Durata Predefinita per Nuovi Wo</label>
              <div class="d-flex gap-1.5 flex-wrap">
                <button
                  v-for="d in [30, 45, 60, 75, 90]"
                  :key="d"
                  class="config-chip"
                  :class="{ active: config.defaultDurationMinutes === d }"
                  @click="updateConfig('defaultDurationMinutes', d)"
                >
                  {{ d }}m
                </button>
              </div>
            </div>

            <!-- Default Tab View -->
            <div class="setting-item">
              <label class="setting-label">Vista Predefinita all'Apertura</label>
              <div class="d-flex gap-1.5 flex-wrap">
                <button
                  class="config-chip"
                  :class="{ active: config.defaultTab === 'wheel' }"
                  @click="updateConfig('defaultTab', 'wheel')"
                >
                  Rulli
                </button>
                <button
                  class="config-chip"
                  :class="{ active: config.defaultTab === 'timeline' }"
                  @click="updateConfig('defaultTab', 'timeline')"
                >
                  Timeline
                </button>
                <button
                  class="config-chip"
                  :class="{ active: config.defaultTab === 'presets' }"
                  @click="updateConfig('defaultTab', 'presets')"
                >
                  Preset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- BOTTOM ACTION BUTTONS                                         -->
        <!-- ============================================================= -->
        <div class="d-flex align-center gap-2 pt-2 border-top-soft">
          <v-btn
            variant="tonal"
            color="grey"
            rounded="lg"
            class="text-none flex-grow-0 px-3"
            height="44"
            @click="clearTimes"
          >
            <v-icon size="16">mdi-trash-can-outline</v-icon>
          </v-btn>

          <v-btn
            color="orange-darken-3"
            variant="flat"
            rounded="lg"
            class="text-none flex-grow-1 font-weight-black btn-save-modal"
            height="44"
            @click="confirmAndSave"
          >
            <v-icon size="18" class="mr-1">mdi-check</v-icon>
            Conferma e Salva
          </v-btn>
        </div>

        <!-- Native Fallback Expander -->
        <div class="mt-2 text-center">
          <button
            class="text-super-caption text-muted font-weight-bold fallback-btn"
            @click="showNativeInputs = !showNativeInputs"
          >
            {{ showNativeInputs ? '▲ Nascondi Formato Testo' : '▼ Mostra Input ISO Testo Nativo' }}
          </button>
          
          <v-expand-transition>
            <div v-show="showNativeInputs" class="mt-2 pt-2 border-top-soft text-left">
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model="tempStart"
                    type="datetime-local"
                    label="Data/Ora Inizio"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                    class="manual-datetime-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="tempEnd"
                    type="datetime-local"
                    label="Data/Ora Fine"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details
                    class="manual-datetime-field"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  start: {
    type: String,
    default: ''
  },
  end: {
    type: String,
    default: ''
  },
  week: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:start', 'update:end', 'change', 'quick-start', 'quick-end']);

// V-Models sincronizzati con props
const modelStart = computed({
  get: () => props.start,
  set: (val) => emit('update:start', val)
});

const modelEnd = computed({
  get: () => props.end,
  set: (val) => emit('update:end', val)
});

// Modal state
const modalOpen = ref(false);
const activeTab = ref('wheel');
const showNativeInputs = ref(false);

// Temporary state when modal is open
const tempStart = ref('');
const tempEnd = ref('');
const selectedDateKey = ref('today');
const customDateInput = ref('');
const customDateDisplay = ref('');

// Parameter Configurations
const config = ref({
  stepMinutes: 5,
  defaultDurationMinutes: 60,
  defaultTab: 'wheel',
  preferredTimeSlot: '18:00'
});

// Load config from localStorage
const loadConfig = () => {
  try {
    const saved = localStorage.getItem('woapp_timerange_config');
    if (saved) {
      config.value = { ...config.value, ...JSON.parse(saved) };
    }
  } catch (e) {}
};

const updateConfig = (key, val) => {
  vibra(12);
  config.value[key] = val;
  try {
    localStorage.setItem('woapp_timerange_config', JSON.stringify(config.value));
  } catch (e) {}
};

onMounted(() => {
  loadConfig();
});

// Haptic feedback
const vibra = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Date Presets
const datePresets = [
  { key: 'today', label: 'Oggi', daysOffset: 0 },
  { key: 'yesterday', label: 'Ieri', daysOffset: -1 },
  { key: '2daysAgo', label: '2 gg fa', daysOffset: -2 }
];

// Helper per formattare data in stringa ISO locale (YYYY-MM-DDTHH:mm)
const toLocalISOString = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

// Helper per estrarre Date object da stringa
const parseDate = (str) => {
  if (!str) return null;
  if (str.includes('T') || str.includes('-')) {
    const d = new Date(str);
    if (!isNaN(d)) return d;
  }
  const match = str.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (match) {
    const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]), match[6] ? parseInt(match[6]) : 0);
    if (!isNaN(d)) return d;
  }
  const fallback = new Date(str);
  return isNaN(fallback) ? null : fallback;
};

// Formattazioni Display
const formatFriendlyTime = (str) => {
  const d = parseDate(str);
  if (!d) return str || '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} alle ${hh}:${min}`;
};

const formatHourOnly = (str) => {
  const d = parseDate(str);
  if (!d) return '--:--';
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
};

const displayDateLabel = computed(() => {
  if (!modelStart.value) return 'Nessun orario registrato';
  const d = parseDate(modelStart.value);
  if (!d) return 'Data non valida';
  
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (isToday) return '📅 Oggi';
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return '📅 Ieri';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `📅 ${dd}/${mm}`;
});

const computedDurationStr = computed(() => {
  if (!modelStart.value || !modelEnd.value) return '0:00';
  const s = parseDate(modelStart.value);
  const e = parseDate(modelEnd.value);
  if (!s || !e) return '0:00';
  const diffMins = Math.max(0, Math.floor((e - s) / 60000));
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
});

// Temp Parsed Properties for Modal
const tempStartDateObj = computed(() => parseDate(tempStart.value) || new Date());
const tempEndDateObj = computed(() => parseDate(tempEnd.value) || new Date());

const tempStartHourStr = computed(() => String(tempStartDateObj.value.getHours()).padStart(2, '0'));
const tempStartMinStr = computed(() => String(tempStartDateObj.value.getMinutes()).padStart(2, '0'));
const tempEndHourStr = computed(() => String(tempEndDateObj.value.getHours()).padStart(2, '0'));
const tempEndMinStr = computed(() => String(tempEndDateObj.value.getMinutes()).padStart(2, '0'));

const tempDurationMinutes = computed(() => {
  const s = parseDate(tempStart.value);
  const e = parseDate(tempEnd.value);
  if (!s || !e) return 0;
  return Math.max(0, Math.floor((e - s) / 60000));
});

const tempDurationFormatted = computed(() => {
  const m = tempDurationMinutes.value;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
});

// Timeline Slider Minutes from midnight (0 to 1440)
const tempStartMinutesFromMidnight = computed({
  get: () => {
    const d = tempStartDateObj.value;
    return d.getHours() * 60 + d.getMinutes();
  },
  set: (totalMins) => {
    const d = new Date(tempStartDateObj.value);
    d.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);
    tempStart.value = toLocalISOString(d);
  }
});

const tempEndMinutesFromMidnight = computed({
  get: () => {
    const d = tempEndDateObj.value;
    return d.getHours() * 60 + d.getMinutes();
  },
  set: (totalMins) => {
    const d = new Date(tempEndDateObj.value);
    d.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);
    tempEnd.value = toLocalISOString(d);
  }
});

const onTimelineStartInput = () => {
  vibra(6);
  if (tempStartMinutesFromMidnight.value >= tempEndMinutesFromMidnight.value) {
    tempEndMinutesFromMidnight.value = Math.min(1435, tempStartMinutesFromMidnight.value + config.value.stepMinutes);
  }
};

const onTimelineEndInput = () => {
  vibra(6);
  if (tempEndMinutesFromMidnight.value <= tempStartMinutesFromMidnight.value) {
    tempStartMinutesFromMidnight.value = Math.max(0, tempEndMinutesFromMidnight.value - config.value.stepMinutes);
  }
};

// Timeline Active Range Visual Bar Style
const activeRangeStyle = computed(() => {
  // Track spans 06:00 (360m) to 24:00 (1440m) = 1080 mins total
  const trackStart = 360;
  const trackEnd = 1440;
  const trackTotal = trackEnd - trackStart;

  const startMins = Math.max(trackStart, Math.min(trackEnd, tempStartMinutesFromMidnight.value));
  const endMins = Math.max(trackStart, Math.min(trackEnd, tempEndMinutesFromMidnight.value));

  const leftPercent = ((startMins - trackStart) / trackTotal) * 100;
  const widthPercent = Math.max(2, ((endMins - startMins) / trackTotal) * 100);

  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`
  };
});

// Open Modal with Smart Defaults
const openModal = () => {
  vibra(15);
  activeTab.value = config.value.defaultTab || 'wheel';

  const now = new Date();
  // Round now to nearest 5 min step
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);

  if (modelStart.value) {
    tempStart.value = modelStart.value;
    tempEnd.value = modelEnd.value || toLocalISOString(now);
  } else {
    // Smart default: now - defaultDuration ending at now
    const defaultEnd = new Date(now);
    const defaultStart = new Date(now.getTime() - config.value.defaultDurationMinutes * 60000);
    tempStart.value = toLocalISOString(defaultStart);
    tempEnd.value = toLocalISOString(defaultEnd);
  }

  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

// Quick Handlers on Step 1
const handleQuickStart = () => {
  vibra(20);
  emit('quick-start');
};

const handleQuickEnd = () => {
  vibra(20);
  emit('quick-end');
};

// Micro-nudges right in the in-place card
const nudgeMinutes = (mins) => {
  vibra(15);
  if (!modelStart.value) {
    openModal();
    return;
  }
  const s = parseDate(modelStart.value);
  let e = parseDate(modelEnd.value);
  if (!e) {
    e = new Date(s.getTime() + config.value.defaultDurationMinutes * 60000);
  }
  const newEnd = new Date(e.getTime() + mins * 60000);
  if (newEnd > s) {
    modelEnd.value = toLocalISOString(newEnd);
    emit('change', { start: modelStart.value, end: modelEnd.value, week: props.week });
  }
};

const applyPresetFinishedNow = () => {
  vibra(25);
  const now = new Date();
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);

  const startObj = modelStart.value ? parseDate(modelStart.value) : new Date(now.getTime() - config.value.defaultDurationMinutes * 60000);
  modelStart.value = toLocalISOString(startObj);
  modelEnd.value = toLocalISOString(now);
  emit('change', { start: modelStart.value, end: modelEnd.value, week: props.week });
};

// Tab switching
const switchTab = (tab) => {
  vibra(10);
  activeTab.value = tab;
};

// Steppers in Tab 1
const stepStartTime = (deltaMins) => {
  vibra(10);
  const s = parseDate(tempStart.value) || new Date();
  const newS = new Date(s.getTime() + deltaMins * 60000);
  tempStart.value = toLocalISOString(newS);

  // Maintain minimum gap or push end if needed
  const e = parseDate(tempEnd.value);
  if (e && newS >= e) {
    tempEnd.value = toLocalISOString(new Date(newS.getTime() + config.value.stepMinutes * 60000));
  }
};

const stepEndTime = (deltaMins) => {
  vibra(10);
  const e = parseDate(tempEnd.value) || new Date();
  const newE = new Date(e.getTime() + deltaMins * 60000);
  
  const s = parseDate(tempStart.value) || new Date();
  if (newE > s) {
    tempEnd.value = toLocalISOString(newE);
  }
};

const setStartToNow = () => {
  vibra(15);
  const now = new Date();
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);
  tempStart.value = toLocalISOString(now);
  
  const e = parseDate(tempEnd.value);
  if (!e || now >= e) {
    tempEnd.value = toLocalISOString(new Date(now.getTime() + config.value.defaultDurationMinutes * 60000));
  }
};

const setStartToOneHourAgo = () => {
  vibra(15);
  const now = new Date();
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);
  tempStart.value = toLocalISOString(new Date(now.getTime() - 60 * 60000));
};

const setEndToNow = () => {
  vibra(20);
  const now = new Date();
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);
  tempEnd.value = toLocalISOString(now);

  const s = parseDate(tempStart.value);
  if (!s || s >= now) {
    tempStart.value = toLocalISOString(new Date(now.getTime() - config.value.defaultDurationMinutes * 60000));
  }
};

const setDurationMinutes = (durationMins) => {
  vibra(15);
  const s = parseDate(tempStart.value) || new Date();
  const newE = new Date(s.getTime() + durationMins * 60000);
  tempEnd.value = toLocalISOString(newE);
};

// Shift whole session in Tab 2
const shiftSessionMinutes = (deltaMins) => {
  vibra(12);
  const s = parseDate(tempStart.value) || new Date();
  const e = parseDate(tempEnd.value) || new Date();
  tempStart.value = toLocalISOString(new Date(s.getTime() + deltaMins * 60000));
  tempEnd.value = toLocalISOString(new Date(e.getTime() + deltaMins * 60000));
};

// Date Presets Application
const applyDatePreset = (preset) => {
  vibra(12);
  selectedDateKey.value = preset.key;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + preset.daysOffset);

  const s = parseDate(tempStart.value) || new Date();
  const e = parseDate(tempEnd.value) || new Date();

  s.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  e.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  tempStart.value = toLocalISOString(s);
  tempEnd.value = toLocalISOString(e);
};

const onCustomDateChange = () => {
  if (!customDateInput.value) return;
  vibra(15);
  selectedDateKey.value = 'custom';
  const parts = customDateInput.value.split('-');
  if (parts.length === 3) {
    const yyyy = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const dd = parseInt(parts[2], 10);
    customDateDisplay.value = `${String(dd).padStart(2, '0')}/${String(mm + 1).padStart(2, '0')}`;

    const s = parseDate(tempStart.value) || new Date();
    const e = parseDate(tempEnd.value) || new Date();
    s.setFullYear(yyyy, mm, dd);
    e.setFullYear(yyyy, mm, dd);
    tempStart.value = toLocalISOString(s);
    tempEnd.value = toLocalISOString(e);
  }
};

// Live Dynamic Presets in Tab 3
const livePresets = computed(() => {
  const now = new Date();
  const roundedNowMins = Math.floor(now.getMinutes() / config.value.stepMinutes) * config.value.stepMinutes;
  now.setMinutes(roundedNowMins, 0, 0);

  const durations = [
    { id: 'now_60', dur: 60, title: 'Sessione Standard (1h)', durText: '60 min' },
    { id: 'now_75', dur: 75, title: 'Sessione Completa (1h 15m)', durText: '75 min' },
    { id: 'now_45', dur: 45, title: 'Sessione Rapida (45m)', durText: '45 min' },
    { id: 'now_90', dur: 90, title: 'Sessione Lunga (1h 30m)', durText: '90 min' }
  ];

  return durations.map((item) => {
    const s = new Date(now.getTime() - item.dur * 60000);
    return {
      id: item.id,
      title: item.title,
      durationText: item.durText,
      durationMinutes: item.dur,
      startFormatted: formatHourOnly(toLocalISOString(s)),
      endFormatted: formatHourOnly(toLocalISOString(now)),
      startDate: s,
      endDate: now
    };
  });
});

const routinePresets = [
  { id: 'morning', emoji: '🌅', title: 'Mattina', start: '07:30', end: '08:45', startFormatted: '07:30', endFormatted: '08:45', durationText: '1h 15m' },
  { id: 'lunch', emoji: '☀️', title: 'Pausa Pranzo', start: '13:00', end: '14:15', startFormatted: '13:00', endFormatted: '14:15', durationText: '1h 15m' },
  { id: 'afternoon', emoji: '🌆', title: 'Pomeriggio', start: '18:00', end: '19:15', startFormatted: '18:00', endFormatted: '19:15', durationText: '1h 15m' },
  { id: 'evening', emoji: '🌙', title: 'Sera', start: '20:00', end: '21:15', startFormatted: '20:00', endFormatted: '21:15', durationText: '1h 15m' }
];

const applyLivePreset = (p) => {
  vibra(20);
  tempStart.value = toLocalISOString(p.startDate);
  tempEnd.value = toLocalISOString(p.endDate);
  confirmAndSave();
};

const applyRoutinePreset = (r) => {
  vibra(20);
  const now = new Date();
  const [sH, sM] = r.start.split(':').map(n => parseInt(n, 10));
  const [eH, eM] = r.end.split(':').map(n => parseInt(n, 10));

  const s = new Date(now);
  s.setHours(sH, sM, 0, 0);

  const e = new Date(now);
  e.setHours(eH, eM, 0, 0);

  tempStart.value = toLocalISOString(s);
  tempEnd.value = toLocalISOString(e);
  confirmAndSave();
};

// Confirm and Save
const confirmAndSave = () => {
  vibra(30);
  modelStart.value = tempStart.value;
  modelEnd.value = tempEnd.value;
  modalOpen.value = false;
  emit('change', { start: modelStart.value, end: modelEnd.value, week: props.week });
};

// Clear Times
const clearTimes = () => {
  vibra(25);
  tempStart.value = '';
  tempEnd.value = '';
  modelStart.value = '';
  modelEnd.value = '';
  modalOpen.value = false;
  emit('change', { start: '', end: '', week: props.week });
};
</script>

<style scoped>
.workout-time-picker-root {
  width: 100%;
}

/* Time Range Summary Card */
.time-range-summary-card {
  background: var(--card-bg-soft);
  border: 1px solid var(--card-border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.time-range-summary-card:hover {
  background: var(--card-bg-glass);
  border-color: rgba(249, 115, 22, 0.4);
}

.time-range-summary-card.has-data {
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow: 0 4px 20px -4px rgba(249, 115, 22, 0.12);
}

.time-badge {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.time-badge .badge-label {
  font-size: 0.52rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.time-badge .badge-val {
  font-size: 0.95rem;
  font-weight: 900;
  color: var(--text-dark);
  font-variant-numeric: tabular-nums;
}

.edit-pill {
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.3);
  transition: transform 0.15s ease;
}

.edit-pill:hover {
  transform: scale(1.04);
}

/* Nudge Chips */
.nudge-chip {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid var(--card-border);
  color: var(--text-slate);
  font-size: 0.62rem;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nudge-chip:hover {
  background: rgba(249, 115, 22, 0.2);
  border-color: var(--theme-primary);
  color: #fff;
}

.nudge-chip.highlight {
  background: rgba(249, 115, 22, 0.18);
  border-color: rgba(249, 115, 22, 0.4);
  color: #fb923c;
}

/* Modal Bottom Sheet */
.time-modal-card {
  background: #0b1120 !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-dark);
  backdrop-filter: blur(24px);
}

.modal-drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
}

/* Date Pills */
.date-pill {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--card-border);
  color: var(--text-slate);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.date-pill.active {
  background: rgba(249, 115, 22, 0.25);
  border-color: #f97316;
  color: #fdba74;
}

.custom-date-wrap {
  position: relative;
  display: inline-block;
}

.custom-date-hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Segmented Control (Tabs) */
.segmented-control {
  display: flex;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--card-border);
  padding: 3px;
  border-radius: 12px;
  gap: 3px;
}

.segment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-btn.active {
  background: rgba(249, 115, 22, 0.2);
  color: #fdba74;
  border: 1px solid rgba(249, 115, 22, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Tab 1: Wheel & Steppers */
.time-picker-box {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 10px;
  text-align: center;
}

.time-digit-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.digit-colon {
  color: #f97316;
  opacity: 0.8;
}

.stepper-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid var(--card-border);
  color: var(--text-slate);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.stepper-btn:hover, .stepper-btn:active {
  background: rgba(249, 115, 22, 0.25);
  border-color: #f97316;
  color: #fff;
}

.quick-chip-micro {
  background: transparent;
  border: 1px solid var(--card-border);
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 5px;
  cursor: pointer;
}

.quick-chip-micro.highlight {
  border-color: rgba(249, 115, 22, 0.4);
  color: #fb923c;
  background: rgba(249, 115, 22, 0.1);
}

.duration-pill-center {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.35);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 900;
  color: #fdba74;
}

.dur-quick-btn {
  flex: 1;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--card-border);
  color: var(--text-slate);
  font-size: 0.62rem;
  font-weight: 800;
  padding: 4px 0;
  border-radius: 6px;
  cursor: pointer;
}

.dur-quick-btn:hover {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
  color: #fff;
}

/* Tab 2: Timeline */
.visual-timeline-track {
  position: relative;
  height: 36px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  overflow: hidden;
}

.track-period {
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding: 2px 4px;
  font-size: 0.55rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
  border-right: 1px dashed rgba(255, 255, 255, 0.08);
}

.active-range-highlight {
  position: absolute;
  top: 3px;
  bottom: 3px;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.7), rgba(251, 146, 60, 0.9));
  border: 1.5px solid #ffedd5;
  border-radius: 6px;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);
  transition: all 0.08s ease;
}

.timeline-slider-input {
  width: 100%;
  accent-color: #f97316;
  height: 6px;
  cursor: pointer;
}

/* Tab 3: Presets */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.preset-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--card-border);
  padding: 8px 10px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-card:hover {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.4);
}

.preset-title {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-dark);
}

.preset-dur {
  font-size: 0.58rem;
  font-weight: 900;
  color: #fb923c;
}

.preset-times {
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

/* Tab 4: Settings */
.setting-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.config-chip {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--card-border);
  color: var(--text-slate);
  font-size: 0.62rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.config-chip.active {
  background: rgba(249, 115, 22, 0.25);
  border-color: #f97316;
  color: #fdba74;
}

/* Save Button */
.btn-save-modal {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  color: #fff !important;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3) !important;
}

.fallback-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}

.fallback-btn:hover {
  color: var(--text-dark);
}

/* Light Theme Overrides */
[data-theme="light"] .time-modal-card {
  background: #ffffff !important;
  color: var(--text-dark) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

[data-theme="light"] .time-picker-box,
[data-theme="light"] .segmented-control,
[data-theme="light"] .preset-card,
[data-theme="light"] .settings-box,
[data-theme="light"] .timeline-container {
  background: #f8fafc !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
}

[data-theme="light"] .time-digit-display {
  color: #0f172a !important;
}
</style>
