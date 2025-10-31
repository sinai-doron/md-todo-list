import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { parseMarkdownToTasks } from '../utils/markdownParser';
import type { Task } from '../types/Task';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const DropZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#6200ee' : '#ddd'};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(98, 0, 238, 0.05)' : '#fafafa'};
  transition: all 0.2s;
  margin-bottom: 24px;
  cursor: pointer;

  &:hover {
    border-color: #6200ee;
    background: rgba(98, 0, 238, 0.02);
  }
`;

const DropZoneIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  color: #6200ee;
`;

const DropZoneText = styled.p`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const DropZoneSubtext = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const FileButton = styled.button`
  background: #6200ee;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s;

  &:hover {
    background: #7c3aed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: #999;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e0e0e0;
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`;

const TextAreaLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const PreviewSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewCount = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #6200ee;
  background: rgba(98, 0, 238, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
`;

const PreviewList = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const PreviewItem = styled.div<{ $level: number; $isHeader?: boolean }>`
  margin-left: ${props => props.$level * 20}px;
  padding: 4px 0;
  font-size: 13px;
  color: ${props => props.$isHeader ? '#333' : '#666'};
  font-weight: ${props => props.$isHeader ? '600' : '400'};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '${props => props.$isHeader ? '📑' : '✓'}';
    opacity: 0.6;
  }
`;

const EmptyPreview = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
  font-style: italic;
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: ${props => props.$primary ? 'none' : '1px solid #ddd'};
  background: ${props => props.$primary ? '#6200ee' : 'white'};
  color: ${props => props.$primary ? 'white' : '#333'};

  &:hover {
    background: ${props => props.$primary ? '#7c3aed' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
`;

interface AddTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (markdown: string) => void;
  targetName?: string; // Name of the section/task we're adding under (for display)
}

export const AddTasksModal: React.FC<AddTasksModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  targetName,
}) => {
  const [markdownText, setMarkdownText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewTasks = markdownText.trim() ? parseMarkdownToTasks(markdownText) : [];

  const countTasks = (tasks: Task[]): number => {
    let count = 0;
    tasks.forEach(task => {
      if (!task.isHeader) count++;
      if (task.children) count += countTasks(task.children);
    });
    return count;
  };

  const renderPreviewTasks = (tasks: Task[]): React.ReactNode => {
    return tasks.map(task => (
      <React.Fragment key={task.id}>
        <PreviewItem $level={task.level} $isHeader={task.isHeader}>
          {task.text}
        </PreviewItem>
        {task.children && renderPreviewTasks(task.children)}
      </React.Fragment>
    ));
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.md') && !fileName.endsWith('.txt')) {
      setError('Invalid file type. Please select a .md or .txt file.');
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1048576; // 1MB in bytes
    if (file.size > maxSize) {
      setError('File is too large. Maximum file size is 1MB.');
      return;
    }

    // Read file content
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content !== undefined) {
        setMarkdownText(content);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAdd = () => {
    if (markdownText.trim()) {
      onAdd(markdownText);
      setMarkdownText('');
      setError(null);
      onClose();
    }
  };

  const handleClose = () => {
    setMarkdownText('');
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const taskCount = countTasks(previewTasks);

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>
            Add Tasks from Markdown {targetName && `to "${targetName}"`}
          </Title>
          <CloseButton onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>
        <Content>
          {error && (
            <ErrorMessage>
              <span>⚠️</span>
              {error}
            </ErrorMessage>
          )}
          
          <DropZone
            $isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <DropZoneIcon>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                file_upload
              </span>
            </DropZoneIcon>
            <DropZoneText>Drop a markdown file here</DropZoneText>
            <DropZoneSubtext>or click to browse (.md or .txt files)</DropZoneSubtext>
            <FileButton onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}>
              Choose File
            </FileButton>
          </DropZone>

          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            onChange={handleFileInputChange}
          />

          <Divider>OR</Divider>

          <div>
            <TextAreaLabel htmlFor="markdown-paste">
              Paste Markdown
            </TextAreaLabel>
            <TextArea
              id="markdown-paste"
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              placeholder="Paste your markdown here...

Example:
### Section Name
- [ ] Task 1
- [x] Task 2
  - [ ] Subtask"
            />
          </div>

          {markdownText.trim() && (
            <PreviewSection>
              <PreviewTitle>
                Preview
                <PreviewCount>
                  {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                </PreviewCount>
              </PreviewTitle>
              <PreviewList>
                {previewTasks.length > 0 ? (
                  renderPreviewTasks(previewTasks)
                ) : (
                  <EmptyPreview>
                    No valid tasks found. Make sure your markdown includes task items (e.g., "- [ ] Task")
                  </EmptyPreview>
                )}
              </PreviewList>
            </PreviewSection>
          )}
        </Content>
        <Footer>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            $primary 
            onClick={handleAdd}
            disabled={!markdownText.trim() || previewTasks.length === 0}
          >
            Add {taskCount > 0 && `${taskCount} ${taskCount === 1 ? 'Task' : 'Tasks'}`}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

