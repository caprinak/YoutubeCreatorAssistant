# CreatorHub — Product Overview

> **Business document** · 2026-06-06  
> *A multi-channel creative studio for YouTube creators to capture, organize, and track video ideas across topics.*

---

## 1. What Is CreatorHub?

CreatorHub is a lightweight productivity tool built for **YouTube content creators who manage multiple channels or topics**. It replaces scattered notes, spreadsheets, and mental checklists with a dedicated workspace where you can:

- Jot down video ideas the moment inspiration strikes, organized by channel/topic
- Track where each idea is in your production pipeline
- Visualize your content queue at a glance across all your channels
- Maintain a brand identity (colors, fonts, logos) per channel

The product has three main views — an **Idea Vault**, a **Kanban Board**, and a **Brand Kit** — each scoped to the currently selected channel.

---

## 2. Multi-Channel Architecture

CreatorHub supports **multiple channels/topics**, each with its own ideas, brand kit, and audience personas.

**The 3 built-in channels:**
| Channel | Handle | Niche |
|---|---|---|
| Education | @eduverse | English language & information technology |
| Health | @vitalroots | Gardening, nutrition & zen living |
| Spirituality | @innerabode | Philosophy, non-duality & self-inquiry |

**How switching works:**
- A dropdown at the top of the sidebar lets you pick a channel
- Selecting a channel navigates to `/channel/:channelId/ideas`
- All views (Idea Vault, Kanban, Brand Kit) load data for the selected channel
- Browser back/forward works naturally for channel navigation

---

## 3. Key Features

### 3.1 Idea Vault — Capture & Manage Ideas

The Vault is the default view when you select a channel. Every idea lives here as a card in a visual grid.

**What you can do:**

| Action | How it works |
|---|---|
| **Add an idea** | Click the "+ New Idea" button. A modal opens where you enter a title, description, and status. Title is required. |
| **Edit an idea** | Click the pencil icon on any card. The same modal opens pre-filled with the existing data. |
| **Change status** | Use the dropdown on any card to move an idea between phases: Researching → Planning → In Progress → Completed. Changes save instantly with optimistic UI. |
| **Delete an idea** | Click the delete icon. A confirmation dialog appears to prevent accidental deletion. |

**What you see on each card:**
- Status badge (color-coded: violet, amber, sky, emerald)
- Title
- Short description preview
- Creation date
- Edit and delete buttons on hover

### 3.2 Kanban Board — Visual Pipeline

The Kanban Board shows your entire content pipeline as four columns — one per status.

**How it works:**
- Each column is color-coded: violet (Researching), amber (Planning), sky (In Progress), emerald (Completed)
- Cards are stacked inside their status column
- Use the dropdown on any card to move it to a different status
- Column headers show the count of ideas in each phase

### 3.3 Brand Kit — Visual Identity Per Channel

Each channel has a brand kit that stores its visual identity.

**What you can store:**
- **Colors** — JSON array of hex codes, previewed as color swatches
- **Typography** — Font family name or CSS string
- **Logo URL** — Link to the channel's logo
- **Banner URL** — Link to the channel's banner

### 3.4 Status Pipeline

Every idea moves through four stages:

```
RESEARCHING  →  PLANNING  →  IN PROGRESS  →  COMPLETED
  (exploring)    (outlining)   (making)       (published)
```

---

## 4. User Flows

### Flow 1: Channel Selection

1. You open CreatorHub and are automatically redirected to the first channel's Idea Vault (`/channel/:id/ideas`).
2. Use the dropdown at the top of the sidebar to switch between Education, Health, and Spirituality.
3. All views update to show data for the selected channel.

### Flow 2: Capture a New Idea

1. Select a channel, then click **"+ New Idea"** on the Idea Vault.
2. A centered modal appears. Type a **title** (required) and optionally a **description**.
3. Choose a starting **status** (defaults to "Researching").
4. Click **"Save Idea"** — the modal closes, and your new card appears at the top of the grid.
5. A green toast notification confirms: *"Idea captured."*

### Flow 3: Update an Idea's Progress

1. On any card in the Vault or Board, open the **status dropdown** (the colored badge).
2. Select a new status, e.g. move from "Planning" → "In Progress".
3. The card updates immediately (optimistic UI). A toast says *"Status set to In Progress."*
4. If the save fails (e.g. network down), the card snaps back and an error appears.

