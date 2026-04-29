# Markdown Viewer Upgrade — Tiptap WYSIWYG

**Date:** 2026-04-29
**Status:** Design — pending user approval
**Owner:** Doron

## Context

The current `/visualizer` route ("MD Files Preview") is a dual-pane tool: a plain `<textarea>` on the left and a read-only `react-markdown` preview on the right. A second markdown viewer exists under `/it-tools` (`MarkdownPreviewTool`) that uses a hand-rolled regex parser and `dangerouslySetInnerHTML` — a lower-quality duplicate with mild XSS risk.

The user wants a unified WYSIWYG surface that both **edits** and **views** markdown files in a single pane, replacing the textarea/preview split. Tiptap (ProseMirror-based) was named as the candidate library.

## Goal

Replace the dual-pane viewer with a single-pane Tiptap WYSIWYG editor that:

- Loads `.md` files via drop or paste.
- Edits visually with a top toolbar.
- Honors keyboard markdown shortcuts (`## ` → H2, `- [ ] ` → task item, etc.).
- Exports back to markdown (copy or download).
- Preserves raw HTML elements found in source files.

Replace the duplicate `it-tools/MarkdownPreviewTool` with the same component to delete the regex parser and `dangerouslySetInnerHTML`.

## Non-goals

- Persistence (no autosave, no document list, no cloud sync).
- Integration with the main todo-list state.
- Slash menu, bubble menu, drag handles.
- Math (KaTeX), mermaid diagrams, scroll-sync, real-time collaboration.
- Mobile-specific redesign beyond making the toolbar horizontally scrollable.

## Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Layout | Single-pane WYSIWYG (no source pane, no tabs) |
| 2 | Persistence | None — transient viewer-editor |
| 3 | Raw HTML handling | Preserve as read-only blocks; sanitize on parse |
| 4 | Edit affordances | Top toolbar only |
| 5 | Markdown shortcuts | Yes (typing `## ` makes H2, etc.) |
| 6 | Duplicate viewer | Replace `it-tools/MarkdownPreviewTool` with the same component |

## User flow

1. User navigates to `/visualizer`. Empty Tiptap canvas with placeholder text.
2. User drops a `.md` file or pastes markdown via the compact drop zone above the editor.
3. Markdown is parsed into a Tiptap document and rendered.
4. User edits visually using the toolbar or markdown keyboard shortcuts.
5. User clicks **Copy as Markdown** or **Download .md** to export.
6. Header task-count badge updates live as the document changes.

## Architecture

```
MarkdownVisualizerPage
├── Header (back, title, task-count badge, Copy MD, Download .md)
├── DropZone (compact, above editor)
└── MarkdownEditor (single pane)
    ├── MarkdownEditorToolbar (top)
    └── Tiptap EditorContent
        ├── StarterKit nodes (paragraph, heading, list, code-block, blockquote, hr, ...)
        ├── Task list / task item
        ├── Table extensions
        ├── Link, Image, Placeholder, Typography
        ├── CodeBlockLowlight (replaces react-syntax-highlighter)
        ├── Markdown extension (tiptap-markdown — round-trip)
        └── RawHtmlBlock / RawHtmlInline (custom nodes for unknown HTML)
```

## Component breakdown

### `MarkdownEditor.tsx` (new)
Wraps Tiptap. Sole consumer of `tiptap-markdown` and `dompurify`.

- **Props:**
  - `value: string` — markdown source.
  - `onChange(markdown: string): void` — fires on each edit (debounced internally if needed).
  - `readOnly?: boolean` — disables editing and the toolbar.
  - `placeholder?: string` — passed to `@tiptap/extension-placeholder`.
- **Behavior:**
  - On mount, parses `value` (markdown → ProseMirror doc) via `tiptap-markdown`.
  - On every transaction, serializes the doc back to markdown and calls `onChange` (debounced ~150ms to avoid thrash on large documents).
  - Treats `value` as a one-way input: the editor re-syncs from `value` only when the incoming string differs from its own most recent serialization (e.g., on file drop or paste). This prevents the controlled-component echo loop where parent state updates cause cursor jumps.
  - Detects unknown HTML during parse; routes to `RawHtmlBlock` / `RawHtmlInline`.

