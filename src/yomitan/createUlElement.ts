import {
  StructuredContentData,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function createUlElement({
  content,
  listStyleType,
  data,
  splitList,
}: {
  content: StructuredContentNode;
  listStyleType?: string;
  data?: StructuredContentData;
  splitList: boolean;
}): StructuredContentNode {
  if (splitList && !Array.isArray(content)) {
    throw new Error('splitList requires content to be an array');
  }
  const element: StructuredContentNode = {
    tag: 'ul',
    content: splitList
      ? (content as StructuredContentNode[]).map((c) => ({
          tag: 'li',
          content: c,
        }))
      : {
          tag: 'li',
          content,
        },
  };
  if (listStyleType) {
    element.style = {
      listStyleType,
    };
  }
  if (data) {
    element.data = data;
  }
  return element;
}
