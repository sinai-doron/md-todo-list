import React, { useState, useEffect } from 'react';
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

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  input {
    accent-color: #6200ee;
  }

  span {
    font-size: 14px;
    color: #333;
  }
`;

const SelectOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;

  label {
    font-size: 12px;
    color: #666;
  }

  select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #6200ee;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#6200ee' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};

  &:hover {
    background: ${props => props.$primary ? '#5000d0' : '#e0e0e0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultText = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  color: #6200ee;
  word-break: break-all;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const CharCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const PreviewUrl = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #2e7d32;
  word-break: break-all;
`;

type SeparatorType = '-' | '_' | '.';

export const SlugGeneratorTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [slug, setSlug] = useState('');
  const [separator, setSeparator] = useState<SeparatorType>('-');
  const [lowercase, setLowercase] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [maxLength, setMaxLength] = useState<number>(0);
  const [baseUrl, setBaseUrl] = useState('https://example.com/');

  const generateSlug = (text: string): string => {
    let result = text
      // Normalize unicode characters
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace spaces and special chars with separator
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, separator);

    if (lowercase) {
      result = result.toLowerCase();
    }

    if (removeNumbers) {
      result = result.replace(/[0-9]/g, '').replace(new RegExp(`${separator}+`, 'g'), separator);
    }

    // Remove leading/trailing separators
    result = result.replace(new RegExp(`^${separator === '.' ? '\\.' : separator}+|${separator === '.' ? '\\.' : separator}+$`, 'g'), '');

    if (maxLength > 0 && result.length > maxLength) {
      result = result.substring(0, maxLength);
      // Don't end with separator
      result = result.replace(new RegExp(`${separator === '.' ? '\\.' : separator}+$`), '');
    }

    return result;
  };

  useEffect(() => {
    if (input) {
      setSlug(generateSlug(input));
    } else {
      setSlug('');
    }
  }, [input, separator, lowercase, removeNumbers, maxLength]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(slug);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl + slug);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setSlug('');
  };

  return (
    <Container>
      <div>
        <Title>Slug Generator</Title>
        <Description>
          Convert text into URL-friendly slugs for blog posts, pages, and SEO-friendly URLs
        </Description>
      </div>

      <Section>
        <Label>Text to Convert</Label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your title or text here...&#10;Example: How to Build a REST API with Node.js in 2024!"
        />
      </Section>

      <Section>
        <Label>Options</Label>
        <OptionsGrid>
          <Option>
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
            />
            <span>Convert to lowercase</span>
          </Option>
          <Option>
            <input
              type="checkbox"
              checked={removeNumbers}
              onChange={(e) => setRemoveNumbers(e.target.checked)}
            />
            <span>Remove numbers</span>
          </Option>
          <SelectOption>
            <label>Separator</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as SeparatorType)}
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </SelectOption>
          <SelectOption>
            <label>Max Length (0 = unlimited)</label>
            <select
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
            >
              <option value="0">Unlimited</option>
              <option value="50">50 characters</option>
              <option value="75">75 characters</option>
              <option value="100">100 characters</option>
              <option value="150">150 characters</option>
            </select>
          </SelectOption>
        </OptionsGrid>
      </Section>

      {slug && (
        <ResultBox>
          <ResultLabel>Generated Slug</ResultLabel>
          <ResultText>{slug}</ResultText>
          <CharCount>{slug.length} characters</CharCount>

          <ButtonGroup style={{ marginTop: '12px' }}>
            <Button $primary onClick={handleCopy}>Copy Slug</Button>
            <Button onClick={handleClear}>Clear</Button>
          </ButtonGroup>

          <Section style={{ marginTop: '16px' }}>
            <Label>URL Preview</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/"
            />
            <PreviewUrl>{baseUrl}{slug}</PreviewUrl>
            <Button onClick={handleCopyUrl}>Copy Full URL</Button>
          </Section>
        </ResultBox>
      )}
    </Container>
  );
};
