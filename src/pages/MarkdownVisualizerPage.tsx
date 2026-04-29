import React, { useRef, useEffect, useCallback, useMemo } from 'react';
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

const DRAFT_STORAGE_KEY = 'mdv:draft';

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

const HiddenFileInput = styled.input`
  display: none;
`;

const EditorWrap = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const DropOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(98, 0, 238, 0.08);
  border: 4px dashed #6200ee;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(2px);
`;

const DropOverlayMessage = styled.div`
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(98, 0, 238, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 48px;
    color: #6200ee;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .subtitle {
    font-size: 13px;
    color: #888;
  }
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
  const draftRestoredRef = useRef(false);

  const taskCount = useMemo(() => {
    if (!content.trim()) return 0;
    const countTasks = (tasks: Task[]): number => {
      let count = 0;
      tasks.forEach(task => {
        if (!task.isHeader) count++;
        if (task.children) count += countTasks(task.children);
      });
      return count;
    };
    return countTasks(parseMarkdownToTasks(content));
  }, [content]);

  useEffect(() => {
    if (content && !previousContentRef.current && content.length > 10) {
      trackMarkdownVisualizerTextPasted();
    }
    previousContentRef.current = content;
  }, [content]);

  // Restore the previously auto-saved draft on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved && saved.trim().length > 0) {
        setContent(saved);
      }
    } catch {
      // localStorage may be unavailable (private mode, etc.) — silently skip.
    }
    draftRestoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save the current draft to localStorage. Debounced so we don't write
  // on every keystroke. Only runs after the initial restore so we don't
  // overwrite the saved value before reading it.
  useEffect(() => {
    if (!draftRestoredRef.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, content);
      } catch {
        // Quota exceeded or unavailable — silently skip; the editor still works.
      }
    }, 500);
    return () => clearTimeout(t);
  }, [content]);

  const handleBack = useCallback(() => navigate('/'), [navigate]);

  // Confirm before replacing existing content with a freshly-loaded file.
  // Skipped when the editor is empty (first drop, or after a manual clear).
  const confirmReplaceIfNeeded = useCallback((): boolean => {
    if (!content.trim()) return true;
    return window.confirm(
      'Loading this file will replace the current content. Continue?',
    );
  }, [content]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirmReplaceIfNeeded()) {
        handleFileSelect(file);
        trackMarkdownVisualizerFileUploaded();
      }
    }
    e.target.value = '';
  };

  const handleDropWithTracking = (e: React.DragEvent) => {
    const file = handleDrop(e);
    if (!file) return;
    if (!confirmReplaceIfNeeded()) return;
    handleFileSelect(file);
    trackMarkdownVisualizerFileUploaded();
  };

  // The native dragleave fires when the cursor moves into a child element,
  // not just when leaving the container. Filter those out so the fullscreen
  // overlay doesn't flicker as the cursor crosses internal element boundaries.
  const handleDragLeavePage = (e: React.DragEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    handleDragLeave(e);
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
    <PageContainer
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeavePage}
      onDrop={handleDropWithTracking}
    >
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
          <ActionButton onClick={() => fileInputRef.current?.click()} title="Upload a .md file (or just drop one anywhere)">
            <span className="material-symbols-outlined">upload_file</span>
            Upload
          </ActionButton>
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
            placeholder="Start typing markdown, or drop a .md file anywhere on the page..."
          />
        </EditorWrap>
      </Content>

      {isDragging && (
        <DropOverlay>
          <DropOverlayMessage>
            <span className="material-symbols-outlined">upload_file</span>
            <div className="title">Drop your .md file</div>
            <div className="subtitle">Max 1MB</div>
          </DropOverlayMessage>
        </DropOverlay>
      )}
    </PageContainer>
  );
};
