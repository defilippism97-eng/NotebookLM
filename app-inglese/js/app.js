'use strict';
/* Passo — app per imparare l'inglese, un passo al giorno. */

/* ------------------------------------------------------------------ utilità */
const DAY = 86400000;
const $ = (sel, root = document) => root.querySelector(sel);

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = (arr, n) => shuffle(arr).slice(0, n);
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };

function norm(s) {
  return String(s).toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:"“”()…—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function expand(s) {
  return norm(s)
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bi'd\b/g, 'i would')
    .replace(/\b(you|we|they)'re\b/g, '$1 are')
    .replace(/\b(it|he|she|that|what|where)'s\b/g, '$1 is')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/n't\b/g, ' not')
    .replace(/\s+/g, ' ')
    .trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

/* ------------------------------------------------------------------ dati */
const Store = {
  key: 'passo:v1',
  data: null,
  defaults() {
    return {
      v: 1,
      settings: {
        weeklyGoal: 4, newPerDay: 15, retention: 0.9, rate: 0.9, voice: '',
        font: 'lexend', textSize: 'm', theme: 'auto', paused: false,
      },
      cards: {}, extra: {}, lessons: {}, stories: {}, days: {},
    };
  },
  load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(this.key) || '{}') || {}; } catch (e) { saved = {}; }
    const d = this.defaults();
    this.data = { ...d, ...saved, settings: { ...d.settings, ...(saved.settings || {}) } };
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* storage non disponibile */ }
  },
};
const S = () => Store.data;

function logDay(field, n = 1) {
  const k = dayKey();
  const day = S().days[k] || (S().days[k] = { reviews: 0, lessons: 0, words: 0, reads: 0, speak: 0 });
  day[field] = (day[field] || 0) + n;
  Store.save();
}

const WORDS = new Map();
UNITS.forEach((u) => u.words.forEach((w) => WORDS.set(w.id, { ...w, unit: u.id })));
const getWord = (id) => WORDS.get(id) || S().extra[id] || null;
const allWordObjs = () => [...WORDS.values(), ...Object.values(S().extra)];
const unitById = (id) => UNITS.find((u) => u.id === id);
const storyIndex = () => UNITS.map((u) => ({ ...u.story, unit: u }));

/* ------------------------------------------------------------------ ripasso FSRS */
function dueQueue() {
  const now = Date.now();
  const eod = endOfToday();
  const cards = Object.values(S().cards);
  const due = cards.filter((c) => c.state !== 'new' && c.due <= eod);
  due.sort((a, b) => FSRS.retrievability(a, now) - FSRS.retrievability(b, now));
  const backlog = due.length > 40;
  const introducedToday = cards.filter((c) => c.firstSeen && dayKey(new Date(c.firstSeen)) === dayKey()).length;
  const newAllowance = backlog ? 0 : Math.max(0, S().settings.newPerDay - introducedToday);
  const fresh = cards.filter((c) => c.state === 'new').sort((a, b) => a.added - b.added).slice(0, newAllowance);
  return { due, fresh, backlog, total: due.length + fresh.length };
}

function ensureCard(id) {
  if (!S().cards[id]) S().cards[id] = FSRS.newCard(id);
  return S().cards[id];
}

function gradeCard(id, grade) {
  const c = ensureCard(id);
  if (c.state === 'new') c.firstSeen = Date.now();
  const updated = FSRS.review(c, grade, Date.now(), S().settings.retention);
  if (c.firstSeen) updated.firstSeen = c.firstSeen;
  S().cards[id] = updated;
  Store.save();
}

/* ------------------------------------------------------------------ voce */
const Speech = {
  voices: [],
  Rec: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  get canSpeak() { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; },
  get canListen() { return !!this.Rec; },
  init() {
    if (!this.canSpeak) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang)); };
    load();
    speechSynthesis.addEventListener?.('voiceschanged', load);
  },
  voice() {
    const pref = S().settings.voice;
    return this.voices.find((v) => v.name === pref)
      || this.voices.find((v) => /en[-_]GB/i.test(v.lang))
      || this.voices[0] || null;
  },
  say(text, { slow = false, onend } = {}) {
    if (!this.canSpeak) { onend && onend(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = this.voice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    u.rate = slow ? Math.max(0.5, S().settings.rate - 0.3) : S().settings.rate;
    if (onend) { u.onend = onend; u.onerror = onend; }
    speechSynthesis.speak(u);
  },
  stop() { if (this.canSpeak) speechSynthesis.cancel(); },
};

function speakBtn(text, { label = 'Ascolta', slow = false, big = false } = {}) {
  if (!Speech.canSpeak) return null;
  return h('button', {
    class: `icon-btn speak${big ? ' big' : ''}`, type: 'button',
    'aria-label': `${label}: ${text}`, title: label,
    onclick: (e) => { e.stopPropagation(); Speech.say(text, { slow }); },
  }, slow ? '🐢' : '🔊');
}

/* ------------------------------------------------------------------ interfaccia di base */
const app = () => $('#app');
const tabbar = () => $('#tabbar');

function applySettings() {
  const st = S().settings;
  const root = document.documentElement;
  if (st.theme === 'auto') delete root.dataset.theme; else root.dataset.theme = st.theme;
  root.dataset.font = st.font;
  root.dataset.size = st.textSize;
}

function mount(view, { flow = false, tab = null } = {}) {
  Speech.stop();
  const main = app();
  main.replaceChildren(view);
  document.body.classList.toggle('in-flow', flow);
  tabbar().hidden = flow;
  tabbar().querySelectorAll('a').forEach((a) => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  const heading = main.querySelector('h1, h2');
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
}

function modal({ title, body, actions }) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const close = (val) => { overlay.remove(); prev && prev.focus && prev.focus(); resolve(val); };
    const dialog = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
      h('h2', { id: 'modal-title' }, title),
      body ? (body.nodeType ? body : h('p', {}, body)) : null,
      h('div', { class: 'modal-actions' }, actions.map((a) => h('button', { class: `btn ${a.kind || ''}`, onclick: () => close(a.value) }, a.label))));
    const overlay = h('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) close(null); } }, dialog);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(null); });
    document.body.append(overlay);
    dialog.querySelector('button').focus();
  });
}

function toast(msg) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
}

/* ------------------------------------------------------------------ settimana e statistiche */
function weekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
}
const practicedOn = (d) => { const x = S().days[dayKey(d)]; return !!x && (x.reviews + x.lessons + x.reads + (x.speak || 0)) > 0; };

function weekCard() {
  const days = weekDays();
  const done = days.filter(practicedOn).length;
  const goal = S().settings.weeklyGoal;
  const labels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  const today = dayKey();
  const msg = done >= goal ? 'Obiettivo raggiunto: tutto il resto è un regalo.' : `Ancora ${goal - done} ${goal - done === 1 ? 'giorno' : 'giorni'} per l'obiettivo della settimana.`;
  return h('section', { class: 'card week', 'aria-label': 'Obiettivo settimanale' },
    h('div', { class: 'row between' }, h('h2', { class: 'h3' }, 'Questa settimana'), h('span', { class: 'pill' }, `${done} di ${goal} giorni`)),
    h('ol', { class: 'dots' }, days.map((d, i) => h('li', {
      class: `${practicedOn(d) ? 'on' : ''} ${dayKey(d) === today ? 'today' : ''}`,
      'aria-label': `${d.toLocaleDateString('it-IT', { weekday: 'long' })}: ${practicedOn(d) ? 'praticato' : 'non ancora'}`,
    }, labels[i]))),
    h('p', { class: 'muted small' }, msg));
}

function nextUnit() {
  return UNITS.find((u) => !S().lessons[u.id]?.done) || null;
}

