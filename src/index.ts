import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { addArticleToDictionary } from './yomitan/addArticleToDictionary';
import { isDevMode } from './helpers/isDevMode';
import { getPackageVersion } from './helpers/getPackageVersion';
import { isValidArticle } from './helpers/isValidArticle';
import { addAllAssetsToDictionary } from './yomitan/addAllAssetsToDictionary';
import yargs from 'yargs';
import { PrismaClient } from '@prisma/client';
import { articleGenerator } from './helpers/articleGenerator';
import { DEV_MODE_ARTICLE_COUNT, CHUNK_COUNT } from './yomitan/constants';
import { TERM_BANK_MAX_SIZE } from './yomitan/constants';
export const prisma = new PrismaClient();

(async () => {
  const argv = await yargs(process.argv.slice(2))
    .options({
      light: {
        type: 'boolean',
        description: 'Output lightweight dictionary',
        default: false,
      },
      tagName: {
        type: 'string',
        description: 'Tag name of the Github release',
        default: 'latest',
      },
    })
    .parse();
  const pixivLight = !!argv.light;
  const tagName = argv.tagName;
  console.log(
    `Building dictionary with ${pixivLight ? 'light' : 'full'} mode. Tag name: ${tagName}.`,
  );

  const devMode = isDevMode();
  // If dev mode, limit article count
  if (devMode) {
    console.log(
      `Running in dev mode, limiting article count to ${DEV_MODE_ARTICLE_COUNT}.`,
    );
  }

  const allArticlesCount = await prisma.pixivArticle.count();
  console.log(`Found ${allArticlesCount} articles`);

  // YYYY-MM-DD
  const latestDateShort = new Date().toISOString().split('T')[0];

  const PIXIV_ZIP_FILENAME: `${string}.zip` = `Pixiv${pixivLight ? 'Light' : ''}_${latestDateShort}.zip`;
  const INDEX_FILENAME = `pixiv_${pixivLight ? 'light' : 'full'}_index.json`;
  const EXPORT_FOLDER = 'dist';

  const dictionary = new Dictionary({
    fileName: PIXIV_ZIP_FILENAME,
    termBankMaxSize: TERM_BANK_MAX_SIZE,
  });

  await addAllAssetsToDictionary(dictionary);

  dictionary.setIndex(
    {
      author: `Pixiv contributors, Marv`,
      attribution: `https://dic.pixiv.net`,
      url: `https://github.com/MarvNC/pixiv-yomitan`,
      title: `Pixiv${pixivLight ? ' Light' : ''} [${latestDateShort}]`,
      revision: getPackageVersion(),
      description: `Article summaries from the Pixiv encyclopedia (ピクシブ百科事典), ${allArticlesCount} articles included.${pixivLight ? ' Light mode.' : ''}
    Pixiv dumps used to build this found at https://github.com/MarvNC/pixiv-dump.
    Built with https://github.com/MarvNC/yomichan-dict-builder.`,
      isUpdatable: true,
      indexUrl: `https://github.com/MarvNC/pixiv-yomitan/releases/latest/download/${INDEX_FILENAME}`,
      downloadUrl: `https://github.com/MarvNC/pixiv-yomitan/releases/${tagName}/${PIXIV_ZIP_FILENAME}`,
    },
    EXPORT_FOLDER,
    INDEX_FILENAME,
  );

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

  // Get article generator with limit
  const articleGen = articleGenerator({
    chunkCount: CHUNK_COUNT,
    articleLimit: devMode ? DEV_MODE_ARTICLE_COUNT : Infinity,
  });
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
  console.log(`Exported ${stats.termCount} terms.`);
  const additionalTerms = stats.termCount - allArticlesCount;
  if (additionalTerms > 0) {
    console.log(`(${additionalTerms} additional terms from brackets)`);
  }
  await prisma.$disconnect();
})();
