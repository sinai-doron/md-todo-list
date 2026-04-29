import { Node, mergeAttributes } from '@tiptap/react';
import { sanitizeHtml } from '../sanitizeHtml';

export interface RawHtmlBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const RawHtmlBlock = Node.create<RawHtmlBlockOptions>({
  name: 'rawHtmlBlock',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        // When parsing back from a previously-rendered wrapper, prefer the
        // stored attribute. Otherwise sanitize the raw element on first parse
        // so the stored value is the sanitized form (per spec).
        parseHTML: (element: HTMLElement) => {
          const stored = element.getAttribute('data-raw-html');
          if (stored !== null) return stored;
          return sanitizeHtml(element.outerHTML);
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-raw-html': attributes.html as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'details' },
      { tag: 'figure' },
      { tag: 'video' },
      { tag: 'audio' },
      { tag: 'picture' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-raw-html': node.attrs.html,
        class: 'raw-html-block',
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'raw-html-block';
      dom.contentEditable = 'false';
      // Stored html is already sanitized at parse time.
      dom.innerHTML = node.attrs.html as string;
      return { dom };
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(
          state: { write: (s: string) => void; closeBlock: (n: unknown) => void },
          node: { attrs: { html: string } },
        ) {
          state.write(node.attrs.html);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});
