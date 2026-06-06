# CreatorHub — Architecture Evaluation & Expansion Strategy

## 1. Evaluation of Recent Architectural Changes

The recent refactoring of the frontend represents a significant maturation of the codebase:
- **Component Modularization**: Splitting the monolithic shell into `IdeaVaultComponent` and `KanbanBoardComponent` ensures that the logic for distinct views remains isolated and maintainable.
- **Modern Angular 21 Patterns**: The widespread use of Signals (`signal`, `computed`), Control Flow (`@if`, `@for`), and Standalone Components showcases state-of-the-art Angular practices. 
- **UX Improvements**: Replacing native browser `window.alert()` and `window.confirm()` with custom injected `ToastService` and `ConfirmService` makes the application feel like a premium, native desktop experience.
- **Optimistic UI**: The state management gracefully updates the UI immediately upon interaction and only rolls back (with a toast notification) if the backend request fails.

---

## 2. Brainstorming: Future Feature Expansions

To evolve CreatorHub from a simple tracker into a **powerhouse tool for YouTube creators** (focusing purely on utility, ignoring auth/CI for now), here are several high-impact features to build next:

### A. Rich Text Script Editor
Currently, the "Description" is a simple text area. Video descriptions and scripts often require formatting, bolding, bullet points, and headers.
**Idea**: Integrate a Markdown or rich-text WYSIWYG editor (like TipTap or Quill) directly into the Idea Vault modal so creators can draft full scripts inside the app.

### B. Subtasks & Checklists
A single "status" isn't always enough. A video in the `IN_PROGRESS` stage might require: "Film A-Roll", "Film B-Roll", "Create Thumbnail", and "Submit to Sponsor".
**Idea**: Add a checklist to each Idea card. Progress bars (e.g., "3/5 tasks complete") can display on the Kanban cards for granular tracking.

### C. Asset & Link Management (Moodboards)
Creators constantly reference competitor videos, sponsor briefs, and thumbnail inspiration.
**Idea**: Allow attaching external URLs or uploading images (moodboards) directly to an Idea.

### D. Publishing Calendar View
Content creators live and die by upload schedules. 
**Idea**: Add a third route (`/calendar`) that maps Ideas to a monthly grid based on a `targetPublishDate`. 

### E. Drag & Drop Kanban
Currently, moving cards requires a dropdown click.
**Idea**: Implement `@angular/cdk/drag-drop` to allow fluid, native drag-and-drop of cards between the Kanban columns.

### F. Global Search & Tagging
As the vault grows to hundreds of ideas, finding old concepts becomes difficult.
**Idea**: Add customizable colored tags (e.g., `#vlog`, `#tech`, `#shorts`) and a global fuzzy-search bar at the top of the layout.

---

## 3. Proposed Data Models for Expansion

To support the features brainstormed above, the underlying data models (currently stored in `db.json`) must expand. Here is the suggested TypeScript interface / schema architecture to accommodate these new features:

```typescript
// 1. The Expanded Core Idea Model
export interface Idea {
  id: string;
  title: string;
  description: string | null;      // Will now support HTML/Markdown strings
  status: string;                  // 'RESEARCHING' | 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'
  
  // --- NEW FIELDS ---
  priority: 'LOW' | 'NORMAL' | 'HIGH'; 
  targetPublishDate: string | null; // ISO Date string for the Calendar View
  
  createdAt: string;
  updatedAt: string;

  // --- NEW RELATIONS ---
  tasks?: SubTask[];
  assets?: Asset[];
  tags?: string[];                 // Simple array of tag names (e.g., ['#shorts', '#tech'])
}

// 2. Subtasks for granular checklist tracking
export interface SubTask {
  id: string;
  ideaId: string;                  // Foreign key to Idea
  title: string;
  isCompleted: boolean;
  orderIndex: number;              // Allows reordering tasks in the UI
}

// 3. Asset tracking for Moodboards & References
export interface Asset {
  id: string;
  ideaId: string;                  // Foreign key to Idea
  type: 'LINK' | 'IMAGE' | 'VIDEO';
  url: string;
  label: string | null;            // e.g., "Sponsor Brief", "Thumbnail Inspo"
}
```

### Implementation Path:
To adopt these models gracefully:
1. **Database Migration**: Write a script to iterate over existing `db.json` records and append the new default fields (`priority: 'NORMAL'`, `targetPublishDate: null`, `tasks: []`, `assets: []`, `tags: []`).
2. **Backend API**: Update Express routes to accept these nested arrays and merge them during `PUT` requests.
3. **Frontend UI**: Progressively enhance the `IdeaVaultComponent` modal to include tabs (e.g., "Script", "Tasks", "Assets") to keep the form clean.
