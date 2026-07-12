const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const fs = require('fs');
const path = require('path');

// Helpers and functions copied from Dettaglio.vue for simulation
const METODI_ALLENAMENTO = {
  // Mock methods if any, let's define as empty to avoid crashing
};

function formatWeight(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace('.', ',');
}

const getRIRDefault = (week) => {
  if (week === 1) return 2;
  if (week === 2) return 1.5;
  if (week === 3) return 0.5;
  if (week === 4) return 3.5;
  if (week === 5) return 0;
  if (week === 6) return 0;
  return 0;
};

const estraiRepsDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return null;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').trim();
  
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

const estraiRIRDaPrescrizione = (text) => {
  if (!text) return null;
  const clean = String(text).toLowerCase();
  
  const matchRIR = clean.match(/rir\s*[:=\s@]?\s*([0-4](?:\.\d+)?)/i);
  if (matchRIR) {
    const val = parseFloat(matchRIR[1]);
    if (!isNaN(val)) return val;
  }
  
  if (clean.includes('cedimento') || clean.includes('ced.') || clean.includes('buffer 0')) {
    return 0;
  }
  
  return null;
};

function estraiRepsDaInput(str) {
  if (!str) return null;
  let clean = String(str).replace(/,/g, '.').trim();
  
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo)\b\s*\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, '').trim();
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, '').trim();
  
  const matchX = clean.match(/^\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*[rR]?\b)?\s*$/);
  if (matchX) {
    return parseFloat(matchX[2]);
  }
  
  const matchR = clean.match(/(\d+(?:\.\d+)?)\s*[rR]\b/);
  if (matchR) {
    return parseFloat(matchR[1]);
  }
  
  return null;
}

function estraiPesoDaInput(str) {
  if (!str) return null;
  
  let clean = str.replace(/,/g, '.').trim();
  
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo)\b\s*\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, '').trim();
  
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, '').trim();

  const matchX = clean.match(/^\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*[rR]?\b)?\s*$/);
  if (matchX) {
    return matchX[1];
  }
  
  const repsPrefixRegex = /^\s*\d+\s*[xX]\s*\d+(?:\s*[a-zA-Z+]*\b)?/g;
  clean = clean.replace(repsPrefixRegex, '').trim();
  
  const numberRegex = /\d+(?:\.\d+)?/g;
  
  let match;
  const validWeights = [];
  
  const settingKeywords = [
    'panca', 'inclinazione', 'inclinata', 'inclinato', 'buco', 'buca', 'buchi', 
    'foro', 'fori', 'tacca', 'tacche', 'tacchetta', 'tacchette', 'posizione', 'pos', 'altezza', 
    'inc', 'gradi', 'grado', '°', 'seduto', 'seduta', 'step', 'pin', 'livello', 'liv', 
    'regolazione', 'tacc', 'tassello', 'tavoletta', 'board', 'catena', 'catene', 'elastico', 
    'elastici', 'blocco', 'blocchi', 'box', 'serie', 'set', 'sets', 'reps', 'rep', 
    'ripetizioni', 'rip', 'colpi', 'colpo', 'giro', 'giri', 'circuiti', 'circuito', 
    'volte', 'volta', 'passi', 'passo', 'speed', 'velocità', 'vel', 'tempo'
  ];
  
  const stopWords = [
    'a', 'di', 'su', 'in', 'da', 'alla', 'al', 'del', 'della', 'n', 'n.', 'num', 
    'num.', 'n°', 'pos', 'pos.', '#', ':', '::', '@', 'at', 'con', 'e', 'o', 'per'
  ];
  
  while ((match = numberRegex.exec(clean)) !== null) {
    const numStr = match[0];
    const numVal = parseFloat(numStr);
    const startIdx = match.index;
    const endIdx = startIdx + numStr.length;
    
    if (isNaN(numVal)) continue;
    
    const suffixStr = clean.substring(endIdx);
    const suffixClean = suffixStr.trim();
    
    if (suffixClean.toLowerCase().startsWith('k')) {
      validWeights.push(numVal);
      continue;
    }
    
    if (suffixClean.toLowerCase().match(/^r(?![a-z])/i) || 
        suffixClean.toLowerCase().startsWith('rep') || 
        suffixClean.toLowerCase().startsWith('rip')) {
      continue;
    }
    
    const suffixTokens = suffixClean.split(/[\s\-+:=@]+/);
    const suffixToken = (suffixTokens[0] || '').toLowerCase().trim();
    
    if (suffixClean.startsWith('°') || settingKeywords.some(word => suffixToken.includes(word) || suffixClean.toLowerCase().startsWith(word))) {
      continue;
    }
    
    if (suffixToken) {
      const suffixExclusions = ['/', '%', 'rpe', 'sec', 'secondi', 'secondo', 'min', 'minuti', 'minuto', 'metri', 'metro'];
      if (suffixToken.startsWith('/') || suffixExclusions.includes(suffixToken) || (suffixToken === 's' || suffixToken === 'm')) {
        continue;
      }
    }
    
    const prefixStr = clean.substring(0, startIdx);
    const prefixTokens = prefixStr.trim().split(/[\s\-+:=@°]+/);
    
    let prefixWord = '';
    for (let i = prefixTokens.length - 1; i >= 0; i--) {
      const token = prefixTokens[i].toLowerCase().trim();
      if (!token) continue;
      if (stopWords.includes(token)) {
        continue;
      }
      prefixWord = token;
      break;
    }
    
    if (prefixWord) {
      if (settingKeywords.some(word => prefixWord === word || prefixWord.includes(word)) || prefixWord === 'rpe' || prefixWord === 'rp') {
        continue;
      }
    }
    
    validWeights.push(numVal);
  }
  
  if (validWeights.length > 0) {
    return String(Math.max(...validWeights));
  }
  
  return null;
}

