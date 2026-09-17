#!/usr/bin/env python3
"""Render each quiz question as a phone-friendly PNG flashcard.

One image per question: header (domain/task/scenario/path), the question stem,
the options with the correct one highlighted in green (✓), and the explanation.
Filenames sort by domain then number so they scroll in a sensible order in a
phone gallery: cards/d1_001_q-csa-001.png

Usage:
  python3 make_cards.py                # all questions
  python3 make_cards.py --no-explain   # hide explanations (Q + answer only)
  python3 make_cards.py --path 1       # only Path 1 questions
  python3 make_cards.py --domain 3     # only domain 3
  python3 make_cards.py --limit 3      # first N (handy for a quick preview)
  python3 make_cards.py --id q-csa-001 # a single question by id
"""
import argparse, json, os, re, textwrap
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
REG  = os.path.join(FONT_DIR, "DejaVuSans.ttf")
BOLD = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")
MONO = os.path.join(FONT_DIR, "DejaVuSansMono.ttf")

# ---- layout constants (portrait, phone-friendly) ----
W        = 1080          # image width (px)
PAD      = 56            # outer margin
MAXW     = W - 2 * PAD   # usable text width
BG       = (248, 249, 251)
CARD     = (255, 255, 255)
INK      = (23, 28, 38)
MUTED    = (110, 119, 133)
ACCENT   = (88, 76, 196)        # Anthropic-ish purple
OK_BG     = (224, 245, 230)      # correct option fill
OK_BORDER = (39, 158, 90)
OPT_BG    = (245, 246, 248)
EXP_BG    = (245, 243, 252)

F_META  = ImageFont.truetype(BOLD, 26)
F_STEM  = ImageFont.truetype(REG, 36)
F_STEMB = ImageFont.truetype(BOLD, 36)
F_OPT   = ImageFont.truetype(REG, 32)
F_OPTB  = ImageFont.truetype(BOLD, 32)
F_EXPH  = ImageFont.truetype(BOLD, 28)
F_EXP   = ImageFont.truetype(REG, 30)
F_FOOT  = ImageFont.truetype(REG, 24)

_meas = ImageDraw.Draw(Image.new("RGB", (1, 1)))

def strip_md(s):
    return s.replace("`", "").replace(" ", " ")

def wrap(text, font, maxw):
    """Greedy word-wrap to fit maxw px. Returns list of lines."""
    text = strip_md(text)
    out = []
    for para in text.split("\n"):
        if not para.strip():
            out.append("")
            continue
        words, line = para.split(), ""
        for w in words:
            trial = w if not line else line + " " + w
            if _meas.textlength(trial, font=font) <= maxw:
                line = trial
            else:
                if line:
                    out.append(line)
                # hard-break a single word longer than maxw
                while _meas.textlength(w, font=font) > maxw:
                    cut = len(w)
                    while cut > 1 and _meas.textlength(w[:cut], font=font) > maxw:
                        cut -= 1
                    out.append(w[:cut]); w = w[cut:]
                line = w
        out.append(line)
    return out

def line_h(font):
    a, d = font.getmetrics()
    return a + d + 8

def draw_lines(d, x, y, lines, font, fill, lh=None):
    lh = lh or line_h(font)
    for ln in lines:
        d.text((x, y), ln, font=font, fill=fill)
        y += lh
    return y