### Flow 4: Review Your Pipeline

1. Click **"Kanban Board"** in the left sidebar.
2. See all ideas spread across four columns.
3. Spot which phase has the most ideas.
4. Use the embedded dropdown on any board card to advance it.

### Flow 5: Manage Brand Kit

1. Click **"Brand Kit"** in the left sidebar.
2. If no kit exists yet, click **"Create Brand Kit"**.
3. Fill in colors (JSON array), typography, logo URL, and banner URL.
4. Click **"Save Changes"** to persist.

### Flow 6: Clean Up

1. Hover over an idea card in the Vault.
2. Click the **trash icon**.
3. A dialog asks: *"Delete idea? 'Title' will be permanently removed."*
4. Click **"Delete"** (red button) to confirm, or **"Cancel"**.
5. The card disappears and a toast confirms: *"Idea deleted."*

---

## 5. Target Audience

| Persona | Pain Point | How CreatorHub Helps |
|---|---|---|
| Multi-channel creator | Manages 2-3 YouTube channels, no unified tool | Channel selector + per-channel ideas |
| Solo YouTuber | Forgets good ideas, has no system | Quick capture with the "+ New Idea" button |
| Small creator team | Can not see what teammates are working on | Shared idea list with status visibility |
| New creator | Overwhelmed by content planning | Pipeline breaks the process into clear phases |
| Brand-conscious creator | Inconsistent visual identity across channels | Brand Kit per channel |

---

## 6. Value Proposition

**Before CreatorHub:**
- Ideas scattered across Notes, Google Docs, spreadsheets
- No way to separate ideas by channel/topic
- Status tracked manually, never updated
- No centralized brand asset repository
- Accidental deletion with no recovery

**After CreatorHub:**
- All ideas in one place, organized by channel
- One-click status updates with optimistic UI
- Kanban board shows the full pipeline at a glance
- Brand Kit stores colors, fonts, logos per channel
- Confirmation dialogs prevent mistakes
- Toast notifications confirm every action

---

## 7. Architecture Decisions

### Frontend
- **Standalone Angular 21** components with Signals
- **Router-driven channel switching** — channel ID comes from `ActivatedRoute.snapshot.paramMap` (constructor) + `paramMap` subscription (ngOnInit)
- **No global selected-channel state** — `ChannelStoreService` only caches the channels list; selection is derived from the URL
- **Channel redirect** — `/` redirects to first channel's ideas via `effect()` with self-destroy + `replaceUrl: true`
- **Optimistic UI** — updates applied immediately, rolled back on HTTP failure
- **Subscription cleanup** — all HTTP subscriptions tracked and unsubscribed before new requests

### Backend
- **Express + Prisma v7** with libSQL driver adapter
- **6 models**: Channel, AudiencePersona, BrandKit, Tag, IdeaTag, Idea
- **asyncHandler pattern** eliminates repetitive try/catch
- **findOrFail helper** eliminates repetitive not-found checks
- **HttpError classes** for typed error responses

---

## 8. Current Limitations (As-Is)

- **Single-user** — no login/accounts; the database is local
- **No file uploads** — logos, banners are URLs only (Phase 2)
- **No drag-and-drop** — status changes use dropdowns
- **No search/filter** — all ideas shown, no keyword search
- **No calendar view** — no publish scheduling yet
- **Local only** — the SQLite database lives on your machine; no cloud sync

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **Channel** | A topic/YouTube channel (Education, Health, or Spirituality) |
| **Idea Vault** | The grid view listing all video ideas for the selected channel |
| **Kanban Board** | A pipeline view with four columns, one per status |
| **Brand Kit** | Visual identity settings per channel (colors, typography, logos) |
| **Status** | The phase an idea is in: Researching, Planning, In Progress, Completed |
| **Card** | A visual tile representing one idea |
| **Toast** | A small notification that slides in at the bottom-right |
| **Modal** | A centered dialog window for creating or editing an idea |
| **Confirm dialog** | A popup that asks you to confirm a destructive action |

---

*CreatorHub is developed as a personal project. Feature requests and feedback are welcome.*
