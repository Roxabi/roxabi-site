# Changelog

All notable changes to roxabi-site are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/). Entries are generated automatically by `/promote` and committed to staging before the promotion PR.

## [v0.1.0] - 2026-06-11

First production release: full bilingual (EN/FR) static site, built by the zero-dependency Python mini-build (ADR-0002), deployed on Cloudflare Pages.

### Added
- feat: static bilingual site + zero-dep mini-build (ADR-0002) (911e52d)
- feat(home): kinetic-grid shader hero background, two-column hero with hub diagram, factory-framed tagline (51d10e9, 70fccc7, 94d467c)
- feat(home): "Primitives you can fork today" with 6 featured shipped projects (5e19e5b, 672a89b)
- feat: bilingual Documentation section + a11y/perf pass + hero lab (55c5788)
- feat(docs): tag-based IA, shared component library, inline-code/syntax styling (d55b819)
- feat(projects): detail pages for roxabi-plugins, voiceCLI, roxabi-factory, llmCLI, imageCLI, roxabi-forge, roxabi-boilerplate (EN+FR) (831fabd, 473907a, 755e7f9, fee6e5a)
- feat(projects): theme-aware inline SVG diagrams on roxabi-plugins page (d3a92d1)
- feat(legal): bilingual legal notice page + registered office address (e0f5bac, f529fcd)
- feat(build): version + last-updated label on doc articles (3031bfa)
- feat: aurora-curtain shader + layout polish (a1a499a)
- docs(documentation): Roxabi Factory roadmap and architecture page (EN+FR) (5bfcefd)
- docs(remediation): §9 post-merge validation audit section (EN+FR) (293e378)
- docs(brand): brand deliverables vendored into repo as git SSoT (226e28c)
- ci: standalone secret-scan workflow (7e6a78e)

### Fixed
- fix(seo): extensionless dir-style URLs matching Cloudflare Pages clean-URL serving (0b47203, 5a7d702)
- fix(home): kinetic-grid shader dark-only, stops dark bleed in light hero (6764c71)
- fix(docs): mobile overflow, SVG label fixes, readable H2-derived anchors (d55b819, 240043f)
- fix(docs): corrected token estimate + agent-census/token-estimation section (af81bb0)

### Changed
- feat: lyra page removed, home/projects updated, redirects added (lyra → roxabi-factory rename) (5bf099e, e99f924)
- refactor(docs): structured maxim cards on derived-reflexes page (5739e5e)
- chore(license): relicensed to AGPL-3.0 (269d4bc)
