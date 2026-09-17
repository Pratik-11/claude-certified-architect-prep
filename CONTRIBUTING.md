# Contributing

Thanks for helping other people pass this exam. The most valuable contribution is **more good questions**, and adding them needs no code changes — this guide is mostly about that. For how the code fits together, read [EXPLANATION.md](EXPLANATION.md) first (or point your AI agent at it).

## Ground rules

1. **No real exam questions.** The certification exam is confidential. Do not submit anything recalled, copied, or paraphrased from an actual exam sitting ("brain dumps"). Practice questions *written to teach the published exam topics* are what this repo is for. PRs that look like leaked exam content will be closed.
2. **Only share what you're allowed to share.** Your own questions are ideal. For someone else's material, check its license or ask the author, and always credit them (rule 3).
3. **Credit every source** — in each question's `source` field *and* in the "Sources & credit" section of `README.md`, with a link.
4. **Every question needs an explanation.** The "why" is the point of this kit; the merge script rejects questions without one.
5. **`quiz.py` stays dependency-free** (Python 3.8+ standard library only).

## Setup

```bash
git clone https://github.com/Pratik-11/claude-certified-architect-prep.git
cd claude-certified-architect-prep
python3 quiz.py --num 3        # that's it — nothing to install
```

Optional: `pip install pillow` for the flashcard scripts; Node.js only if you re-run `scrape/parse_moises.cjs`.

---

## Adding questions

However the questions reach you — a GitHub repo, a blog post, a course PDF, a YouTube transcript, your own head — the pipeline only cares that they end up in **one file: `scrape/<name>_parsed.json`**. `merge_bank.py` picks up every file matching that pattern automatically, validates it, tags it as Path 2, drops anything that duplicates an existing question, and rebuilds `questions.json`.

Pick a short lowercase `<name>` for your source (`acmeblog`, `janedoe`, …). It is used in the filename, in every question's `source` field, and as the id prefix.

### The format

`scrape/<name>_parsed.json` is a JSON array of objects like this:

```json
[
  {
    "id": "janedoe-1",
    "source": "janedoe",
    "domain": 1,
    "task": "1.1",
    "scenario": null,
    "stem": "Your agent loop calls the Messages API and gets a response back. Which signal should the loop use to decide whether to run tools and continue, or to stop?",
    "options": [
      "Whether the response text contains a phrase such as 'task complete'",
      "The `stop_reason` field — continue on `tool_use`, finish on `end_turn`",
      "Whether the response is shorter than the previous one",
      "A fixed limit of five iterations"
    ],
    "correct": 1,
    "explanation": "`stop_reason` is the API's structured signal for why generation stopped. Parsing natural-language text is brittle, response length means nothing, and an iteration cap is a safety net rather than the primary control."
  }
]
```

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Unique across the whole bank. Use `<name>-<number>`. Never renumber ids after they're merged. |
| `source` | ✅ | Your `<name>`. |
| `stem` | ✅ | The question. Plain text; `` `backticks` `` for code; `\n` for line breaks. |
| `options` | ✅ | 2–8 strings, **without** `A)` / `B)` prefixes. Four is the exam norm. |
| `correct` | ✅ | **0-based index** of the right option (`0` = A, `1` = B, …). |
| `explanation` | ✅ | Why the answer is right, ideally why the distractors are wrong. |
| `domain` | optional | `1`–`5`, or `null`/omitted if unknown. Please fill it in — untagged questions are invisible to `--domain N` drills. Domains are listed in [EXPLANATION.md §4](EXPLANATION.md#4-the-question-schema). |
| `task` | optional | Task statement as a **string**: `"1.1"` … `"5.6"`. |
| `scenario` | optional | Scenario name, e.g. `"Customer Support Resolution Agent"`. Reuse an existing name where one fits: `python3 -c "import json;print(*sorted({q['scenario'] for q in json.load(open('questions.json')) if q['scenario']}),sep='\n')"` |

Do **not** set `path` — the merge script does.

### Route A — write the JSON by hand (no code)

Best for: your own questions, a handful from a web page, anything under ~30 questions.

1. Create `scrape/<name>_parsed.json` in the format above.
2. Go to [Build, check, submit](#build-check-submit).

### Route B — write a parser (for a big, consistently formatted source)

Best for: a repo or site with dozens of questions in a regular markdown/HTML/JSON layout.

1. **Save the raw source into the repo** so the build is reproducible:
   ```bash
   mkdir scrape/src_<name>
   curl -sL "https://raw.githubusercontent.com/<owner>/<repo>/main/questions.md" -o scrape/src_<name>/questions.md
   # web page:  curl -sL "https://example.com/quiz" -o scrape/src_<name>/quiz.html
   # PDF:       pdftotext -layout course.pdf scrape/src_<name>/course.txt
   ```
2. **Write `scrape/parse_<name>.py`** that reads those files and writes `<name>_parsed.json`. Skeleton (adjust the regexes to your format — `parse_paul.py` and `parse_path2.py` have four worked examples):
   ```python
   #!/usr/bin/env python3
   """Parse <name> (<url>) into <name>_parsed.json. Run from scrape/."""
   import json, re

   LET = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
   txt = open('src_<name>/questions.md', encoding='utf-8').read()

   out = []
   for block in re.split(r'\n## Question \d+\s*\n', txt)[1:]:
       opts = re.findall(r'^[A-E]\)\s*(.+)$', block, re.M)
       ans = re.search(r'\*\*Answer:\s*([A-E])\*\*\s*(.*)', block, re.S)
       stem = block.split('\nA)')[0].strip()
       if len(opts) < 2 or not ans or LET[ans.group(1)] >= len(opts):
           continue                                  # skip what you can't fully parse
       out.append({
           'id': f'<name>-{len(out) + 1}', 'source': '<name>',
           'domain': None, 'task': None, 'scenario': None,
           'stem': stem, 'options': [o.strip() for o in opts],
           'correct': LET[ans.group(1)], 'explanation': ans.group(2).strip(),
       })

   json.dump(out, open('<name>_parsed.json', 'w'), indent=2)
   print('<name> parsed:', len(out))                 # compare with the count you expect!
   ```
3. Run it: `cd scrape && python3 parse_<name>.py`. **Check the printed count against the number of questions in the source** — parsers skip silently, so a low count means a regex is missing a variant.
4. Commit the raw files, the parser, *and* the `_parsed.json`.

### Route C — let an AI agent do it

Give your coding agent (Claude Code, Cursor, Codex, …) this prompt from the repo root:

> Read EXPLANATION.md and CONTRIBUTING.md. Add the practice questions from `<URL or file>` as a new source named `<name>`. Follow Route B if the format is regular, otherwise Route A. Tag `domain` (and `task` where clear) for every question using the domain list in EXPLANATION.md §4. Then run the full "Build, check, submit" section, show me the merge output including any `~=` duplicate lines, and spot-check five random questions against the original source. Do not edit `questions.json` by hand and do not change any existing question id.

Then **review what it produced** — especially `correct` indexes (off-by-one between A–D and 0–3 is the classic mistake) and any explanations the agent wrote itself. If questions or explanations are AI-generated rather than taken from a source, say so in the PR and verify each one against the [Claude docs](https://docs.claude.com); a confident wrong answer in a study kit is worse than no question.

### Build, check, submit

```bash
cd scrape
python3 merge_bank.py              # validate + dedupe + rebuild ../questions.json
cd ..
python3 scrape/make_review_sheet.py        # regenerate REVIEW_SHEET.md
python3 quiz.py --source <name> --review   # read your questions as users will see them
```

Reading the `merge_bank.py` output:

- `+ <name>_parsed.json: N questions` — your file was found.
- `INVALID <id>: <reason>` / `DUPLICATE ids` + `questions.json NOT written` — fix and re-run; nothing was changed.
- `<your-id>  ~=  <existing-id>` — your question was judged a duplicate of an existing one and **dropped**. Expected when sources copy from each other. If it is a false positive (genuinely different question), reword the stem slightly or mention it in the PR.
- `by source: {... '<name>': K}` — `K` is how many of yours made it in.

Then:

1. Add your source to **"Sources & credit"** in `README.md` (link + question count) and update the totals there.
2. Run the checks in [EXPLANATION.md §10](EXPLANATION.md#10-verifying-a-change).
3. Commit `scrape/<name>_parsed.json` (+ `scrape/src_<name>/` and the parser for Route B), `questions.json`, `REVIEW_SHEET.md`, `README.md`. Do **not** commit `cards/`, `results/`, or `flashcards.pdf`.
4. Open a PR saying where the questions came from, their license/permission status, and how many were added vs. dropped as duplicates.

### What makes a good question

- Tests a **decision an architect actually makes** ("which approach…", "what is the root cause…"), not trivia or exact flag spelling.
- One unambiguously best answer; distractors that are *plausible* — typical real-world mistakes — not jokes.
- Self-contained stem (scenario + constraint + ask). Exam-style stems are 2–5 sentences.
- Explanation names the principle, not just "B is correct".
- Accurate for current Claude / Claude Code / MCP behaviour, ideally checkable in the official docs.

---

## Fixing a wrong answer or explanation

Found a question whose marked answer or explanation is wrong? Open an issue with the question `id`, or fix it:

- **Contributed source (Route A file):** edit `scrape/<name>_parsed.json` directly.
- **Parsed source:** `*_parsed.json` would be overwritten by the next parser run, so edit our committed copy of the raw file under `scrape/` (`src_*/…`, `paul_guide.md`, `moises_questions.js`), re-run that parser, and say in the PR what you changed and why (with a docs link). Consider reporting it upstream too.

Then run [Build, check, submit](#build-check-submit). Never patch `questions.json` itself — it's regenerated.

## Code contributions

Bug fixes and features are welcome. Keep the spirit of the repo: small, readable, no dependencies, no frameworks.

- One file per tool; plain functions; match the surrounding style.
- `quiz.py`: standard library only, must keep working without a TTY (`--no-color`, piped stdin).
- New quiz options need both a CLI flag (`main()`) and, where it makes sense, a menu entry (`menu()`), plus a line in `README.md`.
- Anything that changes the question schema must update all three consumers (`quiz.py`, `make_cards.py`, `scrape/make_review_sheet.py`), the validator in `merge_bank.py`, and EXPLANATION.md §4.
- Before opening a PR, run the commands in [EXPLANATION.md §10](EXPLANATION.md#10-verifying-a-change) and check `git diff --stat` contains only what you meant to change.

### Ideas looking for an owner

- **Label the 128 untagged questions** (paullarionov + SGridworks full mock) with `domain`/`task`, so they join `--domain N` drills.
- **"Retry my misses" mode** — re-quiz the ❌ ids from the latest file in `results/`.
- **Weak-spot stats** — aggregate all of `results/` into per-domain / per-task accuracy over time.
- **Domain-weighted mock exam** — sample 40 questions in the official 27/18/20/20/15 proportions instead of uniformly.
- **Timer** for mock exams.
- **Anki / CSV export** from `questions.json`.
- **Cross-platform fonts** in `make_cards.py` (currently a hard-coded Linux path); lower-memory `make_pdf.py`.
- **A tiny static web UI** that reads `questions.json` (GitHub Pages friendly).
- **Freshness review** — check explanations against current Claude docs and fix drift.

## Commits and PRs

- One logical change per PR; describe *what* and *why* in plain words.
- Data PRs: include the merge summary (added / dropped as duplicates) in the description.
- By contributing you agree your contribution can be distributed with this repo, and you confirm you have the right to contribute it.

## Source authors

If your material is included here and you'd like it credited differently or removed, open an issue — it will be handled promptly.