/* ------------------------------------------------------------------ OGGI */
function viewToday() {
  const st = S();
  const first = Object.keys(st.lessons).length === 0;
  const hour = new Date().getHours();
  const hello = hour < 13 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const q = dueQueue();
  const unit = nextUnit();
  const parts = [];

  if (first) {
    parts.push(h('section', { class: 'hero' },
      h('p', { class: 'kicker' }, 'Benvenuto in Passo'),
      h('h1', {}, 'L\'inglese, un passo al giorno.'),
      h('p', {}, 'Lezioni da 8 minuti pensate per chi parla italiano. Nessun account, nessuna pubblicità, nessuna vita da perdere: gli errori fanno parte dell\'allenamento.'),
      h('ul', { class: 'features' },
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🎧'), 'Storie brevi da ascoltare e leggere, con la traduzione a portata di tocco'),
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🇮🇹'), 'Note sugli errori tipici degli italiani: falsi amici, soggetto, preposizioni'),
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🧠'), 'Un ripasso che si adatta alla tua memoria'),
        h('li', {}, h('span', { 'aria-hidden': 'true' }, '🎤'), 'Pratica di pronuncia, al tuo ritmo')),
      h('a', { class: 'btn primary block', href: '#/lezione/u1' }, 'Inizia la prima lezione'),
      h('p', { class: 'muted small center' }, 'I tuoi progressi restano solo su questo dispositivo.')));
    mount(h('div', { class: 'page' }, parts), { tab: 'oggi' });
    return;
  }

  parts.push(h('header', { class: 'page-head' },
    h('h1', {}, hello),
    h('a', { class: 'icon-btn', href: '#/impostazioni', 'aria-label': 'Impostazioni' }, '⚙️')));

  if (st.settings.paused) {
    parts.push(h('section', { class: 'card soft' },
      h('h2', { class: 'h3' }, 'Sei in pausa ☕'),
      h('p', {}, 'Nessun problema: la pausa è parte del percorso. I ripassi ti aspettano, senza fretta.'),
      h('button', { class: 'btn', onclick: () => { st.settings.paused = false; Store.save(); viewToday(); } }, 'Riprendi')));
  } else {
    parts.push(weekCard());
  }

  const mins = Math.max(1, Math.round(Math.min(q.total, 20) * 0.25));
  parts.push(h('section', { class: 'card' },
    h('p', { class: 'kicker' }, 'Ripasso'),
    q.total > 0
      ? [h('h2', { class: 'h3' }, `${q.total} ${q.total === 1 ? 'parola' : 'parole'} da ripassare`),
        h('p', { class: 'muted' }, `Circa ${mins} min. Prima le parole che stai per dimenticare.`),
        h('a', { class: 'btn primary', href: '#/ripasso' }, 'Ripassa ora')]
      : [h('h2', { class: 'h3' }, 'Tutto ripassato ✓'), h('p', { class: 'muted' }, 'La memoria ha bisogno anche di tempo: i prossimi ripassi arriveranno al momento giusto.')]));

  if (unit) {
    parts.push(h('section', { class: 'card' },
      h('p', { class: 'kicker' }, `Prossima lezione · ${unit.level}`),
      h('h2', { class: 'h3' }, `${unit.emoji} ${unit.title}`),
      h('p', { class: 'muted' }, `${unit.subtitle} · circa 8 min`),
      q.backlog ? h('p', { class: 'note-inline' }, 'Hai parecchi ripassi in arretrato: ti consiglio di farli prima. Le nuove parole sono in pausa finché non recuperi.') : null,
      h('a', { class: `btn ${q.total > 0 ? '' : 'primary'}`, href: `#/lezione/${unit.id}` }, 'Inizia la lezione')));
  } else {
    parts.push(h('section', { class: 'card soft' },
      h('h2', { class: 'h3' }, 'Hai completato tutte le lezioni 🎉'),
      h('p', {}, 'Continua con il ripasso e la rilettura veloce delle storie: è così che l\'inglese diventa automatico.')));
  }

  const readStories = storyIndex().filter((s) => st.stories[s.id]?.read);
  const sugg = readStories.length ? readStories[readStories.length - 1] : null;
  if (sugg) {
    parts.push(h('section', { class: 'card' },
      h('p', { class: 'kicker' }, 'Fluidità'),
      h('h2', { class: 'h3' }, `Rileggi “${sugg.title}”`),
      h('p', { class: 'muted' }, 'Rileggere testi che conosci già rende la lettura più veloce e naturale.'),
      h('a', { class: 'btn', href: `#/leggi/${sugg.id}/veloce` }, 'Rilettura veloce')));
  }

  mount(h('div', { class: 'page' }, parts), { tab: 'oggi' });
}

/* ------------------------------------------------------------------ PERCORSO */
function viewPath() {
  const next = nextUnit();
  const items = UNITS.map((u, i) => {
    const done = !!S().lessons[u.id]?.done;
    const isNext = next && next.id === u.id;
    return h('li', {},
      h('a', { class: `unit ${done ? 'done' : ''} ${isNext ? 'next' : ''}`, href: `#/lezione/${u.id}` },
        h('span', { class: 'unit-emoji', 'aria-hidden': 'true' }, u.emoji),
        h('span', { class: 'unit-text' },
          h('span', { class: 'unit-title' }, `${i + 1}. ${u.title}`),
          h('span', { class: 'muted small' }, `${u.level} · ${u.subtitle}`),
          h('span', { class: 'small' }, done ? `✓ ${u.can}` : isNext ? 'Consigliata ora' : '')),
        h('span', { class: 'chev', 'aria-hidden': 'true' }, '›')));
  });
  mount(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', {}, 'Percorso')),
    h('p', { class: 'muted' }, 'Puoi seguire l\'ordine consigliato o scegliere liberamente. Ogni lezione si può ripetere.'),
    h('ol', { class: 'units' }, items)), { tab: 'percorso' });
}

/* ------------------------------------------------------------------ LEGGI */
function viewLibrary() {
  const items = storyIndex().map((s) => {
    const rec = S().stories[s.id] || {};
    const words = s.lines.map((l) => l.en).join(' ').split(/\s+/).length;
    return h('li', {},
      h('a', { class: 'unit', href: `#/leggi/${s.id}` },
        h('span', { class: 'unit-emoji', 'aria-hidden': 'true' }, s.unit.emoji),
        h('span', { class: 'unit-text' },
          h('span', { class: 'unit-title', lang: 'en' }, s.title),
          h('span', { class: 'muted small' }, `${s.unit.level} · ${words} parole · lezione “${s.unit.title}”`),
          h('span', { class: 'small' }, rec.read ? `✓ Letta${rec.bestWpm ? ` · record ${rec.bestWpm} parole/min` : ''}` : '')),
        h('span', { class: 'chev', 'aria-hidden': 'true' }, '›')));
  });
  mount(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', {}, 'Leggi e ascolta')),
    h('p', { class: 'muted' }, 'Tocca una parola per vederne il significato e aggiungerla al ripasso.'),
    h('ol', { class: 'units' }, items)), { tab: 'leggi' });
}

