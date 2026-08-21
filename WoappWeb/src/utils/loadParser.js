/**
 * loadParser.js - Centralized Parser & Single Source of Truth for WoApp
 *
 * Gestisce l'estrazione coerente e affidabile di:
 * - Carichi (kg) con supporto per numeri semplici, unità esplicite, serie multiple, manubri, bilancieri, cavi
 * - Ripetizioni (reps) con formati xR, SxR, suffissi r/reps/rip, e numeri isolati per corpo libero
 * - Esercizi a Corpo Libero puri vs con Sovraccarico/Zavorra (es: "14" = 14 reps, "14kg" = 14 kg sovraccarico)
 * - Riconoscimento ed esclusione di metadati (TUT, RPE, Rest-Pause, angoli panca, pin/tacche/sedili, orari)
 * - Calcolo e1RM smorzato e stime di carico
 */

// Lista di parole chiave relative ad attrezzi/macchine/metadati da escludere dal calcolo del peso
export const SETTING_KEYWORDS = [
  'panca', 'inclinazione', 'inclinata', 'inclinato', 'buco', 'buca', 'buchi',
  'foro', 'fori', 'tacca', 'tacche', 'tacchetta', 'tacchette', 'posizione', 'pos', 'altezza',
  'inc', 'gradi', 'grado', '°', 'seduto', 'seduta', 'step', 'pin', 'livello', 'liv',
  'regolazione', 'tacc', 'tassello', 'tavoletta', 'board', 'catena', 'catene', 'elastico',
  'elastici', 'blocco', 'blocchi', 'box', 'serie', 'set', 'sets', 'reps', 'rep',
  'ripetizioni', 'rip', 'colpi', 'colpo', 'giro', 'giri', 'circuiti', 'circuito',
  'volte', 'volta', 'passi', 'passo', 'speed', 'velocità', 'vel', 'tempo', 'tut', 't.u.t.',
  'sedile', 'schienale', 'poggiapiede', 'poggiapiedi', 'schiena', 'rullo', 'perno',
  'distanza', 'ampiezza', 'impugnatura', 'presa', 'busto', 'cavo', 'puleggia',
  'sopra', 'sotto', 'rp', 'rest', 'sec', 'secondi', 'min', 'minuti'
];

export const STOP_WORDS = [
  'a', 'di', 'su', 'in', 'da', 'alla', 'al', 'del', 'della', 'n', 'n.', 'num',
  'num.', 'n°', 'pos', 'pos.', '#', ':', '::', '@', 'at', 'con', 'e', 'o', 'per'
];

/**
 * Determina se un esercizio è intrinsecamente a corpo libero (bodyweight).
 * @param {Object|string} ex Esercizio o nome esercizio
 * @returns {boolean}
 */
export const isCorpoLiberoEsercizio = (ex) => {
  if (!ex) return false;
  const name = typeof ex === 'string' ? ex.toLowerCase() : String(ex.des_esercizio || '').toLowerCase();
  const note = typeof ex === 'object' ? String(ex.des_note_attrezzo || '').toLowerCase() : '';
  const attr = typeof ex === 'object' ? String(ex.des_note_gen_attr || '').toLowerCase() : '';
  const desNote = typeof ex === 'object' ? String(ex.des_note || '').toLowerCase() : '';
  const settore = typeof ex === 'object' ? String(ex.des_settore || '').toLowerCase() : '';
  const settorePrinc = typeof ex === 'object' ? String(ex.des_settore_princ || '').toLowerCase() : '';

  // Se contiene esplicitamente attrezzi a carico esterno nel nome o note, non è corpo libero puro
  const weightKeywords = [
    'con peso', 'con manubrio', 'con manubri', 'con disco', 'con dischi', 'con bilanciere',
    'con kgb', 'con kb', 'con kettlebell', 'giubbotto zavorrato',
    'multipower', 'smith', 'macchina', 'machine', 'cavo', 'cavi', 'cable', 'pulley',
    'pressa', 'leg press', 'hack squat', 'lat machine', 'pulldown', 'pectoral'
  ];
  if (weightKeywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k) || desNote.includes(k))) {
    return false;
  }

  const bodyweightKeywords = [
    'corpo libero', 'corpolibero', 'corpo_libero', 'peso corporeo', 'bodyweight', 'senza attrezzi', 'nessun attrezzo',
    'trazioni', 'dip', 'piegamenti', 'push up', 'push-up', 'pushup',
    'crunch', 'plank', 'side plank', 'sit up', 'sit-up', 'situp',
    'addominali', 'addome', 'leg raise', 'knee raise', 'hyperextension', 'back extension', 'iperestensioni',
    'dragon', 'ab roll', 'ab-roll', 'rotella', 'ruota', 'rollout',
    'bridge', 'side bridge', 'glute bridge', 'abduzione', 'adduzione',
    'hollow', 'arch hold', 'superman', 'dead bug', 'bird dog',
    'v-up', 'v up', 'vup', 'toe touch', 'l-sit', 'l sit', 'lsit',
    'handstand', 'verticale', 'mountain climber', 'burpee', 'skipping',
    'chin up', 'chin-up', 'chinup', 'pull up', 'pull-up', 'pullup', 'muscle up', 'muscle-up'
  ];

  return bodyweightKeywords.some(k =>
    name.includes(k) || note.includes(k) || attr.includes(k) || desNote.includes(k) || settore.includes(k) || settorePrinc.includes(k)
  ) || note.includes('a terra') || note.includes('decubito') || note.includes('nessuno') || attr.includes('nessuno');
};

/**
 * Rimuove ricorsivamente QUALSIASI contenuto racchiuso tra parentesi tonde (...),
 * quadre [...] o graffe {...}, incluse eventuali notazioni con prefisso + come +(1kg) o +[tag].
 * @param {string} str
 * @returns {string}
 */
export const rimuoviContenutoTraParentesi = (str) => {
  if (!str) return '';
  let clean = String(str);
  let prev = '';
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(/\+\s*\([^()]*\)/g, ' ')
      .replace(/\+\s*\[[^[\]]*\]/g, ' ')
      .replace(/\+\s*\{[^{}]*\}/g, ' ')
      .replace(/\([^()]*\)/g, ' ')
      .replace(/\[[^[\]]*\]/g, ' ')
      .replace(/\{[^{}]*\}/g, ' ');
  }
  return clean.trim();
};

