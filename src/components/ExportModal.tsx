import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import type { Task, TaskTag } from '../types/Task';
import type { ExportFormat } from '../types/Export';
import { exportListToJSONString, getExportSummary } from '../utils/exportJSON';
import { exportListToCSV } from '../utils/exportCSV';
import { exportListToEnhancedMarkdown } from '../utils/exportEnhancedMarkdown';

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
  max-width: 600px;
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
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #6200ee;
  }
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

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const FormatOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const FormatOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? 'rgba(98, 0, 238, 0.04)' : 'white'};

  &:hover {
    border-color: ${props => props.$selected ? '#6200ee' : '#ccc'};
    background: ${props => props.$selected ? 'rgba(98, 0, 238, 0.04)' : '#fafafa'};
  }

  input {
    margin-top: 2px;
  }
`;

const FormatInfo = styled.div`
  flex: 1;
`;

const FormatName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const FormatDescription = styled.div`
  font-size: 13px;
  color: #666;
`;

const PreviewSection = styled.div`
  margin-bottom: 24px;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const PreviewBox = styled.pre`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  max-height: 200px;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
`;

const SummarySection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const SummaryStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;

  .material-symbols-outlined {
    font-size: 18px;
    color: #6200ee;
  }

  strong {
    color: #333;
  }
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
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 18px;
  }

  &:hover {
    background: ${props => props.$primary ? '#7c3aed' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CopySuccess = styled.span`
  color: #16a34a;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  tasks: Task[];
  allTags: TaskTag[];
  createdAt?: number;
  updatedAt?: number;
}

const FORMAT_OPTIONS: { value: ExportFormat; name: string; description: string }[] = [
  {
    value: 'json',
    name: 'JSON',
    description: 'Full backup with all metadata (tags, priority, due dates, notes, recurrence)',
  },
  {
    value: 'csv',
    name: 'CSV',
    description: 'Spreadsheet-compatible format for Excel, Google Sheets, etc.',
  },
  {
    value: 'markdown',
    name: 'Markdown',
    description: 'Human-readable format with inline metadata syntax',
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  listName,
  tasks,
  allTags,
  createdAt,
  updatedAt,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => getExportSummary(tasks, allTags), [tasks, allTags]);

  const exportContent = useMemo(() => {
    switch (selectedFormat) {
      case 'json':
        return exportListToJSONString(listName, tasks, allTags, createdAt, updatedAt);
      case 'csv':
        return exportListToCSV(tasks, allTags);
      case 'markdown':
        return exportListToEnhancedMarkdown(listName, tasks, allTags);
      default:
        return '';
    }
  }, [selectedFormat, listName, tasks, allTags, createdAt, updatedAt]);

  const getFileExtension = () => {
    switch (selectedFormat) {
      case 'json': return 'json';
      case 'csv': return 'csv';
      case 'markdown': return 'md';
      default: return 'txt';
    }
  };

  const getMimeType = () => {
    switch (selectedFormat) {
      case 'json': return 'application/json';
      case 'csv': return 'text/csv';
      case 'markdown': return 'text/markdown';
      default: return 'text/plain';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: getMimeType() });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeListName = listName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.href = url;
    link.download = `${safeListName}.${getFileExtension()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Truncate preview for display
  const previewContent = exportContent.length > 2000
    ? exportContent.substring(0, 2000) + '\n\n... (truncated)'
    : exportContent;

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>
            <span className="material-symbols-outlined">download</span>
            Export List
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          <SectionLabel>Export Format</SectionLabel>
          <FormatOptions>
            {FORMAT_OPTIONS.map(option => (
              <FormatOption key={option.value} $selected={selectedFormat === option.value}>
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={selectedFormat === option.value}
                  onChange={() => setSelectedFormat(option.value)}
                />
                <FormatInfo>
                  <FormatName>{option.name}</FormatName>
                  <FormatDescription>{option.description}</FormatDescription>
                </FormatInfo>
              </FormatOption>
            ))}
          </FormatOptions>

          <PreviewSection>
            <PreviewHeader>
              <SectionLabel style={{ margin: 0 }}>Preview</SectionLabel>
              {copied ? (
                <CopySuccess>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                  Copied!
                </CopySuccess>
              ) : (
                <CopyButton onClick={handleCopy}>
                  <span className="material-symbols-outlined">content_copy</span>
                  Copy
                </CopyButton>
              )}
            </PreviewHeader>
            <PreviewBox>{previewContent}</PreviewBox>
          </PreviewSection>

          <SummarySection>
            <SummaryStat>
              <span className="material-symbols-outlined">checklist</span>
              <strong>{summary.taskCount}</strong> {summary.taskCount === 1 ? 'task' : 'tasks'}
            </SummaryStat>
            <SummaryStat>
              <span className="material-symbols-outlined">sell</span>
              <strong>{summary.tagCount}</strong> {summary.tagCount === 1 ? 'tag' : 'tags'}
            </SummaryStat>
          </SummarySection>
        </Content>

        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button $primary onClick={handleDownload}>
            <span className="material-symbols-outlined">download</span>
            Download
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};
