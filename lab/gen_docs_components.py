#!/usr/bin/env python3
"""Generate lab/docs-components.html — the docs design-system showcase.

Self-contained reference of every documentation component: each renders a live
demo (against the real /assets/css/{tokens,styles}.css) plus the exact HTML
snippet to author it. The snippet IS the demo string escaped, so they never drift.

Run:  python3 lab/gen_docs_components.py   (writes lab/docs-components.html)
View: serve the repo root, open /lab/docs-components.html (needs /assets/* to resolve)
"""
import html
from pathlib import Path

# (id, title, group, note, demo_html). group: "primitive" = pre-existing, "extended" = ported from forge.
COMPONENTS = [
    ("doc-hero", "Doc hero", "primitive",
     "Page header: kicker label, h1, lead, and derived tag chips.",
     '''<section class="doc-hero"><div class="wrap">
  <p class="section-label">Roxabi · Documentation</p>
  <h1>The Component Library</h1>
  <p class="lead prose" style="margin:var(--s-md) auto 0">A lead paragraph in the reading measure, centred under the title.</p>
  <div class="doc-hero-tags"><a class="tag" href="#" data-tag="factory">Factory</a><a class="tag" href="#" data-tag="voice">Voice</a></div>
</div></section>'''),

    ("section", "Numbered section", "primitive",
     "The docs body unit: a .titre block with a .label ordinal, an h2, and prose.",
     '''<div class="const-body prose">
  <div class="titre" id="demo-sec">
    <span class="label">01</span>
    <h2>A numbered section</h2>
    <p>Body copy set in the prose measure, with <strong>strong</strong> and inline <code>code</code>.</p>
  </div>
</div>'''),

    ("callout", "Callout", "primitive",
     "Key-insight aside, amber left rule.",
     '''<div class="callout"><p>The durable asset is <strong>the graph</strong>. Producers and consumers are swappable — the structured memory they feed is what compounds.</p></div>'''),

    ("feature-list", "Feature list", "primitive",
     "Bulleted list with amber diamond markers.",
     '''<ul class="feature-list">
  <li><strong>Producers</strong> parse one source and emit typed events.</li>
  <li><strong>Substrate</strong> stores, consolidates, and serves.</li>
  <li><strong>Consumers</strong> read the graph to act.</li>
</ul>'''),

    ("doc-figure", "Doc figure (SVG)", "primitive",
     "Framed schematic diagram + figcaption. SVG uses var() tokens only — theme-aware, no hard-coded hex.",
     '''<figure class="doc-figure">
  <svg viewBox="0 0 420 120" role="img" aria-label="Three-stage flow" style="width:100%;height:auto">
    <defs><marker id="ds-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--accent)"/></marker></defs>
    <rect x="10" y="35" width="110" height="50" rx="8" fill="var(--panel)" stroke="var(--border-hi)"/>
    <text x="65" y="64" text-anchor="middle" font-family="var(--font-mono)" font-size="12" fill="var(--text)">Capture</text>
    <rect x="155" y="35" width="110" height="50" rx="8" fill="var(--panel)" stroke="var(--border-hi)"/>
    <text x="210" y="64" text-anchor="middle" font-family="var(--font-mono)" font-size="12" fill="var(--text)">Structure</text>
    <rect x="300" y="35" width="110" height="50" rx="8" fill="var(--accent)"/>
    <text x="355" y="64" text-anchor="middle" font-family="var(--font-mono)" font-size="12" fill="var(--accent-on)">Recall</text>
    <line x1="120" y1="60" x2="150" y2="60" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
    <line x1="265" y1="60" x2="295" y2="60" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  </svg>
  <figcaption>A schematic flow built from theme-aware <code>var()</code> tokens.</figcaption>
</figure>'''),

    ("code-bare", "Inline code block", "primitive",
     "Bare &lt;pre class=\"code\"&gt; — quick snippet, always-dark surface, no chrome.",
     '''<pre class="code"><code>uv run python -m roxabi.factory --seed lyra</code></pre>'''),

    ("code-window", "Code window", "primitive",
     "Terminal-style panel: traffic-light dots + filename header. Used on the home hero.",
     '''<div class="code">
  <div class="code-head"><span class="d"></span><span class="d"></span><span class="d"></span><span class="name">factory.py</span></div>
  <pre><code><span class="k">def</span> seed(name):  <span class="c"># spawn a config-driven agent</span>
    <span class="k">return</span> Factory(name).build()</code></pre>
</div>'''),

    ("inline-code", "Inline code", "extended",
     "Subtle chip for code &amp; formal notation inside running prose. Block code (pre) opts out and keeps its own surface.",
     '''<div class="prose" style="max-width:none">
  <p>A reflex is forced when the atomic beliefs hold simultaneously: <code>obs(P) &rarr; enumerate(Sym(P)) &rarr; find(RC(P)) &rarr; architect(Corr(P))</code>. The anti-belief <code>&not;tested(C) &rArr; correct(C) unknown</code> needs no explicit gate — exclusion is <em>derived</em>, not enforced.</p>
</div>'''),

    ("tags", "Tag chips", "primitive",
     "Shared chip: &lt;a class=\"tag\"&gt; links (filter the index) or &lt;span class=\"tag\"&gt; static.",
     '''<div class="doc-hero-tags" style="justify-content:flex-start">
  <a class="tag" href="#" data-tag="factory">Factory</a>
  <a class="tag" href="#" data-tag="voice">Voice</a>
  <span class="tag" data-tag="cortex">Cortex (static)</span>
</div>'''),

    ("doc-cards", "Doc cards", "primitive",
     "Index grid card with derived tag chips; multi-tag supported.",
     '''<div class="grid grid-2 doc-cards">
  <a class="card doc-card" href="#" data-tags="cortex">
    <div class="doc-card-tags"><span class="tag" data-tag="cortex">Cortex</span></div>
    <h3>The Exocortex</h3>
    <p>Overview of the living-memory architecture and the ouroboros loop.</p>
    <p class="portfolio-note">Read <span class="arrow">&rarr;</span></p>
  </a>
  <a class="card doc-card" href="#" data-tags="factory voice">
    <div class="doc-card-tags"><span class="tag" data-tag="factory">Factory</span><span class="tag" data-tag="voice">Voice</span></div>
    <h3>A multi-tag document</h3>
    <p>Cards can carry several tags; the index filter matches any of them.</p>
    <p class="portfolio-note">Read <span class="arrow">&rarr;</span></p>
  </a>
</div>'''),

    ("doc-filter", "Tag filter bar", "primitive",
     "Index filter (client-JS). Production renders it hidden until app.js reveals it, so JS-off shows every card.",
     '''<div class="doc-filter" role="group" aria-label="Filter by tag">
  <button type="button" class="tag-filter is-active" data-filter="all">All</button>
  <button type="button" class="tag-filter" data-filter="cortex">Cortex</button>
  <button type="button" class="tag-filter" data-filter="factory">Factory</button>
  <button type="button" class="tag-filter" data-filter="voice">Voice</button>
</div>'''),

    ("doc-nav", "Doc footer nav", "primitive",
     "Per-document footer: the doc's tag chips + back-to-index link.",
     '''<nav class="doc-nav" aria-label="Document navigation">
  <div class="doc-nav-tags"><a class="tag" href="#" data-tag="cortex">Cortex</a></div>
  <a class="idx" href="#">All documentation &rarr;</a>
</nav>'''),

    ("meta-grid", "Meta grid", "primitive",
     "Key/value facts grid (license, language, status…).",
     '''<div class="meta-grid">
  <div class="m"><div class="k">License</div><div class="v">AGPL-3.0</div></div>
  <div class="m"><div class="k">Language</div><div class="v">Python</div></div>
  <div class="m"><div class="k">Status</div><div class="v">Active</div></div>
</div>'''),

    ("codeblock", "Codeblock", "extended",
     "Labelled code panel (filename/lang header) over the always-dark code surface. The forge .codeblock, ported.",
     '''<div class="codeblock">
  <div class="codeblock-header">python · MemoryEvent</div>
  <pre><code><span class="k">class</span> MemoryEvent:
    id:        ULID
    source:    <span class="s">"claude-code-jsonl"</span>
    timestamp: int        <span class="c"># epoch ms</span></code></pre>
</div>'''),

    ("data-table", "Data table", "extended",
     "Scroll-wrapped table with mono code cells.",
     '''<div class="tbl-wrap">
  <table class="data-table">
    <thead><tr><th>Layer</th><th>Role</th><th>Analogue</th></tr></thead>
    <tbody>
      <tr><td><code>L1</code></td><td>Raw event log</td><td>Sensory memory</td></tr>
      <tr><td><code>L2</code></td><td>Knowledge graph</td><td>Long-term memory</td></tr>
      <tr><td><code>L3</code></td><td>Compiled truth</td><td>Working memory</td></tr>
    </tbody>
  </table>
</div>'''),

    ("steps", "Steps", "extended",
     "Vertical numbered process with a connecting rail.",
     '''<div class="steps">
  <div class="step"><div class="step-num">1</div><div class="step-body"><div class="step-title">Capture</div><div class="step-desc">Append-only, multi-source events.</div></div></div>
  <div class="step"><div class="step-num">2</div><div class="step-body"><div class="step-title">Understand</div><div class="step-desc">Extract entities and relations.</div></div></div>
  <div class="step"><div class="step-num">3</div><div class="step-body"><div class="step-title">Synthesise</div><div class="step-desc">Regenerate compiled truth nightly.</div></div></div>
</div>'''),

    ("kpi", "KPI row", "extended",
     "Metric / stat cards, auto-fit grid.",
     '''<div class="kpi">
  <div class="kpi-item"><span class="kpi-value">1.5 GB</span><span class="kpi-label">corpus</span></div>
  <div class="kpi-item"><span class="kpi-value">~15</span><span class="kpi-label">projects</span></div>
  <div class="kpi-item"><span class="kpi-value">4</span><span class="kpi-label">layers</span></div>
  <div class="kpi-item"><span class="kpi-value">0</span><span class="kpi-label">lock-in</span></div>
</div>'''),

    ("timeline", "Timeline", "extended",
     "Dated vertical list with an accent rail.",
     '''<div class="timeline">
  <div class="tl-item"><div class="tl-label">Phase 1</div><div class="tl-title">Substrate</div><div class="tl-body">Event log + graph, no LLM required.</div></div>
  <div class="tl-item"><div class="tl-label">Phase 2</div><div class="tl-title">Actuation</div><div class="tl-body">Human-gated auto-PRs to CLAUDE.md.</div></div>
  <div class="tl-item"><div class="tl-label">Phase 3+</div><div class="tl-title">GEPA</div><div class="tl-body">Outcome-driven instruction evolution.</div></div>
</div>'''),

    ("compare", "Compare (is / not)", "extended",
     "Two-column contrast. Brand has no red/green — amber = affirmed, neutral = rejected.",
     '''<div class="compare-wrap">
  <div class="compare-col negative"><div class="compare-head">Not</div>
    <div class="compare-item"><strong>A cache</strong>a replica for speed.</div>
    <div class="compare-item"><strong>A dump</strong>accumulation without structure.</div>
  </div>
  <div class="compare-col positive"><div class="compare-head">Is</div>
    <div class="compare-item"><strong>A living graph</strong>learns, forgets, reorganises.</div>
    <div class="compare-item"><strong>A typed map</strong>every entity carries meaning.</div>
  </div>
</div>'''),

    ("formula-box", "Formula box", "extended",
     "Math / notation panel, amber on a left rule.",
     '''<div class="formula-box"><pre><code>strength(t) = base &times; decay &times; retrieval_boost &times; emotional_mult
decay       = 0.5 ^ (&Delta;t / effective_half_life)</code></pre></div>'''),

    ("caveat", "Caveat grid", "extended",
     "Q&amp;A / objection cards with an optional direction footer.",
     '''<div class="caveat-grid">
  <div class="caveat-card">
    <div class="caveat-q">Does it self-modify?</div>
    <div class="caveat-body">No. It <strong>proposes</strong> diffs; a human approves before any PR lands.</div>
    <div class="caveat-direction"><strong>Gate:</strong> the approval queue is architectural, not a convention.</div>
  </div>
  <div class="caveat-card">
    <div class="caveat-q">Is the graph swappable?</div>
    <div class="caveat-body">Producers and consumers are. The graph is the durable asset.</div>
  </div>
</div>'''),

    ("trinity", "Trinity", "extended",
     "Three labelled cards with an amber top rule — a triad at a glance.",
     '''<div class="trinity">
  <div class="trinity-card"><div class="trinity-label">D1 · Searle</div><div class="trinity-title">Speech acts</div><div class="trinity-body">Direction of fit — word&rarr;world vs world&rarr;word.</div></div>
  <div class="trinity-card"><div class="trinity-label">D2 · Husserl</div><div class="trinity-title">Schemas</div><div class="trinity-body">Noesis / noema — the believer and the believed.</div></div>
  <div class="trinity-card"><div class="trinity-label">D3 · Tulving</div><div class="trinity-title">Memory lifecycle</div><div class="trinity-body">Episodic &rarr; semantic, with decay and reconsolidation.</div></div>
</div>'''),

    ("modcard", "Modcard", "extended",
     "Labelled section card — a named module with a short body.",
     '''<div class="modcard">
  <div class="modcard-label">Domain · Substrate</div>
  <div class="modcard-title">cortex-memory</div>
  <div class="modcard-body"><p>Stores, consolidates, synthesises, and serves — the stable long-term asset.</p></div>
</div>
<div class="modcard">
  <div class="modcard-label">Domain · Analysers</div>
  <div class="modcard-title">cortex-insight</div>
  <div class="modcard-body"><p>Turns events into typed findings. Replaceable.</p></div>
</div>'''),
]

