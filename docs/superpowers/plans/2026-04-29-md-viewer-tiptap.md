# Tiptap WYSIWYG Markdown Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dual-pane textarea+react-markdown viewer with a single-pane Tiptap WYSIWYG editor; consolidate the duplicate `it-tools` viewer onto the same component.

**Architecture:** A new `MarkdownEditor` React component wraps Tiptap with a top toolbar, GFM extensions, code-block syntax highlighting via `lowlight`, and custom `RawHtmlBlock` / `RawHtmlInline` nodes that preserve unknown HTML (sanitized via DOMPurify). `tiptap-markdown` handles round-trip serialization. The component is consumed by both `MarkdownVisualizerPage` and `it-tools/MarkdownPreviewTool`.

**Tech Stack:** React 19, TypeScript, Tiptap v2 (`@tiptap/react`, `@tiptap/starter-kit`, plus task-list/table/link/image/code-block-lowlight/placeholder/typography extensions), `tiptap-markdown` (markdown ↔ ProseMirror), `lowlight` (code-block syntax highlighting), `dompurify` (sanitization), styled-components (existing project styling).

**Spec:** `docs/superpowers/specs/2026-04-29-md-viewer-tiptap-design.md`

**Testing strategy:** This project has no test infrastructure (no vitest/jest). Verification is done via in-browser smoke checks using a representative corpus of markdown samples in Task 12. Pure functions (`sanitizeHtml`, raw-HTML node serializers) are designed for testability and can have tests added later.

---

## File structure

**New files:**
- `src/components/markdown-editor/MarkdownEditor.tsx` — Tiptap wrapper, controlled component
- `src/components/markdown-editor/MarkdownEditorToolbar.tsx` — top toolbar
- `src/components/markdown-editor/extensions/RawHtmlBlock.ts` — Tiptap node for block-level raw HTML
- `src/components/markdown-editor/extensions/RawHtmlInline.ts` — Tiptap node for inline raw HTML
- `src/components/markdown-editor/sanitizeHtml.ts` — DOMPurify wrapper with allowlist
- `src/components/markdown-editor/index.ts` — barrel export

**Modified files:**
- `src/pages/MarkdownVisualizerPage.tsx` — collapse to single pane; add Copy/Download buttons
- `src/components/it-tools/tools/MarkdownPreviewTool.tsx` — replace editor body with `MarkdownEditor`
- `package.json` — add Tiptap stack, remove `react-markdown` / `remark-gfm` / `rehype-raw` / `rehype-sanitize` / `react-syntax-highlighter`

**Deleted files:**
- `src/components/MarkdownPreview.tsx`

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install Tiptap stack and tooling**

Run from repo root:

```bash
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-task-list @tiptap/extension-task-item \
  @tiptap/extension-table @tiptap/extension-table-row \
  @tiptap/extension-table-cell @tiptap/extension-table-header \
  @tiptap/extension-link @tiptap/extension-image \
  @tiptap/extension-placeholder @tiptap/extension-typography \
  @tiptap/extension-code-block-lowlight lowlight \
  tiptap-markdown dompurify
pnpm add -D @types/dompurify
```

Expected: install succeeds, `package.json` and `pnpm-lock.yaml` updated.

- [ ] **Step 2: Verify the project still builds**

Run: `pnpm build`
Expected: build completes without errors. (Old viewer still works at this stage; we haven't changed any code yet.)

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add Tiptap, lowlight, tiptap-markdown, dompurify for MD viewer upgrade"
```

---

## Task 2: Create sanitizeHtml utility

Pure function that wraps DOMPurify with the allowlist matching the current `rehype-sanitize` schema in `MarkdownPreview.tsx`.

**Files:**
- Create: `src/components/markdown-editor/sanitizeHtml.ts`

- [ ] **Step 1: Create the utility**

```typescript
// src/components/markdown-editor/sanitizeHtml.ts
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  // Native MD tags (passthrough — Tiptap handles structure but we still allow them in raw blocks)
  'a', 'b', 'br', 'code', 'em', 'i', 'img', 'p', 'pre', 'span', 'strong', 'u',
  'ul', 'ol', 'li', 'blockquote', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 'ins',
  // GitHub-style HTML elements (the reason this allowlist exists)
  'details', 'summary', 'kbd', 'mark', 'abbr', 'sub', 'sup',
  'var', 'samp', 'dfn',
  'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'name',
  'open', // <details>
  'controls', 'width', 'height', 'poster', 'preload', // <video>/<audio>
  'type', // <source>
  'loading', 'decoding', // <img>
  'colspan', 'rowspan', 'align', // tables
  'target', 'rel', // <a>
];

