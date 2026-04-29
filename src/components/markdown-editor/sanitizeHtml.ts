import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a', 'b', 'br', 'code', 'em', 'i', 'img', 'p', 'pre', 'span', 'strong', 'u',
  'ul', 'ol', 'li', 'blockquote', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 'ins',
  'details', 'summary', 'kbd', 'mark', 'abbr', 'sub', 'sup',
  'var', 'samp', 'dfn',
  'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'name',
  'open',
  'controls', 'width', 'height', 'poster', 'preload',
  'type',
  'loading', 'decoding',
  'colspan', 'rowspan', 'align',
  'target', 'rel',
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
