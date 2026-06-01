#!/usr/bin/env python3
"""roxabi-site mini-build — zero-dependency static generator.

Renders the EN (/) and FR (/fr/) page trees from:
  - src/site.toml      : manifest (per-page SEO text + chrome strings)
  - src/templates/     : page shell
  - src/partials/      : nav + footer
  - src/bodies/<lang>/ : hand-authored <main> per page

All SEO (canonical, hreflang, og:url, og:locale, breadcrumbs, sitemap) is
DERIVED from (path, lang) — never copy-pasted per page. Output is clean static
HTML in dist/, byte-for-byte deployable to Cloudflare Pages (publish dir: dist).

Run:  python3 src/build.py        (Python 3.11+, stdlib only)
"""
from __future__ import annotations

import json
import shutil
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
LANGS = ("en", "fr")


def load(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def render(text: str, ctx: dict) -> str:
    """Resolve every {{key}} from ctx (str() coerced). Unknown tokens are an error."""
    out = text
    for key, val in ctx.items():
        out = out.replace("{{" + key + "}}", str(val))
    if "{{" in out:
        leftover = out[out.index("{{"): out.index("{{") + 40]
        raise SystemExit(f"unresolved template token near: {leftover!r}")
    return out


# ── URL / path derivation ─────────────────────────────────────────────────────
def href(path: str, lang: str) -> str:
    """Root-absolute local href for a lang-agnostic page path."""
    prefix = "" if lang == "en" else "/fr"
    if path == "":
        return f"{prefix}/"
    return f"{prefix}/{path}"


def outfile(path: str, lang: str) -> Path:
    prefix = Path("fr") if lang == "fr" else Path()
    leaf = "index.html" if (path == "" or path.endswith("/")) else path
    sub = path[:-1] if path.endswith("/") else ""  # dir part for "projects/"
    if path == "" or path.endswith("/"):
        return DIST / prefix / sub / "index.html"
    return DIST / prefix / path


# ── Structured data (JSON-LD) ─────────────────────────────────────────────────
def dumps(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def ld(obj) -> str:
    return f'<script type="application/ld+json">{dumps(obj)}</script>'


def jsonld_home(base, org_name, github, lang, p) -> str:
    pl = p[lang]
    inlang = SITE["lang"][lang]["inlanguage"]
    org = {
        "@context": "https://schema.org", "@type": "Organization",
        "@id": f"{base}/#org", "name": org_name, "url": f"{base}/",
        "logo": f"{base}/assets/icons/icon-512.png", "sameAs": [github],
        "description": pl["org_desc"],
    }
    website = {
        "@context": "https://schema.org", "@type": "WebSite",
        "@id": f"{base}/#website", "name": org_name, "url": f"{base}/",
        "publisher": {"@id": f"{base}/#org"}, "inLanguage": inlang,
    }
    return ld(org) + "\n" + ld(website)


def jsonld_breadcrumb(base, lang, p) -> str:
    items, pos = [], 1
    for anc_id in p.get("ancestors", []):
        anc = PAGES_BY_ID[anc_id]
        name = SITE["lang"][lang]["home_crumb"] if anc_id == "home" else anc[lang]["crumb"]
        items.append({"@type": "ListItem", "position": pos, "name": name,
                      "item": base + href(anc["path"], lang)})
        pos += 1
    items.append({"@type": "ListItem", "position": pos, "name": p[lang]["crumb"],
                  "item": base + href(p["path"], lang)})
    return ld({"@context": "https://schema.org", "@type": "BreadcrumbList",
               "itemListElement": items})


def jsonld_software(base, org_name, github, lang, p) -> str:
    return ld({
        "@context": "https://schema.org", "@type": "SoftwareSourceCode",
        "name": "Lyra", "description": p[lang]["software_desc"],
        "codeRepository": github, "programmingLanguage": "Python",
        "license": "https://www.gnu.org/licenses/agpl-3.0.html",
        "author": {"@type": "Organization", "name": org_name, "url": f"{base}/"},
    })


def build_jsonld(base, org_name, github, lang, p) -> str:
    kind = p["jsonld"]
    if kind == "home":
        return jsonld_home(base, org_name, github, lang, p)
    if kind == "breadcrumb":
        return jsonld_breadcrumb(base, lang, p)
    if kind == "breadcrumb+software":
        return (jsonld_breadcrumb(base, lang, p) + "\n"
                + jsonld_software(base, org_name, github, lang, p))
    raise SystemExit(f"unknown jsonld kind: {kind}")


# ── Page render ───────────────────────────────────────────────────────────────
def build_page(p: dict, lang: str, tmpl, nav_t, foot_full_t, foot_min_t) -> None:
    base, github, org_name = SITE["base"], SITE["github"], SITE["org_name"]
    L = SITE["lang"][lang]
    pl = p[lang]
    path = p["path"]
    other = "fr" if lang == "en" else "en"

    ctx = dict(L)  # all chrome strings for this language
    ctx.update({
        "lang": lang,
        "github": github,
        # nav
        "home_href": href("", lang),
        "projects_href": href("projects/", lang),
        "constitution_href": href("constitution/", lang),
        "lyra_href": href("projects/lyra/", lang),
        "lang_alt_href": href(path, other),
        "projects_current": ' aria-current="page"' if p["active"] == "projects" else "",
        "constitution_current": ' aria-current="page"' if p["active"] == "constitution" else "",
        # head / SEO (derived)
        "title": pl["title"],
        "desc": pl["desc"],
        "og_title": pl["og_title"],
        "og_desc": pl["og_desc"],
        "og_type": p["og_type"],
        "locale": L["locale"],
        "locale_alt": L["locale_alt"],
        "canonical": base + href(path, lang),
        "href_en": base + href(path, "en"),
        "href_fr": base + href(path, "fr"),
        "og_image_abs": base + L["og_image"],
        "og_alt_block": (f'<meta property="og:image:alt" content="{pl["og_title"]}">\n'
                         if p.get("og_alt") else ""),
    })

    nav = render(nav_t, ctx)
    footer = render(foot_full_t if p["footer"] == "full" else foot_min_t, ctx)
    body = load(SRC / "bodies" / lang / f"{p['body']}.html").rstrip("\n")
    scripts = ('<script src="/assets/vendor/aurora-curtain.js"></script>\n'
               '<script src="/assets/js/app.js"></script>') if p["shader"] \
        else '<script src="/assets/js/app.js"></script>'

    ctx.update({
        "jsonld": build_jsonld(base, org_name, github, lang, p),
        "nav": nav, "footer": footer, "body": body, "scripts": scripts,
    })
    html = render(tmpl, ctx)

    dest = outfile(path, lang)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    print(f"  {dest.relative_to(ROOT)}")


# ── Sitemap (derived from the same page list) ─────────────────────────────────
def build_sitemap() -> None:
    base, mod = SITE["base"], SITE["lastmod"]
    rows = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
            '        xmlns:xhtml="http://www.w3.org/1999/xhtml">', ""]
    for p in PAGES:
        alts = "\n".join(
            f'    <xhtml:link rel="alternate" hreflang="{hl}" href="{base + href(p["path"], lg)}"/>'
            for hl, lg in (("en", "en"), ("fr", "fr"), ("x-default", "en")))
        for lang in LANGS:
            rows += [
                "  <url>",
                f'    <loc>{base + href(p["path"], lang)}</loc>',
                f"    <lastmod>{mod}</lastmod>",
                f'    <changefreq>{p["changefreq"]}</changefreq>',
                f'    <priority>{p["priority"]}</priority>',
                alts,
                "  </url>",
            ]
        rows.append("")
    rows.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(rows) + "\n", encoding="utf-8")
    print("  dist/sitemap.xml")


# ── Static copy ───────────────────────────────────────────────────────────────
def copy_static() -> None:
    shutil.copytree(ROOT / "assets", DIST / "assets")
    for f in (ROOT / "static").iterdir():
        shutil.copy2(f, DIST / f.name)
        print(f"  dist/{f.name}")
    print("  dist/assets/ (copied)")


def main() -> None:
    global SITE, PAGES, PAGES_BY_ID
    SITE = tomllib.loads(load(SRC / "site.toml"))
    PAGES = SITE["page"]
    PAGES_BY_ID = {p["id"]: p for p in PAGES}

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    tmpl = load(SRC / "templates" / "page.html")
    nav_t = load(SRC / "partials" / "nav.html")
    foot_full_t = load(SRC / "partials" / "footer_full.html")
    foot_min_t = load(SRC / "partials" / "footer_min.html")

    print("pages:")
    for p in PAGES:
        for lang in LANGS:
            build_page(p, lang, tmpl, nav_t, foot_full_t, foot_min_t)
    print("derived:")
    build_sitemap()
    copy_static()
    n = len(PAGES) * len(LANGS)
    print(f"\n✓ built {n} pages → {DIST.relative_to(ROOT)}/")


if __name__ == "__main__":
    sys.exit(main())
