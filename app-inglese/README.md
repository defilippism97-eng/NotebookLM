# Passo · l'inglese, un passo al giorno

App web (PWA) **non commerciale** per imparare l'inglese, pensata per chi parla italiano.
Il progetto si basa sulle ricerche del taccuino NotebookLM *"App per imparare l'inglese"*.
Non ha account né server, funziona offline e si installa sul telefono dal browser
("Aggiungi a schermata Home").

## Avvio

Basta un qualsiasi server statico, ad esempio:

```bash
cd app-inglese
python3 -m http.server 8000
# apri http://localhost:8000
```

Per pubblicarla gratis: GitHub Pages, Netlify o Cloudflare Pages (serve HTTPS per
l'installazione come app e per il microfono).

## Come le ricerche sono diventate funzioni

| Indicazione delle fonti | Nell'app |
|---|---|
| *Four Strands* di Nation (~25% ciascuno) | Ogni lezione: storia (input) → nota e parole (studio delle forme) → parla e scrivi (output) → rilettura veloce (fluidità) |
| Ripetizione spaziata **FSRS** al posto di SM-2, ritenzione 85–90% | `js/fsrs.js`: modello DSR con parametri di default, obiettivo regolabile (85/90/95%) |
| Niente autovalutazione "Hard" (corrompe FSRS) | Il voto deriva da esercizi oggettivi: giusto al primo colpo = Good, rapido = Easy, altrimenti Again |
| Tetto 15–25 parole nuove/giorno, stop se c'è arretrato | Limite configurabile; con più di 40 ripassi arretrati le parole nuove vanno in pausa; coda ordinata per recuperabilità crescente |
| Design contrastivo per italofoni | Una "Nota per chi parla italiano" per unità + esercizi "Trappola" (soggetto obbligatorio, età con *to be*, falsi amici, preposizioni) |
| *Interleaving* e niente penalità sugli errori | Esercizi mescolati, nessuna vita/cuore; gli errori tornano a fine lezione senza penalità |
| Feedback correttivo a due stadi | Primo errore → suggerimento; secondo → soluzione con esempio |
| Glossa al tocco, audio sincronizzato, sottotitoli modulabili | Lettore con tocco sulle parole, "Ascolta tutto" con evidenziazione, traduzione on/off, "Aggiungi al ripasso" |
| ASR: controllo del turno, trascrizione modificabile, bassa ansia | "Tieni premuto e parla" (o tocca per iniziare/finire), trascrizione correggibile, feedback sulla chiarezza, mai bloccante |
| Gamification etica (no streak punitive) | Obiettivo settimanale flessibile, modalità pausa, traguardi "Cosa sai fare" |
| Prima vittoria immediata | Nessuna registrazione: si parte subito dalla prima lezione |
| Tipografia inclusiva, WCAG 2.1/2.2 AA | Lexend, interlinea 1,5, sfondo off-white, niente corsivo, bersagli ≥ 44px, tema scuro, dimensione testo regolabile, rispetto di *reduced motion* |

## Struttura

```
app-inglese/
├── index.html            guscio dell'app
├── styles.css            design system (token chiaro/scuro)
├── js/content.js         unità, storie, note, glossario  ← qui si aggiungono contenuti
├── js/fsrs.js            algoritmo di ripasso
├── js/app.js             navigazione, lezioni, ripasso, lettore, voce, impostazioni
├── sw.js                 funzionamento offline
└── manifest.webmanifest  installazione come app
```

## Aggiungere contenuti

Ogni unità in `js/content.js` ha: `words`, `story`, `note`, `traps`, `speak`, `write`
e un campo `source` per l'attribuzione. I testi attuali sono originali.

Essendo un progetto non commerciale, si possono importare anche risorse con licenza
**CC BY-NC** / **CC BY-NC-SA** (es. *Communication Beginnings*, *Coalescence*, *Synthesis*)
oltre a quelle **CC BY** (*BC Reads*, *StoryWeaver*, *A Digital Workbook for Beginning ESOL*).
Regole dalle fonti del taccuino:

- compilare sempre `source` (titolo, autore, URL, licenza): l'app li mostra nei crediti;
- con materiali **-SA**, rilasciare i contenuti derivati con la stessa licenza;
- escludere foto, poesie, video di terzi ("except where otherwise noted"), contenuti AP/Reuters di VOA
  e i *Readalong* di StoryWeaver (CC BY-NC-ND);
- per BC Reads includere la dicitura "Download this book for free at http://open.bccampus.ca".

Dopo aver aggiunto una storia, aggiornare `GLOSSARY` per le parole nuove e incrementare
`VERSION` in `sw.js`.
