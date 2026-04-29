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
  white-space: nowrap;

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
    if (url === null) return;
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
