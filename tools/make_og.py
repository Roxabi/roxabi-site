#!/usr/bin/env python3
"""Generate Open Graph cards for roxabi.dev (1200×630, EN + FR).

Canon copy: BRAND-BOOK.md v1.9 §1 hero table.

    python3 tools/make_og.py

Outputs:
    assets/og/roxabi-og.png
    assets/og/roxabi-og-fr.png
"""
from __future__ import annotations

import base64
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "assets" / "fonts"
OUT = ROOT / "assets" / "og"

W, H = 1200, 630

BG = "#0d1117"
TEXT = "#f0ede6"
MUTED = "#8b949e"
AMBER = "#f0b429"
HAIR = "#30363d"

LANGS = {
    "en": {
        "file": "roxabi-og.png",
        "lang": "en",
        "eyebrow": "Open-source compounding primitives",
        "h1a": "One person.",
        "h1b": "Team-scale output.",
        "lede": "Pre-wired. Open. Yours. A factory for the AI era — forkable foundations that compound.",
        "name": "Roxabi",
        "url": "roxabi.dev",
    },
    "fr": {
        "file": "roxabi-og-fr.png",
        "lang": "fr",
        "eyebrow": "Primitives open-source qui se composent",
        "h1a": "Une personne.",
        "h1b": "Le rendement d'une équipe.",
        "lede": "Pré-câblé. Ouvert. À toi. Une usine pour l'ère IA — des fondations forkables qui se composent.",
        "name": "Roxabi",
        "url": "roxabi.dev",
    },
}

FACES = {
    "inter": "inter-latin.woff2",
    "mono": "jetbrains-mono-latin.woff2",
}


def font_face(family: str, weight: int, b64: str) -> str:
    return (
        f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
        f"src:url(data:font/woff2;base64,{b64}) format('woff2');}}"
    )


def fonts_css() -> str:
    enc = {k: base64.b64encode((FONTS / v).read_bytes()).decode() for k, v in FACES.items()}
    return font_face("Inter", 700, enc["inter"]) + font_face("JetBrains Mono", 500, enc["mono"])


MARK = f"""
<svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
  <path fill="{HAIR}" d="M8 10h16v14H8z"/>
  <path fill="none" stroke="{AMBER}" stroke-width="1.5" d="M8 10h16v14H8z M8 10l8-4 8 4"/>
  <rect x="14" y="16" width="4" height="4" fill="{AMBER}" opacity="0.9"/>
</svg>
"""


def html_for(copy: dict, fonts: str) -> str:
    return f"""<!doctype html>
<html lang="{copy['lang']}"><head><meta charset="utf-8"><style>
{fonts}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px}}
.card{{position:relative;width:{W}px;height:{H}px;overflow:hidden;background:{BG};
  padding:76px 80px;display:flex;flex-direction:column;justify-content:space-between;
  font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}}
.glow{{position:absolute;top:-120px;right:-80px;width:560px;height:560px;
  background:radial-gradient(circle,rgba(240,180,41,0.18),rgba(240,180,41,0) 62%)}}
.grid{{position:absolute;inset:0;opacity:0.06;
  background-image:linear-gradient({HAIR} 1px,transparent 1px),linear-gradient(90deg,{HAIR} 1px,transparent 1px);
  background-size:48px 48px}}
.top{{position:relative;z-index:2}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:20px;
  letter-spacing:0.12em;text-transform:uppercase;color:{MUTED}}}
h1{{margin-top:28px;font-weight:700;font-size:88px;line-height:1.04;
  letter-spacing:-0.03em;color:{TEXT}}}
h1 .b{{color:{AMBER}}}
.lede{{position:relative;z-index:2;max-width:760px;font-weight:400;
  font-size:28px;line-height:1.42;color:{MUTED}}}
.foot{{position:relative;z-index:2;display:flex;align-items:center;
  justify-content:space-between;border-top:1px solid {HAIR};padding-top:28px}}
.who{{display:flex;align-items:center;gap:18px}}
.mark{{width:46px;height:46px}}
.name{{font-weight:600;font-size:30px;color:{TEXT};letter-spacing:-0.02em}}
.url{{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:26px;
  letter-spacing:0.04em;color:{MUTED}}}
</style></head>
<body><div class="card">
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="top">
    <div class="eyebrow">{copy['eyebrow']}</div>
    <h1>{copy['h1a']}<br><span class="b">{copy['h1b']}</span></h1>
  </div>
  <p class="lede">{copy['lede']}</p>
  <div class="foot">
    <div class="who">{MARK}<span class="name">{copy['name']}</span></div>
    <div class="url">{copy['url']}</div>
  </div>
</div></body></html>"""


def chrome() -> str:
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        path = shutil.which(name)
        if path:
            return path
    sys.exit("error: no Chrome/Chromium binary found for headless rendering")


def render(html: str, out: Path, browser: str) -> None:
    with tempfile.TemporaryDirectory() as td:
        page = Path(td) / "og.html"
        page.write_text(html, encoding="utf-8")
        cmd = [
            browser, "--headless=new", "--disable-gpu", "--no-sandbox",
            "--hide-scrollbars", "--force-device-scale-factor=1",
            f"--window-size={W},{H}", "--default-background-color=00000000",
            "--virtual-time-budget=3000",
            f"--screenshot={out}", page.as_uri(),
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if res.returncode != 0 or not out.exists():
            sys.exit(f"error: chrome render failed for {out.name}\n{res.stderr.strip()}")


def main() -> None:
    browser = chrome()
    fonts = fonts_css()
    OUT.mkdir(parents=True, exist_ok=True)
    for copy in LANGS.values():
        out = OUT / copy["file"]
        render(html_for(copy, fonts), out, browser)
        print(f"  ✓ {out.relative_to(ROOT)}  {W}×{H}  {out.stat().st_size // 1024} KB")
    print("OG cards generated.")


if __name__ == "__main__":
    main()