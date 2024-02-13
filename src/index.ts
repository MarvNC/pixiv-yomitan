import { Dictionary } from 'yomichan-dict-builder';
import { SingleBar } from 'cli-progress';
import { articleToTermEntry } from './yomitan/articleToTermEntry';
import { isDevMode } from './helpers/isDevMode';
import { getPackageVersion } from './helpers/getPackageVersion';
import { isValidArticle } from './helpers/isValidArticle';
import { getDatabaseData } from './helpers/getDatabaseData';
import { addAllAssetsToDictionary } from './yomitan/addAllAssetsToDictionary';
import yargs from 'yargs';

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

  const { allArticles } = await getDatabaseData();

  // YYYY-MM-DD
  const latestDateShort = new Date().toISOString().split('T')[0];

  // If dev mode, limit to 5 articles
  if (devMode) {
    console.log(`Running in dev mode, limiting to 5 articles.`);
    allArticles.splice(5);
  }

  const dictionary = new Dictionary({
    fileName: `Pixiv${pixivLight ? 'Light' : ''}_${latestDateShort}.zip`,
  });

  await addAllAssetsToDictionary(dictionary);

  dictionary.setIndex({
    author: `Pixiv contributors, Marv`,
    attribution: `https://dic.pixiv.net`,
    url: `https://github.com/MarvNC/pixiv-yomitan`,
    title: `Pixiv${pixivLight ? ' Light' : ''} [${latestDateShort}]`,
    revision: getPackageVersion(),
    description: `Article summaries from the Pixiv encyclopedia (ピクシブ百科事典), ${allArticles.length} articles included.${pixivLight ? ' Light mode.' : ''}
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
  let invalidCount = 0;
  for (const article of allArticles) {
    if (!isValidArticle(article)) {
      invalidCount++;
      progressBar.increment();
      continue;
    }
    const entry = articleToTermEntry(article, pixivLight);
    await dictionary.addTerm(entry.build());
    progressBar.increment();
  }
  progressBar.stop();

  console.log(`Skipped ${invalidCount} invalid articles.`);

  console.log(`Exporting dictionary...`);
  const stats = await dictionary.export('dist');
  console.log(`Exported ${stats.termCount} terms`);
})();