/**
 * Verifica se un testo contiene un sovraccarico/zavorra esplicito (es: "14kg", "14 kg", "+14", "zavorra 10kg").
 * @param {string} str
 * @returns {boolean}
 */
export const haSovraccaricoEsplicito = (str) => {
  if (!str) return false;
  let s = String(str).toLowerCase().trim();
  if (!s || s === '-') return false;

  // IMPORTANT: Rimuove QUALSIASI contenuto tra parentesi prima di verificare la presenza di sovraccarico esplicito
  s = rimuoviContenutoTraParentesi(s).toLowerCase();
  if (!s) return false;

  // 1. Cerca suffisso esplicito kg / chili
  if (/\b\d+(?:[.,]\d+)?\s*(?:kg\b|k\b|chili\b|kilo\b|lbs?\b)/i.test(s)) return true;
  // 2. Cerca prefisso + (es: "+10", "+14kg", "+ 15")
  if (/\+\s*\d+(?:[.,]\d+)?/i.test(s)) return true;
  // 3. Cerca parole chiave di zavorra / sovraccarico con numero
  if (/\b(?:zavorra|zavorrato|zavorrata|sovraccarico|sovraccaricato|disco|manubrio)\s*(?:da\s*)?:?\s*\d+(?:[.,]\d+)?/i.test(s)) return true;
  if (/\b\d+(?:[.,]\d+)?\s*(?:zavorra|zav)\b/i.test(s)) return true;

  return false;
};

/**
 * Determina se l'esercizio è un cavo o macchina.
 * @param {Object|string} ex
 * @returns {boolean}
 */
export const isCavoOMacchinaEsercizio = (ex) => {
  if (!ex) return false;
  const name = typeof ex === 'string' ? ex.toLowerCase() : String(ex.des_esercizio || '').toLowerCase();
  const attr = typeof ex === 'object' ? String(ex.des_note_attrezzo || '').toLowerCase() : '';
  const noteGen = typeof ex === 'object' ? String(ex.des_note_gen_attr || '').toLowerCase() : '';

  const keywords = ['cavo', 'cavi', 'cable', 'macchina', 'machine', 'pulley', 'lat', 'pressa', 'extension', 'curl mac', 'pectoral', 'chest press', 'adductor', 'abductor', 'smith', 'multipower'];
  return keywords.some(k => name.includes(k) || attr.includes(k) || noteGen.includes(k));
};

/**
 * Determina se un esercizio è a percentuale fissa o calcolato su percentuali dal Coach.
 * @param {Object} ex
 * @param {number} [weekNum=null]
 * @returns {boolean}
 */
export const isPercentualeEsercizio = (ex, weekNum = null) => {
  if (!ex) return false;
  if (ex.flg_perc === true || String(ex.flg_perc).toLowerCase() === 'true' || String(ex.flg_perc) === '1') {
    return true;
  }
  if (weekNum) {
    const presc = String(ex['des_week' + weekNum] || '');
    if (presc.includes('%') || presc.includes('|')) return true;
  }
  for (let w = 1; w <= 6; w++) {
    const presc = String(ex['des_week' + w] || '');
    if (presc.includes('%') || presc.includes('|')) return true;
  }
  return false;
};

/**
 * Determina se l'esercizio è svolto con manubri.
 * @param {Object|string} ex
 * @returns {boolean}
 */
export const isManubriEsercizio = (ex) => {
  if (!ex) return false;
  const name = typeof ex === 'string' ? ex.toLowerCase() : String(ex.des_esercizio || '').toLowerCase();
  const attr = typeof ex === 'object' ? String(ex.des_note_attrezzo || '').toLowerCase() : '';
  const noteGen = typeof ex === 'object' ? String(ex.des_note_gen_attr || '').toLowerCase() : '';

  const keywords = ['manubri', 'manubrio', 'db', 'dumbbell', 'dumbbells', 'singolo manubrio', 'coppia manubri'];
  return keywords.some(k => name.includes(k) || attr.includes(k) || noteGen.includes(k));
};

/**
 * Estrae le ripetizioni previste dalla prescrizione (es. "3x10 (70%)" -> 10, "4x8" -> 8, "12" -> 12).
 * @param {string} prescrizioneStr
 * @returns {number|null}
 */
export const estraiRepsDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return null;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').replace(/\[[^\]]+\]/g, '').trim();

  const matchX = cleanPart.match(/\d+\s*[xX]\s*(\d+)/);
  if (matchX) {
    return parseInt(matchX[1], 10);
  }

  const matchNum = cleanPart.match(/^(\d+)$/);
  if (matchNum) {
    return parseInt(matchNum[1], 10);
  }

  const matchFirstNum = cleanPart.match(/(\d+)/);
  if (matchFirstNum) {
    return parseInt(matchFirstNum[1], 10);
  }

  return null;
};

/**
 * Estrae le serie previste dalla prescrizione (es. "3x10" -> 3, "4x8" -> 4, "1x14" -> 1).
 * @param {string} prescrizioneStr
 * @returns {number|null}
 */
export const estraiSerieDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return null;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').trim();

  const matchX = cleanPart.match(/(\d+)\s*[xX]\s*\d+/);
  if (matchX) {
    return parseInt(matchX[1], 10);
  }
  return null;
};

/**
 * Estrae il carico (peso in kg) da una stringa di input utente (ins_week).
 * Supporta contestualmente esercizi a corpo libero (con/senza sovraccarico).
 *
 * @param {string} str Testo inserito dall'utente (es. "62,5 65 65", "45 x7r", "14kg", "14", "panca 45 8kg")
 * @param {Object} [options={}] Opzioni di parsing: { isCorpoLibero: boolean, defaultReps: number }
 * @returns {string|null} Il carico estratto come stringa (es: "65", "14", "62.5") oppure null
 */
