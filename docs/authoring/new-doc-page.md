# Adding a documentation article

How to add a new page to the **documentation collection** (`/documentation/<slug>/`).
A doc article is any `[[page]]` carrying `collection = "documentation"` **and** a
non-empty `tags = [...]`. From those two flags the build derives the index card,
the tag-filter bar, the hero tag chips, and the per-article footer nav — you never
hand-write that wiring.

Result of doing this right: the article appears on `/documentation/`, in the
sitemap, with correct breadcrumbs, `hreflang`, OG/Twitter tags, and `TechArticle`
JSON-LD — in both languages — with zero per-page SEO copy-paste.

## 1. Add the `[[page]]` block to `src/site.toml`

Append it in the documentation section (the order in the file = the reading and
tag-grouping order on the index). Copy an existing doc block — e.g. `doc-exocortex`
— and change the values:

```toml
[[page]]
id          = "doc-<slug>"                  # unique; referenced by other pages' ancestors
path        = "documentation/<slug>/"       # dir-style → builds <slug>/index.html
body        = "doc-<slug>"                   # → src/bodies/{en,fr}/doc-<slug>.html
og_type     = "article"
footer      = "full"
shader      = false
active      = "docs"                         # highlights the "Docs" nav item
jsonld      = "techarticle"                  # breadcrumb + TechArticle structured data
collection  = "documentation"               # REQUIRED — marks it as a doc article
tags        = ["Cortex"]                     # REQUIRED — organizing axis; 1+ tags
ancestors   = ["home", "documentation"]      # drives breadcrumbs (page ids)
changefreq  = "monthly"
priority    = "0.6"
  [page.en]
  title      = "<Title> — Roxabi"            # <title> + og:title source
  desc       = "<≤160-char meta description>"
  og_title   = "<Title> — Roxabi"
  og_desc    = "<social-share description>"
  crumb      = "<short breadcrumb label>"
  card_title = "<title shown on the index card>"
  card_desc  = "<1–2 sentence card blurb>"
  [page.fr]
  title      = "<Titre> — Roxabi"
  desc       = "<description meta ≤160 car.>"
  og_title   = "<Titre> — Roxabi"
  og_desc    = "<description de partage>"
  crumb      = "<libellé fil d'ariane>"
  card_title = "<titre de la carte>"
  card_desc  = "<accroche 1–2 phrases>"
```

### Field notes

| Field | Why it matters |
|---|---|
| `id` | Must be unique. Used by `ancestors` and breadcrumb derivation. |
| `path` | Keep the trailing `/` (dir-style) so links never hit a 308 redirect. |
| `tags` | The index groups & filters by tag. New tag value → it just appears; the filter bar shows automatically once ≥2 distinct tags exist across all docs. Tag text is title-case (`"Cortex"`); the slug is derived (`cortex`). |
| `crumb` | Short — it's the last breadcrumb segment, not the page title. |
| `card_title` / `card_desc` | **Doc-only fields.** Drive the index card. Distinct from `title`/`desc` (which are SEO). Keep `card_desc` tight. |
| `jsonld = "techarticle"` | Emits BreadcrumbList + TechArticle that declares the article `isPartOf` the "Roxabi Documentation" series. Don't change it for a doc. |

## 2. Create the two body files

`src/bodies/en/doc-<slug>.html` and `src/bodies/fr/doc-<slug>.html`. Each is a bare
`<main>…</main>` fragment — no `<html>`, `<head>`, nav, or footer (those come from
the shell). Follow the established doc layout:

```html
<main>
<section class="doc-hero">
  <div class="wrap">
    <p class="section-label">SHORT EYEBROW</p>
    <h1>Article Title</h1>
    <p class="lead prose" style="margin:var(--s-md) auto 0">One-sentence lead.</p>
    <div class="doc-hero-tags">{{doc_tags}}</div>   <!-- derived hero tag chips -->
  </div>
</section>

<section>
  <div class="wrap constitution">
    <nav class="toc" aria-label="Sections">
      <span class="t">Sections</span>
      <a href="#sec-1">1 — First section</a>
      <a href="#sec-2">2 — Second section</a>
    </nav>

    <div class="const-body prose">
      <div class="titre" id="sec-1">
        <span class="label">01</span>
        <h2>First section</h2>
        <p>…</p>
        <div class="callout"><p>Pull-quote / key takeaway.</p></div>
      </div>

      <div class="titre" id="sec-2">
        <span class="label">02</span>
        <h2>Second section</h2>
        <ul class="feature-list"><li><strong>Term.</strong> Explanation.</li></ul>
      </div>
    </div>
  </div>
</section>
</main>
```

### What the build does to the body automatically

- **`{{doc_tags}}`** → renders this article's tag chips (links to the filtered index). Put it in the hero.
- **Section anchors** → `id="sec-N"` and their TOC `href="#sec-N"` are rewritten to readable slugs from each `<h2>` (`#sec-2` → `#first-section`). Author with `sec-N`; let the build slugify. (If you prefer, author final slug ids directly — the rewrite is a no-op then.)
- **Footer nav** → because the page is `collection = "documentation"` with `tags`, the build appends a `<nav class="doc-nav">` (this doc's tags + an "All documentation →" link) right before `</main>`. Do **not** hand-write it.
- **`id="main"`** is injected onto the first `<main>` for the skip-link.

### Reusable content components

Available classes (see the live showcase `lab/docs-components.html`, generated by
`lab/gen_docs_components.py`): `.callout`, `.feature-list`, `.formula-box`
(`<pre><code>`), `.doc-figure` + `<figcaption>` (inline SVG diagrams use
`var(--accent)`, `var(--panel)`, `var(--text-muted)` etc. so they theme correctly),
inline `<code>`. Code surfaces are **always dark**, both themes. Accent is amber-only.

Keep both language files structurally identical (same section ids, same SVG) —
only the prose differs.

## 3. Build and verify

```sh
python3 src/build.py
make serve   # → http://localhost:8000/documentation/
```

Check:
- The new card shows on `/documentation/` (and `/fr/documentation/`) with its tag chip.
- The tag-filter bar filters it correctly.
- The article renders at `/documentation/<slug>/`, hero chips present, footer nav present.
- TOC links jump to the slugified anchors.
- `dist/sitemap.xml` contains both the EN and FR URLs.

## Checklist

- [ ] `[[page]]` added with `collection = "documentation"` **and** `tags`
- [ ] `id`, `path`, `body` consistent (`doc-<slug>`)
- [ ] `ancestors = ["home", "documentation"]`
- [ ] EN + FR text incl. `card_title` / `card_desc`
- [ ] `src/bodies/en/doc-<slug>.html` + `src/bodies/fr/doc-<slug>.html` created
- [ ] `{{doc_tags}}` in the hero of both bodies
- [ ] No hand-written footer nav (the build adds it)
- [ ] `python3 src/build.py` clean; card + article verified in both languages
- [ ] Bump `lastmod` in `src/site.toml` if this is a content release