function lookup(token, lineText) {
  const raw = token.toLowerCase().replace(/[’]/g, "'");
  const cands = [raw, raw.replace(/'s$/, ''), raw.replace(/ies$/, 'y'), raw.replace(/es$/, ''), raw.replace(/s$/, ''), raw.replace(/ed$/, ''), raw.replace(/d$/, '')];
  const singles = new Map();
  WORDS.forEach((w) => { if (!w.en.includes(' ')) singles.set(w.en.toLowerCase(), w); });
  let word = null; let gloss = null; let lemma = raw;
  for (const c of cands) {
    if (singles.has(c)) { word = singles.get(c); lemma = c; break; }
    if (GLOSSARY[c]) { gloss = GLOSSARY[c]; lemma = c; break; }
  }
  const lower = ` ${norm(lineText)} `;
  const phrases = [...WORDS.values()].filter((w) => w.en.includes(' ') && lower.includes(` ${norm(w.en)} `) && norm(w.en).split(' ').includes(norm(raw)));
  Object.entries(GLOSSARY).forEach(([k, v]) => {
    if (k.includes(' ') && v && lower.includes(` ${norm(k)} `) && norm(k).split(' ').includes(norm(raw))) phrases.push({ en: k, it: v, glossOnly: true });
  });
  const isName = NAMES.includes(raw.replace(/'s$/, ''));
  return { raw, lemma, word, gloss, phrases, isName };
}

function glossSheet(token, line) {
  const r = lookup(token, line.en);
  const rows = [];
  const addBtn = (id, makeExtra) => {
    const exists = !!S().cards[id];
    const b = h('button', {
      class: 'btn small', disabled: exists,
      onclick: () => {
        if (makeExtra) S().extra[id] = makeExtra;
        ensureCard(id); Store.save();
        b.textContent = 'Aggiunta al ripasso ✓'; b.disabled = true;
      },
    }, exists ? 'Già nel ripasso ✓' : 'Aggiungi al ripasso');
    return b;
  };
  if (r.isName) rows.push(h('p', {}, 'Nome proprio (persona o luogo).'));
  if (r.word) {
    rows.push(h('div', { class: 'gloss-row' },
      h('div', {}, h('strong', { lang: 'en' }, r.word.en), ' — ', r.word.it, r.word.trap ? h('p', { class: 'small warn' }, r.word.trap) : null),
      speakBtn(r.word.en)));
    rows.push(addBtn(r.word.id));
  } else if (r.gloss) {
    rows.push(h('div', { class: 'gloss-row' }, h('div', {}, h('strong', { lang: 'en' }, r.lemma), ' — ', r.gloss), speakBtn(r.lemma)));
    rows.push(addBtn(`x:${r.lemma}`, { id: `x:${r.lemma}`, en: r.lemma, it: r.gloss, ex: line.en, exIt: line.it }));
  } else if (!r.isName) {
    rows.push(h('div', { class: 'gloss-row' }, h('div', {}, h('strong', { lang: 'en' }, token), ' — ', h('span', { class: 'muted' }, 'traduzione non disponibile')), speakBtn(token)));
  }
  r.phrases.forEach((p) => {
    rows.push(h('div', { class: 'gloss-row phrase' }, h('div', {}, 'Espressione: ', h('strong', { lang: 'en' }, p.en), ' — ', p.it), speakBtn(p.en)));
  });
  rows.push(h('p', { class: 'small muted' }, 'Nella frase: ', h('span', { lang: 'en' }, line.en)));
  modal({ title: token, body: h('div', { class: 'gloss' }, rows), actions: [{ label: 'Chiudi', value: null }] });
}

function tokenize(text) {
  return text.split(/([A-Za-zÀ-ÿ’']+(?:-[A-Za-z]+)*)/).filter((p) => p !== '');
}

function Reader(story, { lesson = false, onDone } = {}) {
  let showIt = false;
  let playing = false;
  let playToken = 0;
  const lineEls = [];

  const linesWrap = h('div', { class: 'story', lang: 'en' }, story.lines.map((line, i) => {
    const words = tokenize(line.en).map((part) => (/^[A-Za-zÀ-ÿ’']/.test(part)
      ? h('button', { class: 'w', type: 'button', onclick: () => glossSheet(part, line) }, part)
      : part));
    const trans = h('p', { class: 'trans', lang: 'it', hidden: true }, line.it);
    const el = h('div', { class: 'line' },
      h('button', { class: 'icon-btn line-play', type: 'button', 'aria-label': `Ascolta la frase ${i + 1}`, onclick: () => { stopAll(); Speech.say(line.en); } }, '🔊'),
      h('div', {}, h('p', { class: 'en' }, words), trans));
    lineEls.push({ el, trans });
    return el;
  }));

  function stopAll() {
    playing = false; playToken++;
    Speech.stop();
    lineEls.forEach((l) => l.el.classList.remove('current'));
    playBtn.textContent = '▶ Ascolta tutto';
  }
  function playFrom(i, token) {
    if (token !== playToken || i >= story.lines.length) { if (token === playToken) stopAll(); return; }
    lineEls.forEach((l, k) => l.el.classList.toggle('current', k === i));
    lineEls[i].el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    Speech.say(story.lines[i].en, { onend: () => setTimeout(() => playFrom(i + 1, token), 350) });
  }
  const playBtn = h('button', {
    class: 'btn small', type: 'button',
    onclick: () => {
      if (playing) { stopAll(); return; }
      playing = true; playToken++; playBtn.textContent = '⏸ Ferma';
      playFrom(0, playToken);
    },
  }, '▶ Ascolta tutto');
  const transBtn = h('button', {
    class: 'btn small', type: 'button', 'aria-pressed': 'false',
    onclick: () => {
      showIt = !showIt;
      lineEls.forEach((l) => { l.trans.hidden = !showIt; });
      transBtn.setAttribute('aria-pressed', String(showIt));
      transBtn.textContent = showIt ? 'Nascondi traduzione' : 'Mostra traduzione';
    },
  }, 'Mostra traduzione');

  const finish = h('button', {
    class: 'btn primary block', type: 'button',
    onclick: () => {
      stopAll();
      const rec = S().stories[story.id] || (S().stories[story.id] = {});
      if (!rec.read) { rec.read = true; }
      logDay('reads');
      onDone && onDone();
    },
  }, lesson ? 'Ho letto la storia' : 'Fatto');

  return h('div', { class: 'reader' },
    h('p', { class: 'kicker' }, lesson ? 'Leggi e ascolta' : 'Storia'),
    h('h2', { lang: 'en' }, story.title),
    h('p', { class: 'muted small' }, 'Tocca una parola per il significato. Prova prima senza traduzione: le parole nuove le hai appena viste.'),
    Speech.canSpeak ? h('div', { class: 'row gap wrap' }, playBtn, transBtn) : h('div', { class: 'row gap' }, transBtn),
    linesWrap,
    finish);
}

function viewStory(id, mode) {
  const s = storyIndex().find((x) => x.id === id);
  if (!s) { location.hash = '#/leggi'; return; }
  const tabs = h('div', { class: 'seg', role: 'tablist' },
    h('a', { role: 'tab', href: `#/leggi/${id}`, 'aria-selected': String(mode !== 'veloce') }, 'Leggi'),
    h('a', { role: 'tab', href: `#/leggi/${id}/veloce`, 'aria-selected': String(mode === 'veloce') }, 'Rilettura veloce'));
  const body = mode === 'veloce' ? FastReader(s) : Reader(s, { onDone: () => { toast('Storia segnata come letta ✓'); location.hash = '#/leggi'; } });
  mount(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('a', { class: 'icon-btn', href: '#/leggi', 'aria-label': 'Torna alla libreria' }, '‹'), h('span', { class: 'muted' }, s.unit.title)),
    tabs, body), { tab: 'leggi' });
}

function FastReader(story) {
  const words = story.lines.map((l) => l.en).join(' ').split(/\s+/).length;
  const rec = S().stories[story.id] || {};
  let t0 = 0;
  const text = h('div', { class: 'story fast', lang: 'en', hidden: true }, story.lines.map((l) => h('p', {}, l.en)));
  const result = h('div', { role: 'status', 'aria-live': 'polite' });
  const btn = h('button', {
    class: 'btn primary block', type: 'button',
    onclick: () => {
      if (!t0) {
        t0 = performance.now(); text.hidden = false; btn.textContent = 'Ho finito';
        text.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const mins = (performance.now() - t0) / 60000;
      const wpm = Math.round(words / Math.max(mins, 0.05));
      const r = S().stories[story.id] || (S().stories[story.id] = {});
      const prev = r.bestWpm || 0;
      r.read = true;
      r.bestWpm = Math.max(prev, wpm);
      logDay('reads');
      result.replaceChildren(h('div', { class: 'card soft' },
        h('h3', {}, `${wpm} parole al minuto`),
        h('p', {}, prev && wpm > prev ? `Nuovo record! Prima: ${prev}.` : prev ? `Il tuo record è ${prev}. La velocità cresce rileggendo.` : 'Primo tempo registrato. Riprova tra qualche giorno.')));
      btn.textContent = 'Ricomincia'; t0 = 0; text.hidden = true;
    },
  }, 'Inizia a leggere');
  return h('div', { class: 'reader' },
    h('p', { class: 'kicker' }, 'Sviluppo della fluidità'),
    h('h2', { lang: 'en' }, story.title),
    h('p', {}, 'Leggi a un ritmo comodo ma senza fermarti: sono parole che conosci già. L\'obiettivo è leggere in inglese senza tradurre in testa.'),
    rec.bestWpm ? h('p', { class: 'muted small' }, `Record: ${rec.bestWpm} parole/min`) : null,
    btn, text, result);
}

/* ------------------------------------------------------------------ esercizi */
function feedbackArea() {
  return h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
}
function setFeedback(el, kind, title, text, action) {
  el.className = `feedback show ${kind}`;
  el.replaceChildren(...[
    h('div', { class: 'fb-text' }, h('strong', {}, title), text ? (text.nodeType ? text : h('p', {}, text)) : null),
    action ? h('button', { class: 'btn primary', type: 'button', onclick: action.fn }, action.label) : null,
  ].filter(Boolean));
  const b = el.querySelector('button');
  if (b) b.focus({ preventScroll: true });
}

/* Correzione a due stadi: primo errore → suggerimento; secondo → soluzione. */
function ExerciseMC({ kicker, prompt, promptLang, sub, audio, options, answer, hint, explain, onDone }) {
  let tries = 0; let finished = false;
  const t0 = performance.now();
  const fb = feedbackArea();
  const optLang = promptLang === 'en' ? 'it' : 'en';
  const btns = options.map((o, i) => h('button', { class: 'option', type: 'button', lang: optLang, onclick: () => choose(i) }, o));
  function choose(i) {
    if (finished) return;
    if (i === answer) {
      finished = true;
      btns[i].classList.add('correct');
      btns.forEach((b) => { b.disabled = true; });
      if (optLang === 'en') Speech.say(options[i]);
      const ms = performance.now() - t0;
      setFeedback(fb, 'ok', tries === 0 ? 'Giusto!' : 'Ora sì!', explain, { label: 'Continua', fn: () => onDone({ correct: tries === 0, firstTry: tries === 0, ms }) });
      return;
    }
    tries++;
    btns[i].classList.add('wrong'); btns[i].disabled = true;
    if (tries === 1) {
      setFeedback(fb, 'hint', 'Quasi. Un suggerimento:', hint || 'Rileggi con calma e riprova.');
    } else {
      finished = true;
      btns.forEach((b) => { b.disabled = true; });
      btns[answer].classList.add('correct');
      setFeedback(fb, 'reveal', 'La risposta è:', h('p', { lang: optLang }, options[answer], explain ? h('span', { class: 'small block muted', lang: 'it' }, explain) : null),
        { label: 'Continua', fn: () => onDone({ correct: false, firstTry: false, ms: performance.now() - t0 }) });
    }
  }
  if (audio && Speech.canSpeak) setTimeout(() => Speech.say(audio), 250);
  return h('div', { class: 'exercise' },
    h('p', { class: 'kicker' }, kicker),
    h('div', { class: 'prompt-row' }, h('h2', { class: 'prompt', lang: promptLang }, prompt), audio ? speakBtn(audio) : null, audio ? speakBtn(audio, { slow: true, label: 'Ascolta lentamente' }) : null),
    sub ? h('p', { class: 'muted' }, sub) : null,
    h('div', { class: 'options' }, btns),
    fb);
}

function ExerciseType({ kicker, prompt, sub, answers, display, hint, explain, onDone }) {
  let tries = 0; let finished = false;
  const t0 = performance.now();
  const fb = feedbackArea();
  const accepted = answers.map(expand);
  const input = h('input', {
    class: 'answer', type: 'text', lang: 'en', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
    'aria-label': 'La tua risposta in inglese', placeholder: 'Scrivi in inglese…',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } },
  });
  const checkBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => check() }, 'Controlla');
  const giveUp = h('button', { class: 'btn ghost', type: 'button', onclick: () => reveal() }, 'Non lo so');
  function reveal() {
    finished = true; input.disabled = true; checkBtn.disabled = true; giveUp.disabled = true;
    Speech.say(display);
    setFeedback(fb, 'reveal', 'La risposta è:', h('p', { lang: 'en' }, h('strong', {}, display), explain ? h('span', { class: 'small block muted', lang: 'it' }, explain) : null),
      { label: 'Continua', fn: () => onDone({ correct: false, firstTry: false, ms: performance.now() - t0 }) });
  }
  function check() {
    if (finished) return;
    const val = expand(input.value);
    if (!val) { input.focus(); return; }
    const exact = accepted.includes(val);
    const close = !exact && accepted.some((a) => a.length >= 4 && levenshtein(a, val) === 1);
    if (exact || close) {
      finished = true; input.disabled = true; checkBtn.disabled = true; giveUp.disabled = true;
      input.classList.add('correct');
      Speech.say(display);
      const ms = performance.now() - t0;
      const msg = close ? h('p', {}, 'Attenzione all\'ortografia: ', h('strong', { lang: 'en' }, display)) : explain;
      setFeedback(fb, 'ok', tries === 0 ? 'Giusto!' : 'Ora sì!', msg, { label: 'Continua', fn: () => onDone({ correct: tries === 0, firstTry: tries === 0, ms }) });
      return;
    }
    tries++;
    input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 400);
    if (tries === 1) {
      const auto = `Inizia con «${display.slice(0, Math.min(2, display.length))}…» (${display.replace(/[^A-Za-z']/g, '').length} lettere).`;
      setFeedback(fb, 'hint', 'Quasi. Un suggerimento:', hint ? `${hint} ${auto}` : auto);
      input.select();
    } else reveal();
  }
  setTimeout(() => input.focus(), 50);
  return h('div', { class: 'exercise' },
    h('p', { class: 'kicker' }, kicker),
    h('h2', { class: 'prompt', lang: 'it' }, prompt),
    sub ? h('p', { class: 'muted' }, sub) : null,
    input,
    h('div', { class: 'row gap' }, checkBtn, giveUp),
    fb);
}

function ExerciseBuild({ it, en, onDone }) {
  const target = en.split(/\s+/);
  let tries = 0; let finished = false;
  const t0 = performance.now();
  const fb = feedbackArea();
  const answer = h('div', { class: 'build-answer', 'aria-label': 'La tua frase', lang: 'en' });
  const bank = h('div', { class: 'build-bank', lang: 'en' });
  let order = shuffle(target.map((w, i) => ({ w, i })));
  if (order.map((o) => o.w).join(' ') === en && target.length > 1) order = [...order.slice(1), order[0]];
  const chips = order.map((o) => {
    const chip = h('button', { class: 'chip', type: 'button', onclick: () => move(chip) }, o.w);
    return chip;
  });
  chips.forEach((c) => bank.append(c));
  function move(chip) {
    if (finished) return;
    if (chip.parentElement === bank) answer.append(chip); else bank.append(chip);
    fb.className = 'feedback';
  }
  const checkBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => check() }, 'Controlla');
  function check() {
    if (finished) return;
    const built = [...answer.children].map((c) => c.textContent).join(' ');
    if (!built) return;
    if (norm(built) === norm(en)) {
      finished = true; checkBtn.disabled = true;
      answer.classList.add('correct');
      Speech.say(en);
      setFeedback(fb, 'ok', tries === 0 ? 'Giusto!' : 'Ora sì!', null, { label: 'Continua', fn: () => onDone({ correct: tries === 0, firstTry: tries === 0, ms: performance.now() - t0 }) });
      return;
    }
    tries++;
    if (tries === 1) setFeedback(fb, 'hint', 'Quasi. Un suggerimento:', h('p', {}, 'La frase inizia con ', h('strong', { lang: 'en' }, `«${target[0]}»`), '. Tocca una parola per rimetterla al suo posto.'));
    else {
      finished = true; checkBtn.disabled = true;
      Speech.say(en);
      setFeedback(fb, 'reveal', 'La frase corretta è:', h('p', { lang: 'en' }, en), { label: 'Continua', fn: () => onDone({ correct: false, firstTry: false, ms: performance.now() - t0 }) });
    }
  }
  return h('div', { class: 'exercise' },
    h('p', { class: 'kicker' }, 'Componi la frase'),
    h('h2', { class: 'prompt', lang: 'it' }, it),
    answer, bank,
    h('div', { class: 'row gap' }, checkBtn),
    fb);
}

