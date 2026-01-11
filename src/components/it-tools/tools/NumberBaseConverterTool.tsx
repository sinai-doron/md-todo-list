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

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid ${props => props.$hasError ? '#d32f2f' : '#e0e0e0'};
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#d32f2f' : '#6200ee'};
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

const BaseBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  background: #ede7f6;
  color: #6200ee;
  border-radius: 4px;
  font-weight: 600;
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
  font-size: 14px;
  color: #333;
  word-break: break-all;
  min-height: 44px;
  display: flex;
  align-items: center;
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

  code {
    background: #bbdefb;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
`;

const QuickButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const QuickButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
    background: #f3e5f5;
  }
`;

type BaseType = '2' | '8' | '10' | '16';

interface BaseInfo {
  base: number;
  name: string;
  prefix: string;
  placeholder: string;
}

const bases: Record<BaseType, BaseInfo> = {
  '2': { base: 2, name: 'Binary', prefix: '0b', placeholder: '10101010' },
  '8': { base: 8, name: 'Octal', prefix: '0o', placeholder: '252' },
  '10': { base: 10, name: 'Decimal', prefix: '', placeholder: '170' },
  '16': { base: 16, name: 'Hexadecimal', prefix: '0x', placeholder: 'AA' },
};

function isValidForBase(value: string, base: number): boolean {
  if (!value.trim()) return true;

  const validChars: Record<number, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  };

  return validChars[base]?.test(value) ?? false;
}

function formatBinary(value: string): string {
  // Group binary digits in sets of 4
  return value.replace(/(.{4})/g, '$1 ').trim();
}

function formatHex(value: string): string {
  // Group hex digits in sets of 2
  return value.replace(/(.{2})/g, '$1 ').trim().toUpperCase();
}

export const NumberBaseConverterTool: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<BaseType>('10');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { decimalValue, error, results } = useMemo(() => {
    if (!inputValue.trim()) {
      return { decimalValue: null, error: null, results: {} };
    }

    const baseInfo = bases[inputBase];

    if (!isValidForBase(inputValue, baseInfo.base)) {
      return {
        decimalValue: null,
        error: `Invalid ${baseInfo.name.toLowerCase()} number`,
        results: {},
      };
    }

    try {
      const decimal = parseInt(inputValue, baseInfo.base);

      if (isNaN(decimal)) {
        return { decimalValue: null, error: 'Invalid number', results: {} };
      }

      // Check for overflow (JavaScript safe integer limit)
      if (decimal > Number.MAX_SAFE_INTEGER) {
        return {
          decimalValue: null,
          error: 'Number too large (exceeds JavaScript safe integer)',
          results: {},
        };
      }

      const results: Record<BaseType, string> = {
        '2': decimal.toString(2),
        '8': decimal.toString(8),
        '10': decimal.toString(10),
        '16': decimal.toString(16).toUpperCase(),
      };

      return { decimalValue: decimal, error: null, results };
    } catch {
      return { decimalValue: null, error: 'Conversion error', results: {} };
    }
  }, [inputValue, inputBase]);

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

  const handleQuickSample = useCallback((value: string, base: BaseType) => {
    setInputValue(value);
    setInputBase(base);
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">tag</span>
          Number Base Converter
        </Title>
        <Description>
          Convert numbers between binary, octal, decimal, and hexadecimal.
        </Description>
      </div>

      <Card>
        <InputRow>
          <InputGroup style={{ flex: '0 0 auto', minWidth: '140px' }}>
            <Label>Input Base</Label>
            <Select
              value={inputBase}
              onChange={(e) => setInputBase(e.target.value as BaseType)}
            >
              <option value="2">Binary (2)</option>
              <option value="8">Octal (8)</option>
              <option value="10">Decimal (10)</option>
              <option value="16">Hex (16)</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>Input Value</Label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={bases[inputBase].placeholder}
              $hasError={!!error}
            />
          </InputGroup>
        </InputRow>

        <QuickButtons>
          <QuickButton onClick={() => handleQuickSample('255', '10')}>255 (dec)</QuickButton>
          <QuickButton onClick={() => handleQuickSample('1024', '10')}>1024 (dec)</QuickButton>
          <QuickButton onClick={() => handleQuickSample('DEADBEEF', '16')}>DEADBEEF (hex)</QuickButton>
          <QuickButton onClick={() => handleQuickSample('11111111', '2')}>11111111 (bin)</QuickButton>
        </QuickButtons>
      </Card>

      {error && (
        <ErrorMessage>
          <span className="material-symbols-outlined">error</span>
          {error}
        </ErrorMessage>
      )}

      {decimalValue !== null && (
        <ResultsGrid>
          {(Object.keys(bases) as BaseType[]).map((base) => {
            const info = bases[base];
            const value = results[base] || '';
            const displayValue = base === '2' ? formatBinary(value) :
              base === '16' ? formatHex(value) : value;

            return (
              <ResultCard key={base}>
                <ResultHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ResultTitle>{info.name}</ResultTitle>
                    <BaseBadge>Base {base}</BaseBadge>
                  </div>
                  <CopyButton
                    $copied={copiedField === base}
                    onClick={() => handleCopy(value, base)}
                  >
                    <span className="material-symbols-outlined">
                      {copiedField === base ? 'check' : 'content_copy'}
                    </span>
                    {copiedField === base ? 'Copied' : 'Copy'}
                  </CopyButton>
                </ResultHeader>
                <ResultValue>
                  {info.prefix && (
                    <span style={{ color: '#999', marginRight: '4px' }}>{info.prefix}</span>
                  )}
                  {displayValue}
                </ResultValue>
              </ResultCard>
            );
          })}
        </ResultsGrid>
      )}

      <InfoBox>
        <strong>Quick Reference</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
          <div><code>0b</code> Binary prefix</div>
          <div><code>0o</code> Octal prefix</div>
          <div><code>0x</code> Hex prefix</div>
          <div><code>A-F</code> Hex digits 10-15</div>
        </div>
      </InfoBox>
    </Container>
  );
};
