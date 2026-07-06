# Roxabi — Brand Book

**Version:** 1.9 (2026-06-20) — §1 rewritten: ambition + culture first; factory as practice; brand-recap synced. See §9 changelog.
**Status:** Authoritative. Replaces all prior exploration artifacts as the single source of truth for brand decisions.
**Scope:** Marketing, product copy, visual identity, messaging, and portfolio context.

<!-- Exploration archive: brand/ -->

---

## 1. Brand Overview

### Ambition

> **We believe one builder should not be structurally capped by missing foundations.**
> The gap between what one person can ship and what a full team can ship is not about talent — it's about who had time to build the layer underneath. Roxabi exists to remove that disadvantage: so the interesting work starts on day one, and output compounds instead of resetting every project.

**In one line:** Close the structural gap. One person. Team-scale output.

> "I'm not trying to replace people — I genuinely enjoy working alone. What I'm trying to do is not be the bottleneck. Every time I build something that runs without me, I get a day back. I want a hundred of those things running."
> — Marco, The Multiplier

### Culture

Roxabi is a **building culture**, not a product catalogue.

| We practice | What it means |
|-------------|---------------|
| **Not the bottleneck** | Every system that runs without you buys a day back. The goal is a hundred of those running. |
| **Proof in the open** | Claims ship with repos, not slides. Inspect before you trust. |
| **Compounding over restarting** | What you add today is where the next builder starts tomorrow. |
| **Ownership by default** | Fork it, run it, extend it. No seat, no gate, no phone-home. |
| **Honest scope** | Built for solo developers and small teams who ship — not for enterprises with dedicated infra teams. |

**The creed (visitor-facing):** Pre-wired. Open. Yours.

**The factory (v1.8):** How this culture shows up in practice — agents, workers, tools and skills composed into one foundation you own. Not a closed product: a way of building where each piece is forkable and the stack grows with what you add.

**Three-layer framing** (cross-ref `bouly-site/brand/BRAND-BOOK.md` §3): Mickael authors and practices the creed → Roxabi publishes creed + primitives → the Guild gathers around builders who fork, run, and contribute back. This book wins on the *what* (creed, naming, values, copy-tone, visual identity). The Bouly book wins on *how Mickael voices it* on personal surfaces.

### What is Roxabi?

> Roxabi is the **operating layer and creed** for builders who refuse to be the bottleneck. Open-source primitives that compound — each inspectable, each forkable, each yours the moment you clone. Together they form a factory mindset: compose agents, workers, tools and skills on a foundation that doesn't reset between projects.

**Technical scope note:** Agents are one kind of primitive Roxabi delivers — not the defining category. Roxabi ships primitives across routing, state, orchestration, and tooling. An agent harness is one primitive in that set. Copy and positioning should reflect the breadth; agent use cases can lead as the primary example without becoming the only noun. *(Mechanism detail — routing, state, harnesses — belongs in §5 pillars and project docs, not in §1 openings.)*

### Mission

Give solo developers and small teams the **same cultural starting position** as a well-funded engineering org: shared foundations, compounding by design, sovereignty by architecture — so they ship like a team without becoming one.

### Category

**Open-source compounding primitives** — each one works standalone, builds on the others, and belongs to the builder the moment they fork it.

### Hero copy — locked (canonical, site live)

| Slot | Copy |
|------|------|
| H1 | One person. Team-scale output. |
| Sub | Pre-wired. Open. Yours. |
| Lead | A factory for the AI era. Roxabi compounds agents, workers, tools and skills into one foundation — all open source, yours to fork. |

---

## 2. Positioning

### Full Positioning Statement

> Roxabi ships open-source primitives that compound — giving a solo developer or small team the same foundation a 50-person engineering org has, pre-wired, theirs to own.

### Anatomy

| Component | Value |
|-----------|-------|
| Category | Open-source compounding primitives |
| Lead angle | Primitives that compound — practical, output-first (landing page, CTAs) |
| Emotional hook | Not the bottleneck — the system runs without you |
| Differentiation | Open by architecture, not by badge. Forkable, self-hostable, no phone-home. |

### Competitive Stance

| Competitor type | Their problem | Roxabi's answer |
|----------------|---------------|-----------------|
| Agent frameworks (LangChain, CrewAI, AutoGen) | Abstract scaffolding you fight by month three; vendor-specific at the model layer | Pre-wired foundations you fork and own; model-layer is pluggable |
| AI IDEs (Cursor, Windsurf, Devin) | Coupled to the editor; your stack evaporates if you switch tools | The layer under the editor — survives tool churn; persistent across environments |
| Open-core SaaS | Useful parts behind the enterprise tier; "open source" is a demo | AGPL-3.0. Full source, no feature gates, no enterprise tier. Inspiration is free; ship a service on it and your changes stay open. |
| DIY from scratch | A week to build the scaffold before the interesting work starts | Start from the scaffold, not before it. The foundations ship ready. |
| No-code automation (n8n, Zapier) | Ceiling is low; can't reach inside; not composable | Code-first, composable, every layer inspectable and replaceable |

