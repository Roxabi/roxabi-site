#!/usr/bin/env python3
"""Generate the heroes-v2 lab: the current production hero (copy + iso diagram)
with a subtle radiant shader as a background layer — one page per shader.

Re-runnable. Sources nothing from the SEO build; preview by serving the repo root:
    python3 -m http.server -d . 8000   →  /lab/heroes-v2/

Each shader is vendored in assets/vendor/<file>.js (ported from radiant by Paul
Bakaus, MIT — recolored amber, reduced-motion aware, auto-inits #hero-bg).
"""
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

# (num, slug, display name, vendored js file, one-line note)
SHADERS = [
    ("v2a", "aurora-curtain",  "Aurora curtain",  "aurora-curtain.js",  "reference — already shipped-ready"),
    ("v2b", "kinetic-grid",    "Kinetic grid",    "kinetic-grid.js",    "spring-mesh impulse waves"),
    ("v2c", "gilt-mosaic",     "Gilt mosaic",     "gilt-mosaic.js",     "tiled gold leaf, light sweep"),
    ("v2d", "thunder-sermon",  "Thunder sermon",  "thunder-sermon.js",  "ambient glow, rare amber bolt"),
    ("v2e", "murmuration",     "Murmuration",     "murmuration.js",     "calm amber flock (boids)"),
    ("v2f", "woven-radiance",  "Woven radiance",  "woven-radiance.js",  "interlaced gold shimmer"),
]

GH_SVG = ('<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 '
          '0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 '
          '1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 '
          '.67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 '
          '3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>')

ISO = ('<svg id="iso" class="rox-dia" viewBox="0 0 540 420" role="img" '
       'aria-label="Isometric blueprint: the roxabi-factory core surrounded by module blocks '
       'on a grid, with amber dataflow particles converging on the core"></svg>')

PAGE = """<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hero V2 · {name} · Roxabi lab</title>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/styles.css">
<style>
  /* Lab page = the real production hero + a subtle radiant shader behind it.
     z-stack: shader canvas (0) · hero vignette ::after (1) · copy + iso (2). */
  *,*::before,*::after{{box-sizing:border-box}} *{{margin:0}}
  body{{font-family:var(--font-sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}}
  a{{color:inherit;text-decoration:none}}
  #hero-bg{{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:.9}}
  /* Replace the production centred vignette with a left-weighted scrim: keep the
     copy column dark+legible, let the shader (and iso) read on the right half. */
  .hero::after{{background:
    linear-gradient(95deg, var(--bg) 4%, color-mix(in srgb,var(--bg) 72%,transparent) 32%, transparent 64%),
    radial-gradient(ellipse 96% 96% at 52% 48%, transparent 60%, var(--bg) 100%) !important}}
  /* corner lab chrome */
  .lab-tag,.lab-back{{position:fixed;bottom:12px;z-index:100;font-family:var(--font-mono);font-size:.72rem;
    padding:4px 12px;border-radius:var(--r-full);backdrop-filter:blur(6px);
    background:color-mix(in srgb,var(--bg) 80%,transparent)}}
  .lab-tag{{left:12px;color:var(--text-dim);border:1px solid var(--border)}}
  .lab-back{{right:12px;color:var(--text-muted);border:1px solid var(--border-hi);transition:color .2s,border-color .2s}}
  .lab-back:hover{{color:var(--accent);border-color:var(--accent)}}
  .hero-cta{{display:flex;gap:var(--s-md);margin-top:var(--s-xl);flex-wrap:wrap}}
  .hero .sub{{color:var(--accent);font-weight:600}}
  .btn{{display:inline-flex;align-items:center;gap:var(--s-sm);font-weight:600;font-size:.95rem;padding:10px 18px;
    border-radius:var(--r-md);border:1px solid transparent;transition:all var(--dur) var(--ease)}}
  .btn svg{{width:16px;height:16px}}
  .btn-primary{{background:var(--accent);color:var(--accent-on)}}
  .btn-primary:hover{{background:var(--accent-hover);box-shadow:var(--glow-accent)}}
  .btn-ghost{{background:transparent;color:var(--text);border-color:var(--border-hi)}}
  .btn-ghost:hover{{border-color:var(--accent);color:var(--accent)}}
</style>
</head>
<body>
<span class="lab-tag">{num} · {name}</span>
<a class="lab-back" href="./index.html">← gallery</a>
<main>
  <section class="hero">
    <canvas id="hero-bg" aria-hidden="true"></canvas>
    <div class="wrap">
      <div class="hero-copy">
        <span class="badge"><span class="dot"></span>AGPL-3.0 · Open by architecture</span>
        <h1>One person.<br>Team-scale output.</h1>
        <p class="lead"><span class="sub">Pre-wired. Open. Yours.</span><br>
          A factory for the AI era. Roxabi compounds agents, workers, tools and skills into one foundation &mdash; all open source, yours to fork.</p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="#">Explore the projects &rarr;</a>
          <a class="btn btn-ghost" href="#">{gh} GitHub</a>
        </div>
      </div>
      {iso}
    </div>
  </section>
</main>
<!-- app.js builds the iso diagram + scroll reveal; shader module auto-inits #hero-bg -->
<script src="/assets/js/app.js"></script>
<script src="/assets/vendor/{js}"></script>
</body>
</html>
"""

