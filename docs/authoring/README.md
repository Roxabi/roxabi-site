# Authoring guides

Step-by-step references for adding content to `roxabi-site`. Background on the
build itself: `../../CLAUDE.md` and `../architecture/adr/0002-mini-build.md`.

| Guide | When |
|---|---|
| [new-doc-page.md](new-doc-page.md) | Add a documentation article under `/documentation/<slug>/` (collection + tags). |
| [new-project-page.md](new-project-page.md) | Add a project — portfolio card (default) or a dedicated `/projects/<name>/` page. |

Common to all pages: one `[[page]]` block in `src/site.toml` + EN & FR body files
(`src/bodies/{en,fr}/`, each a bare `<main>…</main>`) + `python3 src/build.py`.
SEO, breadcrumbs, sitemap, and cross-linking are derived — never hand-written.
