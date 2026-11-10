"""Append recoverable planning evidence to the existing prompt log."""
import hashlib, json, pathlib, re, subprocess
from urllib.parse import quote
ROOT = pathlib.Path(__file__).resolve().parent.parent
# Reuse redaction and transcript parsing without running the prompt importer.
helpers = (ROOT / "ci/append-prompts.py").read_text(encoding="utf-8").split("roots =", 1)[0]
exec(helpers)
output = ROOT / "docs/AI_PROMPTS_LOG.md"
existing = output.read_text(encoding="utf-8")
seen = set(re.findall(r"<!-- plan:([a-f0-9]+) -->", existing))
entries = []
def add(stamp, source, body):
    body = redact(body)
    digest = hashlib.sha256((source + body).encode()).hexdigest()
    if digest in seen: return
    seen.add(digest)
    entries.append((str(stamp), f"\n<!-- plan:{digest} -->\n\n## {stamp} — Plan Evidence\n\nSource: {source}\n\n{body}\n"))
for base in [HOME/".codex/sessions", HOME/".codex/archived_sessions", HOME/".claude/projects", HOME/".cursor/projects", ROOT/".cursor", ROOT/".claude"]:
    if not base.exists(): continue
    for path in base.rglob("*.jsonl"):
        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
            if "familybizness" not in (str(path) + raw).lower(): continue
            for index, row in enumerate(records(path)):
                payload = row.get("payload", row.get("message", row))
                if not isinstance(payload, dict): continue
                if payload.get("type") == "custom_tool_call":
                    payload = dict(payload, type="function_call", arguments=payload.get("input", ""))
                stamp = row.get("timestamp", "Unknown date")
                source = f"`{path}` · record {index + 1}"
                if payload.get("type") == "function_call" and payload.get("name", "").split(".")[-1] in ("update_plan", "TodoWrite"):
                    add(stamp, source, "```json\n" + payload.get("arguments", "") + "\n```")
                if payload.get("type") == "function_call" and "update_plan" in payload.get("arguments", "") and payload.get("name", "").split(".")[-1] == "exec":
                    add(stamp, source, "Planning tool invocation (including surrounding orchestration):\n\n```javascript\n" + payload.get("arguments", "") + "\n```")
                if payload.get("type") == "agent_message":
                    message = payload.get("message", "")
                    if "<proposed_plan>" in message or re.search(r"(?im)^#{1,3} .*\bplan\b", message): add(stamp, source, message)
                if payload.get("role") == "assistant":
                    content = payload.get("content", [])
                    if isinstance(content, str): content = [{"text": content}]
                    for block in content:
                        if not isinstance(block, dict): continue
                        if block.get("type") == "tool_use" and block.get("name") in ("TodoWrite", "update_plan"):
                            add(stamp, source, "```json\n" + json.dumps(block.get("input"), indent=2) + "\n```")
                        text = block.get("text", "")
                        if "<proposed_plan>" in text or re.search(r"(?im)^#{1,3} .*\bplan\b", text):
                            add(stamp, source, text)
        except (OSError, ValueError): continue
# Link maintained plans to avoid duplicating their canonical contents.
links = []
for path in sorted((ROOT/"docs").rglob("*.md")):
    if "plan" not in path.name.lower(): continue
    rel = path.relative_to(ROOT).as_posix()
    history = subprocess.run(["git", "log", "--format=%h %aI %s", "--", rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    links.append(f"- [{path.stem}]({quote(path.relative_to(ROOT/'docs').as_posix())})" + ("\n\n  Git history: " + "; ".join(history.splitlines()) if history else "\n\n  No committed history available."))
add("Repository inventory", "Project Markdown plans and Git history", "Current plan contents remain in their existing files. Earlier committed versions can be recovered with `git show <commit>:<path>`.\n\n" + "\n\n".join(links))
if entries:
    intro = "\n\n# Recovered Planning History\n\nPlanning records are imported from available project transcripts; status updates are retained. Sources identify the original file and record. Maintained plan documents are linked, with their Git history, rather than duplicated. This is recoverable evidence, not a claim that missing sessions were reconstructed.\n" if "# Recovered Planning History" not in existing else ""
    output.write_text(existing + intro + "".join(body for _, body in sorted(entries)), encoding="utf-8", newline="\n")
print(f"Added {len(entries)} planning evidence records; indexed {len(links)} plan documents.")
