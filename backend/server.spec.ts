import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

interface IdeaRecord {
  id: string;
  title: string;
  description: string | null;
  status: string;
  channelId: string;
  audiencePersonaId: string | null;
  createdAt: string;
  updatedAt: string;
  persona: Record<string, unknown> | null;
  tags: { tagId: string; tag: { id: string; name: string; color: string | null } }[];
}

interface ChannelRecord {
  id: string;
  name: string;
  handle: string;
  niche: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { ideas: number };
}

interface PersonaRecord {
  id: string;
  channelId: string;
  name: string;
  demographics: string | null;
  painPoints: string | null;
  createdAt: string;
}

interface BrandKitRecord {
  channelId: string;
  colors: string | null;
  typography: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TagRecord {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

interface AssetRecord {
  id: string;
  name: string;
  type: string;
  url: string;
  sizeBytes: number | null;
  mimeType: string | null;
  isShared: boolean;
  isSuggested: boolean;
  channelId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SeriesRecord {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  sourceType: string;
  sourceName: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { episodes: number };
}

interface EpisodeRecord {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  content: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const { mockDb, mockPrisma, resetMockDb } = vi.hoisted(() => {
  const channels: ChannelRecord[] = [];
  const personas: PersonaRecord[] = [];
  const brandKits: Map<string, BrandKitRecord> = new Map();
  const tags: TagRecord[] = [];
  const ideas: IdeaRecord[] = [];
  const ideaTags: { ideaId: string; tagId: string }[] = [];
  const assets: AssetRecord[] = [];
  const seriesList: SeriesRecord[] = [];
  const episodes: EpisodeRecord[] = [];
  let nextChannelId = 1;
  let nextPersonaId = 1;
  let nextTagId = 1;
  let nextIdeaId = 1;
  let nextAssetId = 1;
  let nextSeriesId = 1;
  let nextEpisodeId = 1;

  function addInclude(result: any, include?: any) {
    if (include?.persona) result.persona = personas.find((p) => p.id === result.audiencePersonaId) ?? null;
    if (include?.tags) result.tags = ideaTags.filter((it) => it.ideaId === result.id).map((it) => ({
      tagId: it.tagId,
      tag: tags.find((t) => t.id === it.tagId)!,
    }));
    if (include?._count?.select?.ideas) result._count = { ideas: ideas.filter((i) => i.channelId === result.id).length };
    return result;
  }

  const prisma = {
    channel: {
      findMany: ({ orderBy, include }: any = {}) => {
        let items = [...channels];
        if (orderBy?.createdAt === 'asc') items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return Promise.resolve(items.map((c) => include ? addInclude({ ...c }, include) : c));
      },
      findUnique: ({ where: { id }, include }: { where: { id: string }; include?: any }) => {
        const ch = channels.find((c) => c.id === id);
        if (!ch) return Promise.resolve(null);
        return Promise.resolve(include ? addInclude({ ...ch }, include) : ch);
      },
      create: ({ data }: { data: { name: string; handle: string; niche?: string | null } }) => {
        const now = new Date().toISOString();
        const ch: ChannelRecord = { id: String(nextChannelId++), name: data.name, handle: data.handle, niche: data.niche ?? null, createdAt: now, updatedAt: now };
        channels.push(ch);
        return Promise.resolve(ch);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const ch = channels.find((c) => c.id === where.id);
        if (!ch) return Promise.reject(new Error('Not found'));
        Object.assign(ch, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(ch);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = channels.findIndex((c) => c.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = channels.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
    audiencePersona: {
      findMany: ({ where, orderBy }: { where?: { channelId?: string }; orderBy?: { name?: 'asc' } } = {}) => {
        let items = [...personas];
        if (where?.channelId) items = items.filter((p) => p.channelId === where.channelId);
        if (orderBy?.name === 'asc') items.sort((a, b) => a.name.localeCompare(b.name));
        return Promise.resolve(items);
      },
      findUnique: ({ where: { id } }: { where: { id: string } }) => {
        return Promise.resolve(personas.find((p) => p.id === id) ?? null);
      },
      create: ({ data }: { data: { channelId: string; name: string; demographics?: string | null; painPoints?: string | null } }) => {
        const now = new Date().toISOString();
        const p: PersonaRecord = { id: String(nextPersonaId++), channelId: data.channelId, name: data.name, demographics: data.demographics ?? null, painPoints: data.painPoints ?? null, createdAt: now };
        personas.push(p);
        return Promise.resolve(p);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = personas.findIndex((p) => p.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = personas.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
    brandKit: {
      findUnique: ({ where: { channelId } }: { where: { channelId: string } }) => {
        return Promise.resolve(brandKits.get(channelId) ?? null);
      },
      upsert: ({ where: { channelId }, update, create }: { where: { channelId: string }; update: Record<string, unknown>; create: Record<string, unknown> }) => {
        const now = new Date().toISOString();
        const existing = brandKits.get(channelId);
        if (existing) {
          Object.assign(existing, update, { updatedAt: now });
          return Promise.resolve(existing);
        }
        const kit: BrandKitRecord = { channelId, colors: (create.colors as string) ?? null, typography: (create.typography as string) ?? null, logoUrl: (create.logoUrl as string) ?? null, bannerUrl: (create.bannerUrl as string) ?? null, createdAt: now, updatedAt: now };
        brandKits.set(channelId, kit);
        return Promise.resolve(kit);
      },
    },
    tag: {
      findMany: ({ orderBy }: { orderBy?: { name?: 'asc' } } = {}) => {
        let items = [...tags];
        if (orderBy?.name === 'asc') items.sort((a, b) => a.name.localeCompare(b.name));
        return Promise.resolve(items);
      },
      create: ({ data }: { data: { name: string; color?: string | null } }) => {
        const now = new Date().toISOString();
        const t: TagRecord = { id: String(nextTagId++), name: data.name, color: data.color ?? null, createdAt: now };
        tags.push(t);
        return Promise.resolve(t);
      },
    },
    idea: {
      findMany: ({ where, orderBy, include }: { where?: Record<string, unknown>; orderBy?: { createdAt?: 'asc' | 'desc' }; include?: Record<string, unknown> } = {}) => {
        let items = [...ideas];
        if (where?.channelId) items = items.filter((i) => i.channelId === where.channelId);
        if (where?.audiencePersonaId) items = items.filter((i) => i.audiencePersonaId === where.audiencePersonaId);
        if (where?.tags) {
          const tagId = (where.tags as any).some.tagId;
          items = items.filter((i) => ideaTags.some((it) => it.ideaId === i.id && it.tagId === tagId));
        }
        if (orderBy?.createdAt === 'desc') items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return Promise.resolve(items.map((i) => include ? addInclude({ ...i }, include) : i));
      },
      findUnique: ({ where: { id }, include }: { where: { id: string }; include?: any }) => {
        const idea = ideas.find((i) => i.id === id);
        if (!idea) return Promise.resolve(null);
        return Promise.resolve(include ? addInclude({ ...idea }, include) : idea);
      },
      create: ({ data, include }: { data: Record<string, unknown>; include?: any }) => {
        const now = new Date().toISOString();
        const idea: IdeaRecord = {
          id: String(nextIdeaId++),
          title: data.title as string,
          description: (data.description as string) ?? null,
          status: (data.status as string) ?? 'RESEARCHING',
          channelId: data.channelId as string,
          audiencePersonaId: (data.audiencePersonaId as string) ?? null,
          createdAt: now,
          updatedAt: now,
          persona: null,
          tags: [],
        };
        ideas.push(idea);
        const tagsData = data.tags as any;
        if (tagsData?.create) {
          for (const t of tagsData.create as { tagId: string }[]) {
            ideaTags.push({ ideaId: idea.id, tagId: t.tagId });
          }
        }
        return Promise.resolve(include ? addInclude({ ...idea }, include) : idea);
      },
      update: ({ where, data, include }: { where: { id: string }; data: Record<string, unknown>; include?: any }) => {
        const idea = ideas.find((i) => i.id === where.id);
        if (!idea) return Promise.reject(new Error('Not found'));
        if (data.channelId !== undefined && data.channelId !== null) idea.channelId = data.channelId as string;
        if (data.audiencePersonaId !== undefined) idea.audiencePersonaId = data.audiencePersonaId as string | null;
        Object.assign(idea, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(include ? addInclude({ ...idea }, include) : idea);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = ideas.findIndex((i) => i.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = ideas.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
    asset: {
      findMany: ({ where }: { where?: Record<string, unknown> } = {}) => {
        let items = [...assets];
        if (where?.channelId) items = items.filter((a) => a.channelId === where.channelId);
        if (where?.type) items = items.filter((a) => a.type === where.type);
        if (where?.isShared) items = items.filter((a) => a.isShared);
        return Promise.resolve(items);
      },
      findUnique: ({ where: { id } }: { where: { id: string } }) => {
        return Promise.resolve(assets.find((a) => a.id === id) ?? null);
      },
      create: ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date().toISOString();
        const asset: AssetRecord = {
          id: String(nextAssetId++),
          name: data.name as string,
          type: data.type as string,
          url: data.url as string,
          sizeBytes: (data.sizeBytes as number) ?? null,
          mimeType: (data.mimeType as string) ?? null,
          isShared: (data.isShared as boolean) ?? false,
          isSuggested: (data.isSuggested as boolean) ?? false,
          channelId: (data.channelId as string) ?? null,
          createdAt: now,
          updatedAt: now,
        };
        assets.push(asset);
        return Promise.resolve(asset);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const asset = assets.find((a) => a.id === where.id);
        if (!asset) return Promise.reject(new Error('Not found'));
        Object.assign(asset, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(asset);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = assets.findIndex((a) => a.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = assets.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
    series: {
      findMany: ({ where, include }: { where?: Record<string, unknown>; include?: any } = {}) => {
        let items = [...seriesList];
        if (where?.channelId) items = items.filter((s) => s.channelId === where.channelId);
        return Promise.resolve(items.map((s) => {
          const result = { ...s };
          if (include?._count?.select?.episodes) {
            result._count = { episodes: episodes.filter((e) => e.seriesId === s.id).length };
          }
          return result;
        }));
      },
      findUnique: ({ where: { id }, include }: { where: { id: string }; include?: any }) => {
        const s = seriesList.find((x) => x.id === id);
        if (!s) return Promise.resolve(null);
        const result = { ...s };
        if (include?._count?.select?.episodes) {
          result._count = { episodes: episodes.filter((e) => e.seriesId === s.id).length };
        }
        return Promise.resolve(result);
      },
      create: ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date().toISOString();
        const s: SeriesRecord = {
          id: String(nextSeriesId++),
          channelId: data.channelId as string,
          title: data.title as string,
          description: (data.description as string) ?? null,
          sourceType: data.sourceType as string,
          sourceName: (data.sourceName as string) ?? null,
          createdAt: now,
          updatedAt: now,
        };
        seriesList.push(s);
        return Promise.resolve(s);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const s = seriesList.find((x) => x.id === where.id);
        if (!s) return Promise.reject(new Error('Not found'));
        Object.assign(s, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(s);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = seriesList.findIndex((x) => x.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = seriesList.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
    episode: {
      findMany: ({ where, orderBy }: { where?: { seriesId?: string }; orderBy?: { episodeNumber?: 'asc' } } = {}) => {
        let items = [...episodes];
        if (where?.seriesId) items = items.filter((e) => e.seriesId === where.seriesId);
        if (orderBy?.episodeNumber === 'asc') items.sort((a, b) => a.episodeNumber - b.episodeNumber);
        return Promise.resolve(items);
      },
      findUnique: ({ where: { id } }: { where: { id: string } }) => {
        return Promise.resolve(episodes.find((e) => e.id === id) ?? null);
      },
      create: ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date().toISOString();
        const ep: EpisodeRecord = {
          id: String(nextEpisodeId++),
          seriesId: data.seriesId as string,
          episodeNumber: data.episodeNumber as number,
          title: data.title as string,
          description: (data.description as string) ?? null,
          content: (data.content as string) ?? null,
          status: (data.status as string) ?? 'DRAFT',
          createdAt: now,
          updatedAt: now,
        };
        episodes.push(ep);
        return Promise.resolve(ep);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const ep = episodes.find((e) => e.id === where.id);
        if (!ep) return Promise.reject(new Error('Not found'));
        Object.assign(ep, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(ep);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = episodes.findIndex((e) => e.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = episodes.splice(idx, 1);
        return Promise.resolve(removed);
      },
      createMany: ({ data }: { data: { seriesId: string; episodeNumber: number; title: string; description?: string | null; content?: string | null }[] }) => {
        const now = new Date().toISOString();
        for (const d of data) {
          episodes.push({
            id: String(nextEpisodeId++),
            seriesId: d.seriesId,
            episodeNumber: d.episodeNumber,
            title: d.title,
            description: d.description ?? null,
            content: d.content ?? null,
            status: 'DRAFT',
            createdAt: now,
            updatedAt: now,
          });
        }
        return Promise.resolve({ count: data.length });
      },
    },
    ideaTag: {
      deleteMany: ({ where }: { where: { ideaId: string } }) => {
        const count = ideaTags.filter((it) => it.ideaId === where.ideaId).length;
        let i = ideaTags.length;
        while (i--) { if (ideaTags[i].ideaId === where.ideaId) ideaTags.splice(i, 1); }
        return Promise.resolve({ count });
      },
      createMany: ({ data }: { data: { ideaId: string; tagId: string }[] }) => {
        for (const d of data) ideaTags.push(d);
        return Promise.resolve({ count: data.length });
      },
    },
  };

  const reset = () => {
    channels.length = 0;
    personas.length = 0;
    brandKits.clear();
    tags.length = 0;
    ideas.length = 0;
    ideaTags.length = 0;
    assets.length = 0;
    seriesList.length = 0;
    episodes.length = 0;
    nextChannelId = 1;
    nextPersonaId = 1;
    nextTagId = 1;
    nextIdeaId = 1;
    nextAssetId = 1;
    nextSeriesId = 1;
    nextEpisodeId = 1;
  };

  function setNextIdeaId(n: number) { nextIdeaId = n; }
  return { mockDb: { channels, personas, brandKits, tags, ideas, ideaTags, setNextIdeaId, assets, series: seriesList, episodes }, mockPrisma: prisma, resetMockDb: reset };
});

const { PrismaClientKnownRequestError } = vi.hoisted(() => {
  class CustomError extends Error {};
  return { PrismaClientKnownRequestError: CustomError };
});

vi.mock('./prisma/generated/client.ts', () => ({
  PrismaClient: class {
    constructor() {
      return mockPrisma;
    }
  },
  Prisma: { PrismaClientKnownRequestError },
}));

import { app } from './server';

const CHANNEL_ID = 'ch-1';

function seedBase() {
  resetMockDb();
  mockDb.channels.push({
    id: CHANNEL_ID, name: 'Test Channel', handle: '@test', niche: 'Testing',
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  });
  mockDb.personas.push({
    id: 'p-1', channelId: CHANNEL_ID, name: 'Test Persona', demographics: '18-34', painPoints: 'None',
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  mockDb.tags.push(
    { id: 't-1', name: 'tutorial', color: '#8B5CF6', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 't-2', name: 'review', color: '#10B981', createdAt: '2026-01-01T00:00:00.000Z' },
  );
  mockDb.ideas.push(
    { id: '1', title: 'Idea 1', description: 'Desc 1', status: 'RESEARCHING', channelId: CHANNEL_ID, audiencePersonaId: 'p-1', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z', persona: null, tags: [] },
    { id: '2', title: 'Idea 2', description: 'Desc 2', status: 'PLANNING', channelId: CHANNEL_ID, audiencePersonaId: null, createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z', persona: null, tags: [] },
  );
  mockDb.ideaTags.push({ ideaId: '1', tagId: 't-1' });
  mockDb.setNextIdeaId(3);
  vi.clearAllMocks();
}

// ── Channels API ────────────────────────────────────────────────────

describe('Channels API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/channels', () => {
    it('should list channels', async () => {
      const res = await request(app).get('/api/channels').expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Channel');
      expect(res.body[0]._count).toBeDefined();
    });
  });

  describe('POST /api/channels', () => {
    it('should create a channel', async () => {
      const res = await request(app)
        .post('/api/channels')
        .send({ name: 'New Channel', handle: '@new' })
        .expect(201);
      expect(res.body.name).toBe('New Channel');
      expect(res.body.handle).toBe('@new');
      expect(mockDb.channels).toHaveLength(2);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/channels')
        .send({ handle: '@new' })
        .expect(400);
      expect(res.body.error).toMatch(/name/i);
    });
  });

  describe('PUT /api/channels/:id', () => {
    it('should update a channel', async () => {
      const res = await request(app)
        .put(`/api/channels/${CHANNEL_ID}`)
        .send({ name: 'Updated' })
        .expect(200);
      expect(res.body.name).toBe('Updated');
    });

    it('should return 404 for missing channel', async () => {
      await request(app).put('/api/channels/999').send({ name: 'x' }).expect(404);
    });
  });

  describe('DELETE /api/channels/:id', () => {
    it('should delete a channel', async () => {
      await request(app).delete(`/api/channels/${CHANNEL_ID}`).expect(204);
      expect(mockDb.channels).toHaveLength(0);
    });

    it('should return 404 for missing channel', async () => {
      await request(app).delete('/api/channels/999').expect(404);
    });
  });
});

// ── Personas API ────────────────────────────────────────────────────

describe('Personas API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/personas', () => {
    it('should list personas filtered by channelId', async () => {
      const res = await request(app).get(`/api/personas?channelId=${CHANNEL_ID}`).expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Persona');
    });

    it('should list all personas when no filter', async () => {
      const res = await request(app).get('/api/personas').expect(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /api/personas', () => {
    it('should create a persona', async () => {
      const res = await request(app)
        .post('/api/personas')
        .send({ channelId: CHANNEL_ID, name: 'New Persona' })
        .expect(201);
      expect(res.body.name).toBe('New Persona');
    });

    it('should reject missing channelId', async () => {
      await request(app).post('/api/personas').send({ name: 'x' }).expect(400);
    });
  });

  describe('DELETE /api/personas/:id', () => {
    it('should delete a persona', async () => {
      await request(app).delete('/api/personas/p-1').expect(204);
      expect(mockDb.personas).toHaveLength(0);
    });

    it('should return 404 for missing persona', async () => {
      await request(app).delete('/api/personas/999').expect(404);
    });
  });
});

// ── Brand Kits API ─────────────────────────────────────────────────

describe('Brand Kits API', () => {
  beforeEach(() => {
    seedBase();
    mockDb.brandKits.set(CHANNEL_ID, {
      channelId: CHANNEL_ID, colors: '["#8B5CF6"]', typography: 'Inter', logoUrl: null, bannerUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  describe('GET /api/brand-kits/:channelId', () => {
    it('should return brand kit', async () => {
      const res = await request(app).get(`/api/brand-kits/${CHANNEL_ID}`).expect(200);
      expect(res.body.typography).toBe('Inter');
    });

    it('should return 404 if not found', async () => {
      await request(app).get('/api/brand-kits/999').expect(404);
    });
  });

  describe('PUT /api/brand-kits/:channelId', () => {
    it('should upsert brand kit', async () => {
      const res = await request(app)
        .put(`/api/brand-kits/${CHANNEL_ID}`)
        .send({ typography: 'Poppins' })
        .expect(200);
      expect(res.body.typography).toBe('Poppins');
    });

    it('should create brand kit if missing', async () => {
      mockDb.brandKits.clear();
      const res = await request(app)
        .put('/api/brand-kits/new-id')
        .send({ typography: 'Mono' })
        .expect(200);
      expect(res.body.typography).toBe('Mono');
      expect(res.body.channelId).toBe('new-id');
    });
  });
});

// ── Tags API ────────────────────────────────────────────────────────

describe('Tags API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/tags', () => {
    it('should list all tags', async () => {
      const res = await request(app).get('/api/tags').expect(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /api/tags', () => {
    it('should create a tag', async () => {
      const res = await request(app)
        .post('/api/tags')
        .send({ name: 'new-tag', color: '#fff' })
        .expect(201);
      expect(res.body.name).toBe('new-tag');
      expect(mockDb.tags).toHaveLength(3);
    });

    it('should reject missing name', async () => {
      await request(app).post('/api/tags').send({}).expect(400);
    });
  });
});

// ── Ideas API ───────────────────────────────────────────────────────

describe('Ideas API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/ideas', () => {
    it('should return all ideas sorted by createdAt desc', async () => {
      const res = await request(app).get('/api/ideas').expect(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe('2');
      expect(res.body[1].id).toBe('1');
    });

    it('should filter by channelId', async () => {
      const res = await request(app).get(`/api/ideas?channelId=${CHANNEL_ID}`).expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('should filter by personaId', async () => {
      const res = await request(app).get('/api/ideas?personaId=p-1').expect(200);
      expect(res.body).toHaveLength(1);
    });

    it('should filter by tagId', async () => {
      const res = await request(app).get('/api/ideas?tagId=t-1').expect(200);
      expect(res.body).toHaveLength(1);
    });

    it('should include persona and tags', async () => {
      const res = await request(app).get('/api/ideas').expect(200);
      for (const idea of res.body) {
        expect(idea).toHaveProperty('persona');
        expect(idea).toHaveProperty('tags');
      }
    });
  });

  describe('POST /api/ideas', () => {
    it('should create a new idea', async () => {
      const newIdea = { title: 'New Idea', description: 'New Desc', channelId: CHANNEL_ID };

      const res = await request(app)
        .post('/api/ideas')
        .send(newIdea)
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(newIdea.title);
      expect(res.body.status).toBe('RESEARCHING');
      expect(res.body.channelId).toBe(CHANNEL_ID);
      expect(mockDb.ideas).toHaveLength(3);
    });

    it('should create with tags', async () => {
      const res = await request(app)
        .post('/api/ideas')
        .send({ title: 'Tagged Idea', channelId: CHANNEL_ID, tagIds: ['t-1', 't-2'] })
        .expect(201);
      expect(res.body.tags).toHaveLength(2);
    });

    it('should reject when title is missing', async () => {
      const res = await request(app)
        .post('/api/ideas')
        .send({ description: 'no title', channelId: CHANNEL_ID })
        .expect(400);
      expect(res.body.error).toMatch(/title/i);
    });

    it('should reject when channelId is missing', async () => {
      const res = await request(app)
        .post('/api/ideas')
        .send({ title: 'No channel' })
        .expect(400);
      expect(res.body.error).toMatch(/channelId/i);
    });

    it('should reject an unknown status', async () => {
      const res = await request(app)
        .post('/api/ideas')
        .send({ title: 'Bad', status: 'BOGUS', channelId: CHANNEL_ID })
        .expect(400);
      expect(res.body.error).toMatch(/status/i);
    });
  });

  describe('PUT /api/ideas/:id', () => {
    it('should update an existing idea', async () => {
      const updatedData = { title: 'Updated Idea 1', description: 'Updated Desc 1', status: 'IN_PROGRESS', channelId: CHANNEL_ID };

      const res = await request(app)
        .put('/api/ideas/1')
        .send(updatedData)
        .expect(200);

      expect(res.body.id).toBe('1');
      expect(res.body.title).toBe(updatedData.title);
      expect(res.body.status).toBe(updatedData.status);
    });

    it('should partially update with just a status change', async () => {
      const res = await request(app)
        .put('/api/ideas/1')
        .send({ status: 'COMPLETED', channelId: CHANNEL_ID })
        .expect(200);

      expect(res.body.title).toBe('Idea 1');
      expect(res.body.status).toBe('COMPLETED');
    });

    it('should update tags when tagIds provided', async () => {
      const res = await request(app)
        .put('/api/ideas/1')
        .send({ tagIds: ['t-2'], channelId: CHANNEL_ID })
        .expect(200);
      expect(res.body.tags).toHaveLength(1);
      expect(res.body.tags[0].tagId).toBe('t-2');
    });

    it('should return 404 if idea not found', async () => {
      const res = await request(app)
        .put('/api/ideas/999')
        .send({ title: 'Ghost', channelId: CHANNEL_ID })
        .expect(404);
      expect(res.body.error).toBe('Idea not found');
    });
  });

  describe('DELETE /api/ideas/:id', () => {
    it('should delete an existing idea', async () => {
      await request(app).delete('/api/ideas/1').expect(204);
      expect(mockDb.ideas).toHaveLength(1);
    });

    it('should return 404 when deleting a missing idea', async () => {
      await request(app).delete('/api/ideas/999').expect(404);
    });
  });
});

// ── Assets API ──────────────────────────────────────────────────────

describe('Assets API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/assets', () => {
    it('should list assets', async () => {
      const res = await request(app).get('/api/assets').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should filter by channelId', async () => {
      mockDb.assets.push({
        id: 'a-1', name: 'Test Asset', type: 'IMAGE', url: 'http://example.com/img.png',
        sizeBytes: null, mimeType: null, isShared: false, isSuggested: false,
        channelId: CHANNEL_ID, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const res = await request(app).get(`/api/assets?channelId=${CHANNEL_ID}`).expect(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /api/assets', () => {
    it('should create an asset', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ name: 'My Image', type: 'IMAGE', url: 'http://example.com/img.png', channelId: CHANNEL_ID })
        .expect(201);
      expect(res.body.name).toBe('My Image');
      expect(res.body.type).toBe('IMAGE');
      expect(mockDb.assets).toHaveLength(1);
    });

    it('should reject invalid type', async () => {
      await request(app)
        .post('/api/assets')
        .send({ name: 'Bad', type: 'GIF', url: 'http://example.com/g.gif', channelId: CHANNEL_ID })
        .expect(400);
    });

    it('should reject missing name', async () => {
      await request(app)
        .post('/api/assets')
        .send({ type: 'IMAGE', url: 'http://example.com/img.png' })
        .expect(400);
    });
  });

  describe('PUT /api/assets/:id', () => {
    it('should update an asset', async () => {
      const created = await request(app)
        .post('/api/assets')
        .send({ name: 'Original', type: 'IMAGE', url: 'http://example.com/img.png', channelId: CHANNEL_ID });
      const res = await request(app)
        .put(`/api/assets/${created.body.id}`)
        .send({ name: 'Updated' })
        .expect(200);
      expect(res.body.name).toBe('Updated');
    });

    it('should return 404 for missing asset', async () => {
      await request(app).put('/api/assets/999').send({ name: 'x' }).expect(404);
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('should delete an asset', async () => {
      const created = await request(app)
        .post('/api/assets')
        .send({ name: 'To Delete', type: 'VIDEO', url: 'http://example.com/v.mp4', channelId: CHANNEL_ID });
      await request(app).delete(`/api/assets/${created.body.id}`).expect(204);
      expect(mockDb.assets).toHaveLength(0);
    });

    it('should return 404 for missing asset', async () => {
      await request(app).delete('/api/assets/999').expect(404);
    });
  });

  describe('POST /api/assets/upload', () => {
    it('should upload a file and create asset', async () => {
      const res = await request(app)
        .post('/api/assets/upload')
        .field('name', 'Test Upload')
        .field('type', 'IMAGE')
        .field('channelId', CHANNEL_ID)
        .attach('file', Buffer.from('fake-image-data'), 'test.png')
        .expect(201);
      expect(res.body.name).toBe('Test Upload');
      expect(res.body.type).toBe('IMAGE');
      expect(res.body.mimeType).toBe('image/png');
      expect(res.body.sizeBytes).toBe(15);
      expect(res.body.url).toMatch(/^\/uploads\/assets\/images\//);
      expect(mockDb.assets).toHaveLength(1);
    });

    it('should use filename as name when name not provided', async () => {
      const res = await request(app)
        .post('/api/assets/upload')
        .field('type', 'IMAGE')
        .field('channelId', CHANNEL_ID)
        .attach('file', Buffer.from('data'), 'logo.png')
        .expect(201);
      expect(res.body.name).toBe('logo.png');
    });

    it('should reject invalid type', async () => {
      await request(app)
        .post('/api/assets/upload')
        .field('type', 'GIF')
        .field('channelId', CHANNEL_ID)
        .attach('file', Buffer.from('data'), 'test.gif')
        .expect(400);
    });

    it('should reject missing file', async () => {
      await request(app)
        .post('/api/assets/upload')
        .field('name', 'No File')
        .field('type', 'IMAGE')
        .field('channelId', CHANNEL_ID)
        .expect(400);
    });
  });
});

// ── Series API ──────────────────────────────────────────────────────

describe('Series API', () => {
  beforeEach(() => { seedBase(); });

  describe('GET /api/series', () => {
    it('should list series', async () => {
      const res = await request(app).get('/api/series').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should include episode count', async () => {
      const created = await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, title: 'Test Series', sourceType: 'TOPIC' });
      mockDb.episodes.push({
        id: 'e-1', seriesId: created.body.id, episodeNumber: 1, title: 'Ep 1',
        description: null, content: null, status: 'DRAFT',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const res = await request(app).get('/api/series').expect(200);
      expect(res.body[0]._count.episodes).toBe(1);
    });
  });

  describe('POST /api/series', () => {
    it('should create a series', async () => {
      const res = await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, title: 'Clean Code Series', sourceType: 'BOOK', sourceName: 'Clean Code' })
        .expect(201);
      expect(res.body.title).toBe('Clean Code Series');
      expect(res.body.sourceType).toBe('BOOK');
      expect(mockDb.series).toHaveLength(1);
    });

    it('should reject missing title', async () => {
      await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, sourceType: 'TOPIC' })
        .expect(400);
    });

    it('should reject missing channelId', async () => {
      await request(app)
        .post('/api/series')
        .send({ title: 'x', sourceType: 'TOPIC' })
        .expect(400);
    });
  });

  describe('PUT /api/series/:id', () => {
    it('should update a series', async () => {
      const created = await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, title: 'Original', sourceType: 'CUSTOM' });
      const res = await request(app)
        .put(`/api/series/${created.body.id}`)
        .send({ title: 'Updated' })
        .expect(200);
      expect(res.body.title).toBe('Updated');
    });

    it('should return 404 for missing series', async () => {
      await request(app).put('/api/series/999').send({ title: 'x' }).expect(404);
    });
  });

  describe('DELETE /api/series/:id', () => {
    it('should delete a series', async () => {
      const created = await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, title: 'Delete Me', sourceType: 'TOPIC' });
      await request(app).delete(`/api/series/${created.body.id}`).expect(204);
      await request(app).get('/api/series').expect(200);
    });
  });

  describe('GET /api/series/:id', () => {
    it('should return a single series with episode count', async () => {
      const created = await request(app)
        .post('/api/series')
        .send({ channelId: CHANNEL_ID, title: 'Single Series', sourceType: 'TOPIC', description: 'A test' });
      mockDb.episodes.push({
        id: 'e-1', seriesId: created.body.id, episodeNumber: 1, title: 'Ep 1',
        description: null, content: null, status: 'DRAFT',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const res = await request(app).get(`/api/series/${created.body.id}`).expect(200);
      expect(res.body.title).toBe('Single Series');
      expect(res.body.description).toBe('A test');
      expect(res.body._count.episodes).toBe(1);
    });

    it('should return 404 for missing series', async () => {
      await request(app).get('/api/series/999').expect(404);
    });
  });
});

// ── Episodes API ────────────────────────────────────────────────────

describe('Episodes API', () => {
  let seriesId: string;

  beforeEach(async () => {
    seedBase();
    const res = await request(app)
      .post('/api/series')
      .send({ channelId: CHANNEL_ID, title: 'Test Series', sourceType: 'TOPIC' });
    seriesId = res.body.id;
  });

  describe('GET /api/series/:id/episodes', () => {
    it('should list episodes ordered by episodeNumber', async () => {
      mockDb.episodes.push(
        { id: 'e-1', seriesId, episodeNumber: 2, title: 'Ep 2', description: null, content: null, status: 'DRAFT', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 'e-2', seriesId, episodeNumber: 1, title: 'Ep 1', description: null, content: null, status: 'DRAFT', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      );
      const res = await request(app).get(`/api/series/${seriesId}/episodes`).expect(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].episodeNumber).toBe(1);
      expect(res.body[1].episodeNumber).toBe(2);
    });

    it('should return 404 for missing series', async () => {
      await request(app).get('/api/series/999/episodes').expect(404);
    });
  });

  describe('POST /api/episodes', () => {
    it('should create an episode', async () => {
      const res = await request(app)
        .post('/api/episodes')
        .send({ seriesId, episodeNumber: 1, title: 'Introduction', content: 'Script content', status: 'SCRIPTING' })
        .expect(201);
      expect(res.body.title).toBe('Introduction');
      expect(res.body.status).toBe('SCRIPTING');
      expect(res.body.episodeNumber).toBe(1);
    });

    it('should default status to DRAFT', async () => {
      const res = await request(app)
        .post('/api/episodes')
        .send({ seriesId, episodeNumber: 1, title: 'Draft Ep' })
        .expect(201);
      expect(res.body.status).toBe('DRAFT');
    });

    it('should reject invalid status', async () => {
      await request(app)
        .post('/api/episodes')
        .send({ seriesId, episodeNumber: 1, title: 'Bad', status: 'BOGUS' })
        .expect(400);
    });

    it('should reject missing seriesId', async () => {
      await request(app)
        .post('/api/episodes')
        .send({ episodeNumber: 1, title: 'No Series' })
        .expect(400);
    });
  });

  describe('PUT /api/episodes/:id', () => {
    it('should update an episode', async () => {
      const created = await request(app)
        .post('/api/episodes')
        .send({ seriesId, episodeNumber: 1, title: 'Original' });
      const res = await request(app)
        .put(`/api/episodes/${created.body.id}`)
        .send({ title: 'Updated', status: 'COMPLETED' })
        .expect(200);
      expect(res.body.title).toBe('Updated');
      expect(res.body.status).toBe('COMPLETED');
    });

    it('should return 404 for missing episode', async () => {
      await request(app).put('/api/episodes/999').send({ title: 'x' }).expect(404);
    });
  });

  describe('DELETE /api/episodes/:id', () => {
    it('should delete an episode', async () => {
      const created = await request(app)
        .post('/api/episodes')
        .send({ seriesId, episodeNumber: 1, title: 'To Delete' });
      await request(app).delete(`/api/episodes/${created.body.id}`).expect(204);
    });

    it('should return 404 for missing episode', async () => {
      await request(app).delete('/api/episodes/999').expect(404);
    });
  });
});

// ── Batch Import API ────────────────────────────────────────────────

describe('Batch Import API', () => {
  let seriesId: string;

  beforeEach(async () => {
    seedBase();
    const res = await request(app)
      .post('/api/series')
      .send({ channelId: CHANNEL_ID, title: 'Series for Import', sourceType: 'TOPIC' });
    seriesId = res.body.id;
  });

  describe('POST /api/series/:id/import-episodes', () => {
    it('should bulk-insert episodes', async () => {
      const episodesPayload = [
        { episodeNumber: 1, title: 'Getting Started', content: 'Outline for ep 1' },
        { episodeNumber: 2, title: 'Deep Dive', content: 'Outline for ep 2' },
        { episodeNumber: 3, title: 'Conclusion', content: 'Wrap up' },
      ];
      const res = await request(app)
        .post(`/api/series/${seriesId}/import-episodes`)
        .send({ episodes: episodesPayload })
        .expect(201);
      expect(res.body).toHaveLength(3);
      expect(res.body[0].title).toBe('Getting Started');
      expect(res.body[2].episodeNumber).toBe(3);
    });

    it('should auto-assign episode numbers', async () => {
      const res = await request(app)
        .post(`/api/series/${seriesId}/import-episodes`)
        .send({ episodes: [{ title: 'First' }, { title: 'Second' }] })
        .expect(201);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].episodeNumber).toBe(1);
      expect(res.body[1].episodeNumber).toBe(2);
    });

    it('should reject empty array', async () => {
      await request(app)
        .post(`/api/series/${seriesId}/import-episodes`)
        .send({ episodes: [] })
        .expect(400);
    });

    it('should reject missing episodes field', async () => {
      await request(app)
        .post(`/api/series/${seriesId}/import-episodes`)
        .send({})
        .expect(400);
    });

    it('should return 404 for missing series', async () => {
      await request(app)
        .post('/api/series/999/import-episodes')
        .send({ episodes: [{ title: 'Orphan' }] })
        .expect(404);
    });
  });
});