const isCorpoLiberoEsercizio = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const note = String(ex.des_note_attrezzo || '').toLowerCase();
  const attr = String(ex.des_note_gen_attr || '').toLowerCase();
  
  const keywords = [
    'corpo libero', 'corpolibero', 'trazioni', 'dip', 'piegamenti', 
    'push up', 'push-up', 'crunch', 'plank', 'sit up', 'sit-up', 
    'addominali', 'addome', 'leg raise', 'hyperextension', 'corpo_libero',
    'dragon'
  ];
  
  return keywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k));
};

const isManubriEsercizio = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const noteAttr = String(ex.des_note_attrezzo || '').toLowerCase();
  const noteGen = String(ex.des_note_gen_attr || '').toLowerCase();
  const noteCoach = String(ex.des_note || '').toLowerCase();
  
  return name.includes('manubri') || name.includes('manubrio') || 
         noteAttr.includes('manubri') || noteAttr.includes('manubrio') ||
         noteGen.includes('manubri') || noteGen.includes('manubrio') ||
         noteCoach.includes('manubri') || noteCoach.includes('manubrio');
};

const getWeightStep = (isManubri, baseWeight) => {
  if (!isManubri) return 2.5;
  const p = parseFloat(baseWeight) || 0;
  return p >= 10 ? 2.0 : 1.0;
};

const getNSCAPercentage = (reps) => {
  const r = Math.max(1, Math.min(30, Math.round(reps)));
  const table = {
    1: 1.00, 2: 0.95, 3: 0.93, 4: 0.90, 5: 0.87,
    6: 0.85, 7: 0.83, 8: 0.80, 9: 0.77, 10: 0.75,
    11: 0.73, 12: 0.70, 13: 0.683, 14: 0.667, 15: 0.65,
    16: 0.633, 17: 0.617, 18: 0.60, 19: 0.58, 20: 0.56,
    21: 0.54, 22: 0.52, 23: 0.50, 24: 0.48, 25: 0.46,
    26: 0.44, 27: 0.42, 28: 0.40, 29: 0.38, 30: 0.36
  };
  return table[r] || 0.35;
};

const calcolaPropostaCaricoDinamico = (baseWeight, baseReps, baseRIR, currW1Reps, fatica, giorniTrascorsi) => {
  const wBase = parseFloat(String(baseWeight).replace(',', '.'));
  if (isNaN(wBase) || wBase <= 0) return null;
  
  const rBase = baseReps ? parseInt(baseReps, 10) : 10;
  const r1 = currW1Reps ? parseInt(currW1Reps, 10) : 10;
  const rirBase = baseRIR !== null ? baseRIR : 0;
  
  // Determinazione del passo di arrotondamento (1.0 per manubri, 1.25 per bilancieri)
  const isManubri = workout.value ? isManubriEsercizio(workout.value) : false;
  const step = isManubri ? 1.0 : 1.25;

  // FASE 1: Stima 1RM
  const repsBaseTotali = rBase + rirBase;
  let estimated1RM;
  if (repsBaseTotali <= 10) {
    // Epley per <= 10 reps
    estimated1RM = wBase * (1 + repsBaseTotali / 30);
  } else {
    // NSCA per > 10 reps
    estimated1RM = wBase / getNSCAPercentage(repsBaseTotali);
  }

  // Riduzione prudenziale in base al tempo passato
  let dateFactor = 1.0;
  if (giorniTrascorsi > 180) {
    dateFactor = 0.97; // max -3%
  } else if (giorniTrascorsi > 90) {
    dateFactor = 0.98; // -2%
  } else if (giorniTrascorsi > 30) {
    dateFactor = 0.99; // -1%
  }

  // Helper per calcolare e arrotondare il peso per un certo RIR target
  const calcolaPesoConRIR = (rirVal) => {
    const repsW1Totali = r1 + rirVal;
    let weightCalc;
    if (repsW1Totali <= 10) {
      // Epley per <= 10 reps
      weightCalc = estimated1RM / (1 + repsW1Totali / 30);
    } else {
      // NSCA per > 10 reps
      weightCalc = estimated1RM * getNSCAPercentage(repsW1Totali);
    }
    weightCalc = weightCalc * dateFactor;
    return Math.round(weightCalc / step) * step;
  };

  // Determina i 3 RIR target teorici per i 3 livelli di fatica
  let rirW1Base = estraiRIRDaPrescrizione(workout.value?.des_week1) !== null ? estraiRIRDaPrescrizione(workout.value?.des_week1) : 2;
  
  let rirMedia, rirPesante, rirDevastante;
  if (r1 <= rBase) {
    rirMedia = 1.25;
    rirPesante = 2.25;
    rirDevastante = 3.25;
  } else {
    rirMedia = rirW1Base;
    rirPesante = rirW1Base + 0.5;
    rirDevastante = rirW1Base + 1.0;
  }

  // Calcola i 3 pesi teorici arrotondati
  let pesoMedia = calcolaPesoConRIR(rirMedia);
  let pesoPesante = calcolaPesoConRIR(rirPesante);
  let pesoDevastante = calcolaPesoConRIR(rirDevastante);

  // Applica la regola di decremento minimo garantito (Opzione 1)
  if (pesoPesante >= pesoMedia && pesoMedia > 0) {
    pesoPesante = Math.max(0, pesoMedia - step);
  }
  if (pesoDevastante >= pesoPesante && pesoPesante > 0) {
    pesoDevastante = Math.max(0, pesoPesante - step);
  } else if (pesoDevastante >= pesoMedia && pesoMedia > 0) {
    pesoDevastante = Math.max(0, pesoMedia - (2 * step));
  }

  // Restituisce il peso specifico richiesto in base alla fatica dell'esercizio
  const faticaLower = (fatica || '').toLowerCase().trim();
  if (faticaLower.includes('pesante') || faticaLower === '4') {
    return pesoPesante;
  } else if (faticaLower.includes('devastante') || faticaLower === '5') {
    return pesoDevastante;
  } else {
    return pesoMedia;
  }
};

