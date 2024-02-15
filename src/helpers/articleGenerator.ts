import { PixivArticle } from '@prisma/client';
import { prisma } from '..';

/**
 * Asynchronous generator function that yields articles from the database.
 * @param limit The maximum number of articles to retrieve in each iteration.
 * @returns An asynchronous generator that yields articles.
 */
export async function* articleGenerator({
  chunkCount,
  articleLimit = Infinity,
}: {
  chunkCount: number;
  articleLimit?: number;
}): AsyncGenerator<PixivArticle> {
  let skip = 0;
  let totalRetrieved = 0;

  while (true) {
    const articles = await prisma.pixivArticle.findMany({
      take: chunkCount,
      skip,
    });

    if (articles.length === 0) {
      return;
    }

    for (const article of articles) {
      yield article;
      totalRetrieved++;
      if (totalRetrieved >= articleLimit) {
        return;
      }
    }

    skip += chunkCount;
  }
}
