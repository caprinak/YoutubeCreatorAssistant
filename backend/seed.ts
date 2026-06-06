import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const sampleIdeas = [
  {
    id: 'sample-1',
    title: 'I Built a Web App in 24 Hours Using Only AI Agents',
    description: 'Detailed log of trying to build a full-stack SaaS app using AI coding agents. Discussing the prompts, the failures, the successes, and the final cost/time breakdown.',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: 'sample-2',
    title: 'Why I Stopped Using Tailwind CSS (And What I Use Instead)',
    description: 'Deep dive comparison between Tailwind, vanilla CSS, CSS modules, and CSS-in-JS. Addressing performance, maintenance overhead, and workflow speeds.',
    status: 'EDITING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'sample-3',
    title: 'Is Angular 21 the Best Frontend Framework in 2026?',
    description: 'Hands-on walkthrough of the new features in Angular 21 (signal-based routing, reactivity, faster builds) and how it stacks up against Next.js.',
    status: 'SCRIPTING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'sample-4',
    title: 'The Ultimate Clean Code Checklist for Junior Devs',
    description: 'Visual guide going through 10 essential refactoring rules: naming conventions, keeping functions small, avoiding nested conditionals, and writing unit tests.',
    status: 'PLANNING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'sample-5',
    title: 'How Web Developers Can Get Their First Freelance Client',
    description: 'Practical strategies for portfolio building, finding clients on specialized platforms, cold-outreach emails, and negotiating project rates.',
    status: 'RESEARCHING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'sample-6',
    title: 'Inside a Tech Lead\'s Desk Setup (Aesthetic & Ergonomic)',
    description: 'B-roll heavy tour of my new workspace showing the standing desk, mechanical keyboard build, monitor setup, and cable management strategies.',
    status: 'FILMING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: 'sample-7',
    title: 'How to Get 90% Test Coverage Without Losing Your Sanity',
    description: 'Explain test mocking, unit testing vs integration testing, coverage metrics, and automating coverage checks in CI pipelines.',
    status: 'PLANNING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'sample-8',
    title: 'I Tried Every CSS Framework So You Don\'t Have To',
    description: 'A comprehensive review of Bootstrap, Bulma, Tailwind, Pico.css, and vanilla CSS for different project sizes.',
    status: 'RESEARCHING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

function seed() {
  console.log('Starting DB seed process...');
  fs.writeFileSync(DB_FILE, JSON.stringify({ ideas: sampleIdeas }, null, 2));
  console.log(`Database seeded successfully with ${sampleIdeas.length} sample items!`);
}

seed();