export const estraiPesoDaInput = (str, options = {}) => {
  if (!str) return null;
  let raw = String(str).trim();
  if (!raw || raw === '-') return null;

  const isCorpoLibero = options.isCorpoLibero ?? false;
  const hasZavorra = haSovraccaricoEsplicito(raw);

  // Se è a corpo libero e NON contiene esplicitamente kg o zavorra (es: "14", "12 12 12", "14r"),
  // allora il valore numerico inserito rappresenta le ripetizioni, NON il carico in kg!
  if (isCorpoLibero && !hasZavorra) {
    return null;
  }

  let clean = raw.toLowerCase().replace(/,/g, '.').trim();

  // Rimuove QUALSIASI contenuto tra parentesi tonde (...), quadre [...] o graffe {...}
  clean = rimuoviContenutoTraParentesi(clean).toLowerCase();
  if (!clean) return null;

  // Rimuove notazioni TUT (es. "TUT323", "TUT 3-2-3", "tut 511")
  clean = clean.replace(/\b(?:tut|t\.u\.t\.)\s*:?\s*@?\s*\d*(?:\s*[\-\/\.]?\s*\d+)*/gi, ' ').trim();

  // Rimuove espressioni di RPE (es. "Rpe: 93 - 99", "RPE 8.5", "RPE: 9-10", "rpe 93-99", "rpe@9")
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();

  // Rimuove espressioni di Rest-Pause / Drop-Set (es. "rp20", "rp 15", "+2r RP", "RP+3")
  clean = clean.replace(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?:?\s*@?\s*\+?\s*\d+(?:[\.,]\d+)?(?:\s*(?:sec|secondi|s|r|reps?|rip))?/gi, ' ').trim();
  clean = clean.replace(/\+\s*\d+(?:[\.,]\d+)?\s*(?:r|reps?)?\s*(?:rp|rest\s*pause)/gi, ' ').trim();
  clean = clean.replace(/\b(?:rp|rest\s*pause|drop\s*set|cluster)\b/gi, ' ').trim();

  // Rimuove orari (es. "ore 17:30", "17:30")
  clean = clean.replace(/\b\d{1,2}:\d{2}\b/g, ' ').trim();

  // Rimuove espressioni di impostazioni/metadati (es. "PIN 12", "buco 3", "sedile 15", "sedile a 15", "panca 45°", "panca 45")
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo|tut|t\.u\.t\.|sedile|schienale|poggiapiede|poggiapiedi|schiena|rullo|perno|distanza|ampiezza|impugnatura|presa|busto|manubrio|cavo|puleggia|tacchetta|tacchette)\b\s*(?:a\s*)?\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, ' ').trim();

  // Rimuove gradi (es. "30°", "45 °", "60°")
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, ' ').trim();

  // 0a. Riconoscimento speciale "fatte [reps] [peso]" (es. "Fatte 15 3,75", "fatte 15 da 3.75", "fatto 12 con 50")
  const matchFatteRepsWeight = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:kg)?\b/i);
  if (matchFatteRepsWeight) {
    const w = parseFloat(matchFatteRepsWeight[2]);
    if (!isNaN(w) && w > 0) {
      return String(w);
    }
  }

  // 0b. Riconoscimento speciale "[peso] fatte [reps]" (es. "3,75 fatte 19", "3.75 fatte 19", "3,75 fatte a 19", "50 fatte 12")
  const matchWeightFatteReps = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:r|reps?|rip)?\b/i);
  if (matchWeightFatteReps) {
    const w = parseFloat(matchWeightFatteReps[1]);
    if (!isNaN(w) && w > 0) {
      return String(w);
    }
  }

  // Rileva formato tipo "30x12r", "30 x12r", "30x12", "3x12"
  const matchSxR = clean.match(/^\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*([rR])?\b)?\s*$/);
  if (matchSxR) {
    const num1 = parseFloat(matchSxR[1]);
    const num2 = parseFloat(matchSxR[2]);
    const isExplicitKg = /kg|kgs|kgb|lbs|\+/i.test(raw);

    // Se num1 è intero piccolo [1..5] e num2 >= 6, in assenza di "kg", num1 è il numero di serie e num2 sono le reps
    if (!isExplicitKg && num1 <= 5 && Number.isInteger(num1) && num2 >= 6) {
      return null;
    }
    if (isExplicitKg || num1 >= 5 || String(matchSxR[1]).includes('.')) {
      return String(num1);
    }
    return null;
  }

  // Rimuove il prefisso delle serie (es. "3x10", "4 x 12") se è [serie 1-5]x[reps]
  clean = clean.replace(/^\s*[1-5]\s*[xX]\s*\d+(?:\s*[a-zA-Z+]*\b)?/g, ' ').trim();

  // Trova tutti i numeri decimali o interi presenti nella stringa
  const numberRegex = /\d+(?:\.\d+)?/g;
  let match;
  const validWeights = [];

  while ((match = numberRegex.exec(clean)) !== null) {
    const numStr = match[0];
    const numVal = parseFloat(numStr);
    const startIdx = match.index;
    const endIdx = startIdx + numStr.length;

    if (isNaN(numVal) || numVal <= 0 || numVal > 1000) continue;

    // 1. Analisi del Suffisso
    const suffixStr = clean.substring(endIdx);
    const suffixClean = suffixStr.trim();
    const isExplicitKg = suffixClean.toLowerCase().startsWith('k');

    // Se c'è esplicitamente "kg" dopo il numero (es. "10kg", "10 kg", "10 k"), accettiamo come peso
    if (isExplicitKg) {
      validWeights.push({ val: numVal, hasKg: true, idx: startIdx });
      continue;
    }

    // Se il suffisso è ripetizioni o serie, lo escludiamo
    if (suffixClean.toLowerCase().match(/^r(?![a-z])/i) ||
        suffixClean.toLowerCase().startsWith('rep') ||
        suffixClean.toLowerCase().startsWith('rip') ||
        suffixClean.toLowerCase().startsWith('set') ||
        suffixClean.toLowerCase().startsWith('serie')) {
      continue;
    }

    // Se il suffisso inizia con ° o keywords di setting
    const suffixTokens = suffixClean.split(/[\s\-+:=@]+/);
    const suffixToken = (suffixTokens[0] || '').toLowerCase().trim();
    if (suffixClean.startsWith('°') || SETTING_KEYWORDS.some(word => suffixToken.includes(word) || suffixClean.toLowerCase().startsWith(word))) {
      continue;
    }

    // Esclusioni standard per il suffisso (es. "/", "%", "rpe", "sec", "min")
    if (suffixToken) {
      const suffixExclusions = ['/', '%', 'rpe', 'sec', 'secondi', 'secondo', 'min', 'minuti', 'minuto', 'metri', 'metro'];
      if (suffixToken.startsWith('/') || suffixExclusions.includes(suffixToken) || suffixToken === 's' || suffixToken === 'm') {
        continue;
      }
    }

  // Se la stringa contiene solo reps (es. "Fatte 5", "fatto 8", "12r", "15 reps") senza indicazione di peso
  // ed è presente un carico esplicito nella prescrizione (es. "AMRAP(90%)|40KG|10L", "4x10 (70%)|50KG"),
  // recuperiamo il carico prescritto
  if (options.prescrizione) {
    const isOnlyReps = /^\s*(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|chiuse?)\s*\d+(?:\s*(?:r|reps?|rip))?\s*$/i.test(clean) ||
                       /^\s*\d+\s*(?:r|reps?|rip(?:etizioni)?|colpi)\s*$/i.test(clean);
    if (isOnlyReps) {
      const matchPrescKg = String(options.prescrizione).match(/\|\s*(\d+(?:[.,]\d+)?)\s*kg/i) || String(options.prescrizione).match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
      if (matchPrescKg) {
        return matchPrescKg[1].replace(',', '.');
      }
    }
  }

  // 2. Analisi del Prefisso
    const prefixStr = clean.substring(0, startIdx);
    const prefixTokens = prefixStr.trim().split(/[\s\-+:=@°]+/);
    let prefixWord = '';
    for (let i = prefixTokens.length - 1; i >= 0; i--) {
      const token = prefixTokens[i].toLowerCase().trim();
      if (!token || STOP_WORDS.includes(token)) continue;
      prefixWord = token;
      break;
    }

    if (prefixWord) {
      if (['fatte', 'fatto', 'fatti', 'fatta', 'eseguite', 'eseguiti', 'eseguito', 'completate', 'chiuse', 'chiuso'].includes(prefixWord) && !isExplicitKg) {
        continue;
      }
      if (SETTING_KEYWORDS.some(word => prefixWord === word || prefixWord.includes(word)) || prefixWord === 'rpe' || prefixWord === 'rp') {
        continue;
      }
      if (prefixWord === 'x' || prefixWord.endsWith('x')) {
        continue;
      }
    }

    validWeights.push({ val: numVal, hasKg: false, idx: startIdx });
  }

  if (validWeights.length > 0) {
    // 1. Se ci sono pesi con 'kg' esplicito, usiamo il massimo tra essi
    const withKg = validWeights.filter(w => w.hasKg);
    if (withKg.length > 0) {
      return String(Math.max(...withKg.map(w => w.val)));
    }
    // 2. Massimo di tutti i pesi validi trovati
    return String(Math.max(...validWeights.map(w => w.val)));
  }

  return null;
};

