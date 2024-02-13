import {
  StructuredContentData,
  StructuredContentNode,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function createUlElement({
  content,
  contentArray,
  listStyleType,
  data,
}: {
  content?: StructuredContentNode;
  contentArray?: StructuredContentNode[];
  listStyleType?: string;
  data?: StructuredContentData;
}): StructuredContentNode {
  if (!content && !contentArray) {
    throw new Error('content or contentArray must be provided');
  }
  const element: StructuredContentNode = {
    tag: 'ul',
    content: [...(contentArray ?? []), content].map((c) => ({
      tag: 'li',
      content: c,
    })),
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
