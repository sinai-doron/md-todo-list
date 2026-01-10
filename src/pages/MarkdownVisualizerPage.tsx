import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useMarkdownFile } from '../hooks/useMarkdownFile';
import { useEngagementTracking } from '../hooks/useAnalytics';
import { MarkdownPreview } from '../components/MarkdownPreview';
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

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #6200ee;
  }
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

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
  min-height: 0;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const CloseErrorButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: #d32f2f;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-left: auto;
  transition: all 0.2s;

  &:hover {
    background: rgba(211, 47, 47, 0.1);
  }
`;

const DualPaneContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const PaneHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const PaneTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PaneContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const InputPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
  gap: 16px;
`;

const DropZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#6200ee' : '#ddd'};
  border-radius: 6px;
  padding: 12px 16px;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(98, 0, 238, 0.05)' : '#fafafa'};
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border-color: #6200ee;
    background: rgba(98, 0, 238, 0.02);
  }
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

const TextArea = styled.textarea`
  flex: 1;
  min-height: 0;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const PreviewPane = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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

  // Parse tasks for preview count
  const previewTasks = content.trim() ? parseMarkdownToTasks(content) : [];

  // Count tasks (excluding headers)
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

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

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
    if (file) {
      trackMarkdownVisualizerFileUploaded();
    }
  };

  // Handle Escape key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  return (
    <PageContainer>
      <SEO
        title="MD Files Preview - Markdown Visualizer"
        description="Preview and visualize markdown files instantly. Upload or paste MD files to see formatted preview with syntax highlighting, tables, and task detection."
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

        <DualPaneContainer>
          {/* Left Pane: Input */}
          <Pane>
            <PaneHeader>
              <PaneTitle>Input</PaneTitle>
            </PaneHeader>
            <PaneContent>
              <InputPane>
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
                    <DropZoneSubtext>Max 1MB</DropZoneSubtext>
                  </DropZoneTextContainer>
                </DropZone>

                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  onChange={handleFileInputChange}
                />

                <TextArea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Or paste your markdown here...

# Example Heading

- Task item 1
- Task item 2
  - Subtask 2.1
  - Subtask 2.2

## Another Section

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

**Bold text** and *italic text*

## HTML Support

<details>
<summary>Click to expand</summary>

Hidden content here!

</details>

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

This is <mark>highlighted</mark> text."
                />
              </InputPane>
            </PaneContent>
          </Pane>

          {/* Right Pane: Preview */}
          <Pane>
            <PaneHeader>
              <PaneTitle>Preview</PaneTitle>
            </PaneHeader>
            <PaneContent>
              <PreviewPane>
                <MarkdownPreview content={content} />
              </PreviewPane>
            </PaneContent>
          </Pane>
        </DualPaneContainer>
      </Content>
    </PageContainer>
  );
};