/**
 * Estrae una singola specifica di ripetizioni da un frammento di stringa.
 * @param {string} str
 * @returns {{ val: number, explicit: boolean }|null}
 */
export function estraiRepsDaInputExplicitSingle(str) {
  if (!str) return null;
  let clean = String(str).toLowerCase().replace(/,/g, '.').trim();

  // Rimuove contenuti tra parentesi (inclusi quelli preceduti da +)
  clean = rimuoviContenutoTraParentesi(clean).toLowerCase();
  if (!clean) return null;

  // 1. Rimuove TUT, RPE, tempi di recupero e impostazioni
  clean = clean.replace(/\b(?:tut|t\.u\.t\.)\s*:?\s*@?\s*\d*(?:\s*[\-\/\.]?\s*\d+)*/gi, ' ').trim();
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();
  clean = clean.replace(/\b\d+(?:\.\d+)?\s*(?:sec|secondi|sec\.?|s|rec|recupero|min|minuti)\b/gi, ' ').trim();
  clean = clean.replace(/\b(?:pin|buco|buca|foro|tacca|altezza|pos|step|livello)\b\s*\d+(?:\.\d+)?/gi, '').trim();

  // 2. Rimuove Rest-Pause, Drop-Set, Cluster
  clean = clean.replace(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?:?\s*@?\s*\+?\s*\d+(?:[\.,]\d+)?(?:\s*(?:sec|secondi|s|r|reps?|rip))?/gi, ' ').trim();
  clean = clean.replace(/\+\s*\d+(?:[\.,]\d+)?\s*(?:r|reps?)?\s*(?:rp|rest\s*pause)/gi, ' ').trim();
  clean = clean.replace(/\b(?:rp|rest\s*pause|drop\s*set|cluster)\b/gi, ' ').trim();

  // 2a. Riconoscimento speciale "fatte [reps] [peso]" (es. "Fatte 15 3,75", "fatte 15 da 3.75", "fatto 12 con 50")
  const matchFatteRepsWeight = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:kg)?\b/i);
  if (matchFatteRepsWeight) {
    const r = parseFloat(matchFatteRepsWeight[1]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 2b. Riconoscimento speciale "[peso] fatte [reps]" (es. "3,75 fatte 19", "3.75 fatte 19", "3,75 fatte a 19", "50 fatte 12")
  const matchWeightFatteReps = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:r|reps?|rip)?\b/i);
  if (matchWeightFatteReps) {
    const r = parseFloat(matchWeightFatteReps[2]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 2c. Riconoscimento speciale "fatte [reps]" singolo (es. "fatte 15", "fatto 12", "fatti 10")
  const matchFatteSingle = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\b/i);
  if (matchFatteSingle) {
    const r = parseFloat(matchFatteSingle[1]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 3. Rileva formato esplicito con suffisso reps "40x23r", "42.5x24 reps", "5x12 rip", "45 x7r"
  const matchExplicitXWithR = clean.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)\b/i);
  if (matchExplicitXWithR) {
    const val = parseFloat(matchExplicitXWithR[2]);
    if (!isNaN(val) && val > 0 && val <= 100) return { val: Math.round(val), explicit: true };
  }

  // 4. Rileva formato tipo "3x20", "4x12", "1x18"
  const matchSxR = clean.match(/^\s*(\d+)\s*[xX]\s*(\d+)\s*$/);
  if (matchSxR) {
    const nSets = parseInt(matchSxR[1], 10);
    const nReps = parseInt(matchSxR[2], 10);
    if (nSets >= 1 && nSets <= 5 && nReps >= 6 && nReps <= 100) {
      return { val: nReps, explicit: true };
    }
    return null;
  }

  // 5. Rileva formato "47.5 x2" o "47.5 x2s" -> la seconda parte dopo 'x' senza 'r' indica le serie completate
  const matchSets = clean.match(/\b\d+(?:\.\d+)?\s*[xX]\s*\d+\s*(?:s|set|sets|serie)?\b/i);
  if (matchSets) {
    clean = clean.replace(matchSets[0], ' ').trim();
  }

  // 6. Rileva ripetizioni esplicite con suffissi "r", "reps", "rip", "colpi" (es. "12r", "12 reps", "20r")
  const matchR = clean.match(/(\d+(?:\.\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)/i);
  if (matchR) {
    const val = parseFloat(matchR[1]);
    if (!isNaN(val) && val > 0 && val <= 100) return { val: Math.round(val), explicit: true };
  }

  return null;
}

/**
 * Estrae le ripetizioni eseguite da un input utente (ins_week).
 * @param {string} str
 * @param {Object} [options={}] { isCorpoLibero: boolean }
 * @returns {number|null}
 */
export const estraiRepsDaInput = (str, options = {}) => {
  if (!str) return null;
  const strVal = String(str).trim();
  if (!strVal || strVal === '-') return null;

  const isCorpoLibero = options.isCorpoLibero ?? false;
  const repsPresc = options.repsPresc || options.defaultReps || null;

  // IMPORTANT: Rimuovi QUALSIASI contenuto tra parentesi tonde (...), quadre [...] o graffe {...}
  // per escludere note, stripping, commenti ed impostazioni dai calcoli!
  const cleanStr = rimuoviContenutoTraParentesi(strVal);
  if (!cleanStr) return repsPresc || null;

  // 0. Riconoscimento "+N rep" / "+N reps" / "+Nr" (es. "14 +1 rep", "+2 reps", "12kg + 1 rep")
  // dove N rappresenta ripetizioni in più rispetto al target prescritto.
  // IMPORTANTE: Deve avere OBBLIGATORIAMENTE un suffisso reps esplicito (r, rep, reps, rip, colpi)
  // e non deve trattarsi di numeri decimali (es. +22,5).
  const matchDeltaReps = cleanStr.match(/(?:^|\s)\+\s*(\d+)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)\b/i);
  if (matchDeltaReps) {
    const delta = parseInt(matchDeltaReps[1], 10);
    if (!isNaN(delta) && delta > 0 && delta <= 30) {
      if (repsPresc && repsPresc > 0) {
        return repsPresc + delta;
      }
      return delta;
    }
  }

  // 1. Controlla se ci sono set multipli con ramping/warmup (es. "8x15r 10x15r 12 facili")
  // In cui il carico massimo estratto è isolato (non ha suffisso xR o r proprio)
  const maxPesoStr = estraiPesoDaInput(cleanStr, { isCorpoLibero });
  if (maxPesoStr && repsPresc) {
    const maxPeso = parseFloat(maxPesoStr);
    
    // Cerca tutti i pattern [carico]x[reps]
    const regexSxR = /(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)?/gi;
    let match;
    let maxWeightHasExplicitReps = false;
    let foundRepsForMax = null;
    let hasOtherExplicitSets = false;
    
    while ((match = regexSxR.exec(cleanStr)) !== null) {
      const w = parseFloat(match[1].replace(',', '.'));
      const r = parseFloat(match[2].replace(',', '.'));
      if (w === maxPeso && r > 0) {
        maxWeightHasExplicitReps = true;
        foundRepsForMax = Math.round(r);
      } else if (r > 0) {
        hasOtherExplicitSets = true;
      }
    }
    
    if (maxWeightHasExplicitReps && foundRepsForMax !== null) {
      return foundRepsForMax;
    }
    
    // Se il carico top (es. 12) NON aveva reps esplicite ma altri set sì (es. 8x15r 10x15r 12),
    // il carico top da 12 kg è eseguito alle ripetizioni prescritte (es. 13r)!
    if (hasOtherExplicitSets && !maxWeightHasExplicitReps) {
      return repsPresc;
    }
  }

  const lines = cleanStr.split(/[\n;\r]+/);

  const results = lines
    .map(l => estraiRepsDaInputExplicitSingle(l))
    .filter(v => v !== null && !isNaN(v.val) && Number.isInteger(v.val) && v.val > 0 && v.val <= 100);

  if (results.length > 0) {
    const explicitResults = results.filter(v => v.explicit);
    if (explicitResults.length > 0) {
      return Math.max(...explicitResults.map(v => v.val));
    }
    return Math.max(...results.map(v => v.val));
  }

  // Se è a corpo libero e non ha trovato reps esplicite con 'r', controlla se c'è un numero isolato (es. "14", "12 12 12")
  if (isCorpoLibero && !haSovraccaricoEsplicito(cleanStr)) {
    const cleanNumbers = cleanStr.match(/\b\d+\b/g);
    if (cleanNumbers && cleanNumbers.length > 0) {
      const nums = cleanNumbers.map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= 100);
      if (nums.length > 0) {
        return Math.max(...nums);
      }
    }
  }

  return repsPresc || null;
};

