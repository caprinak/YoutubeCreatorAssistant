# CreatorHub — Multi-Channel & Content Asset Architecture

To elevate CreatorHub from a text-based idea tracker into a true **Creative Studio Management System**, the architecture must expand to handle rich media (audio, video, images), brand identity, and multi-channel networks.

## 1. Multi-Channel & Audience Strategy
Many creators run a "Network" (e.g., Main Channel, Vlogs, Podcast, Shorts). Mixing these ideas in one vault creates chaos.
*   **The Hub Model:** The application will sit above individual channels. The user selects a `Channel` context (or views a master dashboard).
*   **Audience Personas:** Before a video is approved, the creator must know *who* it is for. We will introduce `AudiencePersona` profiles (e.g., "Beginner Coders", "Tech Enthusiasts 18-35"). Every `Idea` must be mapped to a Persona to ensure the content serves the audience.

## 2. Brand Consistency & The "Brand Kit"
Consistency builds trust. Editors and designers need immediate access to the channel's exact styling.
*   **The Solution:** A dedicated `BrandKit` module per Channel.
*   **What it stores:** 
    *   Exact Hex color palettes.
    *   Typography files (TTF/OTF).
    *   High-res vector Logos and Banners.
    *   Standardized Intro/Outro video stingers.
    *   This ensures that any freelancer hired automatically has the correct assets.

## 3. Rich Media Asset Management (The "Not Only Text" Shift)
The application must natively understand and preview rich media, rather than relying on external Google Drive links.
*   **Thumbnail Storage & Iteration:** 
    *   A dedicated "Thumbnail Lab" within an Idea card.
    *   Store multiple iterations (V1, V2, V3) for A/B testing.
    *   Support for storing source files (PSDs, Figma links) alongside the exported PNGs.
*   **Audio & SFX Vault:**
    *   A global asset library for the Channel.
    *   Store reusable background music tracks, standard sound effects (whooshes, pops), and voiceover files.
    *   In-browser audio playback directly inside the app.

## 4. Technical Storage Architecture
Text goes in a database, but large binaries (audio, images, PSDs) require a different approach so the app doesn't crash.

*   **Local MVP Phase:**
    *   Files are uploaded via multipart/form-data to the Express backend.
    *   Stored securely in a local `backend/uploads/` directory.
    *   The database stores the *relative URL path* to serve the file statically.
*   **Production Phase (Cloud Integration):**
    *   Integrate an **Object Storage** solution (AWS S3, Cloudflare R2, or Supabase Storage).
    *   **CDN Delivery:** Assets are served via a Content Delivery Network for lightning-fast loading of high-res thumbnails.
    *   **Image Processing API:** On-the-fly resizing for thumbnails to ensure the UI remains snappy even when 10MB raw files are uploaded.

---

## 5. Proposed Data Models for Creative Expansion

This proposed architecture introduces new core entities to support channels, branding, and heavy media.

```typescript
// 1. Multi-Channel Foundation
export interface Channel {
  id: string;
  name: string;
  handle: string; // e.g., "@CreatorHub"
  niche: string;
  
  // Relations
  ideas: Idea[];
  brandKit: BrandKit;
  personas: AudiencePersona[];
  globalAssets: Asset[]; // Reusable SFX, Music, B-Roll
}

export interface AudiencePersona {
  id: string;
  channelId: string;
  name: string; // e.g., "The Absolute Beginner"
  demographics: string;
  painPoints: string;
}

// 2. The Brand Kit
export interface BrandKit {
  id: string;
  channelId: string;
  colors: string[]; // Array of hex codes: ["#8B5CF6", "#10B981"]
  typography: string; // Font family names or links
  logoUrl: string;
  bannerUrl: string;
}

// 3. Asset Management (Storage)
export interface Asset {
  id: string;
  channelId: string;
  ideaId?: string; // Optional: If linked to a specific video (like a thumbnail)
  
  type: 'THUMBNAIL_DRAFT' | 'THUMBNAIL_FINAL' | 'AUDIO_SFX' | 'AUDIO_MUSIC' | 'VOICEOVER' | 'PROJECT_FILE';
  mimeType: string; // e.g., 'image/png', 'audio/mp3', 'application/x-photoshop'
  sizeBytes: number;
  
  fileUrl: string; // AWS S3 URL or local /uploads/path
  fileName: string;
  
  uploadedAt: string;
}

// 4. Updated Idea Model
export interface Idea {
  id: string;
  channelId: string;               // Every idea belongs to a specific channel
  audiencePersonaId: string;       // Who is this video for?
  
  title: string;
  description: string;             // Rich text script
  status: string;

  // Media Relations
  assets: Asset[];                 // Thumbnails, voiceovers, etc. tied to this video
}
```

### The UI Flow Implementation:
1.  **Sidebar Update:** A dropdown at the very top of the sidebar allows the user to switch between "Channels".
2.  **Asset Tab:** Inside the `IdeaVaultComponent` modal, a dedicated "Media Lab" tab featuring a drag-and-drop file uploader.
3.  **Preview Player:** Audio components (`<audio controls>`) render automatically for audio assets, and image galleries display thumbnail iterations side-by-side.