function ExerciseSpeak({ en, it, onDone }) {
  const fb = feedbackArea();
  const status = h('p', { class: 'small muted', role: 'status', 'aria-live': 'polite' });
  const said = h('textarea', { class: 'answer', rows: 2, lang: 'en', 'aria-label': 'Cosa ha capito il telefono (puoi correggerlo)', hidden: true });
  const target = h('p', { class: 'target', lang: 'en' }, en);
  let rec = null; let listening = false; let pressT = 0; let toggleMode = false; let finalText = '';

  function evaluate() {
    const want = expand(en).split(' ');
    const got = new Set(expand(said.value).split(' '));
    const ok = want.filter((w) => got.has(w)).length;
    const score = ok / want.length;
    const words = en.split(/\s+/);
    target.replaceChildren(...words.flatMap((w, i) => {
      const hit = expand(w).split(' ').every((x) => !x || got.has(x));
      return [h('span', { class: hit ? 'hit' : 'miss' }, w), i < words.length - 1 ? ' ' : ''];
    }));
    logDay('speak');
    const title = score >= 0.8 ? 'Si capisce bene! 👏' : score >= 0.5 ? 'Buon tentativo.' : 'Proviamo ancora.';
    const text = score >= 0.8 ? 'Ottimo lavoro sulla chiarezza.' : 'Riascolta le parole evidenziate (anche lentamente 🐢) e ripeti. Puoi riprovare quante volte vuoi.';
    setFeedback(fb, score >= 0.8 ? 'ok' : 'hint', title, text, { label: 'Continua', fn: () => onDone({ correct: true, firstTry: true }) });
  }
  function start() {
    if (listening || !Speech.canListen) return;
    Speech.stop();
    try {
      rec = new Speech.Rec();
      rec.lang = 'en-GB'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
      finalText = '';
      rec.onresult = (e) => {
        let interim = '';
        for (let k = e.resultIndex; k < e.results.length; k++) {
          const r = e.results[k];
          if (r.isFinal) finalText += `${r[0].transcript} `; else interim += r[0].transcript;
        }
        said.hidden = false; said.value = (finalText + interim).trim();
      };
      rec.onerror = (e) => {
        const msgs = {
          'not-allowed': 'Microfono non autorizzato. Puoi comunque ripetere ad alta voce e premere Continua.',
          'no-speech': 'Non ho sentito nulla. Riprova, un po\' più vicino al microfono.',
          network: 'Il riconoscimento vocale non è disponibile in questo momento.',
        };
        status.textContent = msgs[e.error] || 'Il riconoscimento vocale non ha funzionato. Riprova.';
      };
      rec.onend = () => {
        listening = false; toggleMode = false; mic.classList.remove('rec'); mic.textContent = '🎤 Tieni premuto e parla';
        if (said.value.trim()) evaluate();
      };
      rec.start();
      listening = true; mic.classList.add('rec'); mic.textContent = '● Ti ascolto… rilascia per finire';
      status.textContent = '';
    } catch (err) {
      status.textContent = 'Il riconoscimento vocale non è disponibile in questo browser.';
    }
  }
  function stop() { if (rec && listening) rec.stop(); }

  const mic = Speech.canListen ? h('button', {
    class: 'btn mic', type: 'button',
    onpointerdown: (e) => { e.preventDefault(); if (listening && toggleMode) { stop(); return; } pressT = performance.now(); start(); },
    onpointerup: () => { if (!listening) return; if (performance.now() - pressT < 400) { toggleMode = true; mic.textContent = '● Ti ascolto… tocca per finire'; } else stop(); },
    onpointercancel: () => { if (!toggleMode) stop(); },
    onkeydown: (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); if (listening) stop(); else { toggleMode = true; start(); } } },
    oncontextmenu: (e) => e.preventDefault(),
  }, '🎤 Tieni premuto e parla') : null;

  setTimeout(() => Speech.say(en), 250);
  return h('div', { class: 'exercise' },
    h('p', { class: 'kicker' }, 'Ascolta e ripeti'),
    h('div', { class: 'prompt-row' }, target, speakBtn(en), speakBtn(en, { slow: true, label: 'Ascolta lentamente' })),
    h('p', { class: 'muted', lang: 'it' }, it),
    mic
      ? [mic, said, h('button', { class: 'btn ghost small', type: 'button', onclick: () => { if (said.value.trim()) evaluate(); } }, 'Ricontrolla il testo'),
        h('p', { class: 'small muted' }, 'Nota: il riconoscimento del browser tende a "correggere" ciò che dici. Usalo come allenamento, non come giudizio.')]
      : h('p', { class: 'card soft small' }, 'Questo browser non supporta il riconoscimento vocale: ascolta e ripeti ad alta voce, anche più volte.'),
    status,
    h('button', { class: 'btn block', type: 'button', onclick: () => { stop(); logDay('speak'); onDone({ correct: true, firstTry: true }); } }, 'Continua'),
    fb);
}