// Simulation state
let workout = { value: null };
let previousWorkout = { value: null };
let storicoEsercizio = { value: [] };
let storicoEsercizioPerAiuto = { value: [] };
let inputSettimane = {
  value: {
    1: { ins: '', reps: '' },
    2: { ins: '', reps: '' },
    3: { ins: '', reps: '' },
    4: { ins: '', reps: '' },
    5: { ins: '', reps: '' },
    6: { ins: '', reps: '' }
  }
};
let inputSettimanePrecedente = {
  value: {
    1: { ins: '', reps: '' },
    2: { ins: '', reps: '' },
    3: { ins: '', reps: '' },
    4: { ins: '', reps: '' },
    5: { ins: '', reps: '' },
    6: { ins: '', reps: '' }
  }
};
let propostaBaseWeek2 = { value: 'W1' };
let propostaBaseWeek5 = { value: 'W3' };
let propostaBaseWeek6 = { value: 'W5' };
let modalitaIncrementoGhost = { value: 'ibrida' };
let ghostPRAttackAttivo = { value: true };
let ghostAutoregolazioneRepsAttiva = { value: true };
let sfidaRecordWeek1 = { value: false };
let SOGLIA_FORZA_MANUBRI = { value: 10 };
let INCREMENTO_MANUBRI_LEGGERO = { value: 1.0 };
let INCREMENTO_MANUBRI_FORTE = { value: 2.0 };
let INCREMENTO_PESO_POST_SCARICO_PCT = { value: 2.5 };
let FATICA_PESANTE_STORICO_PCT = { value: 2.5 };
let FATICA_DEVASTANTE_STORICO_PCT = { value: 5.0 };

const getRepsForWeek = (w) => {
  if (!workout.value) return null;
  let reps = workout.value['reps_week' + w];
  if (!reps) {
    reps = estraiRepsDaPrescrizione(workout.value['des_week' + w]);
  }
  return reps ? parseInt(reps, 10) : null;
};

const isWeek4Scarico = {
  get value() {
    const repsW4 = getRepsForWeek(4);
    const repsW3 = getRepsForWeek(3);
    return repsW4 && repsW3 && repsW4 > repsW3;
  }
};

const calcolaIncrementoDinamicoMedio = (targetWeek) => {
  const pesiSettimanali = [];
  for (let w = 1; w < targetWeek; w++) {
    if (w === 4 && isWeek4Scarico.value) continue;
    
    const insVal = inputSettimane.value[w]?.ins;
    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      const pesoStr = estraiPesoDaInput(insVal);
      if (pesoStr) {
        const peso = parseFloat(pesoStr);
        if (!isNaN(peso) && peso > 0) {
          pesiSettimanali.push({ week: w, peso: peso });
        }
      }
    }
  }

  let sommaPercentuali = 0;
  let conteggio = 0;
  
  for (let i = 0; i < pesiSettimanali.length - 1; i++) {
    const p1 = pesiSettimanali[i].peso;
    const p2 = pesiSettimanali[i+1].peso;
    if (p2 > p1) {
      const pct = (p2 - p1) / p1;
      sommaPercentuali += pct;
      conteggio++;
    }
  }

  if (conteggio > 0) {
    return sommaPercentuali / conteggio;
  }

  let storicoSommaPct = 0;
  let storicoConteggio = 0;
  
  if (storicoEsercizio.value && storicoEsercizio.value.length > 0) {
    storicoEsercizio.value.forEach(prevEx => {
      const pesiEx = [];
      for (let w = 1; w <= 6; w++) {
        if (w === 4 && isWeek4Scarico.value) continue;
        const insVal = prevEx['ins_week' + w];
        if (insVal) {
          const pesoStr = estraiPesoDaInput(insVal);
          if (pesoStr) {
            const peso = parseFloat(pesoStr);
            if (!isNaN(peso) && peso > 0) {
              pesiEx.push(peso);
            }
          }
        }
      }
      for (let i = 0; i < pesiEx.length - 1; i++) {
        const p1 = pesiEx[i];
        const p2 = pesiEx[i+1];
        if (p2 > p1) {
          storicoSommaPct += (p2 - p1) / p1;
          storicoConteggio++;
        }
      }
    });
  }

  if (storicoConteggio > 0) {
    return storicoSommaPct / storicoConteggio;
  }

  return 0.025;
};

