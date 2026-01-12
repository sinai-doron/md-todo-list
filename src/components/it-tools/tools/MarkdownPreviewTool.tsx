import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

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

const EditorLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 500px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 400px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const Preview = styled.div`
  flex: 1;
  min-height: 400px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
  background: white;
  line-height: 1.6;

  h1 {
    font-size: 2em;
    margin: 0.67em 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    margin: 0.83em 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.25em;
    margin: 1em 0;
  }

  h4, h5, h6 {
    margin: 1em 0;
  }

  p {
    margin: 1em 0;
  }

  code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background: #1a1a2e;
    color: #eee;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;

    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }

  blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #6200ee;
    background: #f8f9fa;
    color: #666;

    p {
      margin: 0;
    }
  }

  ul, ol {
    margin: 1em 0;
    padding-left: 2em;
  }

  li {
    margin: 0.5em 0;
  }

  a {
    color: #6200ee;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #f4f4f4;
    font-weight: 600;
  }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2em 0;
  }

  .task-list {
    list-style: none;
    padding-left: 0;
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    input {
      margin-top: 4px;
    }
  }
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

  &:hover {
    background: #e0e0e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

  &:hover {
    background: #eee;
  }
`;

const CheatSheetContent = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
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

  .description {
    font-size: 12px;
    color: #666;
  }
`;

// Simple markdown parser
const parseMarkdown = (md: string): string => {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr />');

  // Task lists
  html = html.replace(/^- \[x\] (.+)$/gm, '<div class="task-item"><input type="checkbox" checked disabled /> <span>$1</span></div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="task-item"><input type="checkbox" disabled /> <span>$1</span></div>');

  // Unordered lists
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (_match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim());
    if (cells.every((cell: string) => /^:?-+:?$/.test(cell))) {
      return ''; // Skip separator row
    }
    const cellsHtml = cells.map((cell: string) => `<td>${cell}</td>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');

  // Paragraphs (must be last)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  // Fix consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  return html;
};

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

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

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

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const handleReset = () => {
    setMarkdown(defaultMarkdown);
  };

  return (
    <Container>
      <div>
        <Title>Markdown Preview</Title>
        <Description>
          Write markdown and see a live preview of the rendered output
        </Description>
      </div>

      <EditorLayout>
        <EditorSection>
          <EditorHeader>
            <Label>Markdown</Label>
            <ButtonGroup>
              <Button onClick={handleCopy}>Copy MD</Button>
              <Button onClick={handleClear}>Clear</Button>
              <Button onClick={handleReset}>Reset</Button>
            </ButtonGroup>
          </EditorHeader>
          <TextArea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write your markdown here..."
          />
          <Stats>
            {stats.words} words · {stats.chars} characters · {stats.lines} lines
          </Stats>
        </EditorSection>

        <EditorSection>
          <EditorHeader>
            <Label>Preview</Label>
            <ButtonGroup>
              <Button onClick={handleCopyHTML}>Copy HTML</Button>
            </ButtonGroup>
          </EditorHeader>
          <Preview dangerouslySetInnerHTML={{ __html: html }} />
        </EditorSection>
      </EditorLayout>

      <CheatSheetSection>
        <CheatSheetHeader onClick={() => setShowCheatSheet(!showCheatSheet)}>
          <span>Markdown Cheat Sheet</span>
          <span className="material-symbols-outlined">
            {showCheatSheet ? 'expand_less' : 'expand_more'}
          </span>
        </CheatSheetHeader>
        <CheatSheetContent $expanded={showCheatSheet}>
          <CheatSheetGrid>
            <CheatSheetItem>
              <code># Heading 1{'\n'}## Heading 2</code>
              <div className="description">Headers (1-6 levels)</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>**bold** or __bold__</code>
              <div className="description">Bold text</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>*italic* or _italic_</code>
              <div className="description">Italic text</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>~~strikethrough~~</code>
              <div className="description">Strikethrough text</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>[text](url)</code>
              <div className="description">Links</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>![alt](image-url)</code>
              <div className="description">Images</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>`inline code`</code>
              <div className="description">Inline code</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>```lang{'\n'}code block{'\n'}```</code>
              <div className="description">Code blocks</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>&gt; quote</code>
              <div className="description">Blockquotes</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>- item{'\n'}* item</code>
              <div className="description">Unordered list</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>1. item{'\n'}2. item</code>
              <div className="description">Ordered list</div>
            </CheatSheetItem>
            <CheatSheetItem>
              <code>- [ ] task{'\n'}- [x] done</code>
              <div className="description">Task list</div>
            </CheatSheetItem>
          </CheatSheetGrid>
        </CheatSheetContent>
      </CheatSheetSection>
    </Container>
  );
};
