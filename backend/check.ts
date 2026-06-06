import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function run() {
  const series = await prisma.series.findMany({ include: { episodes: true } });
  console.log("Series in DB:", series.map(s => s.title));
  const assets = await prisma.asset.findMany();
  console.log("Assets in DB:", assets.length);
}
run().finally(() => prisma.$disconnect());
