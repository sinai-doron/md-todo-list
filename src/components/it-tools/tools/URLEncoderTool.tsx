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

const ModeSelector = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: 2px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  background: ${props => props.$active ? '#6200ee' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: ${props => props.$active ? 'white' : '#6200ee'};
  }
`;

const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;

  input {
    accent-color: #6200ee;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CharCount = styled.span`
  font-size: 11px;
  color: #999;
`;

const TextArea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
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

const MiddleActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
    background: #f3e5f5;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${props => props.$copied ? '#2e7d32' : '#ddd'};
  background: ${props => props.$copied ? '#e8f5e9' : 'white'};
  color: ${props => props.$copied ? '#2e7d32' : '#666'};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$copied ? '#2e7d32' : '#6200ee'};
    color: ${props => props.$copied ? '#2e7d32' : '#6200ee'};
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 13px;
  padding: 12px 16px;
  background: #ffebee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #1565c0;

  strong {
    display: block;
    margin-bottom: 8px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }
`;

type Mode = 'encode' | 'decode';
type EncodeType = 'component' | 'uri';

export const URLEncoderTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encode');
  const [encodeType, setEncodeType] = useState<EncodeType>('component');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null };
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeType === 'component'
          ? encodeURIComponent(input)
          : encodeURI(input);
        return { output: encoded, error: null };
      } else {
        const decoded = encodeType === 'component'
          ? decodeURIComponent(input)
          : decodeURI(input);
        return { output: decoded, error: null };
      }
    } catch (e) {
      return {
        output: '',
        error: `Failed to ${mode}: Invalid ${mode === 'decode' ? 'encoded' : ''} input`,
      };
    }
  }, [input, mode, encodeType]);

  const handleSwap = useCallback(() => {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  }, [output, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setCopied(false);
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">link</span>
          URL Encoder/Decoder
        </Title>
        <Description>
          Encode or decode URLs and query string parameters.
        </Description>
      </div>

      <ModeSelector>
        <ModeButton $active={mode === 'encode'} onClick={() => setMode('encode')}>
          Encode
        </ModeButton>
        <ModeButton $active={mode === 'decode'} onClick={() => setMode('decode')}>
          Decode
        </ModeButton>
      </ModeSelector>

      <OptionsRow>
        <OptionLabel>
          <input
            type="radio"
            name="encodeType"
            checked={encodeType === 'component'}
            onChange={() => setEncodeType('component')}
          />
          Component (for query params)
        </OptionLabel>
        <OptionLabel>
          <input
            type="radio"
            name="encodeType"
            checked={encodeType === 'uri'}
            onChange={() => setEncodeType('uri')}
          />
          Full URI (preserves :/?#[]@)
        </OptionLabel>
      </OptionsRow>

      <ContentArea>
        <InputSection>
          <LabelRow>
            <Label>{mode === 'encode' ? 'Plain Text' : 'Encoded URL'}</Label>
            <CharCount>{input.length} chars</CharCount>
          </LabelRow>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode'
              ? 'Enter text to encode...'
              : 'Enter encoded URL to decode...'
            }
          />
        </InputSection>

        <MiddleActions>
          <IconButton onClick={handleSwap} title="Swap input/output">
            <span className="material-symbols-outlined">swap_horiz</span>
          </IconButton>
        </MiddleActions>

        <InputSection>
          <LabelRow>
            <Label>{mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}</Label>
            <CharCount>{output.length} chars</CharCount>
          </LabelRow>
          <TextArea
            value={output}
            readOnly
            placeholder={mode === 'encode'
              ? 'Encoded result will appear here...'
              : 'Decoded result will appear here...'
            }
          />
        </InputSection>
      </ContentArea>

      {error && (
        <ErrorMessage>
          <span className="material-symbols-outlined">error</span>
          {error}
        </ErrorMessage>
      )}

      <ActionBar>
        <ActionButton $copied={copied} onClick={handleCopy} disabled={!output}>
          <span className="material-symbols-outlined">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied!' : 'Copy Result'}
        </ActionButton>
        <ActionButton onClick={handleClear}>
          <span className="material-symbols-outlined">delete</span>
          Clear
        </ActionButton>
      </ActionBar>

      <InfoBox>
        <strong>Encoding Types:</strong>
        <ul>
          <li><strong>Component:</strong> Encodes all special characters. Use for query parameter values.</li>
          <li><strong>Full URI:</strong> Preserves URL structure characters (:/?#[]@). Use for complete URLs.</li>
        </ul>
      </InfoBox>
    </Container>
  );
};
