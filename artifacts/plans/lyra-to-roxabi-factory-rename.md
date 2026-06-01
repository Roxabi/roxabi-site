# Migration plan — `lyra` → `roxabi-factory`

**Status:** plan only (not executed) · **Created:** 2026-06-01
**Trigger:** reality C — `lyra` repo becomes the agent & worker **factory**; the **Lyra product dies temporarily** (may return). The **Lyra agent persists** as a config-driven seed inside the factory (`config.toml` → `lyra bot init`).
**Constraint:** none on prod (user: "pas de contrainte, on peut faire ça quand on veut").

---

## Decisions to lock before executing

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | Rename deploy units `lyra-*` → `roxabi-factory-*`? | **Yes** — keep repo/unit names aligned. (The seeded *agent* stays "Lyra"; the *infra* becomes roxabi-factory.) |
| D2 | Rename data dir `~/.roxabi/lyra/` → `~/.roxabi/roxabi-factory/`? | **Yes**, with Syncthing folder-id update + restart. Back up first. |
| D3 | Site: keep a `/projects/lyra/` URL? | **301 redirect** `/projects/lyra/` → `/projects/` (preserve external links + SEO). No factory product page yet (in construction). |
| D4 | Create a `roxabi-factory` product page on the site now? | **No** — factory is in construction. Hero diagram + a "in construction" projects card suffice. |
| D5 | Brand-book Lyra color refs (Hub Amber, changelog) | **Keep** — historical/portfolio lineage; Lyra is parked, not erased. |

---

## Phase 1 — GitHub repo rename (independent, ~reversible, 5 min)

```bash
gh repo rename roxabi-factory -R Roxabi/lyra
```
- ✅ Auto-redirect from `github.com/Roxabi/lyra` (web + `git remote`); stars/issues/PRs preserved.
- ⚠️ **Never recreate a repo named `lyra`** afterwards → breaks the redirect.
- Topics already include `agentic`; add `factory`, `worker` if wanted.
- **Update hardcoded `Roxabi/lyra` URLs** in OTHER repos (redirect works but stale links read badly):
  - `Roxabi/.github` profile README (overlaps T1 — see profile draft)
  - `roxabi-docs`, `roxabi-live` (grep at execution)

## Phase 2 — Infra / deploy (no prod constraint)

Targets (per `~/projects/CLAUDE.md` + lyra `deploy/quadlet.toml` + `~/projects/hosts.toml`):
- Quadlet units: `lyra-{hub,clipool,discord,telegram,nats,gh-helper,gh-pod}` → `roxabi-factory-*`
- Host role `lyra-hub` → `roxabi-factory-hub` (hosts.toml)
- Data dir `~/.roxabi/lyra/` → `~/.roxabi/roxabi-factory/` (+ Syncthing)
- `~/projects/CLAUDE.md` index row (lyra) + any `lyra-*` mentions
- Local clone `~/projects/lyra` → `~/projects/roxabi-factory`

Sequence (M₁ = lyra-hub host):
```bash
# 1. stop
systemctl --user stop 'lyra-*'
# 2. back up + move data
cp -a ~/.roxabi/lyra ~/.roxabi/lyra.bak-$(date +%F)   # run this dated cmd yourself
mv ~/.roxabi/lyra ~/.roxabi/roxabi-factory
# 3. rename quadlet unit files + internal refs in deploy/quadlet.toml, redeploy
~/projects/deploy.sh   # idempotent
# 4. reload + start
systemctl --user daemon-reload && systemctl --user start 'roxabi-factory-*'
```
↳ Update Syncthing folder pointing at the old data dir. Verify bots reconnect (Telegram/Discord) + NATS subjects unchanged.

## Phase 3 — roxabi-site (Lyra product retired)

| File | Change |
|------|--------|
| `src/site.toml` | **Remove** the `[[page]]` block `path = "projects/lyra/"` (+ EN/FR text) |
| `src/bodies/en/lyra.html`, `src/bodies/fr/lyra.html` | **Delete** |
| `src/bodies/{en,fr}/projects.html` | Remove the Lyra entry → replace with `roxabi-factory — in construction` card (or drop) |
| `src/bodies/{en,fr}/home.html` | Projects section: the "Lyra · Live" card links `/projects/lyra/` → replace with roxabi-factory (in construction) or remove. *(Hero SVG already shows roxabi-factory.)* |
| `src/partials/footer_full.html` | Portfolio col `<a href="{{lyra_href}}">Lyra</a>` → remove/replace |
| `src/build.py:141` | Remove `"lyra_href": href("projects/lyra/", lang)` (+ the footer slot) |
| `static/_redirects` (or CF rule) | `301 /projects/lyra/ /projects/` (D3) |
| `src/site.toml` `lastmod` | bump |

Then `python3 src/build.py` → confirm 7 pages, no `/projects/lyra/`, no dangling `{{lyra_href}}`.

## Phase 4 — Brand book + cross-repo

- Brand book: keep Lyra color lineage (D5); add a one-line note that Lyra-the-product is parked.
- Re-grep all repos for `Roxabi/lyra` and bare `lyra` product mentions; fix stale links.

## Phase 5 — Verify

- [ ] `github.com/Roxabi/lyra` redirects to `…/roxabi-factory`
- [ ] services up under `roxabi-factory-*`, bots reconnected, NATS OK
- [ ] data intact at new dir; Syncthing syncing
- [ ] site builds; `/projects/lyra/` 301s; no residual product links
- [ ] `grep -ri lyra` across repos = only the *agent name* (intended) + historical brand refs

---

## Sequencing & risk

| Phase | Risk | Reversible? | Can ship alone? |
|-------|------|-------------|-----------------|
| 1 GitHub | low | yes (rename back) | ✅ |
| 2 Infra | **med** (service blip + data move) | yes (restore .bak) | ✅ |
| 3 Site | low | yes (git) | ✅ (deploy independently) |
| 4 Brand/cross | low | yes | ✅ |

**Recommended order:** 1 → 3 → 4 → 2. Do Phase 1 + 3 + 4 first (cheap, visible, reversible); schedule Phase 2 (infra) when convenient since it's the only one that touches the running 24/7 hub.
