/**
 * progressionResultEvaluator.js
 *
 * Motore di valutazione dell'esito della progressione per il campo export 'des_progr_result'.
 * Rispetta le seguenti direttive cliniche/tecniche di FlexCoach:
 * 1. "Silent on Success": Se la progressione è andata bene, restituisce stringa vuota "".
 * 2. "Programma in corso": Se mancano i risultati sulle ultime settimane (W5 e W6 vuote),
 *    si presuppone che l'atleta non abbia ancora concluso il mesociclo -> restituisce "".
 * 3. "num_ins6": Non viene considerato se vuoto (nessun alert se manca ins6).
 * 4. "Infortunio": Se presente o segnalato dall'atleta o rilevato da infortuni attivi,
 *    ha precedenza assoluta e viene segnalato (es. "Infortunio" o "Infortunio W3").
 * 5. "Week 4 (Scarico)": Riconosce W4 come scarico (da prescrizione o reps W4 > reps W3).
 *    Se il carico cala in W4 è corretto (""). Se invece in W4 si carica più di W3,
 *    segnala "Scarico W4 non rispettato (>W3)".
 * 6. "Stesso peso mantenuto": Mantenere lo stesso peso è ammesso solo se motivato/segnalato
 *    dall'utente (tramite tag [Mantenimento], stella 🌟, tag qualitativi [TUT], [ROM], note tra parentesi,
 *    o aumento di reps). Se l'atleta ha mantenuto il carico identico in totale silenzio -> "Stallo non segnalato".
 * 7. "Week 5 (Post-Scarico)": W5 va confrontata con W3 (non con W4). Un crollo marcato
 *    non motivato (> 20%) viene segnalato come "Calo anomalo W5 vs W3".
 */

import {
  isCardioEsercizio,
  isPosturaEsercizio,
  isCorpoLiberoEsercizio,
  isPercentualeEsercizio,
  haSovraccaricoEsplicito,
  estraiPesoDaInput,
  estraiRepsDaInput,
  estraiRepsDaPrescrizione,
  haProgressioneQualitativa,
  haTagMantenimento
} from './loadParser.js';

const INJURY_REGEX = /\b(?:infortunio|infortuni|infortunat[oaie]|dolore|dolori|male|fastidio|fastidi|infiammazione|infiammazioni|tendinite|tendiniti|bloccato|bloccata|contrattura|contratture|stiramento|lesione|fitta|fitte)\b/i;

/**
 * Valuta l'esito della progressione di una riga dello Storyboard.
 *
 * @param {Object} record Riga dello Storyboard
 * @param {Object} [options={}] Opzioni opzionali: { hasActiveInjury: boolean, activeInjuryDetail: string }
 * @returns {string} Stringa vuota "" se ok o in corso, altrimenti la breve motivazione di anomalia/infortunio.
 */
