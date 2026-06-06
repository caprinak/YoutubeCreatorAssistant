# CreatorHub — Product Overview

> **Business document** · 2026-06-06  
> *A workspace for YouTube creators to capture, organize, and track video ideas.*

---

## 1. What Is CreatorHub?

CreatorHub is a lightweight productivity tool built specifically for **YouTube content creators**. It replaces scattered notes, spreadsheets, and mental checklists with a dedicated workspace where you can:

- Jot down video ideas the moment inspiration strikes
- Track where each idea is in your production pipeline
- Visualize your content queue at a glance

The product has two main views — an **Idea Vault** for managing individual ideas and a **Kanban Board** for seeing the big picture.

---

## 2. Key Features

### 2.1 Idea Vault — Capture & Manage Ideas

The Vault is the home screen. Every idea lives here as a card in a visual grid.

**What you can do:**

| Action | How it works |
|---|---|
| **Add an idea** | Click the "+ New Idea" button. A modal opens where you enter a title, description, and status. Title is required. |
| **Edit an idea** | Click the pencil icon on any card. The same modal opens pre-filled with the existing data. |
| **Change status** | Use the dropdown on any card to move an idea between phases: Researching → Planning → In Progress → Completed. Changes save instantly. |
| **Delete an idea** | Click the delete (⋮) icon. A confirmation dialog appears to prevent accidental deletion. |

**What you see on each card:**
- Status badge (color-coded)
- Title
- Short description preview
- Creation date
- Edit and delete buttons on hover

### 2.2 Kanban Board — Visual Pipeline

The Kanban Board shows your entire content pipeline as four columns — one per status.

**How it works:**
- Each column is color-coded: violet (Researching), amber (Planning), sky (In Progress), emerald (Completed)
- Cards are stacked inside their status column
- Use the dropdown on any card to move it to a different status
- Column headers show the count of ideas in each phase

This view answers the question: *"What's coming next, and what's stuck?"*

### 2.3 Status Pipeline

Every idea moves through four stages:

```
RESEARCHING  →  PLANNING  →  IN PROGRESS  →  COMPLETED
  (exploring)    (outlining)   (making)       (published)
```

This mirrors a real creator workflow — not every idea gets made, but every video that ships passes through all four phases.

---

## 3. User Flows

### Flow 1: Capture a New Idea

1. You open CreatorHub and land on the **Idea Vault**.
2. You click **"+ New Idea"** (top-right button, or the dashed "Brainstorm new idea" card at the bottom).
3. A centered modal appears. You type a **title** (required) and optionally a **description**.
4. You choose a starting **status** (defaults to "Researching").
5. Click **"Save Idea"** — the modal closes, and your new card appears at the top of the grid.
6. A green toast notification confirms: *"Idea captured."*

### Flow 2: Update an Idea's Progress

1. On any card in the Vault or Board, open the **status dropdown** (the colored badge).
2. Select a new status, e.g. move from "Planning" → "In Progress".
3. The card updates immediately (optimistic UI). A toast says *"Status set to In Progress."*
4. If the save fails (e.g. network down), the card snaps back to the previous status and an error appears.

### Flow 3: Review Your Pipeline

1. Click **"Kanban Board"** in the left sidebar.
2. See all 12 (or however many) ideas spread across four columns.
3. Spot which phase has the most ideas — if "Researching" is stacked but "In Progress" is empty, it is time to start producing.
4. Use the embedded dropdown on any board card to advance it without leaving the view.

### Flow 4: Clean Up

1. Hover over an idea card in the Vault.
2. Click the **trash icon**.
3. A dialog asks: *"Delete idea? 'Title' will be permanently removed."*
4. Click **"Delete"** (red button) to confirm, or **"Cancel"**.
5. The card disappears and a toast confirms: *"Idea deleted."*

---

## 4. Target Audience

| Persona | Pain Point | How CreatorHub Helps |
|---|---|---|
| Solo YouTuber | Forgets good ideas, has no system | Quick capture with the "+ New Idea" button |
| Small creator team | Can not see what teammates are working on | Shared idea list with status visibility |
| New creator | Overwhelmed by content planning | Pipeline breaks the process into clear phases |
| Productivity enthusiast | Wants a clean, fast tool | Dark theme, instant updates, keyboard-friendly flow |

---

## 5. Value Proposition

**Before CreatorHub — the typical workflow:**
- Ideas in a Notes app, mixed with grocery lists
- Status tracked in a spreadsheet that never gets updated
- No way to visualize the content queue
- Accidental deletion of notes with no recovery

**After CreatorHub:**
- All ideas in one place, searchable and sortable
- One-click status updates that sync instantly
- A Kanban board that shows the full pipeline at a glance
- Confirmation dialogs prevent mistakes
- Toast notifications confirm every action

---

## 6. Current Limitations (As-Is)

- **Single-user** — no login/accounts; the database is local
- **No search** — the grid lists all ideas; filtering by keyword or status is not yet available
- **No tags or categories** — every idea has only title, description, and status
- **No drag-and-drop** — status changes use a dropdown rather than dragging cards
- **Local only** — the SQLite database lives on your machine; no cloud sync

These limitations are acceptable for an MVP / personal tool. Many are straightforward to add.

---

## 7. Glossary

| Term | Meaning |
|---|---|
| **Idea Vault** | The main grid view listing all video ideas as cards |
| **Kanban Board** | A pipeline view with four columns, one per status |
| **Status** | The phase an idea is in: Researching, Planning, In Progress, or Completed |
| **Card** | A visual tile representing one idea, showing its title, status, and description |
| **Toast** | A small notification that slides in at the bottom-right corner |
| **Modal** | A centered dialog window for creating or editing an idea |
| **Confirm dialog** | A popup that asks you to confirm a destructive action like deletion |

---

*CreatorHub is developed as a personal project. Feature requests and feedback are welcome.*
