import re, json

text = open('sources/paul/guide_en.md', encoding='utf-8').read()
# Only the question sections (from "Examples of Exam Questions" onward)
start = text.index('# Examples of Exam Questions')
qtext = text[start:]

# Normalize smart quotes
def norm(s):
    return (s.replace('’',"'").replace('‘',"'")
             .replace('“','"').replace('”','"')
             .replace('—','--').replace('–','-').strip())

# Track which section we are in for unique ids
blocks = re.split(r'\n## Question ', qtext)
header_section = []
results = []
# Determine section boundaries by scanning for "# Practice Test"
practice_pos = qtext.find('# Practice Test')

seen = 0
# Re-split keeping positions
for m in re.finditer(r'\n## Question (\d+) \(Scenario: ([^)]+)\)\n(.*?)(?=\n## Question |\n# Practice Test|\n## Scenario:|\Z)', qtext, re.S):
    num = m.group(1)
    scenario = norm(m.group(2))
    body = m.group(3)
    pos = m.start()
    section = 'practice' if pos > practice_pos else 'examples'

    # Situation
    sit_m = re.search(r'\*\*Situation:\*\*(.*?)(?=\n\n)', body, re.S)
    situation = norm(sit_m.group(1)) if sit_m else ''
    # Question prompt: a bold line that ends with ? (the **Which...?**)
    prompt_m = re.search(r'\n\*\*([^*].*?\?)\*\*\n', body)
    prompt = norm(prompt_m.group(1)) if prompt_m else ''

    # Options
    opts = []
    correct = None
    for om in re.finditer(r'^- ([A-D])\)\s*(.*?)\s*$', body, re.M):
        letter, otext = om.group(1), om.group(2)
        is_correct = '[CORRECT]' in otext
        otext = norm(re.sub(r'\*\*\[CORRECT\]\*\*|\[CORRECT\]', '', otext))
        if is_correct:
            correct = len(opts)
        opts.append(otext)

    # Explanation (Why X:)
    why_m = re.search(r'\*\*Why[^:]*:\*\*(.*?)(?=\n---|\n## |\Z)', body, re.S)
    explanation = norm(why_m.group(1)) if why_m else ''

    full_stem = (situation + ('\n\n' + prompt if prompt else '')).strip()
    if not opts or correct is None or not full_stem:
        # skip malformed
        continue

    results.append({
        'id': f'paul-{section}-{num}',
        'source': 'paullarionov',
        'domain': None,
        'task': None,
        'scenario': scenario,
        'stem': full_stem,
        'options': opts,
        'correct': correct,
        'explanation': explanation
    })

json.dump(results, open('parsed/paul.json','w'), indent=2)
print('paul parsed:', len(results))
from collections import Counter
print('by section:', Counter(r['id'].split('-')[1] for r in results))
print('missing explanation:', sum(1 for r in results if not r['explanation']))
print('sample:', json.dumps(results[0], indent=2)[:400])
