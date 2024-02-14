import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getDatabaseData({ limit }: { limit?: number }) {
  const allArticles = limit
    ? await prisma.pixivArticle.findMany({ take: limit })
    : await prisma.pixivArticle.findMany();
  console.log(`Found ${allArticles.length} articles`);

  // Format 0000-00-00 00:00:00
  const latestDate = (
    await prisma.scrapeProgress.findFirst({
      orderBy: {
        newestScraped: 'desc',
      },
    })
  )?.newestScraped;
  if (!latestDate) {
    throw new Error(`No latest date found`);
  }
  const latestDateShort = latestDate?.split(' ')[0];

  console.log(`Latest date: ${latestDateShort}`);

  await prisma.$disconnect();
  return { latestDateShort, allArticles };
}
