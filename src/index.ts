import { PrismaClient } from '@prisma/client';
import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { articleToTermEntry } from './articleToTermEntry';

const prisma = new PrismaClient();

async function main() {
  const allArticles = await prisma.pixivArticle.findMany();
  console.log(`Found ${allArticles.length} articles`);

  const dictionary = new Dictionary({
    fileName: `pixiv.zip`,
  });

  dictionary.setIndex({
    author: `Pixiv contributors, Marv`,
    attribution: `https://dic.pixiv.net`,
    // TODO
    title: `Pixiv`,
    revision: `1`,
    description: `Pixiv dictionary`,
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
    dictionary.addTerm(entry.build());
    progressBar.increment();
  }

  progressBar.stop();

  await dictionary.export();
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
