import React, { useState, useMemo } from 'react';
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

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const Select = styled.select`
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const StandardToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
`;

const StandardButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
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

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const ResultCard = styled.div<{ $highlight?: boolean }>`
  background: ${props => props.$highlight ? '#ede7f6' : '#f8f9fa'};
  border: 1px solid ${props => props.$highlight ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    background: #ede7f6;
  }
`;

const ResultValue = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: #6200ee;
  margin-bottom: 4px;
  word-break: break-all;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UnitAbbr = styled.span`
  background: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.6;
`;

const ComparisonTable = styled.div`
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
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

const TableContent = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f8f9fa;
    font-weight: 500;
    color: #333;
  }

  td {
    color: #666;
  }

  tr:last-child td {
    border-bottom: none;
  }

  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }
`;

const CopyHint = styled.span`
  font-size: 10px;
  color: #999;
  font-style: italic;
`;

type ByteUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' |
                'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB';

type Standard = 'decimal' | 'binary';

interface UnitInfo {
  name: string;
  abbr: string;
  factor: number;
  standard: Standard;
}

const units: Record<ByteUnit, UnitInfo> = {
  'B': { name: 'Bytes', abbr: 'B', factor: 1, standard: 'decimal' },
  'KB': { name: 'Kilobytes', abbr: 'KB', factor: 1000, standard: 'decimal' },
  'MB': { name: 'Megabytes', abbr: 'MB', factor: 1000 ** 2, standard: 'decimal' },
  'GB': { name: 'Gigabytes', abbr: 'GB', factor: 1000 ** 3, standard: 'decimal' },
  'TB': { name: 'Terabytes', abbr: 'TB', factor: 1000 ** 4, standard: 'decimal' },
  'PB': { name: 'Petabytes', abbr: 'PB', factor: 1000 ** 5, standard: 'decimal' },
  'KiB': { name: 'Kibibytes', abbr: 'KiB', factor: 1024, standard: 'binary' },
  'MiB': { name: 'Mebibytes', abbr: 'MiB', factor: 1024 ** 2, standard: 'binary' },
  'GiB': { name: 'Gibibytes', abbr: 'GiB', factor: 1024 ** 3, standard: 'binary' },
  'TiB': { name: 'Tebibytes', abbr: 'TiB', factor: 1024 ** 4, standard: 'binary' },
  'PiB': { name: 'Pebibytes', abbr: 'PiB', factor: 1024 ** 5, standard: 'binary' },
};

const decimalUnits: ByteUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const binaryUnits: ByteUnit[] = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  if (num >= 1) {
    // For large numbers, use locale string with max 4 decimal places
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  // For small numbers, show significant digits
  return num.toPrecision(6);
};

export const ByteCalculatorTool: React.FC = () => {
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState<ByteUnit>('GB');
  const [standard, setStandard] = useState<Standard>('decimal');
  const [showComparison, setShowComparison] = useState(false);

  const bytes = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return 0;
    return num * units[unit].factor;
  }, [value, unit]);

  const conversions = useMemo(() => {
    const targetUnits = standard === 'decimal' ? decimalUnits : binaryUnits;
    return targetUnits.map(u => ({
      unit: u,
      ...units[u],
      value: bytes / units[u].factor,
    }));
  }, [bytes, standard]);

  const handleCopy = async (val: number, unitAbbr: string) => {
    try {
      await navigator.clipboard.writeText(`${formatNumber(val)} ${unitAbbr}`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const availableUnits = standard === 'decimal' ? decimalUnits : binaryUnits;

  return (
    <Container>
      <div>
        <Title>Byte Size Calculator</Title>
        <Description>
          Convert between bytes, kilobytes, megabytes, gigabytes, and more
        </Description>
      </div>

      <Section>
        <Label>Standard</Label>
        <StandardToggle>
          <StandardButton
            $active={standard === 'decimal'}
            onClick={() => {
              setStandard('decimal');
              if (!decimalUnits.includes(unit)) {
                setUnit('GB');
              }
            }}
          >
            Decimal (KB, MB, GB)
          </StandardButton>
          <StandardButton
            $active={standard === 'binary'}
            onClick={() => {
              setStandard('binary');
              if (!binaryUnits.includes(unit)) {
                setUnit('GiB');
              }
            }}
          >
            Binary (KiB, MiB, GiB)
          </StandardButton>
        </StandardToggle>
      </Section>

      <Section>
        <Label>Value</Label>
        <InputRow>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            min="0"
            step="any"
          />
          <Select value={unit} onChange={(e) => setUnit(e.target.value as ByteUnit)}>
            {availableUnits.map(u => (
              <option key={u} value={u}>{units[u].name} ({u})</option>
            ))}
          </Select>
        </InputRow>
      </Section>

      <Section>
        <Label>
          Conversions <CopyHint>(click to copy)</CopyHint>
        </Label>
        <ResultsGrid>
          {conversions.map(conv => (
            <ResultCard
              key={conv.unit}
              $highlight={conv.unit === unit}
              onClick={() => handleCopy(conv.value, conv.abbr)}
            >
              <ResultValue>{formatNumber(conv.value)}</ResultValue>
              <ResultLabel>
                {conv.name}
                <UnitAbbr>{conv.abbr}</UnitAbbr>
              </ResultLabel>
            </ResultCard>
          ))}
        </ResultsGrid>
      </Section>

      <InfoBox>
        <strong>Decimal vs Binary:</strong><br />
        <strong>Decimal (SI)</strong>: Uses powers of 1000 (KB = 1,000 bytes). Used by storage manufacturers.<br />
        <strong>Binary (IEC)</strong>: Uses powers of 1024 (KiB = 1,024 bytes). Used by operating systems and memory.
      </InfoBox>

      <ComparisonTable>
        <TableHeader onClick={() => setShowComparison(!showComparison)}>
          <span>Unit Comparison Table</span>
          <span className="material-symbols-outlined">
            {showComparison ? 'expand_less' : 'expand_more'}
          </span>
        </TableHeader>
        <TableContent $expanded={showComparison}>
          <Table>
            <thead>
              <tr>
                <th>Decimal (SI)</th>
                <th>Binary (IEC)</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>1 KB</code> = 1,000 B</td>
                <td><code>1 KiB</code> = 1,024 B</td>
                <td>2.4%</td>
              </tr>
              <tr>
                <td><code>1 MB</code> = 1,000,000 B</td>
                <td><code>1 MiB</code> = 1,048,576 B</td>
                <td>4.9%</td>
              </tr>
              <tr>
                <td><code>1 GB</code> = 1,000,000,000 B</td>
                <td><code>1 GiB</code> = 1,073,741,824 B</td>
                <td>7.4%</td>
              </tr>
              <tr>
                <td><code>1 TB</code> = 10<sup>12</sup> B</td>
                <td><code>1 TiB</code> = 2<sup>40</sup> B</td>
                <td>10.0%</td>
              </tr>
              <tr>
                <td><code>1 PB</code> = 10<sup>15</sup> B</td>
                <td><code>1 PiB</code> = 2<sup>50</sup> B</td>
                <td>12.6%</td>
              </tr>
            </tbody>
          </Table>
        </TableContent>
      </ComparisonTable>
    </Container>
  );
};
