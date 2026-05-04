# Skill Registry — Bouquet

Generated: 2026-05-03
Mode: engram

## Project-Level Skills

Located in `.agents/skills/` (symlinked from `.claude/skills/`).

| Skill | Description | Trigger Keywords |
|-------|-------------|------------------|
| accessibility | Audit and improve web accessibility following WCAG 2.2 guidelines. | improve accessibility, a11y audit, WCAG compliance, screen reader support, keyboard navigation, make accessible |
| deploy-to-vercel | Deploy applications and websites to Vercel. | deploy my app, deploy and give me the link, push this live, create a preview deployment |
| frontend-design | Create distinctive, production-grade frontend interfaces with high design quality. | build web components, pages, artifacts, posters, applications, websites, landing pages, dashboards, React components, HTML/CSS layouts, styling/beautifying web UI |
| next-best-practices | Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling | Next.js code, RSC, App Router, Server Actions, metadata, route handlers |
| next-cache-components | Next.js 16 Cache Components - PPR, use cache directive, cacheLife, cacheTag, updateTag | cache components, PPR, use cache, cacheLife, cacheTag, updateTag |
| next-upgrade | Upgrade Next.js to the latest version following official migration guides and codemods | upgrade Next.js, next version, migrate Next.js |
| nodejs-backend-patterns | Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. | create Node.js server, REST API, GraphQL backend, microservices, Express, Fastify |
| nodejs-best-practices | Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. | Node.js architecture, async patterns, security, framework selection |
| prisma-cli | Prisma CLI commands reference covering all available commands, options, and usage patterns. | prisma init, prisma generate, prisma migrate, prisma db, prisma studio, prisma mcp |
| prisma-client-api | Prisma Client API reference covering model queries, filters, operators, and client methods. | prisma query, findMany, create, update, delete, $transaction |
| prisma-database-setup | Guides for configuring Prisma with different database providers (PostgreSQL, MySQL, SQLite, MongoDB, etc.). | configure postgres, connect to mysql, setup mongodb, sqlite setup |
| prisma-postgres | Prisma Postgres setup and operations guidance across Console, create-db CLI, Management API, and Management API SDK. | create Prisma Postgres, Prisma Console, create-db, create-pg, create-postgres |
| seo | Optimize for search engine visibility and ranking. | improve SEO, optimize for search, fix meta tags, add structured data, sitemap optimization, search engine optimization |
| supabase-postgres-best-practices | Postgres performance optimization and best practices from Supabase. | optimize Postgres queries, schema design, database configuration, Supabase performance |
| tailwind-css-patterns | Provides comprehensive Tailwind CSS utility-first styling patterns including responsive design, layout utilities, flexbox, grid, spacing, typography, colors, and modern CSS best practices. | style React/Vue/Svelte components, responsive layout, design system, Tailwind CSS |
| typescript-advanced-types | Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types. | complex types, generics, mapped types, template literals, type utilities |
| vercel-composition-patterns | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. | compound components, render props, context providers, component architecture, React 19 |
| vercel-react-best-practices | React and Next.js performance optimization guidelines from Vercel Engineering. | React components, Next.js pages, data fetching, bundle optimization, performance improvements |

## User-Level Skills (opencode)

Located in `~/.config/opencode/skills/`.

| Skill | Description |
|-------|-------------|
| sdd-init | Initialize Spec-Driven Development context in any project. |
| sdd-explore | Explore and investigate ideas before committing to a change. |
| sdd-propose | Create a change proposal with intent, scope, and approach. |
| sdd-spec | Write specifications with requirements and scenarios (delta specs for changes). |
| sdd-design | Create technical design document with architecture decisions and approach. |
| sdd-tasks | Break down a change into an implementation task checklist. |
| sdd-apply | Implement tasks from the change, writing actual code following the specs and design. |
| sdd-verify | Validate that implementation matches specs, design, and tasks. |
| sdd-archive | Sync delta specs to main specs and archive a completed change. |
| sdd-onboard | Guided end-to-end walkthrough of the SDD workflow using the real codebase. |
| branch-pr | PR creation workflow for Agent Teams Lite following the issue-first enforcement system. |
| issue-creation | Issue creation workflow for Agent Teams Lite following the issue-first enforcement system. |
| judgment-day | Parallel adversarial review protocol that launches two independent blind judge sub-agents. |
| go-testing | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing. |
| skill-creator | Creates new AI agent skills following the Agent Skills spec. |
| skill-registry | Create or update the skill registry for the current project. |
| _shared | Internal shared references for SDD skills. Not an invokable skill. |

## User-Level Skills (agents)

Located in `~/.agents/skills/`.

