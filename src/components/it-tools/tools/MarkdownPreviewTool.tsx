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