function ExerciseWrite({ prompt, model, onDone }) {
  const ta = h('textarea', { class: 'answer', rows: 3, lang: 'en', 'aria-label': 'Il tuo testo in inglese', placeholder: 'Scrivi qui in inglese…', spellcheck: 'false' });
  const out = h('div', { role: 'status', 'aria-live': 'polite' });
  const cmp = h('button', {
    class: 'btn primary', type: 'button',
    onclick: () => {
      out.replaceChildren(h('div', { class: 'card soft' },
        h('p', { class: 'kicker' }, 'Un modello possibile'),
        h('p', { lang: 'en' }, h('strong', {}, model), ' ', speakBtn(model)),
        h('p', { class: 'small muted' }, 'Confronta con la tua frase: hai messo il soggetto? Le preposizioni? Non deve essere uguale, deve essere chiara.')),
      h('button', { class: 'btn primary block', type: 'button', onclick: () => onDone({ correct: true, firstTry: true }) }, 'Continua'));
      cmp.hidden = true;
    },
  }, 'Confronta con un modello');
  return h('div', { class: 'exercise' },
    h('p', { class: 'kicker' }, 'Scrivi'),
    h('h2', { class: 'prompt', lang: 'it' }, prompt),
    ta,
    h('div', { class: 'row gap' }, cmp, h('button', { class: 'btn ghost', type: 'button', onclick: () => onDone({ correct: true, firstTry: true }) }, 'Salta')),
    out);
}

function distractors(word, n, field) {
  const pool = allWordObjs().filter((w) => w.id !== word.id && norm(w[field]) !== norm(word[field]));
  const sameUnit = pool.filter((w) => w.unit === word.unit);
  const picks = sample(sameUnit.length >= n ? sameUnit : pool, n);
  return picks.map((w) => w[field]);
}

function wordExercise(word, kind, onDone) {
  if (kind === 'meaning') {
    const opts = shuffle([word.it, ...distractors(word, 3, 'it')]);
    return ExerciseMC({
      kicker: 'Cosa significa?', prompt: word.en, promptLang: 'en', audio: word.en,
      options: opts, answer: opts.indexOf(word.it),
      hint: `Pensa alla frase: “${word.ex}”`, explain: word.trap || `${word.ex} — ${word.exIt}`, onDone,
    });
  }
  if (kind === 'choose-en') {
    const opts = shuffle([word.en, ...distractors(word, 3, 'en')]);
    return ExerciseMC({
      kicker: 'Come si dice in inglese?', prompt: word.it, promptLang: 'it',
      options: opts, answer: opts.indexOf(word.en),
      hint: `Esempio: “${word.exIt}”`, explain: word.trap || null, onDone,
    });
  }
  if (kind === 'cloze' && word.ex && word.ex.toLowerCase().includes(word.en.toLowerCase())) {
    const idx = word.ex.toLowerCase().indexOf(word.en.toLowerCase());
    const blank = `${word.ex.slice(0, idx)}_____${word.ex.slice(idx + word.en.length)}`;
    return ExerciseType({
      kicker: 'Completa la frase', prompt: blank, sub: `${word.exIt}`,
      answers: [word.en, ...(word.alt || [])], display: word.en, explain: word.ex, onDone,
    });
  }
  return ExerciseType({
    kicker: 'Scrivi in inglese', prompt: word.it,
    answers: [word.en, ...(word.alt || [])], display: word.en, explain: word.trap || word.ex, onDone,
  });
}

