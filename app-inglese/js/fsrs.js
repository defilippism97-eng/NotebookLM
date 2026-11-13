'use strict';
/*
 * FSRS (Free Spaced Repetition Scheduler) — implementazione compatta del modello
 * DSR (Difficoltà, Stabilità, Recuperabilità) con i parametri di default di FSRS-5.
 * Con meno di ~1.000 ripassi per utente i parametri di default sono la scelta
 * consigliata: l'ottimizzazione personale ha senso solo con molti più dati.
 *
 * Voti: 1 = Again (sbagliato), 2 = Hard, 3 = Good, 4 = Easy.
 * L'app non chiede mai all'utente di autovalutarsi: il voto deriva da esercizi
 * oggettivi (risposta giusta al primo colpo → 3, molto rapida → 4, altrimenti 1).
 */
const FSRS = (() => {
  const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
    1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  const DECAY = -0.5;
  const FACTOR = 19 / 81;
  const DAY = 86400000;
  const RELEARN_MS = 10 * 60 * 1000;

  const clampD = (d) => Math.min(10, Math.max(1, d));
  const initS = (g) => Math.max(W[g - 1], 0.1);
  const initD = (g) => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);

  function retrievability(card, now = Date.now()) {
    if (!card || card.last == null || !card.s) return 0;
    const t = Math.max(0, (now - card.last) / DAY);
    return Math.pow(1 + FACTOR * t / card.s, DECAY);
  }

  function nextD(d, g) {
    const dp = d - W[6] * (g - 3) * (10 - d) / 9;
    return clampD(W[7] * initD(4) + (1 - W[7]) * dp);
  }

  function recallS(d, s, r, g) {
    const hard = g === 2 ? W[15] : 1;
    const easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy);
  }

  function forgetS(d, s, r) {
    const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    return Math.min(sf, s);
  }

  const shortTermS = (s, g) => s * Math.exp(W[17] * (g - 3 + W[18]));

  /** Intervallo in giorni per raggiungere la ritenzione desiderata. */
  function intervalDays(s, retention = 0.9) {
    const days = (s / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
    return Math.min(36500, Math.max(1, Math.round(days)));
  }

  function newCard(id, now = Date.now()) {
    return { id, s: 0, d: 0, reps: 0, lapses: 0, last: null, due: now, state: 'new', added: now };
  }

  function review(card, g, now = Date.now(), retention = 0.9) {
    const c = { ...card };
    if (c.state === 'new' || c.last == null) {
      c.s = initS(g);
      c.d = initD(g);
    } else {
      const elapsedDays = (now - c.last) / DAY;
      const r = retrievability(c, now);
      if (elapsedDays < 1) c.s = shortTermS(c.s, g);
      else c.s = g === 1 ? forgetS(c.d, c.s, r) : recallS(c.d, c.s, r, g);
      c.d = nextD(c.d, g);
    }
    c.s = Math.max(0.1, c.s);
    if (g === 1 && card.state === 'review') c.lapses += 1;
    c.reps += 1;
    c.last = now;
    if (g === 1) {
      c.state = 'learning';
      c.due = now + RELEARN_MS;
    } else {
      c.state = 'review';
      c.due = now + intervalDays(c.s, retention) * DAY;
    }
    return c;
  }

  return { review, newCard, retrievability, intervalDays, DAY };
})();

if (typeof module !== 'undefined') module.exports = { FSRS };