### `MarkdownEditorToolbar.tsx` (new, internal to `MarkdownEditor`)
Top bar of buttons; disabled when `readOnly`. Contents:

- Undo · Redo
- Heading 1 · Heading 2 · Heading 3
- Bold · Italic · Strike · Inline code
- Bulleted list · Numbered list · Task list
- Blockquote · Code block
- Link · Table · Horizontal rule

Each button reads its active state from the editor (`editor.isActive('bold')`, etc.) so it visually reflects the cursor's current marks/nodes.

### `RawHtmlBlock`, `RawHtmlInline` (new Tiptap nodes)
Atoms (non-editable internals) that render sanitized HTML strings for tags Tiptap does not natively model:

- Block: `<details>`, `<summary>`, `<figure>`, `<figcaption>`, `<video>`, `<audio>`, `<picture>`, `<source>`.
- Inline: `<kbd>`, `<mark>`, `<abbr>`, `<sub>`, `<sup>`, `<ins>`, `<var>`, `<samp>`, `<dfn>`.

The user can select and delete these nodes but cannot edit their internals. Their HTML is sanitized at parse time using DOMPurify with an allowlist matching the current `rehype-sanitize` schema. On export, the node emits the **sanitized** string it stored at parse time — not the original — so dangerous content stripped on load is not reintroduced on save.

### `MarkdownVisualizerPage.tsx` (modified)
- Collapse the dual-pane layout to single-pane.
- Compact drop zone strip above the editor (file upload + drag/drop, kept).
- Replace the `<textarea>` + `<MarkdownPreview>` pair with a single `<MarkdownEditor value={content} onChange={setContent} />`.
- Header gains two new buttons: **Copy as Markdown** and **Download .md**.
- Task-count badge keeps its current behavior: parse `content` with `parseMarkdownToTasks`, count non-header tasks, debounce.
- Existing analytics events (`trackMarkdownVisualizerFileUploaded`, `trackMarkdownVisualizerTextPasted`) preserved.

### `it-tools/MarkdownPreviewTool.tsx` (modified)
- Keep the surrounding chrome: title, description, word/char/line stats panel, cheat sheet section.
- Replace the editor/preview body with `<MarkdownEditor value={markdown} onChange={setMarkdown} />`.
- Delete the local `parseMarkdown` function (regex parser).
- Delete `dangerouslySetInnerHTML` usage.
- Stats panel reads from `markdown` (the raw string), unchanged.

### `MarkdownPreview.tsx` (deleted)
Verified to be used only by `MarkdownVisualizerPage`. After the migration it has no consumers and is removed.

## Markdown round-trip

`tiptap-markdown` is the source of truth for the markdown ↔ ProseMirror conversion. It covers GFM (tables, task lists, strikethrough, autolinks) out of the box.

Unknown HTML handling:

