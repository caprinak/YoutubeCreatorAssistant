import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
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

// ── File Uploads ────────────────────────────────────────────────────

const UPLOADS_DIR = path.resolve(import.meta.dirname, 'uploads');
const UPLOADS_URL_PREFIX = '/uploads';
const TYPE_DIR_MAP: Record<string, string> = {
  IMAGE: 'images',
  THUMBNAIL: 'images',
  DIAGRAM: 'images',
  VIDEO: 'videos',
  AUDIO: 'audio',
};

for (const dir of Object.values(TYPE_DIR_MAP)) {
  fs.mkdirSync(path.join(UPLOADS_DIR, 'assets', dir), { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const type = (_req.body?.type as string) ?? 'IMAGE';
    const subdir = TYPE_DIR_MAP[type] ?? 'images';
    cb(null, path.join(UPLOADS_DIR, 'assets', subdir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(UPLOADS_URL_PREFIX, express.static(UPLOADS_DIR));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const IDEA_STATUSES = ['RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'] as const;
type IdeaStatus = (typeof IDEA_STATUSES)[number];

const ASSET_TYPES = ['AUDIO', 'VIDEO', 'IMAGE', 'THUMBNAIL', 'DIAGRAM'] as const;
type AssetType = (typeof ASSET_TYPES)[number];
function isAssetType(value: unknown): value is AssetType {
  return typeof value === 'string' && (ASSET_TYPES as readonly string[]).includes(value);
}

const EPISODE_STATUSES = ['DRAFT', 'SCRIPTING', 'FILMING', 'EDITING', 'COMPLETED'] as const;
type EpisodeStatus = (typeof EPISODE_STATUSES)[number];
function isEpisodeStatus(value: unknown): value is EpisodeStatus {
  return typeof value === 'string' && (EPISODE_STATUSES as readonly string[]).includes(value);
}

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

// ── Assets ──────────────────────────────────────────────────────────

app.get('/api/assets', asyncHandler(async (req, res) => {
  const where: Record<string, unknown> = {};
  if (req.query.channelId) where.channelId = String(req.query.channelId);
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.shared === 'true') where.isShared = true;
  const assets = await prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(assets);
}));

app.post('/api/assets', asyncHandler(async (req, res) => {
  const { name, type, url, sizeBytes, mimeType, isShared, isSuggested, channelId } = req.body ?? {};
  if (!isAssetType(type)) badRequest(`Asset type must be one of: ${ASSET_TYPES.join(', ')}`);
  const asset = await prisma.asset.create({
    data: {
      name: requireString(name, 'Asset name'),
      type,
      url: requireString(url, 'Asset URL'),
      sizeBytes: sizeBytes ?? null,
      mimeType: mimeType ?? null,
      isShared: isShared ?? false,
      isSuggested: isSuggested ?? false,
      channelId: channelId ?? null,
    },
  });
  res.status(HTTP.CREATED).json(asset);
}));

app.put('/api/assets/:id', asyncHandler(async (req, res) => {
  const { name, type, url, sizeBytes, mimeType, isShared, isSuggested } = req.body ?? {};
  await findOrFail(() => prisma.asset.findUnique({ where: { id: req.params.id } }), 'Asset');
  if (type != null && !isAssetType(type)) badRequest(`Asset type must be one of: ${ASSET_TYPES.join(', ')}`);
  const asset = await prisma.asset.update({
    where: { id: req.params.id },
    data: {
      ...(name != null && { name: requireString(name, 'Asset name') }),
      ...(type != null && { type }),
      ...(url != null && { url: requireString(url, 'Asset URL') }),
      ...(sizeBytes !== undefined && { sizeBytes }),
      ...(mimeType !== undefined && { mimeType }),
      ...(isShared !== undefined && { isShared }),
      ...(isSuggested !== undefined && { isSuggested }),
    },
  });
  res.json(asset);
}));

app.delete('/api/assets/:id', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.asset.findUnique({ where: { id: req.params.id } }), 'Asset');
  await prisma.asset.delete({ where: { id: req.params.id } });
  res.status(HTTP.NO_CONTENT).send();
}));

app.post('/api/assets/upload', fileUpload.single('file'), asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) badRequest('File is required');

  const { name, type, isShared, isSuggested, channelId } = req.body ?? {};
  if (!isAssetType(type)) badRequest(`Asset type must be one of: ${ASSET_TYPES.join(', ')}`);

  const subdir = TYPE_DIR_MAP[type as string] ?? 'images';
  const relativeUrl = `${UPLOADS_URL_PREFIX}/assets/${subdir}/${file.filename}`;

  const asset = await prisma.asset.create({
    data: {
      name: requireString(name ?? file.originalname, 'Asset name'),
      type,
      url: relativeUrl,
      sizeBytes: file.size,
      mimeType: file.mimetype,
      isShared: isShared === 'true',
      isSuggested: isSuggested === 'true',
      channelId: channelId ?? null,
    },
  });
  res.status(HTTP.CREATED).json(asset);
}));

// ── Series ──────────────────────────────────────────────────────────

app.get('/api/series', asyncHandler(async (req, res) => {
  const where: Record<string, unknown> = {};
  if (req.query.channelId) where.channelId = String(req.query.channelId);
  const seriesList = await prisma.series.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { _count: { select: { episodes: true } } },
  });
  res.json(seriesList);
}));

app.get('/api/series/:id', asyncHandler(async (req, res) => {
  const series = await findOrFail(
    () => prisma.series.findUnique({ where: { id: req.params.id }, include: { _count: { select: { episodes: true } } } }),
    'Series',
  );
  res.json(series);
}));

