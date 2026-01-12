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
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
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

const ResultText = styled.pre`
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #333;
  max-height: 200px;
  overflow-y: auto;
`;

const ModeToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  font-weight: ${props => props.$active ? '500' : '400'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #6200ee;
  }
`;

const ReferenceTable = styled.div`
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ReferenceHeader = styled.div`
  background: #f5f5f5;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #eee;
  }
`;

const ReferenceContent = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const EntityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const EntityItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;

  span:first-child {
    color: #6200ee;
  }

  span:last-child {
    color: #666;
  }
`;

// Common HTML entities
const commonEntities: { char: string; entity: string; name: string }[] = [
  { char: '&', entity: '&amp;', name: 'Ampersand' },
  { char: '<', entity: '&lt;', name: 'Less than' },
  { char: '>', entity: '&gt;', name: 'Greater than' },
  { char: '"', entity: '&quot;', name: 'Double quote' },
  { char: "'", entity: '&#39;', name: 'Single quote' },
  { char: ' ', entity: '&nbsp;', name: 'Non-breaking space' },
  { char: '©', entity: '&copy;', name: 'Copyright' },
  { char: '®', entity: '&reg;', name: 'Registered' },
  { char: '™', entity: '&trade;', name: 'Trademark' },
  { char: '€', entity: '&euro;', name: 'Euro' },
  { char: '£', entity: '&pound;', name: 'Pound' },
  { char: '¥', entity: '&yen;', name: 'Yen' },
  { char: '¢', entity: '&cent;', name: 'Cent' },
  { char: '§', entity: '&sect;', name: 'Section' },
  { char: '°', entity: '&deg;', name: 'Degree' },
  { char: '±', entity: '&plusmn;', name: 'Plus/minus' },
  { char: '×', entity: '&times;', name: 'Multiply' },
  { char: '÷', entity: '&divide;', name: 'Divide' },
  { char: '•', entity: '&bull;', name: 'Bullet' },
  { char: '…', entity: '&hellip;', name: 'Ellipsis' },
  { char: '–', entity: '&ndash;', name: 'En dash' },
  { char: '—', entity: '&mdash;', name: 'Em dash' },
  { char: '←', entity: '&larr;', name: 'Left arrow' },
  { char: '→', entity: '&rarr;', name: 'Right arrow' },
  { char: '↑', entity: '&uarr;', name: 'Up arrow' },
  { char: '↓', entity: '&darr;', name: 'Down arrow' },
];

export const HTMLEntityTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeMode, setEncodeMode] = useState<'named' | 'numeric'>('named');
  const [showReference, setShowReference] = useState(false);

  const encodeHTML = (text: string, useNumeric: boolean): string => {
    if (useNumeric) {
      // Encode all non-ASCII and special chars as numeric entities
      return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127 || char === '&' || char === '<' || char === '>' || char === '"' || char === "'") {
          return `&#${code};`;
        }
        return char;
      }).join('');
    } else {
      // Use named entities where possible
      const entityMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '©': '&copy;',
        '®': '&reg;',
        '™': '&trade;',
        '€': '&euro;',
        '£': '&pound;',
        '¥': '&yen;',
        '¢': '&cent;',
        '§': '&sect;',
        '°': '&deg;',
        '±': '&plusmn;',
        '×': '&times;',
        '÷': '&divide;',
        '•': '&bull;',
        '…': '&hellip;',
        '–': '&ndash;',
        '—': '&mdash;',
        '←': '&larr;',
        '→': '&rarr;',
        '↑': '&uarr;',
        '↓': '&darr;',
      };

      return text.split('').map(char => {
        if (entityMap[char]) {
          return entityMap[char];
        }
        const code = char.charCodeAt(0);
        if (code > 127) {
          return `&#${code};`;
        }
        return char;
      }).join('');
    }
  };

  const decodeHTML = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const handleConvert = () => {
    if (mode === 'encode') {
      setOutput(encodeHTML(input, encodeMode === 'numeric'));
    } else {
      setOutput(decodeHTML(input));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <Container>
      <div>
        <Title>HTML Entity Encoder/Decoder</Title>
        <Description>
          Encode special characters to HTML entities or decode HTML entities back to characters
        </Description>
      </div>

      <ModeToggle>
        <ModeButton $active={mode === 'encode'} onClick={() => setMode('encode')}>
          Encode
        </ModeButton>
        <ModeButton $active={mode === 'decode'} onClick={() => setMode('decode')}>
          Decode
        </ModeButton>
      </ModeToggle>

      {mode === 'encode' && (
        <ModeToggle>
          <ModeButton $active={encodeMode === 'named'} onClick={() => setEncodeMode('named')}>
            Named Entities
          </ModeButton>
          <ModeButton $active={encodeMode === 'numeric'} onClick={() => setEncodeMode('numeric')}>
            Numeric Entities
          </ModeButton>
        </ModeToggle>
      )}

      <Section>
        <Label>{mode === 'encode' ? 'Text to Encode' : 'HTML Entities to Decode'}</Label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode'
            ? 'Enter text with special characters...\nExample: <div class="test">Hello & Goodbye</div>'
            : 'Enter HTML entities...\nExample: &lt;div class=&quot;test&quot;&gt;Hello &amp; Goodbye&lt;/div&gt;'
          }
        />
      </Section>

      <ButtonGroup>
        <Button $primary onClick={handleConvert} disabled={!input}>
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </Button>
        <Button onClick={handleSwap} disabled={!output}>
          Swap
        </Button>
        <Button onClick={handleClear} disabled={!input && !output}>
          Clear
        </Button>
      </ButtonGroup>

      {output && (
        <ResultBox>
          <ResultLabel>Result</ResultLabel>
          <ResultText>{output}</ResultText>
          <ButtonGroup style={{ marginTop: '12px' }}>
            <Button onClick={handleCopy}>Copy to Clipboard</Button>
          </ButtonGroup>
        </ResultBox>
      )}

      <ReferenceTable>
        <ReferenceHeader onClick={() => setShowReference(!showReference)}>
          <span>Common HTML Entities Reference</span>
          <span className="material-symbols-outlined">
            {showReference ? 'expand_less' : 'expand_more'}
          </span>
        </ReferenceHeader>
        <ReferenceContent $expanded={showReference}>
          <EntityGrid>
            {commonEntities.map((e, i) => (
              <EntityItem key={i}>
                <span>{e.char === ' ' ? '(space)' : e.char}</span>
                <span>{e.entity}</span>
              </EntityItem>
            ))}
          </EntityGrid>
        </ReferenceContent>
      </ReferenceTable>
    </Container>
  );
};
