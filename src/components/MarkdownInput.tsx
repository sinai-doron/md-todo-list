import React, { useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $isMinimized: boolean; $isDragging: boolean }>`
  background: ${props => props.$isDragging ? '#e3f2fd' : '#f8f9fa'};
  border-radius: 8px;
  padding: ${props => props.$isMinimized ? '12px' : '24px'};
  margin-bottom: 24px;
  border: ${props => props.$isDragging ? '2px dashed #4a90e2' : '1px solid #e0e0e0'};
  transition: all 0.3s ease;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ImportButton = styled.button`
  background: #4a90e2;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 12px;
  color: white;
  border-radius: 4px;
  transition: background 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #357abd;
  }
`;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const HelpText = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #666;
  font-style: italic;
`;

const DropOverlay = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8px;
  pointer-events: none;
  z-index: 10;
`;

const DropMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #4a90e2;
  font-weight: 500;
  
  .material-symbols-outlined {
    font-size: 48px;
  }
`;

interface MarkdownInputProps {
  value: string;
  onChange: (markdown: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  hasContent: boolean;
  onImport: (file: File) => void;
}

export const MarkdownInput: React.FC<MarkdownInputProps> = ({
  value,
  onChange,
  isMinimized,
  onToggleMinimize,
  hasContent,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <Container 
      $isMinimized={isMinimized}
      $isDragging={isDragging}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropOverlay $show={isDragging}>
        <DropMessage>
          <span className="material-symbols-outlined">file_upload</span>
          <span>Drop markdown file here</span>
        </DropMessage>
      </DropOverlay>
      <Header>
        <Title>Markdown Input</Title>
        <ButtonGroup>
          <ImportButton onClick={handleImportClick}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_open</span>
            <span style={{ marginLeft: '4px' }}>Import</span>
          </ImportButton>
          {hasContent && (
            <MinimizeButton onClick={onToggleMinimize}>
              {isMinimized ? '▼' : '▲'}
            </MinimizeButton>
          )}
        </ButtonGroup>
      </Header>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        onChange={handleFileChange}
      />
      {!isMinimized && (
        <>
          <TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your markdown here... (auto-syncs with todo list below)"
          />
          <HelpText>
            Changes sync automatically between markdown and todo list
          </HelpText>
        </>
      )}
    </Container>
  );
};