app.post('/api/series', asyncHandler(async (req, res) => {
  const { channelId, title, description, sourceType, sourceName } = req.body ?? {};
  if (!channelId) badRequest('channelId is required');
  const series = await prisma.series.create({
    data: {
      title: requireString(title, 'Series title'),
      channelId,
      description: description ?? null,
      sourceType: requireString(sourceType, 'Source type'),
      sourceName: sourceName ?? null,
    },
  });
  res.status(HTTP.CREATED).json(series);
}));

app.put('/api/series/:id', asyncHandler(async (req, res) => {
  const { title, description, sourceType, sourceName } = req.body ?? {};
  await findOrFail(() => prisma.series.findUnique({ where: { id: req.params.id } }), 'Series');
  const series = await prisma.series.update({
    where: { id: req.params.id },
    data: {
      ...(title != null && { title: requireString(title, 'Series title') }),
      ...(description !== undefined && { description }),
      ...(sourceType != null && { sourceType }),
      ...(sourceName !== undefined && { sourceName }),
    },
  });
  res.json(series);
}));

app.delete('/api/series/:id', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.series.findUnique({ where: { id: req.params.id } }), 'Series');
  await prisma.series.delete({ where: { id: req.params.id } });
  res.status(HTTP.NO_CONTENT).send();
}));

// ── Episodes ────────────────────────────────────────────────────────

app.get('/api/series/:id/episodes', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.series.findUnique({ where: { id: req.params.id } }), 'Series');
  const episodes = await prisma.episode.findMany({
    where: { seriesId: req.params.id },
    orderBy: { episodeNumber: 'asc' },
    include: { assets: true },
  });
  res.json(episodes);
}));

app.post('/api/episodes', asyncHandler(async (req, res) => {
  const { seriesId, episodeNumber, title, description, content, status } = req.body ?? {};
  if (!seriesId) badRequest('seriesId is required');
  if (status != null && !isEpisodeStatus(status)) badRequest(`Status must be one of: ${EPISODE_STATUSES.join(', ')}`);
  const episode = await prisma.episode.create({
    data: {
      seriesId,
      episodeNumber,
      title: requireString(title, 'Episode title'),
      description: description ?? null,
      content: content ?? null,
      status: status ?? 'DRAFT',
    },
  });
  res.status(HTTP.CREATED).json(episode);
}));

app.put('/api/episodes/:id', asyncHandler(async (req, res) => {
  const { title, description, content, status, episodeNumber } = req.body ?? {};
  if (status != null && !isEpisodeStatus(status)) badRequest(`Status must be one of: ${EPISODE_STATUSES.join(', ')}`);
  await findOrFail(() => prisma.episode.findUnique({ where: { id: req.params.id } }), 'Episode');
  const episode = await prisma.episode.update({
    where: { id: req.params.id },
    data: {
      ...(title != null && { title: requireString(title, 'Episode title') }),
      ...(description !== undefined && { description }),
      ...(content !== undefined && { content }),
      ...(status != null && { status }),
      ...(episodeNumber != null && { episodeNumber }),
    },
  });
  res.json(episode);
}));

app.post('/api/episodes/:id/assets', asyncHandler(async (req, res) => {
  const { assetId } = req.body ?? {};
  if (!assetId) badRequest('assetId is required');
  await findOrFail(() => prisma.episode.findUnique({ where: { id: req.params.id } }), 'Episode');
  await findOrFail(() => prisma.asset.findUnique({ where: { id: assetId } }), 'Asset');

  const episode = await prisma.episode.update({
    where: { id: req.params.id },
    data: {
      assets: { connect: { id: assetId } }
    },
    include: { assets: true }
  });
  res.json(episode);
}));

app.delete('/api/episodes/:id/assets/:assetId', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.episode.findUnique({ where: { id: req.params.id } }), 'Episode');
  
  const episode = await prisma.episode.update({
    where: { id: req.params.id },
    data: {
      assets: { disconnect: { id: req.params.assetId } }
    },
    include: { assets: true }
  });
  res.json(episode);
}));

app.delete('/api/episodes/:id', asyncHandler(async (req, res) => {
  await findOrFail(() => prisma.episode.findUnique({ where: { id: req.params.id } }), 'Episode');
  await prisma.episode.delete({ where: { id: req.params.id } });
  res.status(HTTP.NO_CONTENT).send();
}));

// ── Batch Import ────────────────────────────────────────────────────

app.post('/api/series/:id/import-episodes', asyncHandler(async (req, res) => {
  const series = await findOrFail(() => prisma.series.findUnique({ where: { id: req.params.id } }), 'Series');
  const { episodes } = req.body ?? {};
  if (!Array.isArray(episodes) || episodes.length === 0) badRequest('episodes must be a non-empty array');

  const data = episodes.map((ep: { episodeNumber: number; title: string; description?: string; content?: string }, idx: number) => ({
    seriesId: series.id,
    episodeNumber: ep.episodeNumber ?? idx + 1,
    title: requireString(ep.title, `Episode ${idx + 1} title`),
    description: ep.description ?? null,
    content: ep.content ?? null,
  }));

  await prisma.episode.createMany({ data });
  const created = await prisma.episode.findMany({
    where: { seriesId: req.params.id },
    orderBy: { episodeNumber: 'asc' },
  });
  res.status(HTTP.CREATED).json(created);
}));

// ── Error Handler ───────────────────────────────────────────────────

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof multer.MulterError) {
    return res.status(HTTP.BAD_REQUEST).json({ error: err.message });
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