def render(q, out_path, show_explain=True):
    letters = "ABCDEFGH"
    # --- pre-measure total height ---
    inner = MAXW - 48  # text padding inside cards
    blocks = []  # (kind, payload)

    parts = []
    if q.get("domain") is not None: parts.append(f"DOMAIN {q['domain']}")
    if q.get("task"):               parts.append(f"TASK {q['task']}")
    if q.get("path") is not None:   parts.append(f"PATH {q['path']}")
    meta = "  ·  ".join(parts) or q["id"]
    blocks.append(("meta", meta))
    if q.get("scenario"):
        blocks.append(("scenario", q["scenario"]))
    blocks.append(("gap", 18))
    blocks.append(("stem", wrap(q["stem"], F_STEMB, MAXW)))
    blocks.append(("gap", 24))

    for i, opt in enumerate(q["options"]):
        correct = (i == q["correct"])
        label = f"{letters[i]}.  "
        lines = wrap(label + opt, F_OPTB if correct else F_OPT, inner)
        blocks.append(("opt", (lines, correct)))

    if show_explain and q.get("explanation"):
        blocks.append(("gap", 26))
        blocks.append(("exp", wrap(q["explanation"], F_EXP, inner)))

    # height accumulation
    H = PAD
    def add(px):
        nonlocal H; H += px
    for kind, payload in blocks:
        if kind == "meta":   add(line_h(F_META))
        elif kind == "scenario": add(line_h(F_META))
        elif kind == "gap":  add(payload)
        elif kind == "stem": add(len(payload) * line_h(F_STEM))
        elif kind == "opt":
            lines, _ = payload
            add(len(lines) * line_h(F_OPT) + 28)  # padding+gap per option
        elif kind == "exp":
            add(line_h(F_EXPH) + 8 + len(payload) * line_h(F_EXP) + 36)
    add(line_h(F_FOOT) + PAD)  # footer
    H = int(H)

    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # outer card
    d.rounded_rectangle([20, 20, W - 20, H - 20], radius=28, fill=CARD)
    # accent bar
    d.rounded_rectangle([20, 20, 32, H - 20], radius=6, fill=ACCENT)

    x, y = PAD, PAD
    for kind, payload in blocks:
        if kind == "meta":
            d.text((x, y), payload, font=F_META, fill=ACCENT); y += line_h(F_META)
        elif kind == "scenario":
            d.text((x, y), payload, font=F_META, fill=MUTED); y += line_h(F_META)
        elif kind == "gap":
            y += payload
        elif kind == "stem":
            y = draw_lines(d, x, y, payload, F_STEMB, INK)
        elif kind == "opt":
            lines, correct = payload
            bh = len(lines) * line_h(F_OPT) + 16
            box = [x, y, x + MAXW, y + bh]
            if correct:
                d.rounded_rectangle(box, radius=14, fill=OK_BG, outline=OK_BORDER, width=3)
            else:
                d.rounded_rectangle(box, radius=14, fill=OPT_BG)
            ty = y + 8
            ty = draw_lines(d, x + 24, ty, lines,
                            F_OPTB if correct else F_OPT,
                            INK if correct else (60, 67, 80))
            if correct:
                d.text((x + MAXW - 44, y + 8), "✓", font=F_OPTB, fill=OK_BORDER)
            y += bh + 14
        elif kind == "exp":
            eh = line_h(F_EXPH) + 8 + len(payload) * line_h(F_EXP) + 24
            d.rounded_rectangle([x, y, x + MAXW, y + eh], radius=14, fill=EXP_BG)
            ey = y + 14
            d.text((x + 24, ey), "Why", font=F_EXPH, fill=ACCENT); ey += line_h(F_EXPH) + 8
            draw_lines(d, x + 24, ey, payload, F_EXP, (50, 56, 70))
            y += eh + 12

    d.text((x, H - PAD - 8), f"{q['id']}  ·  {q['source']}", font=F_FOOT, fill=MUTED)
    img.save(out_path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-explain", action="store_true")
    ap.add_argument("--path", type=int)
    ap.add_argument("--domain", type=int)
    ap.add_argument("--limit", type=int)
    ap.add_argument("--id")
    ap.add_argument("--out", default="cards")
    args = ap.parse_args()

    qs = json.load(open("questions.json"))
    if args.path:   qs = [q for q in qs if q["path"] == args.path]
    if args.domain: qs = [q for q in qs if q["domain"] == args.domain]
    if args.id:     qs = [q for q in qs if q["id"] == args.id]
    qs.sort(key=lambda q: (q["domain"] if q["domain"] is not None else 99,
                           str(q.get("task") or ""), q["id"]))
    if args.limit:  qs = qs[: args.limit]

    os.makedirs(args.out, exist_ok=True)
    n = 0
    for i, q in enumerate(qs, 1):
        safe = re.sub(r"[^a-zA-Z0-9_-]", "", q["id"])
        dom = q["domain"] if q["domain"] is not None else "x"
        name = f"d{dom}_{i:03d}_{safe}.png"
        render(q, os.path.join(args.out, name), show_explain=not args.no_explain)
        n += 1
    print(f"Wrote {n} cards to {args.out}/")

if __name__ == "__main__":
    main()
