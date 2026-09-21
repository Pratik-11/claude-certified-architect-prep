#!/usr/bin/env python3
"""
Claude Certified Architect — Foundations  |  CLI Practice Quiz
=============================================================

A dependency-free terminal quiz over the practice questions in data/questions.json
(collected from community study repos — see README.md). Every question shows
the correct answer AND the explanation ("why") after you answer.

Usage:
    python3 src/quiz.py                 # interactive menu
    python3 src/quiz.py --exam          # 40-question timed-style mock exam
    python3 src/quiz.py --domain 1      # only Domain 1 questions
    python3 src/quiz.py --num 20        # 20 random questions
    python3 src/quiz.py --source moisesprat
    python3 src/quiz.py --review        # read-only: show every Q with answer+why
    python3 src/quiz.py --no-color

Controls during a quiz:
    A / B / C / D   answer
    s               skip (counts as unanswered)
    e               re-show explanation of last question
    q               quit to summary
"""

import argparse
import datetime
import json
import os
import random
import re
import shutil
import sys
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # repo root
BANK_PATH = os.path.join(ROOT, "data", "questions.json")
RESULTS_DIR = os.path.join(ROOT, "results")

DOMAINS = {
    1: "Agent Architecture and Orchestration (27%)",
    2: "Tool Design and MCP Integration (18%)",
    3: "Claude Code Configuration and Workflows (20%)",
    4: "Prompt Engineering and Structured Output (20%)",
    5: "Context Management and Reliability (15%)",
}

# Question paths — each question carries its own `path` field (set by
# scrape/merge_bank.py): 1 = the original two sources, 2 = everything added since.
PATHS = {1: "Path 1 — original", 2: "Path 2 — extended"}

PASS_SCORE = 720           # official passing score on the 100-1000 scale
EXAM_LEN = 40              # questions in a mock exam

# ----------------------------------------------------------------------------
# Colors
# ----------------------------------------------------------------------------
class C:
    enabled = sys.stdout.isatty()

    @classmethod
    def wrap(cls, code, s):
        if not cls.enabled:
            return s
        return f"\033[{code}m{s}\033[0m"

    @classmethod
    def bold(cls, s):   return cls.wrap("1", s)
    @classmethod
    def dim(cls, s):    return cls.wrap("2", s)
    @classmethod
    def green(cls, s):  return cls.wrap("32", s)
    @classmethod
    def red(cls, s):    return cls.wrap("31", s)
    @classmethod
    def yellow(cls, s): return cls.wrap("33", s)
    @classmethod
    def cyan(cls, s):   return cls.wrap("36", s)
    @classmethod
    def blue(cls, s):   return cls.wrap("34", s)


def width():
    return min(shutil.get_terminal_size((90, 25)).columns, 100)


def wrap(text, indent=0, first_indent=None):
    w = width()
    pre = " " * indent
    first = " " * (first_indent if first_indent is not None else indent)
    out = []
    for i, para in enumerate(text.split("\n")):
        if not para.strip():
            out.append("")
            continue
        lines = textwrap.wrap(para, width=w, initial_indent=(first if not out else pre),
                              subsequent_indent=pre)
        out.extend(lines)
    return "\n".join(out)


def rule(char="─"):
    return C.dim(char * width())


def clear():
    if C.enabled:
        os.system("cls" if os.name == "nt" else "clear")


# ----------------------------------------------------------------------------
# Data
# ----------------------------------------------------------------------------
def load_bank():
    if not os.path.exists(BANK_PATH):
        sys.exit(f"Question bank not found at {BANK_PATH}")
    with open(BANK_PATH, encoding="utf-8") as f:
        bank = json.load(f)
    return bank


def domain_label(d):
    return DOMAINS.get(d, "Mixed / scenario-based (no fixed domain)")


def letter(i):
    return "ABCDEFGH"[i]


