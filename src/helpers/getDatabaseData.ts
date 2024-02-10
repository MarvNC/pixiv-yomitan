import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getDatabaseData() {
  const allArticles = await prisma.pixivArticle.findMany();
  console.log(`Found ${allArticles.length} articles`);

  // Format 0000-00-00 00:00:00
  const latestDate = (
    await prisma.scrapeProgress.findFirst({
      orderBy: {
        newestDate: 'desc',
      },
    })
  )?.newestDate;
  if (!latestDate) {
    throw new Error(`No latest date found`);
  }
  const latestDateShort = latestDate?.split(' ')[0];

  console.log(`Latest date: ${latestDateShort}`);

  await prisma.$disconnect();
  return { latestDateShort, allArticles };
}
