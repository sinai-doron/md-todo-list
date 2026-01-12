import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const Description = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const ConverterLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const TextArea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 400px;
  padding: 12px;
  border: 1px solid ${props => props.$error ? '#f44336' : '#ddd'};
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
  background: ${props => props.$error ? '#fff8f8' : 'white'};

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#f44336' : '#6200ee'};
  }
`;

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 28px;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    padding-top: 0;
  }
`;

const ConvertButton = styled.button<{ $direction: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 16px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5000d0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    .material-symbols-outlined {
      transform: rotate(90deg);
    }
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ErrorMessage = styled.div`
  color: #c62828;
  font-size: 12px;
  padding: 8px 12px;
  background: #ffebee;
  border-radius: 4px;
  font-family: monospace;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
`;

const StatusText = styled.span<{ $valid?: boolean }>`
  color: ${props => props.$valid === undefined ? '#666' : props.$valid ? '#2e7d32' : '#c62828'};
  display: flex;
  align-items: center;
  gap: 4px;

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

// Simple YAML parser (handles basic cases)
const parseYAML = (yaml: string): unknown => {
  const lines = yaml.split('\n');
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown>; key?: string }[] = [{ indent: -1, obj: result }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Calculate indentation
    const indent = line.search(/\S/);

    // Check for key-value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      // Handle array items
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim();
        const parent = stack[stack.length - 1];
        if (parent.key) {
          const arr = parent.obj[parent.key];
          if (Array.isArray(arr)) {
            arr.push(parseValue(value));
          }
        }
        continue;
      }
      continue;
    }

    const key = trimmed.substring(0, colonIndex).trim();
    const valueStr = trimmed.substring(colonIndex + 1).trim();

    // Pop stack to find correct parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (valueStr === '' || valueStr === '|' || valueStr === '>') {
      // Nested object or multiline string
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextIndent = nextLine.search(/\S/);
        const nextTrimmed = nextLine.trim();

        if (nextTrimmed.startsWith('- ')) {
          // It's an array
          parent.obj[key] = [];
          stack.push({ indent, obj: parent.obj, key });
        } else if (nextIndent > indent) {
          // It's a nested object
          parent.obj[key] = {};
          stack.push({ indent, obj: parent.obj[key] as Record<string, unknown> });
        }
      }
    } else {
      // Simple value
      parent.obj[key] = parseValue(valueStr);
    }
  }

  return result;
};

const parseValue = (value: string): unknown => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (value === '') return '';

  // Check for quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Check for numbers
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;

  // Check for arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

// Convert JSON to YAML
const jsonToYAML = (obj: unknown, indent: number = 0): string => {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (obj === undefined) return '';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const yaml = jsonToYAML(item, indent + 1);
        const firstLine = yaml.split('\n')[0];
        const rest = yaml.split('\n').slice(1).join('\n');
        return `${spaces}- ${firstLine}${rest ? '\n' + rest : ''}`;
      }
      return `${spaces}- ${jsonToYAML(item, indent)}`;
    }).join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const yaml = jsonToYAML(value, indent + 1);
        if (Array.isArray(value) && value.length > 0) {
          return `${spaces}${key}:\n${yaml}`;
        }
        if (typeof value === 'object' && Object.keys(value).length > 0) {
          return `${spaces}${key}:\n${yaml}`;
        }
        return `${spaces}${key}: ${yaml}`;
      }
      return `${spaces}${key}: ${jsonToYAML(value, indent)}`;
    }).join('\n');
  }

  return String(obj);
};

export const YAMLJSONTool: React.FC = () => {
  const [yaml, setYaml] = useState(`# Example YAML
name: John Doe
age: 30
active: true
tags:
  - developer
  - designer
address:
  city: New York
  country: USA`);
  const [json, setJson] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleYAMLtoJSON = () => {
    try {
      setYamlError(null);
      const parsed = parseYAML(yaml);
      setJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err) {
      setYamlError(err instanceof Error ? err.message : 'Invalid YAML');
    }
  };

  const handleJSONtoYAML = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(json);
      setYaml(jsonToYAML(parsed));
      setYamlError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const validateYAML = (): boolean => {
    try {
      parseYAML(yaml);
      return true;
    } catch {
      return false;
    }
  };

  const validateJSON = (): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = (side: 'yaml' | 'json') => {
    if (side === 'yaml') {
      setYaml('');
      setYamlError(null);
    } else {
      setJson('');
      setJsonError(null);
    }
  };

  return (
    <Container>
      <div>
        <Title>YAML ↔ JSON Converter</Title>
        <Description>
          Convert between YAML and JSON formats
        </Description>
      </div>

      <ConverterLayout>
        <EditorSection>
          <EditorHeader>
            <Label>YAML</Label>
            <ButtonGroup>
              <ActionButton onClick={() => handleCopy(yaml)} disabled={!yaml}>
                Copy
              </ActionButton>
              <ActionButton onClick={() => handleClear('yaml')} disabled={!yaml}>
                Clear
              </ActionButton>
            </ButtonGroup>
          </EditorHeader>
          <TextArea
            value={yaml}
            onChange={(e) => {
              setYaml(e.target.value);
              setYamlError(null);
            }}
            $error={!!yamlError}
            placeholder="Enter YAML here..."
          />
          {yamlError && <ErrorMessage>{yamlError}</ErrorMessage>}
          <StatusBar>
            <StatusText $valid={yaml ? validateYAML() : undefined}>
              {yaml && (
                <>
                  <span className="material-symbols-outlined">
                    {validateYAML() ? 'check_circle' : 'error'}
                  </span>
                  {validateYAML() ? 'Valid YAML' : 'Invalid YAML'}
                </>
              )}
            </StatusText>
            <span>{yaml.length} chars</span>
          </StatusBar>
        </EditorSection>

        <ControlsColumn>
          <ConvertButton $direction="right" onClick={handleYAMLtoJSON} disabled={!yaml}>
            <span className="material-symbols-outlined">arrow_forward</span>
          </ConvertButton>
          <ConvertButton $direction="left" onClick={handleJSONtoYAML} disabled={!json}>
            <span className="material-symbols-outlined">arrow_back</span>
          </ConvertButton>
        </ControlsColumn>

        <EditorSection>
          <EditorHeader>
            <Label>JSON</Label>
            <ButtonGroup>
              <ActionButton onClick={() => handleCopy(json)} disabled={!json}>
                Copy
              </ActionButton>
              <ActionButton onClick={() => handleClear('json')} disabled={!json}>
                Clear
              </ActionButton>
            </ButtonGroup>
          </EditorHeader>
          <TextArea
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              setJsonError(null);
            }}
            $error={!!jsonError}
            placeholder="JSON will appear here..."
          />
          {jsonError && <ErrorMessage>{jsonError}</ErrorMessage>}
          <StatusBar>
            <StatusText $valid={json ? validateJSON() : undefined}>
              {json && (
                <>
                  <span className="material-symbols-outlined">
                    {validateJSON() ? 'check_circle' : 'error'}
                  </span>
                  {validateJSON() ? 'Valid JSON' : 'Invalid JSON'}
                </>
              )}
            </StatusText>
            <span>{json.length} chars</span>
          </StatusBar>
        </EditorSection>
      </ConverterLayout>
    </Container>
  );
};
