# Asset Strategy Evaluation & Implementation Plan

**Source document:** `CONTENT_ASSET_STRATEGY.md`  
**Date:** 2026-06-06

---

## 1. Executive Assessment

The document proposes a significant evolution of CreatorHub from a **single-channel idea tracker** into a **multi-channel creative studio management system**. The vision is sound and aligns with how real YouTube creators operate — most run multiple channels (main, shorts, podcast, vlogs) and need brand consistency across them.

| Proposal | Maturity | Complexity | Priority |
|---|---|---|---|
| Multi-Channel & Audience Personas | Well-thought-out | Medium | **P0 - Implement now** |
| Brand Kit (colors, typography, logos) | Clear spec | Low | **P1 - Implement now** |
| Rich Media (thumbnails, audio, SFX) | Good vision | High | P2 - Future |
| Cloud Storage + CDN | Production concern | High | P3 - Future |

---

## 2. What We Are Implementing Now

### Phase 1 — Foundation (this session)
- **Channel model** — the hub that everything else belongs to
- **AudiencePersona model** — attaches to a channel, selected per idea
- **BrandKit model** — colors, typography, logo/banner URLs per channel
- **Tags** (bonus feature) — many-to-many labels on ideas for flexible filtering
- **Channel selector** — dropdown in sidebar to switch context
- **API updates** — all CRUD endpoints for new models

### Phase 2 — Near future
- Media upload (thumbnails, audio preview in-browser)
- Drag-and-drop in Kanban
- Search / filter by tag, persona, channel

### Phase 3 — Production
- Cloud storage (S3 / R2)
- CDN delivery
- Image processing for thumbnails

---

## 3. Additional Ideas Beyond the Document

| Idea | Why It Fits |
|---|---|
| **Tags** (many-to-many) | More flexible than a single status — cross-cut by topic, format, series |
| **Priority / Effort Score** | Helps creators decide which idea to tackle next |
| **Series / Sequel linking** | Many videos are part of a series; linking them is valuable |
| **Content Calendar view** | A monthly grid showing planned publish dates |
| **Idea templates** | Pre-built structures for common video formats (tutorial, review, vlog) |

**Tags** is simple to add now and provides immediate value. The rest belongs in Phase 2.

---

## 4. Architecture Decisions

**Data model changes:** Three new tables + one join table. The Idea model gains `channelId` (required) and `audiencePersonaId` (optional).

**API design:** Following the existing pattern — Express routes at `/api/channels`, `/api/personas`, `/api/brand-kits`. Ideas now accept `channelId` and `audiencePersonaId` on create/update.

**Frontend pattern:** The App shell owns the selected channel state (a signal). Child components receive it as an input or read it from a shared service. This avoids passing it through every layer.

**Storage:** Brand Kit data (colors, URLs) stays in the database. File uploads (logos, banners) will use local `uploads/` directory in Phase 2.

---

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing ideas have no channel | Seed migration assigns them to a "General" channel |
| Schema migration could break existing data | Delete old SQLite and re-seed (personal project, no production data) |
| UI becomes more complex | Keep channel selector subtle — a dropdown in the sidebar header |
| Feature creep | Lock Phase 1 scope now; defer media uploads |
