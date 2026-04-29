import { Node, mergeAttributes } from '@tiptap/react';
import { sanitizeHtml } from '../sanitizeHtml';

export interface RawHtmlInlineOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const RawHtmlInline = Node.create<RawHtmlInlineOptions>({
  name: 'rawHtmlInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-raw-html') ?? element.outerHTML,
        renderHTML: (attributes) => ({
          'data-raw-html': attributes.html as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'kbd' },
      { tag: 'mark' },
      { tag: 'abbr' },
      { tag: 'sub' },
      { tag: 'sup' },
      { tag: 'ins' },
      { tag: 'var' },
      { tag: 'samp' },
      { tag: 'dfn' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-raw-html': node.attrs.html,
        class: 'raw-html-inline',
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span');
      dom.className = 'raw-html-inline';
      dom.contentEditable = 'false';
      dom.innerHTML = sanitizeHtml(node.attrs.html as string);
      return { dom };
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(
          state: { write: (s: string) => void },
          node: { attrs: { html: string } },
        ) {
          state.write(node.attrs.html);
        },
        parse: {},
      },
    };
  },
});
