import { PixivArticle } from '@prisma/client';
import { prisma } from '..';

/**
 * Asynchronous generator function that yields articles from the database.
 * @param limit The maximum number of articles to retrieve in each iteration.
 * @returns An asynchronous generator that yields articles.
 */
export async function* articleGenerator(limit: number): AsyncGenerator<PixivArticle> {
  let skip = 0;

  while (true) {
    const articles = await prisma.pixivArticle.findMany({ take: limit, skip });

    if (articles.length === 0) {
      break;
    }

    for (const article of articles) {
      yield article;
    }

    skip += limit;
  }
}
