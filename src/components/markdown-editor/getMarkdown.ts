import type { Editor } from '@tiptap/react';

interface MarkdownStorage {
  markdown: { getMarkdown: () => string };
}

/**
 * Read the current document as markdown via the `tiptap-markdown` extension's
 * storage. Tiptap's `Storage` interface is intentionally empty — extensions
 * register their storage under string keys at runtime — so the cast is
 * concentrated here rather than scattered through call sites.
 */
export function getMarkdown(editor: Editor): string {
  const storage = editor.storage as unknown as MarkdownStorage;
  return storage.markdown?.getMarkdown() ?? '';
}
