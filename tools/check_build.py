#!/usr/bin/env python3
"""Build gate — the CI quality gate for the static SSG.

Runs the build and asserts the structural + a11y invariants that hold for any
page the zero-dependency Python SSG emits:

  1. `python3 src/build.py` exits 0   (catches template-token / site.toml manifest /
                                        SEO-derivation regressions at the source).
  2. Every dist/**/*.html is tag-balanced (void-element aware).
  3. WCAG 2.1 AA contrast (>= 4.5:1) holds for the foundational token pairs in BOTH
     themes, read live from assets/css/tokens.css — the accent button label
     (--accent-on / --accent) and body text (--text / --bg). Catches an accent or
     text-token regression that would ship an unreadable CTA.

Exit 0 = all gates pass. Non-zero + a per-failure list = the gates that broke.
Stdlib only — runs locally (`python3 tools/check_build.py`) and in CI.
"""
from __future__ import annotations

import re
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

# ── 3. WCAG AA contrast on foundational token pairs ─────────────────────────
def _lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def _lum(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(fg: str, bg: str) -> float:
    a, b = _lum(fg), _lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


tokens = (ROOT / "assets/css/tokens.css").read_text(encoding="utf-8")


def css_block(selector: str) -> dict[str, str]:
    """{--var: #hex} for the first rule whose selector text equals `selector`."""
    m = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", tokens)
    if not m:
        return {}
    return dict(re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})", m.group(1)))


# Dark is the :root default; light overrides under :root[data-theme="light"].
_dark = css_block(":root")
_light = {**_dark, **css_block(':root[data-theme="light"]')}


def token(name: str, theme: str) -> str | None:
    return (_light if theme == "light" else _dark).get(name)


# (fg_token, bg_token, theme, min_ratio, label)
PAIRS = [
    ("--accent-on", "--accent", "dark", 4.5, "btn-primary / active-tag (dark)"),
    ("--accent-on", "--accent", "light", 4.5, "btn-primary / active-tag (light)"),
    ("--text", "--bg", "dark", 4.5, "body text (dark)"),
    ("--text", "--bg", "light", 4.5, "body text (light)"),
]
for fg, bg, theme, minimum, label in PAIRS:
    fg_v, bg_v = token(fg, theme), token(bg, theme)
    if not fg_v or not bg_v:
        fail("contrast: token missing for %s (%s=%s, %s=%s)" % (label, fg, fg_v, bg, bg_v))
        continue
    got = ratio(fg_v, bg_v)
    if got < minimum:
        fail("contrast FAIL %s: %s on %s = %.2f < %.1f" % (label, fg_v, bg_v, got, minimum))

# ── Report ──────────────────────────────────────────────────────────────────
if fails:
    sys.stdout.write("✗ %d build-gate failure(s):\n" % len(fails))
    for f in fails:
        sys.stdout.write("  - %s\n" % f)
    sys.exit(1)
sys.stdout.write("✓ build gate passed (build + HTML balance + WCAG-AA contrast)\n")
