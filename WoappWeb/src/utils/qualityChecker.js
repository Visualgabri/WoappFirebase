/**
 * qualityChecker.js - Comprehensive Sheet Quality Control & Validation Engine for WoApp
 *
 * Esegue un'analisi approfondita, clinica e logica di tutta la scheda:
 * 1. Controllo Sintattico & Parser: formati ambigui, numeri scambiati, note non parsabili
 * 2. Controllo Logico Carichi: refusi di digitazione (typo), salti di carico irrealistici, cali ingiustificati
 * 3. Coerenza Progressioni: rispetto dello scarico in W4, completezza del test W6 (Miglior Carico + Fatica),
 *    andamento vs prescrizione e serie/reps previste
 * 4. Ripercussioni sugli Algoritmi: impatto sui suggerimenti Ghost, alterazione del massimale 1RM,
 *    falsazione dei record storici e suggerimenti per il mesociclo successivo
 * 5. Classificazione a 3 livelli: 🔴 Errore Certo, 🟡 Possibile Anomalia, 🔵 Dato Valido ma Particolare
 *
 * 100% Client-Side - 0 Letture / 0 Scritture Firebase.
 */

import {
  isCorpoLiberoEsercizio,
  isCavoOMacchinaEsercizio,
  isManubriEsercizio,
  isPercentualeEsercizio,
  haSovraccaricoEsplicito,
  estraiPesoDaInput,
  estraiRepsDaInput,
  estraiRepsDaInputExplicitSingle,
  estraiRepsDaPrescrizione,
  estraiSerieDaPrescrizione,
  calcolaE1RMSmorzato
} from './loadParser.js';

/**
 * Esegue il controllo qualità completo su un insieme di record della scheda Storyboard.
 *
 * @param {Array<Object>} records Elenco degli esercizi della scheda attiva
 * @param {Object} [options={}] Opzioni aggiuntive: { storicoBackup, atletaId, numScheda }
 * @returns {Object} Risultato completo dell'analisi con metriche e array di segnalazioni
 */
