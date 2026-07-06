---
id: ADR-0003
title: Brand deliverables live in the repo; exploration is archived out by category
status: accepted
date: 2026-06-03
deciders: [Mickael]
---

# ADR-0003 — Brand deliverables → repo (git SSoT); exploration → `~/.roxabi/roxabi-site/`

## Status

**accepted** — 2026-06-03.

## Context

The Roxabi brand canon was authored in the forge data dir
`~/.roxabi/forge/roxabi-site/brand/` and this repo only *cited* it (ADR-0001,
`information-architecture.md` pointed at absolute `~/.roxabi/forge/...` paths).
That survived on inertia, not decision: the personal brand (`bouly-site`) was
moved into a repo because it held **sensitive data**; the Roxabi canon had no
such forcing function and was left in the forge — the *least* protected home
(git-less, hand-editable, no review history) for the *most* important brand.

A content scan confirmed the canon carries **no sensitive data** (only narrative
content *about* SaaS pricing). But the forge tree mixed three very different
things at ~25 MB:

- **Deliverables** — the canon docs + the *decided* logo. Small, durable, final.
- **Concept R&D** — 85 logo-concept renders (`concepts/`), gen prompts, concept
  galleries. The logo decision (Foundation Block, concept #17 → v1.6) is made;
  the rest is superseded exploration.
- **A parked avatar direction** — a fox mascot (gif + 3 mp4 + chibi stills),
  **22 MB and 88 % of the weight**, that the BRAND-BOOK never adopts (no mascot
  in canon) and that no HTML even referenced.

Vendoring all 25 MB into the lean public repo would publish dead R&D and bloat
the tree. Leaving it in the forge keeps canon git-less. Neither is right.

## Decision

**Sort by deliverable-vs-exploration. The repo holds only final deliverables;
everything exploratory is archived out of the forge into a categorized data dir.**

### Goes in `roxabi-site/brand/` (git — the SSoT, public)

| File | Why it is a deliverable |
|---|---|
| `BRAND-BOOK.md` | The canon — authoritative single source of truth (v1.9). |
| `DESIGN.md` | Design tokens (implemented as `assets/css/tokens.css`). |
| `V1.5-MIGRATION-LOG.md` | Canon changelog companion, cited by BRAND-BOOK §9. |
| `logo/foundation-block.svg`, `logo/foundation-block-16.svg` | The **decided** logo (v1.6, live on the site). |
| `visuals/brand-recap.*` | Finished recap companion of the canon. |

### Goes in `~/.roxabi/roxabi-site/<category>/` (archive — out of git, out of the forge)

| Category | Contents | Size |
|---|---|---|
| `avatar/` | Fox-mascot studies (gif/mp4/stills) + `avatar-gallery.html` | ~22 MB |
| `concept/` | 85 logo-concept renders (png/svg), `prompts/`, `concepts-gallery.html`, `logo-explore.html`, `hero-schema-proposals.html` | ~2 MB |
| `exploration/` | Phase HTML docs: positioning, personas (×2), messaging (×2), visual-directions (×4), direction-d (×2), landing, logo, brand-system, profile-README draft | ~1 MB |

Rules:

- **Git keeps only final deliverables.** Exploration, concept renders, parked
  avatar studies, and drafts are *reference*, not canon → archived, not versioned.
- **Archive root is `~/.roxabi/roxabi-site/`** — a plain data dir, **not** the
  forge (`~/.roxabi/forge/`). It is durable scratch/reference, not a served surface.
- **Presentation HTMLs are made self-contained.** The forge galleries fetched a
  live `/api/list` endpoint; moved out, they are rewritten to a **static file
  list** with co-located relative `src`, so they render by double-click via
  `file://` with no server. A new `avatar-gallery.html` (video-aware) was created
  — none existed.
- **The forge still renders deliverables.** `~/.roxabi/forge/roxabi-site/brand`
  is an absolute symlink → `~/projects/roxabi-site/brand`, so the forge serves the
  in-repo deliverables unchanged.
- **In-repo references are repo-relative** (`brand/BRAND-BOOK.md`, …). References
  to archived files point at the `~/.roxabi/roxabi-site/<cat>/` path.

This mirrors `bouly-site` ADR-0001 (canon in repo, forge holds only renders) on
the **public** axis, refined by a second axis: **deliverable** (git) vs
**exploration** (archive).

## Consequences

### Positive
- The public repo carries ~50 KB of brand (3 docs + logo + recap), not 25 MB.
- Canon + the decided logo get git history, review, and one durable home.
- Dead R&D (parked fox mascot, superseded phases) is kept but never published.
- Galleries work offline from the archive — no forge/server dependency.

### Negative / trade-offs
- **Two homes by lifecycle.** "Deliverable or exploration?" must be judged per
  asset. Mitigated by the table above and the promotion rule: exploration →
  repo *only* when it becomes a deliverable.
- **Archive is git-less.** `~/.roxabi/roxabi-site/` has no history; it is
  Syncthing-replicated (M₁↔M₂) but not reviewed. Acceptable — it is reference,
  not canon.
- **Symlink + Syncthing.** The forge symlink is absolute; on a machine without
  `roxabi-site` cloned at the standard path it dangles. Re-point locally if so.
- **Static gallery lists are manual.** Adding concept/avatar files means updating
  the hardcoded `files` array (regen hint in each gallery's comment).

## Alternatives considered

| Option | Why not |
|---|---|
| Leave canon in the forge, keep citing it | Forge is git-less + hand-editable → wrong substrate for canon. |
| Vendor the whole 25 MB `brand/` into the repo, symlink the dir | Publishes dead R&D (22 MB parked mascot) and bloats a lean public repo. (This was the first cut, reversed here.) |
| Keep galleries fetch-based | Break without the forge server; `file://` fetch is CORS-blocked. Static list is server-free. |

## References
- Canon: `brand/BRAND-BOOK.md`, `brand/DESIGN.md`, `brand/logo/foundation-block.svg`
- Archive: `~/.roxabi/roxabi-site/{avatar,concept,exploration}/`
- Forge symlink: `~/.roxabi/forge/roxabi-site/brand` → `~/projects/roxabi-site/brand`
- Inverse case (private brand, private repo): `bouly-site` ADR-0001
- Project index brand pointers: `~/projects/CLAUDE.md` → Brand Canon
