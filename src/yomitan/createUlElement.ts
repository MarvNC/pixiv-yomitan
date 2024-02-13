import {
  StructuredContentData,
  StructuredContentNode,
  StructuredContentStyle,
} from 'yomichan-dict-builder/dist/types/yomitan/termbank';

export function createUlElement({
  content,
  contentArray,
  style,
  data,
}: {
  content?: StructuredContentNode;
  contentArray?: StructuredContentNode[];
  style?: StructuredContentStyle;
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
  if (style) {
    element.style = style;
  }
  if (data) {
    element.data = data;
  }
  return element;
}