const getBaseWeekInfo = (sett) => {
  if (!workout.value) return null;
  let baseWNum = null;
  let isPreviousWorkoutW6 = false;

  if (sett === 2) {
    const baseW = propostaBaseWeek2.value;
    if (baseW === 'W6 Prec.') {
      isPreviousWorkoutW6 = true;
    } else {
      baseWNum = 1;
    }
  } else if (sett === 3) {
    baseWNum = 2;
  } else if (sett === 4) {
    baseWNum = 2;
  } else if (sett === 5) {
    baseWNum = parseInt(propostaBaseWeek5.value.replace('W', ''), 10) || 3;
  } else if (sett === 6) {
    baseWNum = parseInt(propostaBaseWeek6.value.replace('W', ''), 10) || 5;
  } else if (sett > 1) {
    baseWNum = sett - 1;
  }

  let repsBase = 10;
  let pesoBase = null;
  let baseInsText = '';

  if (isPreviousWorkoutW6) {
    if (previousWorkout.value) {
      const prevW6Text = previousWorkout.value.num_ins6 || previousWorkout.value.ins_week6;
      if (prevW6Text) {
        baseInsText = String(prevW6Text);
        const pStr = estraiPesoDaInput(baseInsText);
        pesoBase = pStr ? parseFloat(pStr) : null;
      }
      const prevW6Reps = previousWorkout.value.reps_week6 || estraiRepsDaPrescrizione(previousWorkout.value.des_week6);
      repsBase = prevW6Reps ? parseInt(prevW6Reps, 10) : 10;
    }
  } else if (baseWNum) {
    const repsVal = workout.value['reps_week' + baseWNum];
    repsBase = repsVal ? parseInt(repsVal, 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
    const insVal = inputSettimane.value[baseWNum]?.ins;
    if (insVal) {
      baseInsText = insVal;
      const pStr = estraiPesoDaInput(insVal);
      pesoBase = pStr ? parseFloat(pStr) : null;
    }
  }

  const repsTargetVal = workout.value['reps_week' + sett];
  const repsTarget = repsTargetVal ? parseInt(repsTargetVal, 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + sett]) || 10);

  return {
    baseWNum,
    isPreviousWorkoutW6,
    repsBase,
    repsTarget,
    pesoBase,
    baseInsText
  };
};

const proponiProgressioneCaricoRIR = (targetWeek, baseWeekNum, baseInsText) => {
  if (!baseInsText || !workout.value) return null;
  const pesoStr = estraiPesoDaInput(baseInsText);
  if (!pesoStr) return null;
  const pesoBase = parseFloat(pesoStr);
  if (isNaN(pesoBase) || pesoBase <= 0) return null;
  
  let repsBase = estraiRepsDaInput(baseInsText);
  if (repsBase === null || isNaN(repsBase) || repsBase <= 0) {
    repsBase = workout.value['reps_week' + baseWeekNum] ? parseInt(workout.value['reps_week' + baseWeekNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWeekNum]) || 10);
  }
  const repsTarget = workout.value['reps_week' + targetWeek] ? parseInt(workout.value['reps_week' + targetWeek], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + targetWeek]) || 10);
  
  const rirBaseStr = estraiRIRDaPrescrizione(workout.value['des_week' + baseWeekNum]);
  const rirBase = rirBaseStr !== null ? rirBaseStr : getRIRDefault(baseWeekNum);
  
  const rirTargetStr = estraiRIRDaPrescrizione(workout.value['des_week' + targetWeek]);
  const rirTarget = rirTargetStr !== null ? rirTargetStr : getRIRDefault(targetWeek);
  
  const estimated1RM_fisso = pesoBase * (1 + (repsBase + rirBase) / 30);
  const pesoFisso = estimated1RM_fisso / (1 + (repsTarget + rirTarget) / 30);
  
  const pctIncremento = calcolaIncrementoDinamicoMedio(targetWeek);
  const fattoreBase = 1 + (repsBase + rirBase) / 30;
  const fattoreTarget = 1 + (repsTarget + rirTarget) / 30;
  const pesoDinamico = pesoBase * (1 + pctIncremento) * (fattoreBase / fattoreTarget);
  
  let proposedWeight;
  let ratioDinamico = 0.5;
  const repsTargetPrescritteBase = workout.value['reps_week' + baseWeekNum] ? parseInt(workout.value['reps_week' + baseWeekNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWeekNum]) || 10);
  
  if (ghostAutoregolazioneRepsAttiva.value && repsBase !== repsTargetPrescritteBase) {
    if (repsBase > repsTargetPrescritteBase) {
      ratioDinamico = 0.8;
    } else {
      ratioDinamico = 0.2;
    }
  }
  
  if (modalitaIncrementoGhost.value === 'ibrida') {
    proposedWeight = (ratioDinamico * pesoDinamico) + ((1 - ratioDinamico) * pesoFisso);
  } else if (modalitaIncrementoGhost.value === 'dinamica') {
    proposedWeight = pesoDinamico;
  } else {
    proposedWeight = pesoFisso;
  }
  
  if (ghostAutoregolazioneRepsAttiva.value && repsBase !== repsTargetPrescritteBase) {
    if (repsBase > repsTargetPrescritteBase) {
      const diffReps = repsBase - repsTargetPrescritteBase;
      const boostFactor = 1 + (diffReps * 0.015);
      proposedWeight = pesoBase + (proposedWeight - pesoBase) * boostFactor;
    } else {
      const diffReps = repsTargetPrescritteBase - repsBase;
      const penaltyFactor = Math.max(0, 1 - (diffReps * 0.2));
      proposedWeight = pesoBase + (proposedWeight - pesoBase) * penaltyFactor;
      if (proposedWeight > pesoBase) {
        proposedWeight = pesoBase;
      }
    }
  }
  
  if (isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase) {
    if (proposedWeight > pesoBase) {
      proposedWeight = pesoBase;
    }
  }
  
  const isManubri = isManubriEsercizio(workout.value);
  const step = getWeightStep(isManubri, pesoBase);
  
  proposedWeight = Math.round(proposedWeight / step) * step;
  
  if (ghostPRAttackAttivo.value) {
    const recordVal = ottieniRecordStoricoPerReps(repsTarget);
    if (recordVal && recordVal > 0) {
      if (proposedWeight < recordVal && (proposedWeight >= recordVal * 0.95 || proposedWeight >= recordVal - 2.5)) {
        proposedWeight = Math.round((recordVal + step) / step) * step;
      }
    }
  }
  
  return proposedWeight;
};

