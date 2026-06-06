import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const ideas = [
  {
    title: 'How I Built a Faceless YouTube Channel in 30 Days',
    description: 'Walkthrough of tools, workflow, and earnings from a zero-face channel. Covers AI voiceover, stock footage, keyword research.',
    status: 'COMPLETED',
  },
  {
    title: '5 AI Tools That Saved Me 20 Hours This Week',
    description: 'Roundup of the most underrated AI tools for content creators. Includes scripting, thumbnail design, and analytics.',
    status: 'COMPLETED',
  },
  {
    title: 'My Video Went Viral — Here Is What I Learned',
    description: 'Post-mortem of a viral video: CTR, audience retention graph breakdown, thumbnail A/B test results, and the algorithm luck factor.',
    status: 'IN_PROGRESS',
  },
  {
    title: 'The Perfect YouTube Upload Schedule (Data-Backed)',
    description: 'Analyzing 100+ channels to find the optimal upload frequency, day, and time. Charts and raw data included.',
    status: 'IN_PROGRESS',
  },
  {
    title: 'I Tried 10 Thumbnail Styles — This One Won',
    description: 'Eye-tracking heatmap experiment comparing thumbnail styles. Face close-up vs. text overlay vs. curiosity gap comparison.',
    status: 'PLANNING',
  },
  {
    title: 'YouTube Studio Hidden Features You Are Not Using',
    description: 'Deep dive into YouTube Studio analytics most creators ignore: traffic source details, unique vs. returning viewers, key moments.',
    status: 'PLANNING',
  },
  {
    title: 'Faceless vs. Face Channel — Which Grows Faster?',
    description: 'Side-by-side comparison of two identical channels — one with face, one without. Growth metrics after 60 days.',
    status: 'RESEARCHING',
  },
  {
    title: 'How to Script a Video in 15 Minutes (Template)',
    description: 'Free downloadable hook-body-outro template. Examples from top creators deconstructed line by line.',
    status: 'RESEARCHING',
  },
  {
    title: 'Why Your Retention Drops in the First 30 Seconds',
    description: 'Data analysis of retention graphs from real channels. Common mistakes in intros and how to fix them using proven patterns.',
    status: 'RESEARCHING',
  },
  {
    title: 'I Automated My Entire YouTube Workflow — Here Is The Stack',
    description: 'End-to-end automation from research to publishing. Tools used: n8n, ChatGPT, Canva API, YouTube Data API.',
    status: 'PLANNING',
  },
  {
    title: 'The CTR Game: Writing Titles That Get Clicked',
    description: 'Psychology-backed title formulas. Power words, number patterns, and curiosity gap techniques with before/after examples.',
    status: 'RESEARCHING',
  },
  {
    title: 'Best Niches for New Creators in 2026',
    description: 'Competition vs. demand analysis across 20 niches. CPM estimates, barrier to entry, and content saturation ratings.',
    status: 'PLANNING',
  },
];

async function seed() {
  const count = await prisma.idea.count();
  if (count > 0) {
    console.log(`Database already has ${count} ideas. Clearing and re-seeding...`);
    await prisma.idea.deleteMany();
  }

  for (const idea of ideas) {
    await prisma.idea.create({ data: idea });
    console.log(`  ✓ ${idea.title}`);
  }

  console.log(`\nSeeded ${ideas.length} ideas successfully.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
