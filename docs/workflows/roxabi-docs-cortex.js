export const meta = {
  name: 'roxabi-docs-cortex',
  description: 'Author 6 bilingual Cortex/cognition documentation chapters (EN+FR + theme-aware inline SVG) from forge visuals and repo docs',
  phases: [
    { title: 'Research', detail: 'read sources -> faithful condensed outline + diagram specs per chapter' },
    { title: 'Author',   detail: 'write EN + FR <main> bodies with hand-drawn theme-aware inline SVG' },
    { title: 'QA',       detail: 'verify EN/FR parity, scrub internals, validate SVG/HTML; return fixed bodies' },
  ],
}

const CHAPTERS = [
  { num: 1, slug: 'exocortex',
    sources: [
      '/home/mickael/.roxabi/forge/roxabi-insight/visuals/exocortex-v2.html',
      '/home/mickael/projects/roxabi-cortex/README.md',
      '/home/mickael/projects/roxabi-cortex/docs/ARCHITECTURE.md' ],
    steer: "Flagship OVERVIEW chapter. Cover: the problem (thousands of siloed agent JSONL files / dark matter of agent data), the living-memory metaphor (an exocortex), the two-map architecture (world:* external knowledge vs self:/agent:* internal state, joined by an interaction tissue), the four domains Raw -> Graph -> Compiled Truth -> Actuation, and the feedback/ouroboros loop. Keep it big-picture, motivating, the reader's entry point to the whole section." },
  { num: 2, slug: 'cognitive-framework',
    sources: [
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/cadre-cognitif.html',
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/tabs/cadre-cognitif/tab-problem.html',
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/tabs/cadre-cognitif/tab-modele.html',
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/tabs/cadre-cognitif/tab-dilts.html',
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/tabs/cadre-cognitif/tab-compare.html',
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/tabs/cadre-cognitif/tab-reco.html' ],
    steer: "The cognitive model behind the system. Cover: why a reasoning agent needs an explicit cognitive frame; the Roxabi-native three-layer model D1 (Searle - speech acts / intent), D2 (Husserl - schemas / perception), D3 (Tulving - episodic->semantic memory lifecycle); how it compares to Robert Dilts' Logical Levels and why the native model was chosen; the practical payoff for agent design. Bridge philosophy and engineering." },
  { num: 3, slug: 'observation-contract',
    sources: [
      '/home/mickael/projects/roxabi-cortex/docs/adr/ADR-005-encode-vs-consolidate-observation-contract.md',
      '/home/mickael/projects/roxabi-cortex/docs/adr/ADR-003-lake-warehouse-split.md',
      '/home/mickael/projects/roxabi-cortex/docs/architecture/patterns.md' ],
    steer: "The core mechanism. Cover: the encode-vs-consolidate boundary (hippocampus encodes fast/lossy in the lake; the cortex consolidates slow/structured in the warehouse); the lake/warehouse split and why the two responsibilities must live in separate services; the Observation contract (the typed payload a producer emits) - present its shape/schema cleanly. Alternatives rejected, briefly." },
  { num: 4, slug: 'entity-taxonomy',
    sources: [
      '/home/mickael/projects/roxabi-cortex/docs/adr/ADR-009-entity-taxonomy.md',
      '/home/mickael/projects/roxabi-cortex/docs/architecture/ubiquitous-language.md' ],
    steer: "The data model for entities. Cover: why a taxonomy at all (so memory is queryable, not a blob); the biomimetic basis (Tulving, Husserl, Searle, Bowlby); the 2D grid - self / agent / other / object / abstract on one axis - and how an entity is classified; a compact glossary of the core domain terms (Observation, Episode, Compiled Truth, Decay, Schema Fit, Actuation). Concrete and schematic." },
  { num: 5, slug: 'temporal-decay',
    sources: [
      '/home/mickael/projects/roxabi-factory/docs/memory-system/07-decay-mechanism.md',
      '/home/mickael/.roxabi/forge/roxabi-insight/visuals/exocortex-v2.html' ],
    steer: "Memory lifecycle / forgetting. Cover: why a living memory must forget (Ebbinghaus forgetting curve); the memory_strength model and reinforcement-on-access (spaced repetition / hippocampal replay analogy); decay triggers and thresholds; present the key formula(s) cleanly. From exocortex-v2 use ONLY its decay section. A diagram of the decay+reinforcement curve is the centerpiece." },
  { num: 6, slug: 'derived-reflexes',
    sources: [
      '/home/mickael/.roxabi/forge/roxabi-cortex/visuals/reflexe-derive.html' ],
    steer: "Applied philosophy / closing chapter. Cover: the idea of a 'derived reflex' - a short engineering maxim an AI agent internalizes; present ~8-10 of the strongest maxims grouped by domain (ops, debug, security, refactor, tests...) e.g. 'every problem is a symptom', 'an exit code reports, it does not judge', 'an abstraction earns its name at three uses', 'every dependency is a debt'; then the mechanical method to DERIVE a corrective reflex from a root cause. Aphoristic but rigorous." },
]

const BODY_SPEC = `OUTPUT SHAPE — produce a complete <main>...</main> fragment (NO <html>/<head>, NO markdown, NO code fences). Use EXACTLY this skeleton and these existing site classes:

<main>
<section class="doc-hero">
  <div class="wrap">
    <p class="section-label">DOC-0{NUM} · {CAT}</p>
    <h1>{TITLE}</h1>
    <p class="lead prose" style="margin:var(--s-md) auto 0">{LEAD — 1 sentence}</p>
    <p class="meta">{EN: "Chapter {NUM} of 6 · Roxabi Cortex" | FR: "Chapitre {NUM} sur 6 · Roxabi Cortex"}</p>
  </div>
</section>
<section>
  <div class="wrap constitution">
    <nav class="toc" aria-label="{EN:Sections | FR:Sommaire}">
      <span class="t">{EN:Sections | FR:Sommaire}</span>
      <a href="#sec-1">1 — Heading</a>
      ... one anchor per section, ids sec-1..sec-N ...
    </nav>
    <div class="const-body prose">
      <div class="titre" id="sec-1">
        <span class="label">01</span>
        <h2>Heading</h2>
        <p>...prose paragraphs...</p>
        <!-- optional, where it illuminates: -->
        <figure class="doc-figure">{INLINE SVG}<figcaption>Caption</figcaption></figure>
        <!-- optional key-insight box: --> <div class="callout"><p>...</p></div>
      </div>
      ... more .titre sections (5–8 total) ...
    </div>
  </div>
</section>
</main>

RULES:
- Do NOT add a prev/next chapter nav — the build injects it automatically. End right after the last .titre section + </div></div></section></main>.
- Inline <code>token</code> chips for identifiers, schema fields, formulas. For a multi-line code/schema block use <pre class="code"><code>...</code></pre> sparingly.
- Voice: precise, concrete, engineer-to-engineer, ZERO marketing slop, no filler transitions ("In today's world", "Let's dive in" — banned). Match the register of the Roxabi Constitution: declarative, earned claims.
- 5–8 sections, condensed (target the length of a sharp technical essay, ~Constitution-page density — NOT an exhaustive wiki dump).`

const SVG_RULES = `INLINE SVG (hand-drawn, schematic, theme-aware):
- <svg viewBox="0 0 W H" role="img" aria-label="..." style="width:100%;height:auto"> ... </svg> inside <figure class="doc-figure">.
- THEME TOKENS ONLY for colors so it works in BOTH dark and light themes: boxes fill="var(--surface)" or "var(--panel)"; strokes stroke="var(--border-hi)"; accent elements fill/stroke="var(--accent)"; text fill="var(--text)" for primary, "var(--text-muted)" for secondary; arrowheads/lines can use currentColor. NEVER hardcode hex colors.
- Labels: font-family="var(--font-mono)" font-size="12"–"14". Keep text short.
- Clean schematic diagrams: labelled boxes + arrows + a few annotations. Redraw the CONCEPT (architecture, flow, curve, grid) — not decoration. Define a <marker> for arrowheads once and reuse. For a decay curve use a <path> plotting the function.
- 1–3 figures per chapter. Prefer one strong diagram over several weak ones. No <image>, no <foreignObject>, no <script>, no external refs.`

const SCRUB = `PUBLIC SCRUB (mandatory): this is a public website. NEVER emit: the name "Mickael" (use "the operator" / "l'opérateur" or neutral phrasing), LAN IPs (192.168.*), machine hostnames (roxabituwer / roxabitower / roxabilaptop), tokens/secrets/.env values, or private GitHub issue numbers presented as if public references. Teach the concept, never the infrastructure.`

const RESEARCH_SCHEMA = {
  type: 'object',
  required: ['title_en','title_fr','crumb_en','crumb_fr','cat_en','cat_fr','lead_en','lead_fr','card_desc_en','card_desc_fr','sections','diagrams','scrub_confirmed'],
  properties: {
    title_en: { type: 'string' }, title_fr: { type: 'string' },
    crumb_en: { type: 'string' }, crumb_fr: { type: 'string' },
    cat_en: { type: 'string' }, cat_fr: { type: 'string' },
    lead_en: { type: 'string' }, lead_fr: { type: 'string' },
    card_desc_en: { type: 'string' }, card_desc_fr: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', required: ['heading_en','heading_fr','content'],
      properties: { heading_en: { type: 'string' }, heading_fr: { type: 'string' }, content: { type: 'string' } } } },
    diagrams: { type: 'array', items: { type: 'object', required: ['caption_en','caption_fr','spec'],
      properties: { caption_en: { type: 'string' }, caption_fr: { type: 'string' }, spec: { type: 'string' } } } },
    scrub_confirmed: { type: 'boolean' },
  },
}
const AUTHOR_SCHEMA = {
  type: 'object', required: ['slug','en_body','fr_body'],
  properties: { slug: { type: 'string' }, en_body: { type: 'string' }, fr_body: { type: 'string' } },
}
const QA_SCHEMA = {
  type: 'object', required: ['slug','ok','issues','en_body','fr_body'],
  properties: { slug: { type: 'string' }, ok: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
    en_body: { type: 'string' }, fr_body: { type: 'string' } },
}