# ----------------------------------------------------------------------------
# Quiz engine
# ----------------------------------------------------------------------------
def ask_question(q, idx, total):
    print(rule())
    tag = f"Q{idx}/{total}"
    meta = []
    if q.get("domain"):
        meta.append(f"Domain {q['domain']}")
    if q.get("scenario"):
        meta.append(q["scenario"])
    meta.append(q["source"])
    print(C.cyan(C.bold(tag)) + "   " + C.dim(" · ".join(meta)))
    print()
    print(wrap(q["stem"]))
    print()
    for i, opt in enumerate(q["options"]):
        print(wrap(f"{C.bold(letter(i))}) {opt}", indent=3, first_indent=2))
    print()

    valid = {letter(i).lower() for i in range(len(q["options"]))}
    while True:
        try:
            choice = input(C.yellow("Your answer (A-%s / s=skip / q=quit): " % letter(len(q["options"]) - 1))).strip().lower()
        except (EOFError, KeyboardInterrupt):
            return "quit"
        if choice == "q":
            return "quit"
        if choice == "s":
            return None
        if choice in valid:
            return "ABCDEFGH".index(choice.upper())
        print(C.dim("  (enter a valid letter, 's' to skip, or 'q' to quit)"))


def show_feedback(q, chosen):
    correct = q["correct"]
    print()
    if chosen is None:
        print(C.yellow("⤼ Skipped."))
    elif chosen == correct:
        print(C.green("✓ Correct!"))
    else:
        print(C.red(f"✗ Incorrect — you chose {letter(chosen)}."))
    print(C.green(f"  Correct answer: {letter(correct)}) {q['options'][correct]}"))
    print()
    print(C.bold("  Why:"))
    print(wrap(q["explanation"], indent=2))
    print()


def run_quiz(questions, mode_name, exam=False, feedback=True):
    clear()
    total = len(questions)
    print(C.bold(C.blue(f"\n  {mode_name}")))
    if feedback:
        print(C.dim(f"  {total} questions · answer + explanation shown after each\n"))
    else:
        print(C.dim(f"  {total} questions · answers HIDDEN — score at the end, "
                    f"full answers in the results file\n"))
    if exam:
        print(C.dim(f"  Mock exam: passing is {PASS_SCORE}/1000 (~{round(PASS_SCORE/10*100/100)}%+ correct).\n"))

    results = []      # list of (q, chosen)
    last_q = None
    for i, q in enumerate(questions, 1):
        chosen = ask_question(q, i, total)
        if chosen == "quit":
            break
        results.append((q, chosen))
        if feedback:
            show_feedback(q, chosen)
        last_q = q
        if i < total:
            prompt = ("  [Enter] next · 'e' re-show why · 'q' quit: " if feedback
                      else "  [Enter] next · 'q' quit: ")
            try:
                nxt = input(C.dim(prompt)).strip().lower()
            except (EOFError, KeyboardInterrupt):
                break
            if nxt == "q":
                break
            if feedback and nxt == "e" and last_q:
                show_feedback(last_q, chosen)
                input(C.dim("  [Enter] next: "))
        clear()

    summary(results, exam=exam)
    path = write_result_md(results, mode_name, exam=exam)
    if path:
        print(C.cyan(f"  📄 Results saved: {os.path.relpath(path, ROOT)}\n"))


