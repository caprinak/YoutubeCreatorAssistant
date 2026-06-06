import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
async function run() {
  await prisma.series.deleteMany();
  console.log("Deleted series");
}
run().finally(() => prisma.$disconnect());