const researchPrompt = (ch) => `You are researching ONE chapter of Roxabi's PUBLIC Documentation. Theme of the section: agent cognition & living memory ("Roxabi Cortex"). This is chapter ${ch.num} of 6, slug "${ch.slug}".

READ these sources (use Read; if a path is missing, Glob nearby and adapt):
${ch.sources.map(s => '  - ' + s).join('\n')}

FOCUS / STEER: ${ch.steer}

${SCRUB}

Produce a FAITHFUL but CONDENSED outline (5–8 sections) for a public technical chapter rendered bilingually (EN + FR) on a dark, minimal, amber-accented site. Faithful = keep the real concepts, terms, and formulas from the sources; condensed = a sharp technical essay, not a wiki dump.

Return via StructuredOutput:
- title_en / title_fr: bare chapter title (e.g. "The Exocortex" / "L'Exocortex")
- crumb_en / crumb_fr: 1–2 word breadcrumb label
- cat_en / cat_fr: an UPPERCASE category eyebrow (e.g. "LIVING MEMORY" / "MÉMOIRE VIVANTE")
- lead_en / lead_fr: ONE tight intro sentence, <=155 chars (becomes the meta description)
- card_desc_en / card_desc_fr: <=22 words, the documentation-index card blurb
- sections: 5–8 items { heading_en, heading_fr, content }. content = a DENSE bullet brief (English working notes fine) of exactly what the section must convey, faithful to the source; include key terms/formulas verbatim where they matter.
- diagrams: 1–3 items { caption_en, caption_fr, spec }. spec = a precise description of a schematic SVG to hand-draw (nodes/boxes, arrows, labels, layout, or a curve to plot) that illuminates a concept.
- scrub_confirmed: true once you have ensured no sensitive material will propagate.`

