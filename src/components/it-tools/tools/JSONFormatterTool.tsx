import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;

  .material-symbols-outlined {
    color: #6200ee;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $primary?: boolean; $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid ${props => props.$primary ? '#6200ee' : props.$copied ? '#2e7d32' : '#ddd'};
  background: ${props => props.$primary ? '#6200ee' : props.$copied ? '#e8f5e9' : 'white'};
  color: ${props => props.$primary ? 'white' : props.$copied ? '#2e7d32' : '#666'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$primary ? '#5000d0' : '#6200ee'};
    background: ${props => props.$primary ? '#5000d0' : props.$copied ? '#e8f5e9' : '#f3e5f5'};
    color: ${props => props.$primary ? 'white' : props.$copied ? '#2e7d32' : '#6200ee'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const OptionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EditorLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Stats = styled.span`
  font-size: 11px;
  color: #999;
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  flex: 1;
  min-height: 300px;
  padding: 12px;
  border: 2px solid ${props => props.$hasError ? '#d32f2f' : '#e0e0e0'};
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#d32f2f' : '#6200ee'};
  }

  &::placeholder {
    color: #999;
  }
`;

const StatusBar = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      default: return '#1565c0';
    }
  }};

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const ErrorDetails = styled.div`
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.9;
`;

type IndentType = '2' | '4' | 'tab';

interface ParseResult {
  valid: boolean;
  formatted: string;
  error?: string;
  errorPosition?: number;
}

function parseAndFormat(input: string, indent: IndentType): ParseResult {
  if (!input.trim()) {
    return { valid: true, formatted: '' };
  }

  try {
    const parsed = JSON.parse(input);
    const indentValue = indent === 'tab' ? '\t' : parseInt(indent);
    const formatted = JSON.stringify(parsed, null, indentValue);
    return { valid: true, formatted };
  } catch (e) {
    const error = e as SyntaxError;
    let errorMessage = error.message;
    let errorPosition: number | undefined;

    // Try to extract position from error message
    const posMatch = errorMessage.match(/position\s+(\d+)/i);
    if (posMatch) {
      errorPosition = parseInt(posMatch[1]);
    }

    return {
      valid: false,
      formatted: '',
      error: errorMessage,
      errorPosition,
    };
  }
}

function minifyJSON(input: string): ParseResult {
  if (!input.trim()) {
    return { valid: true, formatted: '' };
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return { valid: true, formatted: minified };
  } catch (e) {
    const error = e as SyntaxError;
    return {
      valid: false,
      formatted: '',
      error: error.message,
    };
  }
}

export const JSONFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentType>('2');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => parseAndFormat(input, indent), [input, indent]);

  const handleFormat = useCallback(() => {
    if (result.valid && result.formatted) {
      setInput(result.formatted);
    }
  }, [result]);

  const handleMinify = useCallback(() => {
    const minResult = minifyJSON(input);
    if (minResult.valid && minResult.formatted) {
      setInput(minResult.formatted);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    const textToCopy = result.valid ? result.formatted : input;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result, input]);

  const handleClear = useCallback(() => {
    setInput('');
    setCopied(false);
  }, []);

  const handleSample = useCallback(() => {
    const sample = {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA"
      },
      hobbies: ["reading", "gaming", "coding"],
      active: true
    };
    setInput(JSON.stringify(sample, null, parseInt(indent) || 2));
  }, [indent]);

  const inputLines = input.split('\n').length;
  const inputChars = input.length;
  const outputLines = result.formatted.split('\n').length;
  const outputChars = result.formatted.length;

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">data_object</span>
          JSON Formatter
        </Title>
        <Description>
          Format, validate, and minify JSON data.
        </Description>
      </div>

      <ToolbarRow>
        <ButtonGroup>
          <ActionButton $primary onClick={handleFormat} disabled={!result.valid || !input.trim()}>
            <span className="material-symbols-outlined">format_align_left</span>
            Format
          </ActionButton>
          <ActionButton onClick={handleMinify} disabled={!result.valid || !input.trim()}>
            <span className="material-symbols-outlined">compress</span>
            Minify
          </ActionButton>
          <ActionButton $copied={copied} onClick={handleCopy} disabled={!input.trim()}>
            <span className="material-symbols-outlined">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy'}
          </ActionButton>
          <ActionButton onClick={handleClear}>
            <span className="material-symbols-outlined">delete</span>
            Clear
          </ActionButton>
          <ActionButton onClick={handleSample}>
            <span className="material-symbols-outlined">science</span>
            Sample
          </ActionButton>
        </ButtonGroup>

        <OptionsGroup>
          <Label>
            Indent:
            <Select value={indent} onChange={(e) => setIndent(e.target.value as IndentType)}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </Select>
          </Label>
        </OptionsGroup>
      </ToolbarRow>

      {input.trim() && (
        <StatusBar $type={result.valid ? 'success' : 'error'}>
          <span className="material-symbols-outlined">
            {result.valid ? 'check_circle' : 'error'}
          </span>
          <div>
            {result.valid ? 'Valid JSON' : 'Invalid JSON'}
            {result.error && (
              <ErrorDetails>{result.error}</ErrorDetails>
            )}
          </div>
        </StatusBar>
      )}

      <ContentArea>
        <EditorSection>
          <LabelRow>
            <EditorLabel>Input</EditorLabel>
            <Stats>{inputLines} lines, {inputChars} chars</Stats>
          </LabelRow>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here...\n\n{\n  "key": "value"\n}'
            $hasError={!!input.trim() && !result.valid}
          />
        </EditorSection>

        <EditorSection>
          <LabelRow>
            <EditorLabel>Formatted Output</EditorLabel>
            <Stats>{outputLines} lines, {outputChars} chars</Stats>
          </LabelRow>
          <TextArea
            value={result.formatted}
            readOnly
            placeholder="Formatted JSON will appear here..."
          />
        </EditorSection>
      </ContentArea>
    </Container>
  );
};