### Anti-Positioning

| We are not | We are |
|-----------|--------|
| A framework with opinions about your architecture | Foundations and primitives — structural, not prescriptive |
| A closed product you subscribe to | Open infrastructure you own — fork it, run it, no seat license |
| An AI app | The substrate AI apps run on — a complement to your work, not a competitor |
| A getting-started tutorial | Production-grade from day one — battle-tested under real workloads |
| Built for enterprises with platform teams | Built for the individual developer who ships and the small team that moves fast |
| Model-maximalist, "works with everything" | Tool-agnostic by design — no specific AI vendor required or mentioned |

### The 50-Person Org Framing

The gap between what one person can build and what a full engineering team can build is structural, not a matter of skill. A team has someone dedicated to the orchestration layer. A platform person. Someone who owns the state layer. The solo developer has to build that from scratch before the interesting work starts — or buy something closed and end up on someone else's roadmap.

Roxabi closes that gap by making the foundations available as open infrastructure you own. You start where the team starts. The interesting part starts on day one.

**How to use this in copy:** The comparison is structural (gap narrows) not a claim of equivalence. Never say "as good as a 50-person team." Say "the structural disadvantage of building foundations from scratch is removed." The frame is gap-closing, not performance comparison.

### Licensing & Reciprocity (AGPL-3.0)

Roxabi ships under **AGPL-3.0**. This is a structural choice, not a values statement — describe it as a mechanism, never as a manifesto (see Rule 02).

The license encodes one reciprocity rule: **the foundation stays open as it travels.**

| Act | What the license requires |
|-----|---------------------------|
| Read it, learn from it, reimplement the idea | Free. Copyright covers code, not ideas — inspiration carries no obligation under any license. |
| Run it / self-host it for yourself | Free. No trigger. Internal use is never forced open — by design, and unavoidable in any open-source license. |
| Ship a **service** built on it (SaaS, network-facing) | AGPL §13 triggers: offer your users the corresponding source of your derivative. |
| Distribute software that embeds it | Standard copyleft: your derivative ships under AGPL too. |

**The line, in brand voice:** "Inspiration is free. Building on it means building in the open."

**Why AGPL specifically:** it's the only mainstream OSI copyleft that closes the SaaS loophole (GPL doesn't). It deters exactly the enterprise-with-platform-team adopter the brand already says it isn't for — so the friction lands off-target, not on Marco or Nadia, who self-host and fork.

**Ownership claim still holds:** "yours to own the moment you clone it" = sovereignty (run it, fork it, no lock-in, no phone-home). It does not mean "close it and resell it." Reciprocity is the price of the commons, not a contradiction of ownership.

**Dual-licensing optionality:** Roxabi SAS retains the right to offer a separate commercial license to parties who can't accept AGPL. This is preserved by a contributor CLA (`Roxabi/.github`). Do not market this — it's a back-office lever, never landing-page copy.

**Banned framing here too:** no "liberate," "freedom," "fight lock-in" crusading (Rule 02 / non-evangelical). State the mechanism; let it stand.

---

## 3. Target Audience

### Priority Order

1. **Marco — The Multiplier** (primary)
2. **Nadia — The Autonomy Seeker** (secondary)
3. **Jordan — The Assembler** (tertiary)
4. **Priya — The Commons Builder** (quaternary)

### Persona Summaries

**Marco — The Multiplier** (P1 priority)
Solo founder, 1-person internal tools team, freelancer punching above weight. Doesn't want to manage people — wants to manage systems. His ceiling is hours, not skill, and he knows it. Trigger: turns down a project for lack of capacity, then immediately starts looking for ways to add capacity without hiring. Quote: *"I'm not trying to replace people — I genuinely enjoy working alone. What I'm trying to do is not be the bottleneck. Every time I build something that runs without me, I get a day back. I want a hundred of those things running."* JTBD: Deploy a reliable agentic foundation that handles repeatable tasks without constant supervision — so he can focus on work that requires judgment.

**Nadia — The Autonomy Seeker** (P2 priority)
Burned by SaaS shutdown. Vendor pricing survivor. Open source as survival strategy, not ideology. Checks the license before reading the README. Checks the last commit date and the business model before starring. Trigger: pricing email from a tool that's central to her workflow; she immediately searches for alternatives. Quote: *"I'm not an idealist about this. I don't care about the philosophy — I care about not getting a pricing email that wrecks my month. Every time I depend on something I can't run myself, I'm borrowing from my own future."* JTBD: Run agentic and automation infrastructure she fully controls — no SaaS dependency, no vendor lock, portable to any machine she owns.

