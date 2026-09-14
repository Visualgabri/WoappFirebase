import { ref, computed } from 'vue';

// Stato singleton condiviso tra tutti i componenti dell'app
const deferredPrompt = ref(null);
const canInstallAndroid = ref(false);
const isInstalled = ref(false);
const isBannerDismissed = ref(false);
const showGuideModal = ref(false);
const isInitialized = ref(false);

/**
 * Controlla se l'app è aperta come Standalone (PWA installata)
 */
export function checkIsStandalone() {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.navigator?.standalone === true ||
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches ||
      document.referrer?.startsWith('android-app://') ||
      false
    );
  } catch (e) {
    return false;
  }
}

/**
 * Controlla se il banner è stato congedato negli ultimi 7 giorni
 */
export function checkIsDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('woapp_pwa_dismissed_at');
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < sevenDaysMs;
  } catch (e) {
    return false;
  }
}

/**
 * Memorizza il congedo temporaneo del banner
 */
export function dismissBanner() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('woapp_pwa_dismissed_at', Date.now().toString());
  } catch (e) {}
  isBannerDismissed.value = true;
}

/**
 * Rileva il sistema operativo e il browser
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isAndroid: false, isSafari: false, isMobile: false, isChromeIOS: false };
  }
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi/i.test(ua);
  const isChromeIOS = isIOS && /CriOS/i.test(ua);
  const isSafari = isIOS && /Safari/i.test(ua) && !isChromeIOS && !/FxiOS|OPiOS|EdgiOS/i.test(ua);

  return { isIOS, isAndroid, isSafari, isMobile, isChromeIOS };
}

/**
 * Inizializza i listener globali PWA
 */
export function initPwaListeners() {
  if (typeof window === 'undefined' || isInitialized.value) return;
  isInitialized.value = true;

  // Verifica stato iniziale standalone e dismissed
  if (checkIsStandalone()) {
    isInstalled.value = true;
  }
  isBannerDismissed.value = checkIsDismissed();

  // Intercetta l'evento di installazione su Chromium / Android
  window.addEventListener('beforeinstallprompt', (e) => {
    // Impedisce il mini-infobar di default del browser
    e.preventDefault();
    deferredPrompt.value = e;
    canInstallAndroid.value = true;
  });

  // Intercetta il completamento dell'installazione
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    deferredPrompt.value = null;
    canInstallAndroid.value = false;
    showGuideModal.value = false;
  });
}

/**
 * Apre la modal guidata per iOS o per spiegazioni
 */
export function openInstallGuide() {
  showGuideModal.value = true;
}

/**
 * Chiude la modal
 */
export function closeInstallGuide() {
  showGuideModal.value = false;
}

/**
 * Esegue il prompt di installazione 1-clic se disponibile (Android)
 * oppure apre la guida (iOS)
 */
export async function triggerInstall() {
  if (canInstallAndroid.value && deferredPrompt.value) {
    try {
      deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;
      if (choiceResult?.outcome === 'accepted') {
        isInstalled.value = true;
        showGuideModal.value = false;
      }
      deferredPrompt.value = null;
      canInstallAndroid.value = false;
    } catch (err) {
      console.warn('Errore prompt PWA:', err);
      showGuideModal.value = true;
    }
  } else {
    // Se su iOS o se il prompt automatico non è disponibile
    showGuideModal.value = true;
  }
}

/**
 * Composable principale da usare nei componenti Vue
 */
export function usePwaInstall() {
  const deviceInfo = getDeviceInfo();
  const isStandalone = computed(() => isInstalled.value || checkIsStandalone());

  // Il banner deve essere mostrato solo se siamo su mobile, NON è standalone e non è stato dismissato
  const shouldShowBanner = computed(() => {
    return deviceInfo.isMobile && !isStandalone.value && !isBannerDismissed.value;
  });

  return {
    isStandalone,
    canInstallAndroid,
    isInstalled,
    isBannerDismissed,
    showGuideModal,
    shouldShowBanner,
    deviceInfo,
    initPwaListeners,
    dismissBanner,
    openInstallGuide,
    closeInstallGuide,
    triggerInstall,
  };
}