def _md_question(f, q, chosen):
    """Write one question block to the results markdown file."""
    correct = q["correct"]
    f.write(f"### {q['id']}\n\n")
    bits = []
    bits.append(f"Domain {q['domain']}" if q.get("domain") else "Domain —")
    if q.get("task"):
        bits.append(f"Task {q['task']}")
    if q.get("scenario"):
        bits.append(q["scenario"])
    bits.append(f"source: {q['source']}")
    bits.append(f"path {q.get('path', '?')}")
    f.write("*" + " · ".join(bits) + "*\n\n")
    f.write(f"**Q:** {q['stem']}\n\n")
    for i, opt in enumerate(q["options"]):
        marks = []
        if i == correct:
            marks.append("✅ correct")
        if chosen is not None and i == chosen and chosen != correct:
            marks.append("❌ your answer")
        elif chosen is not None and i == chosen and chosen == correct:
            marks.append("🟢 your answer")
        tag = f"  ← {', '.join(marks)}" if marks else ""
        f.write(f"- **{letter(i)})** {opt}{tag}\n")
    if chosen is None:
        f.write("\n> ⤼ *Skipped (not answered).*\n")
    f.write(f"\n**Why:** {q['explanation']}\n\n---\n\n")


def write_result_md(results, mode_name, exam=False):
    """Write a per-run results file: incorrect first, then correct, then skipped."""
    if not results:
        return None
    os.makedirs(RESULTS_DIR, exist_ok=True)
    now = datetime.datetime.now()
    slug = re.sub(r"[^a-z0-9]+", "-", mode_name.lower()).strip("-") or "quiz"
    fname = f"result_{now:%Y%m%d_%H%M%S}_{slug}.md"
    path = os.path.join(RESULTS_DIR, fname)

    answered = [(q, c) for q, c in results if c is not None]
    correct = [(q, c) for q, c in answered if c == q["correct"]]
    incorrect = [(q, c) for q, c in answered if c != q["correct"]]
    skipped = [(q, c) for q, c in results if c is None]
    n_total = len(results)
    n_correct = len(correct)
    pct = 100 * n_correct / n_total if n_total else 0
    scaled = round(100 + 900 * (n_correct / n_total)) if n_total else 0

    # per-domain tally
    by_dom = {}
    for q, c in results:
        d = q.get("domain") or "—"
        agg = by_dom.setdefault(d, [0, 0])
        agg[1] += 1
        if c is not None and c == q["correct"]:
            agg[0] += 1

    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# Quiz Result — {mode_name}\n\n")
        f.write(f"*{now:%Y-%m-%d %H:%M:%S}*\n\n")
        f.write("## Summary\n\n")
        f.write(f"- **Mode:** {mode_name}\n")
        f.write(f"- **Score:** {n_correct}/{n_total} correct ({pct:.0f}%)\n")
        if exam:
            verdict = "✅ PASS" if scaled >= PASS_SCORE else "❌ FAIL"
            f.write(f"- **Scaled score:** {scaled}/1000 (pass = {PASS_SCORE}) — **{verdict}**\n")
        f.write(f"- **Answered:** {len(answered)} · **Incorrect:** {len(incorrect)} · "
                f"**Skipped:** {len(skipped)}\n\n")
        f.write("### By domain\n\n")
        f.write("| Domain | Correct | Total | % |\n|---|---|---|---|\n")
        for d in sorted(by_dom, key=lambda x: (x == "—", x)):
            got, tot = by_dom[d]
            name = domain_label(d) if isinstance(d, int) else "Scenario-based (no fixed domain)"
            f.write(f"| {('D'+str(d)) if isinstance(d,int) else '—'} {name} | {got} | {tot} | "
                    f"{(100*got/tot if tot else 0):.0f}% |\n")
        f.write("\n---\n\n")

        f.write(f"## ❌ Incorrect ({len(incorrect)})\n\n")
        if not incorrect:
            f.write("*None — nice.*\n\n---\n\n")
        for q, c in incorrect:
            _md_question(f, q, c)

        f.write(f"## ✅ Correct ({len(correct)})\n\n")
        if not correct:
            f.write("*None.*\n\n---\n\n")
        for q, c in correct:
            _md_question(f, q, c)

        if skipped:
            f.write(f"## ⤼ Skipped ({len(skipped)})\n\n")
            for q, c in skipped:
                _md_question(f, q, c)
    return path


