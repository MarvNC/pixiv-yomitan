import path from 'path';
import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

const assetsFolder = 'assets';

export function createImageNode({
  filePath, alt,
}: {
  filePath: string;
  alt: string;
}): StructuredContentNode {
  return {
    tag: 'img',
    path: path.join(assetsFolder, filePath),
    alt: alt,
    collapsed: false,
    collapsible: false,
    height: 1,
    width: 1,
    sizeUnits: 'em',
    verticalAlign: 'middle',
  };
}
