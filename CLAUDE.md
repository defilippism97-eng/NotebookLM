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
- Verifica: `nlm login --check`.
- La variabile è una credenziale statica: non si rinnova da sola. Quando scade
  (errori 401/403 o "Authentication expired"), `nlm login` e `refresh_auth` non
  possono ripararla: l'utente deve copiare cookie nuovi dal browser, aggiornare
  la variabile nell'ambiente e aprire una nuova sessione.
- Non scrivere mai cookie o token in file tracciati da git (vedi `.gitignore`).