def summary(results, exam=False):
    print(rule("═"))
    print(C.bold("  RESULTS"))
    print(rule("═"))
    answered = [(q, c) for q, c in results if c is not None]
    correct = [(q, c) for q, c in answered if c == q["correct"]]
    skipped = [(q, c) for q, c in results if c is None]
    n_total = len(results)
    n_ans = len(answered)
    n_correct = len(correct)

    if n_total == 0:
        print(C.dim("  No questions answered."))
        return

    pct = 100 * n_correct / n_total
    scaled = round(100 + 900 * (n_correct / n_total))
    print(f"  Answered : {n_ans}/{n_total}   Skipped: {len(skipped)}")
    print(f"  Correct  : {C.bold(str(n_correct))}/{n_total}  ({pct:.0f}%)")
    if exam:
        verdict = C.green("PASS ✓") if scaled >= PASS_SCORE else C.red("FAIL ✗")
        print(f"  Scaled   : {C.bold(str(scaled))}/1000   (pass = {PASS_SCORE})   {verdict}")

    # per-domain breakdown
    by_dom = {}
    for q, c in results:
        d = q.get("domain") or "—"
        agg = by_dom.setdefault(d, [0, 0])
        agg[1] += 1
        if c is not None and c == q["correct"]:
            agg[0] += 1
    print()
    print(C.bold("  By domain:"))
    for d in sorted(by_dom, key=lambda x: (x == "—", x)):
        got, tot = by_dom[d]
        name = domain_label(d) if isinstance(d, int) else "Scenario-based (unlabeled domain)"
        bar_pct = 100 * got / tot if tot else 0
        print(f"    D{d if isinstance(d,int) else '?'}  {got:>2}/{tot:<2} ({bar_pct:3.0f}%)  {C.dim(name)}")

    # missed questions
    missed = [(q, c) for q, c in answered if c != q["correct"]]
    if missed:
        print()
        print(C.bold(C.red(f"  Missed {len(missed)} — review these IDs:")))
        for q, c in missed:
            print(f"    {C.red('✗')} {q['id']}  {C.dim('(you: '+letter(c)+'  correct: '+letter(q['correct'])+')')}")
        try:
            r = input(C.yellow("\n  Re-read explanations for missed questions? [y/N]: ")).strip().lower()
        except (EOFError, KeyboardInterrupt):
            r = "n"
        if r == "y":
            for q, c in missed:
                print(rule())
                print(C.cyan(q["id"]))
                print(wrap(q["stem"]))
                show_feedback(q, c)
                input(C.dim("  [Enter] next: "))
    else:
        print()
        print(C.green("  Clean sweep — no wrong answers. 🎯"))
    print()


def review_mode(questions):
    """Read-only flashcard-style walk-through."""
    clear()
    total = len(questions)
    print(C.bold(C.blue(f"\n  REVIEW MODE — {total} questions (answers shown)\n")))
    for i, q in enumerate(questions, 1):
        print(rule())
        meta = []
        if q.get("domain"):
            meta.append(f"Domain {q['domain']}")
        meta += [q.get("scenario", ""), q["source"]]
        print(C.cyan(C.bold(f"Q{i}/{total}")) + "   " + C.dim(" · ".join(m for m in meta if m)))
        print()
        print(wrap(q["stem"]))
        print()
        for j, opt in enumerate(q["options"]):
            mark = C.green(" ◀ correct") if j == q["correct"] else ""
            col = C.green if j == q["correct"] else (lambda s: s)
            print(wrap(col(f"{letter(j)}) {opt}") + mark, indent=3, first_indent=2))
        print()
        print(C.bold("  Why:"))
        print(wrap(q["explanation"], indent=2))
        print()
        try:
            r = input(C.dim("  [Enter] next · 'q' quit: ")).strip().lower()
        except (EOFError, KeyboardInterrupt):
            break
        if r == "q":
            break
        clear()