/**
 * Calcola l'Estimated 1RM (e1RM) continuo, differenziabile e rigorosamente monotono.
 * Formula Epley/Baechle universale: 1RM = peso * (1 + reps / 30).
 * Garantisce: ∀ p > 0, r2 > r1 ⇒ e1rm(p, r2) > e1rm(p, r1).
 * @param {number} peso Carico in kg
 * @param {number} reps Ripetizioni
 * @param {boolean} [isCavoOMacchina=false] (mantenuto per retrocompatibilità di firma)
 * @returns {number} Massimale stimato
 */
export const calcolaE1RMSmorzato = (peso, reps, isCavoOMacchina = false) => {
  if (!peso || peso <= 0) return 0;
  const r = reps > 0 ? reps : 1;
  return peso * (1 + r / 30);
};

export const calcolaE1RM = calcolaE1RMSmorzato;

/**
 * Calcola il peso target da un 1RM stimato per un dato numero di ripetizioni.
 * Formula inversa esatta: peso = e1rm / (1 + targetReps / 30).
 * @param {number} e1rm
 * @param {number} targetReps
 * @param {boolean} [isCavoOMacchina=false]
 * @returns {number}
 */
export const calcolaPesoDaE1RMSmorzato = (e1rm, targetReps, isCavoOMacchina = false) => {
  if (!e1rm || e1rm <= 0 || !targetReps || targetReps <= 0) return 0;
  const r = targetReps > 0 ? targetReps : 1;
  return e1rm / (1 + r / 30);
};