const getGhostLiftStandard = (sett) => {
  if (!workout.value) return null;

  const prescrizione = String(workout.value['des_week' + sett] || '');
  const hasPercFlag = workout.value.flg_perc && String(workout.value.flg_perc).includes('V%');
  if (prescrizione.includes('%') || hasPercFlag) {
    return null;
  }

  const isRepEx = isCorpoLiberoEsercizio(workout.value);

  if (sett === 1) {
    if (!previousWorkout.value) return null;
    const p = propostaWeek1.value;
    if (!p) return null;

    if (p.erroreCarichi) {
      return {
        isWeek1: true,
        isRepExercise: isRepEx,
        erroreCarichi: true,
        text: '?',
        peso: 0,
        suggerito: null,
        label: 'N/D',
        proposta: p,
        schedaPrec: previousWorkout.value.num_scheda
      };
    }

    const recordVal = sfidaRecordWeek1.value ? ottieniRecordStoricoPerReps(p.currReps) : null;

    return { 
      text: String(p.prevPeso), 
      peso: p.prevPeso, 
      label: p.settimanaBase === 6 ? 'W6 Prec.' : `W${p.settimanaBase} Prec.`,
      isWeek1: true,
      isRepExercise: isRepEx,
      reps: p.prevReps,
      currReps: p.currReps,
      suggerito: isRepEx ? null : p.peso,
      giorni: p.giorniTrascorsi,
      fatica: p.fatica,
      proposta: p,
      schedaPrec: previousWorkout.value.num_scheda,
      stimaMenoAccurata: p.stimaMenoAccurata,
      recordVal: recordVal,
      sfidaRecordWeek1: sfidaRecordWeek1.value
    };
  }

  let haParentesiQuadre = false;
  for (let w = 1; w <= 6; w++) {
    const presc = String(workout.value['des_week' + w] || '');
    if (presc.includes('[') || presc.includes(']')) {
      haParentesiQuadre = true;
      break;
    }
  }

  if (haParentesiQuadre) {
    if (sett === 4) return null;
    const matchKgW = prescrizione.match(/\[\s*KG?\s*W\s*(\d+)\s*\]?/i);
    if (matchKgW) {
      const targetW = parseInt(matchKgW[1], 10);
      const targetIns = inputSettimane.value[targetW]?.ins || '';
      const pesoStr = estraiPesoDaInput(targetIns);
      return {
        text: pesoStr ? targetIns : '?',
        peso: pesoStr ? parseFloat(pesoStr) : 0,
        label: `W${targetW}`,
        isMandatory: true,
        mandatoryLabel: `USA LO STESSO PESO DI W${targetW}`
      };
    }

    let lastLoggedWeek = null;
    let prevIns = null;
    let prevPeso = null;

    if (sett > 1) {
      for (let w = sett - 1; w >= 1; w--) {
        const insVal = inputSettimane.value[w]?.ins;
        if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
          const peso = parseFloat(estraiPesoDaInput(insVal));
          if (!isNaN(peso) && peso > 0) {
            lastLoggedWeek = w;
            prevIns = insVal;
            prevPeso = peso;
            break;
          }
        }
      }
    }

    if (lastLoggedWeek) {
      const prevPrescStr = workout.value['des_week' + lastLoggedWeek];
      const currPrescStr = workout.value['des_week' + sett];
      const prevReps = estraiRepsDaPrescrizione(prevPrescStr);
      const currReps = estraiRepsDaPrescrizione(currPrescStr);
      if (prevReps && currReps && currReps < prevReps) {
        return {
          text: prevIns,
          peso: prevPeso,
          label: `W${lastLoggedWeek}`,
          isOverload: true,
          overloadText: `Aumenta peso, metti più di `
        };
      }
    }

    if (prevIns) {
      return { text: prevIns, peso: prevPeso, label: `W${lastLoggedWeek}`, isRepExercise: isRepEx };
    }
    return null;
  } else {
    if (sett === 2) {
      const baseW = propostaBaseWeek2.value;
      if (baseW === 'W6 Prec.') {
        if (previousWorkout.value) {
          const prevW6Text = previousWorkout.value.num_ins6 || inputSettimanePrecedente.value[6]?.ins || previousWorkout.value.ins_week6;
          if (prevW6Text) {
            const proposedVal = proponiProgressioneCaricoRIR(2, 6, String(prevW6Text));
            if (proposedVal !== null) {
              return { text: String(prevW6Text), peso: proposedVal, label: 'W6 Prec.' };
            }
          }
        }
      }
      const w1Ins = inputSettimane.value[1]?.ins;
      if (w1Ins) {
        if (isRepEx) return { text: w1Ins, peso: 0, label: 'W1', isRepExercise: true };
        const proposedVal = proponiProgressioneCaricoRIR(2, 1, w1Ins);
        if (proposedVal !== null) {
          return { text: w1Ins, peso: proposedVal, label: 'W1', isRepExercise: false };
        }
      }
    }

    if (sett === 3) {
      const w2Ins = inputSettimane.value[2]?.ins;
      if (w2Ins) {
        if (isRepEx) return { text: w2Ins, peso: 0, label: 'W2', isRepExercise: true };
        const proposedVal = proponiProgressioneCaricoRIR(3, 2, w2Ins);
        if (proposedVal !== null) {
          return { text: w2Ins, peso: proposedVal, label: 'W2', isRepExercise: false };
        }
      }
    }

    if (sett === 4 && isWeek4Scarico.value) {
      if (isRepEx) {
        const w3Ins = inputSettimane.value[3]?.ins;
        if (!w3Ins) return null;
        return { text: w3Ins, peso: 0, label: 'W3', isRepExercise: true };
      }
      const w2Ins = inputSettimane.value[2]?.ins;
      if (!w2Ins) return null;
      const pesoStrW2 = estraiPesoDaInput(w2Ins);
      if (!pesoStrW2) return null;
      const pesoBase = parseFloat(pesoStrW2);
      const repsBase = workout.value['reps_week2'] ? parseInt(workout.value['reps_week2'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week2']) || 10);
      const repsTarget = workout.value['reps_week4'] ? parseInt(workout.value['reps_week4'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week4']) || 10);
      const isCorpoLiberoRepsSalgono = isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase;
      return { 
        text: w2Ins, 
        peso: pesoBase, 
        label: 'W2', 
        isScarico: !isCorpoLiberoRepsSalgono,
        isRepExercise: isRepEx
      };
    }

    if (sett === 5) {
      if (isRepEx) {
        const w4Ins = inputSettimane.value[4]?.ins;
        if (!w4Ins) return null;
        return { text: w4Ins, peso: 0, label: 'W4', isRepExercise: true };
      }
      const baseW = propostaBaseWeek5.value;
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 3;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      
      if (isWeek4Scarico.value) {
        const isManubri = isManubriEsercizio(workout.value);
        const step = getWeightStep(isManubri, pesoBase);
        let pesoProposto;
        if (modalitaIncrementoGhost.value === 'ibrida') {
          const pct = calcolaIncrementoDinamicoMedio(5);
          const pesoDinamico = pesoBase * (1 + pct);
          let pesoFisso;
          if (isManubri) {
            const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
            pesoFisso = pesoBase + incremento;
          } else {
            const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
            pesoFisso = pesoBase + incremento;
          }
          pesoProposto = (0.5 * pesoDinamico) + (0.5 * pesoFisso);
        } else if (modalitaIncrementoGhost.value === 'dinamica') {
          const pct = calcolaIncrementoDinamicoMedio(5);
          pesoProposto = pesoBase * (1 + pct);
        } else {
          if (isManubri) {
            const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
            pesoProposto = pesoBase + incremento;
          } else {
            const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
            pesoProposto = pesoBase + incremento;
          }
        }
        
        pesoProposto = Math.round(pesoProposto / step) * step;
        if (pesoProposto <= pesoBase) {
          pesoProposto = pesoBase + (isManubri ? (pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value) : 1.25);
        }
        
        if (ghostPRAttackAttivo.value) {
          const repsTarget = workout.value['reps_week5'] ? parseInt(workout.value['reps_week5'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week5']) || 10);
          const recordVal = ottieniRecordStoricoPerReps(repsTarget);
          if (recordVal && recordVal > 0) {
            if (pesoProposto < recordVal && (pesoProposto >= recordVal * 0.95 || pesoProposto >= recordVal - 2.5)) {
              pesoProposto = Math.round((recordVal + step) / step) * step;
            }
          }
        }
        
        const repsBase = workout.value['reps_week' + baseWNum] ? parseInt(workout.value['reps_week' + baseWNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
        const repsTarget = workout.value['reps_week' + 5] ? parseInt(workout.value['reps_week' + 5], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + 5]) || 10);
        
        if (isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase) {
          return { text: baseIns, peso: pesoBase, label: baseW, isPostScarico: false, isRepExercise: true };
        }
        
        return { text: baseIns, peso: pesoBase, label: baseW, isPostScarico: true, pesoProposto: pesoProposto, isRepExercise: isRepEx };
      }
      
      if (isRepEx) return { text: baseIns, peso: 0, label: baseW, isRepExercise: true };
      const proposedVal = proponiProgressioneCaricoRIR(5, baseWNum, baseIns);
      return { text: baseIns, peso: proposedVal !== null ? proposedVal : pesoBase, label: baseW, isRepExercise: false };
    }

    if (sett === 6) {
      const baseW = propostaBaseWeek6.value;
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 5;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      
      const isManubri = isManubriEsercizio(workout.value);
      const step = getWeightStep(isManubri, pesoBase);
      
      let pesoProposto;
      if (modalitaIncrementoGhost.value === 'ibrida') {
        const pct = calcolaIncrementoDinamicoMedio(6);
        const pesoDinamico = pesoBase * (1 + pct);
        let pesoFisso;
        if (isManubri) {
          const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
          pesoFisso = pesoBase + incremento;
        } else {
          const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
          pesoFisso = pesoBase + incremento;
        }
        pesoProposto = (0.5 * pesoDinamico) + (0.5 * pesoFisso);
      } else if (modalitaIncrementoGhost.value === 'dinamica') {
        const pct = calcolaIncrementoDinamicoMedio(6);
        pesoProposto = pesoBase * (1 + pct);
      } else {
        if (isManubri) {
          const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
          pesoProposto = pesoBase + incremento;
        } else {
          const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
          pesoProposto = pesoBase + incremento;
        }
      }
      
      pesoProposto = Math.round(pesoProposto / step) * step;
      if (pesoProposto <= pesoBase) {
        pesoProposto = pesoBase + (isManubri ? (pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value) : 1.25);
      }

      if (ghostPRAttackAttivo.value) {
        const repsTarget = workout.value['reps_week6'] ? parseInt(workout.value['reps_week6'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week6']) || 10);
        const recordVal = ottieniRecordStoricoPerReps(repsTarget);
        if (recordVal && recordVal > 0) {
          if (pesoProposto < recordVal && (pesoProposto >= recordVal * 0.95 || pesoProposto >= recordVal - 2.5)) {
            proposedWeight = Math.round((recordVal + step) / step) * step;
          }
        }
      }
      
      const repsBase = workout.value['reps_week' + baseWNum] ? parseInt(workout.value['reps_week' + baseWNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
      const repsTarget = workout.value['reps_week' + 6] ? parseInt(workout.value['reps_week' + 6], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + 6]) || 10);
      
      if (isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase) {
        return { text: baseIns, peso: pesoBase, label: baseW, isPostScarico: false, isRepExercise: true };
      }
      
      return { text: baseIns, peso: pesoBase, label: baseW, isPostScarico: true, pesoProposto: pesoProposto, isRepExercise: isRepEx };
    }

    const prevIns = inputSettimane.value[sett - 1]?.ins;
    if (!prevIns) return null;
    if (isRepEx) return { text: prevIns, peso: 0, label: `W${sett - 1}`, isRepExercise: true };
    const pesoStr = estraiPesoDaInput(prevIns);
    if (!pesoStr) return null;
    return { text: prevIns, peso: parseFloat(pesoStr), label: `W${sett - 1}`, isRepExercise: false };
  }
};

const getGhostLift = (sett) => {
  // Mock simple
  return getGhostLiftStandard(sett);
};

const getGhostLiftSmart = (sett) => {
  const ghost = getGhostLift(sett);
  if (!ghost) return null;
  const smartGhost = { ...ghost };
  smartGhost.pesoBaseOriginale = ghost.peso;
  const smartWeight = getCaricoConsigliatoViaDiMezzoForWeek(sett);
  if (smartWeight !== null && smartWeight !== undefined && smartWeight > 0) {
    if (!smartGhost.isScarico) {
      smartGhost.peso = smartWeight;
    }
    if (smartGhost.isPostScarico) {
      smartGhost.pesoProposto = smartWeight;
    }
  }
  return smartGhost;
};

const getVolumeProgressionInfoForWeek = (sett) => {
  if (!workout.value) return { active: false };
  if (modalitaIncrementoGhost.value !== 'ibrida') return { active: false };
  
  const info = getBaseWeekInfo(sett);
  if (!info || info.pesoBase === null) return { active: false };
  
  const potenziale = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  const prudenziale = getPesoPropostoDettaglioForWeek(sett);
  
  if (potenziale !== null && prudenziale !== null && potenziale < prudenziale) {
    if (info.repsTarget > info.repsBase) {
      return {
        active: true,
        pesoBase: info.pesoBase,
        repsBase: info.repsBase,
        repsTarget: info.repsTarget,
        baseWNum: info.baseWNum,
        isPreviousWorkoutW6: info.isPreviousWorkoutW6
      };
    }
  }
  return { active: false };
};

const getCaricoConsigliatoViaDiMezzoForWeek = (sett) => {
  if (sett === 1) return propostaWeek1.value?.peso || null;
  const volInfo = getVolumeProgressionInfoForWeek(sett);
  if (volInfo.active) return volInfo.pesoBase;
  
  const potenziale = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  const prudenziale = getPesoPropostoDettaglioForWeek(sett);
  const isManubri = isManubriEsercizio(workout.value);
  const infoBase = getBaseWeekInfo(sett);
  const pesoBase = infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase) ? infoBase.pesoBase : 0;
  const step = getWeightStep(isManubri, pesoBase);
  
  let result;
  if (modalitaIncrementoGhost.value === 'fissa') {
    result = prudenziale !== null ? Math.round(prudenziale / step) * step : null;
  } else if (modalitaIncrementoGhost.value === 'dinamica') {
    const val = potenziale !== null ? potenziale : prudenziale;
    result = val !== null ? Math.round(val / step) * step : null;
  } else {
    if (potenziale !== null && prudenziale !== null && !isNaN(potenziale) && !isNaN(prudenziale)) {
      const avg = (potenziale + prudenziale) / 2;
      result = Math.round(avg / step) * step;
    } else {
      result = potenziale || prudenziale || 0;
    }
  }
  if (infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase)) {
    if (result !== null && result < infoBase.pesoBase) result = infoBase.pesoBase;
  }
  return result;
};

const getPesoPropostoDettaglioForWeek = (sett) => {
  if (!workout.value) return null;
  const ghost = getGhostLift(sett);
  if (!ghost) return null;
  if (ghost.isPostScarico && ghost.pesoProposto !== undefined) return ghost.pesoProposto;
  return ghost.peso;
};

const calcolaCaricoIdealeConsigliatoPerSettimana = (targetW) => {
  const proposte = calcolaProposteStoricoPerSettimana(targetW);
  if (!proposte || proposte.length === 0) return null;
  let bestProp = null;
  let bestScore = -99999;
  proposte.forEach(prop => {
    let score = 0;
    if (prop.isCurrentMesocycle) {
      score += 1000;
      score += prop.week * 10;
    } else {
      if (prop.isSameWeek) score += 100;
      if (prop.isSameReps) score += 50;
      if (prop.isPeakWeek) score += 20;
      score += parseInt(prop.numScheda) * 3;
      score -= (prop.giorniTrascorsi * 0.15);
    }
    if (score > bestScore) {
      bestScore = score;
      bestProp = prop;
    }
  });
  return bestProp;
};

const ottieniRecordStoricoPerReps = (targetReps) => {
  if (!workout.value || !storicoEsercizio.value.length) return null;
  const currentNumScheda = parseInt(workout.value.num_scheda);
  if (isNaN(currentNumScheda)) return null;

  let maxWeight = 0;
  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return;
    
    for (let w = 1; w <= 6; w++) {
      const insVal = prevEx['ins_week' + w];
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            const repsVal = prevEx['reps_week' + w];
            let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
            const inputReps = estraiRepsDaInput(insVal);
            if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
              repsNum = inputReps;
            }
            if (repsNum === targetReps) {
              if (weight > maxWeight) {
                maxWeight = weight;
              }
            }
          }
        }
      }
    }
  });

  return maxWeight > 0 ? maxWeight : null;
};

