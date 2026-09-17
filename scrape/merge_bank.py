#!/usr/bin/env python3
"""Merge Path-1 (moisesprat + paullarionov) and Path-2 (olivier + dnacenta + sgrid)
into ../questions.json, tagging each question with `path` (1 or 2) and removing
Path-2 questions that duplicate anything already kept (fuzzy match).

Any other scrape/*_parsed.json is picked up automatically as Path 2 — that is how
new sources are added (see ../CONTRIBUTING.md)."""
import glob, json, re
from difflib import SequenceMatcher
from collections import Counter

p1 = json.load(open('moises_parsed.json')) + json.load(open('paul_parsed.json'))
for q in p1:
    q['path'] = 1
p2 = json.load(open('path2_parsed.json'))   # already path=2
CORE = {'moises_parsed.json', 'paul_parsed.json', 'path2_parsed.json'}
for f in sorted(set(glob.glob('*_parsed.json')) - CORE):   # contributed sources
    extra = json.load(open(f))
    for q in extra:
        q['path'] = 2
        for k in ('domain', 'task', 'scenario'):
            q.setdefault(k, None)
    print(f'+ {f}: {len(extra)} questions')
    p2 += extra

def sig(q):
    s = (q['stem'] + ' ' + ' '.join(q['options'])).lower()
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def toks(s):
    return set(s.split())

def rsym(a, b):
    # SequenceMatcher.ratio() is order-sensitive (autojunk); make it symmetric & stable
    return max(SequenceMatcher(None, a, b, autojunk=False).ratio(),
               SequenceMatcher(None, b, a, autojunk=False).ratio())

def is_dup(a, b):
    ta, tb = toks(a), toks(b)
    if not ta or not tb:
        return False
    j = len(ta & tb) / len(ta | tb)
    if j < 0.5:                      # word-overlap gate (cheap pre-filter)
        return False
    return rsym(a, b) >= 0.62        # calibrated: verified genuine dupes sit at 0.62+

def problem(q):
    """Why a question is unusable, or None. Runs before anything is written."""
    miss = [k for k in ('id', 'source', 'stem', 'options', 'correct', 'explanation')
            if q.get(k) in (None, '', [])]
    if miss:
        return 'missing ' + ', '.join(miss)
    if not isinstance(q['options'], list) or not 2 <= len(q['options']) <= 8:
        return 'options must be a list of 2-8 strings'
    if not isinstance(q['correct'], int) or not 0 <= q['correct'] < len(q['options']):
        return 'correct must be the 0-based index of the right option'

bad = [(q.get('id'), problem(q)) for q in p1 + p2 if problem(q)]
dup_ids = [i for i, c in Counter(q.get('id') for q in p1 + p2).items() if c > 1]
if bad or dup_ids:
    for i, why in bad:
        print(f'  INVALID {i}: {why}')
    if dup_ids:
        print('  DUPLICATE ids:', dup_ids)
    raise SystemExit('questions.json NOT written — fix the entries above and re-run')

kept, kept_sigs, removed = [], [], []
for q in p1 + p2:                       # path1 first → authoritative, never dropped
    s = sig(q)
    dup_of = next((kq['id'] for ks, kq in kept_sigs if is_dup(s, ks)), None)
    if dup_of and q['path'] == 2:
        removed.append((q['id'], dup_of))
        continue
    kept.append(q)
    kept_sigs.append((s, q))

json.dump(kept, open('../questions.json', 'w'), indent=2)
print('FINAL bank:', len(kept))
print(' by path  :', dict(Counter(q['path'] for q in kept)))
print(' by source:', dict(Counter(q['source'] for q in kept)))
print(' path2 dupes removed:', len(removed))
for rid, against in removed:
    print(f'    {rid}  ~=  {against}')
