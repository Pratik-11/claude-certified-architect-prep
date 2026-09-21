#!/usr/bin/env python3
"""Parse the Path-2 sources under sources/ into parsed/path2.json.
Sources: OlivierAlter (77), dnacenta (16), SGridworks topic tests (100) + full exam (50).
hamzafarooq is intentionally skipped (bare stems, no options/answers).
"""
import re, json, glob, os

LET = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}

def norm(s):
    s = (s.replace('’', "'").replace('‘', "'")
           .replace('“', '"').replace('”', '"')
           .replace('—', '--').replace('–', '-')
           .replace('→', '->'))
    return re.sub(r'[ \t]+', ' ', s).strip()

results = []

# ---------------------------------------------------------------- OLIVIER (77)
def parse_olivier():
    txt = open('sources/olivier/exam.md', encoding='utf-8').read()
    # map line -> (domain, task) using header positions
    dom_hdr = [(m.start(), int(m.group(1))) for m in re.finditer(r'\n## Domain (\d+):', txt)]
    task_hdr = [(m.start(), m.group(1)) for m in re.finditer(r'\n### Task (\d+\.\d+):', txt)]
    def dom_at(pos):
        d = None
        for p, v in dom_hdr:
            if p < pos: d = v
        return d
    def task_at(pos):
        t = None
        for p, v in task_hdr:
            if p < pos: t = v
        return t
    n = 0
    for m in re.finditer(r'\n\*\*Q(\d+)\.\*\*\s*(.*?)\n\*\*Correct Answer:\s*([A-E])\*\*\s*\n(.*?)(?=\n---|\n\*\*Q\d+\.\*\*|\n## |\Z)', txt, re.S):
        qnum, body, ans, expl = m.groups()
        # split body into stem + options
        opts, stem_lines, in_opts = [], [], False
        for line in body.split('\n'):
            om = re.match(r'^([A-E])\)\s*(.*)', line.strip())
            if om:
                in_opts = True
                opts.append(norm(om.group(2)))
            elif not in_opts:
                stem_lines.append(line)
        stem = norm('\n'.join(stem_lines))
        if len(opts) < 2 or ans not in LET or LET[ans] >= len(opts):
            continue
        pos = m.start()
        results.append({
            'id': f'olivier-{qnum}', 'source': 'olivier', 'path': 2,
            'domain': dom_at(pos), 'task': task_at(pos),
            'scenario': None, 'stem': stem, 'options': opts,
            'correct': LET[ans], 'explanation': norm(expl)})
        n += 1
    return n

def _opts_from_lines(lines, dash=False):
    """Collect consecutive A)/B)/... option lines (optionally '- A)')."""
    pat = re.compile(r'^\s*-\s*([A-E])\)\s*(.*)') if dash else re.compile(r'^\s*([A-E])\)\s*(.*)')
    opts = []
    for ln in lines:
        m = pat.match(ln)
        if m:
            opts.append(norm(m.group(2)))
    return opts

# ---------------------------------------------------------------- DNACENTA (16)
def parse_dnacenta():
    n = 0
    for f in sorted(glob.glob('sources/dnacenta/d*.md')):
        dom = int(re.search(r'd(\d)\.md', f).group(1))
        txt = open(f, encoding='utf-8').read()
        idx = txt.find('Practice Questions')
        if idx == -1:
            continue
        # split the section into per-question blocks
        blocks = re.split(r'\n(?=\*\*Q\d+:\*\*)', txt[idx:])
        for b in blocks:
            if not re.match(r'\*\*Q\d+:\*\*', b):
                continue
            lines = b.split('\n')
            stem = norm(re.sub(r'^\*\*Q\d+:\*\*', '', lines[0]))
            opts = _opts_from_lines(lines, dash=True)
            am = re.search(r'\*\*Answer:\s*([A-E])\*\*\s*(?:—|–|--|-)?\s*(.*)', b)
            if not am or len(opts) < 2:
                continue
            ans = am.group(1)
            if LET.get(ans, 99) >= len(opts):
                continue
            n += 1
            results.append({
                'id': f'dnacenta-d{dom}-{n}', 'source': 'dnacenta', 'path': 2,
                'domain': dom, 'task': None, 'scenario': None,
                'stem': stem, 'options': opts,
                'correct': LET[ans], 'explanation': norm(am.group(2))})
    return n