const propostaWeek1 = {
  get value() {
    if (!previousWorkout.value || !workout.value) return null;
    let basePeso = null;
    let baseReps = null;
    let baseRIR = null;
    let fatica = '';
    let baseWeekNum = null;
    const prevW6Weight = previousWorkout.value.num_ins6;
    if (prevW6Weight && !isNaN(parseFloat(String(prevW6Weight).replace(',', '.')))) {
      basePeso = parseFloat(String(prevW6Weight).replace(',', '.'));
      baseReps = parseInt(previousWorkout.value.reps_week6) || estraiRepsDaPrescrizione(previousWorkout.value.des_week6) || 10;
      baseRIR = estraiRIRDaPrescrizione(previousWorkout.value.des_week6) !== null ? estraiRIRDaPrescrizione(previousWorkout.value.des_week6) : 0;
      fatica = previousWorkout.value.num_faticaw6 || '';
      baseWeekNum = 6;
    } else {
      for (let w = 5; w >= 1; w--) {
        const val = previousWorkout.value['ins_week' + w];
        if (val && String(val).trim() !== '' && String(val).trim() !== '-') {
          const pesoStr = estraiPesoDaInput(val);
          if (pesoStr) {
            basePeso = parseFloat(pesoStr);
            baseReps = parseInt(previousWorkout.value['reps_week' + w]) || estraiRepsDaPrescrizione(previousWorkout.value['des_week' + w]) || 10;
            baseRIR = estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) !== null ? estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) : getRIRDefault(w);
            baseWeekNum = w;
            break;
          }
        }
      }
    }
    if (basePeso === null || isNaN(basePeso) || basePeso <= 0) return { erroreCarichi: true };
    const currW1Reps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1) || 10;
    const giorniTrascorsi = 10; // Mocked
    let proposta = calcolaPropostaCaricoDinamico(basePeso, baseReps, baseRIR, currW1Reps, fatica, giorniTrascorsi);
    return {
      peso: proposta,
      prevPeso: basePeso,
      prevReps: baseReps,
      currReps: currW1Reps,
      settimanaBase: baseWeekNum,
      fatica: fatica,
      giorniTrascorsi: giorniTrascorsi,
      erroreCarichi: false
    };
  }
};

