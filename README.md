# roxabi-site

Marketing + portfolio site for [Roxabi](https://roxabi.dev). Static, bilingual
(EN at `/`, FR at `/fr/`), no runtime framework.

## Build

A ~200-line zero-dependency Python generator dedupes the shared chrome (head,
nav, footer) and **derives** all SEO (canonical, `hreflang`, `og:*`,
breadcrumbs, sitemap) from `(path, lang)`. See [ADR-0002](docs/architecture/adr/0002-mini-build.md).

```sh
python3 src/build.py        # → dist/   (Python 3.11+, stdlib only)
```

Preview locally:

```sh
python3 -m http.server -d dist 8000   # http://localhost:8000
```

## Where things live

| Path | What |
|------|------|
| `src/site.toml` | Manifest — per-page SEO text (EN/FR) + chrome strings. **Single source of truth.** |
| `src/templates/page.html` | Page shell (head + slots). |
| `src/partials/` | `nav.html`, `footer_full.html`, `footer_min.html` — edit chrome **once**. |
| `src/bodies/{en,fr}/` | Hand-authored `<main>` per page. Prose lives here. |
| `assets/` | CSS, JS, logo, icons, OG images, vendored shader. Copied verbatim. |
| `static/` | `robots.txt`, `site.webmanifest`. Copied verbatim. |
| `dist/` | **Generated.** Git-ignored. Cloudflare Pages publish dir. |

`sitemap.xml` is generated from the page list — never hand-edited.

## Add a page

1. Add a `[[page]]` block to `src/site.toml` (path, og_type, footer, EN+FR text).
2. Drop `src/bodies/en/<body>.html` and `src/bodies/fr/<body>.html` (`<main>…</main>`).
3. `python3 src/build.py`. Canonical, hreflang, OG, breadcrumb, sitemap entry — all derived.

## Deploy (Cloudflare Pages)

**Production = `main`.** Feature work lands via PR into `main`; there is no
staging branch. Cloudflare Pages builds on push (production branch: `main` →
[roxabi.dev](https://roxabi.dev)).

Cloudflare-side build:
- Build command: `python3 src/build.py`
- Output directory: `dist`
- Python 3.11+ (for `tomllib`)

**Or push from local** (token-auth — no interactive login at deploy time):

```sh
cp .env.example.cloudflare .env     # fill CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN
make deploy                         # build + wrangler pages deploy dist (refuses a dirty tree)
```

One-time bootstrap: `npx wrangler login` once, then
`npx wrangler pages project create roxabi-site --production-branch=main` (or the
dashboard). After that, deploys only need the `.env` token.

`make build` / `make serve` / `make clean` also available.
