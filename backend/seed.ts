import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
  await prisma.ideaTag.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.audiencePersona.deleteMany();
  await prisma.brandKit.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.channel.deleteMany();
}

interface ChannelDef {
  name: string; handle: string; niche: string;
  brandKit: { colors: string; typography: string };
  personas: { name: string; demographics: string; painPoints: string }[];
}

const TAG_DEFS = [
  { name: 'english', color: '#2563EB' },
  { name: 'it', color: '#7C3AED' },
  { name: 'gardening', color: '#16A34A' },
  { name: 'nutrition', color: '#65A30D' },
  { name: 'zen', color: '#0D9488' },
  { name: 'philosophy', color: '#6B21A8' },
  { name: 'krishnamurti', color: '#BE185D' },
  { name: 'ramana-maharshi', color: '#D97706' },
  { name: 'grammar', color: '#1D4ED8' },
  { name: 'programming', color: '#9333EA' },
  { name: 'meditation', color: '#14B8A6' },
  { name: 'non-duality', color: '#7E22CE' },
];

async function seedTags(): Promise<Map<string, string>> {
  const tags = await Promise.all(
    TAG_DEFS.map((t) => prisma.tag.create({ data: t }))
  );
  console.log(`  ✓ ${tags.length} tags created`);
  return new Map(tags.map((t) => [t.name, t.id]));
}

const CHANNEL_DEFS: ChannelDef[] = [
  {
    name: 'Education',
    handle: '@eduverse',
    niche: 'English language & information technology',
    brandKit: { colors: JSON.stringify(['#2563EB', '#7C3AED', '#60A5FA']), typography: 'Inter, sans-serif' },
    personas: [
      { name: 'The Self-Taught Student', demographics: '18-30, self-learner, non-native speaker', painPoints: 'Struggles with English fluency and breaking into tech without a degree' },
      { name: 'The Career Switcher', demographics: '25-40, working professional, mid-career', painPoints: 'Needs to upskill in IT while improving business English for global roles' },
    ],
  },
  {
    name: 'Health',
    handle: '@vitalroots',
    niche: 'Gardening, nutrition & zen living',
    brandKit: { colors: JSON.stringify(['#16A34A', '#65A30D', '#0D9488']), typography: 'Poppins, sans-serif' },
    personas: [
      { name: 'The Urban Homesteader', demographics: '25-45, city dweller, health-conscious', painPoints: 'Limited space for gardening, confused by contradictory nutrition advice' },
      { name: 'The Stressed Professional', demographics: '30-50, high-stress job, seeks balance', painPoints: 'No time for meal prep, struggles with work-life harmony' },
    ],
  },
  {
    name: 'Spirituality',
    handle: '@innerabode',
    niche: 'Philosophy, non-duality & self-inquiry',
    brandKit: { colors: JSON.stringify(['#6B21A8', '#BE185D', '#D97706']), typography: 'Merriweather, serif' },
    personas: [
      { name: 'The Seeker', demographics: '22-40, spiritually curious, beginner', painPoints: 'Overwhelmed by conflicting teachings, wants a clear path to self-understanding' },
      { name: 'The Experienced Practitioner', demographics: '35-60, studied various traditions, seeks depth', painPoints: 'Longing for direct realization, tired of conceptual philosophies' },
    ],
  },
];

async function seedChannels(): Promise<{ channels: { id: string; name: string }[]; tagMap: Map<string, string> }> {
  const tagMap = await seedTags();
  const channels: { id: string; name: string }[] = [];

  for (const ch of CHANNEL_DEFS) {
    const channel = await prisma.channel.create({ data: { name: ch.name, handle: ch.handle, niche: ch.niche } });
    channels.push(channel);
    console.log(`  ✓ Channel: ${ch.name}`);

    await prisma.brandKit.create({ data: { channelId: channel.id, colors: ch.brandKit.colors, typography: ch.brandKit.typography } });
    console.log(`    · Brand kit created`);

    for (const p of ch.personas) {
      await prisma.audiencePersona.create({ data: { channelId: channel.id, ...p } });
      console.log(`    · Persona: ${p.name}`);
    }
  }
  return { channels, tagMap };
}

interface IdeaDef {
  title: string; description: string; status: string;
  channelIdx: number; personaIdx: number; tagNames: string[];
}

