---
id: ADR-0002
title: Minimal include/SSG build — dedupe chrome, derive SEO
status: accepted
date: 2026-06-01
deciders: [Mickael]
supersedes: partial — ADR-0001 "no build step" clause
---

# ADR-0002 — A minimal, zero-dependency build step

## Status

**accepted** — 2026-06-01. Supersedes the "no build step" clause of
[ADR-0001](0001-static-html-no-build.md). Everything else in ADR-0001 stands:
still hand-authored static HTML/CSS/vanilla-JS, no framework, no backend,
Cloudflare Pages hosting.

## Context

ADR-0001 chose hand-authored HTML and named its own exit condition:

> Accept the duplication (current choice — re-evaluate past ~8 pages).
> … A minimal build-time include step … crosses the "no build" line; needs a
> new ADR to supersede.

The i18n + SEO pass (ADR-0001 update, 2026-06-01) took the site to **8 pages**
(4 logical × EN/FR). The shared chrome — `<head>` boilerplate, nav, footer,
theme-init script — is now copy-pasted ×8, and the SEO surface (canonical,
`hreflang`, `og:*`, JSON-LD, sitemap) is per-page hand-written and trivially
desyncable. Reciprocal `hreflang` and a per-language canonical are exactly the
kind of thing that rots silently when edited by hand. The trigger fired.

## Decision

Introduce a **minimal, zero-dependency build step**: a ~200-line Python script
(`src/build.py`, stdlib only — `tomllib`, no `pip`, no node) that renders the
EN/`/fr/` page trees from templates + a manifest into `dist/`.

- **Sources committed, `dist/` generated** (git-ignored, built in CI / locally).
- **Chrome deduped**: one `nav.html`, one `footer_{full,min}.html`, one page
  shell. Edit once.
- **SEO derived, not authored**: canonical, `hreflang` {en, fr, x-default},
  `og:url`/`og:locale`, breadcrumb JSON-LD, and `sitemap.xml` are all computed
  from `(path, lang)`. Impossible to desync by construction.
- **Prose stays hand-authored** as `<main>` fragments in `src/bodies/{en,fr}/`.
  Content lives in HTML, not a string table — keeps the brand's
  "view-source = truth" character and pleasant prose editing.
- **Output is plain static HTML** — no runtime framework, no hydration, no
  client JS added by the build. View-source of `dist/` is the whole truth, same
  as before. The medium still matches the message.

Chosen over `eleventy`/Astro: those bring a node toolchain and a dependency
tree for what a stdlib script does. Python is already the Roxabi stack default
(`uv` + Python everywhere); zero deps = zero CVE surface, same as ADR-0001 valued.

## Consequences

### Positive
- One edit to nav/footer/head propagates to all 8 pages.
- Reciprocal `hreflang` + per-lang canonical are derived → cannot rot.
- Adding a page = 1 manifest block + 2 body fragments; all SEO falls out.
- `dist/` is still clean, inspectable, framework-free static HTML.
- Build is `python3 src/build.py` — no install, no lockfile, runs anywhere with 3.11+.

### Negative / trade-offs
- **Crosses the "no build" line** ADR-0001 drew. Mitigated: the step is
  inspectable, dependency-free, and produces byte-clean HTML (verified: 7/8
  pages identical to the prior hand-authored output, home differs only by
  collapsed-whitespace nav with identical DOM).
- **`file://` open is already gone** (root-absolute paths, ADR-0001 update) — the
  build doesn't regress anything there.
- **Deploy now needs Python 3.11+ in the build image** (Cloudflare Pages
  supports it). Build command `python3 src/build.py`, output `dist`.
- One layer of indirection: editing a page means knowing source lives in
  `src/`, not at the root. Documented in `README.md`.

### Revisit triggers
- A real content collection / blog (many same-shaped pages) → consider a proper
  SSG with content collections; this script intentionally doesn't template prose.
- The manifest outgrows readability (≫ a handful of pages with bespoke SEO).

## References
- [ADR-0001](0001-static-html-no-build.md) — the superseded "no build" decision + its named exit condition.
- `src/build.py`, `src/site.toml`, `README.md`.
- Information architecture: `../information-architecture.md`.
