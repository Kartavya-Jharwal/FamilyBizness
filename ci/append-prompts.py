"""Append project user prompts; never copy credentials or assistant/tool output."""
import hashlib, json, os, pathlib, re, sqlite3
from datetime import datetime, timezone
ROOT = pathlib.Path(__file__).resolve().parent.parent
HOME = pathlib.Path.home()
OUTPUT = ROOT / 'docs/AI_PROMPTS_LOG.md'
def redact(text):
    text = re.sub(r'-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----', '[REDACTED PRIVATE KEY]', text)
    text = re.sub(r'\b(?:AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{30,}|xox[baprs]-[A-Za-z0-9-]{12,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})', '[REDACTED]', text)
    text = re.sub(r'(?i)\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{15,}|github_pat_[A-Za-z0-9_]+|Bearer\s+\S+)', '[REDACTED]', text)
    text = re.sub(r'(?im)((?:[\w-]*(?:api[_ -]?key|token|password|secret)[\w-]*)\s*[=:]\s*)[\"\']?[^\s\"\']{6,}', r'\1[REDACTED]', text)
    return re.sub(r'([a-z]+://)[^\s/:]+:[^\s/@]+@', r'\1[REDACTED]@', text)
def records(path):
    for line in path.read_text(encoding='utf-8', errors='replace').splitlines():
        try: yield json.loads(line)
        except (ValueError, TypeError): continue
def extract(row):
    payload = row.get('payload', row)
    if not isinstance(payload, dict): return None
    if payload.get('type') == 'user_message': return payload.get('message')
    msg = row.get('message', payload)
    if isinstance(msg, dict) and msg.get('role') == 'user':
        content = msg.get('content', '')
        if isinstance(content, str): return content
        return '\n'.join(x.get('text','') for x in content if isinstance(x,dict))
    return None
roots = [ROOT/'.cursor', ROOT/'.claude', HOME/'.codex/sessions', HOME/'.codex/archived_sessions', HOME/'.claude/projects', HOME/'.cursor/projects', HOME/'AppData/Roaming/t3code']
entries=[]; scanned=0
for base in roots:
    if not base.exists(): continue
    for path in base.rglob('*.jsonl'):
        try:
            # Scope transcript to this project before processing user content.
            raw = path.read_text(encoding='utf-8', errors='replace')
            if 'familybizness' not in (str(path)+'\n'+raw).lower(): continue
            scanned += 1
            for index,row in enumerate(records(path)):
                prompt=extract(row)
                if not prompt or prompt.startswith(('<environment_context>', '# AGENTS.md instructions')): continue
                stamp=row.get('timestamp', row.get('ts','unknown'))
                if isinstance(stamp,(int,float)): stamp=datetime.fromtimestamp(stamp, timezone.utc).isoformat()
                source='Codex' if '.codex' in str(path) else 'Claude' if '.claude' in str(path) else 'Cursor' if '.cursor' in str(path) else 'T3'
                digest=hashlib.sha256((str(path)+str(index)+prompt).encode()).hexdigest()
                entries.append((str(stamp),source,digest,redact(prompt)))
        except (OSError,ValueError): continue
for database in ['state.sqlite','statev2.sqlite']:
    path=HOME/'.t3/userdata'/database
    if not path.exists(): continue
    try:
        connection=sqlite3.connect(f'file:{path.as_posix()}?mode=ro',uri=True)
        projects=[x[0] for x in connection.execute("SELECT project_id FROM projection_projects WHERE lower(workspace_root) LIKE '%familybizness%'")]
        if projects:
            marks=','.join('?' for _ in projects)
            threads=[x[0] for x in connection.execute(f'SELECT thread_id FROM projection_threads WHERE project_id IN ({marks})',projects)]
            tables={x[0] for x in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            if 'orchestration_v2_projection_threads' in tables:
                threads += [x[0] for x in connection.execute(f'SELECT thread_id FROM orchestration_v2_projection_threads WHERE project_id IN ({marks})',projects)]
            for thread in set(threads):
                for mid,stamp,prompt in connection.execute("SELECT message_id,created_at,text FROM projection_thread_messages WHERE thread_id=? AND role='user'",(thread,)):
                    digest=hashlib.sha256(('T3:'+mid).encode()).hexdigest(); entries.append((stamp,'T3',digest,redact(prompt)))
                if 'orchestration_v2_projection_messages' in tables:
                    for mid,stamp,payload in connection.execute("SELECT message_id,created_at,payload_json FROM orchestration_v2_projection_messages WHERE thread_id=? AND role='user'",(thread,)):
                        data=json.loads(payload); prompt=data.get('text') or extract({'message':dict(data,role='user')})
                        if prompt:
                            digest=hashlib.sha256(('T3:'+mid).encode()).hexdigest(); entries.append((stamp,'T3',digest,redact(prompt)))
        connection.close()
    except (sqlite3.Error,OSError,ValueError): continue
existing=OUTPUT.read_text(encoding='utf-8') if OUTPUT.exists() else '# AI Prompts Log\n\nProject-scoped user prompts from available local JSONL transcripts. Original chronology is preserved within each import; later discoveries append. Missing or inaccessible transcript formats are not reconstructed. Credentials are redacted.\n'
existing=redact(existing)
new=[]
seen=set(re.findall(r'<!-- prompt:([a-f0-9]+) -->',existing))
for stamp,source,digest,prompt in sorted(entries):
    if digest in seen: continue
    seen.add(digest)
    new.append(f'\n<!-- prompt:{digest} -->\n\n## {stamp} — {source}\n\n{prompt}\n')
OUTPUT.write_text(existing+''.join(new),encoding='utf-8',newline='\n')
print(f'Scanned {scanned} project transcripts; appended {len(new)} prompts.')
