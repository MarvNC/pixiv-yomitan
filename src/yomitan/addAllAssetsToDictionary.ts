import { Dictionary } from 'yomichan-dict-builder';
import fs from 'fs';
import path from 'path';

export async function addAllAssetsToDictionary(dictionary: Dictionary) {
  // Read all files in assets folder
  const assetFiles = fs.readdirSync('assets');
  for (const file of assetFiles) {
    const filePath = path.join('assets', file);
    await dictionary.addFile(filePath, filePath);
  }
}