| Skill | Description | Trigger Keywords |
|-------|-------------|------------------|
| adapt | Adapt designs to work across different screen sizes, devices, contexts, or platforms. | mobile, tablet, desktop, print, email adaptation |
| animate | Review a feature and enhance it with purposeful animations, micro-interactions, and motion effects. | animation, micro-interactions, motion effects |
| audit | Perform comprehensive audit of interface quality across accessibility, performance, theming, and responsive design. | audit, quality check, review interface |
| bolder | Amplify safe or boring designs to make them more visually interesting and stimulating. | bolder design, more visual impact |
| clarify | Improve unclear UX copy, error messages, microcopy, labels, and instructions. | unclear copy, error messages, microcopy |
| colorize | Add strategic color to features that are too monochromatic or lack visual interest. | add color, monochromatic, color strategy |
| critique | Evaluate design effectiveness from a UX perspective. | design critique, UX evaluation |
| delight | Add moments of joy, personality, and unexpected touches that make interfaces memorable and enjoyable to use. | delight, personality, joy in UI |
| design-taste-frontend | Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. | high-end frontend, premium UI, design engineering |
| distill | Strip designs to their essence by removing unnecessary complexity. | simplify, remove complexity, minimal design |
| extract | Extract and consolidate reusable components, design tokens, and patterns into your design system. | design system, reusable components, extract patterns |
| find-skills | Helps users discover and install agent skills when they ask questions about extending capabilities. | find skill, how do I do X, install skill |
| full-output-enforcement | Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns. | complete output, full file, no truncation |
| gpt-taste | Elite UX/UI & Advanced GSAP Motion Engineer. Enforces Python-driven true randomization for layout variance. | awwwards, GSAP motion, elite design |
| gsap-core | Official GSAP skill for the core API — gsap.to(), from(), fromTo(), easing, duration, stagger. | GSAP tween, JavaScript animation, animation library |
| gsap-frameworks | Official GSAP skill for Vue, Svelte, and other non-React frameworks. | GSAP Vue, GSAP Svelte, Nuxt animation |
| gsap-performance | Official GSAP skill for performance — prefer transforms, avoid layout thrashing, will-change. | GSAP performance, 60fps, animation jank |
| gsap-plugins | Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable. | GSAP plugin, ScrollTo, Flip, Draggable |
| gsap-react | Official GSAP skill for React — useGSAP hook, refs, gsap.context(), cleanup. | GSAP React, useGSAP, Next.js animation |
| gsap-scrolltrigger | Official GSAP skill for ScrollTrigger — scroll-linked animations, pinning, scrub, triggers. | ScrollTrigger, scroll animation, parallax, pinned sections |
| gsap-timeline | Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. | GSAP timeline, sequence animations, animation order |
| gsap-utils | Official GSAP skill for gsap.utils — clamp, mapRange, normalize, interpolate, random, snap. | gsap.utils, clamp, mapRange, random, snap |
| harden | Improve interface resilience through better error handling, i18n support, text overflow handling. | harden, error handling, i18n, edge cases |
| high-end-visual-design | Teaches the AI to design like a high-end agency. Defines exact fonts, spacing, shadows, card structures. | high-end agency, premium design, $150k agency |
| image-taste-frontend | Elite website image-to-code skill. Generates design images then implements websites to match. | image-to-code, generate design images, visual design |
| industrial-brutalist-ui | Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. | brutalist, industrial, military terminal, Swiss typography |
| minimalist-ui | Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids. | minimalist, editorial, clean design, bento grid |
| normalize | Normalize design to match your design system and ensure consistency. | normalize, design system consistency |
| onboard | Design or improve onboarding flows, empty states, and first-time user experiences. | onboarding, empty state, first-time user |
| optimize | Improve interface performance across loading speed, rendering, animations, images, and bundle size. | optimize, performance, loading speed, bundle size |
| polish | Final quality pass before shipping. Fixes alignment, spacing, consistency, and detail issues. | polish, final pass, alignment, spacing |
| quieter | Tone down overly bold or visually aggressive designs. Reduces intensity while maintaining design quality. | quieter, tone down, less aggressive design |
| react-native-architecture | Build production React Native apps with Expo, navigation, native modules, offline sync. | React Native, Expo, mobile app, native modules |
| react-native-best-practices | Provides React Native performance optimization guidelines for FPS, TTI, bundle size, memory leaks. | React Native performance, FPS, TTI, bundle size |
| react-native-design | Master React Native styling, navigation, and Reanimated animations for cross-platform mobile development. | React Native styling, Reanimated, navigation |
| redesign-existing-projects | Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns. | redesign, upgrade website, premium quality |
| shadcn | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. | shadcn, shadcn/ui, components.json, preset |
| stitch-design-taste | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files. | Google Stitch, DESIGN.md, semantic design |
| supabase-postgres-best-practices | Postgres performance optimization and best practices from Supabase. | Postgres performance, Supabase optimization |
| teach-impeccable | One-time setup that gathers design context for your project and saves it to your AI config file. | teach impeccable, design context, persistent guidelines |
| vercel-react-best-practices | React and Next.js performance optimization guidelines from Vercel Engineering. | React performance, Next.js performance, optimization |

## Project Conventions

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent skill index. Lists all available skills with descriptions and file paths. Auto-generated by `autoskills`. |
| `.impeccable.md` | Design context for the project. Defines users (restaurant owners, managers, hosts), brand personality (efficient, confident, operational), and design principles. |
| `DESIGN.md` | Detailed design system document. Defines visual identity (floral, organic, elegant), color palette (pink-wine with sage accents), typography, and landing page architecture. |
| `components.json` | shadcn/ui configuration. Style: base-nova, RSC enabled, CSS variables, icon library: lucide. |

## Deduplication Notes

- Project-level skills take precedence over user-level skills when names collide.
- Collisions detected: `frontend-design`, `supabase-postgres-best-practices`, `vercel-react-best-practices` exist in both project-level (`.agents/skills/`) and user-level (`~/.agents/skills/`). Project-level versions are used.
- `.claude/skills/` contains symlinks to `../../.agents/skills/` (project-level).
