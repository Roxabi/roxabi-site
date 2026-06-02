# Adding a project

There are two levels, pick by intent:

- **A — Portfolio card** (default). Add the project to the `/projects/` listing.
  No manifest change, no new URL. This is the current pattern — the portfolio is a
  hand-authored card grid, not a derived collection.
- **B — Dedicated project page** (`/projects/<name>/`). A standalone detail page with
  its own URL, breadcrumbs, and `SoftwareSourceCode` JSON-LD. Use only when a project
  earns a full page; link the portfolio card to it.

Live Path-B examples to copy from:
- **`proj-roxabi-plugins`** (`/projects/roxabi-plugins/`) — uses plain `jsonld = "breadcrumb"`. Pick this when the project is not best described as a single software package (a marketplace, a methodology).
- **`proj-voicecli`** (`/projects/voicecli/`) — uses `jsonld = "breadcrumb+software"`, emitting `SoftwareSourceCode` structured data. Pick this for a forkable CLI/library/app.

> History: a `/projects/lyra/` page existed before Lyra was parked 2026-06-01
> (`static/_redirects` 301s `/projects/lyra/` → `/projects/`). Its `jsonld_software`
> builder was Lyra-specific; it is now generalized (see B.0).

---

## A — Add a portfolio card (no new page)

The listing body is hand-authored in **both** languages:
`src/bodies/en/projects.html` and `src/bodies/fr/projects.html`. Add a `<a class="card proj-card">`
to the `.grid.grid-2` in each. Match the existing markup:

```html
<a class="card proj-card" href="https://github.com/Roxabi/<repo>" rel="noopener" data-reveal>
  <div class="top"><h3><repo></h3><span class="tag">In construction</span></div>
  <p>One-line job-to-be-done. Self-hostable, fork what you need.</p>
  <p class="portfolio-note" style="margin-top:var(--s-md)">View on GitHub <span class="arrow">→</span></p>
</a>
```

Notes:
- `data-reveal` opts the card into the staggered fade-up (handled by `app.js`).
- For a not-yet-open project, add it to the `roadmap-list` card instead (see the
  "On the way" card in the body) rather than linking a dead repo.
- Edit **both** `en` and `fr` files — translate the blurb and the status tag.
- `href` to a project's own page (Path B) must be dir-style: `/projects/<name>/`.

Then `python3 src/build.py` and check `/projects/` + `/fr/projects/`.

---

## B — Add a dedicated project page

### B.0 — The `breadcrumb+software` builder (already generalized)

`jsonld_software` in `src/build.py` reads `name`, `codeRepository`, and
`programmingLanguage` **from the page** (with defaults) — no per-project patch needed:

```python
# src/build.py — jsonld_software()
"name":                p.get("software_name", org_name),   # ← page field
"description":         p[lang]["software_desc"],            # ← per-lang, required
"codeRepository":      p.get("repo", github),               # ← page field; defaults to org root
"programmingLanguage": p.get("language", "Python"),         # ← page field; defaults to Python
"license":             "https://opensource.org/license/agpl-v3",  # fixed (AGPL portfolio-wide)
```

So a `breadcrumb+software` page supplies `software_name`, `repo`, an optional
`language` (defaults to `Python`), and a per-language `software_desc`. If you ever ship
a non-AGPL project, the `license` is the one value still hard-coded — generalize it then.

### B.1 — Add the `[[page]]` block to `src/site.toml`

```toml
[[page]]
id          = "<name>"
path        = "projects/<name>/"            # dir-style → <name>/index.html
body        = "proj-<name>"                  # → src/bodies/{en,fr}/proj-<name>.html
og_type     = "website"                      # or "article"
footer      = "full"
shader      = false
active      = "projects"                     # highlights the "Projects" nav item
jsonld      = "breadcrumb+software"          # breadcrumb + SoftwareSourceCode
ancestors   = ["home", "projects"]
changefreq  = "monthly"
priority    = "0.6"
software_name = "<DisplayName>"              # consumed by the generalized builder (B.0)
repo          = "https://github.com/Roxabi/<repo>"
  [page.en]
  title         = "<Name> — Roxabi"
  desc          = "<≤160-char meta description>"
  og_title      = "<Name> — Roxabi"
  og_desc       = "<social-share description>"
  crumb         = "<short breadcrumb label>"
  software_desc = "<one-line description for SoftwareSourceCode JSON-LD>"
  [page.fr]
  title         = "<Nom> — Roxabi"
  desc          = "<description meta ≤160 car.>"
  og_title      = "<Nom> — Roxabi"
  og_desc       = "<description de partage>"
  crumb         = "<libellé fil d'ariane>"
  software_desc = "<description une ligne pour le JSON-LD>"
```

### B.2 — Create the two body files

`src/bodies/en/proj-<name>.html` and `src/bodies/fr/proj-<name>.html`, each a bare
`<main>…</main>`. Reuse the `.doc-hero` + `.wrap` + `.card` / `.feature-list` vocabulary
already in `projects.html` and the doc bodies. Keep both languages structurally identical.

```html
<main>
<section class="doc-hero">
  <div class="wrap">
    <p class="section-label">Project</p>
    <h1><Name></h1>
    <p class="lead prose" style="margin:var(--s-md) auto 0">What it does, in one sentence.</p>
  </div>
</section>
<section>
  <div class="wrap prose">
    <p>…</p>
    <p><a href="https://github.com/Roxabi/<repo>" rel="noopener">View on GitHub →</a></p>
  </div>
</section>
</main>
```

### B.3 — Link the portfolio card to it

In `src/bodies/{en,fr}/projects.html`, point the project's card `href` at the new
dir-style URL instead of GitHub: `href="/projects/<name>/"` (EN) — the build does not
auto-prefix `/fr/` inside hand-authored bodies, so for the FR card use the relative
`projects/<name>/` from `/fr/projects/`, i.e. write `href="../<name>/"`, **or** keep
the card linking to GitHub and let the detail page carry the GitHub link. Verify the
language toggle still lands on the right alternate.

### B.4 — Build and verify

```sh
python3 src/build.py
make serve   # → http://localhost:8000/projects/<name>/
```

Check: page renders EN + FR, breadcrumbs correct, `SoftwareSourceCode` JSON-LD shows
the right `name`/`codeRepository` (view source), both URLs in `dist/sitemap.xml`,
portfolio card links through.

### B.5 — If you ever park it

Add 301s to `static/_redirects` (EN + FR, with and without trailing slash) the same
way Lyra was parked, then remove the `[[page]]` block and body files.

---

## Checklist

Path A:
- [ ] Card added to **both** `src/bodies/{en,fr}/projects.html`
- [ ] Status tag + blurb translated; `data-reveal` present
- [ ] `python3 src/build.py`; `/projects/` + `/fr/projects/` verified

Path B:
- [ ] Chose `jsonld`: `"breadcrumb"` (general) or `"breadcrumb+software"` (forkable software, B.0)
- [ ] For `breadcrumb+software`: `software_name`, `repo`, `software_desc` (EN+FR) in the block
- [ ] `[[page]]` block with the chosen `jsonld`, `active = "projects"`
- [ ] `ancestors = ["home", "projects"]`
- [ ] `src/bodies/{en,fr}/proj-<name>.html` created (bare `<main>`)
- [ ] Portfolio card links to `/projects/<name>/`
- [ ] Build clean; JSON-LD, breadcrumbs, sitemap, both languages verified
- [ ] Bump `lastmod` in `src/site.toml` for a content release