**Jordan — The Assembler** (P3 priority)
Technical product person, solo founder who learned to code, systems thinker. Upstream contributor when the gap hurts. Writes the bridge code, then owns it forever. Trigger: spends a full day on glue code that should have existed and decides it's the last time. Quote: *"I don't mind complexity — complexity is just what happens when real things interact. What I mind is unnecessary complexity. The kind that comes from bad defaults, or from every tool assuming it's the center of the universe. I just want the pieces to fit."* JTBD: Connect disparate tools into a coherent system without writing more infrastructure glue than necessary — and without owning every layer.

**Priya — The Commons Builder** (P4 priority)
OSS maintainer, blogs about what she builds, gives back without expectation. Believes in the commons. Builds in public because the stack should belong to everyone. Trigger: discovers a Roxabi project that does almost exactly what she was planning to build herself — and it's already open and forkable. Quote: *"I contribute because someone before me contributed and that's why I had something to build on. It's not complicated. The thing I want is for what I build to be part of that same chain."* JTBD: Build on a foundation that will still be maintained in two years — and that her contributions can extend, not just use.

### Primary Audience Signal

**When in doubt, write for Marco.** He wants output, not philosophy. He responds to: things that run without him, specific proof points, and the promise that he is not the bottleneck. He will not wait through a manifesto to get to the product. He needs to see the foundation before he reads about the philosophy.

The OSS thesis leads with Nadia (sovereignty as a practical survival tool), not with Priya (ideology). Philosophy belongs on the Constitution page (`/constitution/`). CTAs belong to Marco.

---

## 4. Brand Voice

### Character Reference

The voice belongs to someone who forked three repos last weekend, hit a wall, debugged it, and would tell you exactly what happened and why. Not a startup founder pitching a vision. Not a technical writer sanitizing a doc. A peer who built the thing and is giving you the honest version.

### Voice Attributes

**1. Peer-to-peer, not broadcast**

| This | Not that |
|------|----------|
| "You've probably already built a version of this. The harness exists so you don't have to rebuild it from scratch every time." | "Roxabi empowers developers to build the agentic systems of tomorrow by providing world-class infrastructure." |

Failure mode: Copy starts addressing an abstract "developer" audience. Language becomes corporate: "enabling teams," "allowing organizations to." The reader becomes a category, not a person.

---

**2. Concrete over aspirational**

| This | Not that |
|------|----------|
| "The orchestration layer handles routing between agents, state persistence, and error recovery. You wire it once, then add agents without touching the scaffolding." | "A visionary orchestration framework that transforms how you think about building agentic systems at scale." |

Failure mode: Claims that cannot be verified: "effortlessly," "in minutes," "without any complexity." Promises an experience rather than describing a capability.

---

**3. Honest about trade-offs**

| This | Not that |
|------|----------|
| "This approach gives you full control over the agent loop. It also means you own the complexity. If you'd rather abstract that away, the higher-level harness might be a better starting point." | "Roxabi gives you total flexibility with zero added complexity — the best of both worlds." |

Failure mode: Every limitation is reframed as a feature. Hedges disappear. Copy starts reading like legal and marketing worked together to eliminate anything that could be used in a complaint.

---

**4. Non-evangelical about open source**

| This | Not that |
|------|----------|
| "It's open. Fork it, run it, extend it. If you find something broken or missing, the repo is there." | "We believe in the transformative power of open source to democratize access to AI and liberate developers from proprietary lock-in." |

Failure mode: The open-source commitment becomes marketing language. Words like "liberate," "freedom," "community-driven." It reads like a manifesto from a company that uses open source as a differentiator rather than a building method.

---

**5. Direct about scope**

| This | Not that |
|------|----------|
| "Roxabi is infrastructure for solo developers and small teams who build agentic systems. It's not for enterprises with dedicated AI platform teams." | "Roxabi scales from individual developers all the way to enterprise organizations with the most demanding agentic use cases." |

Failure mode: Copy tries to include everyone. Language expands to cover enterprise, teams, individuals, "organizations of all sizes." The product stops being for anyone specific. The builder who actually needs it doesn't recognize themselves.

---

### Tone Spectrum by Context

| Context | Register | Principle | Example |
|---------|----------|-----------|---------|
| Landing page hero | Sharp, declarative, 8 seconds | Locked copy in §1 — do not improvise. H1 names output; Sub = creed; Lead = factory framing. | H1: "One person. Team-scale output." · Sub: "Pre-wired. Open. Yours." · Lead: "A factory for the AI era…" (full table §1) |
| Docs / README | Functional, peer-level | No preamble. Every sentence answers: what does this do, how do I use it, what breaks. | "The harness wraps your agent loop with routing, state, and a recoverable error surface. Wire it to whatever model layer you're using — it doesn't care." |
| GitHub Discussions | Colleague on Slack | One or two sentences is right. Acknowledge the attempt before redirecting. | "Yeah, that's the right instinct. The issue is the state layer doesn't flush on error by default — there's a config flag for that." |
| UI microcopy | Functional, minimal | State what happened, not what to feel. Empty states describe the next concrete action. | "Run stopped — last checkpoint at 14:32. Resume from checkpoint or restart from the beginning." |
| Social | Terse, observation-first | Lead with recognition, not announcement. Earn the link with the post. | "Built a Discord bot that routes support queries to a specialized agent for each product area. Context stays scoped. Took a weekend. Foundation was already there." |
| Conference stage | Credibility-first, show then tell | Open with a problem the audience has already experienced. Show a system working before explaining why. Compounding is the closing idea. | "Six months ago, a contributor needed a harness for multi-agent document processing. They built it on the Roxabi foundation and published it. Three teams forked it this month. None of them had to rebuild the base." |

