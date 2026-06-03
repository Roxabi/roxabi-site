---
name: Roxabi
version: "1.5"
description: >
  Hub brand — operating layer. Warm off-white text on cool near-black
  ground; amber as the sole interaction signal. GitHub-dark elevation
  ladder inverted by warm text. "Portfolio amber" family shared with
  Lyra (slightly warmer at #e85d04) and Mickael (inherits this palette).
colors:
  bg: "#0d1117"
  panel: "#13191f"
  surface: "#161b22"
  accent: "#f0b429"
  accent-hover: "#fbbf24"
  accent-on: "#0d1117"
  text: "#f0ede6"
  text-muted: "#9ca3af"
  text-dim: "#6b7280"
  border: "#21262d"
  border-hi: "#30363d"
  # Light mode (authorized for docs only; never marketing)
  light-bg: "#f8f7f4"
  light-surface: "#f0ede8"
  light-accent: "#d97706"
  light-text: "#1c1917"
  light-border: "#d6cfc8"
typography:
  display:
    fontFamily: Inter
    fontWeight: 900
    fontSize: 4rem
    lineHeight: 1
    letterSpacing: "-0.04em"
    notes: Hero only. Never body. Never below 2rem.
  h1:
    fontFamily: Inter
    fontWeight: 850
    fontSize: 2.5rem
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Inter
    fontWeight: 700
    fontSize: 1.75rem
    lineHeight: 1.2
  h3:
    fontFamily: Inter
    fontWeight: 600
    fontSize: 1.25rem
  body-md:
    fontFamily: Inter
    fontWeight: 400
    fontSize: 1rem
    lineHeight: 1.6
  body-emphasis:
    fontFamily: Inter
    fontWeight: 500
    fontSize: 1rem
  label-caps:
    fontFamily: Inter
    fontWeight: 500
    fontSize: 0.75rem
    letterSpacing: "0.15em"
    textTransform: uppercase
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 0.875rem
    lineHeight: 1.5
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 12px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
elevation:
  # NON-SPEC: elevation ladder — flagged for upstream (issue #13 adjacent)
  ladder: [bg, panel, surface]
  direction: raised   # cards rise from the page
shadows:
  sm: "0 1px 2px rgba(0,0,0,0.3)"
  md: "0 4px 12px rgba(0,0,0,0.4)"
  glow-accent: "0 0 40px rgba(240,180,41,0.22)"
motion:
  duration-fast: 120ms
  duration-base: 200ms
  easing-standard: "cubic-bezier(0.2, 0, 0, 1)"
---

## Overview

Roxabi is the **operating layer**: warm off-white text on cool near-black ground, amber as the sole signal color. The palette maps 1:1 to a GitHub-dark elevation ladder (`bg < panel < surface`) with a warm-text inversion that's the brand's visual signature.

## Colors

- **bg (#0d1117) → panel (#13191f) → surface (#161b22):** Elevation ladder. Cards rise from the page.
- **accent (#f0b429):** Amber — CTAs, forward-pointing accents, active states, key highlights. One dominant amber element per composition. Text on amber uses `#0d1117`, never pure black.
- **text (#f0ede6):** Warm off-white. The warm/cool pairing against `#0d1117` is deliberate — do not normalize to pure white.
- **border (#21262d) / border-hi (#30363d):** Dividers; `border-hi` for hover or emphasis.

## Typography

System-ui in production acts as a performance-safe proxy for Inter. Display at 900 weight with tight letter-spacing (`-0.04em`) is the signature — avoid lighter weights at hero sizes.

## Portfolio Relationship

- **Roxabi amber (#f0b429):** slightly cooler, higher — the hub brand.
- **Lyra amber (#e85d04 Forge Orange):** warmer sibling — project in the portfolio.
- **Mickael:** inherits Roxabi tokens directly (human face of Roxabi).

The family resemblance is intentional: on a page referencing both Roxabi and Lyra, the two oranges read as sibling brands, not confusion.

## Code Block Rule

Dark code surface always: `#0d1117` ground, amber keywords, `#f0ede6` text. No light-mode code blocks regardless of page mode.

## References

- Full brand book: `BRAND-BOOK.md` §6 (color system, typography, logo)
- Visual directions reference: `roxabi-visual-directions-v2.html` (H' / H'☀ locked)