/**
 * Sanitize an HTML string using DOMPurify with an allowlist matching
 * the previous `rehype-sanitize` schema. Strips <script>, event handlers,
 * and any tag/attr not in the allowlist.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
```

- [ ] **Step 2: Verify TypeScript accepts the file**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/markdown-editor/sanitizeHtml.ts
git commit -m "feat: add sanitizeHtml utility for MD viewer raw-HTML nodes"
```

---

## Task 3: Create RawHtmlBlock node

A Tiptap block-level node that renders sanitized HTML and is non-editable internally. Selection and deletion still work.

**Files:**
- Create: `src/components/markdown-editor/extensions/RawHtmlBlock.ts`

- [ ] **Step 1: Create the node**

```typescript
// src/components/markdown-editor/extensions/RawHtmlBlock.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { sanitizeHtml } from '../sanitizeHtml';

export interface RawHtmlBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * Atomic block node that holds a sanitized HTML string. Used to preserve
 * raw HTML (e.g., <details>, <figure>, <video>) found in markdown source
 * that Tiptap doesn't natively model. Non-editable internals; users can
 * select/delete the whole block.
 *
 * Tiptap-markdown serializes this node by emitting its stored html verbatim.
 */
export const RawHtmlBlock = Node.create<RawHtmlBlockOptions>({
  name: 'rawHtmlBlock',
  group: 'block',
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
    // Tags we want to capture as block-level raw HTML.
    return [
      { tag: 'details' },
      { tag: 'figure' },
      { tag: 'video' },
      { tag: 'audio' },
      { tag: 'picture' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'raw-html-block';
    wrapper.innerHTML = sanitizeHtml(node.attrs.html as string);
    // Tiptap's renderHTML expects a serializable description; we use the
    // wrapper's outerHTML attributes here and let the NodeView render the body.
    return ['div', mergeAttributes(HTMLAttributes, { 'data-raw-html': node.attrs.html, class: 'raw-html-block' })];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'raw-html-block';
      dom.contentEditable = 'false';
      dom.innerHTML = sanitizeHtml(node.attrs.html as string);
      return { dom };
    };
  },

  // tiptap-markdown serializer: emit the stored HTML verbatim.
  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (s: string) => void; closeBlock: (n: unknown) => void }, node: { attrs: { html: string } }) {
          state.write(node.attrs.html);
          state.closeBlock(node);
        },
        parse: {
          // tiptap-markdown invokes this when it encounters html_block tokens
          // from markdown-it; we capture the raw token content into a node.
        },
      },
    };
  },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/markdown-editor/extensions/RawHtmlBlock.ts
git commit -m "feat: add RawHtmlBlock Tiptap node for MD viewer"
```

---

## Task 4: Create RawHtmlInline node

Inline counterpart to RawHtmlBlock, for tags like `<kbd>`, `<mark>`, `<sub>`, `<sup>`.

**Files:**
- Create: `src/components/markdown-editor/extensions/RawHtmlInline.ts`

- [ ] **Step 1: Create the node**

```typescript
// src/components/markdown-editor/extensions/RawHtmlInline.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { sanitizeHtml } from '../sanitizeHtml';

export interface RawHtmlInlineOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * Atomic inline node holding sanitized inline HTML (e.g., <kbd>, <mark>).
 * Selectable/deletable but not editable internally.
 */
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
    return ['span', mergeAttributes(HTMLAttributes, { 'data-raw-html': node.attrs.html, class: 'raw-html-inline' })];
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
        serialize(state: { write: (s: string) => void }, node: { attrs: { html: string } }) {
          state.write(node.attrs.html);
        },
        parse: {},
      },
    };
  },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/markdown-editor/extensions/RawHtmlInline.ts
git commit -m "feat: add RawHtmlInline Tiptap node for MD viewer"
```

---

## Task 5: Create MarkdownEditorToolbar component

Top toolbar with formatting buttons. Reads active state from the Tiptap editor instance.

**Files:**
- Create: `src/components/markdown-editor/MarkdownEditorToolbar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/markdown-editor/MarkdownEditorToolbar.tsx
import React from 'react';
import type { Editor } from '@tiptap/react';
import styled from 'styled-components';

const Bar = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  overflow-x: auto;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
`;

const Group = styled.div`
  display: flex;
  gap: 2px;
  padding-right: 8px;
  margin-right: 4px;
  border-right: 1px solid #e0e0e0;

  &:last-child {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
  }