### 10 Writing Rules

**Rule 01 — Talk about agents as systems, not actors**
Before: "Your agent will intelligently decide when to call tools, learn from previous interactions, and autonomously solve complex problems."
After: "The agent loop routes tool calls based on context, persists state between runs, and retries recoverable errors without restarting from scratch."
Note: Agents are software. Describe what they do structurally. Avoid implying cognition, intent, or learning unless specifically implemented and verifiable.

**Rule 02 — Open source as infrastructure, not ideology**
Before: "We believe in the power of community-driven development to democratize AI tooling for everyone, everywhere."
After: "The foundations are published because shared infrastructure compounds. You benefit from what came before you. Others benefit from what you add."
Note: Express open source as a structural choice with structural consequences, not a value statement.

**Rule 03 — Democratization without the VC framing**
Before: "Democratizing access to enterprise-grade agentic capabilities for developers at every stage of their journey."
After: "A solo developer with the right foundations can build what used to require a team. The foundations exist. They're yours to use."
Note: "Democratize" signals pitch deck. The same idea lands when you say specifically who benefits and what they can do now.

**Rule 04 — The 50-person org frame: use it without arrogance**
Before: "Roxabi gives small teams the same capabilities as the most sophisticated engineering organizations in the world."
After: "The gap between what one person can build and what a full team can build narrows when the foundations are shared. That's the point."
Note: The comparison is structural (gap narrows), not a claim of equivalence.

**Rule 05 — Technical claims need a mechanism**
Before: "Roxabi's robust, enterprise-grade orchestration engine handles massive scale with zero performance degradation."
After: "The orchestration layer queues agent tasks asynchronously and retries on transient failures. Here's the load test data."
Note: Every technical claim should describe the mechanism or point to proof. Superlatives with no mechanism signal the writer doesn't know how it works.

**Rule 06 — Don't explain what a builder already knows**
Before: "AI agents are software systems that can autonomously perform tasks by reasoning about their environment and calling external tools and APIs."
After: "The harness handles the scaffolding so you can focus on the agent logic."
Note: The reader builds agents. Explaining the concept signals the writer doesn't know who the reader is. Every line of context-setting costs trust.

**Rule 07 — Compounding is structural, not motivational**
Before: "Together, we're building a compounding knowledge base of agentic patterns that grows smarter every day!"
After: "Each foundation module builds on the last. When you extend one, you extend everything that depends on it. The stack grows with what you add."
Note: Compounding is a property of modular architecture — not a community spirit. Describe the structural mechanism.

**Rule 08 — Own = forkable + no hidden layers**
Before: "Roxabi gives you full ownership of your AI strategy and tech stack going forward."
After: "Fork it. Run it on your own infrastructure. Nothing calls home. The entire stack is yours the moment you clone it."
Note: "Ownership" is vague. Describe the specific properties: forkable, self-hostable, no telemetry, no vendor lock-in.

**Rule 09 — One idea per sentence in key positions**
Before: "Roxabi is an open-source agentic infrastructure platform that enables solo developers and small teams to build, orchestrate, and deploy AI agent systems with enterprise-grade capability."
After: "One person. Team-scale output. Pre-wired. Open. Yours."
Note: In hero positions and key headings, one idea per sentence is a requirement. Readers scan first. Canonical hero = §1 locked table.

**Rule 10 — If you can't cut the word, the sentence is wrong**
Before: "Roxabi essentially provides developers with a comprehensive set of pre-built foundational components that can seamlessly integrate into their existing workflows."
After: "Roxabi ships the foundations. Wire them into your stack."
Note: "Essentially," "comprehensive," "seamlessly," "various," and "existing" are symptoms of a sentence that hasn't been committed to. Cut them.

### Vocabulary Guide

**Use — preferred terms**

