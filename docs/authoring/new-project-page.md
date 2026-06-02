# Adding a project

There are two levels, pick by intent:

- **A — Portfolio card** (default). Add the project to the `/projects/` listing.
  No manifest change, no new URL. This is the current pattern — the portfolio is a
  hand-authored card grid, not a derived collection.
- **B — Dedicated project page** (`/projects/<name>/`). A standalone detail page with
  its own URL, breadcrumbs, and `SoftwareSourceCode` JSON-LD. Use only when a project
  earns a full page; link the portfolio card to it.

> History: a per-project page existed at `/projects/lyra/` (jsonld `breadcrumb+software`).
> It was parked 2026-06-01 (`static/_redirects` 301s `/projects/lyra/` → `/projects/`).
> Path B below describes recreating that pattern — and the one build tweak it needs.

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

### B.0 — One-time build change (currently Lyra-specific)

The `breadcrumb+software` JSON-LD builder is hard-coded to Lyra. Before reusing it
for a different project, generalize it in `src/build.py`:

```python
# src/build.py — jsonld_software(): make name + repo come from the page, not hard-coded.
def jsonld_software(base, org_name, github, lang, p) -> str:
    return ld({
        "@context": "https://schema.org", "@type": "SoftwareSourceCode",
        "name": p.get("software_name", "Lyra"),          # was: "Lyra"
        "description": p[lang]["software_desc"],
        "codeRepository": p.get("repo", github),          # was: github (org root)
        "programmingLanguage": "Python",
        "license": "https://opensource.org/license/agpl-v3",
        "author": {"@type": "Organization", "name": org_name, "url": f"{base}/"},
    })
```

Then the page block supplies `software_name`, `repo`, and a per-language `software_desc`.
(If you skip this, the structured data will say "Lyra" — wrong for any other project.)

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
- [ ] `jsonld_software` generalized in `build.py` (B.0) if name ≠ Lyra
- [ ] `[[page]]` block with `jsonld = "breadcrumb+software"`, `software_name`, `repo`, `software_desc` (EN+FR)
- [ ] `ancestors = ["home", "projects"]`
- [ ] `src/bodies/{en,fr}/proj-<name>.html` created (bare `<main>`)
- [ ] Portfolio card links to `/projects/<name>/`
- [ ] Build clean; JSON-LD, breadcrumbs, sitemap, both languages verified
- [ ] Bump `lastmod` in `src/site.toml` for a content release
