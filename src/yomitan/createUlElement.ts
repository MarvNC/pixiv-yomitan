import { StructuredContentNode } from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function createUlElement({
  content, listPrefix,
}: {
  content: StructuredContentNode;
  listPrefix?: string;
}): StructuredContentNode {
  const element: StructuredContentNode = {
    tag: 'ul',
    content: {
      tag: 'li',
      content,
    },
  };
  if (listPrefix) {
    element.style = {
      listStyleType: `"${listPrefix}"`,
    };
  }
  return element;
}
