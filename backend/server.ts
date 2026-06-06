import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import 'dotenv/config';

const HTTP = {
  OK: 200, CREATED: 201, NO_CONTENT: 204,
  BAD_REQUEST: 400, NOT_FOUND: 404, INTERNAL_ERROR: 500,
} as const;

const DEFAULT_DB_URL = 'file:./dev.db';
const DEFAULT_PORT = 3000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:4200';

const app = express();
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? DEFAULT_DB_URL });
const prisma = new PrismaClient({ adapter });

const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const IDEA_STATUSES = ['RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'] as const;
type IdeaStatus = (typeof IDEA_STATUSES)[number];

const TITLE_MAX = 200;
const DESC_MAX = 5000;

function isIdeaStatus(value: unknown): value is IdeaStatus {
  return typeof value === 'string' && (IDEA_STATUSES as readonly string[]).includes(value);
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

async function findOrFail<T>(finder: () => Promise<T | null>, label: string): Promise<T> {
  const record = await finder();
  if (!record) throw new NotFoundError(label);
  return record;
}

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

class NotFoundError extends HttpError {
  constructor(label: string) { super(HTTP.NOT_FOUND, `${label} not found`); }
}

function badRequest(message: string): never {
  throw new HttpError(HTTP.BAD_REQUEST, message);
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) badRequest(`${name} is required`);
  return value.trim();
}

// ── Channels ────────────────────────────────────────────────────────

app.get('/api/channels', asyncHandler(async (_req, res) => {
  const channels = await prisma.channel.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { ideas: true } } },
  });
  res.json(channels);
}));

app.post('/api/channels', asyncHandler(async (req, res) => {
  const { name, handle, niche } = req.body ?? {};
  const channel = await prisma.channel.create({
    data: { name: requireString(name, 'Channel name'), handle: requireString(handle, 'Channel handle'), niche: niche ?? null },
  });
  res.status(HTTP.CREATED).json(channel);
}));

app.put('/api/channels/:id', asyncHandler(async (req, res) => {
  const { name, handle, niche } = req.body ?? {};
  await findOrFail(() => prisma.channel.findUnique({ where: { id: req.params.id } }), 'Channel');
  const channel = await prisma.channel.update({
    where: { id: req.params.id },
    data: {
      ...(name != null && { name: name.trim() }),
      ...(handle != null && { handle: handle.trim() }),
      ...(niche !== undefined && { niche }),
    },
  });
  res.json(channel);
}));

app.delete('/api/channels/:id', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.channel.findUnique({ where: { id: req.params.id } }), 'Channel');
  await prisma.channel.delete({ where: { id: req.params.id } });
  res.status(HTTP.NO_CONTENT).send();
}));

// ── Personas ────────────────────────────────────────────────────────

app.get('/api/personas', asyncHandler(async (req, res) => {
  const where = req.query.channelId ? { channelId: String(req.query.channelId) } : {};
  const personas = await prisma.audiencePersona.findMany({ where, orderBy: { name: 'asc' } });
  res.json(personas);
}));

app.post('/api/personas', asyncHandler(async (req, res) => {
  const { channelId, name, demographics, painPoints } = req.body ?? {};
  if (!channelId) badRequest('channelId is required');
  const persona = await prisma.audiencePersona.create({
    data: { channelId, name: requireString(name, 'Persona name'), demographics: demographics ?? null, painPoints: painPoints ?? null },
  });
  res.status(HTTP.CREATED).json(persona);
}));

app.delete('/api/personas/:id', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.audiencePersona.findUnique({ where: { id: req.params.id } }), 'Persona');
  await prisma.audiencePersona.delete({ where: { id: req.params.id } });
  res.status(HTTP.NO_CONTENT).send();
}));

// ── Brand Kits ──────────────────────────────────────────────────────

app.get('/api/brand-kits/:channelId', asyncHandler(async (req, res) => {
  const kit = await findOrFail(
    () => prisma.brandKit.findUnique({ where: { channelId: req.params.channelId } }),
    'Brand kit',
  );
  res.json(kit);
}));