1. **Parse:** Run the markdown source through `tiptap-markdown`. Before handing to Tiptap, intercept HTML tokens that fall outside the natively-modeled set; sanitize them with DOMPurify (allowlist mirrors `MarkdownPreview`'s current `rehype-sanitize` schema); insert as `RawHtmlBlock` or `RawHtmlInline` nodes.
2. **Edit:** Native nodes (paragraphs, headings, lists, tables, etc.) are fully editable. Raw HTML nodes are atomic — selectable and deletable, not editable inside.
3. **Serialize:** `tiptap-markdown` serializes native nodes; raw HTML nodes contribute the sanitized HTML string they stored at parse time.

Code blocks use `@tiptap/extension-code-block-lowlight` with `lowlight` for syntax highlighting, replacing `react-syntax-highlighter`. Fenced code (` ```js `) round-trips cleanly.

## Dependencies

### Added
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`
- `@tiptap/extension-task-list`, `@tiptap/extension-task-item`
- `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`
- `@tiptap/extension-link`, `@tiptap/extension-image`
- `@tiptap/extension-placeholder`, `@tiptap/extension-typography`
- `@tiptap/extension-code-block-lowlight`, `lowlight`
- `tiptap-markdown`
- `dompurify` (and `@types/dompurify` if needed)

### Removed
- `react-markdown`
- `remark-gfm`
- `rehype-raw`
- `rehype-sanitize`
- `react-syntax-highlighter` (and its types)

### Net bundle impact
Roughly +30 to +60 KB gzipped after removals. Acceptable for the feature upgrade.

## Toolbar interactions

| Button | Action | Active-state source |
|--------|--------|---------------------|
| Undo / Redo | `editor.chain().undo()` / `.redo()` | `editor.can().undo()` / `.redo()` |
| H1 / H2 / H3 | `toggleHeading({ level })` | `isActive('heading', { level })` |
| Bold / Italic / Strike / Code | `toggleBold/Italic/Strike/Code` | `isActive('bold')` etc. |
| Bullet / Ordered / Task list | `toggleBulletList/OrderedList/TaskList` | `isActive('bulletList')` etc. |
| Blockquote | `toggleBlockquote` | `isActive('blockquote')` |
| Code block | `toggleCodeBlock` | `isActive('codeBlock')` |
| Link | `window.prompt` for URL → `setLink({ href })`; if URL empty, unset the link | `isActive('link')` |
| Table | `insertTable({ rows: 3, cols: 3, withHeaderRow: true })` | n/a |
| HR | `setHorizontalRule()` | n/a |

## Export flow

- **Copy as Markdown:** Read editor state via `editor.storage.markdown.getMarkdown()`, write to `navigator.clipboard.writeText`.
- **Download .md:** Same source, wrap in a `Blob`, trigger anchor download with filename `markdown-<timestamp>.md`.

Both buttons live in the page header, right of the task-count badge.

## Edge cases and risks

| Case | Behavior |
|------|----------|
| File >1MB | Existing `useMarkdownFile` rejects with an error toast; unchanged. |
| Markdown containing a raw `<script>` | DOMPurify strips it; raw HTML node receives empty content or is not created. |
| Footnotes, definition lists, custom container syntax | Out of `tiptap-markdown`'s default coverage; lost on round-trip. Documented as a known limitation. |
| Raw HTML `<table>` (not pipe syntax) | Captured as `RawHtmlBlock`; not editable as a Tiptap table. |
| Mobile narrow viewport | Toolbar gets `overflow-x: auto`; no responsive collapse. |
| User pastes HTML from clipboard | Tiptap's default paste handling converts known tags to nodes; unknown tags fall to raw HTML nodes. |
| Empty document | Placeholder shows. Task-count badge reads "No tasks detected" (current behavior). |

## Out of scope

The following will explicitly **not** be done as part of this change. They can be considered as separate follow-ups if user demand emerges.

- Persistence (autosave, multi-document UI).
- Integration with the main todo-list state (no "send to my list" button).
- Slash menu, bubble menu, drag handles.
- Math (KaTeX), mermaid diagrams.
- Scroll-sync (no source pane to sync with).
- Real-time collaboration.
- Mobile-specific toolbar redesign.

## Migration order (informational — full plan in writing-plans)

1. Add Tiptap + lowlight + tiptap-markdown + dompurify dependencies.
2. Build `MarkdownEditor` + `MarkdownEditorToolbar` + raw-html nodes in isolation.
3. Verify round-trip on a representative `.md` corpus (this repo's READMEs, GFM samples, raw-HTML samples).
4. Migrate `MarkdownVisualizerPage` to single-pane.
5. Migrate `it-tools/MarkdownPreviewTool`.
6. Delete `src/components/MarkdownPreview.tsx`.
7. Remove now-unused dependencies (`react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, `react-syntax-highlighter`).
8. Smoke-test both pages in the browser; verify SEO meta and analytics fire.