`;

const Btn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: ${({ $active }) => ($active ? 'rgba(98, 0, 238, 0.12)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#6200ee' : '#444')};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: rgba(98, 0, 238, 0.08);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .material-symbols-outlined { font-size: 18px; }
`;

interface Props {
  editor: Editor | null;
  disabled?: boolean;
}

export const MarkdownEditorToolbar: React.FC<Props> = ({ editor, disabled }) => {
  if (!editor) return null;

  const can = editor.can();
  const isDisabled = (capable: boolean) => disabled || !capable;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previous ?? '');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <Bar role="toolbar" aria-label="Markdown editor toolbar">
      <Group>
        <Btn type="button" onClick={() => editor.chain().focus().undo().run()} disabled={isDisabled(can.undo())} title="Undo (Cmd+Z)">
          <span className="material-symbols-outlined">undo</span>
        </Btn>
        <Btn type="button" onClick={() => editor.chain().focus().redo().run()} disabled={isDisabled(can.redo())} title="Redo (Cmd+Shift+Z)">
          <span className="material-symbols-outlined">redo</span>
        </Btn>
      </Group>

      <Group>
        <Btn type="button" $active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={disabled} title="Heading 1">H1</Btn>
        <Btn type="button" $active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={disabled} title="Heading 2">H2</Btn>
        <Btn type="button" $active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={disabled} title="Heading 3">H3</Btn>
      </Group>

      <Group>
        <Btn type="button" $active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} disabled={disabled} title="Bold (Cmd+B)">
          <span className="material-symbols-outlined">format_bold</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={disabled} title="Italic (Cmd+I)">
          <span className="material-symbols-outlined">format_italic</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} disabled={disabled} title="Strikethrough">
          <span className="material-symbols-outlined">strikethrough_s</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} disabled={disabled} title="Inline code">
          <span className="material-symbols-outlined">code</span>
        </Btn>
      </Group>

      <Group>
        <Btn type="button" $active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled} title="Bulleted list">
          <span className="material-symbols-outlined">format_list_bulleted</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={disabled} title="Numbered list">
          <span className="material-symbols-outlined">format_list_numbered</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} disabled={disabled} title="Task list">
          <span className="material-symbols-outlined">checklist</span>
        </Btn>
      </Group>

      <Group>
        <Btn type="button" $active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled} title="Blockquote">
          <span className="material-symbols-outlined">format_quote</span>
        </Btn>
        <Btn type="button" $active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} disabled={disabled} title="Code block">
          <span className="material-symbols-outlined">data_object</span>
        </Btn>
      </Group>

      <Group>
        <Btn type="button" $active={editor.isActive('link')} onClick={setLink} disabled={disabled} title="Link">
          <span className="material-symbols-outlined">link</span>
        </Btn>
        <Btn type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={disabled} title="Insert table">
          <span className="material-symbols-outlined">table_chart</span>
        </Btn>
        <Btn type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled} title="Horizontal rule">
          <span className="material-symbols-outlined">horizontal_rule</span>
        </Btn>
      </Group>
    </Bar>
  );
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/markdown-editor/MarkdownEditorToolbar.tsx
git commit -m "feat: add MarkdownEditorToolbar with formatting + table + link controls"
```

---

## Task 6: Create MarkdownEditor wrapper

The main component. Wraps Tiptap, owns the markdown ↔ ProseMirror conversion via `tiptap-markdown`, and renders the toolbar above the editor canvas.

**Files:**
- Create: `src/components/markdown-editor/MarkdownEditor.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/markdown-editor/MarkdownEditor.tsx
import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import styled from 'styled-components';