app.put('/api/brand-kits/:channelId', asyncHandler(async (req, res) => {
  const { colors, typography, logoUrl, bannerUrl } = req.body ?? {};
  const kit = await prisma.brandKit.upsert({
    where: { channelId: req.params.channelId },
    update: {
      ...(colors !== undefined && { colors: JSON.stringify(colors) }),
      ...(typography !== undefined && { typography }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
    },
    create: {
      channelId: req.params.channelId,
      colors: colors ? JSON.stringify(colors) : null,
      typography: typography ?? null,
      logoUrl: logoUrl ?? null,
      bannerUrl: bannerUrl ?? null,
    },
  });
  res.json(kit);
}));

// ── Tags ────────────────────────────────────────────────────────────

app.get('/api/tags', asyncHandler(async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  res.json(tags);
}));

app.post('/api/tags', asyncHandler(async (req, res) => {
  const { name, color } = req.body ?? {};
  const tag = await prisma.tag.create({ data: { name: requireString(name, 'Tag name'), color: color ?? null } });
  res.status(HTTP.CREATED).json(tag);
}));

// ── Ideas ───────────────────────────────────────────────────────────

app.get('/api/ideas', asyncHandler(async (req, res) => {
  const where: Record<string, unknown> = {};
  if (req.query.channelId) where.channelId = String(req.query.channelId);
  if (req.query.personaId) where.audiencePersonaId = String(req.query.personaId);
  if (req.query.tagId) where.tags = { some: { tagId: String(req.query.tagId) } };
  const ideas = await prisma.idea.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { persona: true, tags: { include: { tag: true } } },
  });
  res.json(ideas);
}));

app.post('/api/ideas', asyncHandler(async (req, res) => {
  const { title, description, status, channelId, audiencePersonaId, tagIds } = req.body ?? {};

  const titleStr = requireString(title, 'Title');
  if (titleStr.length > TITLE_MAX) badRequest(`Title must be at most ${TITLE_MAX} characters`);
  if (!channelId) badRequest('channelId is required');
  if (status != null && !isIdeaStatus(status)) badRequest(`Status must be one of: ${IDEA_STATUSES.join(', ')}`);

  const idea = await prisma.idea.create({
    data: {
      title: titleStr,
      description: description ?? null,
      status: status ?? 'RESEARCHING',
      channelId,
      audiencePersonaId: audiencePersonaId ?? null,
      ...(Array.isArray(tagIds) && tagIds.length > 0
        ? { tags: { create: tagIds.map((tid: string) => ({ tagId: tid })) } }
        : {}),
    },
    include: { persona: true, tags: { include: { tag: true } } },
  });
  res.status(HTTP.CREATED).json(idea);
}));

app.put('/api/ideas/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, status, channelId, audiencePersonaId, tagIds } = req.body ?? {};

  if (title != null) {
    const trimmed = requireString(title, 'Title');
    if (trimmed.length > TITLE_MAX) badRequest(`Title must be at most ${TITLE_MAX} characters`);
  }
  if (status != null && !isIdeaStatus(status)) badRequest(`Status must be one of: ${IDEA_STATUSES.join(', ')}`);

  await findOrFail(() => prisma.idea.findUnique({ where: { id } }), 'Idea');

  const data: Record<string, unknown> = {
    ...(title != null && { title: (title as string).trim() }),
    ...(description !== undefined && { description }),
    ...(status != null && { status }),
    ...(channelId != null && { channelId }),
    ...(audiencePersonaId !== undefined && { audiencePersonaId }),
  };

  if (Array.isArray(tagIds)) {
    await prisma.ideaTag.deleteMany({ where: { ideaId: id } });
    if (tagIds.length > 0) {
      await prisma.ideaTag.createMany({ data: tagIds.map((tid: string) => ({ ideaId: id, tagId: tid })) });
    }
  }

  const idea = await prisma.idea.update({
    where: { id }, data,
    include: { persona: true, tags: { include: { tag: true } } },
  });
  res.json(idea);
}));

app.delete('/api/ideas/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await findOrFail(() => prisma.idea.findUnique({ where: { id } }), 'Idea');
  await prisma.idea.delete({ where: { id } });
  res.status(HTTP.NO_CONTENT).send();
}));

// ── Error Handler ───────────────────────────────────────────────────

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(HTTP.NOT_FOUND).json({ error: 'Record not found' });
    if (err.code === 'P2002') return res.status(HTTP.BAD_REQUEST).json({ error: 'A record with that value already exists' });
  }
  console.error('Unhandled error:', err);
  res.status(HTTP.INTERNAL_ERROR).json({ error: 'Internal server error' });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