export const analizzaQualitaScheda = (records, options = {}) => {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      totaleEsercizi: 0,
      totaleValoriControllati: 0,
      totaleErrori: 0,
      totaleAnomalie: 0,
      totaleParticolari: 0,
      totaleValidi: 0,
      percentualeQualita: 100,
      segnalazioni: [],
      riepilogoPerGiorno: {},
      superato: true,
      timestamp: new Date().toISOString()
    };
  }

  const storicoBackup = options.storicoBackup || [];
  const currentSchedaNum = parseInt(options.numScheda) || 0;
  const atletaId = String(options.atletaId || '').trim();

  // Filtra solo gli esercizi effettivi (esclude riga 0 che è l'intestazione giorno)
  const esercizi = records.filter(item => {
    const riga = parseInt(item.num_riga_giorno);
    const nome = String(item.des_esercizio || '').trim();
    return riga > 0 && nome !== '' && nome !== '-';
  });

  const segnalazioni = [];
  let totaleValoriControllati = 0;
  let totaleValidi = 0;
  let totaleFormatiColloquiali = 0;

  const riepilogoPerGiorno = {
    A: { total: 0, errori: 0, anomalie: 0, particolari: 0, validi: 0 },
    B: { total: 0, errori: 0, anomalie: 0, particolari: 0, validi: 0 },
    C: { total: 0, errori: 0, anomalie: 0, particolari: 0, validi: 0 },
    D: { total: 0, errori: 0, anomalie: 0, particolari: 0, validi: 0 }
  };

  // Mappa storico per lo stesso atleta ed esercizio (schede precedenti)
  const getStoricoEsercizio = (nomeEx) => {
    if (!storicoBackup.length || !atletaId || !nomeEx) return [];
    const targetName = nomeEx.trim().toLowerCase();
    return storicoBackup.filter(b => {
      const bAtleta = String(b.ID_cliente || b.id_cliente || '').trim();
      const bScheda = parseInt(b.num_scheda) || 0;
      const bName = String(b.des_esercizio || '').trim().toLowerCase();
      const bRiga = parseInt(b.num_riga_giorno) || 0;
      return bAtleta === atletaId && bScheda < currentSchedaNum && bName === targetName && bRiga > 0;
    }).sort((a, b) => (parseInt(b.num_scheda) || 0) - (parseInt(a.num_scheda) || 0));
  };

  // Scansiona ogni esercizio
  esercizi.forEach(ex => {
    const giorno = (ex.des_giorno || 'A').trim().toUpperCase();
    const rigaGiorno = ex.num_riga_giorno || '';
    const coordinata = `${giorno}${rigaGiorno}`;
    const nomeEx = String(ex.des_esercizio || '').trim();
    const settore = String(ex.des_settore || '').trim();

    if (!riepilogoPerGiorno[giorno]) {
      riepilogoPerGiorno[giorno] = { total: 0, errori: 0, anomalie: 0, particolari: 0, validi: 0 };
    }

    const isCorpoLibero = isCorpoLiberoEsercizio(ex);
    const isCavo = isCavoOMacchinaEsercizio(ex);
    const isManubri = isManubriEsercizio(ex);
    const isPercentuale = isPercentualeEsercizio(ex);
    const storicoEx = getStoricoEsercizio(nomeEx);

    // Array per tracciare i valori estratti settimana per settimana per quest'esercizio
    const settimaneData = {};

    // 1. Estrazione dati e validazione sintattica W1..W6
    for (let w = 1; w <= 6; w++) {
      const rawVal = ex['ins_week' + w] !== undefined && ex['ins_week' + w] !== null ? String(ex['ins_week' + w]).trim() : '';
      const prescVal = ex['des_week' + w] !== undefined && ex['des_week' + w] !== null ? String(ex['des_week' + w]).trim() : '';
      const repsPresc = estraiRepsDaPrescrizione(prescVal) || (ex['reps_week' + w] ? parseInt(ex['reps_week' + w], 10) : null);
      const seriePresc = estraiSerieDaPrescrizione(prescVal);

      if (!rawVal || rawVal === '-') {
        // Campo non compilato
        settimaneData[w] = { compilato: false, raw: '', peso: null, reps: null, e1rm: null };
        continue;
      }

      totaleValoriControllati++;
      riepilogoPerGiorno[giorno].total++;

      // Stringa ripulita da QUALSIASI contenuto tra parentesi (incluso '+(') per TUTTI i controlli di calcolo, logica e sintassi
      const withoutParens = rawVal
        .replace(/\+\s*[\(\[\{][^\)\]\}]*[\)\]\}]/g, ' ')
        .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, ' ')
        .trim();
      const cleanVal = withoutParens.length > 0 ? withoutParens : rawVal;

      const hasZavorra = haSovraccaricoEsplicito(cleanVal);
      const parsedLoadStr = estraiPesoDaInput(cleanVal, { isCorpoLibero, prescrizione: prescVal });
      const parsedLoad = parsedLoadStr ? parseFloat(parsedLoadStr) : (isCorpoLibero && !hasZavorra ? 0 : null);
      const parsedReps = estraiRepsDaInput(cleanVal, { isCorpoLibero, repsPresc });

      const e1rm = (parsedLoad && parsedLoad > 0 && parsedReps && parsedReps > 0)
        ? calcolaE1RMSmorzato(parsedLoad, parsedReps, isCavo)
        : null;

      settimaneData[w] = {
        compilato: true,
        raw: rawVal,
        clean: cleanVal,
        peso: parsedLoad,
        reps: parsedReps,
        e1rm,
        hasZavorra,
        repsPresc,
        seriePresc,
        prescVal
      };

      // Tracciamento discreto di formati colloquiali (senza generare allarmi o card)
      const hasFatteKeyword = /\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\b/i.test(cleanVal);
      if (hasFatteKeyword && (parsedLoad !== null || isCorpoLibero) && parsedReps !== null) {
        totaleFormatiColloquiali++;
      }

      // Se la prescrizione del coach per questa settimana è esplicitamente "NO" o "NON FARE" / "SALTA"
      // l'esercizio non è previsto e non deve generare alcun errore sintattico né logico
      const isPrescrizioneNo = /^\s*(?:no|non\s*fare|salta|non\s*previsto|riposo|-)\s*$/i.test(prescVal);
      if (isPrescrizioneNo) {
        continue;
      }

      let segnalazioneW = null;

      // --- CHECK SINTATTICO 1: Testo presente ma nessun dato numerico estratto ---
      if (parsedLoad === null && parsedReps === null) {
        segnalazioneW = {
          id: `${ex.id || ex.num_riga}_w${w}_no_data`,
          coordinata,
          giorno,
          riga: rigaGiorno,
          numRiga: ex.num_riga || '',
          docId: ex.id || '',
          des_esercizio: nomeEx,
          des_settore: settore,
          settimana: w,
          settimanaLabel: `W${w}`,
          valoreOriginale: rawVal,
          caricoEstratto: null,
          repsEstratte: null,
          isCorpoLibero,
          haSovraccarico: false,
          prescrizione: prescVal,
          repsPreviste: repsPresc,
          seriePreviste: seriePresc,
          livello: 'errore',
          tipo: 'testo_non_interpretabile',
          titolo: 'Testo non riconosciuto: nessun carico o reps',
          spiegazione: `Hai scritto una nota senza indicare un peso numerico o ripetizioni valide.`,
          conseguenza: `Gli algoritmi non possono calcolare le progressioni future.`,
          correzioneConsigliata: `Inserisci il carico o le ripetizioni (es. "45kg" o "12r").`
        };
      }

      // --- CHECK SINTATTICO AMRAP: Prescrizione AMRAP con solo carico e senza ripetizioni ---
      else if (!segnalazioneW && (/amrap|max\s*reps?|massim[ae]\s*rip|cedimento/i.test(prescVal) || 
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_rec_report || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_qta_report || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_note || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_note_attrezzo || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_estesa_end || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_estesa_start || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_commenti || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_esercizio_2 || '')) ||
               (w === 6 && /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(ex.des_esercizio || '')))) {
        const hasExplicitReps = estraiRepsDaInputExplicitSingle(cleanVal) !== null || /\b\d+\s*(?:r\b|reps?|rip(?:etizioni)?|colpi)\b/i.test(cleanVal) || /\+\s*\d+/i.test(cleanVal);
        if (parsedLoad !== null && !hasExplicitReps) {
          const pesoFmt = String(parsedLoad).replace('.', ',');
          segnalazioneW = {
            id: `${ex.id || ex.num_riga}_w${w}_amrap_mancano_reps`,
            coordinata,
            giorno,
            riga: rigaGiorno,
            numRiga: ex.num_riga || '',
            docId: ex.id || '',
            des_esercizio: nomeEx,
            des_settore: settore,
            settimana: w,
            settimanaLabel: `W${w}`,
            valoreOriginale: rawVal,
            caricoEstratto: parsedLoad,
            repsEstratte: null,
            isCorpoLibero,
            haSovraccarico: hasZavorra,
            prescrizione: prescVal,
            repsPreviste: repsPresc,
            seriePreviste: seriePresc,
            livello: 'errore',
            tipo: 'amrap_mancano_reps',
            titolo: 'Mancano le reps della serie a cedimento (AMRAP)',
            spiegazione: `Hai inserito solo il peso su una serie a cedimento/AMRAP: servono le ripetizioni massime completate.`,
            conseguenza: `Impossibile calcolare il nuovo massimale stimato e la progressione.`,
            correzioneConsigliata: `Indica le ripetizioni eseguite (es. "${pesoFmt} x 10r").`
          };
        }
      }

      // --- CHECK SINTATTICO 2: Formato ambiguo SxR su esercizio con pesi (es. "10x8" senza kg) ---
      else if (!isCorpoLibero && /^\s*\d+\s*[xX]\s*\d+\s*$/.test(cleanVal) && !haSovraccaricoEsplicito(cleanVal)) {
        const parts = cleanVal.split(/[xX]/);
        const p1 = parseInt(parts[0], 10);
        const p2 = parseInt(parts[1], 10);

        if (p1 <= 5 && p2 >= 6) {
          // Il parser interpreta p1 come serie e p2 come reps -> carico estratto = null
          segnalazioneW = {
            id: `${ex.id || ex.num_riga}_w${w}_sxr_ambiguo`,
            coordinata,
            giorno,
            riga: rigaGiorno,
            numRiga: ex.num_riga || '',
            docId: ex.id || '',
            des_esercizio: nomeEx,
            des_settore: settore,
            settimana: w,
            settimanaLabel: `W${w}`,
            valoreOriginale: rawVal,
            caricoEstratto: parsedLoad,
            repsEstratte: parsedReps,
            isCorpoLibero,
            haSovraccarico: false,
            prescrizione: prescVal,
            repsPreviste: repsPresc,
            seriePreviste: seriePreviste,
            livello: 'errore',
            tipo: 'formato_ambiguo_sxr',
            titolo: 'Formato ambiguo: mancano i kg del carico',
            spiegazione: `Hai scritto "${rawVal}" senza indicare l'unità kg (viene letto come ${p1} serie da ${p2} reps).`,
            conseguenza: `Carico mancante per l'aggiornamento dei massimali e dei target.`,
            correzioneConsigliata: `Specifica i kg utilizzati (es. "${p2}kg x${p1}s" oppure "50kg").`
          };
        }
      }

      // --- CHECK SINTATTICO 4: Notazione tipo "67,5 x2" o "67.5x2" (moltiplicatore basso x1..x5) vs Prescrizione ---
      if (!segnalazioneW && !isCorpoLibero) {
        const matchCaricoXN = cleanVal.match(/^\s*(\d+(?:[.,]\d+)?)\s*[xX]\s*([1-5])(?:\s*([sSrR]))?\s*$/i);
        if (matchCaricoXN) {
          const pesoVal = parseFloat(matchCaricoXN[1].replace(',', '.'));
          const molt = parseInt(matchCaricoXN[2], 10);
          const unita = (matchCaricoXN[3] || '').toLowerCase();

          const isTargetRepsAlto = repsPresc && repsPresc >= 6;
          const isTargetSerieAlto = seriePresc && seriePresc >= 3;

          if (pesoVal > 0 && molt <= 5 && (isTargetRepsAlto || isTargetSerieAlto)) {
            const totSerie = seriePresc || 4;
            segnalazioneW = {
              id: `${ex.id || ex.num_riga}_w${w}_notazione_xN_ridotto`,
              coordinata,
              giorno,
              riga: rigaGiorno,
              numRiga: ex.num_riga || '',
              docId: ex.id || '',
              des_esercizio: nomeEx,
              des_settore: settore,
              settimana: w,
              settimanaLabel: `W${w}`,
              valoreOriginale: rawVal,
              caricoEstratto: pesoVal,
              repsEstratte: unita === 'r' ? molt : null,
              molt,
              seriePreviste: totSerie,
              interpretatoCustom: `${pesoVal} kg · ${molt}x (invece di ${totSerie}x)`,
              isCorpoLibero,
              haSovraccarico: false,
              prescrizione: prescVal,
              repsPreviste: repsPresc,
              livello: 'anomalia',
              tipo: 'volume_ridotto_xN',
              titolo: `Volume ridotto: eseguite solo ${molt} serie su ${totSerie}`,
              spiegazione: `Hai indicato "${molt}x", registrando solo ${molt} serie rispetto alle ${totSerie} prescritte.`,
              conseguenza: `Volume ridotto che può alterare le proposte di carico successive.`,
              correzioneConsigliata: `Se hai fatto tutte le serie, scrivi il carico ripetuto (es. "${pesoVal} ${pesoVal} ${pesoVal}").`
            };
          }
        }
      }

      // --- CHECK SINTATTICO 5: Ripetizioni drasticamente inferiori al target prescritto (es. 2r su target 9r) ---
      if (!segnalazioneW && parsedReps && repsPresc && repsPresc >= 6 && parsedReps <= Math.floor(repsPresc * 0.45) && w !== 4) {
        segnalazioneW = {
          id: `${ex.id || ex.num_riga}_w${w}_reps_sotto_target`,
          coordinata,
          giorno,
          riga: rigaGiorno,
          numRiga: ex.num_riga || '',
          docId: ex.id || '',
          des_esercizio: nomeEx,
          des_settore: settore,
          settimana: w,
          settimanaLabel: `W${w}`,
          valoreOriginale: rawVal,
          caricoEstratto: parsedLoad,
          repsEstratte: parsedReps,
          isCorpoLibero,
          haSovraccarico: hasZavorra,
          prescrizione: prescVal,
          repsPreviste: repsPresc,
          seriePreviste: seriePresc,
          livello: 'anomalia',
          tipo: 'reps_sotto_target',
          titolo: `Ripetizioni chiuse (${parsedReps}r) inferiori al target (${repsPresc}r)`,
          spiegazione: `Hai registrato solo ${parsedReps} reps rispetto alle ${repsPresc} previste dalla scheda.`,
          conseguenza: `Possibile carico troppo pesante o serie interrotta prima del target.`,
          correzioneConsigliata: `Verifica se il carico era eccessivo o se intendevi il numero di serie (es. "x${parsedReps}s").`
        };
      }

      // --- CHECK SINTATTICO: Notazione '+' prima delle parentesi (es. '+(1kg)', '+ (2kg)', '+ (2r)') ---
      const matchPlusBeforeParens = rawVal.match(/\+\s*[\(\[\{]([^\)\]\}]+)[\)\]\}]/);
      if (!segnalazioneW && matchPlusBeforeParens) {
        const insideParens = matchPlusBeforeParens[1].trim();
        segnalazioneW = {
          id: `${ex.id || ex.num_riga}_w${w}_plus_parentesi_info`,
          coordinata,
          giorno,
          riga: rigaGiorno,
          numRiga: ex.num_riga || '',
          docId: ex.id || '',
          des_esercizio: nomeEx,
          des_settore: settore,
          settimana: w,
          settimanaLabel: `W${w}`,
          valoreOriginale: rawVal,
          caricoEstratto: parsedLoad,
          repsEstratte: parsedReps,
          isCorpoLibero,
          haSovraccarico: hasZavorra,
          prescrizione: prescVal,
          repsPreviste: repsPresc,
          seriePreviste: seriePresc,
          livello: 'anomalia',
          tipo: 'plus_parentesi_da_verificare',
          titolo: `Notazione '+(${insideParens})' da verificare`,
          spiegazione: `La parentesi preceduta da '+' potrebbe indicare un microcarico o reps extra, ma non viene sommata in automatico.`,
          conseguenza: `Carico base calcolato su ${parsedLoad !== null ? parsedLoad + ' kg' : 'n.d.'}${parsedReps ? ' x' + parsedReps + 'r' : ''} senza considerare la parentesi.`,
          correzioneConsigliata: `Se intendevi un carico maggiore, inserisci direttamente il totale complessivo dei kg.`
        };
      }

      // --- CHECK SINTATTICO 6: Notazione delta '+N rep' (es. '7,5 +2r' o '14 +1 rep') FUORI dalle parentesi ---
      const matchExplicitDeltaInClean = cleanVal.match(/(?:^|\s)\+\s*(\d+)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)\b/i);
      if (!segnalazioneW && matchExplicitDeltaInClean && parsedLoad && parsedReps) {
        const deltaVal = parseInt(matchExplicitDeltaInClean[1], 10);
        const pesoFmt = String(parsedLoad).replace('.', ',');
        segnalazioneW = {
          id: `${ex.id || ex.num_riga}_w${w}_delta_reps_info`,
          coordinata,
          giorno,
          riga: rigaGiorno,
          numRiga: ex.num_riga || '',
          docId: ex.id || '',
          des_esercizio: nomeEx,
          des_settore: settore,
          settimana: w,
          settimanaLabel: `W${w}`,
          valoreOriginale: rawVal,
          caricoEstratto: parsedLoad,
          repsEstratte: parsedReps,
          isCorpoLibero,
          haSovraccarico: hasZavorra,
          prescrizione: prescVal,
          repsPreviste: repsPresc,
          seriePreviste: seriePresc,
          livello: 'anomalia',
          tipo: 'delta_reps_info',
          titolo: `Reps extra: '+${deltaVal}' calcolato come ${parsedReps} reps totali`,
          spiegazione: `Hai eseguito ${deltaVal} reps in più rispetto al target prescritto (${parsedReps}r con carico previsto).`,
          conseguenza: `Calcolato regolarmente come ${parsedLoad} kg x ${parsedReps}r.`,
          correzioneConsigliata: `In futuro puoi scrivere direttamente "${pesoFmt} x ${parsedReps}r".`
        };
      }

      if (segnalazioneW) {
        segnalazioni.push(segnalazioneW);
      }
    }

    // 2. Controllo Logico dei Carichi & Progressioni tra Settimane Consecutive
    for (let w = 1; w <= 6; w++) {
      const cur = settimaneData[w];
      if (!cur || !cur.compilato) continue;

      // A. Controllo Refusi Fuori Scala (Typo Detection palese)
      if (cur.peso && cur.peso > 0) {
        // Se è con manubri e supera 80kg
        if (isManubri && cur.peso > 75) {
          segnalazioni.push({
            id: `${ex.id || ex.num_riga}_w${w}_manubrio_fuoriscala`,
            coordinata,
            giorno,
            riga: rigaGiorno,
            numRiga: ex.num_riga || '',
            docId: ex.id || '',
            des_esercizio: nomeEx,
            des_settore: settore,
            settimana: w,
            settimanaLabel: `W${w}`,
            valoreOriginale: cur.raw,
            caricoEstratto: cur.peso,
            repsEstratte: cur.reps,
            isCorpoLibero,
            haSovraccarico: cur.hasZavorra,
            prescrizione: cur.prescVal,
            repsPreviste: cur.repsPresc,
            seriePreviste: cur.seriePresc,
            livello: 'errore',
            tipo: 'carico_fuori_scala_manubri',
            titolo: `Carico manubri fuori scala (${cur.peso} kg): possibile refuso`,
            spiegazione: `Hai registrato ${cur.peso} kg con i manubri (probabile refuso di battitura o peso sommato dei due manubri).`,
            conseguenza: `Altera il massimale stimato e i suggerimenti per la prossima scheda.`,
            correzioneConsigliata: `Inserisci il peso del singolo manubrio (es. "${cur.peso > 100 ? cur.peso / 10 : Math.round(cur.peso / 2)} kg").`
          });
        }
      }

      // B. Confronto con la Settimana Precedente compilata (w - 1)
      if (w > 1) {
        let prevWNum = null;
        for (let pw = w - 1; pw >= 1; pw--) {
          if (settimaneData[pw] && settimaneData[pw].compilato) {
            prevWNum = pw;
            break;
          }
        }

        if (prevWNum !== null) {
          const prev = settimaneData[prevWNum];

          // 1. Salto di Carico Eccessivo tra settimane consecutive
          if (cur.peso && prev.peso && prev.peso > 0 && !isPercentuale) {
            const incrementoKg = Math.round((cur.peso - prev.peso) * 10) / 10;
            const incrementoPct = Math.round(((cur.peso - prev.peso) / prev.peso) * 100);
            const hasPerLato = /\b(?:pl|p\.l\.|p\/l|x\s*lato|per\s*lato|a\s*lato|ciascun\s*lato)\b/i.test(cur.raw) || /\b(?:pl|p\.l\.|p\/l|x\s*lato|per\s*lato|a\s*lato|ciascun\s*lato)\b/i.test(prev.raw);

            // Se è presente la notazione per lato (pl) ed è coerente con il peso dimezzato, non è un'anomalia
            if (hasPerLato && (cur.peso / 2 <= prev.peso * 1.35 || prev.peso / 2 <= cur.peso * 1.35)) {
              continue;
            }

            // Refuso clamoroso (es. 12 -> 120 kg, incremento > 250%)
            if (incrementoPct >= 250) {
              segnalazioni.push({
                id: `${ex.id || ex.num_riga}_w${w}_salto_abnorme`,
                coordinata,
                giorno,
                riga: rigaGiorno,
                numRiga: ex.num_riga || '',
                docId: ex.id || '',
                des_esercizio: nomeEx,
                des_settore: settore,
                settimana: w,
                settimanaLabel: `W${w}`,
                valoreOriginale: cur.raw,
                caricoEstratto: cur.peso,
                repsEstratte: cur.reps,
                isCorpoLibero,
                haSovraccarico: cur.hasZavorra,
                prescrizione: cur.prescVal,
                repsPreviste: cur.repsPresc,
                seriePreviste: cur.seriePreviste,
                livello: 'errore',
                tipo: 'salto_abnorme_typo',
                titolo: `Salto di carico anomalo: da ${prev.peso} a ${cur.peso} kg (+${incrementoPct}%)`,
                spiegazione: `Il carico è passato da ${prev.peso} kg a ${cur.peso} kg in una sola settimana (+${incrementoKg} kg).`,
                conseguenza: `Sballa il massimale e le progressioni del mesociclo.`,
                correzioneConsigliata: `Correggi il valore eliminando la cifra digitata per errore.`
              });
            }
            // Incremento importante (> 40% e > 8kg su carichi medi > 15kg)
            else if (incrementoPct > 45 && incrementoKg >= (isManubri ? 6 : 10) && prev.peso > 14) {
              const repsCalate = (prev.reps && cur.reps && cur.reps <= prev.reps - 3) || (prev.repsPresc && cur.repsPresc && cur.repsPresc <= prev.repsPresc - 3);

              if (!repsCalate) {
                const isMacchinaDiversa = /\b(?:macchina|macchine|green|rossa|nera|nuova|diversa|differente|altra|technogym|matrix|panatta|hammer|pure|palestra|altra\s*palestra)\b/i.test(cur.raw);

                if (isMacchinaDiversa) {
                  segnalazioni.push({
                    id: `${ex.id || ex.num_riga}_w${w}_macchina_diversa_parentesi`,
                    coordinata,
                    giorno,
                    riga: rigaGiorno,
                    numRiga: ex.num_riga || '',
                    docId: ex.id || '',
                    des_esercizio: nomeEx,
                    des_settore: settore,
                    settimana: w,
                    settimanaLabel: `W${w}`,
                    valoreOriginale: cur.raw,
                    caricoEstratto: cur.peso,
                    repsEstratte: cur.reps,
                    isCorpoLibero,
                    haSovraccarico: cur.hasZavorra,
                    prescrizione: cur.prescVal,
                    repsPreviste: cur.repsPresc,
                    seriePreviste: cur.seriePreviste,
                    livello: 'anomalia',
                    tipo: 'macchina_diversa_parentesi',
                    titolo: `Cambio macchina/palestra: metti la nota tra parentesi`,
                    spiegazione: `Hai registrato un cambio macchina/palestra rispetto a ${prev.peso} kg della settimana precedente.`,
                    conseguenza: `I carichi di macchine diverse sfasano i massimali storici e le stime future.`,
                    correzioneConsigliata: `Metti carico e nota tra parentesi (es. "(${cur.raw})") per non inquinare gli algoritmi.`
                  });
                } else {
                  segnalazioni.push({
                    id: `${ex.id || ex.num_riga}_w${w}_aumento_anomalo`,
                    coordinata,
                    giorno,
                    riga: rigaGiorno,
                    numRiga: ex.num_riga || '',
                    docId: ex.id || '',
                    des_esercizio: nomeEx,
                    des_settore: settore,
                    settimana: w,
                    settimanaLabel: `W${w}`,
                    valoreOriginale: cur.raw,
                    caricoEstratto: cur.peso,
                    repsEstratte: cur.reps,
                    isCorpoLibero,
                    haSovraccarico: cur.hasZavorra,
                    prescrizione: cur.prescVal,
                    repsPreviste: cur.repsPresc,
                    seriePreviste: cur.seriePreviste,
                    livello: 'anomalia',
                    tipo: 'aumento_eccessivo',
                    titolo: `Aumento carico marcato (+${incrementoPct}%): da ${prev.peso} a ${cur.peso} kg`,
                    spiegazione: `Sei salito da ${prev.peso} kg a ${cur.peso} kg (+${incrementoKg} kg) mantenendo lo stesso target di reps.`,
                    conseguenza: `Verificare la sostenibilità e la corretta esecuzione del carico.`,
                    correzioneConsigliata: `Verifica se il carico era effettivo o se hai sommato entrambi i lati.`
                  });
                }
              } else {
                segnalazioni.push({
                  id: `${ex.id || ex.num_riga}_w${w}_aumento_intensificazione`,
                  coordinata,
                  giorno,
                  riga: rigaGiorno,
                  numRiga: ex.num_riga || '',
                  docId: ex.id || '',
                  des_esercizio: nomeEx,
                  des_settore: settore,
                  settimana: w,
                  settimanaLabel: `W${w}`,
                  valoreOriginale: cur.raw,
                  caricoEstratto: cur.peso,
                  repsEstratte: cur.reps,
                  isCorpoLibero,
                  haSovraccarico: cur.hasZavorra,
                  prescrizione: cur.prescVal,
                  repsPreviste: cur.repsPresc,
                  seriePreviste: cur.seriePreviste,
                  livello: 'particolare',
                  tipo: 'salto_intensificazione_giustificato',
                  titolo: `Aumento di carico coerente con la riduzione di reps`,
                  spiegazione: `L'aumento da ${prev.peso} a ${cur.peso} kg è coerente con la riduzione delle reps richieste.`,
                  conseguenza: `Progressione regolare e coerente con la curva di forza.`,
                  correzioneConsigliata: `Dato corretto, non devi modificare nulla.`
                });
              }
            }
            // Calo improvviso non motivato (> 30% in meno su pesi medi)
            else if (incrementoPct < -30 && w !== 4 && prev.peso > 15) {
              const repsSalite = (prev.reps && cur.reps && cur.reps >= prev.reps + 4) || (prev.repsPresc && cur.repsPresc && cur.repsPresc >= prev.repsPresc + 4);

              if (!repsSalite) {
                segnalazioni.push({
                  id: `${ex.id || ex.num_riga}_w${w}_calo_anomalo`,
                  coordinata,
                  giorno,
                  riga: rigaGiorno,
                  numRiga: ex.num_riga || '',
                  docId: ex.id || '',
                  des_esercizio: nomeEx,
                  des_settore: settore,
                  settimana: w,
                  settimanaLabel: `W${w}`,
                  valoreOriginale: cur.raw,
                  caricoEstratto: cur.peso,
                  repsEstratte: cur.reps,
                  isCorpoLibero,
                  haSovraccarico: cur.hasZavorra,
                  prescrizione: cur.prescVal,
                  repsPreviste: cur.repsPresc,
                  seriePreviste: cur.seriePreviste,
                  livello: 'anomalia',
                  tipo: 'calo_inspiegabile',
                  titolo: `Calo improvviso di carico: da ${prev.peso} a ${cur.peso} kg (${incrementoPct}%)`,
                  spiegazione: `Il carico è sceso da ${prev.peso} a ${cur.peso} kg senza un aumento di ripetizioni a compensare.`,
                  conseguenza: `Possibile seduta di scarico/recupero o errore di digitazione.`,
                  correzioneConsigliata: `Se non si tratta di un refuso, metti una nota esplicativa tra parentesi.`
                });
              }
            }
          }

          // 2. Controllo Esercizio a Corpo Libero puro (ripetizioni calate drasticamente)
          if (isCorpoLibero && !cur.hasZavorra && cur.reps && prev.reps) {
            if (cur.reps <= prev.reps - 6 && w !== 4) {
              segnalazioni.push({
                id: `${ex.id || ex.num_riga}_w${w}_calo_reps_corpolibero`,
                coordinata,
                giorno,
                riga: rigaGiorno,
                numRiga: ex.num_riga || '',
                docId: ex.id || '',
                des_esercizio: nomeEx,
                des_settore: settore,
                settimana: w,
                settimanaLabel: `W${w}`,
                valoreOriginale: cur.raw,
                caricoEstratto: 0,
                repsEstratte: cur.reps,
                isCorpoLibero: true,
                haSovraccarico: false,
                prescrizione: cur.prescVal,
                repsPreviste: cur.repsPresc,
                seriePreviste: cur.seriePreviste,
                livello: 'anomalia',
                tipo: 'calo_reps_corpolibero',
                titolo: `Flessione reps a corpo libero: da ${prev.reps}r a ${cur.reps}r`,
                spiegazione: `Hai registrato ${cur.reps} reps rispetto alle ${prev.reps} della settimana precedente (-${prev.reps - cur.reps} reps).`,
                conseguenza: `Verificare se hai segnato solo l'ultima serie invece del totale/media.`,
                correzioneConsigliata: `Verifica se le reps inserite si riferiscono a tutte le serie o solo all'ultima.`
              });
            }
          }
        }
      }

      // C. Controllo Protocollo Week 4 (Scarico / Deload) - SOLO per esercizi NON a percentuali fisse
      if (w === 4 && cur.compilato && cur.peso && cur.peso > 0 && !isPercentuale) {
        const w3 = settimaneData[3];
        const w2 = settimaneData[2];

        // Se in scarico W4 il carico è SUPERIORE alla Week 3 di carico
        if (w3 && w3.compilato && w3.peso && cur.peso > w3.peso) {
          segnalazioni.push({
            id: `${ex.id || ex.num_riga}_w4_scarico_pesante`,
            coordinata,
            giorno,
            riga: rigaGiorno,
            numRiga: ex.num_riga || '',
            docId: ex.id || '',
            des_esercizio: nomeEx,
            des_settore: settore,
            settimana: 4,
            settimanaLabel: 'W4 (Scarico)',
            valoreOriginale: cur.raw,
            caricoEstratto: cur.peso,
            repsEstratte: cur.reps,
            isCorpoLibero,
            haSovraccarico: cur.hasZavorra,
            prescrizione: cur.prescVal,
            repsPreviste: cur.repsPresc,
            seriePreviste: cur.seriePreviste,
            livello: 'anomalia',
            tipo: 'scarico_non_rispettato',
            titolo: `Carico in Scarico W4 (${cur.peso} kg) superiore a W3 (${w3.peso} kg)`,
            spiegazione: `In W4 (settimana di scarico) hai usato ${cur.peso} kg, più pesante di W3 (${w3.peso} kg).`,
            conseguenza: `Mancato recupero neuromuscolare programmato per il test di W6.`,
            correzioneConsigliata: `In W4 usa un carico ridotto (consigliato: ${w2?.peso || 'W2'} kg di Week 2 o meno).`
          });
        }
      }

      // D. Controllo Protocollo Week 6 (Test Massimale / Picco)
      if (w === 6 && cur.compilato) {
        const numIns6 = ex.num_ins6 !== undefined && ex.num_ins6 !== null ? String(ex.num_ins6).trim() : '';

        // 1. Ha compilato ins_week6 con un peso valido ma manca num_ins6 (SOLO per esercizi con carico NON a percentuali fisse e NON a corpo libero)
        const hasValidLoadInW6 = cur.peso && cur.peso > 0;
        const isNoteOnlyNonFatto = /\b(?:non\s*fatto|non\s*eseguito|saltato|assente|infortunio|no)\b/i.test(cur.raw);
        if (!isPercentuale && !isCorpoLibero && hasValidLoadInW6 && !isNoteOnlyNonFatto && (!numIns6 || numIns6 === '-')) {
          segnalazioni.push({
            id: `${ex.id || ex.num_riga}_w6_manca_miglior_carico`,
            coordinata,
            giorno,
            riga: rigaGiorno,
            numRiga: ex.num_riga || '',
            docId: ex.id || '',
            des_esercizio: nomeEx,
            des_settore: settore,
            settimana: 6,
            settimanaLabel: 'W6 (Test)',
            valoreOriginale: cur.raw,
            caricoEstratto: cur.peso,
            repsEstratte: cur.reps,
            isCorpoLibero,
            haSovraccarico: cur.hasZavorra,
            prescrizione: cur.prescVal,
            repsPreviste: cur.repsPresc,
            seriePreviste: cur.seriePreviste,
            livello: 'anomalia',
            tipo: 'w6_manca_num_ins6',
            titolo: `Week 6: Compila il campo 'Miglior Carico' (num_ins6)`,
            spiegazione: `Hai registrato il carico (${cur.peso} kg) ma non hai compilato il campo dedicato 'Miglior Carico'.`,
            conseguenza: `Il calcolo per la nuova scheda userà una stima di fallback su W5.`,
            correzioneConsigliata: `Salva il carico top nel campo Miglior Carico (es. "${cur.peso}kg").`
          });
        }

        // 2. Carico W6 <= W1 a parità o calo di reps (Stallo o Regressione Mesociclo)
        const w1 = settimaneData[1];
        if (!isPercentuale && w1 && w1.compilato && cur.peso && w1.peso && cur.peso <= w1.peso) {
          const repsW1 = w1.reps || w1.repsPresc || 10;
          const repsW6 = cur.reps || cur.repsPresc || 6;

          // Se le reps in W6 sono inferiori o uguali a W1 e il carico non è salito
          if (repsW6 <= repsW1) {
            segnalazioni.push({
              id: `${ex.id || ex.num_riga}_w6_stallo_mesociclo`,
              coordinata,
              giorno,
              riga: rigaGiorno,
              numRiga: ex.num_riga || '',
              docId: ex.id || '',
              des_esercizio: nomeEx,
              des_settore: settore,
              settimana: 6,
              settimanaLabel: 'W6 (Test)',
              valoreOriginale: cur.raw,
              caricoEstratto: cur.peso,
              repsEstratte: cur.reps,
              isCorpoLibero,
              haSovraccarico: cur.hasZavorra,
              prescrizione: cur.prescVal,
              repsPreviste: cur.repsPresc,
              seriePreviste: cur.seriePreviste,
              livello: 'anomalia',
              tipo: 'stallo_fine_mesociclo',
              titolo: `Stallo mesociclo: nessun incremento tra W1 (${w1.peso} kg) e W6 (${cur.peso} kg)`,
              spiegazione: `Hai chiuso la W6 a ${cur.peso} kg, pari o inferiore a W1 (${w1.peso} kg) a parità di ripetizioni.`,
              conseguenza: `Segnale di stallo sui carichi o adattamento esaurito.`,
              correzioneConsigliata: `Valuta con il coach un cambio stimolo o imposta un carico limite per la prossima scheda.`
            });
          }
        }
      }
    }

    // 3. Controllo Incrociato con lo Storico delle Schede Precedenti (se presente)
    if (storicoEx.length > 0 && !isPercentuale) {
      const prevExRecent = storicoEx[0];
      const w1 = settimaneData[1];

      if (w1 && w1.compilato && w1.peso && w1.peso > 0) {
        let maxStoricoKg = 0;
        let maxStoricoScheda = null;

        storicoEx.forEach(hEx => {
          for (let hw = 1; hw <= 6; hw++) {
            const hVal = hEx['ins_week' + hw] || (hw === 6 ? hEx.num_ins6 : null);
            if (hVal) {
              const hPesoStr = estraiPesoDaInput(hVal, { isCorpoLibero });
              if (hPesoStr) {
                const p = parseFloat(hPesoStr);
                if (p > maxStoricoKg) {
                  maxStoricoKg = p;
                  maxStoricoScheda = hEx.num_scheda;
                }
              }
            }
          }
        });

        // Se il carico W1 della nuova scheda supera di oltre il 40% il massimo storico assoluto
        if (maxStoricoKg > 0 && w1.peso >= maxStoricoKg * 1.45 && w1.peso - maxStoricoKg >= (isManubri ? 6 : 15) && maxStoricoKg > 15) {
          const hasPerLatoNote = /\b(?:pl|p\.l\.|p\/l|x\s*lato|per\s*lato|a\s*lato|ciascun\s*lato)\b/i.test(w1.raw);
          const isPerLatoCoerente = hasPerLatoNote && (w1.peso / 2 <= maxStoricoKg * 1.35);

          if (!isPerLatoCoerente) {
            segnalazioni.push({
              id: `${ex.id || ex.num_riga}_w1_incoerente_storico`,
              coordinata,
              giorno,
              riga: rigaGiorno,
              numRiga: ex.num_riga || '',
              docId: ex.id || '',
              des_esercizio: nomeEx,
              des_settore: settore,
              settimana: 1,
              settimanaLabel: 'W1',
              valoreOriginale: w1.raw,
              caricoEstratto: w1.peso,
              repsEstratte: w1.reps,
              isCorpoLibero,
              haSovraccarico: w1.hasZavorra,
              prescrizione: w1.prescVal,
              repsPreviste: w1.repsPresc,
              seriePreviste: w1.seriePreviste,
              livello: 'anomalia',
              tipo: 'incoerenza_storico_recente',
              titolo: `Carico W1 (${w1.peso} kg) molto superiore al record storico (${maxStoricoKg} kg)`,
              spiegazione: `Hai inserito ${w1.peso} kg in W1 rispetto al record precedente di ${maxStoricoKg} kg (Scheda ${maxStoricoScheda}).`,
              conseguenza: `Verificare se hai registrato il peso complessivo o per lato.`,
              correzioneConsigliata: `Se intendevi il peso per lato, scrivi "${Math.round(w1.peso / 2)} kg pl" o "${Math.round(w1.peso / 2)} kg".`
            });
          }
        }
      }
    }
  });

  // Calcolo aggregati e statistiche
  const totaleErrori = segnalazioni.filter(s => s.livello === 'errore').length;
  const totaleAnomalie = segnalazioni.filter(s => s.livello === 'anomalia').length;
  const totaleParticolari = segnalazioni.filter(s => s.livello === 'particolare').length;

  totaleValidi = Math.max(0, totaleValoriControllati - (totaleErrori + totaleAnomalie));

  // Ripartizione per giorno
  segnalazioni.forEach(s => {
    const g = s.giorno;
    if (riepilogoPerGiorno[g]) {
      if (s.livello === 'errore') riepilogoPerGiorno[g].errori++;
      else if (s.livello === 'anomalia') riepilogoPerGiorno[g].anomalie++;
      else if (s.livello === 'particolare') riepilogoPerGiorno[g].particolari++;
    }
  });

  Object.keys(riepilogoPerGiorno).forEach(g => {
    const d = riepilogoPerGiorno[g];
    d.validi = Math.max(0, d.total - (d.errori + d.anomalie));
  });

  const penalita = (totaleErrori * 15) + (totaleAnomalie * 5) + (totaleParticolari * 1);
  const maxScore = Math.max(100, totaleValoriControllati * 10);
  const punteggio = Math.max(0, Math.min(100, Math.round(((maxScore - penalita) / maxScore) * 100)));

  const superato = totaleErrori === 0;

  return {
    totaleEsercizi: esercizi.length,
    totaleValoriControllati,
    totaleErrori,
    totaleAnomalie,
    totaleParticolari,
    totaleValidi,
    totaleFormatiColloquiali,
    percentualeQualita: punteggio,
    segnalazioni,
    riepilogoPerGiorno,
    superato,
    timestamp: new Date().toISOString()
  };
};
