# Claude Certified Architect — Foundations · Prep Kit

What I used to prep for the **Claude Certified Architect — Foundations** exam: a CLI quiz over 388 practice questions, study notes, and phone flashcards. Pure Python 3, nothing to install for the quiz.

## Layout

```
data/questions.json      388 questions with answers + explanations (the single source of truth)
src/                     tools — quiz.py, make_cards.py, make_pdf.py, make_review_sheet.py
docs/                    study material + technical docs
scrape/                  how the bank is built: raw sources, parsers, merge
```

| Path | What it is |
|---|---|
| `src/quiz.py` | CLI quiz — mock exam (scored /1000, pass at 720), drill by domain / scenario / source, review mode. |
| `data/questions.json` | 388 questions, each with the correct answer + explanation. |
| `docs/KNOWLEDGE.md` | Learning notes for all 30 task statements: key knowledge → ✅ Do / ❌ Don't → ⚠️ traps. |
| `docs/STUDY_GUIDE.md` | Domain-by-domain notes, fact sheet, traps, exam strategy. |
| `docs/REVIEW_SHEET.md` | Every question + answer + a one-line takeaway, grouped by domain. Night-before read. |
| `src/make_cards.py` / `src/make_pdf.py` | Render the questions as phone-friendly PNG flashcards / bundle them into one PDF. |
| `scrape/` | Raw sources (`sources/`), per-source parsers, normalised output (`parsed/`), and the merge script. |

📥 **Flashcards PDF** (388 pages, ~64 MB): [download from Releases](../../releases/latest/download/flashcards.pdf)

## How to use

```bash
git clone https://github.com/Pratik-11/claude-certified-architect-prep.git
cd claude-certified-architect-prep
python3 src/quiz.py                        # interactive menu
```

Or skip the menu:

```bash
python3 src/quiz.py --exam                 # 40-question mock exam
python3 src/quiz.py --exam --no-feedback   # exam-style: answers hidden until the end
python3 src/quiz.py --domain 3 --num 10    # drill one domain
python3 src/quiz.py --path 1               # Path 1 (163 q) · --path 2 (225 q) · --path all
python3 src/quiz.py --review               # read-through with answers
python3 src/quiz.py --help                 # everything else
```

During a quiz: `A`–`D` answer · `s` skip · `e` re-show explanation · `q` quit. Every run writes a markdown report to `results/` with your misses first.

Flashcards (needs `pip install pillow` + DejaVu fonts, standard on Linux):

```bash
python3 src/make_cards.py                  # -> cards/*.png   (--domain N, --path N, --no-explain)
python3 src/make_pdf.py                    # -> flashcards.pdf
```

## Suggested flow

1. Read `docs/KNOWLEDGE.md`, then `docs/STUDY_GUIDE.md`.
2. Quiz on `--path 1`, then `--path 2`.
3. Repeat `--path all --exam` until you clear 720 consistently; re-read misses in `results/`.
4. Drill weak domains with `--domain N`.
5. Night before: skim `docs/REVIEW_SHEET.md`.

## Extend it / contribute

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to add questions from any repo, website, PDF, or your own head (drop one JSON file in `scrape/parsed/`, run one script — no code changes), fix a wrong answer, or pick up a feature idea.
- **[docs/EXPLANATION.md](docs/EXPLANATION.md)** — how everything works: data flow, question schema, every script, invariants, and the commands that verify a change. Written so you can hand it to your AI coding agent and have it extend the kit safely.

## Sources & credit

All questions come from these community repos — full credit to their authors:

- [moisesprat/claude-certified-architect-guide](https://github.com/moisesprat/claude-certified-architect-guide) (75 q, plus the material behind `docs/KNOWLEDGE.md`) and [paullarionov/claude-certified-architect](https://github.com/paullarionov/claude-certified-architect) (88 q) — Path 1
- [OlivierAlter/Claude-Certified-Architect-Foundations-Certification-Exam](https://github.com/OlivierAlter/Claude-Certified-Architect-Foundations-Certification-Exam) (69 q), [SGridworks/claude-certified-architect-training](https://github.com/SGridworks/claude-certified-architect-training) (140 q), [dnacenta/claude-certified-architect](https://github.com/dnacenta/claude-certified-architect) (16 q) — Path 2

18 cross-source duplicates removed. To rebuild the bank from the raw sources:

```bash
cd scrape && node parse_moises.cjs && python3 parse_paul.py && python3 parse_path2.py && python3 merge_bank.py
```

> Unofficial, community-sourced practice material for self-study — not official Anthropic exam content. If you're a source author and want your content removed, open an issue.