const authorPrompt = (ch, r) => `Author the EN and FR <main> bodies for Roxabi Documentation chapter ${ch.num} of 6 (slug "${ch.slug}", CAT=${r.cat_en}/${r.cat_fr}, TITLE=${r.title_en}/${r.title_fr}) from this approved outline:

${JSON.stringify(r, null, 1)}

${BODY_SPEC}

${SVG_RULES}

${SCRUB}

Render the diagrams from the outline's "diagrams" specs as real inline SVG. EN and FR are TRUE parity: same sections, same diagrams, same meaning — idiomatic in each language (NOT literal translation), proper French typography (é, œ, « », em-dashes). Substitute NUM=${ch.num}.

Return via StructuredOutput { slug: "${ch.slug}", en_body, fr_body } — each a complete <main>...</main> fragment.`

const qaPrompt = (a) => `Quality-gate Roxabi Documentation chapter "${a.slug}". Below are the EN and FR <main> fragments. Check and FIX in place, then return the FINAL corrected bodies.

CHECKS:
1. Scrub: no "Mickael", no 192.168.* IPs, no hostnames (roxabituwer/roxabitower/roxabilaptop), no tokens/secrets. Replace with neutral terms.
2. Parity: EN and FR have the SAME number of sections, the SAME headings (translated), the SAME diagrams. Fix any drift so they match.
3. Structure: starts with <main>, ends with </main>; uses the prescribed classes (doc-hero, wrap, constitution, toc, const-body, titre, label, doc-figure, callout). NO <html>/<head>, NO markdown/code-fences. Do NOT add a prev/next chapter nav. TOC anchors must match section ids.
4. SVG: every <svg> uses ONLY theme tokens for color (var(--accent), var(--border-hi), var(--surface), var(--panel), var(--text), var(--text-muted), currentColor) — zero hardcoded hex; has role="img" + aria-label; width:100%. No scripts/external refs.
5. Well-formed, balanced HTML and valid inline SVG.

EN body:
${a.en_body}

FR body:
${a.fr_body}

Return { slug:"${a.slug}", ok (true if only minor/no fixes were needed), issues:[short strings describing what you fixed], en_body, fr_body }.`

