@.claude/stack.yml

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`roxabi-site` — the static bilingual marketing + portfolio site for Roxabi, served at [roxabi.dev](https://roxabi.dev). EN lives at `/`, FR at `/fr/`. No runtime framework, no JS app — every page is pre-rendered static HTML.

Brand canon: `brand/BRAND-BOOK.md` **v1.9** — ambition + culture lead §1; hero copy locked in §1 table (do not improvise home hero). Recap companion: `brand/visuals/brand-recap.html`.

Two reader arcs shape the content (Brand Book §5 / `docs/architecture/information-architecture.md`):
- **Marco** (multiplier) → output-first. Owns the **home/landing** and CTAs.
- **Nadia** (autonomy seeker) → sovereignty-first. Owns the **Constitution**.
- When in doubt, write for Marco. Philosophy goes on the Constitution, never the hero.

## Site map (what each page is for)

URLs are dir-style (`path/` → `path/index.html`); every EN page has a 1:1 FR mirror under `/fr/`.

| id | URL (EN) | Purpose | body | jsonld |
|---|---|---|---|---|
| `home` | `/` | Landing — value prop, pillars, CTAs. Has the hero shader. | `home` | `home` (Organization + WebSite) |
| `constitution` | `/constitution/` | The principles / philosophy (Nadia arc). | `constitution` | `breadcrumb` |
| `circle` | `/circle/` | Roxabi Circle — gated Discord (Guild layer). | `circle` | `breadcrumb` |
| `projects` | `/projects/` | Portfolio listing of open-source primitives (hand-authored card grid). | `projects` | `breadcrumb` |
| `proj-*` | `/projects/<name>/` | Per-project detail pages (`roxabi-plugins`, `voicecli`). | `proj-<name>` | `breadcrumb` or `breadcrumb+software` |
| `documentation` | `/documentation/` | Docs hub — derived index of all doc-collection pages, tag-filtered. | `documentation` | `breadcrumb` |
| `legal` | `/legal/` | Legal notice / mentions légales. | `legal` | `breadcrumb` |
| `doc-*` | `/documentation/<slug>/` | Individual documentation articles (the collection). | `doc-<slug>` | `techarticle` |

Documentation collection today: 8 articles (EN+FR) across 3 tags — **Cortex** (6), **Audit** (1), **REX** (1). Reading/grouping order = manifest order in `site.toml`.

Parked products keep their old URLs alive via `static/_redirects` (e.g. `/projects/lyra/` → `/projects/` 301). Lyra was parked 2026-06-01; repo renamed → `roxabi-factory`.

## Commands

| Command | Purpose |
|---|---|
| `python3 src/build.py` | Build static site → `dist/` (Python 3.11+, stdlib only) |
| `make build` | Same as above |
| `make serve` | Build + start local preview on `http://localhost:8000` |
| `make deploy` | Build + push to Cloudflare Pages (refuses dirty tree; needs `.env` with `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`) |
| `make clean` | Remove `dist/` |

`ROXABI_DIST=/tmp/foo python3 src/build.py` builds into an isolated dir (used for parallel visual QA — see memory).

**Ship = `git push`.** Cloudflare Pages auto-deploys staging + main on push — `make deploy` is redundant (re-uploads identical content). Don't run it unless explicitly asked.

Deploy one-time bootstrap: `npx wrangler login` once, then `npx wrangler pages project create roxabi-site --production-branch=main` (or dashboard). After that, only `.env` token needed.

## Architecture

**Zero-dependency Python SSG** (~200 lines). All SEO is **derived** from `(path, lang)` — never hand-written per page. See `docs/architecture/adr/0002-mini-build.md`.

**Build flow:**
1. `src/site.toml` — manifest. Single source of truth for per-page SEO text (title, description, OG, breadcrumb labels) + chrome strings (nav, footer) per language.
2. `src/templates/page.html` — shell with `{{key}}` slots.
3. `src/partials/` — `nav.html`, `footer_full.html`, `footer_min.html` — chrome edited once.
4. `src/bodies/{en,fr}/` — hand-authored `<main>` per page.
5. `build.py` resolves `{{key}}` via simple string replacement, generates `sitemap.xml`, JSON-LD structured data, and writes `dist/` tree.

**SEO derivation:** canonical, `hreflang`, `og:url`, `og:locale`, breadcrumbs, sitemap entries — all generated from the `site.toml` page list. Adding a page = one `[[page]]` block + two body files (EN/FR) + rebuild.

**Paths:** `path` in `site.toml` is lang-agnostic and prefix-free. Directory-style paths (`projects/lyra/`) generate `index.html` in that directory, matching Cloudflare Pages clean-URL serving. Internal links must use the same dir-style form to avoid 308 redirects.

**Section anchors:** body sections authored with `id="sec-N"` are auto-rewritten to readable slugs derived from each `<h2>` (e.g. `#sec-2` → `#why-exocortex`), and their TOC `#sec-N` hrefs updated to match. Pages already using slug ids (e.g. the Constitution) are untouched. The skip-link target `id="main"` is injected onto the first `<main>` automatically.

**Documentation collection (tag-organized):** a `[[page]]` with `collection = "documentation"` **and** a non-empty `tags = [...]` is a doc article. From these, `build.py` derives — on the `documentation` index — the card grid (`{{doc_cards}}`), the tag-filter bar (`{{doc_filter}}`, hidden until JS reveals it; suppressed when <2 tags), and the count (`{{doc_count}}`). On each article it derives the hero tag chips (`{{doc_tags}}`) and appends a footer nav (the doc's tags + a back-to-index link) before `</main>`. Tags are the only organizing axis — there is no linear prev/next.

**Shaders / hero backgrounds:** a page's `shader` field names a vendored module in `assets/vendor/<id>.js` (e.g. `kinetic-grid`); the build emits `<script src="/assets/vendor/<id>.js">` before `app.js`, and the module auto-inits `#hero-bg` in dark mode only. `shader = false` → no shader; `shader = true` → back-compat alias for `aurora-curtain`. New shaders are generated/ported via `lab/heroes-v2/gen.py` (see memory `roxabi-site-shader-backgrounds`).

**Assets & static:** `assets/` (CSS, JS, logo, icons, OG images, vendored shaders, fonts) and `static/` (`robots.txt`, `site.webmanifest`, `_redirects`) are copied verbatim into `dist/`.

## Where things live

| Path | What |
|---|---|
| `src/site.toml` | Manifest — per-page SEO text (EN/FR) + chrome strings. **Single source of truth.** |
| `src/templates/page.html` | Page shell (head + `{{slots}}`). |
| `src/partials/` | `nav.html`, `footer_full.html`, `footer_min.html` — edit chrome **once**. |
| `src/bodies/{en,fr}/` | Hand-authored `<main>` per page. Prose lives here. |
| `assets/` | CSS (`tokens.css`, `fonts.css`, `styles.css`), `js/app.js`, `vendor/*.js` shaders, logo, icons, OG, fonts. |
| `static/` | `robots.txt`, `site.webmanifest`, `_redirects` (parked-URL 301s). |
| `dist/` | **Generated.** Git-ignored. Cloudflare Pages publish dir. |
| `docs/architecture/` | ADRs + information architecture. |
| `docs/authoring/` | How-to guides for adding pages (see below). |
| `lab/` | Design explorations — hero shaders, docs-component showcase. Not shipped. |

## Authoring pages

Adding any page = one `[[page]]` block in `src/site.toml` + EN & FR body files in `src/bodies/{en,fr}/` (each a bare `<main>…</main>`) + `python3 src/build.py`. SEO, breadcrumbs, sitemap, cross-linking are all derived.

Step-by-step reference guides:
- **New documentation article** → `docs/authoring/new-doc-page.md`
- **New project (portfolio card or detail page)** → `docs/authoring/new-project-page.md`
