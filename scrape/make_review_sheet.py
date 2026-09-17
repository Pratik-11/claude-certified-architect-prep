#!/usr/bin/env python3
"""Build REVIEW_SHEET.md — every question in one doc, grouped by domain,
with the answer labelled and a 1-2 line 'remember this' takeaway per question."""
import json, re, os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
BANK = json.load(open(os.path.join(HERE, '..', 'questions.json'), encoding='utf-8'))

DOMAINS = {
    1: "Agent Architecture & Orchestration (27%)",
    2: "Tool Design & MCP Integration (18%)",
    3: "Claude Code Configuration & Workflows (20%)",
    4: "Prompt Engineering & Structured Output (20%)",
    5: "Context Management & Reliability (15%)",
}
LET = "ABCDEFGH"

def sentences(text):
    # split on sentence boundaries, keep it simple and safe
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z`"\'(])', text.strip())
    return [p.strip() for p in parts if p.strip()]

def takeaway(q):
    """1-2 line memorable hook: correct answer gist + the key reason."""
    correct_txt = q['options'][q['correct']].rstrip('.')
    if len(correct_txt) > 100:
        correct_txt = correct_txt[:97].rstrip() + '...'
    sents = sentences(q['explanation'])
    why = sents[0] if sents else q['explanation']
    # add a 2nd sentence if the 1st is short and doesn't already carry the contrast
    if sents and len(why) < 85 and len(sents) > 1:
        why = why + ' ' + sents[1]
    if len(why) > 260:
        why = why[:257].rstrip() + '...'
    return correct_txt, why

def meta_line(q):
    bits = []
    bits.append(f"**D{q['domain']}**" if q.get('domain') else "**scenario-only**")
    if q.get('task'):
        bits.append(f"Task {q['task']}")
    if q.get('scenario'):
        bits.append(q['scenario'])
    bits.append(f"`{q['source']}`")
    bits.append(f"path {q.get('path','?')}")
    bits.append(f"`{q['id']}`")
    return " · ".join(bits)

# ---- group: domains 1-5 first, then scenario-only (no domain) by scenario ----
by_domain = defaultdict(list)
scenario_only = defaultdict(list)
for q in BANK:
    if q.get('domain'):
        by_domain[q['domain']].append(q)
    else:
        scenario_only[q.get('scenario') or 'Uncategorised'].append(q)

def sort_key(q):
    return (q.get('task') or '', q['source'], q['id'])

out = []
W = out.append

W("# Claude Certified Architect — All-Questions Review Sheet\n")
W(f"> Every one of the **{len(BANK)} questions** in `questions.json`, grouped by domain, with the "
  "correct answer marked (✅) and a one-line **Remember** hook distilled from the explanation.\n")
W("> Read top-to-bottom the night before, or jump to a weak domain. For the interactive version "
  "(scoring, result files) use `python3 quiz.py`.\n")
W("**How to read each entry:** the question → options (✅ = correct) → **Remember:** *what it tests → the answer → the thing to notice.*\n")

# table of contents
W("## Contents\n")
for d in sorted(by_domain):
    W(f"- [Domain {d}: {DOMAINS[d]}](#domain-{d}) — {len(by_domain[d])} q")
total_scen = sum(len(v) for v in scenario_only.values())
W(f"- [Scenario-based questions (no fixed domain)](#scenario-based) — {total_scen} q")
W("")

def render(q, n):
    correct_txt, why = takeaway(q)
    W(f"#### {n}. `{q['id']}`")
    W(f"<sub>{meta_line(q)}</sub>\n")
    W(q['stem'] + "\n")
    for i, opt in enumerate(q['options']):
        if i == q['correct']:
            W(f"- **{LET[i]}) {opt}** ✅")
        else:
            W(f"- {LET[i]}) {opt}")
    W("")
    W(f"> **Answer: {LET[q['correct']]}.** 💡 **Remember:** {why}")
    W("\n---\n")

# domains
for d in sorted(by_domain):
    qs = sorted(by_domain[d], key=sort_key)
    W(f"\n<a name=\"domain-{d}\"></a>\n## Domain {d}: {DOMAINS[d]}\n")
    W(f"*{len(qs)} questions*\n")
    for n, q in enumerate(qs, 1):
        render(q, f"D{d}-{n}")

# scenario-only
W("\n<a name=\"scenario-based\"></a>\n## Scenario-based questions (no fixed domain)\n")
W(f"*{total_scen} questions — drill these for scenario judgment; map them to domains using §3–§7 of `STUDY_GUIDE.md`.*\n")
for scen in sorted(scenario_only):
    qs = sorted(scenario_only[scen], key=sort_key)
    W(f"\n### {scen}  ({len(qs)} q)\n")
    for n, q in enumerate(qs, 1):
        render(q, f"S-{n}")

doc = "\n".join(out)
path = os.path.join(HERE, '..', 'REVIEW_SHEET.md')
open(path, 'w', encoding='utf-8').write(doc)
print(f"Wrote {path}")
print(f"  {len(BANK)} questions · {len(doc.splitlines())} lines · {len(doc)} chars")
print(f"  by domain: " + ", ".join(f"D{d}={len(by_domain[d])}" for d in sorted(by_domain)) +
      f", scenario-only={total_scen}")
