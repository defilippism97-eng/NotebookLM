# NotebookLM

Questo repository collega le sessioni Claude Code a Google NotebookLM tramite
[notebooklm-mcp-cli](https://github.com/jacob-bd/gemini-notebook-mcp-cli).

## Come è collegato

- `.mcp.json` avvia il server MCP `notebooklm` (`uvx --from notebooklm-mcp-cli notebooklm-mcp`).
  Gli strumenti compaiono come `mcp__notebooklm__*` e si caricano solo all'avvio della sessione.
- La stessa libreria fornisce la CLI `nlm` (`nlm notebook list`, `nlm notebook query`, ...),
  utilizzabile da Bash quando gli strumenti MCP non sono caricati.
  Se `nlm` non è nel PATH: `uv tool install notebooklm-mcp-cli`.

## Autenticazione

- L'accesso usa i cookie della sessione Google dell'utente, letti dalla variabile
  d'ambiente `NOTEBOOKLM_COOKIES`, impostata dall'utente nelle impostazioni
  dell'ambiente cloud (mai nel repository, mai in chat).
- Verifica: `nlm notebook list`. Non usare `nlm login --check`: cerca un profilo
  salvato su disco, ignora `NOTEBOOKLM_COOKIES` e risponde sempre
  "Profile not found: default" anche quando l'accesso funziona.
- La variabile è una credenziale statica: non si rinnova da sola. Quando scade
  davvero, `nlm login` e `refresh_auth` non possono ripararla: l'utente deve
  copiare cookie nuovi dal browser, aggiornare la variabile nell'ambiente e
  aprire una nuova sessione. Prima di chiederlo, escludere il problema
  dell'indirizzo descritto qui sotto.

## Cronologia della chat di un notebook

- `nlm chats ...` e gli strumenti MCP `chat_list`, `chat_get`, `chat_export`
  richiedono un profilo salvato su disco e ignorano `NOTEBOOKLM_COOKIES`: qui
  falliscono con "Profile 'default' not found" anche se l'accesso funziona.
- Per leggere gli scambi usare lo script del repository, che stampa JSON
  (domanda e risposta per ogni turno):
  `uvx --from notebooklm-mcp-cli python scripts/chat_history.py <notebook_id> 2>/dev/null`

## Indirizzo: notebook.google.com, non notebooklm.google.com

- Google ha spostato NotebookLM su `https://notebook.google.com`. La libreria
  usa ancora `https://notebooklm.google.com` come predefinito: con i cookie
  dell'utente quell'indirizzo rimanda alla pagina di login e la libreria
  risponde "Authentication expired" **anche se i cookie sono validi**.
- Per questo `NOTEBOOKLM_BASE_URL=https://notebook.google.com` è impostata in
  `.mcp.json` (server MCP) e in `.claude/settings.json` (CLI `nlm` da Bash).
  Non rimuoverla.
- Se compare "Authentication expired", prima di dire all'utente di rifare i
  cookie eseguire:
  `NOTEBOOKLM_BASE_URL=https://notebook.google.com nlm notebook list`.
  Se elenca i notebook, i cookie sono buoni e manca solo la variabile nel
  processo che ha dato l'errore (gli strumenti MCP la leggono solo all'avvio
  della sessione: nel frattempo usare la CLI con il prefisso qui sopra).
- Non scrivere mai cookie o token in file tracciati da git (vedi `.gitignore`).
