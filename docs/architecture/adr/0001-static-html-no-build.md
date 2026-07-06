---
id: ADR-0001
title: Static hand-authored HTML — no framework, no backend, no build
status: accepted
date: 2026-06-01
deciders: [Mickael]
---

# ADR-0001 — Static HTML, no framework, no backend

## Status

**accepted** — 2026-06-01. The "no build step" clause is superseded by
[ADR-0002](0002-mini-build.md) (a minimal zero-dependency generator); all other
decisions here stand.

## Context

`roxabi-site` is the hub marketing site (roxabi.dev). It is a content site:
a landing page, a portfolio of the open-source primitives, a Constitution/philosophy
page (`/constitution/`), and outbound links to GitHub + docs. There is no user state, no
authentication, no dynamic data, no form processing required at launch.

The brand is **"open by architecture — inspectable, forkable, nothing calls
home."** The site itself should embody that: a visitor who views source should
see exactly what runs. A build step or a framework runtime contradicts the
message it sells.

Design tokens are already locked (`brand/DESIGN.md`,
Brand Book §6): one palette, one accent, Inter + JetBrains Mono.

## Decision

Build the site as **hand-authored static HTML + CSS + vanilla JS. No framework,
no backend, no build step.**

- **HTML** — one `.html` file per page, authored directly.
- **CSS** — a single `tokens.css` (the DESIGN.md tokens as `:root` custom
  properties) + per-page or shared stylesheets. No preprocessor.
- **JS** — vanilla only, progressive enhancement, optional per page (theme
  toggle, hero animation). The site must render and read with JS disabled.
- **No backend** — no server runtime. Static files only.
- **Hosting** — Cloudflare Pages (static deploy from `main`). Same pattern as
  `roxabi-1page`. Free, global CDN, custom domain, zero ops.

## Consequences

### Positive
- View-source = the whole truth. The medium matches the message.
- Zero runtime deps, zero CVE surface, zero ops. Lives for years untouched.
- Instant loads; no hydration, no JS framework cost.
- Anyone can fork it and run it from `file://` — consistent with the brand.

### Negative / trade-offs
- **Shared chrome duplication.** Nav + footer are copy-pasted across pages.
  With ≤6 pages this is acceptable. Mitigations *if* it hurts later, in
  preference order:
  1. Accept the duplication (current choice — re-evaluate past ~8 pages).
  2. A small vanilla-JS client include (`fetch('/_partials/nav.html')`) —
     keeps "no build" but adds a render-time request.
  3. A minimal build-time include step (e.g. a ~30-line Python/`uv` script or
     `eleventy`) — crosses the "no build" line; needs a new ADR to supersede.
- **No content collections.** If the portfolio grows into a maintained list or
  a blog appears, hand-authoring stops scaling → revisit (would supersede this
  ADR with a static-site-generator decision).

### Vendored third-party (allowed exceptions)
- One WebGL shader, `fluid-amber` from **radiant** (pbakaus, MIT), inlined as the
  hero background (~8 KB). Decorative, degrades to flat `#0d1117` with JS off — does
  not violate the JS-disabled rule. This is the only external code vendored at launch.

### Revisit triggers
- Pages exceed ~8, or a blog/content collection is introduced.
- A form needs server-side processing (contact, newsletter) → a serverless
  function on Cloudflare, not a backend, would be the first step.

## Alternatives considered

| Option | Why not (now) |
|--------|---------------|
| Astro / 11y (SSG) | Build step + node toolchain. Premature for ≤6 static pages; contradicts "view-source = truth" unless output is clean. Strongest candidate *if* a revisit trigger fires. |
| Next/SvelteKit | Full framework + (ideally) a runtime. Massive overkill; no dynamic needs. |
| Plain HTML **with** a build (includes only) | Solves nav duplication but reintroduces a toolchain for a marginal gain at this size. Deferred to mitigation #3. |

## Update — 2026-06-01 (i18n + SEO)

- **Bilingual by URL**: `/*` = EN, `/fr/*` = FR (4 pages × 2). SEO-correct over a
  JS toggle (indexable URLs, reciprocal `hreflang`). The client-side i18n engine
  was removed; language is now pages, not script.
- **Paths switched relative → root-absolute** (`/assets/...`, `/`, `/fr/...`). The
  dual tree + canonical/sitemap need absolute URLs anyway; this **drops the
  "open from `file://`" guarantee** — accepted, the site is served (Cloudflare Pages).
- **">8 pages" revisit trigger is now effectively hit** (8 pages, nav/footer/SEO
  head duplicated ×8). Each copy is a maintenance liability. **Recommendation for
  the next change: introduce a minimal include/SSG step** (mitigation #3 / Astro-11ty
  row below) to dedupe chrome + i18n. Not done now to honour "HTML pur", but the
  cost/benefit has flipped.
  → **Acted on 2026-06-01: see [ADR-0002](0002-mini-build.md)**, which supersedes the
  "no build step" clause of this ADR (mitigation #3, zero-dependency Python generator).
  Everything else here still stands.
- **SEO surface added**: per-page canonical, hreflang, OG + Twitter, JSON-LD
  (Organization/WebSite/BreadcrumbList/SoftwareSourceCode), `robots.txt`,
  `sitemap.xml` (+ alternates), `site.webmanifest`, OG images + icon set.
  Canonical base assumed `https://roxabi.dev`.

## References
- Brand Book §6 — color, typography, logo: `brand/BRAND-BOOK.md`
- Design tokens: `brand/DESIGN.md`
- Logo (canonical): `brand/logo/foundation-block.svg`
- Prototypes (archived, not in repo): `~/.roxabi/roxabi-site/exploration/{roxabi-landing,roxabi-direction-d-final}.html` (cf. ADR-0003)
- Sibling pattern: `roxabi-1page` (Cloudflare Pages static)