def _split_answer(block_text):
    """From a <details>...</details> answer body, return (letter, explanation)."""
    inner = re.search(r'<summary>Answer</summary>(.*?)</details>', block_text, re.S)
    body = inner.group(1) if inner else block_text
    lm = re.search(r'\*\*([A-E])\)', body)
    if not lm:
        return None, None
    expl = re.sub(r'^\s*\*\*[A-E]\)\*\*', '', body.strip(), count=1).strip()
    return lm.group(1), norm(expl)

# ----------------------------------------------- SGRID topic tests (100)
def parse_sgrid_topic():
    n = 0
    for f in sorted(glob.glob('sources/sgrid/test-*.md')):
        txt = open(f, encoding='utf-8').read()
        # header is "Task Statement 1.1" or "Task Statements 1.2, 1.3" / "1.4-1.7"
        hdr = re.search(r'Domain (\d+):[^\n]*Task Statements? (\d+\.\d+)([^\n]*)', txt)
        dom = int(hdr.group(1)) if hdr else None
        # a file covering several tasks can't be attributed per question -> task=None
        task = hdr.group(2) if hdr and not hdr.group(3).strip() else None
        for b in re.split(r'\n## Question \d+\s*\n', txt)[1:]:
            head = b.split('<details>')[0]
            hlines = head.split('\n')
            stem = norm(' '.join(l for l in hlines if not re.match(r'^\s*[A-E]\)', l) and l.strip()))
            opts = _opts_from_lines(hlines)
            ans, expl = _split_answer(b)
            if not ans or len(opts) < 2 or LET.get(ans, 99) >= len(opts):
                continue
            n += 1
            results.append({
                'id': f'sgrid-{os.path.basename(f).split(".")[0]}-{n}', 'source': 'sgrid', 'path': 2,
                'domain': dom, 'task': task, 'scenario': None,
                'stem': stem, 'options': opts,
                'correct': LET[ans], 'explanation': expl})
    return n

# ----------------------------------------------- SGRID full exam (50)
def parse_sgrid_full():
    txt = open('sources/sgrid/full-exam-01.md', encoding='utf-8').read()
    scen_hdr = [(m.start(), norm(m.group(1))) for m in re.finditer(r'\n## Scenario [A-Z]:\s*([^\n]*)', txt)]
    def scen_at(pos):
        s = None
        for p, v in scen_hdr:
            if p < pos: s = v
        return s
    n = 0
    for m in re.finditer(r'\n### Q(\d+)\s*\n', txt):
        qnum = m.group(1)
        start = m.end()
        nxt = txt.find('\n### Q', start)
        block = txt[start: nxt if nxt != -1 else len(txt)]
        head = block.split('<details>')[0]
        hlines = head.split('\n')
        stem = norm(' '.join(l for l in hlines if not re.match(r'^\s*[A-E]\)', l) and l.strip()))
        opts = _opts_from_lines(hlines)
        ans, expl = _split_answer(block)
        if not ans or len(opts) < 2 or LET.get(ans, 99) >= len(opts):
            continue
        n += 1
        results.append({
            'id': f'sgrid-fullexam-{qnum}', 'source': 'sgrid', 'path': 2,
            'domain': None, 'task': None, 'scenario': scen_at(m.start()),
            'stem': stem, 'options': opts,
            'correct': LET[ans], 'explanation': expl})
    return n

counts = {
    'olivier': parse_olivier(),
    'dnacenta': parse_dnacenta(),
    'sgrid_topic': parse_sgrid_topic(),
    'sgrid_full': parse_sgrid_full(),
}
json.dump(results, open('parsed/path2.json', 'w'), indent=2)
print('Path-2 parsed counts:', counts, '| total:', len(results))
# integrity
bad = [q['id'] for q in results if not q['explanation'] or not q['stem'] or not (0 <= q['correct'] < len(q['options']))]
print('malformed:', bad[:10], '...' if len(bad) > 10 else '', '| count:', len(bad))
