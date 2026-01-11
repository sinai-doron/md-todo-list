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

const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 20px;
    color: #6200ee;
  }
`;

const PatternRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const PatternInput = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #6200ee;
  }
`;

const PatternSlash = styled.span`
  padding: 12px;
  color: #999;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #f5f5f5;
`;

const PatternField = styled.input`
  flex: 1;
  padding: 12px;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const FlagsField = styled.input`
  width: 60px;
  padding: 12px;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  outline: none;
  background: #f5f5f5;

  &::placeholder {
    color: #999;
  }
`;

const FlagsHelp = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FlagChip = styled.button<{ $active: boolean }>`
  padding: 6px 10px;
  border: 1px solid ${props => props.$active ? '#6200ee' : '#ddd'};
  background: ${props => props.$active ? '#ede7f6' : 'white'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
  }
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
  min-height: 150px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
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

const ResultsBox = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 100px;
`;

const HighlightedMatch = styled.mark`
  background: #fff59d;
  color: #333;
  padding: 1px 2px;
  border-radius: 2px;
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

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  strong {
    color: #6200ee;
    font-size: 18px;
  }
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const MatchItem = styled.div`
  background: #f5f5f5;
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 13px;
`;

const MatchIndex = styled.span`
  color: #999;
  font-size: 12px;
`;

const MatchValue = styled.span`
  color: #333;
  background: #fff59d;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MatchPosition = styled.span`
  color: #666;
  font-size: 12px;
`;

const GroupsContainer = styled.div`
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
`;

const GroupItem = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;

  span {
    color: #6200ee;
    background: #ede7f6;
    padding: 1px 4px;
    border-radius: 3px;
  }
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
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
    background: #f3e5f5;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

interface MatchResult {
  value: string;
  index: number;
  groups: { [key: string]: string } | undefined;
}

export const RegexTesterTool: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');

  const { error, matches, highlightedText } = useMemo(() => {
    if (!pattern.trim()) {
      return { error: null, matches: [], highlightedText: testText };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: MatchResult[] = [];

      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.groups,
          });
          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }

      // Build highlighted text
      let highlightedText = testText;
      if (matches.length > 0) {
        const sortedMatches = [...matches].sort((a, b) => b.index - a.index);
        for (const match of sortedMatches) {
          const before = highlightedText.slice(0, match.index);
          const matchText = highlightedText.slice(match.index, match.index + match.value.length);
          const after = highlightedText.slice(match.index + match.value.length);
          highlightedText = before + `\x00MATCH_START\x00${matchText}\x00MATCH_END\x00` + after;
        }
      }

      return { error: null, matches, highlightedText };
    } catch (e) {
      return { error: (e as Error).message, matches: [], highlightedText: testText };
    }
  }, [pattern, flags, testText]);

  const toggleFlag = useCallback((flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  }, [flags]);

  const handleClear = useCallback(() => {
    setPattern('');
    setFlags('g');
    setTestText('');
  }, []);

  const handleSample = useCallback(() => {
    setPattern('(\\w+)@(\\w+\\.\\w+)');
    setFlags('gi');
    setTestText(`Contact us at:
support@example.com
sales@company.org
info@test.net

Invalid emails:
not-an-email
missing@domain`);
  }, []);

  // Render highlighted text
  const renderHighlightedText = () => {
    if (!highlightedText.includes('\x00MATCH_START\x00')) {
      return testText || 'Enter a pattern and test text to see matches highlighted here...';
    }

    const parts = highlightedText.split(/\x00MATCH_START\x00|\x00MATCH_END\x00/);
    return parts.map((part, i) => {
      // Odd indices are matches
      if (i % 2 === 1) {
        return <HighlightedMatch key={i}>{part}</HighlightedMatch>;
      }
      return part;
    });
  };

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">code</span>
          Regex Tester
        </Title>
        <Description>
          Test and debug regular expressions with live matching and highlighting.
        </Description>
      </div>

      <Card>
        <CardTitle>
          <span className="material-symbols-outlined">search</span>
          Pattern
        </CardTitle>

        <PatternRow>
          <PatternInput>
            <PatternSlash>/</PatternSlash>
            <PatternField
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
            />
            <PatternSlash>/</PatternSlash>
            <FlagsField
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gi"
            />
          </PatternInput>
        </PatternRow>

        <FlagsHelp style={{ marginTop: '12px' }}>
          <FlagChip $active={flags.includes('g')} onClick={() => toggleFlag('g')}>
            g - global
          </FlagChip>
          <FlagChip $active={flags.includes('i')} onClick={() => toggleFlag('i')}>
            i - case insensitive
          </FlagChip>
          <FlagChip $active={flags.includes('m')} onClick={() => toggleFlag('m')}>
            m - multiline
          </FlagChip>
          <FlagChip $active={flags.includes('s')} onClick={() => toggleFlag('s')}>
            s - dotAll
          </FlagChip>
          <FlagChip $active={flags.includes('u')} onClick={() => toggleFlag('u')}>
            u - unicode
          </FlagChip>
        </FlagsHelp>
      </Card>

      {error && (
        <ErrorMessage>
          <span className="material-symbols-outlined">error</span>
          {error}
        </ErrorMessage>
      )}

      <Card>
        <Label>Test String</Label>
        <TextArea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test against the regex..."
        />
      </Card>

      <Card>
        <CardTitle>
          <span className="material-symbols-outlined">preview</span>
          Highlighted Result
        </CardTitle>
        <ResultsBox>
          {renderHighlightedText()}
        </ResultsBox>
      </Card>

      {pattern && testText && !error && (
        <Card>
          <CardTitle>
            <span className="material-symbols-outlined">checklist</span>
            Match Details
          </CardTitle>

          <StatsRow>
            <Stat>
              <strong>{matches.length}</strong> match{matches.length !== 1 ? 'es' : ''} found
            </Stat>
          </StatsRow>

          {matches.length > 0 && (
            <MatchList>
              {matches.slice(0, 50).map((match, idx) => (
                <MatchItem key={idx}>
                  <div>
                    <MatchIndex>#{idx + 1}</MatchIndex>
                    <MatchValue style={{ marginLeft: '8px' }}>{match.value || '(empty)'}</MatchValue>
                    {match.groups && Object.keys(match.groups).length > 0 && (
                      <GroupsContainer>
                        {Object.entries(match.groups).map(([name, value]) => (
                          <GroupItem key={name}>
                            {name}: <span>{value}</span>
                          </GroupItem>
                        ))}
                      </GroupsContainer>
                    )}
                  </div>
                  <MatchPosition>index: {match.index}</MatchPosition>
                </MatchItem>
              ))}
              {matches.length > 50 && (
                <div style={{ color: '#999', fontSize: '13px', textAlign: 'center' }}>
                  ...and {matches.length - 50} more matches
                </div>
              )}
            </MatchList>
          )}
        </Card>
      )}

      <ActionBar>
        <ActionButton onClick={handleSample}>
          <span className="material-symbols-outlined">science</span>
          Load Sample
        </ActionButton>
        <ActionButton onClick={handleClear}>
          <span className="material-symbols-outlined">delete</span>
          Clear All
        </ActionButton>
      </ActionBar>
    </Container>
  );
};