# ----------------------------------------------------------------------------
# Selection / menu
# ----------------------------------------------------------------------------
def filter_bank(bank, domain=None, source=None, scenario=None, path=None):
    qs = bank
    if path in (1, 2):
        qs = [q for q in qs if q.get("path") == path]
    if domain is not None:
        qs = [q for q in qs if q.get("domain") == domain]
    if source:
        qs = [q for q in qs if source.lower() in q["source"].lower()]
    if scenario:
        qs = [q for q in qs if scenario.lower() in (q.get("scenario") or "").lower()]
    return qs


def scope_label(scope):
    if scope in (1, 2):
        return PATHS[scope]
    return "All paths"


def menu(bank):
    scope = None        # None = all, 1 = Path 1, 2 = Path 2
    feedback = True     # show answer + explanation after each question
    while True:
        active = filter_bank(bank, path=scope)
        clear()
        print(C.bold(C.blue("\n  ┌─────────────────────────────────────────────┐")))
        print(C.bold(C.blue("  │  Claude Certified Architect — Practice Quiz   │")))
        print(C.bold(C.blue("  └─────────────────────────────────────────────┘")))
        p1 = sum(1 for q in bank if q.get("path") == 1)
        p2 = sum(1 for q in bank if q.get("path") == 2)
        print(C.dim(f"  {len(bank)} questions total · Path 1: {p1} · Path 2: {p2}"))
        fb_state = C.green("ON") if feedback else C.yellow("OFF (exam-style)")
        print(C.bold(f"  Active scope: {C.cyan(scope_label(scope))}  ({len(active)} questions)"
                     f"   ·   Answers after each: {fb_state}\n"))
        print("   p) Choose PATH       (Path 1 / Path 2 / All)  ← run path 1 or 2 or all")
        print("   f) Toggle ANSWERS    (show after each ⇄ hide until the end)")
        print("   1) Mock exam         (40 mixed questions, scored /1000)")
        print("   2) Quiz by domain    (1-5)")
        print("   3) Quiz by scenario")
        print("   4) Random N questions")
        print("   5) Quiz by source")
        print("   6) Review mode       (read all, answers shown)")
        print("   7) Full scope        (all active questions, in order)")
        print(C.dim("   (a results .md file is written after every quiz)"))
        print("   q) Quit")
        try:
            ch = input(C.yellow("\n  Choose: ")).strip().lower()
        except (EOFError, KeyboardInterrupt):
            return

        if ch == "q":
            return
        elif ch == "p":
            print()
            for n, name in PATHS.items():
                srcs = sorted({q["source"] for q in bank if q.get("path") == n})
                print(f"    {n}) {name}  ({' + '.join(srcs)})")
            print("    3) All paths")
            s = input(C.yellow("  Scope: ")).strip()
            scope = {"1": 1, "2": 2, "3": None}.get(s, scope)
            continue
        elif ch == "f":
            feedback = not feedback
            continue
        elif ch == "1":
            qs = random.sample(active, min(EXAM_LEN, len(active)))
            run_quiz(qs, f"Mock Exam ({scope_label(scope)})", exam=True, feedback=feedback)
        elif ch == "2":
            print()
            for d in DOMAINS:
                cnt = sum(1 for q in active if q.get("domain") == d)
                print(f"    {d}) {domain_label(d)}  {C.dim(f'[{cnt} q]')}")
            d = input(C.yellow("  Domain (1-5): ")).strip()
            if d.isdigit() and int(d) in DOMAINS:
                qs = filter_bank(active, domain=int(d))
                random.shuffle(qs)
                run_quiz(qs, f"Domain {d}: {DOMAINS[int(d)]}", feedback=feedback)
        elif ch == "3":
            scens = sorted({q.get("scenario") for q in active if q.get("scenario")})
            print()
            for i, s in enumerate(scens, 1):
                cnt = sum(1 for q in active if q.get("scenario") == s)
                print(f"    {i:>2}) {s}  {C.dim(f'[{cnt} q]')}")
            sel = input(C.yellow("  Pick number: ")).strip()
            if sel.isdigit() and 1 <= int(sel) <= len(scens):
                s = scens[int(sel) - 1]
                qs = filter_bank(active, scenario=s)
                random.shuffle(qs)
                run_quiz(qs, f"Scenario: {s}", feedback=feedback)
        elif ch == "4":
            n = input(C.yellow("  How many questions? ")).strip()
            if n.isdigit() and int(n) > 0:
                qs = random.sample(active, min(int(n), len(active)))
                run_quiz(qs, f"Random {len(qs)} questions ({scope_label(scope)})", feedback=feedback)
        elif ch == "5":
            srcs = sorted({q["source"] for q in active})
            print()
            for i, s in enumerate(srcs, 1):
                cnt = sum(1 for q in active if q["source"] == s)
                print(f"    {i}) {s}  {C.dim(f'[{cnt} q]')}")
            sel = input(C.yellow("  Source: ")).strip()
            if sel.isdigit() and 1 <= int(sel) <= len(srcs):
                src = srcs[int(sel) - 1]
                qs = filter_bank(active, source=src)
                random.shuffle(qs)
                run_quiz(qs, f"Source: {src}", feedback=feedback)
        elif ch == "6":
            review_mode(list(active))
        elif ch == "7":
            run_quiz(list(active), f"Full scope ({scope_label(scope)}, {len(active)} q)", feedback=feedback)
        else:
            continue

        if ch in {"1", "2", "3", "4", "5", "7"}:
            input(C.dim("\n  [Enter] back to menu: "))


