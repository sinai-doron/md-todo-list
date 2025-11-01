import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #6200ee;
    box-shadow: 0 4px 12px rgba(98, 0, 238, 0.15);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InputIcon = styled.div`
  color: #6200ee;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-family: inherit;
  color: #333;
  background: transparent;
  padding: 4px 0;

  &::placeholder {
    color: #999;
  }
`;

const HelpText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${Container}:focus-within & {
    opacity: 1;
  }
`;

const KeyboardShortcut = styled.kbd`
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: #666;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
`;

interface QuickTaskInputProps {
  onAddTask: (text: string) => void;
  autoFocus?: boolean;
}

export const QuickTaskInput: React.FC<QuickTaskInputProps> = ({
  onAddTask,
  autoFocus = false,
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const parseTaskText = (input: string): string => {
    // Trim whitespace
    let text = input.trim();

    // Remove common markdown task prefixes: "- [ ]", "- [x]", "-", "*"
    text = text.replace(/^[-*]\s*\[([ x])\]\s*/i, '');
    text = text.replace(/^[-*]\s+/, '');

    return text;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      
      const taskText = parseTaskText(value);
      
      if (taskText) {
        onAddTask(taskText);
        setValue('');
      }
    }
  };

  return (
    <Container>
      <InputWrapper>
        <InputIcon>
          <span className="material-symbols-outlined">add_circle</span>
        </InputIcon>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a task and press Enter..."
          autoFocus={autoFocus}
        />
      </InputWrapper>
      <HelpText>
        <span>💡 Tip: Just type and press</span>
        <KeyboardShortcut>Enter</KeyboardShortcut>
        <span>to add a task quickly</span>
      </HelpText>
    </Container>
  );
};