async function run() {
  const collectionRef = db.collection('STORYBOARD');
  
  // Test per B6
  console.log("--- RUNNING SIMULATION FOR B6 ---");
  const b6Doc = await collectionRef.doc('xE7VjVnvKj3zB92U0JVo').get();
  workout.value = b6Doc.data();
  workout.value.id = b6Doc.id;
  
  const snapHistory = await collectionRef
    .where('ID_cliente', '==', '1')
    .where('des_esercizio', '==', workout.value.des_esercizio)
    .get();
    
  const list = [];
  snapHistory.forEach(doc => {
    const d = doc.data();
    if (parseInt(d.num_scheda) < parseInt(workout.value.num_scheda)) {
      list.push({ id: doc.id, ...d });
    }
  });
  list.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
  storicoEsercizio.value = list;
  storicoEsercizioPerAiuto.value = list;
  previousWorkout.value = list[list.length - 1];
  
  console.log(`Workout name: ${workout.value.des_esercizio}`);
  console.log(`Previous workout sheet: ${previousWorkout.value ? previousWorkout.value.num_scheda : 'None'}`);
  
  // Esegui la stima per tutte le week
  for (let w = 1; w <= 6; w++) {
    console.log(`\nEvaluating Week ${w}:`);
    const ghost = getGhostLiftSmart(w);
    console.log(`Week ${w} Ghost lift:`, JSON.stringify(ghost, null, 2));
  }
  
  console.log("\nSimulation finished successfully without freezing!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