# ----------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Claude Certified Architect practice quiz")
    ap.add_argument("--exam", action="store_true", help="40-question mock exam, scored /1000")
    ap.add_argument("--path", type=str, choices=["1", "2", "all"], help="question path: 1, 2, or all")
    ap.add_argument("--domain", type=int, choices=[1, 2, 3, 4, 5], help="filter to a domain")
    ap.add_argument("--scenario", type=str, help="substring match on scenario name")
    ap.add_argument("--source", type=str, help="substring match on source name, e.g. moisesprat / olivier / sgrid")
    ap.add_argument("--num", type=int, help="N random questions")
    ap.add_argument("--review", action="store_true", help="read-only walkthrough with answers")
    ap.add_argument("--no-feedback", action="store_true",
                    help="exam-style: hide answers/explanations until the end (see them in the results file)")
    ap.add_argument("--no-color", action="store_true", help="disable ANSI colors")
    ap.add_argument("--seed", type=int, help="random seed for reproducible sets")
    args = ap.parse_args()

    if args.no_color:
        C.enabled = False
    if args.seed is not None:
        random.seed(args.seed)

    bank = load_bank()
    path = {"1": 1, "2": 2, "all": None}.get(args.path)

    # Non-interactive paths
    if any([args.exam, args.path, args.domain, args.scenario, args.source, args.num, args.review]):
        qs = filter_bank(bank, domain=args.domain, source=args.source,
                         scenario=args.scenario, path=path)
        if not qs:
            sys.exit("No questions match those filters.")
        scope = scope_label(path)
        feedback = not args.no_feedback
        if args.review:
            review_mode(qs)
            return
        if args.exam:
            qs = random.sample(qs, min(EXAM_LEN, len(qs)))
            run_quiz(qs, f"Mock Exam ({scope})", exam=True, feedback=feedback)
            return
        if args.num:
            qs = random.sample(qs, min(args.num, len(qs)))
        else:
            random.shuffle(qs)
        label = []
        if args.domain: label.append(f"Domain {args.domain}")
        if args.source: label.append(args.source)
        if args.scenario: label.append(args.scenario)
        if args.path: label.append(scope)
        run_quiz(qs, " · ".join(label) or "Practice", feedback=feedback)
        return

    menu(bank)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n" + C.dim("Bye — keep practicing. 👋"))
