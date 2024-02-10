import fs from 'fs';
import path from 'path';

export function getPackageVersion(): string {
  const packageJsonPath = path.resolve(__dirname, '../..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}
