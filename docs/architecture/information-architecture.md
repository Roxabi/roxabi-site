# Information Architecture — roxabi.dev

Derived from Brand Book v1.9 (`brand/BRAND-BOOK.md`).
Status: **as-built** — last reconciled 2026-06-25 (sitemap grew beyond initial 8-page proposal).

## Principle

Two audiences, two arcs (Brand Book §5):

- **Marco (Multiplier, P1)** → output-first. Owns the **landing + CTAs**. Wants
  to see the foundation before the philosophy.
- **Nadia (Autonomy Seeker, P2)** → sovereignty as survival. Owns **`/constitution/`**
  (not a separate About page). Philosophy lives here, never in the hero.

> When in doubt, write for Marco. CTAs belong to Marco. Philosophy belongs on the Constitution.

## Sitemap (as built)

Bilingual by URL — **`/*` = EN, `/fr/*` = FR** (SEO-correct: distinct indexable
URLs + reciprocal `hreflang`). Each EN page has a 1:1 FR mirror. Trailing-slash
dir URLs (e.g. `/constitution/`, `/projects/`).

**Core pages (initial launch):**

```
EN                              FR                                 page
/                               /fr/                               Home (landing) — Marco arc
/constitution/                  /fr/constitution/                  Constitution — Nadia arc
/projects/                      /fr/projects/                      Portfolio listing
/projects/<slug>/               /fr/projects/<slug>/              Per-project pages
/documentation/                 /fr/documentation/                 Docs index + tagged articles
/legal/                         /fr/legal/                         Legal notice
```

Lyra product page retired (v1.8) — `/projects/lyra/` 301→`/projects/`. Page count
grew past the initial 8-page proposal; **[ADR-0002](adr/0002-mini-build.md)** Python
generator (`src/build.py`) renders both trees from `src/site.toml` + templates +
`src/bodies/{en,fr}/`. SEO (canonical, hreflang, og, breadcrumbs, sitemap) is
**derived from `(path, lang)`**. See `README.md` and `src/site.toml` for the full manifest.

Site-level SEO files: `/sitemap.xml` (all 8 URLs + `xhtml:link` alternates),
`/robots.txt`, `/site.webmanifest`, `/assets/og/roxabi-og{,-fr}.png` (1200×630),
`/assets/icons/*` (32/180/192/512 + apple-touch).

### Language switching
URL-based, not JS. The nav `lang-toggle` is an `<a hreflang>` pointing at the
current page's alternate; it shows the **current** language (EN/FR) like the theme
toggle shows the current theme. Old client-side `data-i18n` engine removed from
`app.js`. With JS off, each page is fully rendered in its own language.

### Per-page SEO (every page)
`<title>` · `<meta description>` · `<link canonical>` · `hreflang` {en, fr, x-default}
· `meta robots` · Open Graph (type/site_name/locale/url/title/description/image 1200×630)
· Twitter `summary_large_image` · JSON-LD (Organization+WebSite on home,
BreadcrumbList on inner pages, SoftwareSourceCode on project pages) · theme-color
· SVG + PNG favicons + apple-touch + manifest.

**Canonical base:** `https://roxabi.dev` (assumed — single find/replace to change).

## Page-by-page

### `/` — Home (landing)
Owner persona: **Marco**. Register: sharp, declarative, 8-second read.

**Decision (2026-06-01):** standard OSS-infra landing pattern (survey of 17 sites:
Bun, Deno, Trigger.dev, Inngest, tRPC, Neon, Prisma…). NOT the elaborate
`roxabi-landing.html` prototype (parked — explore later). 8 sections, single
static file.

| # | Section | Content | Source |
|---|---|---|---|
| 1 | Nav (sticky) | logo · Docs · GitHub ★count · `Get started` button (amber) | survey |
| 2 | **Hero** | badge `AGPL-3.0 · Open by architecture` · H1 **"One person. Team-scale output."** · sub **"Pre-wired. Open. Yours."** · lead **"A factory for the AI era…"** (locked §1) · dual CTA · `kinetic-grid` shader bg | BRAND-BOOK §1 hero table |
| 3 | Install | "Start in 30s" — one copyable command | survey (Bun/Deno) |
| 4 | Social proof | used-by logos OR 3 stat-cards (★ stars · AGPL · community) | survey |
| 5 | Pillars | **the 4 brand pillars** — Operating Layer · Open by Architecture · Compounding Foundations · Built for Builders. Do NOT invent generic pillars. | Pillars §5 |
| 6 | How it works | 2-3 steps, code-first (define primitive → wire agent → deploy) | survey (tRPC/Inngest) |
| 7 | Open by design | OSS trust: stat-cards + "Read the source →" + optional quote | survey (Trigger.dev) |
| 8 | Final CTA | repeat Marco CTA "Get the foundations…" + install command | Marco CTA §5 |
| — | Footer | wordmark · AGPL-3.0 · Docs/GitHub/Discord · ★ · "No telemetry. No lock-in." | survey |

