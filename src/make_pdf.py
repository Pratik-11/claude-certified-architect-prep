#!/usr/bin/env python3
"""Bundle the card PNGs into a single multi-page PDF (one question per page).

Usage:
  python3 src/make_pdf.py                       # all cards/ -> flashcards.pdf
  python3 src/make_pdf.py --src cards_d3 --out d3.pdf
  python3 src/make_pdf.py --width 900           # downscale pages to keep size small
"""
import argparse, glob, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # repo root

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=os.path.join(ROOT, "cards"))
    ap.add_argument("--out", default=os.path.join(ROOT, "flashcards.pdf"))
    ap.add_argument("--width", type=int, default=900, help="max page width px (downscale)")
    args = ap.parse_args()

    files = sorted(glob.glob(os.path.join(args.src, "*.png")))
    if not files:
        raise SystemExit(f"no PNGs in {args.src}/")

    pages = []
    for f in files:
        im = Image.open(f).convert("RGB")
        if args.width and im.width > args.width:
            h = round(im.height * args.width / im.width)
            im = im.resize((args.width, h), Image.LANCZOS)
        pages.append(im)

    pages[0].save(args.out, save_all=True, append_images=pages[1:],
                  resolution=150.0)
    mb = os.path.getsize(args.out) / 1e6
    print(f"Wrote {args.out}  ({len(pages)} pages, {mb:.1f} MB)")

if __name__ == "__main__":
    main()