export const calcolaPesoDaE1RM = calcolaPesoDaE1RMSmorzato;

/**
 * Calcola il carico necessario con le ripetizioni prescritte (targetReps) per superare
 * l'1RM target/storico, applicando lo step di arrotondamento corretto.
 * Formula rigorosa condivisa: e1rm = peso * (1 + targetReps / 30) >= targetE1RM + delta
 * @param {number} targetE1RM Record 1RM storico da superare
 * @param {number} targetReps Ripetizioni prescritte per la settimana
 * @param {number} [stepKg=2.5] Passo di carico consentito per l'esercizio
 * @param {boolean} [isCavoOMacchina=false]
 * @returns {number} Carico arrotondato necessario
 */
export const calcolaCaricoTargetRecord1RM = (targetE1RM, targetReps, stepKg = 2.5, isCavoOMacchina = false) => {
  if (!targetE1RM || targetE1RM <= 0 || !targetReps || targetReps <= 0) return 0;
  const step = stepKg > 0 ? stepKg : 2.5;
  const rawTargetAbs = calcolaPesoDaE1RMSmorzato(targetE1RM + 0.05, targetReps, isCavoOMacchina);
  if (rawTargetAbs <= 0) return 0;
  let targetKg = Math.ceil(rawTargetAbs / step) * step;
  return Math.round(targetKg * 10) / 10;
};

/**
 * Calcola esattamente quante ripetizioni servono con un dato peso per eguagliare o superare un 1RM target.
 * @param {number} peso 
 * @param {number} targetE1RM 
 * @param {boolean} [isCavoOMacchina=false] 
 * @param {number} [maxRepsLimit=60] 
 * @returns {{ repsEguaglia: number, repsSupera: number, e1rmEguaglia: number, e1rmSupera: number, isPossible: boolean }}
 */
export const calcolaRepsPerE1RMTarget = (peso, targetE1RM, isCavoOMacchina = false, maxRepsLimit = 60) => {
  if (!peso || peso <= 0 || !targetE1RM || targetE1RM <= 0) {
    return { repsEguaglia: 0, repsSupera: 0, e1rmEguaglia: 0, e1rmSupera: 0, isPossible: false };
  }
  
  // Risoluzione analitica continua e rigorosa
  // e1rm = peso * (1 + r / 30) >= targetE1RM  =>  r >= 30 * (targetE1RM / peso - 1)
  const rawReps = 30 * ((targetE1RM / peso) - 1);
  
  const repsEguaglia = Math.max(1, Math.ceil(rawReps - 0.0001));
  const repsSupera = Math.max(1, Math.floor(rawReps + 0.0001) + 1);

  return {
    repsEguaglia,
    repsSupera,
    e1rmEguaglia: Math.round(calcolaE1RM(peso, repsEguaglia) * 10) / 10,
    e1rmSupera: Math.round(calcolaE1RM(peso, repsSupera) * 10) / 10,
    isPossible: repsSupera <= maxRepsLimit
  };
};

/**
 * Calcola la combinazione bilanciata (carico x reps con reps <= maxReps) necessaria per superare realmente l'1RM target.
 * @param {number} pesoAttuale 
 * @param {number} targetE1RM 
 * @param {number} [stepKg=2.5] 
 * @param {number} [maxReps=14] 
 * @param {boolean} [isCavoOMacchina=false] 
 * @returns {{ peso: number, reps: number, e1rm: number, deltaPeso: number, isFeasible: boolean }|null}
 */
export const calcolaObiettivoBilanciato1RM = (pesoAttuale, targetE1RM, stepKg = 2.5, maxReps = 14, isCavoOMacchina = false) => {
  if (!targetE1RM || targetE1RM <= 0) return null;
  const startP = pesoAttuale > 0 ? pesoAttuale : stepKg;
  const step = stepKg > 0 ? stepKg : 2.5;

  for (let s = 0; s <= 30; s++) {
    const p = Math.round((startP + (s * step)) * 100) / 100;
    const { repsSupera, e1rmSupera, isPossible } = calcolaRepsPerE1RMTarget(p, targetE1RM, isCavoOMacchina);
    if (isPossible && repsSupera <= maxReps && repsSupera >= 1) {
      return {
        peso: p,
        reps: repsSupera,
        e1rm: e1rmSupera,
        deltaPeso: pesoAttuale > 0 ? Math.round((p - pesoAttuale) * 10) / 10 : 0,
        isFeasible: true
      };
    }
  }

  const rawPesoAtMaxReps = calcolaPesoDaE1RM(targetE1RM + 0.1, maxReps);
  const roundedP = Math.ceil(rawPesoAtMaxReps / step) * step;
  const finalP = Math.round(roundedP * 10) / 10;
  const calcFinal = calcolaRepsPerE1RMTarget(finalP, targetE1RM, isCavoOMacchina);
  return {
    peso: finalP,
    reps: Math.min(calcFinal.repsSupera, maxReps),
    e1rm: calcFinal.e1rmSupera,
    deltaPeso: pesoAttuale > 0 ? Math.round((finalP - pesoAttuale) * 10) / 10 : 0,
    isFeasible: true
  };
};

/**
 * Calcola la tabella delle reps necessarie con diversi carichi per eguagliare e superare il record assoluto,
 * confrontando con le ripetizioni prescritte.
 * @param {number} pesoAttuale 
 * @param {number} targetE1RM 
 * @param {number} [stepKg=2.5] 
 * @param {boolean} [isCavoOMacchina=false]
 * @param {number} [numPesi=3] 
 * @param {number} [targetRepsPrescritte=12]
 * @returns {Array<{ peso: number, isCaricoAttuale: boolean, stepIndex: number, repsEguaglia: number, repsSupera: number, deltaRepsVsPrescritte: number, labelDisplay: string, e1rmSupera: number, isRealistico: boolean }>}
 */