function trapExercise(t, onDone) {
  return ExerciseMC({
    kicker: 'Trappola per italiani', prompt: t.prompt, promptLang: 'it', sub: 'Qual è la frase corretta?',
    options: t.options, answer: t.answer, hint: t.hint, explain: t.hint, onDone,
  });
}

function listenExercise(story, lineIdx, onDone) {
  const line = story.lines[lineIdx];
  const others = sample(story.lines.filter((_, i) => i !== lineIdx), 2).map((l) => l.it);
  const opts = shuffle([line.it, ...others]);
  return ExerciseMC({
    kicker: 'Ascolta: cosa significa?', prompt: '🎧', promptLang: 'en', audio: line.en,
    options: opts, answer: opts.indexOf(line.it), sub: 'Ascolta (anche lentamente 🐢) e scegli la traduzione.',
    hint: 'Riascolta lentamente con il pulsante 🐢.', explain: line.en, onDone,
  });
}

/* ------------------------------------------------------------------ flusso a passi (lezione/ripasso) */
function Flow({ steps, exitText, render }) {
  let i = 0;
  const fill = h('span');
  const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Avanzamento', 'aria-valuemin': '0', 'aria-valuemax': '100' }, fill);
  const body = h('main', { class: 'flow-body' });
  const exitBtn = h('button', {
    class: 'icon-btn', type: 'button', 'aria-label': 'Esci',
    onclick: async () => {
      const r = await modal({
        title: 'Vuoi uscire?', body: exitText,
        actions: [{ label: 'Continua', value: false, kind: '' }, { label: 'Esci', value: true, kind: '' }],
      });
      if (r) { Speech.stop(); location.hash = '#/oggi'; }
    },
  }, '✕');
  const root = h('div', { class: 'flow' }, h('header', { class: 'flow-head' }, exitBtn, bar), body);
  const api = {
    steps,
    get index() { return i; },
    next() { i++; show(); },
    insertBeforeTail(step) {
      const tail = steps.findIndex((s, k) => k > i && s.tail);
      steps.splice(tail === -1 ? steps.length : tail, 0, step);
    },
  };
  function show() {
    Speech.stop();
    const pct = Math.round((i / Math.max(1, steps.length - 1)) * 100);
    fill.style.width = `${pct}%`; bar.setAttribute('aria-valuenow', String(pct));
    body.replaceChildren(render(steps[i], api));
    window.scrollTo(0, 0);
    const hd = body.querySelector('h1, h2');
    if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
  }
  mount(root, { flow: true });
  show();
  return api;
}

/* ------------------------------------------------------------------ LEZIONE */
function buildLesson(unit) {
  const steps = [];
  unit.words.forEach((w) => steps.push({ type: 'intro', w: { ...w, unit: unit.id } }));
  steps.push({ type: 'story' });
  steps.push({ type: 'note' });

  const ws = shuffle(unit.words.map((w) => ({ ...w, unit: unit.id })));
  const practice = [];
  ws.slice(0, 3).forEach((w) => practice.push({ type: 'word', kind: 'meaning', w }));
  ws.slice(3, 5).forEach((w) => practice.push({ type: 'word', kind: 'choose-en', w }));
  ws.slice(5, 7).forEach((w) => practice.push({ type: 'word', kind: 'type', w }));
  unit.traps.forEach((t) => practice.push({ type: 'trap', t }));
  const lineIdx = shuffle(unit.story.lines.map((_, i) => i).filter((i) => unit.story.lines[i].en.split(/\s+/).length <= 9));
  if (lineIdx[0] != null) practice.push({ type: 'build', line: unit.story.lines[lineIdx[0]] });
  if (lineIdx[1] != null) practice.push({ type: 'listen', idx: lineIdx[1] });
  const prev = UNITS.slice(0, UNITS.indexOf(unit)).filter((u) => S().lessons[u.id]?.done);
  if (prev.length) { const pu = prev[Math.floor(Math.random() * prev.length)]; practice.push({ type: 'trap', t: sample(pu.traps, 1)[0], fromPrev: pu.title }); }

  // Interleaving: mescola i tipi evitando più di due esercizi uguali di fila.
  let mixed = shuffle(practice);
  for (let k = 2; k < mixed.length; k++) {
    if (mixed[k].type === mixed[k - 1].type && mixed[k].type === mixed[k - 2].type) {
      const j = mixed.findIndex((s, x) => x > k && s.type !== mixed[k].type);
      if (j > -1) [mixed[k], mixed[j]] = [mixed[j], mixed[k]];
    }
  }
  steps.push(...mixed);
  sample(unit.speak, 2).forEach((p) => steps.push({ type: 'speak', p, tail: true }));
  steps.push({ type: 'write', tail: true });
  steps.push({ type: 'end', tail: true });
  return steps;
}