| Word / phrase | Why it works |
|--------------|-------------|
| Foundations | Infrastructure-layer. Structural, not metaphorical. Signals something you build on, not something you consume. |
| Primitives | The brand term for what Roxabi ships. Precise, developer-native, no ideological weight. "Roxabi ships open-source primitives that compound." |
| Commons | Valid in contribution/OSS context only — "contributors add to the commons." Do not use as the brand category descriptor; use "primitives" instead. |
| Composable | Precise technical term. Implies modularity and interoperability without inflating claims. |
| Harness | Specific to agentic infrastructure — wires things together, manages the lifecycle. |
| Orchestrate | Accurate: coordinates agents, routes tasks, manages dependencies. |
| Extend | Two-directional: Roxabi extends open source, builders extend Roxabi. |
| Compound | The core structural claim. Use as verb or adjective, not noun. |
| Forkable | Specific property. More concrete than "open" — implies you can take it and run it yourself. |
| Pre-wired | Describes the starter state: connections exist, scaffolding is done. You don't start from zero. |
| Layer | Architectural language. Positions Roxabi correctly as infrastructure below application logic. |
| Stack | Builder vocabulary. Every technical person knows what their stack is. |
| Operating layer | The category definition. |
| Inspectable | Specific property: you can look inside, trace what's happening, understand the mechanism. |
| Yours | The ownership claim, made personal. Not "owned by you" — "yours." |
| Module | Technical and accurate. Self-contained, independently deployable, composable. |
| Scaffold / scaffolding | The thing you don't want to rebuild every time. |
| Wire / wired | Specific technical action. Implies the connection is verifiable, not just configured in a UI. |
| Assembly | Intentional composition of parts — considered construction, not drag-and-drop. |

**Avoid — banned terms**

| Word / phrase | Why it fails |
|--------------|-------------|
| Seamless | Claims an experience, not a mechanism. Means nothing. |
| Powerful | Content-free. Every product claims to be powerful. Describe what it does instead. |
| Robust | Used to signal reliability without proving it. Describe the mechanism. |
| Leverage (verb) | Corporate-speak for "use" or "build on." |
| Unlock | Lazy verb. Use a specific verb instead. |
| Next-gen / cutting-edge | Time-stamped, content-free. Describe what's technically different. |
| AI-native | Overloaded marketing term with no stable definition. |
| Intelligent (vague) | Anthropomorphizing. Describe the specific behavior instead. |
| Magic / magical | The opposite of inspectable. |
| Automate (as promise) | "Automate your workflow" erases the builder. Use "orchestrate," "coordinate," or describe the specific task. |
| Scale (as noun) | "Achieve scale," "at scale" — VC vocabulary. Say what the system handles in concrete terms. |
| Platform | Overloaded. Use "layer," "foundation," or "infrastructure." |
| Ecosystem | Use only if describing actual technical relationships; otherwise too vague. |
| Empower | Positions the user as passive and Roxabi as the agent. Inverts the actual relationship. |
| Seamlessly integrate | The worst two-word combination in software marketing. Never. |
| Disruptive / revolutionary | Startup-era vocabulary. Signals a company performing innovation. |

---

## 5. Messaging

### 4 Pillars

**Pillar 1 — The Operating Layer** (lead pillar)
Building an agentic system means building two things at once: the system you want, and the scaffolding required to build it. Routing, state, orchestration, error recovery, tool management — these are the same for everyone. Roxabi is the part that doesn't change. You start from there and build what's specific to you.

> "The operating layer for your agentic stack. Pre-wired. Open. Yours." *(Pillar epigraph — not the site hero; hero = §1 locked table.)*

Verifiable proof: The Roxabi foundation includes routing, state persistence, harness scaffolding, and error recovery out of the box. Clone, wire in a first agent, working system in under 30 minutes.

---

**Pillar 2 — Open by Architecture**
Open source as a license is a legal fact. Open by architecture is a design choice. Every layer is inspectable, every component is replaceable, nothing depends on Roxabi staying in the picture. The moment you fork it, it's yours. No hidden orchestration. No telemetry by default. No vendor API routing your agents through Roxabi's servers.

> "Open by design, not by badge."

Verifiable proof: Full source on GitHub. No proprietary modules. No "community edition" limitations. Self-host the complete stack. The model layer is a pluggable interface — no specific vendor required.

---

**Pillar 3 — Compounding Foundations**
Roxabi foundations are composable by design. Each module builds on the last. When a builder adds a harness, extends a routing layer, or contributes a pattern back to the commons, the next person starts from a position the contributor didn't have. This is a structural property of modular open infrastructure — not a network effect or a community metaphor.

> "Every piece you add compounds. Every fork extends the foundation."

Verifiable proof: Pull the dependency tree — the compounding is visible in the graph. Each foundation module contributed by external builders is used downstream by other modules.

---

**Pillar 4 — Built for Builders**
Not for enterprises with platform engineering teams. For the person who builds because they have to. The solo developer running a company on their own agentic stack. The small team that needs to move fast without rebuilding everything from scratch. The engineer who would rather fork and extend than buy a seat and wait for a feature request.

> "One person. Full agentic stack. No team required."

Verifiable proof: No sales call required. No enterprise tier. The README is the onboarding. GitHub Discussions is where the people who built it hang out.

### Taglines

**Lead tagline (hero):**
> One person. Team-scale output.

**Supporting taglines:**

