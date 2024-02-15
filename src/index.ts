import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { addArticleToDictionary } from './yomitan/addArticleToDictionary';
import { isDevMode } from './helpers/isDevMode';
import { getPackageVersion } from './helpers/getPackageVersion';
import { isValidArticle } from './helpers/isValidArticle';
// import { getDatabaseData } from './helpers/getDatabaseData';
import { addAllAssetsToDictionary } from './yomitan/addAllAssetsToDictionary';
import yargs from 'yargs';
import { PrismaClient } from '@prisma/client';
import { articleGenerator } from './helpers/articleGenerator';
export const prisma = new PrismaClient();

(async () => {
  const argv = await yargs(process.argv.slice(2))
    .options({
      light: {
        type: 'boolean',
        description: 'Output lightweight dictionary',
        default: false,
      },
    })
    .parse();
  const pixivLight = !!argv.light;
  console.log(
    `Building dictionary with ${pixivLight ? 'light' : 'full'} mode.`,
  );

  const devMode = isDevMode();
  // If dev mode, limit to 5 articles
  if (devMode) {
    console.log(`Running in dev mode, limiting to 5 articles.`);
  }

  const allArticlesCount = await prisma.pixivArticle.count();
  console.log(`Found ${allArticlesCount} articles`);

  // YYYY-MM-DD
  const latestDateShort = new Date().toISOString().split('T')[0];

  const dictionary = new Dictionary({
    fileName: `Pixiv${pixivLight ? 'Light' : ''}_${latestDateShort}.zip`,
    termBankMaxSize: 1000,
  });

  await addAllAssetsToDictionary(dictionary);

  dictionary.setIndex({
    author: `Pixiv contributors, Marv`,
    attribution: `https://dic.pixiv.net`,
    url: `https://github.com/MarvNC/pixiv-yomitan`,
    title: `Pixiv${pixivLight ? ' Light' : ''} [${latestDateShort}]`,
    revision: getPackageVersion(),
    description: `Article summaries from the Pixiv encyclopedia (ピクシブ百科事典), ${allArticlesCount} articles included.${pixivLight ? ' Light mode.' : ''}
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
  progressBar.start(allArticlesCount, 0);
  
  let invalidCount = 0;

  // Get article generator with limit of 20k
  const articleGen = articleGenerator(20000);
  for await (const article of articleGen) {
    if (!isValidArticle(article)) {
      invalidCount++;
      progressBar.increment();
      continue;
    }
    await addArticleToDictionary(article, pixivLight, dictionary);
    progressBar.increment();
  }
  progressBar.stop();

  console.log(`Skipped ${invalidCount} invalid articles.`);

  console.log(`Exporting dictionary...`);
  const stats = await dictionary.export('dist');
  console.log(`Exported ${stats.termCount} terms`);
  const additionalTerms = stats.termCount - allArticlesCount;
  if (additionalTerms > 0) {
    console.log(`(${additionalTerms} additional terms from brackets)`);
  }
  await prisma.$disconnect();
})();
