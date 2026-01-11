import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const Card = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
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

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ResultCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const ResultTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #666;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${props => props.$copied ? '#2e7d32' : '#ddd'};
  background: ${props => props.$copied ? '#e8f5e9' : 'white'};
  color: ${props => props.$copied ? '#2e7d32' : '#666'};
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$copied ? '#2e7d32' : '#6200ee'};
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const ResultValue = styled.div`
  padding: 12px 14px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  word-break: break-all;
  min-height: 40px;
`;

const SampleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
    background: #f3e5f5;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

type CaseType =
  | 'lowercase'
  | 'uppercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'pascalcase'
  | 'snakecase'
  | 'kebabcase'
  | 'constantcase'
  | 'dotcase';

interface CaseResult {
  type: CaseType;
  label: string;
  value: string;
}

// Helper to split text into words
function splitIntoWords(text: string): string[] {
  // Handle camelCase and PascalCase
  let processed = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Handle snake_case, kebab-case, dot.case
  processed = processed.replace(/[_\-\.]/g, ' ');
  // Split by spaces and filter empty
  return processed.split(/\s+/).filter(w => w.length > 0);
}

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function toUpperCase(text: string): string {
  return text.toUpperCase();
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
}

function toCamelCase(text: string): string {
  const words = splitIntoWords(text);
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      return i === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function toPascalCase(text: string): string {
  const words = splitIntoWords(text);
  return words
    .map(word => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function toSnakeCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map(w => w.toLowerCase()).join('_');
}

function toKebabCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map(w => w.toLowerCase()).join('-');
}

function toConstantCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map(w => w.toUpperCase()).join('_');
}

function toDotCase(text: string): string {
  const words = splitIntoWords(text);
  return words.map(w => w.toLowerCase()).join('.');
}

const converters: { type: CaseType; label: string; convert: (s: string) => string }[] = [
  { type: 'lowercase', label: 'lowercase', convert: toLowerCase },
  { type: 'uppercase', label: 'UPPERCASE', convert: toUpperCase },
  { type: 'titlecase', label: 'Title Case', convert: toTitleCase },
  { type: 'sentencecase', label: 'Sentence case', convert: toSentenceCase },
  { type: 'camelcase', label: 'camelCase', convert: toCamelCase },
  { type: 'pascalcase', label: 'PascalCase', convert: toPascalCase },
  { type: 'snakecase', label: 'snake_case', convert: toSnakeCase },
  { type: 'kebabcase', label: 'kebab-case', convert: toKebabCase },
  { type: 'constantcase', label: 'CONSTANT_CASE', convert: toConstantCase },
  { type: 'dotcase', label: 'dot.case', convert: toDotCase },
];

export const CaseConverterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const results: CaseResult[] = useMemo(() => {
    if (!input.trim()) return [];

    return converters.map(({ type, label, convert }) => ({
      type,
      label,
      value: convert(input),
    }));
  }, [input]);

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  const handleSample = useCallback(() => {
    setInput('hello world example text');
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">swap_horiz</span>
          Case Converter
        </Title>
        <Description>
          Convert text between different cases: camelCase, snake_case, PascalCase, and more.
        </Description>
      </div>

      <Card>
        <Label>Input Text</Label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert..."
        />
        <SampleButton onClick={handleSample}>
          <span className="material-symbols-outlined">science</span>
          Load Sample
        </SampleButton>
      </Card>

      {results.length > 0 && (
        <ResultsGrid>
          {results.map((result) => (
            <ResultCard key={result.type}>
              <ResultHeader>
                <ResultTitle>{result.label}</ResultTitle>
                <CopyButton
                  $copied={copiedField === result.type}
                  onClick={() => handleCopy(result.value, result.type)}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === result.type ? 'check' : 'content_copy'}
                  </span>
                  {copiedField === result.type ? 'Copied' : 'Copy'}
                </CopyButton>
              </ResultHeader>
              <ResultValue>{result.value}</ResultValue>
            </ResultCard>
          ))}
        </ResultsGrid>
      )}
    </Container>
  );
};
