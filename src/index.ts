import { PrismaClient } from '@prisma/client';
import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { articleToTermEntry } from './articleToTermEntry';

const prisma = new PrismaClient();

async function main() {
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

  const dictionary = new Dictionary({
    fileName: `Pixiv_${latestDateShort}.zip`,
  });

  dictionary.setIndex({
    author: `Pixiv contributors, Marv`,
    attribution: `https://dic.pixiv.net`,
    url: `https://github.com/MarvNC/pixiv-yomitan`,
    // TODO
    title: `Pixiv [${latestDateShort}]`,
    revision: `1`,
    description: `Article summaries scraped from pixiv, ${allArticles.length} articles included`,
  });

  const progressBar = new SingleBar({
    format:
      'Progress |{bar}| {percentage}% | ETA: {eta_formatted} | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  console.log(`Building dictionary...`);
  progressBar.start(allArticles.length, 0);
  for (const article of allArticles) {
    const entry = articleToTermEntry(article);
    await dictionary.addTerm(entry.build());
    progressBar.increment();
  }

  progressBar.stop();

  console.log(`Exporting dictionary...`);
  await dictionary.export('dist');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });