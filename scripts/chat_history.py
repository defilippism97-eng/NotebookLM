"""Stampa in JSON la cronologia della chat di un notebook.

`nlm chats ...` e gli strumenti MCP `chat_list` / `chat_get` / `chat_export`
richiedono un profilo salvato su disco e ignorano NOTEBOOKLM_COOKIES, quindi in
questo ambiente falliscono con "Profile 'default' not found". Questo script usa
lo stesso client della CLI, che invece legge i cookie dalla variabile.

Uso:
    uvx --from notebooklm-mcp-cli python scripts/chat_history.py <notebook_id> [max_turni]
"""

import json
import sys

from notebooklm_tools.cli.utils import get_client


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    notebook_id = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 200

    client = get_client()
    conversation_id = client.get_conversation_id(notebook_id)
    turns = (
        client.get_conversation_turns(notebook_id, conversation_id, limit=limit)
        if conversation_id
        else []
    )
    json.dump(
        {"notebook_id": notebook_id, "conversation_id": conversation_id, "turns": turns},
        sys.stdout,
        ensure_ascii=False,
        indent=1,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