export const calcolaTabellaRepsRecordAssoluto = (pesoAttuale, targetE1RM, stepKg = 2.5, isCavoOMacchina = false, numPesi = 3, targetRepsPrescritte = 12) => {
  if (!targetE1RM || targetE1RM <= 0 || !pesoAttuale || pesoAttuale <= 0) return [];
  const step = stepKg > 0 ? stepKg : 2.5;
  const targetReps = targetRepsPrescritte > 0 ? parseInt(targetRepsPrescritte, 10) : 12;
  const result = [];

  for (let i = 0; i < numPesi; i++) {
    const p = Math.round((pesoAttuale + (i * step)) * 100) / 100;
    const calc = calcolaRepsPerE1RMTarget(p, targetE1RM, isCavoOMacchina);
    const deltaReps = calc.repsSupera - targetReps;
    let labelDisplay = `${calc.repsSupera} reps`;
    if (deltaReps > 0) {
      labelDisplay = `${calc.repsSupera} reps (+${deltaReps} rispetto alle previste)`;
    } else if (deltaReps === 0) {
      labelDisplay = `${calc.repsSupera} reps (a target)`;
    } else {
      labelDisplay = `${calc.repsSupera} reps (${deltaReps} rispetto alle previste)`;
    }

    result.push({
      peso: p,
      isCaricoAttuale: i === 0,
      stepIndex: i,
      repsEguaglia: calc.repsEguaglia,
      repsSupera: calc.repsSupera,
      deltaRepsVsPrescritte: deltaReps,
      labelDisplay,
      e1rmSupera: calc.e1rmSupera,
      isRealistico: calc.repsSupera <= 35
    });
  }
  return result;
};

/**
 * Valuta in modo centralizzato e riutilizzabile se la situazione corrente rappresenta
 * una reale "Opportunità PR".
 * @param {Object} params
 * @param {number} params.sett Settimana corrente (1..6)
 * @param {boolean} params.ghostPRAttackAttivo Flag impostazioni utente
 * @param {number} params.targetReps Reps prescritte
 * @param {number} params.prTargetRepsWeight PR attuale a target reps
 * @param {number} params.currentE1RM 1RM stimato corrente
 * @param {number} params.max1RM Record 1RM storico assoluto
 * @param {number} params.smartVal Carico Smart proposto
 * @param {number} params.sfidanteVal Carico Sfidante proposto
 * @param {number} params.stepKg Passo incrementale
 * @param {boolean} params.isCorpoLiberoPuro
 * @param {boolean} params.hasInfortunio
 * @returns {{ isOpportunita: boolean, percentuale: number, motivo: string, sfidanteIsProtagonista: boolean, targetNuovoPRKg: number, targetRecordAssolutoKg: number, isMultiObjective: boolean }}
 */
export const valutaOpportunitaPR = ({
  sett,
  ghostPRAttackAttivo,
  targetReps = 12,
  prTargetRepsWeight = 0,
  currentE1RM = 0,
  max1RM = 0,
  smartVal = 0,
  sfidanteVal = 0,
  stepKg = 2.5,
  isCorpoLiberoPuro = false,
  hasInfortunio = false
}) => {
  if (isCorpoLiberoPuro || hasInfortunio || !ghostPRAttackAttivo) {
    return {
      isOpportunita: false,
      percentuale: 0,
      motivo: '',
      sfidanteIsProtagonista: false,
      targetNuovoPRKg: 0,
      targetRecordAssolutoKg: 0,
      isMultiObjective: false
    };
  }

  // Calcolo carichi necessari a target reps
  const targetNuovoPRKg = prTargetRepsWeight > 0 
    ? Math.round((prTargetRepsWeight + stepKg) * 10) / 10 
    : (smartVal > 0 ? smartVal : stepKg);

  let targetRecordAssolutoKg = targetNuovoPRKg;
  if (max1RM > 0 && targetReps > 0) {
    targetRecordAssolutoKg = calcolaCaricoTargetRecord1RM(max1RM, targetReps, stepKg);
  }

  // Verifica multi-obiettivo: se il carico sfidante alle reps prescritte supera ENTRAMBI
  const e1rmSfidanteTargetReps = (sfidanteVal > 0 && targetReps > 0) ? calcolaE1RM(sfidanteVal, targetReps) : 0;
  const superaPR = sfidanteVal > prTargetRepsWeight;
  const supera1RM = max1RM > 0 ? (e1rmSfidanteTargetReps > max1RM) : true;
  const isMultiObjective = Boolean(superaPR && supera1RM && sfidanteVal > 0);

  // Distanza dal record 1RM
  let e1rmProximityPct = 0;
  let diff1RMKg = 0;
  if (max1RM > 0 && currentE1RM > 0) {
    e1rmProximityPct = Math.min(100, Math.round((currentE1RM / max1RM) * 1000) / 10);
    diff1RMKg = Math.max(0, Math.round((max1RM - currentE1RM) * 10) / 10);
  } else if (max1RM === 0 && currentE1RM > 0) {
    e1rmProximityPct = 100;
  }

  // Condizioni per essere considerata Opportunità PR e promuovere Sfidante:
  // 1. Week 6 (picco del mesociclo)
  // 2. Attacco record PR attivo
  // 3. Prossimità al record elevata (≥ 85% o diff ≤ 3.5kg o sfidante raggiunge/supera il record a target reps)
  // 4. Tentativo realistico (sfidanteVal <= smartVal + 2*stepKg)
  const isW6 = sett === 6;
  const isRecordVicino = e1rmProximityPct >= 85 || diff1RMKg <= (stepKg * 2) || sfidanteVal >= targetRecordAssolutoKg || sfidanteVal >= targetNuovoPRKg;
  const isTentativoRealistico = sfidanteVal > 0 && (sfidanteVal <= (smartVal + (stepKg * 2.5)));

  const isOpportunita = Boolean(isW6 && ghostPRAttackAttivo && isRecordVicino && isTentativoRealistico);

  // Calcolo percentuale opportunità (tra 75% e 96%)
  let percentuale = 85;
  if (isOpportunita) {
    if (e1rmProximityPct > 0) {
      percentuale = Math.min(96, Math.max(78, Math.round(e1rmProximityPct * 0.95)));
    } else {
      percentuale = 89;
    }
  }

  const motivo = 'Vicino al record: W6 è ideale per il primato!';

  return {
    isOpportunita,
    percentuale,
    motivo,
    sfidanteIsProtagonista: isOpportunita,
    targetNuovoPRKg,
    targetRecordAssolutoKg,
    isMultiObjective
  };
};

