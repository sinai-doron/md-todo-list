import React from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $isMinimized: boolean }>`
  background: #f8f9fa;
  border-radius: 8px;
  padding: ${props => props.$isMinimized ? '12px' : '24px'};
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
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

interface MarkdownInputProps {
  value: string;
  onChange: (markdown: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  hasContent: boolean;
}

export const MarkdownInput: React.FC<MarkdownInputProps> = ({
  value,
  onChange,
  isMinimized,
  onToggleMinimize,
  hasContent,
}) => {
  return (
    <Container $isMinimized={isMinimized}>
      <Header>
        <Title>Markdown Input</Title>
        {hasContent && (
          <MinimizeButton onClick={onToggleMinimize}>
            {isMinimized ? '▼' : '▲'}
          </MinimizeButton>
        )}
      </Header>
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