| Use case | Tagline |
|---------|---------|
| Hero sub-headline / CTA | Pre-wired. Open. Yours. |
| Constitution / philosophy | Roxabi extends open source. Open source extends Roxabi. |
| Builders / solo founders | Build what used to take a team. |
| Compounding thread | Every piece compounds. Every fork extends the foundation. |

### The Two Narrative Arcs

**Marco's version (primary — landing page, CTAs)**

Problem: There are things a 10-person engineering team can build that one person can't. Not because of skill — because of time. The team had someone dedicated to the orchestration layer. You didn't. So every time you need to go deep on an agentic system, you have a choice: spend a week building the foundation, or buy something closed and end up on someone else's roadmap. Neither option is right.

Agitate: The gap isn't skill. It's foundations. The work that actually matters — the specific logic, the domain knowledge, the thing that's unique to what you're building — that part doesn't start until the scaffold is up. And the scaffold is always the same. Routing. State. Orchestration. Error handling. Same every time.

Solution: Roxabi closes the gap by making the foundations available. Not as a service you subscribe to — as infrastructure you own. You start where the team starts. The interesting part starts on day one. The agents you wire in handle the coordination work. You own the logic, the infrastructure, and the agents.

CTA: Get the foundations. Wire up your first agent system. Run what used to take a team.

---

**Nadia's version (secondary — Constitution page, deeper stack)**

Problem: Every closed system is a future tax. The tool you relied on for a year raises prices 300% during a funding round — with two weeks notice and no migration path. The SaaS you built client workflows on top of announces it's shutting down. You had 30 days to move everything.

Agitate: Every "free tier" is a hook. The freemium model is designed to make you dependent before charging you. Every new closed dependency you add is future tech debt. You're borrowing from your own future and paying that debt at someone else's convenience.

Solution: Roxabi is open by architecture, not by badge. Fork it. Run it on your own infrastructure. Nothing calls home. The entire stack is yours the moment you clone it. No subscription that could disappear. No vendor whose pricing you don't control. No feature gates between you and the thing that actually works.

CTA: Read the license. Check the source. Run it yourself. The escape hatch is the default.

### The Compounding Thread Explained

Compounding is a structural property, not a metaphor or a community aspiration.

It works because:
1. Each Roxabi module is built to extend cleanly — add a harness for a new tool and it wires into the existing routing layer without modification
2. Modules build on other modules — the dependency graph compounds with each addition
3. Contributors who add to the commons advance the starting position for every subsequent builder
4. "Roxabi extends open source. Open source extends Roxabi." is a description of how the dependency graph actually works, not a slogan

Use compounding as: a verb ("each module compounds on the last"), an adjective ("compounding foundations"), or a structural claim ("the stack compounds structurally"). Never as a noun ("the compounding we've built") or a motivational aspiration ("we're building a compounding community").

---

## 6. Visual Identity

### Direction

**Open Stack** (dark) and **Open Stack** (light). The visual language is rooted in the brand values: **movement, independence, forward momentum, openness**, expressed through clean isometric geometry with a single amber core.

### Logo — decided (2026-06-01)