function startLesson(unitId) {
  const unit = unitById(unitId);
  if (!unit) { location.hash = '#/percorso'; return; }
  const results = {};
  const firstLesson = Object.keys(S().lessons).length === 0;

  const record = (st, api) => (r) => {
    if (st.w) {
      const prevOk = results[st.w.id] ? results[st.w.id].ok : true;
      results[st.w.id] = { ok: prevOk && r.correct && r.firstTry };
    }
    if (!(r.correct && r.firstTry) && !st.again && ['word', 'trap', 'build', 'listen'].includes(st.type)) {
      api.insertBeforeTail({ ...st, again: true, kind: st.kind === 'type' ? 'choose-en' : st.kind });
    }
    api.next();
  };

  function finishLesson() {
    if (S().lessons[unit.id]?.done) {
      S().lessons[unit.id].count = (S().lessons[unit.id].count || 1) + 1;
    } else {
      S().lessons[unit.id] = { done: true, date: Date.now(), count: 1 };
      unit.words.forEach((w) => {
        if (S().cards[w.id]) return;
        ensureCard(w.id);
        if (results[w.id]) gradeCard(w.id, results[w.id].ok ? 3 : 1);
      });
      logDay('words', unit.words.length);
    }
    const sr = S().stories[unit.story.id] || (S().stories[unit.story.id] = {});
    sr.read = true;
    logDay('lessons');
    Store.save();
  }

  Flow({
    steps: buildLesson(unit),
    exitText: 'Puoi riprendere la lezione quando vuoi. Questa volta i progressi della lezione non verranno salvati.',
    render(st, api) {
      switch (st.type) {
        case 'intro': {
          const w = st.w;
          setTimeout(() => Speech.say(w.en), 250);
          return h('div', { class: 'exercise intro' },
            h('p', { class: 'kicker' }, `Parola nuova · ${unit.words.findIndex((x) => x.id === w.id) + 1} di ${unit.words.length}`),
            h('div', { class: 'prompt-row' }, h('h2', { class: 'word-big', lang: 'en' }, w.en), speakBtn(w.en), speakBtn(w.en, { slow: true, label: 'Ascolta lentamente' })),
            h('p', { class: 'word-it' }, w.it),
            w.trap ? h('p', { class: 'note-inline' }, '⚠️ ', w.trap) : null,
            h('div', { class: 'example' },
              h('p', { lang: 'en' }, h('strong', {}, w.ex), ' ', speakBtn(w.ex)),
              h('p', { class: 'muted' }, w.exIt)),
            h('button', { class: 'btn primary block', type: 'button', onclick: () => api.next() }, 'Avanti'));
        }
        case 'story':
          return Reader(unit.story, { lesson: true, onDone: () => api.next() });
        case 'note':
          return h('div', { class: 'exercise' },
            h('p', { class: 'kicker' }, 'Nota per chi parla italiano'),
            h('h2', {}, unit.note.title),
            h('p', {}, unit.note.intro),
            h('ul', { class: 'pairs' }, unit.note.pairs.map((p) => h('li', {},
              h('p', { class: 'no', lang: 'en' }, h('span', { class: 'sr-only' }, 'Sbagliato: '), h('span', { 'aria-hidden': 'true' }, '✗ '), p.no),
              h('p', { class: 'yes', lang: 'en' }, h('span', { class: 'sr-only' }, 'Corretto: '), h('span', { 'aria-hidden': 'true' }, '✓ '), p.yes, ' ', speakBtn(p.yes))))),
            h('p', { class: 'tip' }, '💡 ', unit.note.tip),
            h('p', { class: 'small muted' }, 'Negli esercizi che seguono le regole sono mescolate: sbagliare un po\' è normale e aiuta a ricordare meglio.'),
            h('button', { class: 'btn primary block', type: 'button', onclick: () => api.next() }, 'Ho capito, esercitiamoci'));
        case 'word':
          return wordExercise(st.w, st.kind, record(st, api));
        case 'trap': {
          const el = trapExercise(st.t, record(st, api));
          if (st.fromPrev) el.querySelector('.kicker').textContent = `Ripasso da “${st.fromPrev}”`;
          return el;
        }
        case 'build':
          return ExerciseBuild({ it: st.line.it.replace(/["“”]/g, ''), en: st.line.en.replace(/["“”]/g, ''), onDone: record(st, api) });
        case 'listen':
          return listenExercise(unit.story, st.idx, record(st, api));
        case 'speak':
          return ExerciseSpeak({ en: st.p.en, it: st.p.it, onDone: () => api.next() });
        case 'write':
          return ExerciseWrite({ prompt: unit.write.prompt, model: unit.write.model, onDone: () => api.next() });
        case 'end': {
          finishLesson();
          const goalPicker = firstLesson ? h('div', { class: 'card soft' },
            h('h3', {}, 'Quanti giorni a settimana vuoi allenarti?'),
            h('p', { class: 'small muted' }, 'Meglio poco e spesso. Puoi cambiarlo quando vuoi.'),
            h('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Obiettivo settimanale' }, [3, 4, 5, 7].map((n) => {
              const b = h('button', {
                class: 'chip', type: 'button', role: 'radio', 'aria-checked': String(S().settings.weeklyGoal === n),
                onclick: () => { S().settings.weeklyGoal = n; Store.save(); b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b))); },
              }, `${n} giorni`);
              return b;
            }))) : null;
          return h('div', { class: 'exercise end' },
            h('p', { class: 'big-emoji', 'aria-hidden': 'true' }, '🎉'),
            h('h2', {}, 'Lezione completata!'),
            h('p', { class: 'can' }, h('strong', {}, 'Ora: '), unit.can.charAt(0).toLowerCase() + unit.can.slice(1), '.'),
            h('p', { class: 'muted' }, `Le ${unit.words.length} parole nuove sono nel tuo ripasso: Passo te le riproporrà proprio quando stai per dimenticarle.`),
            goalPicker,
            h('a', { class: 'btn primary block', href: '#/oggi' }, 'Torna a Oggi'));
        }
        default:
          return h('p', {}, '…');
      }
    },
  });
}

/* ------------------------------------------------------------------ RIPASSO */
function startReview() {
  const q = dueQueue();
  const ids = [...q.due, ...q.fresh].slice(0, 20).map((c) => c.id).filter(getWord);
  if (!ids.length) {
    mount(h('div', { class: 'page' },
      h('header', { class: 'page-head' }, h('h1', {}, 'Ripasso')),
      h('section', { class: 'card soft' }, h('h2', { class: 'h3' }, 'Niente da ripassare ✓'), h('p', {}, 'Torna più tardi o domani: il ripasso arriva quando serve davvero.')),
      h('a', { class: 'btn primary', href: '#/oggi' }, 'Torna a Oggi')), { tab: 'oggi' });
    return;
  }
  const stats = { done: 0, first: 0 };
  const steps = ids.map((id) => ({ type: 'card', id }));
  steps.push({ type: 'end', tail: true });

  function kindFor(card, w) {
    if (card.state === 'new' || card.s < 4) return card.reps % 2 === 0 ? 'meaning' : 'choose-en';
    if (w.ex && w.ex.toLowerCase().includes(w.en.toLowerCase()) && Math.random() < 0.5) return 'cloze';
    return 'type';
  }

  Flow({
    steps,
    exitText: 'Le parole che hai già ripassato restano salvate.',
    render(st, api) {
      if (st.type === 'end') {
        const pct = stats.done ? Math.round((stats.first / stats.done) * 100) : 0;
        return h('div', { class: 'exercise end' },
          h('p', { class: 'big-emoji', 'aria-hidden': 'true' }, '🧠'),
          h('h2', {}, 'Ripasso fatto'),
          h('p', {}, `Hai ripassato ${stats.done} ${stats.done === 1 ? 'parola' : 'parole'}; ${pct}% ricordate al primo colpo.`),
          h('p', { class: 'muted' }, 'Le parole più difficili torneranno prima, quelle facili più avanti. Non serve fare di più oggi.'),
          h('a', { class: 'btn primary block', href: '#/oggi' }, 'Torna a Oggi'));
      }
      const w = getWord(st.id);
      const card = ensureCard(st.id);
      const kind = st.again ? 'choose-en' : kindFor(card, w);
      return wordExercise(w, kind, (r) => {
        const fast = r.ms && (kind === 'meaning' || kind === 'choose-en' ? r.ms < 2500 : r.ms < 5000);
        const grade = r.correct && r.firstTry ? (fast && card.state !== 'new' ? 4 : 3) : 1;
        gradeCard(st.id, grade);
        logDay('reviews');
        if (!st.again) { stats.done++; if (grade > 1) stats.first++; }
        if (grade === 1 && !st.again) api.insertBeforeTail({ ...st, again: true });
        api.next();
      });
    },
  });
}

/* ------------------------------------------------------------------ PROGRESSI */
function viewProgress() {
  const st = S();
  const cards = Object.values(st.cards);
  const solid = cards.filter((c) => c.state === 'review' && c.s >= 21).length;
  const learning = cards.filter((c) => c.state !== 'new').length;
  const storiesRead = Object.values(st.stories).filter((s) => s.read).length;
  const daysPracticed = Object.keys(st.days).filter((k) => { const d = st.days[k]; return d.reviews + d.lessons + d.reads + (d.speak || 0) > 0; }).length;

  const grid = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const x = st.days[dayKey(d)];
    const n = x ? x.reviews + x.lessons * 10 + x.reads * 3 + (x.speak || 0) : 0;
    const lvl = n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : 3;
    grid.push(h('li', { class: `lvl${lvl}`, title: d.toLocaleDateString('it-IT'), 'aria-label': `${d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}: ${n ? 'attività' : 'nessuna attività'}` }));
  }

  mount(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', {}, 'I tuoi progressi')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Cosa sai fare'),
      h('ul', { class: 'milestones' }, UNITS.map((u) => {
        const done = !!st.lessons[u.id]?.done;
        return h('li', { class: done ? 'done' : '' }, h('span', { 'aria-hidden': 'true' }, done ? '✓' : '○'), h('span', { class: 'sr-only' }, done ? 'Raggiunto: ' : 'Da raggiungere: '), u.can);
      }))),
    h('section', { class: 'stats' },
      stat(learning, 'parole in studio'),
      stat(solid, 'parole solide', 'ricordate per 3+ settimane'),
      stat(storiesRead, 'storie lette'),
      stat(daysPracticed, 'giorni di pratica')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Ultime 4 settimane'),
      h('ol', { class: 'heat', 'aria-label': 'Attività delle ultime 4 settimane' }, grid),
      h('p', { class: 'small muted' }, 'Nessuna striscia da proteggere: conta la regolarità nel tempo, non la perfezione.'))), { tab: 'progressi' });

  function stat(n, label, sub) {
    return h('div', { class: 'stat' }, h('strong', {}, String(n)), h('span', {}, label), sub ? h('span', { class: 'small muted' }, sub) : null);
  }
}