PAGE_CSS = """
  body { padding-bottom: 0; }
  .ds-top { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: var(--s-md); padding: var(--s-md) var(--s-lg); background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
  .ds-top .brand { font-weight: 800; letter-spacing: -.02em; }
  .ds-top .brand span { color: var(--accent); }
  .ds-toggle { font-family: var(--font-mono); font-size: .75rem; color: var(--text-muted); background: transparent; border: 1px solid var(--border-hi); border-radius: var(--r-md); padding: 6px 12px; cursor: pointer; }
  .ds-toggle:hover { color: var(--accent); border-color: var(--accent); }
  .ds-main { max-width: 940px; margin: 0 auto; padding: var(--s-2xl) var(--s-lg) 120px; }
  .ds-lead { color: var(--text-muted); max-width: var(--maxw-prose); }
  .ds-toc { display: flex; flex-wrap: wrap; gap: var(--s-sm); margin: var(--s-xl) 0 var(--s-2xl); }
  .ds-toc a { font-family: var(--font-mono); font-size: .72rem; color: var(--text-muted); border: 1px solid var(--border); border-radius: var(--r-full); padding: 4px 11px; }
  .ds-toc a:hover { color: var(--accent); border-color: var(--accent); }
  .ds-comp { margin: var(--s-2xl) 0; scroll-margin-top: 72px; }
  .ds-comp-head { display: flex; align-items: center; gap: var(--s-sm); margin-bottom: 6px; padding-bottom: var(--s-sm); border-bottom: 1px solid var(--border); }
  .ds-comp-head h2 { font-size: 1.15rem; }
  .ds-badge { font-family: var(--font-mono); font-size: .58rem; text-transform: uppercase; letter-spacing: .1em; padding: 2px 8px; border-radius: var(--r-full); border: 1px solid var(--border-hi); color: var(--text-dim); }
  .ds-badge.ext { color: var(--accent); border-color: var(--accent); }
  .ds-note { color: var(--text-dim); font-size: .85rem; margin-bottom: var(--s-md); }
  .ds-demo { border: 1px dashed var(--border-hi); border-radius: var(--r-md); padding: var(--s-lg); margin-bottom: var(--s-sm); background: var(--bg); }
  .ds-snip-h { font-family: var(--font-mono); font-size: .62rem; text-transform: uppercase; letter-spacing: .12em; color: var(--text-dim); margin-bottom: 4px; }
"""


