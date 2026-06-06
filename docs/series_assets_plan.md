# Series, Episodes & Assets Architecture Plan

## 1. Overview
We are expanding the CreatorHub to include structured asset management and dedicated series/episode planning. Based on your feedback, Series and Episodes will be completely decoupled from the single-video Idea Kanban board, residing in their own dedicated tabs and screens. Furthermore, rather than integrating directly with an external AI API, the platform will feature a powerful **Batch Import** tool, allowing you to paste content generated externally (e.g., ChatGPT, Claude, Gemini) and parse it automatically into a structured episode pipeline.

## 2. Database Schema Modeling (Prisma)

### Asset Library & Physical Storage Strategy
For asset storage, we will use a local directory approach. This removes the complexity of managing third-party cloud storage while ensuring a fast, self-contained local setup.

#### 1. Choice of Tools & Library
* **Backend Upload Handler:** We will use **Multer** (`npm install multer`). It is the standard middleware for handling `multipart/form-data` file uploads in Node.js/Express.
* **Backend Static Serving:** We will use the built-in `express.static` middleware to serve the uploaded files so the Angular frontend can display them easily.
* **Frontend:** We will use Angular's native `HttpClient` combined with the browser's standard `FormData` API to push files to the backend without needing any heavy third-party uploader packages.

#### 2. Physical Organization
When Multer receives a file, it will dynamically route it into subdirectories based on its type to keep the file system tidy:
* `backend/uploads/assets/images/`
* `backend/uploads/assets/videos/`
* `backend/uploads/assets/audio/`

#### 3. Metadata Management Flow
The local filesystem will act as a "dumb" file bucket. All intelligence and metadata will be managed by our Prisma Database. When a user uploads a file, the process will be:
1. **Receive:** Express + Multer receives and saves the file, generating a safe, unique filename (e.g., `uuid-filename.png`).
2. **Parse:** Multer parses the physical metadata (like `sizeBytes` and `mimeType`).
3. **Database Insert:** We take that data, alongside the user's custom name and `channelId`, and create a new record in the `Asset` table.
4. **URL Storage:** We store the relative URL (e.g., `/assets/images/uuid-filename.png`) in the database so the frontend can reference and display it instantly.

```prisma
model Asset {
  id          String   @id @default(uuid())
  name        String
  type        String   // "AUDIO", "VIDEO", "IMAGE", "THUMBNAIL"
  url         String   // e.g., "/assets/images/uuid-filename.png"
  sizeBytes   Int?
  mimeType    String?
  isShared    Boolean  @default(false)
  isSuggested Boolean  @default(false)
  channelId   String?  // Null means global/system asset
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  channel     Channel? @relation(fields: [channelId], references: [id], onDelete: Cascade)
}
```

### Series & Episodes
By separating Episodes from Ideas, we can maintain a clean, linear structure for series planning without cluttering the Kanban board.
```prisma
model Series {
  id          String   @id @default(uuid())
  channelId   String
  title       String
  description String?
  sourceType  String   // "BOOK", "TOPIC", "CUSTOM"
  sourceName  String?  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  channel  Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)
  episodes Episode[]
}

model Episode {
  id            String   @id @default(uuid())
  seriesId      String
  episodeNumber Int
  title         String
  description   String?
  content       String?  // Scripts, notes, external AI outlines
  status        String   @default("DRAFT") // DRAFT, SCRIPTING, FILMING, EDITING, COMPLETED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  series  Series @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}
```

## 3. Backend Endpoints (Express)

### Asset Endpoints
- `GET /api/assets` - Fetch assets (filterable by channel, type, shared status).
- `POST /api/assets` - Register a new asset by URL (JSON body).
- `POST /api/assets/upload` - **File Upload Endpoint** (multipart/form-data, uses Multer). Receives the file, saves to `uploads/assets/{images,videos,audio}/` with a UUID filename, and creates an Asset record with parsed metadata (`sizeBytes`, `mimeType`, relative URL).
- `PUT /api/assets/:id` - Update asset metadata.
- `DELETE /api/assets/:id` - Delete an asset.

### Series & Episodes Endpoints
- `GET /api/series` - Fetch all series for a channel.
- `POST /api/series` - Create a new series.
- `GET /api/series/:id/episodes` - Fetch episodes for a series, ordered by episode number.
- `POST /api/episodes` - Create a single episode.
- `PUT /api/episodes/:id` - Update episode (status, content, title).
- `POST /api/series/:id/import-episodes` - **Batch Import Endpoint:** Accepts a parsed array of episode objects and bulk-inserts them into the series.

## 4. Frontend Architecture (Angular)

### New Sidebar Navigation
- **Series Planner:** Routes to `/channel/:channelId/series`.
- **Asset Library:** Routes to `/channel/:channelId/assets`.

### Series Planner Screens
1. **Series List View:** Displays cards for each series (e.g. "Clean Code Video Series - 5 Episodes").
2. **Series Detail View:**
   - Header with Series title and description.
   - List/Grid of Episodes (showing status badges, titles, and numbers).
   - **Batch Import Button:** Opens the import wizard.
3. **Batch Import Wizard (Modal):**
   - **Step 1 (Input):** A large text area where the user pastes the external AI-generated text (JSON array or plain structured text).
   - **Step 2 (Preview):** The component parses the text, extracts `episodeNumber`, `title`, and `content`, and displays a preview list. The user can tweak titles or remove rows before confirming.
   - **Step 3 (Submit):** Calls the bulk-insert API to populate the series.

### Asset Library Screen
- A tabbed gallery view (All, Images, Video, Audio, Thumbnails).
- Toggle for "Channel Assets" vs "Shared/Suggested".
- Upload/Add modal to register new asset URLs and types.

## 5. Development Phases
1. **Phase 1: Backend & Database**
   - Update `schema.prisma` and run `npx prisma db push`.
   - Implement Express routes for Assets, Series, and Episodes.
   - Write backend unit tests.
2. **Phase 2: Frontend Asset Library**
   - Create `AssetLibraryComponent`.
   - Implement grid view, filters, and add asset modal.
3. **Phase 3: Frontend Series Planner & Batch Import**
   - Create `SeriesListComponent` and `SeriesDetailComponent`.
   - Implement the Batch Import text parsing logic and wizard.
   - Integrate with the backend endpoints.
