import React, { useState, useCallback } from 'react';
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
  padding: 24px;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Label = styled.label`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;

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

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid ${props => props.$primary ? '#6200ee' : '#ddd'};
  background: ${props => props.$primary ? '#6200ee' : 'white'};
  color: ${props => props.$primary ? 'white' : '#666'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    background: ${props => props.$primary ? '#5000d0' : '#f3e5f5'};
    color: ${props => props.$primary ? 'white' : '#6200ee'};
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const OutputSection = styled.div`
  margin-top: 8px;
`;

const OutputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const OutputTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UUIDCount = styled.span`
  font-size: 12px;
  color: #999;
`;

const UUIDList = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const UUIDItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-family: 'Courier New', monospace;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const UUIDText = styled.span`
  color: #333;
  user-select: all;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: ${props => props.$copied ? '#e8f5e9' : 'transparent'};
  color: ${props => props.$copied ? '#2e7d32' : '#666'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$copied ? '#e8f5e9' : '#e0e0e0'};
  }

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  text-align: center;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const VersionInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const VersionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
`;

const VersionDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
`;

type UUIDVersion = 'v4' | 'v1';

// Generate UUID v4 (random)
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate UUID v1-like (timestamp-based, simplified)
function generateUUIDv1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0');
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHigh = '1' + timeHex.slice(0, 3);

  const clockSeq = ((Math.random() * 0x3fff) | 0x8000).toString(16);
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
}

export const UUIDGeneratorTool: React.FC = () => {
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUIDs = useCallback(() => {
    const generator = version === 'v4' ? generateUUIDv4 : generateUUIDv1;
    const newUuids = Array.from({ length: count }, () => generator());
    setUuids(newUuids);
    setCopiedIndex(null);
  }, [version, count]);

  const handleCopy = useCallback(async (uuid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = uuid;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    const allUuids = uuids.join('\n');
    try {
      await navigator.clipboard.writeText(allUuids);
      setCopiedIndex(-1); // -1 indicates "all copied"
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = allUuids;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, [uuids]);

  const handleClear = useCallback(() => {
    setUuids([]);
    setCopiedIndex(null);
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">fingerprint</span>
          UUID Generator
        </Title>
        <Description>
          Generate universally unique identifiers (UUIDs) in various formats.
        </Description>
      </div>

      <Card>
        <ControlsRow>
          <Label>
            Version:
            <Select value={version} onChange={(e) => setVersion(e.target.value as UUIDVersion)}>
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Timestamp)</option>
            </Select>
          </Label>
          <Label>
            Count:
            <NumberInput
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </Label>
        </ControlsRow>

        <ButtonGroup>
          <ActionButton $primary onClick={generateUUIDs}>
            <span className="material-symbols-outlined">casino</span>
            Generate
          </ActionButton>
          {uuids.length > 1 && (
            <ActionButton onClick={handleCopyAll}>
              <span className="material-symbols-outlined">
                {copiedIndex === -1 ? 'check' : 'content_copy'}
              </span>
              {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
            </ActionButton>
          )}
          {uuids.length > 0 && (
            <ActionButton onClick={handleClear}>
              <span className="material-symbols-outlined">delete</span>
              Clear
            </ActionButton>
          )}
        </ButtonGroup>

        <OutputSection>
          <OutputHeader>
            <OutputTitle>Generated UUIDs</OutputTitle>
            {uuids.length > 0 && <UUIDCount>{uuids.length} UUID{uuids.length > 1 ? 's' : ''}</UUIDCount>}
          </OutputHeader>

          <UUIDList>
            {uuids.length > 0 ? (
              uuids.map((uuid, index) => (
                <UUIDItem key={index}>
                  <UUIDText>{uuid}</UUIDText>
                  <CopyButton
                    $copied={copiedIndex === index}
                    onClick={() => handleCopy(uuid, index)}
                  >
                    <span className="material-symbols-outlined">
                      {copiedIndex === index ? 'check' : 'content_copy'}
                    </span>
                    {copiedIndex === index ? 'Copied' : 'Copy'}
                  </CopyButton>
                </UUIDItem>
              ))
            ) : (
              <EmptyState>
                <span className="material-symbols-outlined">fingerprint</span>
                <p>Click "Generate" to create UUIDs</p>
              </EmptyState>
            )}
          </UUIDList>
        </OutputSection>

        <VersionInfo>
          <VersionTitle>About UUID Versions</VersionTitle>
          <VersionDescription>
            <strong>UUID v4 (Random):</strong> Generated using random numbers. Most commonly used,
            offers excellent uniqueness with ~5.3 × 10³⁶ possible values.<br /><br />
            <strong>UUID v1 (Timestamp):</strong> Based on timestamp and node identifier.
            Useful when you need time-ordered identifiers.
          </VersionDescription>
        </VersionInfo>
      </Card>
    </Container>
  );
};