The mark is the **Foundation Block** (concept #17, refinement **C — "Open top"**): a solid isometric block whose top face is an open glowing amber aperture — a foundation you build on, open at the core. Canonical files: `assets/logo/foundation-block.svg` (full) and `assets/logo/foundation-block-16.svg` (simplified favicon). Transparent background so it themes on any surface. Now in production on the live site (navbar + favicon). Selection record: `logo-explore.html` in the `roxabi-site` repo.

> Supersedes the v1.0–v1.5 status ("logo not designed — in active exploration"). The placeholder "Geometric R + amber slash" from v1.0 was never adopted.

### Color System

**Dark palette (primary)** — v1.5 migration: cool-dark family. Retains warm amber + warm off-white text as deliberate signature against the cool ground. Rationale in Portfolio Amber Family below.

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0d1117` | Page background |
| Panel | `#13191f` | Elevated panel / topnav surface |
| Surface | `#161b22` | Cards, panels, raised surfaces |
| Amber | `#f0b429` | Primary accent: CTAs, forward accents, active states, key highlights |
| Text | `#f0ede6` | Body text, headings — warm off-white on cool ground = signature |
| Border | `#21262d` | Dividers, card outlines |
| Border-hi | `#30363d` | Hover / emphasis dividers |

**Light palette**

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#f8f7f4` | Page background |
| Surface | `#f0ede8` | Cards, panels |
| Amber | `#d97706` | Primary accent (muted for readability on light) |
| Text | `#1c1917` | Body text, headings |
| Border | `#d6cfc8` | Dividers, card outlines |

**Usage rules:**
- Amber is the signature color. Use it for CTAs, forward-pointing accents, active states, and key highlights — not decoration.
- Background and surface are the only two background tokens. Don't invent a third.
- Border should be barely visible — structural, not decorative.
- Text on amber: use `#0d1117` (dark bg token) for contrast. Never `#000000`.

### Typography

| Role | Typeface | Weight | Tracking | Usage |
|------|---------|--------|----------|-------|
| Display / Hero | System-ui (Inter 850 in production) | 900 | -0.04em | Headlines H1–H2, hero taglines, display numbers |
| Body | System-ui (Inter in production) | 400–500 | Normal | Paragraphs, descriptions, docs |
| Mono | Monospace (JetBrains Mono preferred) | 400–500 | Normal | Code blocks, CLI commands, file paths, config values |

Display treatment: Mixed case (sentence case) — not all-caps, not title-case. The weight and tight tracking carry the visual hierarchy. Avoid adding letter-spacing to body text.

### Logo

**Status: in exploration. Not locked.**

The logo mark has not been designed. The following constraints and values are locked and must anchor any exploration:

**What the mark must communicate:**
- Complete and stable — not open, incomplete, or ambiguous
- Forward momentum — the system runs; things compound; output exceeds input
- Foundation / operating layer — the thing underneath, not above
- Openness — accessible, forkable, yours to extend

**Hard constraints:**
- Must work at 16px (favicon) and at 200px
- No letterform requirement — the R is not a constraint
- No diagonal elements that read as prohibition or cutting (slash = stop = wrong)
- No open/incomplete forms that read as unstable or unfinished

**Open questions (active exploration):**
- Curved vs. geometric: The previous "no curves" constraint was never validated. The brand values of movement, independence, and freedom may call for fluid forms, organic energy, or flowing lines — not rigid angles. Both registers are in play until one clearly wins.
- Structure vs. flow: Pure geometry can read as rigid and lifeless. Curves can communicate momentum and openness. The right balance for Roxabi is undecided.

**Visual language reference:**
- Amber `#f0b429` is the signature accent — wherever it appears in the mark, it carries the signal
- Dark background `#0d1117` is the primary context
- The aesthetic should communicate precision *and* movement — engineered, but alive

**Animation principle (when decided):**
- The mark should build or arrive, not sweep or cut
- Amber is the last element to appear — it's the reveal

### Portfolio Amber Family

Lyra uses Hub Amber `#f0a030` — in the same amber family as Roxabi's `#f0b429`. The difference is intentional: Lyra's amber is warmer, Roxabi's is slightly cooler and higher. On a page that references both, the family resemblance is visible and the distinction is legible. This creates visual portfolio coherence without identity confusion.

### Code Block Rule

Code blocks are **always dark terminal**, regardless of page mode. On light pages, the code block brings its own dark surface. This is a design decision, not a failure to theme. Reason: code is written in dark environments; a light-themed code block is a usability regression.

Dark code surface: `#0d1117` (the background token). Syntax highlight: use amber for keywords / highlights. Text: `#f0ede6`.

---

## 7. Core Metaphors

### "The operating layer"

**What it means:** Infrastructure that sits below application logic and above the hardware — like an OS sits below applications. You don't build an OS every time you write a program. You build on the OS. Roxabi is the OS layer for agentic systems.

**Why it works:** It positions Roxabi correctly as infrastructure, not a tool. It implies persistence (the layer exists before your specific work starts and after it ends). It implies composability (anything that runs on the layer can use the layer). It sets the competitive frame correctly — against frameworks and closed platforms, not against other tools.

**How to use it in copy:**
- "Roxabi is the operating layer for your agentic stack." — in positioning, pillars, Constitution (not the locked site hero — see §1)
- "The layer that doesn't change between projects." — in differentiator context
- "Start from the operating layer, not before it." — in CTA context
- Avoid: "operating system" (implies more than is correct); "platform" (banned)

### "Compounding foundations"

**Structural meaning:** Each Roxabi module is built to extend cleanly. When you add a new harness, it wires into the existing routing layer. When a contributor adds a pattern to the commons, every subsequent builder starts from that position. The dependency graph grows. The value of the foundations grows with the graph. This is compounding in the same sense as compounding interest — structural, not aspirational.

**Copy applications:**
- "Every piece you add compounds." — factual claim about the module system
- "Built on what came before. Extended by what comes next." — for commons/contribution context
- "The foundations grow with the people who use them." — for community / Constitution context
- Avoid using "compound" as a noun ("the compounding we've created") or motivational energy ("let's compound together")

### "The stack is yours"

**Ownership framing:** "Yours" means: forkable from the first clone, self-hostable on any infrastructure you control, no telemetry by default, no feature gates, no vendor lock-in. The moment you run `git clone`, the stack is yours. It doesn't require Roxabi's permission, servers, or continued existence to keep working.

**Where to deploy:**
- Hero taglines and sub-headlines — "Pre-wired. Open. Yours."
- Nadia's narrative arc — sovereignty as practical survival
- Anti-SaaS comparison copy — contrasted with "tools you rent"
- Product descriptions — "Run it on your own infrastructure. Nothing calls home."
- Avoid: using "yours" in contexts where it's not technically accurate (e.g., if any managed layer exists)

---

## 8. Asset Index

All files in `brand/`:

| File | Description |
|------|-------------|
| `BRAND-BOOK.md` | **This document.** Version 1.9 — authoritative single source of truth for all brand decisions. |
| `roxabi-positioning-exploration.html` | Phase 2 exploration — 6-section interactive document. Category definitions (A/B/C), positioning angles, competitive scatter plot, differentiator rankings, anti-positioning cards, visual palette directions. Use for historical context only. Superseded by this document. |
| `roxabi-customer-personas.html` | Phase 1 personas — original credential-forward profiles. Superseded by v2. |
| `roxabi-customer-personas-v2.html` | Phase 4 personas — full rewrite. Four builder-forward archetypes: Jordan (Assembler), Nadia (Autonomy Seeker), Marco (Multiplier), Priya (Commons Builder). Complete day-in-life, pain points, goals, objections, triggers, watering holes, JTBD, and customer voice for each. Primary reference for persona details. |
| `roxabi-messaging-framework.html` | Phase 3 messaging — first draft. Superseded by v2. |
| `roxabi-messaging-framework-v2.html` | Phase 4 messaging — complete rewrite. Contains: core thread and manifesto, 5 voice attributes with failure modes, tone-by-context (6 surfaces), 10 writing rules with before/after, vocabulary guide (use/avoid), 4 messaging pillars, 16 tagline options across 4 angles, 2 narrative arcs (Assembler + Multiplier). Primary reference for messaging details. |
| `roxabi-visual-directions.html` | Phase 2 visual directions — first palette exploration. 3 directions (A, B, C). Superseded by v2. |
| `roxabi-visual-directions-v2.html` | Phase 4 visual directions — H' (dark Open Stack) and H'☀ (light Open Stack) locked. Full color system, typography scale, logo description, animation principles. Primary reference for visual detail beyond what is captured here. |

---

## 9. Creed Changelog

The creed is written and **revisable, not law** (cf. LINEAGE §8 anti-pattern "doctrine ossification"). Every version bump lists what changed and which creed principle it advances. Newest first.

| Version | Date | Change | Creed principle advanced |
|---|---|---|---|
| **1.9** | 2026-06-20 | **§1 rewritten** — ambition + culture lead (mindset before mechanism); factory framed as building practice; hero copy locked in §1; three-layer cross-ref aligned to Bouly book §3; `brand-recap` synced (v1.9, AGPL-3.0). | *Peer-to-peer* — visitors understand the ambition and culture before the stack. |
| **1.8** | 2026-06-01 | **Lyra product parked** (may return). Repo `lyra` → `roxabi-factory` (the agent & worker hub); tools plug in over NATS/CLI/skills/API (reality C — no single foundation package). Lyra persists as a config-seeded agent inside the factory. Site: Lyra page retired, `/projects/lyra/` 301→`/projects/`, hero reworked to the factory schéma. | *Direct about scope* — name what the thing is now; don't keep a parked product live. |
| **1.7** | 2026-06-01 | **Licensing corrected** MIT → AGPL-3.0 (copyleft reciprocity); added §2 *Licensing & Reciprocity*. Org governance (CLA/DCO/CONTRIBUTING) added in `Roxabi/.github`. | *Open by architecture* — the license is the mechanism, stated not preached. |
| **1.6** | 2026-06-01 | **Logo decided**: Foundation Block (concept #17, ref. C "Open top") — now canonical (`foundation-block.svg`), live on the site (navbar + favicon); §6 logo note rewritten from "open exploration" to "decided". Added this Creed Changelog (§9). | *Built for builders* — ship only what is actually decided; record the decision. |
| **1.5** | 2026-04-20 | Visual identity migrated to the cool-dark "Portfolio Amber" family (warm amber + warm off-white text on cool near-black ground). Shared palette base with Lyra (`#e85d04`) and Mickael (inherits). Migration record: `V1.5-MIGRATION-LOG.md`. | *Open by architecture* — one inspectable token system, no per-product divergence. |
| **1.4** | 2026-03-28 | Brand book established as authoritative single source of truth; superseded all prior exploration HTML artifacts. Brand assets relocated out of project repos into `~/.roxabi/forge/{project}/brand/` (cf. lyra ADR-042). | *Compounding foundations* — one shared brand lineage outside any single repo. |
| **1.1** | — | Process note: the v1.0 logo ("Geometric R + amber slash") was a never-adopted placeholder; logo flagged as open exploration (resolved 2026-06-01, see §6). Color system, typography, visual language locked. | *Built for builders* — no fake decisions; only ship what is actually decided. |
| **1.0** | — | Initial draft from Phase 1–4 exploration (positioning, personas, messaging, visual directions). | — |

> Maintenance rule: bump the version header (§ top) and add a row here in the same edit. Never let a self-reference (asset index, companion docs) drift from the header version.

---

*This document is the final word on Roxabi brand. For changes: update this document. Exploration artifacts in `brand/` are reference-only.*