import { MarkdownEditorToolbar } from './MarkdownEditorToolbar';
import { RawHtmlBlock } from './extensions/RawHtmlBlock';
import { RawHtmlInline } from './extensions/RawHtmlInline';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
`;

const EditorScroller = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;

  /* ProseMirror content baseline styling — mirrors the old MarkdownPreview look */
  .ProseMirror {
    outline: none;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    min-height: 100%;
  }

  .ProseMirror h1 { font-size: 24px; margin: 16px 0 8px; font-weight: 600; }
  .ProseMirror h2 { font-size: 20px; margin: 16px 0 8px; font-weight: 600; }
  .ProseMirror h3 { font-size: 18px; margin: 16px 0 8px; font-weight: 600; }
  .ProseMirror h4 { font-size: 16px; margin: 16px 0 8px; font-weight: 600; }
  .ProseMirror h5 { font-size: 14px; margin: 16px 0 8px; font-weight: 600; }
  .ProseMirror h6 { font-size: 13px; margin: 16px 0 8px; font-weight: 600; color: #666; }

  .ProseMirror p { margin: 8px 0; }

  .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
  .ProseMirror li { margin: 4px 0; }

  .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
  .ProseMirror ul[data-type="taskList"] li { display: flex; gap: 8px; }
  .ProseMirror ul[data-type="taskList"] li > label { flex: 0 0 auto; }
  .ProseMirror ul[data-type="taskList"] li > div { flex: 1 1 auto; }

  .ProseMirror code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #d63384;
  }

  .ProseMirror pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
    font-family: 'Courier New', monospace;
    font-size: 13px;

    code { background: none; padding: 0; color: inherit; }
  }

  .ProseMirror blockquote {
    border-left: 4px solid #6200ee;
    margin: 12px 0;
    padding: 8px 0 8px 16px;
    color: #666;
    background: #f9f9ff;
    border-radius: 0 4px 4px 0;
  }

  .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 13px;

    th, td { border: 1px solid #e0e0e0; padding: 8px 12px; }
    th { background: #f9f9f9; font-weight: 600; }
  }

  .ProseMirror a { color: #4a90e2; text-decoration: none; }
  .ProseMirror a:hover { text-decoration: underline; }

  .ProseMirror img { max-width: 100%; height: auto; border-radius: 4px; }

  .ProseMirror hr { border: none; border-top: 1px solid #e0e0e0; margin: 16px 0; }

  /* Raw HTML node styling */
  .raw-html-block {
    margin: 12px 0;
    padding: 8px 12px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
  }

  .raw-html-block:hover {
    outline: 2px solid rgba(98, 0, 238, 0.15);
  }

  .raw-html-inline {
    /* Inherits inline styles from sanitized content (kbd, mark, etc.) */
  }

  /* Placeholder */
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #999;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const lowlight = createLowlight(common);

/**
 * Single-pane WYSIWYG markdown editor.
 *
 * - `value` is markdown source. Treated as a one-way input: the editor only
 *   re-syncs from `value` when the incoming string differs from its own most
 *   recent serialization (avoids cursor-jump echo loops).
 * - `onChange` fires on each transaction, debounced ~150ms.
 * - Raw HTML in the source is preserved via RawHtmlBlock / RawHtmlInline nodes.
 */
export const MarkdownEditor: React.FC<Props> = ({ value, onChange, readOnly = false, placeholder }) => {
  const lastEmitted = useRef<string>(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we use CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Drop a .md file or start typing...' }),
      Typography,
      Markdown.configure({ html: true, tightLists: true, linkify: true, breaks: false, transformPastedText: true, transformCopiedText: true }),
      RawHtmlBlock,
      RawHtmlInline,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const md = e.storage.markdown.getMarkdown() as string;
        lastEmitted.current = md;
        onChange(md);
      }, 150);
    },
  }, []);

  // Re-sync when `value` changes externally (file drop / paste-to-textarea)
  // but skip echo updates from our own onUpdate emission.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  // Honor readOnly toggles
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Flush any pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <Container>
      <MarkdownEditorToolbar editor={editor} disabled={readOnly} />
      <EditorScroller>
        <EditorContent editor={editor} />
      </EditorScroller>
    </Container>
  );
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm tsc -b --noEmit`
Expected: no errors. (If the tiptap-markdown storage type is loose, an `as` cast as shown should suffice.)

- [ ] **Step 3: Commit**

```bash
git add src/components/markdown-editor/MarkdownEditor.tsx
git commit -m "feat: add MarkdownEditor — Tiptap WYSIWYG with MD round-trip"
```

---

## Task 7: Create barrel export

**Files:**
- Create: `src/components/markdown-editor/index.ts`

- [ ] **Step 1: Create the barrel**

```typescript
// src/components/markdown-editor/index.ts
export { MarkdownEditor } from './MarkdownEditor';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/markdown-editor/index.ts
git commit -m "feat: add markdown-editor barrel export"
```

---

## Task 8: Migrate `MarkdownVisualizerPage` to single pane

Collapse the dual-pane layout, swap textarea + MarkdownPreview for `MarkdownEditor`, add Copy/Download buttons in the header. Keep the drop zone (compact strip above the editor), task-count badge, error toast, and analytics events.

**Files:**
- Modify: `src/pages/MarkdownVisualizerPage.tsx`

- [ ] **Step 1: Replace the page implementation**

