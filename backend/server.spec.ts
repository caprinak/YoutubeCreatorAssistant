import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

interface IdeaRecord {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const { mockIdeas, mockPrisma, resetMockDb } = vi.hoisted(() => {
  const ideas: IdeaRecord[] = [];
  let nextId = 1;
  const prisma = {
    idea: {
      findMany: ({ orderBy }: { orderBy?: { createdAt?: 'asc' | 'desc' } } = {}) => {
        const items = [...ideas];
        if (orderBy?.createdAt === 'desc') {
          items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return Promise.resolve(items);
      },
      findUnique: ({ where: { id } }: { where: { id: string } }) => {
        return Promise.resolve(ideas.find((i) => i.id === id) ?? null);
      },
      create: ({ data }: { data: { title: string; description?: string | null; status?: string } }) => {
        const now = new Date().toISOString();
        const idea: IdeaRecord = {
          id: String(nextId++),
          title: data.title,
          description: data.description ?? null,
          status: data.status ?? 'RESEARCHING',
          createdAt: now,
          updatedAt: now,
        };
        ideas.push(idea);
        return Promise.resolve(idea);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idea = ideas.find((i) => i.id === where.id);
        if (!idea) return Promise.reject(new Error('Not found'));
        Object.assign(idea, data, { updatedAt: new Date().toISOString() });
        return Promise.resolve(idea);
      },
      delete: ({ where: { id } }: { where: { id: string } }) => {
        const idx = ideas.findIndex((i) => i.id === id);
        if (idx === -1) return Promise.reject(new Error('Not found'));
        const [removed] = ideas.splice(idx, 1);
        return Promise.resolve(removed);
      },
    },
  };
  const reset = () => {
    ideas.length = 0;
    nextId = 1;
  };
  return { mockIdeas: ideas, mockPrisma: prisma, resetMockDb: reset };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      return mockPrisma;
    }
  },
  Prisma: { PrismaClientKnownRequestError: class extends Error {} },
}));

import { app } from './server';

const seedIdeas = (): IdeaRecord[] => [
  {
    id: '1',
    title: 'Idea 1',
    description: 'Desc 1',
    status: 'RESEARCHING',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Idea 2',
    description: 'Desc 2',
    status: 'PLANNING',
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
];

describe('Ideas API', () => {
  beforeEach(() => {
    resetMockDb();
    mockIdeas.push(...seedIdeas());
    let max = 0;
    for (const idea of mockIdeas) {
      const n = Number(idea.id);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    vi.clearAllMocks();
  });

  describe('GET /api/ideas', () => {
    it('should return all ideas sorted by createdAt desc', async () => {
      const response = await request(app)
        .get('/api/ideas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('2');
      expect(response.body[1].id).toBe('1');
    });
  });

  describe('POST /api/ideas', () => {
    it('should create a new idea with default status RESEARCHING', async () => {
      const newIdea = { title: 'New Idea', description: 'New Desc' };

      const response = await request(app)
        .post('/api/ideas')
        .send(newIdea)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(newIdea.title);
      expect(response.body.description).toBe(newIdea.description);
      expect(response.body.status).toBe('RESEARCHING');
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      expect(mockIdeas).toHaveLength(3);
    });

    it('should create a new idea with custom status', async () => {
      const newIdea = { title: 'Another Idea', description: 'Another Desc', status: 'COMPLETED' };

      const response = await request(app).post('/api/ideas').send(newIdea).expect(201);

      expect(response.body.status).toBe('COMPLETED');
    });

    it('should reject when title is missing', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ description: 'no title' })
        .expect(400);

      expect(response.body.error).toMatch(/title/i);
    });

    it('should reject an unknown status', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ title: 'Bad', status: 'BOGUS' })
        .expect(400);

      expect(response.body.error).toMatch(/status/i);
    });
  });

  describe('PUT /api/ideas/:id', () => {
    it('should update an existing idea', async () => {
      const updatedData = {
        title: 'Updated Idea 1',
        description: 'Updated Desc 1',
        status: 'IN_PROGRESS',
      };

      const response = await request(app)
        .put('/api/ideas/1')
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe('1');
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.status).toBe(updatedData.status);
      expect(response.body.updatedAt).toBeDefined();

      const updatedIdea = mockIdeas.find((i) => i.id === '1');
      expect(updatedIdea?.title).toBe(updatedData.title);
    });

    it('should partially update with just a status change', async () => {
      const response = await request(app)
        .put('/api/ideas/1')
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.title).toBe('Idea 1');
      expect(response.body.status).toBe('COMPLETED');
    });

    it('should return 404 if idea not found', async () => {
      const response = await request(app)
        .put('/api/ideas/999')
        .send({ title: 'Ghost' })
        .expect(404);

      expect(response.body.error).toBe('Idea not found');
    });
  });

  describe('DELETE /api/ideas/:id', () => {
    it('should delete an existing idea', async () => {
      await request(app).delete('/api/ideas/1').expect(204);

      expect(mockIdeas).toHaveLength(1);
      expect(mockIdeas.find((i) => i.id === '1')).toBeUndefined();
    });

    it('should return 404 when deleting a missing idea', async () => {
      await request(app).delete('/api/ideas/999').expect(404);
    });
  });
});
