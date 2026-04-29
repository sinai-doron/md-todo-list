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