def comp_html(c):
    cid, title, group, note, demo = c
    badge = '<span class="ds-badge ext">extended</span>' if group == "extended" else '<span class="ds-badge">primitive</span>'
    snippet = html.escape(demo)
    return f'''<section class="ds-comp" id="{cid}">
  <div class="ds-comp-head"><h2>{title}</h2>{badge}</div>
  <p class="ds-note">{note}</p>
  <div class="ds-demo">
{demo}
  </div>
  <p class="ds-snip-h">HTML</p>
  <div class="codeblock"><pre><code>{snippet}</code></pre></div>
</section>'''


def main():
    toc = "\n".join(f'<a href="#{c[0]}">{c[1]}</a>' for c in COMPONENTS)
    body = "\n\n".join(comp_html(c) for c in COMPONENTS)
    n_ext = sum(1 for c in COMPONENTS if c[2] == "extended")
    n_prim = len(COMPONENTS) - n_ext
    out = f'''<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Docs design system — Roxabi (lab)</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <style>{PAGE_CSS}</style>
</head>
<body>
  <header class="ds-top">
    <div class="brand">rox<span>@</span>bi · docs design system</div>
    <button type="button" class="ds-toggle" id="ds-theme">Toggle theme</button>
  </header>
  <main class="ds-main">
    <h1>Documentation components</h1>
    <p class="ds-lead">Every reusable block in the Roxabi docs, rendered live against the production
    <code>tokens.css</code> + <code>styles.css</code>. {n_prim} primitives (pre-existing) and {n_ext} extended
    components ported from the forge visual system — all on Roxabi tokens (amber-only, always-dark code surface).
    Copy the HTML under each demo. Generated by <code>lab/gen_docs_components.py</code>.</p>
    <nav class="ds-toc" aria-label="Components">
{toc}
    </nav>

{body}
  </main>
  <script>
    (function () {{
      var r = document.documentElement, b = document.getElementById('ds-theme');
      b.addEventListener('click', function () {{ r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light'; }});
    }})();
  </script>
</body>
</html>
'''
    dest = Path(__file__).resolve().parent / "docs-components.html"
    dest.write_text(out, encoding="utf-8")
    print(f"wrote {dest}  ({n_prim} primitives + {n_ext} extended = {len(COMPONENTS)} components)")


if __name__ == "__main__":
    main()