/* ------------------------------------------------------------------ IMPOSTAZIONI */
function viewSettings() {
  const st = S().settings;
  const set = (k, v) => { st[k] = v; Store.save(); applySettings(); viewSettings(); };
  const radio = (label, key, options) => h('fieldset', { class: 'field' },
    h('legend', {}, label),
    h('div', { class: 'chips' }, options.map(([val, txt]) => h('button', {
      class: 'chip', type: 'button', role: 'radio', 'aria-checked': String(st[key] === val), onclick: () => set(key, val),
    }, txt))));

  const voiceSel = Speech.canSpeak && Speech.voices.length ? h('label', { class: 'field' }, 'Voce',
    h('select', { onchange: (e) => { st.voice = e.target.value; Store.save(); Speech.say('Hello! This is my voice.'); } },
      h('option', { value: '' }, 'Automatica (inglese britannico se disponibile)'),
      Speech.voices.map((v) => h('option', { value: v.name, selected: st.voice === v.name }, `${v.name} (${v.lang})`)))) : null;

  mount(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('a', { class: 'icon-btn', href: '#/oggi', 'aria-label': 'Indietro' }, '‹'), h('h1', {}, 'Impostazioni')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Il tuo ritmo'),
      radio('Obiettivo settimanale', 'weeklyGoal', [[3, '3 giorni'], [4, '4 giorni'], [5, '5 giorni'], [7, '7 giorni']]),
      radio('Parole nuove al giorno (massimo)', 'newPerDay', [[5, '5'], [10, '10'], [15, '15'], [20, '20'], [25, '25']]),
      radio('Obiettivo di memoria', 'retention', [[0.85, '85% · leggero'], [0.9, '90% · consigliato'], [0.95, '95% · intenso']]),
      h('p', { class: 'small muted' }, 'Più alto è l\'obiettivo, più ripassi al giorno: passare dal 90% al 97% raddoppia circa il carico.'),
      h('div', { class: 'toggle-row' },
        h('span', {}, h('strong', {}, 'Modalità pausa'), h('span', { class: 'small muted block' }, 'Per vacanze o periodi pieni: nessun obiettivo settimanale.')),
        h('button', { class: 'switch', type: 'button', role: 'switch', 'aria-checked': String(st.paused), 'aria-label': 'Modalità pausa', onclick: () => set('paused', !st.paused) }, h('span')))),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Audio'),
      radio('Velocità della voce', 'rate', [[0.7, 'Lenta'], [0.9, 'Normale'], [1.05, 'Veloce']]),
      voiceSel,
      Speech.canSpeak ? null : h('p', { class: 'small muted' }, 'La sintesi vocale non è disponibile in questo browser.')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Lettura e aspetto'),
      radio('Carattere', 'font', [['lexend', 'Lexend'], ['system', 'Di sistema'], ['mono', 'Monospaziato']]),
      radio('Dimensione del testo', 'textSize', [['s', 'A'], ['m', 'A+'], ['l', 'A++'], ['xl', 'A+++']]),
      radio('Tema', 'theme', [['auto', 'Automatico'], ['light', 'Chiaro'], ['dark', 'Scuro']])),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'I tuoi dati'),
      h('p', { class: 'small muted' }, 'Tutto resta su questo dispositivo. Esporta un backup per spostarlo su un altro telefono.'),
      h('div', { class: 'row gap wrap' },
        h('button', { class: 'btn small', type: 'button', onclick: exportData }, 'Esporta backup'),
        h('label', { class: 'btn small' }, 'Importa backup', h('input', { type: 'file', accept: 'application/json', class: 'sr-only', onchange: importData })),
        h('button', { class: 'btn small danger', type: 'button', onclick: resetData }, 'Azzera tutto'))),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Informazioni'),
      h('a', { class: 'link', href: '#/info' }, 'Come funziona Passo e crediti ›'))), { tab: null });
}

function exportData() {
  const blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `passo-backup-${dayKey()}.json` });
  document.body.append(a); a.click(); a.remove();
}
function importData(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  f.text().then((txt) => {
    const d = JSON.parse(txt);
    if (!d || typeof d !== 'object' || !d.settings || !d.cards) throw new Error('formato');
    Store.data = { ...Store.defaults(), ...d };
    Store.save(); applySettings(); toast('Backup importato ✓'); viewSettings();
  }).catch(() => toast('File non valido'));
}
async function resetData() {
  const ok = await modal({ title: 'Azzerare tutto?', body: 'Cancella progressi, ripassi e impostazioni da questo dispositivo. Non si può annullare.', actions: [{ label: 'Annulla', value: false }, { label: 'Azzera', value: true, kind: 'danger' }] });
  if (!ok) return;
  Store.data = Store.defaults(); Store.save(); applySettings(); location.hash = '#/oggi';
}

function viewInfo() {
  const sources = [...new Map(UNITS.map((u) => [u.source.title + u.source.url, u.source])).values()];
  mount(h('div', { class: 'page prose' },
    h('header', { class: 'page-head' }, h('a', { class: 'icon-btn', href: '#/impostazioni', 'aria-label': 'Indietro' }, '‹'), h('h1', {}, 'Come funziona')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Il metodo'),
      h('ul', {},
        h('li', {}, h('strong', {}, 'Quattro filoni in equilibrio. '), 'Ogni lezione alterna ascolto e lettura, studio delle forme, produzione (parlare e scrivere) e rilettura per la fluidità.'),
        h('li', {}, h('strong', {}, 'Ripasso FSRS. '), 'Un algoritmo stima quando stai per dimenticare una parola e te la ripropone in quel momento. Il voto non lo dai tu: deriva dall\'esercizio.'),
        h('li', {}, h('strong', {}, 'Pensato per italiani. '), 'Note mirate sugli errori tipici: soggetto obbligatorio, falsi amici, preposizioni.'),
        h('li', {}, h('strong', {}, 'Esercizi mescolati. '), 'Alternare regole diverse fa sbagliare un po\' di più oggi, ma ricordare meglio domani.'),
        h('li', {}, h('strong', {}, 'Correzione in due tempi. '), 'Al primo errore un suggerimento, poi la soluzione. Nessuna vita da perdere.'),
        h('li', {}, h('strong', {}, 'Ritmo sostenibile. '), 'Obiettivo settimanale flessibile e modalità pausa, invece di strisce da proteggere.'))),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Crediti e licenze dei contenuti'),
      h('ul', {}, sources.map((s) => h('li', {}, h('strong', {}, s.title), s.author ? ` — ${s.author}` : '', s.license ? ` · ${s.license}` : '', s.url ? [' · ', h('a', { href: s.url, rel: 'noopener', target: '_blank' }, 'fonte')] : ''))),
      h('p', { class: 'small muted' }, 'Progetto non commerciale: gratuito, senza pubblicità. Carattere Lexend (SIL Open Font License).')),
    h('section', { class: 'card' },
      h('h2', { class: 'h3' }, 'Privacy'),
      h('p', {}, 'Passo non ha account né server: i dati restano nel browser di questo dispositivo. Il riconoscimento vocale, se lo usi, è fornito dal browser e può inviare l\'audio al suo servizio.'))), { tab: null });
}

/* ------------------------------------------------------------------ router */
function route() {
  const parts = (location.hash.replace(/^#\/?/, '') || 'oggi').split('/');
  switch (parts[0]) {
    case 'oggi': return viewToday();
    case 'percorso': return viewPath();
    case 'leggi': return parts[1] ? viewStory(parts[1], parts[2]) : viewLibrary();
    case 'progressi': return viewProgress();
    case 'impostazioni': return viewSettings();
    case 'info': return viewInfo();
    case 'lezione': return startLesson(parts[1]);
    case 'ripasso': return startReview();
    default: location.hash = '#/oggi'; return null;
  }
}

Store.load();
applySettings();
Speech.init();
window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
