import { PrismaClient } from '@prisma/client';
import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { articleToTermEntry } from './helpers/articleToTermEntry';
import { getPackageVersion } from './helpers/getPackageVersion';

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
    revision: getPackageVersion(),
    description: `Article summaries from the Pixiv encyclopedia (ピクシブ百科事典), ${allArticles.length} articles included.
    Pixiv dumps used to build this found at https://github.com/MarvNC/pixiv-dump.
    Built with https://github.com/MarvNC/yomichan-dict-builder.`,
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
  const stats = await dictionary.export('dist');

  if (stats.termCount !== allArticles.length) {
    throw new Error(
      `Mismatched term count: ${stats.termCount} vs ${allArticles.length}`,
    );
  }
  console.log(`Exported ${stats.termCount} terms`);
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
