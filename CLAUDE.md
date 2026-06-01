@.claude/stack.yml

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`roxabi-site` — static bilingual marketing site for Roxabi. EN at `/`, FR at `/fr/`. No runtime framework.

## Commands

| Command | Purpose |
|---|---|
| `python3 src/build.py` | Build static site → `dist/` (Python 3.11+, stdlib only) |
| `make build` | Same as above |
| `make serve` | Build + start local preview on `http://localhost:8000` |
| `make deploy` | Build + push to Cloudflare Pages (refuses dirty tree; needs `.env` with `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`) |
| `make clean` | Remove `dist/` |

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

**Assets & static:** `assets/` (CSS, JS, logo, icons, OG images, vendored shader) and `static/` (`robots.txt`, `site.webmanifest`) are copied verbatim into `dist/`.

## Adding a page

1. Add `[[page]]` to `src/site.toml` with `path`, `og_type`, `footer`, `active`, `jsonld`, `ancestors`, EN+FR text.
2. Create `src/bodies/en/<body>.html` and `src/bodies/fr/<body>.html` (must contain `<main>…</main>`).
3. Run `python3 src/build.py`. All SEO and cross-linking derived automatically.