const IDEA_DEFS: IdeaDef[] = [
    // ── Education: English ──
    {
      title: '10 English Grammar Rules That Even Native Speakers Get Wrong',
      description: 'Common mistakes in subject-verb agreement, dangling modifiers, and the dreaded who/whom confusion — explained simply.',
      status: 'COMPLETED',
      channelIdx: 0,
      personaIdx: 0,
      tagNames: ['english', 'grammar'],
    },
    {
      title: 'How I Learned Fluent English by Watching YouTube (Full System)',
      description: 'My step-by-step method: active listening, shadowing, journaling, and speaking practice without a tutor.',
      status: 'COMPLETED',
      channelIdx: 0,
      personaIdx: 0,
      tagNames: ['english'],
    },
    {
      title: 'Business English: 20 Phrases That Sound More Professional',
      description: 'Replace filler words with confident alternatives for meetings, emails, and presentations.',
      status: 'IN_PROGRESS',
      channelIdx: 0,
      personaIdx: 1,
      tagNames: ['english'],
    },
    // ── Education: IT ──
    {
      title: 'From Zero to Deployed: Build Your First Web App in a Weekend',
      description: 'A practical walkthrough using HTML, CSS, JavaScript and a free hosting platform — no experience needed.',
      status: 'COMPLETED',
      channelIdx: 0,
      personaIdx: 0,
      tagNames: ['it', 'programming'],
    },
    {
      title: 'Why Most Beginners Quit Programming (And How Not To)',
      description: 'The three biggest psychological barriers in learning to code and how to push through each one.',
      status: 'IN_PROGRESS',
      channelIdx: 0,
      personaIdx: 0,
      tagNames: ['it', 'programming'],
    },
    {
      title: 'IT Career Blueprint: Skills, Certifications & Portfolio Strategy for 2026',
      description: 'Mapping out a self-taught path from help desk to cloud engineer without a CS degree.',
      status: 'PLANNING',
      channelIdx: 0,
      personaIdx: 1,
      tagNames: ['it'],
    },
    // ── Health: Gardening ──
    {
      title: 'The Complete Balcony Garden: Growing Food in 5 Square Meters',
      description: 'Container selection, soil mix, watering schedule, and the 10 best plants for small-space gardening.',
      status: 'COMPLETED',
      channelIdx: 1,
      personaIdx: 0,
      tagNames: ['gardening'],
    },
    {
      title: 'Seed Starting 101: When, How, and What to Plant Each Season',
      description: 'A month-by-month calendar for starting seeds indoors and transplanting at the right time.',
      status: 'IN_PROGRESS',
      channelIdx: 1,
      personaIdx: 0,
      tagNames: ['gardening'],
    },
    {
      title: 'Composting Without a Yard: Worm Bins & Bokashi Explained',
      description: 'Two apartment-friendly composting methods that turn kitchen scraps into black gold.',
      status: 'PLANNING',
      channelIdx: 1,
      personaIdx: 0,
      tagNames: ['gardening'],
    },
    // ── Health: Nutrition ──
    {
      title: 'The 20-Minute Meal Prep System That Changed My Health',
      description: 'One day of cooking = five days of balanced, whole-food meals. Recipes, containers, and timing included.',
      status: 'COMPLETED',
      channelIdx: 1,
      personaIdx: 1,
      tagNames: ['nutrition'],
    },
    {
      title: 'Debunking 5 Popular Diet Myths With Actual Science',
      description: 'Detox teas, keto for everyone, carbs after 6pm — what the research really says.',
      status: 'IN_PROGRESS',
      channelIdx: 1,
      personaIdx: 0,
      tagNames: ['nutrition'],
    },
    // ── Health: Zen ──
    {
      title: 'Zen in Everyday Life: 5-Minute Practices That Ground Your Day',
      description: 'Morning tea ritual, walking meditation, single-tasking — small habits that create deep calm.',
      status: 'COMPLETED',
      channelIdx: 1,
      personaIdx: 1,
      tagNames: ['zen', 'meditation'],
    },
    {
      title: 'The Art of Doing Nothing: Why Rest Is a Spiritual Practice',
      description: 'How embracing boredom and stillness can be more transformative than constant productivity.',
      status: 'PLANNING',
      channelIdx: 1,
      personaIdx: 1,
      tagNames: ['zen'],
    },
    // ── Spirituality: Philosophy ──
    {
      title: 'What Is Philosophy For? A Practical Guide to Thinking Clearly',
      description: 'Why philosophy is not an academic abstraction but a toolkit for living a examined, meaningful life.',
      status: 'COMPLETED',
      channelIdx: 2,
      personaIdx: 0,
      tagNames: ['philosophy'],
    },
    {
      title: 'Stoicism vs. Non-Duality: Two Paths to Inner Freedom',
      description: 'Comparing Marcus Aurelius with Ramana Maharshi — where they converge and where they diverge.',
      status: 'IN_PROGRESS',
      channelIdx: 2,
      personaIdx: 1,
      tagNames: ['philosophy', 'non-duality'],
    },
    // ── Spirituality: J. Krishnamurti ──
    {
      title: 'Krishnamurti on Thought: Why Thinking Cannot Solve Our Problems',
      description: 'Breaking down K\'s core insight that the observer is the observed — and what that means for daily life.',
      status: 'COMPLETED',
      channelIdx: 2,
      personaIdx: 0,
      tagNames: ['krishnamurti'],
    },
    {
      title: 'Freedom From the Known: A Chapter-by-Chapter Breakdown',
      description: 'Walking through Krishnamurti\'s most accessible book with real-life examples and contemplative exercises.',
      status: 'IN_PROGRESS',
      channelIdx: 2,
      personaIdx: 0,
      tagNames: ['krishnamurti', 'philosophy'],
    },
    {
      title: 'Can You Really Change? Krishnamurti\'s Radical Perspective',
      description: 'Examining the illusion of psychological becoming and the timeless nature of radical transformation.',
      status: 'PLANNING',
      channelIdx: 2,
      personaIdx: 1,
      tagNames: ['krishnamurti'],
    },
    // ── Spirituality: Ramana Maharshi ──
    {
      title: 'Who Am I? A Practical Guide to Self-Inquiry (Atma Vichara)',
      description: 'Step-by-step instructions for Ramana Maharshi\'s primary teaching — tracing the "I" thought to its source.',
      status: 'COMPLETED',
      channelIdx: 2,
      personaIdx: 0,
      tagNames: ['ramana-maharshi', 'non-duality'],
    },
    {
      title: 'Ramana Maharshi on the World: Is It Real or an Illusion?',
      description: 'Understanding the concept of Maya from the perspective of direct experience, not dogma.',
      status: 'PLANNING',
      channelIdx: 2,
      personaIdx: 1,
      tagNames: ['ramana-maharshi', 'philosophy'],
    },
    {
      title: 'Surrender and Self-Inquiry: The Two Wings of Ramana\'s Teaching',
      description: 'How complete surrender to the Guru (or the Self) and relentless self-inquiry support each other.',
      status: 'RESEARCHING',
      channelIdx: 2,
      personaIdx: 1,
      tagNames: ['ramana-maharshi', 'non-duality'],
    },
];

