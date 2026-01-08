import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const PIXIV_DUMP_REPO = 'MarvNC/pixiv-dump';
const DB_FILENAME = 'pixiv.db';
const DB_DIR = join(process.cwd(), 'db');

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
      console.log('Skipping download. Delete the file to re-download.');
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

    const release = await releaseResponse.json();

    // Find the pixiv.db asset
    const asset = release.assets.find(
      (a: { name: string }) => a.name === DB_FILENAME,
    );

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

    console.log(`✓ Database downloaded successfully to: ${dbPath}`);
  } catch (error) {
    console.error('Error fetching database:', error);
    process.exit(1);
  }
}

fetchDatabase();
