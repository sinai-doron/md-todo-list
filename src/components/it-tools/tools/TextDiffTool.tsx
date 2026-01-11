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

const CheckboxLabel = styled.label`
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

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TextArea = styled.textarea`
  min-height: 150px;
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

const DiffSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`;

const DiffHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const DiffTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
`;

const StatItem = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 500;
`;

const DiffOutput = styled.div`
  flex: 1;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: auto;
  min-height: 200px;
`;

const DiffLine = styled.div<{ $type: 'added' | 'removed' | 'unchanged' }>`
  display: flex;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: ${props => {
    switch (props.$type) {
      case 'added': return '#e6ffed';
      case 'removed': return '#ffeef0';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'added': return '#22863a';
      case 'removed': return '#cb2431';
      default: return '#444';
    }
  }};

  &:hover {
    background: ${props => {
      switch (props.$type) {
        case 'added': return '#cdffd8';
        case 'removed': return '#ffdce0';
        default: return '#f0f0f0';
      }
    }};
  }
`;

const LineNumber = styled.span`
  min-width: 40px;
  padding: 0 8px;
  text-align: right;
  color: #999;
  background: rgba(0, 0, 0, 0.03);
  border-right: 1px solid #e0e0e0;
  user-select: none;
`;

const LinePrefix = styled.span`
  width: 20px;
  text-align: center;
  font-weight: 600;
  user-select: none;
`;

const LineContent = styled.span`
  flex: 1;
  padding: 0 8px;
  white-space: pre-wrap;
  word-break: break-all;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  padding: 40px;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

// Diff types
interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  originalLine?: number;
  modifiedLine?: number;
}

// Simple LCS-based diff algorithm
function computeDiff(
  original: string,
  modified: string,
  ignoreWhitespace: boolean
): DiffResult[] {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');

  const normalize = (line: string) =>
    ignoreWhitespace ? line.replace(/\s+/g, ' ').trim() : line;

  // Build LCS table
  const m = originalLines.length;
  const n = modifiedLines.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalize(originalLines[i - 1]) === normalize(modifiedLines[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  let i = m, j = n;
  const tempResult: DiffResult[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalize(originalLines[i - 1]) === normalize(modifiedLines[j - 1])) {
      tempResult.push({
        type: 'unchanged',
        content: modifiedLines[j - 1],
        originalLine: i,
        modifiedLine: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempResult.push({
        type: 'added',
        content: modifiedLines[j - 1],
        modifiedLine: j,
      });
      j--;
    } else if (i > 0) {
      tempResult.push({
        type: 'removed',
        content: originalLines[i - 1],
        originalLine: i,
      });
      i--;
    }
  }

  return tempResult.reverse();
}

// Calculate stats
function calculateStats(diff: DiffResult[]): { added: number; removed: number; unchanged: number } {
  return diff.reduce(
    (acc, line) => {
      acc[line.type]++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}

export const TextDiffTool: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diffResult = useMemo(
    () => computeDiff(originalText, modifiedText, ignoreWhitespace),
    [originalText, modifiedText, ignoreWhitespace]
  );

  const stats = useMemo(() => calculateStats(diffResult), [diffResult]);

  const handleSwap = useCallback(() => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
  }, [originalText, modifiedText]);

  const handleClear = useCallback(() => {
    setOriginalText('');
    setModifiedText('');
  }, []);

  const hasContent = originalText.trim() || modifiedText.trim();

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">difference</span>
          Text Diff
        </Title>
        <Description>
          Compare two texts and highlight the differences line by line.
        </Description>
      </div>

      <ToolbarRow>
        <ButtonGroup>
          <ActionButton onClick={handleSwap}>
            <span className="material-symbols-outlined">swap_horiz</span>
            Swap
          </ActionButton>
          <ActionButton onClick={handleClear}>
            <span className="material-symbols-outlined">delete</span>
            Clear
          </ActionButton>
        </ButtonGroup>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
          />
          Ignore whitespace
        </CheckboxLabel>
      </ToolbarRow>

      <InputGrid>
        <InputSection>
          <Label>Original</Label>
          <TextArea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text here..."
          />
        </InputSection>
        <InputSection>
          <Label>Modified</Label>
          <TextArea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text here..."
          />
        </InputSection>
      </InputGrid>

      <DiffSection>
        <DiffHeader>
          <DiffTitle>Diff Output</DiffTitle>
          {hasContent && (
            <Stats>
              <StatItem $color="#22863a">+{stats.added} added</StatItem>
              <StatItem $color="#cb2431">-{stats.removed} removed</StatItem>
              <StatItem $color="#666">={stats.unchanged} unchanged</StatItem>
            </Stats>
          )}
        </DiffHeader>

        <DiffOutput>
          {hasContent ? (
            diffResult.map((line, index) => (
              <DiffLine key={index} $type={line.type}>
                <LineNumber>
                  {line.type === 'removed' ? line.originalLine : line.modifiedLine || ''}
                </LineNumber>
                <LinePrefix>
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </LinePrefix>
                <LineContent>{line.content}</LineContent>
              </DiffLine>
            ))
          ) : (
            <EmptyState>
              <span className="material-symbols-outlined">difference</span>
              <p>Enter text in both fields to see the diff</p>
            </EmptyState>
          )}
        </DiffOutput>
      </DiffSection>
    </Container>
  );
};
