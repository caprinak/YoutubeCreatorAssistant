# Clean Code Principles — CreatorHub

This document defines the clean code standards for this codebase. Every PR and commit should conform to these principles.

---

## 1. Meaningful Names

Names reveal intent. A reader should understand what a variable, function, or class does without reading its implementation.

### Good
```typescript
const TITLE_MAX_LENGTH = 200;
const DEFAULT_IDEA_STATUS = 'RESEARCHING';
function findChannelOrFail(id: string): Promise<Channel> { ... }
```

### Bad
```typescript
const MAX = 200;
const d = 'RESEARCHING';
function find(id: string) { ... }
```

### Applied Here
- `backend/server.ts` uses `IDEA_STATUSES`, `TITLE_MAX`, `DESC_MAX` — good
- Always name booleans with prefixes: `isLoading`, `hasFormErrors`, `isSaving`
- Router param extraction uses clear names: `channelId`, `initialId`

---

## 2. Single Responsibility Principle (SRP)

Every function, class, and module should have exactly one reason to change.

### File Level
- **One conceptual responsibility per file.** `server.ts` defines routes → splitting into route modules (e.g. `routes/ideas.ts`) is preferred as the codebase grows
- **Seed functions** should be split: `seedTags()`, `seedChannels()`, `seedIdeas()` — not one monolithic `seed()`

### Function Level
- If a function does **validation + business logic + response formatting**, split it:
  ```typescript
  // Instead of one 50-line handler:
  function validateIdeaInput(body): ValidationResult { ... }
  function buildIdeaCreateData(input): IdeaData { ... }
  // Handler becomes:
  handler = asyncHandler(async (req, res) => { ... });
  ```

---

## 3. DRY (Don't Repeat Yourself)

Duplication multiplies maintenance cost. Extract repeated patterns.

### Pattern: try/catch Wrapping
Every Express route handler in `server.ts` wraps logic in `try { ... } catch (err) { next(err); }`.
**Fix:** Extract an `asyncHandler` wrapper:
```typescript
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
}
```

### Pattern: Not-Found Checks
Repeated 4-line blocks:
```typescript
const existing = await prisma.channel.findUnique({ where: { id } });
if (!existing) return res.status(404).json({ error: 'Channel not found' });
```
**Fix:** Extract `findOrFail` helper.

### Pattern: Status Style Maps
Two frontend components had identical switch statements mapping statuses to CSS classes.
**Fix:** One `idea-status.constants.ts` file with `statusBadge()`, `columnBorder()`, `columnHeader()`, `cardBorder()` functions.

### Pattern: Router-Driven Channel ID Extraction
Multiple components read `channelId` from `ActivatedRoute`. The pattern is always:
1. Constructor: `this.route.snapshot.paramMap.get('channelId')` for initial load
2. `ngOnInit`: `paramMap.subscribe()` for subsequent changes with dedup check
3. `destroyRef.onDestroy(() => sub.unsubscribe())` for cleanup
This is intentional duplication — extracting it would couple unrelated components.

---

## 4. Small Functions

- A function should fit on one screen (~30 lines max)
- Prefer extracting early: if you see "and then" in a function, split it
- Example from `backend/server.ts`: `POST /api/ideas` handler is 35 lines — split into `validateAndSanitize()` + `create()` + handler

---

## 5. Error Handling

### Backend
- Every async Express handler must be wrapped in `try/catch` (or use `asyncHandler`)
- Differentiate error types: validation errors → 400, not-found → 404, auth → 401, server errors → 500
- The global error handler should handle Prisma-specific errors (unique constraint violations, record not found, etc.)
- Never silently swallow errors:
  ```typescript
  // BAD — error swallowed, user sees nothing:
  error: () => this.isLoading.set(false)
  
  // GOOD — user gets feedback:
  error: (err) => { this.isLoading.set(false); this.toasts.error('...'); }
  ```

### Frontend
- Every HTTP call must have `.error()` handler
- Optimistic updates must have rollback on failure (see `idea-vault.component.ts:changeStatus` which saves `previous` state and restores on error)
- Do NOT show both an inline error AND a toast for the same failure — pick one
- Stale HTTP subscriptions must be unsubscribed before creating new ones to prevent race conditions when switching channels

---

## 6. Comments

Code should be self-documenting. Comments should explain **why**, not **what**.

```typescript
// BAD — states the obvious:
// Increment the counter
nextId++;

// GOOD — explains the reasoning:
// Use manual ID assignment so that auto-increment doesn't collide with
// hardcoded IDs in seed data. This ensures reproducibility across runs.
mockDb.setNextIdeaId(3);
```

- **No commented-out code.** Delete it. Git history exists.
- **Section comments** (`// ── Channels ──`) are acceptable for grouping in long files
- Avoid noisy inline comments like `// ── Tags ──` in the middle of a function — extract the function instead

---

## 7. Consistent Formatting

