import React, { useState, useCallback } from 'react';
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

const ModeToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#6200ee' : '#ddd'};
  background: ${props => props.$active ? '#6200ee' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: ${props => props.$active ? 'white' : '#6200ee'};
  }
`;

const PanesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`;

const PaneLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 200px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 12px;
  padding: 8px 12px;
  background: #ffebee;
  border-radius: 4px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError(null);

    if (!value.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        // Encode to Base64
        const encoded = btoa(unescape(encodeURIComponent(value)));
        setOutput(encoded);
      } else {
        // Decode from Base64
        const decoded = decodeURIComponent(escape(atob(value)));
        setOutput(decoded);
      }
    } catch (e) {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding error');
      setOutput('');
    }
  }, [mode]);

  const handleModeChange = useCallback((newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  const handleSwap = useCallback(() => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    setOutput('');
    setError(null);

    // Re-process with swapped values
    if (output.trim()) {
      try {
        if (newMode === 'encode') {
          const encoded = btoa(unescape(encodeURIComponent(output)));
          setOutput(encoded);
        } else {
          const decoded = decodeURIComponent(escape(atob(output)));
          setOutput(decoded);
        }
      } catch (e) {
        setError(newMode === 'decode' ? 'Invalid Base64 string' : 'Encoding error');
        setOutput('');
      }
    }
  }, [mode, output]);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">data_object</span>
          Base64 Encoder/Decoder
        </Title>
        <Description>Encode text to Base64 or decode Base64 strings back to text.</Description>
      </div>

      <ModeToggle>
        <ModeButton $active={mode === 'encode'} onClick={() => handleModeChange('encode')}>
          Encode
        </ModeButton>
        <ModeButton $active={mode === 'decode'} onClick={() => handleModeChange('decode')}>
          Decode
        </ModeButton>
      </ModeToggle>

      <ActionBar>
        <ActionButton onClick={handleSwap} title="Swap input and output">
          <span className="material-symbols-outlined">swap_horiz</span>
          Swap
        </ActionButton>
        <ActionButton onClick={handleCopy} disabled={!output} title="Copy output">
          <span className="material-symbols-outlined">content_copy</span>
          Copy
        </ActionButton>
        <ActionButton onClick={handleClear} title="Clear all">
          <span className="material-symbols-outlined">delete</span>
          Clear
        </ActionButton>
      </ActionBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <PanesContainer>
        <Pane>
          <PaneLabel>{mode === 'encode' ? 'Plain Text' : 'Base64 Input'}</PaneLabel>
          <TextArea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          />
        </Pane>
        <Pane>
          <PaneLabel>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</PaneLabel>
          <TextArea
            value={output}
            readOnly
            placeholder="Output will appear here..."
          />
        </Pane>
      </PanesContainer>
    </Container>
  );
};