/**
 * Estrae la migliore prestazione singola (carico, reps, e1rm) da un log (anche multi-riga).
 * @param {string} strVal Testo ins_week
 * @param {number} [defaultReps=10]
 * @param {boolean} [isCavo=false]
 * @param {boolean} [isCorpoLibero=false]
 * @returns {{ peso: number, reps: number, e1rm: number, isZavorrato: boolean }|null}
 */
export const estraiMigliorPrestazioneInput = (strVal, defaultReps = 10, isCavo = false, isCorpoLibero = false) => {
  if (!strVal) return null;
  const str = String(strVal).trim();
  if (!str || str === '-') return null;

  const lines = str.split(/[\n;\r]+/);
  let bestPerf = null;
  let maxE1RM = -1;
  const hasZavorra = haSovraccaricoEsplicito(str);

  lines.forEach(line => {
    const l = line.trim();
    if (!l) return;

    const pesoStr = estraiPesoDaInput(l, { isCorpoLibero });
    const explicitReps = estraiRepsDaInput(l, { isCorpoLibero });
    const reps = (explicitReps && explicitReps > 0) ? explicitReps : defaultReps;

    if (pesoStr) {
      const peso = parseFloat(pesoStr);
      if (!isNaN(peso) && peso > 0) {
        const e1rm = calcolaE1RMSmorzato(peso, reps, isCavo);
        if (e1rm > maxE1RM) {
          maxE1RM = e1rm;
          bestPerf = { peso, reps, e1rm, isZavorrato: isCorpoLibero && hasZavorra };
        }
      }
    } else if (isCorpoLibero && explicitReps) {
      // Corpo libero puro (senza sovraccarico)
      if (explicitReps > maxE1RM) {
        maxE1RM = explicitReps;
        bestPerf = { peso: 0, reps: explicitReps, e1rm: explicitReps, isZavorrato: false };
      }
    }
  });

  return bestPerf;
};

/**
 * Determina se un testo di input (ins_week) contiene un tag o indicatore accreditato di Progressione Qualitativa.
 * Segue rigorosamente le regole del Controllo Qualità:
 * 1. Esclude QUALSIASI nota libera o commento racchiuso tra parentesi tonde (...) o graffe {...}.
 * 2. Verifica se il testo residuo (inclusi i tag racchiusi tra parentesi quadre [...]) contiene indicatori qualitativi.
 * 3. Esclude esplicitamente stati di mantenimento / nessuno.
 * 4. Usa confini di parola (word-boundary) per evitare falsi positivi su parole del dizionario (es. "tutte", "promemoria").
 *
 * @param {string} strVal Testo inserito dall'utente (es. "75 75 77,5 [Eccentrica più lenta (TUT)]", "60 🌟")
 * @returns {boolean}
 */
export const haProgressioneQualitativa = (strVal) => {
  if (!strVal) return false;
  const raw = String(strVal).trim();
  if (!raw || raw === '-') return false;

  const lowerRaw = raw.toLowerCase();

  // Esclusione esplicita di stati neutri / mantenimento
  if (lowerRaw.includes('mantenimento') || lowerRaw.includes('nessuno')) return false;

  // Se contiene l'emoji stella di progressione qualitativa
  if (raw.includes('🌟')) return true;

  // 1. Controllo se ci sono tag specifici racchiusi tra parentesi quadre [...] (es. inseriti dai chip dell'app)
  const bracketMatches = lowerRaw.match(/\[([^\]]+)\]/g);
  if (bracketMatches) {
    for (const b of bracketMatches) {
      const bContent = b.replace(/[\[\]]/g, '').trim();
      if (
        bContent.includes('eccentrica') ||
        bContent.includes('tut') ||
        bContent.includes('rom') ||
        bContent.includes('controllo') ||
        bContent.includes('rir') ||
        bContent.includes('pausa') ||
        bContent.includes('recupero') ||
        bContent.includes('qualitat') ||
        bContent.includes('fermo') ||
        bContent.includes('+1') ||
        bContent.includes('+2') ||
        bContent.includes('+3') ||
        bContent.includes('extra') ||
        bContent.includes('reps in più') ||
        bContent.includes('più reps') ||
        bContent.includes('rep extra')
      ) {
        return true;
      }
    }
  }

  // 2. Rimuove QUALSIASI commento/nota libera tra parentesi tonde (...) o graffe {...} e quadre [...]
  // per verificare l'eventuale presenza di keyword tecniche digitate a testo libero fuori dalle parentesi
  const cleanOutside = raw
    .replace(/\+\s*\([^\)]*\)/g, ' ')
    .replace(/\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^\}]*\}/g, ' ')
    .trim();

  if (!cleanOutside) return false;

  // 3. Controllo con Word Boundary (\b) sul testo libero fuori parentesi
  return (
    /\b(?:eccentrica|eccentriche)\b/i.test(cleanOutside) ||
    /\b(?:tut|t\.u\.t\.)\b/i.test(cleanOutside) ||
    /\b(?:rom|r\.o\.m\.)\b/i.test(cleanOutside) ||
    /\b(?:controllo|frenata|isometria|isometrica)\b/i.test(cleanOutside) ||
    /\b(?:rir|r\.i\.r\.)\b/i.test(cleanOutside) ||
    /\b(?:pausa|fermo|fermo\s+al\s+petto|fermo\s+in\s+buca)\b/i.test(cleanOutside) ||
    /\b(?:recupero\s+ridotto|densità)\b/i.test(cleanOutside) ||
    /\b(?:qualitativ[ao]|qualità)\b/i.test(cleanOutside) ||
    /\b(?:reps?\s+in\s+più|più\s+reps?|rep\s+extra|reps\s+extra)\b/i.test(cleanOutside) ||
    /\+(?:1|2|3)\s*(?:rep|colpo|reps)?\b/i.test(cleanOutside)
  );
};

