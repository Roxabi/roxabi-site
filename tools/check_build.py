#!/usr/bin/env python3
"""Build gate — the CI quality gate for the static SSG.

Runs the build and asserts the structural invariants that hold for any page the
zero-dependency Python SSG emits:

  1. `python3 src/build.py` exits 0   (catches template-token / site.toml manifest /
                                        SEO-derivation regressions at the source).
  2. Every dist/**/*.html is tag-balanced (void-element aware).

Exit 0 = all gates pass. Non-zero + a per-failure list = the gates that broke.
Stdlib only — runs locally (`python3 tools/check_build.py`) and in CI.

The reference site (bouly-site) extends this gate with WCAG-AA contrast, FR
a11y-tree and OG-card invariants. Those are content-specific. The contrast pair
(--accent-on / --accent) is the next invariant to enable here once the open
light/dark accent-contrast fix lands (currently < 4.5 — tracked separately).
"""
from __future__ import annotations

import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
fails: list[str] = []


def fail(msg: str) -> None:
    fails.append(msg)


# ── 1. Build ────────────────────────────────────────────────────────────────
res = subprocess.run(
    [sys.executable, "src/build.py"], cwd=ROOT, capture_output=True, text=True
)
if res.returncode != 0:
    sys.stdout.write("✗ build failed (exit %d):\n%s\n" % (res.returncode, res.stderr or res.stdout))
    sys.exit(1)

# ── 2. HTML tag balance ─────────────────────────────────────────────────────
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}


class Balance(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stack: list[str] = []
        self.errors: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack.pop() != tag:
                pass
        else:
            self.errors.append("stray </%s>" % tag)


for html in sorted(DIST.rglob("*.html")):
    p = Balance()
    p.feed(html.read_text(encoding="utf-8"))
    if p.stack or p.errors:
        fail("HTML unbalanced: %s unclosed=%s err=%s"
             % (html.relative_to(ROOT), p.stack[-3:], p.errors[:2]))

# ── Report ──────────────────────────────────────────────────────────────────
if fails:
    sys.stdout.write("✗ %d build-gate failure(s):\n" % len(fails))
    for f in fails:
        sys.stdout.write("  - %s\n" % f)
    sys.exit(1)
sys.stdout.write("✓ build gate passed (build + HTML balance)\n")