export const calcolaDesProgrResult = (record, options = {}) => {
  if (!record || typeof record !== 'object') return '';

  // 1. Esclusione righe non-esercizio o intestazioni
  const rigaGiorno = parseInt(record.num_riga_giorno, 10);
  if (isNaN(rigaGiorno) || rigaGiorno <= 0) return '';

  const nomeEx = String(record.des_esercizio || '').trim();
  if (!nomeEx || nomeEx === '-') return '';

  // 2. Esclusione settori speciali dove non si applica il sovraccarico progressivo
  if (isCardioEsercizio(record) || isPosturaEsercizio(record)) return '';

  // 3. Esclusione esercizi a percentuali fisse o carichi vincolati dal coach
  if (
    isPercentualeEsercizio(record) ||
    record.flg_perc === true ||
    record.flg_perc === '1' ||
    record.flg_perc === 'true' ||
    record.flg_perc === 1
  ) {
    return '';
  }

  // Verifica vincoli fissi di carico in prescrizione (es. [Kg W3], [Carico Fisso])
  const prescrizioni = [
    record.des_week1, record.des_week2, record.des_week3,
    record.des_week4, record.des_week5, record.des_week6
  ].map(p => String(p || ''));

  const hasConstraintCarico = prescrizioni.some(p => /\[\s*KG?\s*W\s*\d+\s*\]/i.test(p) || /\[\s*carico\s*fisso\s*\]/i.test(p));
  if (hasConstraintCarico) {
    return '';
  }

  // 4. Controllo Infortuni (Massima Priorità)
  // 4a. Infortunio attivo passato da opzioni (es. da collezione Firestore 'infortuni')
  if (options.hasActiveInjury) {
    return options.activeInjuryDetail ? `Infortunio (${options.activeInjuryDetail})` : 'Infortunio';
  }

  // 4b. Controllo parole chiave infortunio nelle note / commenti generali
  const desNote = String(record.des_note || '');
  const desCommenti = String(record.des_commenti || '');
  if (INJURY_REGEX.test(desNote) || INJURY_REGEX.test(desCommenti)) {
    return 'Infortunio';
  }

  // 5. Analisi delle 6 settimane compilate dall'atleta
  const isCorpoLibero = isCorpoLiberoEsercizio(record);
  const settimane = [];

  for (let w = 1; w <= 6; w++) {
    const rawInput = String(record[`ins_week${w}`] || '').trim();
    const prescrizione = prescrizioni[w - 1] || '';
    const repsPresc = record[`reps_week${w}`] ? parseInt(record[`reps_week${w}`], 10) : estraiRepsDaPrescrizione(prescrizione);

    const compilato = !!(rawInput && rawInput !== '-');
    let hasInjury = false;
    let peso = null;
    let reps = null;
    let haSegnalazione = false;

    if (compilato) {
      if (INJURY_REGEX.test(rawInput)) {
        hasInjury = true;
      }

      const hasZavorra = haSovraccaricoEsplicito(rawInput);
      const isClPuro = isCorpoLibero && !hasZavorra;

      if (!isClPuro) {
        const p = estraiPesoDaInput(rawInput, { isCorpoLibero });
        if (p !== null && !isNaN(parseFloat(p))) {
          peso = parseFloat(p);
        }
      }

      const r = estraiRepsDaInput(rawInput, { defaultReps: repsPresc || 10, isCorpoLibero });
      if (r !== null && !isNaN(parseInt(r, 10))) {
        reps = parseInt(r, 10);
      }

      // Segnalazioni dell'utente: tag mantenimento, chip qualitativi, note tra parentesi
      const hasMantenimento = haTagMantenimento(rawInput);
      const hasQualitativa = haProgressioneQualitativa(rawInput);
      const hasParentesi = /\([^\)]+\)/.test(rawInput);
      haSegnalazione = hasMantenimento || hasQualitativa || hasParentesi;
    }

    settimane.push({
      settimana: w,
      raw: rawInput,
      compilato,
      hasInjury,
      peso,
      reps,
      repsPresc,
      prescrizione,
      haSegnalazione
    });
  }

  // Se l'infortunio è segnalato in una specifica settimana compilata
  const wInfortunio = settimane.find(s => s.hasInjury);
  if (wInfortunio) {
    return `Infortunio W${wInfortunio.settimana}`;
  }

  // 6. Verifica "Programma in corso":
  // Se mancano i risultati sulle ultime settimane (W5 e W6 sono entrambe non compilate),
  // l'utente non ha finito il mesociclo -> non scriviamo nulla ("").
  const w5 = settimane[4]; // indice 4 = W5
  const w6 = settimane[5]; // indice 5 = W6
  if (!w5.compilato && !w6.compilato) {
    return '';
  }

  // Controlliamo anche quante settimane totali risultano compilate
  const settimaneCompilate = settimane.filter(s => s.compilato);
  if (settimaneCompilate.length < 3) {
    // Meno di 3 settimane compilate: scheda parziale in corso
    return '';
  }

  // 7. Riconoscimento della natura di Week 4 (Scarico Attivo / Deload)
  const w3 = settimane[2];
  const w4 = settimane[3];

  let isW4Scarico = false;
  if (w4.prescrizione) {
    if (/\bscarico\b/i.test(w4.prescrizione)) {
      isW4Scarico = true;
    } else if (w4.repsPresc && w3.repsPresc && w4.repsPresc > w3.repsPresc) {
      isW4Scarico = true;
    }
  }

  // 8. Controllo rispetto dello Scarico in Week 4
  if (isW4Scarico && w4.compilato && w3.compilato) {
    // Se c'è carico registrato in entrambe le settimane
    if (w4.peso !== null && w3.peso !== null) {
      if (w4.peso > w3.peso) {
        return `Scarico W4 non rispettato (>W3)`;
      }
    }
  }

  // 9. Controllo Week 5 post-scarico vs Week 3
  if (w5.compilato && w3.compilato && w5.peso !== null && w3.peso !== null && w3.peso > 15) {
    // Se in W5 c'è un calo vistoso (> 20%) rispetto a W3 senza aumento di reps e senza note dell'utente
    const caloPct = ((w5.peso - w3.peso) / w3.peso) * 100;
    const repsAumentate = w5.reps && w3.reps && w5.reps >= w3.reps + 3;

    if (caloPct < -20 && !repsAumentate && !w5.haSegnalazione) {
      return `Calo anomalo W5 vs W3`;
    }
  }

  // 10. Controllo: "Mantenere lo stesso peso è la normalità a volte, ma deve essere segnalato dall'utente!!"
  // Raccogliamo le settimane di carico effettive (escludendo W4 se è di scarico)
  const settimaneDiCarico = settimane.filter(s => {
    if (!s.compilato) return false;
    if (s.settimana === 4 && isW4Scarico) return false;
    return s.peso !== null;
  });

  if (settimaneDiCarico.length >= 3) {
    const pesi = settimaneDiCarico.map(s => s.peso);
    const minPeso = Math.min(...pesi);
    const maxPeso = Math.max(...pesi);

    // Se la variazione massima di carico è inferiore a 1 kg (peso invariato/stabile)
    const isPesoInvariato = (maxPeso - minPeso) < 1.0;

    if (isPesoInvariato) {
      // Controlliamo se le ripetizioni sono cresciute in modo chiaro nel tempo
      const primaSett = settimaneDiCarico[0];
      const ultimaSett = settimaneDiCarico[settimaneDiCarico.length - 1];
      const repsCresciute = primaSett.reps && ultimaSett.reps && (ultimaSett.reps >= primaSett.reps + 2);

      // Controlliamo se l'utente ha inserito una segnalazione in almeno una settimana o nelle note
      const utenteHaSegnalato = settimaneDiCarico.some(s => s.haSegnalazione) ||
        haTagMantenimento(desNote) ||
        haProgressioneQualitativa(desNote) ||
        /\([^\)]+\)/.test(desNote) ||
        desCommenti.trim().length > 0;

      // Se il peso è identico, le reps non sono salite e l'utente NON ha segnalato nulla
      if (!repsCresciute && !utenteHaSegnalato) {
        return 'Stallo non segnalato';
      }
    }
  }

  // 11. Se la progressione è andata a buon fine (o nessun'anomalia rilevata)
  return '';
};

