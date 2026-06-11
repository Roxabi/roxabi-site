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

import html
import json
import os
import re
import shutil
import sys
import tomllib
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
# Output dir defaults to ./dist; override with ROXABI_DIST for isolated builds (e.g. parallel QA).
DIST = Path(os.environ["ROXABI_DIST"]).resolve() if os.environ.get("ROXABI_DIST") else ROOT / "dist"
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
    # name / repo / language / license come from the page so any project can use
    # this builder. Defaults: Python + AGPL (the portfolio norm); override per
    # page for the exceptions (e.g. the TypeScript/MIT boilerplate). software_desc
    # is per-lang.
    return ld({
        "@context": "https://schema.org", "@type": "SoftwareSourceCode",
        "name": p.get("software_name", org_name),
        "description": p[lang]["software_desc"],
        "codeRepository": p.get("repo", github),
        "programmingLanguage": p.get("language", "Python"),
        "license": p.get("software_license", "https://opensource.org/license/agpl-v3"),
        "author": {"@type": "Organization", "name": org_name, "url": f"{base}/"},
    })


def jsonld_techarticle(base, org_name, lang, p) -> str:
    pl = p[lang]
    return ld({
        "@context": "https://schema.org", "@type": "TechArticle",
        "headline": pl["og_title"], "description": pl["og_desc"],
        "inLanguage": lang, "url": base + href(p["path"], lang),
        "author": {"@type": "Organization", "name": org_name, "url": f"{base}/"},
        "publisher": {"@id": f"{base}/#org"},
        "isPartOf": {"@type": "CreativeWorkSeries", "name": "Roxabi Documentation",
                     "url": base + href("documentation/", lang)},
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
    if kind == "techarticle":
        return (jsonld_breadcrumb(base, lang, p) + "\n"
                + jsonld_techarticle(base, org_name, lang, p))
    raise SystemExit(f"unknown jsonld kind: {kind}")


# ── Section anchors (derive readable URL fragments from each <h2>) ─────────────
_SEC_RE = re.compile(r'id="(sec-\d+)"[^>]*>.*?<h2[^>]*>(.*?)</h2>', re.S)


def slugify(text: str) -> str:
    """'Why « Exocortex »' → 'why-exocortex'. Strips tags/entities/accents."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def derive_section_anchors(body: str) -> str:
    """Rewrite hand-authored `sec-N` section ids (and their TOC `#sec-N` hrefs)
    to slugs derived from each section's <h2>, so URL fragments are readable.
    No-op on pages without `sec-N` ids (e.g. the constitution, already slugged)."""
    used: set = set()
    mapping: dict = {}
    for secid, title in _SEC_RE.findall(body):
        slug = slugify(title) or secid
        base, n = slug, 2
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        mapping[secid] = slug
    for secid, slug in mapping.items():
        body = body.replace(f'id="{secid}"', f'id="{slug}"')
        body = body.replace(f'href="#{secid}"', f'href="#{slug}"')
    return body


# ── Documentation collection (tag-organized; index cards + per-doc nav, derived) ─
def doc_list() -> list:
    """Documentation entries (collection pages carrying tags), in manifest order."""
    return [p for p in PAGES if p.get("collection") == "documentation" and p.get("tags")]


def doc_all_tags() -> list:
    """Distinct tags across all docs, first-seen (manifest) order."""
    seen: set = set()
    out: list = []
    for p in doc_list():
        for t in p["tags"]:
            if t not in seen:
                seen.add(t)
                out.append(t)
    return out


def tag_pills(tags: list, lang: str, link: bool = True) -> str:
    """Render tag chips. When `link`, each points to the index filtered by that tag
    (`/documentation/#<slug>`); otherwise a static <span> (used inside card links)."""
    idx = href("documentation/", lang)
    out = []
    for t in tags:
        slug = slugify(t)
        if link:
            out.append(f'<a class="tag" href="{idx}#{slug}" data-tag="{slug}">{t}</a>')
        else:
            out.append(f'<span class="tag" data-tag="{slug}">{t}</span>')
    return "".join(out)


def doc_cards(lang: str) -> str:
    L = SITE["lang"][lang]
    cards = []
    for p in doc_list():
        pl = p[lang]
        slugs = " ".join(slugify(t) for t in p["tags"])
        cards.append(
            f'<a class="card doc-card" href="{href(p["path"], lang)}" data-tags="{slugs}" data-reveal>'
            f'<div class="doc-card-tags">{tag_pills(p["tags"], lang, link=False)}</div>'
            f'<h3>{pl["card_title"]}</h3>'
            f'<p>{pl["card_desc"]}</p>'
            f'<p class="portfolio-note">{L["doc_read"]} <span class="arrow">&rarr;</span></p>'
            f'</a>')
    return "\n      ".join(cards)


def doc_filter(lang: str) -> str:
    """Tag-filter bar for the index. Hidden until app.js reveals it (so JS-off users
    just see every card). Suppressed entirely while a single tag covers all docs."""
    L = SITE["lang"][lang]
    tags = doc_all_tags()
    if len(tags) < 2:
        return ""
    btns = [f'<button type="button" class="tag-filter is-active" data-filter="all">{L["doc_filter_all"]}</button>']
    btns += [f'<button type="button" class="tag-filter" data-filter="{slugify(t)}">{t}</button>' for t in tags]
    return (f'<div class="doc-filter" role="group" aria-label="{L["doc_filter_aria"]}" hidden>'
            + "".join(btns) + "</div>")


def doc_footer_nav(lang: str, p: dict) -> str:
    """Per-document footer: the doc's own tag chips + a link back to the index.
    Replaces the old linear chapter prev/next — tags are the organizing axis now."""
    L = SITE["lang"][lang]
    return (f'<nav class="doc-nav" aria-label="{L["doc_nav_aria"]}">'
            f'<div class="doc-nav-tags">{tag_pills(p["tags"], lang)}</div>'
            f'<a class="idx" href="{href("documentation/", lang)}">{L["doc_all"]} &rarr;</a>'
            f'</nav>')


def doc_meta(lang: str, p: dict) -> str:
    """Version + last-updated label for a documentation article, injected into the
    doc hero (reuses the `.doc-hero .meta` style). Both values are lang-agnostic
    data in site.toml; only the field labels are localized. Empty when neither set."""
    L = SITE["lang"][lang]
    ver, upd = p.get("version"), p.get("updated")
    if not ver and not upd:
        return ""
    parts = []
    if ver:
        parts.append(f'{L["doc_version"]}&nbsp;{ver}')
    if upd:
        parts.append(f'{L["doc_updated"]} <time datetime="{upd}">{upd}</time>')
    return '<p class="meta">' + " · ".join(parts) + "</p>"


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
        "documentation_href": href("documentation/", lang),
        "legal_href": href("legal/", lang),
        "lang_alt_href": href(path, other),
        "projects_current": ' aria-current="page"' if p["active"] == "projects" else "",
        "constitution_current": ' aria-current="page"' if p["active"] == "constitution" else "",
        "docs_current": ' aria-current="page"' if p["active"] == "docs" else "",
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
    # Give the skip-link a focus target (bodies author a bare <main>).
    body = body.replace("<main>", '<main id="main" tabindex="-1">', 1)
    # Derive readable section anchors from each <h2> (sec-N → title slug).
    body = derive_section_anchors(body)
    # Documentation collection (tag-organized): derive index cards + filter bar,
    # per-doc hero tag chips, and a per-doc footer nav (tags + back-to-index).
    if "{{doc_cards}}" in body:
        body = body.replace("{{doc_cards}}", doc_cards(lang))
    if "{{doc_filter}}" in body:
        body = body.replace("{{doc_filter}}", doc_filter(lang))
    if "{{doc_count}}" in body:
        body = body.replace("{{doc_count}}", str(len(doc_list())))
    # Version/last-updated label: inject into the doc hero just after the tag chips
    # (anchored on the still-untouched {{doc_tags}} marker). Derived from site.toml,
    # never copy-pasted into bodies.
    if p.get("collection") == "documentation" and p.get("tags"):
        meta = doc_meta(lang, p)
        if meta:
            anchor = '<div class="doc-hero-tags">{{doc_tags}}</div>'
            body = body.replace(anchor, anchor + "\n    " + meta, 1)
    if "{{doc_tags}}" in body:
        body = body.replace("{{doc_tags}}", tag_pills(p.get("tags", []), lang))
    if p.get("collection") == "documentation" and p.get("tags"):
        body = body.replace("</main>", doc_footer_nav(lang, p) + "\n</main>")
    # `shader` is a vendored module id (e.g. "kinetic-grid") or false. When set,
    # load assets/vendor/<id>.js — it auto-inits #hero-bg on dark. Back-compat:
    # shader = true still resolves to the original aurora-curtain.
    shader = p.get("shader")
    if shader is True:
        shader = "aurora-curtain"
    scripts = ('<script src="/assets/vendor/%s.js"></script>\n'
               '<script src="/assets/js/app.js"></script>') % shader if shader \
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
        if not p.get("sitemap", True):
            continue
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
