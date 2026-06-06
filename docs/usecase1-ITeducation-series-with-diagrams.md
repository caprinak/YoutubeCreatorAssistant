# Use Case 1: IT Education Series with UML Diagrams

## Requirement

Build a complete **IT Education video series** feature where a YouTube channel can:

1. Create structured **series** (e.g., "Design Patterns") with metadata (source type, description)
2. Manage ordered **episodes** within a series (title, description, status workflow, content/script)
3. Upload and manage **assets** — especially UML **diagrams** as a first-class asset type alongside images, videos, audio, and thumbnails
4. **Batch import** episodes from AI-generated JSON or plain text outlines
5. **Render episode content as rich HTML** (markdown → HTML) with **inline diagram SVGs** in an expandable UI
6. Support a full **content status workflow**: DRAFT → SCRIPTING → FILMING → EDITING → COMPLETED

The concrete deliverable is a **14-episode Design Patterns series** seeded into the `@eduverse` (Education) channel, with each episode containing:
- Full TypeScript code examples for the pattern
- OO design principle explanations
- A self-hosted UML diagram (SVG) registered as a DIAGRAM-type asset
- References to Head First Design Patterns and Refactoring.Guru

---

## Approach

### Architecture

```
frontend (Angular 21 standalone)
  └─ SeriesDetailComponent ──→ SeriesService ──→ backend /api/series/*, /api/episodes/*
  └─ AssetLibraryComponent ──→ AssetService   ──→ backend /api/assets/*
  └─ marked (markdown → HTML)

backend (Express 5 + Prisma 7 + SQLite via libsql)
  ├─ REST routes for Series, Episode, Asset CRUD
  ├─ Multer file upload (disk storage, UUID filenames)
  ├─ static file serving at /uploads/
  └─ seed-design-patterns.ts (14 episodes + 14 inline SVG diagrams)
```

### Backend Changes (completed in server.ts)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/series` | GET/POST | List (with episode count) / Create |
| `/api/series/:id` | PUT/DELETE | Update / Delete series |
| `/api/series/:id/episodes` | GET | Ordered episode list for a series |
| `/api/episodes` | POST | Create single episode |
| `/api/episodes/:id` | PUT/DELETE | Update / Delete episode |
| `/api/series/:id/import-episodes` | POST | Batch import episodes |
| `/api/assets` | GET/POST/PUT/DELETE | Asset CRUD (JSON body, URL-based) |
| `/api/assets/upload` | POST | Multipart file upload via Multer |

**Asset types:** AUDIO, VIDEO, IMAGE, THUMBNAIL, DIAGRAM

**File storage:** `backend/uploads/assets/{images,videos,audio}/` — DIAGRAM files route to `images/` subdirectory alongside IMAGE and THUMBNAIL.

### Frontend Changes

**Components:**

| Component | Purpose |
|-----------|---------|
| `SeriesListComponent` | Series cards, create modal, delete |
| `SeriesDetailComponent` | Episode list, batch import wizard, inline status change, **expandable markdown content with diagrams** |
| `AssetLibraryComponent` | Tabbed gallery (All/Image/Video/Audio/Thumbnail/Diagram), URL/File upload modal |

**SeriesDetailComponent — Markdown & Diagram Rendering:**

- Each episode card has an expand/collapse chevron (chevron-down icon)
- On expand, `marked.parse()` converts the episode `content` (markdown) → HTML
- A `DomSanitizer.bypassSecurityTrustHtml()` wrapper allows Angular `[innerHTML]` binding
- DIAGRAM-type assets are fetched for the channel and matched to episodes by URL pattern (`diagram-{episodeNumber}.svg`)
- The matching diagram is rendered as an `<img>` tag below the content with a "UML Diagram" heading
- Component-scoped CSS styles `.markdown-body` provide dark-theme typography for h2, h3, p, pre, code, ul, li, blockquote, hr

### Seed Data

The `backend/seed-design-patterns.ts` script:
- Targets the `@eduverse` channel (found by handle)
- Creates 1 Series: "Design Patterns in TypeScript"
- Creates 14 Episodes covering GoF patterns:
  1. Strategy Pattern
  2. Observer Pattern
  3. Decorator Pattern
  4. Factory Method & Abstract Factory
  5. Singleton Pattern
  6. Command Pattern
  7. Adapter & Facade Patterns
  8. Template Method Pattern
  9. Iterator & Composite Patterns
  10. State Pattern
  11. Proxy Pattern
  12. Compound Patterns (MVC)
  13. Builder Pattern
  14. Visitor Pattern
- Each episode has: title, description, full markdown content with TypeScript code examples, OO design principle callout
- 14 inline SVG UML diagrams are generated as template literals (dark theme, proper viewBox, markers, reference text)
- Each SVG is saved to `uploads/assets/images/diagram-{n}.svg`
- Each is registered as a DIAGRAM-type Asset record in the database

### Key Design Decisions

1. **No Episode-Asset join table** — Diagrams are matched to episodes via a URL naming convention (`diagram-{n}.svg` ↔ episodeNumber). This avoids schema migrations for a 1:1 relationship that rarely changes.

2. **Markdown rendering on the client** — `marked` runs in the browser, not the server. This keeps the backend simple (it just stores/fetches content strings) and allows rich client-side interactivity without round-trips.

3. **Inline SVG generation in seed** — Instead of requiring an external drawing tool or library, UML diagrams are hand-crafted SVG template literals directly in the seed script. This eliminates dependencies and keeps the seed self-contained.

4. **DIAGRAM as a separate asset type** — Rather than treating diagrams as IMAGE assets, a dedicated DIAGRAM type with its own tab in the Asset Library makes them discoverable and semantically distinct.

### Verification

- `npx tsc --noEmit` — TypeScript compilation passes
- `ng test` — 37 frontend tests pass
- `npx vitest run` — 73 backend tests pass
- `npm run seed:patterns` — Seeds 14 episodes + 14 diagrams into the `@eduverse` channel

### Next Steps / Opportunities

- **Rich markdown content editing** — Add an inline markdown editor (CodeMirror, Monaco) for episode scripts
- **Episode-to-asset linking** — Add a proper EpisodeAsset junction table if episodes need multiple arbitrary diagrams
- **Downloadable SVG** — Add a download button on rendered diagrams
- **Content versioning** — Track changes to episode content over time

---

### Evaluation (Architecture & Workflow)

**🌟 Strengths:**
1. **Automation & Seed Robustness:** Dynamically generating 14 raw SVG UML diagrams from template literals directly in the seed script completely bypasses external UML server dependencies. Writing them directly to `uploads/assets/images/` and seeding the DB ensures a perfectly self-contained initial state.
2. **Client-Side Rendering:** Using `marked.parse()` on the frontend keeps the backend highly performant (serving raw text) while allowing the UI to handle presentation logic (dark-theme, expandable accordions).
3. **DIAGRAM Asset Prominence:** Promoting diagrams to a first-class asset type in the database improves searchability and organization for educational channels.

**💡 Identified Improvements (Currently Implementing):**
1. **Formal Database Linkage:** The hardcoded URL naming convention (`diagram-{episodeNumber}.svg`) is brittle for user-uploaded content. We are upgrading `schema.prisma` to use an explicit many-to-many relationship (`Episode` ↔ `Asset`).
2. **Inline Markdown Rendering:** Rather than appending diagrams blindly to the bottom of the content, we are implementing a shortcode system (e.g., \`{{ asset:uuid }}\`) so creators can embed diagrams directly inline anywhere within the script body.