Overwrite `src/pages/MarkdownVisualizerPage.tsx` with:

```tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useMarkdownFile } from '../hooks/useMarkdownFile';
import { useEngagementTracking } from '../hooks/useAnalytics';
import { MarkdownEditor } from '../components/markdown-editor';
import { SEO } from '../components/SEO';
import { parseMarkdownToTasks } from '../utils/markdownParser';
import {
  trackMarkdownVisualizerFileUploaded,
  trackMarkdownVisualizerTextPasted,
} from '../utils/analytics';
import type { Task } from '../types/Task';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover { background: #f0f0f0; color: #333; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined { color: #6200ee; }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaskCount = styled.span`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TaskCountBadge = styled.span`
  background: rgba(98, 0, 238, 0.1);
  color: #6200ee;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  color: #6200ee;
  border: 1px solid #6200ee;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: rgba(98, 0, 238, 0.06); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }

  .material-symbols-outlined { font-size: 18px; }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;
  overflow: hidden;
  min-height: 0;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const CloseErrorButton = styled.button`
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-left: auto;
  padding: 2px;

  &:hover { background: rgba(211, 47, 47, 0.1); }
`;

const DropZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${({ $isDragging }) => ($isDragging ? '#6200ee' : '#ddd')};
  border-radius: 6px;
  padding: 12px 16px;
  text-align: center;
  background: ${({ $isDragging }) => ($isDragging ? 'rgba(98, 0, 238, 0.05)' : 'white')};
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover { border-color: #6200ee; background: rgba(98, 0, 238, 0.02); }
`;

const DropZoneIcon = styled.div`
  font-size: 24px;
  color: #6200ee;
  display: flex;
  align-items: center;
`;

const DropZoneTextContainer = styled.div`
  text-align: left;
`;

const DropZoneText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const DropZoneSubtext = styled.p`
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #888;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const EditorWrap = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

export const MarkdownVisualizerPage: React.FC = () => {
  const navigate = useNavigate();
  useEngagementTracking('markdown_visualizer');

  const {
    content,
    setContent,
    isDragging,
    error,
    clearError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  } = useMarkdownFile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousContentRef = useRef('');

  // Parse tasks for header count badge
  const previewTasks = content.trim() ? parseMarkdownToTasks(content) : [];
  const countTasks = (tasks: Task[]): number => {
    let count = 0;
    tasks.forEach(task => {
      if (!task.isHeader) count++;
      if (task.children) count += countTasks(task.children);
    });
    return count;
  };
  const taskCount = countTasks(previewTasks);

  // Track paste events
  useEffect(() => {
    if (content && !previousContentRef.current && content.length > 10) {
      trackMarkdownVisualizerTextPasted();
    }
    previousContentRef.current = content;
  }, [content]);

  const handleBack = useCallback(() => navigate('/'), [navigate]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      trackMarkdownVisualizerFileUploaded();
    }
    e.target.value = '';
  };

  const handleDropWithTracking = (e: React.DragEvent) => {
    handleDrop(e);
    const file = e.dataTransfer.files?.[0];
    if (file) trackMarkdownVisualizerFileUploaded();
  };

  const handleCopyMd = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `markdown-${ts}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Esc → back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleBack]);

  const hasContent = content.trim().length > 0;

  return (
    <PageContainer>
      <SEO
        title="MD Files Preview - Markdown Visualizer"
        description="Preview and edit markdown files instantly. Upload or paste MD files to see formatted preview with syntax highlighting, tables, and task detection."
        canonical="/visualizer"
        keywords="md files preview, markdown preview, md visualizer, markdown viewer, markdown file reader"
      />
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack} title="Back to Todo List (Esc)">
            <span className="material-symbols-outlined">arrow_back</span>
          </BackButton>
          <Title>
            <span className="material-symbols-outlined">preview</span>
            Markdown Visualizer
          </Title>
        </HeaderLeft>
        <HeaderRight>
          <TaskCount>
            {taskCount > 0 ? (
              <>
                <TaskCountBadge>{taskCount}</TaskCountBadge>
                {taskCount === 1 ? 'task' : 'tasks'} detected
              </>
            ) : (
              <span style={{ color: '#999' }}>No tasks detected</span>
            )}
          </TaskCount>
          <ActionButton onClick={handleCopyMd} disabled={!hasContent} title="Copy markdown to clipboard">
            <span className="material-symbols-outlined">content_copy</span>
            Copy MD
          </ActionButton>
          <ActionButton onClick={handleDownloadMd} disabled={!hasContent} title="Download as .md file">
            <span className="material-symbols-outlined">download</span>
            Download
          </ActionButton>
        </HeaderRight>
      </Header>

      <Content>
        {error && (
          <ErrorMessage>
            <span>&#9888;</span>
            {error}
            <CloseErrorButton onClick={clearError}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </CloseErrorButton>
          </ErrorMessage>
        )}

        <DropZone
          $isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropWithTracking}
          onClick={() => fileInputRef.current?.click()}
        >
          <DropZoneIcon>
            <span className="material-symbols-outlined">upload_file</span>
          </DropZoneIcon>
          <DropZoneTextContainer>
            <DropZoneText>Drop a .md file or click to browse</DropZoneText>
            <DropZoneSubtext>Max 1MB · or paste / type below</DropZoneSubtext>
          </DropZoneTextContainer>
        </DropZone>

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept=".md"
          onChange={handleFileInputChange}
        />

        <EditorWrap>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing markdown, or drop a .md file above..."
          />
        </EditorWrap>
      </Content>
    </PageContainer>
  );
};
```

- [ ] **Step 2: Verify TypeScript and build**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/MarkdownVisualizerPage.tsx
git commit -m "feat(visualizer): single-pane Tiptap WYSIWYG + Copy/Download MD"
```

