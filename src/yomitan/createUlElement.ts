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
    content: (Array.isArray(content) ? content : [content]).map((c) => ({
      tag: 'li',
      content: c,
    })),
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
