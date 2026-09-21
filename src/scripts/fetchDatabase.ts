import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const PIXIV_DUMP_REPO = 'MarvNC/pixiv-dump';
const DB_FILENAME = 'pixiv.db';
const DB_DIR = join(process.cwd(), 'db');
const MINIMUM_ARTICLE_COUNT = 700_000;

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  assets: GitHubAsset[];
}

async function validateDatabase(dbPath: string) {
  const prisma = new PrismaClient();
  try {
    const integrityRows = await prisma.$queryRawUnsafe<
      Array<{ integrity_check: string }>
    >('PRAGMA integrity_check;');
    if (integrityRows[0]?.integrity_check !== 'ok') {
      throw new Error('Downloaded database failed SQLite integrity_check');
    }

    const articleCount = await prisma.pixivArticle.count();
    console.log(`Database contains ${articleCount} articles`);
    if (articleCount < MINIMUM_ARTICLE_COUNT) {
      throw new Error(
        `Database contains only ${articleCount} articles; expected at least ${MINIMUM_ARTICLE_COUNT}`,
      );
    }
  } catch (error) {
    await rm(dbPath, { force: true });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetches the latest Pixiv database dump from GitHub releases
 */
async function fetchDatabase() {
  try {
    console.log('Fetching latest Pixiv database...');

    // Ensure db directory exists
    if (!existsSync(DB_DIR)) {
      await mkdir(DB_DIR, { recursive: true });
    }

    const dbPath = join(DB_DIR, DB_FILENAME);

    // Check if database already exists
    if (existsSync(dbPath)) {
      console.log('Database already exists at:', dbPath);
      await validateDatabase(dbPath);
      console.log('Skipping download after validating existing database.');
      return;
    }

    // Fetch latest release from GitHub API
    const [owner, repo] = PIXIV_DUMP_REPO.split('/');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

    console.log(`Fetching release info from: ${apiUrl}`);
    const releaseResponse = await fetch(apiUrl);

    if (!releaseResponse.ok) {
      throw new Error(
        `Failed to fetch release info: ${releaseResponse.status} ${releaseResponse.statusText}`,
      );
    }

    const release: GitHubRelease = await releaseResponse.json();

    // Find the pixiv.db asset
    const asset = release.assets.find((a) => a.name === DB_FILENAME);

    if (!asset) {
      throw new Error(`Asset '${DB_FILENAME}' not found in latest release`);
    }

    const downloadUrl = asset.browser_download_url;
    console.log(`Downloading database from: ${downloadUrl}`);
    console.log(`File size: ${(asset.size / 1024 / 1024).toFixed(2)} MB`);

    // Download the database
    const dbResponse = await fetch(downloadUrl);

    if (!dbResponse.ok) {
      throw new Error(
        `Failed to download database: ${dbResponse.status} ${dbResponse.statusText}`,
      );
    }

    // Save to file
    const arrayBuffer = await dbResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(dbPath, buffer);
    await validateDatabase(dbPath);

    console.log(`✓ Database downloaded and validated successfully to: ${dbPath}`);
  } catch (error) {
    console.error('Error fetching database:', error);
    process.exit(1);
  }
}

fetchDatabase();