- **2-space indentation** throughout (TypeScript, HTML, JSON)
- **Semicolons required**
- **Single quotes** for strings
- **Trailing commas** in multiline objects/arrays
- **Alphabetical imports** where practical
- **No unused imports** — remove them

---

## 8. TypeScript-Specific Rules

### Strict Types
- Never use `any` unless absolutely necessary (e.g., `unknown` first, then narrow)
  ```typescript
  // BAD:
  private channelEffect: any;
  
  // GOOD:
  private channelEffect: EffectRef | undefined;
  ```
- Mock objects in tests should use `Partial<T>` or explicit interfaces, not `any`

### Signals & Computeds
- Use `computed` for derived values, **not** plain arrow functions on the template:
  ```typescript
  // BAD — executes on every change detection:
  parsedColors = () => JSON.parse(this.colors());
  
  // GOOD — only recomputes when dependencies change:
  parsedColors = computed(() => {
    try { const p = JSON.parse(this.colors()); return Array.isArray(p) ? p : null; } catch { return null; }
  });
  ```

### Effect Cleanup
- When using `effect()` outside a constructor, store the `EffectRef` and call `.destroy()` in `ngOnDestroy`
- When using `effect()` in a constructor, Angular auto-manages lifecycle — but if the effect should run only once (like a redirect), destroy it manually

---

## 9. HTML Templates

- **No inline templates** in `@Component` metadata for files over 30 lines — extract to `.html`
- **Bind magic numbers** to component properties instead of hardcoding in templates:
  ```html
  <!-- BAD -->
  <input maxlength="200">
  
  <!-- GOOD -->
  <input [maxlength]="TITLE_MAX_LENGTH">
  ```
- **No logic in templates** — use component methods/computed signals instead
- Use `@if`, `@for` control flow syntax (Angular 17+) instead of `*ngIf`, `*ngFor`

---

## 10. HTTP Status Codes

Use named constants, not raw numbers:
```typescript
const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};
```

---

## 11. Dependency Injection

- Use `inject()` rather than constructor injection for Angular services — it is more tree-shakeable and eliminates boilerplate
- Prefer `providedIn: 'root'` over module-level providers
- Keep services focused: `ChannelService` talks to `/api/channels` — don't add idea-related methods to it

---

## 12. Testing

- **One `describe` block per component/service/feature**
- **One `it` per behavior** — test names should read as sentences: `"should create a new idea with default status RESEARCHING"`
- **No shared mutable state between tests** — use `beforeEach` to reset
- **Mock at the boundary** — mock HTTP (via `HttpTestingController`) or mock the service, never mock internals
- Test failure paths, not just happy paths

### Router Mocking
- For components that inject `ActivatedRoute`, provide both `snapshot.paramMap` and `paramMap` (as `BehaviorSubject`) in the mock
- `provideRouter[]` may override custom `ActivatedRoute` mocks — remove it if the component does not need real routing
- For `Router` mock in `app.spec.ts`, include `routerState: { root: {} }` to satisfy `RouterLinkActive`

### Subscription Cleanup in Tests
- Component tests should not leave open subscriptions
- Use `fixture.detectChanges()` to trigger `ngOnInit` before testing event-driven behavior

---

## 13. Angular Routing Patterns

### Channel-Driven Routes
All feature components follow this pattern for reading `channelId`:

```typescript
constructor() {
  // 1. Snapshot for initial load (synchronous)
  const initialId = this.route.snapshot.paramMap.get('channelId');
  this.channelId.set(initialId);
  if (initialId) this.loadData();
}

ngOnInit(): void {
  // 2. Subscription for subsequent param changes (asynchronous)
  const sub = this.route.paramMap.subscribe(params => {
    const newId = params.get('channelId');
    if (newId && newId !== this.channelId()) {
      this.channelId.set(newId);
      this.loadData();
    }
  });
  this.destroyRef.onDestroy(() => sub.unsubscribe());
}
```

This avoids race conditions from stale HTTP subscriptions when switching channels rapidly.

### Effect-Based Redirect
For the root `/` route, use `effect()` with self-destroy:
```typescript
constructor() {
  this.effectRef = effect(() => {
    const channels = this.store.channels();
    if (channels.length > 0) {
      this.effectRef?.destroy();
      this.router.navigate(['/channel', channels[0].id, 'ideas'], { replaceUrl: true });
    }
  });
}
```

---

## Enforcement

- **TypeScript strict mode** enables most type-level enforcement
- **Frontend tests must pass** via `ng test --watch=false`
- **Backend tests must pass** via `npx vitest run` in `backend/`
- **E2E tests must pass** via `npx cypress run` in `frontend/`
- **Code review checklist:**
  - [ ] No `any` types
  - [ ] No magic numbers/strings
  - [ ] No commented-out code
  - [ ] Error handlers on every HTTP call
  - [ ] Optimistic updates have rollback
  - [ ] Functions under ~30 lines
  - [ ] Tests for both success and failure paths
  - [ ] Subscription cleanup before new HTTP calls
  - [ ] `snapshot.paramMap` + `paramMap.subscribe` for route params