async function seedIdeas(createdChannels: { id: string; name: string }[], tagMap: Map<string, string>) {
  for (const idea of IDEA_DEFS) {
    const channel = createdChannels[idea.channelIdx];
    const personas = await prisma.audiencePersona.findMany({ where: { channelId: channel.id } });
    const persona = personas[idea.personaIdx];
    const tagIds = idea.tagNames.map((n) => tagMap.get(n)).filter(Boolean) as string[];

    await prisma.idea.create({
      data: {
        title: idea.title,
        description: idea.description,
        status: idea.status,
        channelId: channel.id,
        audiencePersonaId: persona.id,
        tags: tagIds.length > 0 ? { create: tagIds.map((tid) => ({ tagId: tid })) } : undefined,
      },
    });
    console.log(`  ✓ [${channel.name}] ${idea.title}`);
  }
  console.log(`  ✓ ${IDEA_DEFS.length} ideas created`);
}

async function seed() {
  const existingCount = await prisma.channel.count();
  if (existingCount > 0) {
    console.log('Database already has data. Re-seeding...');
    await clearDatabase();
  }

  const { channels, tagMap } = await seedChannels();
  await seedIdeas(channels, tagMap);

  console.log(`\nSeeded ${channels.length} channels, ${IDEA_DEFS.length} ideas successfully.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