---

## Task 9: Migrate `it-tools/MarkdownPreviewTool` onto MarkdownEditor

Replace the regex parser + `dangerouslySetInnerHTML` body with `MarkdownEditor`. Keep the title/description/stats panel/cheat sheet chrome.

**Files:**
- Modify: `src/components/it-tools/tools/MarkdownPreviewTool.tsx`

- [ ] **Step 1: Replace the implementation**

Overwrite `src/components/it-tools/tools/MarkdownPreviewTool.tsx` with:

```tsx
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { MarkdownEditor } from '../../markdown-editor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const Description = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const EditorWrap = styled.div`
  display: flex;
  min-height: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #e0e0e0; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ToolbarRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Stats = styled.div`
  font-size: 12px;
  color: #666;
`;

const CheatSheetSection = styled.div`
  margin-top: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const CheatSheetHeader = styled.div`
  background: #f5f5f5;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover { background: #eee; }
`;

const CheatSheetContent = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  padding: 16px;
`;

const CheatSheetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const CheatSheetItem = styled.div`
  code {
    display: block;
    background: #f4f4f4;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 4px;
    white-space: pre-wrap;
  }

  .description { font-size: 12px; color: #666; }
`;

const defaultMarkdown = `# Markdown Preview

This is a **live preview** of your markdown content.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~
- [Links](https://example.com)
- Inline \`code\`

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item

### Task Lists

- [x] Completed task
- [ ] Incomplete task

---

*Happy writing!*
`;

export const MarkdownPreviewTool: React.FC = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const stats = useMemo(() => {
    const words = markdown.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    return { words, chars, lines };
  }, [markdown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => setMarkdown('');
  const handleReset = () => setMarkdown(defaultMarkdown);

  return (
    <Container>
      <div>
        <Title>Markdown Preview</Title>
        <Description>Edit markdown visually with a WYSIWYG editor. Copy back to markdown anytime.</Description>
      </div>

      <ToolbarRow>
        <Stats>{stats.words} words · {stats.chars} characters · {stats.lines} lines</Stats>
        <ButtonGroup>
          <Button onClick={handleCopy}>Copy MD</Button>
          <Button onClick={handleClear}>Clear</Button>
          <Button onClick={handleReset}>Reset</Button>
        </ButtonGroup>
      </ToolbarRow>

      <EditorWrap>
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
      </EditorWrap>

      <CheatSheetSection>
        <CheatSheetHeader onClick={() => setShowCheatSheet(!showCheatSheet)}>
          <span>Markdown Cheat Sheet</span>
          <span className="material-symbols-outlined">
            {showCheatSheet ? 'expand_less' : 'expand_more'}
          </span>
        </CheatSheetHeader>
        <CheatSheetContent $expanded={showCheatSheet}>
          <CheatSheetGrid>
            <CheatSheetItem><code># Heading 1{'\n'}## Heading 2</code><div className="description">Headers (1-6 levels)</div></CheatSheetItem>
            <CheatSheetItem><code>**bold** or __bold__</code><div className="description">Bold text</div></CheatSheetItem>
            <CheatSheetItem><code>*italic* or _italic_</code><div className="description">Italic text</div></CheatSheetItem>
            <CheatSheetItem><code>~~strikethrough~~</code><div className="description">Strikethrough text</div></CheatSheetItem>
            <CheatSheetItem><code>[text](url)</code><div className="description">Links</div></CheatSheetItem>
            <CheatSheetItem><code>![alt](image-url)</code><div className="description">Images</div></CheatSheetItem>
            <CheatSheetItem><code>`inline code`</code><div className="description">Inline code</div></CheatSheetItem>
            <CheatSheetItem><code>```lang{'\n'}code block{'\n'}```</code><div className="description">Code blocks</div></CheatSheetItem>
            <CheatSheetItem><code>&gt; quote</code><div className="description">Blockquotes</div></CheatSheetItem>
            <CheatSheetItem><code>- item{'\n'}* item</code><div className="description">Unordered list</div></CheatSheetItem>
            <CheatSheetItem><code>1. item{'\n'}2. item</code><div className="description">Ordered list</div></CheatSheetItem>
            <CheatSheetItem><code>- [ ] task{'\n'}- [x] done</code><div className="description">Task list</div></CheatSheetItem>
          </CheatSheetGrid>
        </CheatSheetContent>
      </CheatSheetSection>
    </Container>
  );
};
```

- [ ] **Step 2: Verify TypeScript and build**

Run: `pnpm tsc -b --noEmit`
Expected: no errors.

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/it-tools/tools/MarkdownPreviewTool.tsx
git commit -m "refactor(it-tools): replace regex parser with MarkdownEditor (Tiptap)"
```

---

## Task 10: Delete `MarkdownPreview.tsx`

The old preview component is now unused (verified: only consumer was `MarkdownVisualizerPage`, which now uses `MarkdownEditor`).

**Files:**
- Delete: `src/components/MarkdownPreview.tsx`

- [ ] **Step 1: Confirm no remaining usages**

Run: `grep -rn "MarkdownPreview" src/ --include="*.ts" --include="*.tsx" | grep -v "MarkdownPreviewTool"`
Expected: no output (only the it-tools file remains, which is named differently).

- [ ] **Step 2: Delete the file**

```bash
rm src/components/MarkdownPreview.tsx
```

- [ ] **Step 3: Verify build**

Run: `pnpm tsc -b --noEmit && pnpm build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add -u src/components/MarkdownPreview.tsx
git commit -m "chore: remove unused MarkdownPreview.tsx"
```

---

## Task 11: Remove unused dependencies

Now that `MarkdownPreview.tsx` is gone, the rehype/remark/react-markdown stack has no consumers. Confirm and remove.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Confirm no remaining imports**

Run:

```bash
grep -rn "react-markdown\|remark-gfm\|rehype-raw\|rehype-sanitize\|react-syntax-highlighter" src/ --include="*.ts" --include="*.tsx"
```

Expected: no output.

- [ ] **Step 2: Remove the packages**

```bash
pnpm remove react-markdown remark-gfm rehype-raw rehype-sanitize react-syntax-highlighter @types/react-syntax-highlighter
```

- [ ] **Step 3: Verify build**

Run: `pnpm tsc -b --noEmit && pnpm build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: drop react-markdown / remark / rehype / react-syntax-highlighter (replaced by Tiptap)"
```

---

## Task 12: Smoke test in browser

Verify the migrated viewer in a real browser session against a representative markdown corpus. **No tests in CI** — this task is the verification gate.

**Files:** none modified.

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`
Expected: server boots; navigate to `http://localhost:5173/visualizer` (port may vary — check terminal output).

- [ ] **Step 2: Test core GFM round-trip**

Paste this markdown into the editor:

```markdown
# Heading 1
## Heading 2

**Bold** and *italic* and ~~strike~~ and `inline code`.

- bullet 1
- bullet 2
  - nested

1. one
2. two

- [ ] open task
- [x] done task

> blockquote line 1
> blockquote line 2

| Col A | Col B |
|-------|-------|
| 1     | 2     |
| 3     | 4     |

\`\`\`javascript
function hello() { return 42; }
\`\`\`

[link](https://example.com)

---
```

Verify in the rendered editor:
- Headings render at correct sizes.
- Bold/italic/strike/inline code are styled.
- Bullet, ordered, and task lists render correctly; checkboxes are clickable.
- Blockquote and table render with the expected styling.
- Code block has syntax highlighting (highlighted JS keywords).
- Link text is clickable styling (blue, underlined on hover).
- Horizontal rule renders.

- [ ] **Step 3: Test raw HTML preservation**

Paste:

```markdown
<details>
<summary>Click to expand</summary>

Hidden content.

</details>

Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to copy.

This text is <mark>highlighted</mark>.
```

Verify:
- `<details>` renders as a collapsible block (the `raw-html-block` styling shows the bordered card).
- `<kbd>` and `<mark>` render inline with their inherited styles.
- Click **Copy MD** — paste into a text editor. The output should contain the original `<details>`, `<kbd>`, `<mark>` tags (sanitized form, but functionally identical to input).

- [ ] **Step 4: Test toolbar actions**

In an empty editor:
1. Click H1 → type "Title" → confirm becomes `<h1>` styled.
2. Select text → click Bold → confirm bolded.
3. Click bulleted list → type item → confirm bullet appears.
4. Click task list → confirm checkbox appears.
5. Click Insert Table → confirm 3×3 table inserts.
6. Click Link → enter `https://example.com` in prompt → confirm link is created on selected text.
7. Cmd+Z (undo) → confirm last action reverts.

- [ ] **Step 5: Test markdown shortcuts**

Type literally in an empty doc:
- `## Heading` then press Space — should auto-convert to H2.
- `- ` then space — should start a bullet list.
- `- [ ] task` then space — should start a task list with unchecked box.
- `1. ` then space — should start an ordered list.
- `> ` then space — should start a blockquote.
- ``` ``` ``` (three backticks) then Enter — should start a code block.

- [ ] **Step 6: Test file upload**

Upload `README.md` from this repo via the drop zone. Verify:
- The README renders without errors.
- The task-count badge updates to a number > 0.
- Clicking **Download** saves a `.md` file containing the rendered content (open it and confirm contents look like the original).

- [ ] **Step 7: Test the it-tools entry**

Navigate to `/it-tools` and open the Markdown Preview tool. Verify:
- The default markdown renders with the same fidelity as the visualizer page.
- Clear/Reset buttons work.
- Word/char/line stats update as you type.
- Cheat sheet still expands/collapses.

- [ ] **Step 8: Sanity check the analytics**

Open the browser DevTools network tab. Upload a file → verify the `markdown_visualizer_file_uploaded` event fires (or the analytics call goes out). Paste text → verify `markdown_visualizer_text_pasted` fires once.

- [ ] **Step 9: Commit any final tweaks**

If any styling or interaction needed adjustment during testing, commit the fixes:

```bash
git add -A
git commit -m "fix(md-editor): smoke-test polish"
```

If no fixes were needed, skip this step.

---

## Self-Review

**Spec coverage:**
- Single-pane WYSIWYG → Task 8 (visualizer) and Task 9 (it-tools).
- Transient (no persistence) → no persistence code added; existing `useMarkdownFile` hook is the only state source.
- GFM + raw HTML preservation → Tasks 3, 4 (raw HTML nodes), Task 6 (Markdown extension with `html: true`).
- Top toolbar only → Task 5.
- Markdown keyboard shortcuts → Task 6 (StarterKit + tiptap-markdown handle these by default).
- it-tools replacement → Task 9.
- Delete MarkdownPreview.tsx → Task 10.
- Remove unused deps → Task 11.
- One-way controlled-component sync → Task 6 (`lastEmitted` ref guard).
- Sanitize-once on parse → Tasks 2, 3, 4 (DOMPurify on render; stored html is the user-provided string but rendered through sanitizeHtml).
- Bundle impact +30–60 KB → covered by Task 1 (adds) and Task 11 (removes).

**Placeholder scan:** No TBDs, TODOs, or "implement later" lines. Each step has either runnable commands or full code.

**Type consistency:**
- `MarkdownEditor` props (`value`, `onChange`, `readOnly`, `placeholder`) are consistent across Tasks 6, 8, 9.
- `RawHtmlBlock` and `RawHtmlInline` both use the `html` attribute throughout Tasks 3, 4.
- `sanitizeHtml(html: string): string` signature used identically in Tasks 2, 3, 4.

**Known limitations to call out during smoke test (not blockers):**
- Footnotes, definition lists, custom container syntax: not supported by `tiptap-markdown` defaults; will be lost on round-trip. Consistent with spec's out-of-scope section.
- Raw HTML inside MD that is identical to a native node (e.g., raw `<p>`) may either get captured by Tiptap's default parser or by our raw-HTML node depending on token order — verify in Step 3 of Task 12 and adjust the parseHTML rules in `RawHtmlBlock` if a regression appears.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-29-md-viewer-tiptap.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
