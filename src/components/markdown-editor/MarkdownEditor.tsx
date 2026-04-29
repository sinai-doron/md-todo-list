import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
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

export const MarkdownEditor: React.FC<Props> = ({ value, onChange, readOnly = false, placeholder }) => {
  const lastEmitted = useRef<string>(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Drop a .md file or start typing...' }),
      Typography,
      Markdown.configure({
        html: true,
        tightLists: true,
        linkify: true,
        breaks: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      RawHtmlBlock,
      RawHtmlInline,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const storage = e.storage as unknown as { markdown: { getMarkdown: () => string } };
        const md = storage.markdown.getMarkdown();
        lastEmitted.current = md;
        onChange(md);
      }, 150);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

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
