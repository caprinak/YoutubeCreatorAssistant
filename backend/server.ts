import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import 'dotenv/config';

const app = express();
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const PORT = Number(process.env.PORT) || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export const IDEA_STATUSES = ['RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

const TITLE_MAX = 200;
const DESC_MAX = 5000;

function isIdeaStatus(value: unknown): value is IdeaStatus {
  return typeof value === 'string' && (IDEA_STATUSES as readonly string[]).includes(value);
}

app.get('/api/ideas', async (_req, res, next) => {
  try {
    const ideas = await prisma.idea.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(ideas);
  } catch (err) {
    next(err);
  }
});

app.post('/api/ideas', async (req, res, next) => {
  try {
    const { title, description, status } = req.body ?? {};

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > TITLE_MAX) {
      return res.status(400).json({ error: `Title must be at most ${TITLE_MAX} characters` });
    }
    if (
      description != null &&
      (typeof description !== 'string' || description.length > DESC_MAX)
    ) {
      return res.status(400).json({ error: `Description must be a string of at most ${DESC_MAX} characters` });
    }
    if (status != null && !isIdeaStatus(status)) {
      return res.status(400).json({ error: `Status must be one of: ${IDEA_STATUSES.join(', ')}` });
    }

    const idea = await prisma.idea.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        status: status ?? 'RESEARCHING',
      },
    });
    res.status(201).json(idea);
  } catch (err) {
    next(err);
  }
});

app.put('/api/ideas/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body ?? {};

    if (title != null && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    if (title != null && title.length > TITLE_MAX) {
      return res.status(400).json({ error: `Title must be at most ${TITLE_MAX} characters` });
    }
    if (
      description != null &&
      (typeof description !== 'string' || description.length > DESC_MAX)
    ) {
      return res.status(400).json({ error: `Description must be a string of at most ${DESC_MAX} characters` });
    }
    if (status != null && !isIdeaStatus(status)) {
      return res.status(400).json({ error: `Status must be one of: ${IDEA_STATUSES.join(', ')}` });
    }

    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const idea = await prisma.idea.update({
      where: { id },
      data: {
        ...(title != null && { title: title.trim() }),
        ...(description != null && { description }),
        ...(status != null && { status }),
      },
    });
    res.json(idea);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/ideas/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    await prisma.idea.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return next(err);
    }
    next(err);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