**Excluded at launch (premature maturity signals):** pricing, comparison table, blog/changelog preview.

**Animation budget (restrained — "the mark builds/arrives, doesn't sweep/cut"):**
- Hero background: `fluid-amber.html` shader from **radiant** (pbakaus, MIT),
  inlined ~8 KB, `opacity: 0.18` + vignette. Degrades to flat `#0d1117` with JS off,
  and is hidden in light mode (replaced by a warm amber radial from the right).
  **Fragment must declare `highp`** (`#ifdef GL_FRAGMENT_PRECISION_HIGH`): under
  `mediump` the domain-warped fbm overflows to Inf/NaN → all-black on some drivers
  (verified via `shader-debug.html`). Shader only inits in dark mode.
- Reveal idioms (authored CSS, 0 KB dep): stagger fade-up on `IntersectionObserver`,
  hero typewriter, SVG path draw-on. Idiom reference only from **AI_Animation**
  (Unclecheng-li) — **do not copy its demos** (license README says no-commercial,
  conflicts with its MIT LICENSE → avoid the content; reuse only the technique).

### `/projects` — The primitives
Owner: **Jordan/Priya** (assembler/commons). The portfolio *is* the
"compounding" proof — show real primitives that build on each other.

- Card per primitive: name, one-line JTBD, "standalone + composes with X", GitHub link, license badge.
- Candidates: roxabi-factory, voiceCLI, llmCLI, imageCLI, roxabi-forge,
  roxabi-plugins, roxabi-boilerplate… (curate — lead with the strongest; Lyra parked).
- Optional: a small dependency-graph visual (compounding made visible).

### `/constitution/` — Philosophy / open by architecture
Owner: **Nadia**. Register: deeper, sovereignty-first.

| Section | Content |
|---|---|
| Why open by architecture | "Open by design, not by badge." Forkable, self-host, no telemetry, no feature gates |
| Nadia's arc | Every closed system is a future tax → the escape hatch is the default |
| Who it's for / not for | Solo devs & small teams; **not** enterprises with platform teams (Rule 05, direct about scope) |
| The compounding thread | Structural mechanism, not community metaphor |

### `/docs` — (external for now)
Functional, peer-level, no preamble. At launch: **link out** to per-repo READMEs
+ Fumadocs sites where they exist. A hosted docs hub is a later decision (would
trigger an ADR-0001 revisit if it needs a generator).

## Global chrome

- **Nav**: Roxabi (logo → `/`) · Projects · Constitution · Docs · GitHub (icon, right).
- **Footer**: GitHub · AGPL-3.0 License · Mentions légales · (portfolio note: Lyra is
  a sibling project, shared amber family).
- **Theme**: dark is the marketing default (`#0d1117`). Light mode authorized for
  **docs only**, never marketing (DESIGN.md).
- **Code blocks**: always dark terminal regardless of page mode (Brand Book §6).

## Voice guardrails (apply to every line of copy)

Banned: seamless, powerful, robust, leverage, unlock, platform, empower,
seamlessly integrate, AI-native, magic, scale (as noun). Full list: Brand Book §4.
One idea per sentence in hero + headings. If a word can be cut, cut it.

## Open / deferred
- **Logo** — **LOCKED 2026-06-01: concept #17 "Foundation Block — Amber Core"**
  (isometric cube, slate faces, amber edges, glowing amber core).
  SVG at `assets/logo/foundation-block.svg` (+ `-16.svg` favicon variant).
  First SVG draft reads too wireframe → needs a refinement pass to match the
  solid-block character of the canonical logo `brand/logo/foundation-block.svg`
  (concept render archived at `~/.roxabi/roxabi-site/concept/17-foundation-block-amber-core.png`).
- **Domain** — ✅ **`roxabi.dev` live** (Cloudflare Pages, 2026-06-02). Apex only — `www` redirect not set (low-priority, deferred).
- **Docs hosting** — external links at launch; hub = later ADR.