CARD = ('    <a class="card" href="./{num}-{slug}.html"><div class="thumb">'
        '<iframe src="./{num}-{slug}.html" loading="lazy" scrolling="no" title="{num}"></iframe></div>'
        '<div class="meta"><span class="n">{num}</span><span class="name">{name}</span>'
        '<span class="note">{note}</span><span class="open">open &rarr;</span></div></a>')

INDEX = """<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hero lab V2 · shader backgrounds · Roxabi</title>
<link rel="stylesheet" href="/assets/css/fonts.css">
<link rel="stylesheet" href="/assets/css/tokens.css">
<style>
  *,*::before,*::after{{box-sizing:border-box}} *{{margin:0}}
  body{{font-family:var(--font-sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;line-height:1.6;padding:0 var(--s-lg) var(--s-2xl)}}
  a{{color:inherit;text-decoration:none}}
  .top{{max-width:1280px;margin:0 auto;padding-block:var(--s-2xl) var(--s-lg)}}
  .eyebrow{{font-family:var(--font-mono);font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent)}}
  h1{{font-size:clamp(2rem,5vw,3rem);font-weight:900;letter-spacing:-.04em;margin-top:var(--s-sm)}}
  .sub{{color:var(--text-muted);margin-top:var(--s-sm);max-width:70ch}}
  .sub a{{color:var(--accent);border-bottom:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}}
  .grid{{max-width:1280px;margin:var(--s-xl) auto 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:var(--s-lg)}}
  .card{{border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;background:var(--panel);transition:border-color .2s,transform .2s}}
  .card:hover{{border-color:var(--accent);transform:translateY(-2px)}}
  .thumb{{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:var(--bg);border-bottom:1px solid var(--border)}}
  .thumb iframe{{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;transform:scale(.281);transform-origin:top left;pointer-events:none}}
  .meta{{display:flex;align-items:baseline;gap:var(--s-sm);padding:12px 16px;flex-wrap:wrap}}
  .meta .n{{font-family:var(--font-mono);font-size:.78rem;color:var(--accent)}}
  .meta .name{{font-weight:600;font-size:.95rem}}
  .meta .note{{font-family:var(--font-mono);font-size:.68rem;color:var(--text-dim)}}
  .meta .open{{font-family:var(--font-mono);font-size:.72rem;color:var(--text-dim);margin-left:auto}}
  .card:hover .open{{color:var(--accent)}}
  footer{{max-width:1280px;margin:var(--s-2xl) auto 0;color:var(--text-dim);font-family:var(--font-mono);font-size:.75rem}}
  @media (min-width:1340px){{ .thumb iframe{{transform:scale(.328)}} }}
</style>
</head>
<body>
<div class="top">
  <p class="eyebrow">Roxabi · design lab · V2</p>
  <h1>Hero — shader backgrounds</h1>
  <p class="sub">The current production hero (copy + iso diagram) with a subtle WebGL/Canvas shader behind it.
  Each is ported from <a href="https://github.com/pbakaus/radiant" rel="noopener">radiant</a> by Paul Bakaus (MIT),
  recolored to the Roxabi amber palette, reduced-motion aware. Click any card to open full-screen.</p>
</div>
<div class="grid">
{cards}
</div>
<footer>roxabi-site/lab/heroes-v2/ · not in the SEO build · regenerate with <span style="color:var(--accent)">python3 gen.py</span></footer>
</body>
</html>
"""


def main():
    for num, slug, name, js, _ in SHADERS:
        html = PAGE.format(num=num, slug=slug, name=name, js=js, gh=GH_SVG, iso=ISO)
        (HERE / f"{num}-{slug}.html").write_text(html, encoding="utf-8")
    cards = "\n".join(
        CARD.format(num=num, slug=slug, name=name, note=note)
        for num, slug, name, _, note in SHADERS
    )
    (HERE / "index.html").write_text(INDEX.format(cards=cards), encoding="utf-8")
    print(f"✓ wrote {len(SHADERS)} hero pages + index → lab/heroes-v2/")


if __name__ == "__main__":
    main()
