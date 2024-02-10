import {
  StructuredContentData,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function createUlElement({
  content,
  listPrefix,
  data,
}: {
  content: StructuredContentNode;
  listPrefix?: string;
  data?: StructuredContentData;
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
  if (data) {
    element.data = data;
  }
  return element;
}