const META = {}
const results = await pipeline(
  CHAPTERS,
  (ch) => agent(researchPrompt(ch), { label: `research:${ch.slug}`, phase: 'Research', schema: RESEARCH_SCHEMA, agentType: 'general-purpose' })
            .then(r => { META[ch.slug] = { num: ch.num, slug: ch.slug, title_en: r.title_en, title_fr: r.title_fr, crumb_en: r.crumb_en, crumb_fr: r.crumb_fr, cat_en: r.cat_en, cat_fr: r.cat_fr, lead_en: r.lead_en, lead_fr: r.lead_fr, card_desc_en: r.card_desc_en, card_desc_fr: r.card_desc_fr }; return { ch, research: r } }),
  (prev) => agent(authorPrompt(prev.ch, prev.research), { label: `author:${prev.ch.slug}`, phase: 'Author', schema: AUTHOR_SCHEMA }),
  (authored) => agent(qaPrompt(authored), { label: `qa:${authored.slug}`, phase: 'QA', schema: QA_SCHEMA }),
)

const chapters = results.filter(Boolean).map(r => ({ ...(META[r.slug] || { slug: r.slug }), en_body: r.en_body, fr_body: r.fr_body, qa_ok: r.ok, qa_issues: r.issues }))
log(`authored ${chapters.length}/6 chapters`)
return { chapters }
