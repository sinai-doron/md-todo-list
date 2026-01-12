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
  min-height: 200px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const OptionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: #666;
  }

  select {
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
  }
`;

const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  input {
    accent-color: #6200ee;
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
  background: #1a1a2e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
`;

const FormattedSQL = styled.pre`
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #eee;
  line-height: 1.6;
  white-space: pre-wrap;

  .keyword {
    color: #569cd6;
    font-weight: bold;
  }

  .function {
    color: #dcdcaa;
  }

  .string {
    color: #ce9178;
  }

  .number {
    color: #b5cea8;
  }

  .operator {
    color: #d4d4d4;
  }

  .comment {
    color: #6a9955;
    font-style: italic;
  }
`;

const ExampleButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExampleButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
  }
`;

type KeywordCase = 'upper' | 'lower' | 'capitalize';
type IndentSize = 2 | 4;

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT',
  'OUTER', 'FULL', 'CROSS', 'ON', 'AS', 'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
  'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'IF', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE', 'CASCADE', 'RESTRICT',
  'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'CAST', 'COALESCE', 'NULLIF', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TRUE', 'FALSE',
  'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROWS', 'RANGE', 'PRECEDING', 'FOLLOWING',
  'UNBOUNDED', 'CURRENT', 'ROW', 'FETCH', 'NEXT', 'ONLY', 'RETURNING', 'CONFLICT',
  'DO', 'NOTHING', 'EXCLUDED', 'TRUNCATE', 'VACUUM', 'ANALYZE', 'EXPLAIN', 'BEGIN',
  'COMMIT', 'ROLLBACK', 'TRANSACTION', 'SAVEPOINT', 'GRANT', 'REVOKE', 'TO', 'USING'
];

const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT',
  'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'POSITION',
  'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATE', 'TIME',
  'EXTRACT', 'DATE_PART', 'DATE_TRUNC', 'AGE', 'INTERVAL', 'TO_CHAR', 'TO_DATE',
  'ROUND', 'FLOOR', 'CEIL', 'ABS', 'MOD', 'POWER', 'SQRT', 'LOG', 'EXP',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE',
  'JSON_AGG', 'JSON_BUILD_OBJECT', 'JSON_EXTRACT', 'JSONB_AGG', 'ARRAY_AGG', 'STRING_AGG'
];

const formatSQL = (
  sql: string,
  keywordCase: KeywordCase,
  indentSize: IndentSize,
  newlineBeforeAnd: boolean
): string => {
  // Remove extra whitespace
  let formatted = sql.replace(/\s+/g, ' ').trim();

  // Apply keyword case transformation
  const keywordRegex = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi');
  formatted = formatted.replace(keywordRegex, (match) => {
    switch (keywordCase) {
      case 'upper': return match.toUpperCase();
      case 'lower': return match.toLowerCase();
      case 'capitalize': return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      default: return match;
    }
  });

  const indent = ' '.repeat(indentSize);

  // Add newlines before major clauses
  const majorClauses = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT'];
  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\s+${clause}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${clause}`);
  });

  // Add newlines before JOIN clauses
  formatted = formatted.replace(/\s+(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\b/gi, (match) => {
    return '\n' + match.trim();
  });

  // Handle AND/OR
  if (newlineBeforeAnd) {
    formatted = formatted.replace(/\s+(AND|OR)\b/gi, (match) => '\n' + indent + match.trim());
  }

  // Add newlines after commas in SELECT (but not in function calls)
  let inFunction = 0;
  let result = '';
  let i = 0;
  while (i < formatted.length) {
    const char = formatted[i];
    if (char === '(') {
      inFunction++;
      result += char;
    } else if (char === ')') {
      inFunction = Math.max(0, inFunction - 1);
      result += char;
    } else if (char === ',' && inFunction === 0) {
      // Check if we're in SELECT clause
      const beforeComma = result.toUpperCase();
      if (beforeComma.includes('SELECT') && !beforeComma.includes('FROM')) {
        result += ',\n' + indent;
      } else {
        result += ', ';
      }
    } else {
      result += char;
    }
    i++;
  }
  formatted = result;

  // Indent content after major clauses
  const lines = formatted.split('\n');
  const indentedLines: string[] = [];
  let shouldIndent = false;

  for (let line of lines) {
    const trimmed = line.trim();
    const upperTrimmed = trimmed.toUpperCase();

    // Check if line starts with a major clause
    if (majorClauses.some(c => upperTrimmed.startsWith(c)) ||
        /^(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\b/i.test(trimmed)) {
      shouldIndent = ['SELECT', 'WHERE', 'SET'].some(c => upperTrimmed.startsWith(c));
      indentedLines.push(trimmed);
    } else if (shouldIndent && trimmed.length > 0) {
      indentedLines.push(indent + trimmed);
    } else {
      indentedLines.push(trimmed);
    }
  }

  return indentedLines.join('\n');
};

const highlightSQL = (sql: string): string => {
  let highlighted = sql;

  // Highlight strings (must be first)
  highlighted = highlighted.replace(/'([^']*)'/g, "<span class='string'>'$1'</span>");

  // Highlight comments
  highlighted = highlighted.replace(/--(.*?)$/gm, "<span class='comment'>--$1</span>");
  highlighted = highlighted.replace(/\/\*([\s\S]*?)\*\//g, "<span class='comment'>/*$1*/</span>");

  // Highlight keywords
  const keywordRegex = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi');
  highlighted = highlighted.replace(keywordRegex, "<span class='keyword'>$1</span>");

  // Highlight functions
  const functionRegex = new RegExp(`\\b(${SQL_FUNCTIONS.join('|')})\\s*\\(`, 'gi');
  highlighted = highlighted.replace(functionRegex, "<span class='function'>$1</span>(");

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, "<span class='number'>$1</span>");

  return highlighted;
};

const examples = [
  {
    name: 'Simple SELECT',
    sql: "SELECT id, name, email FROM users WHERE status = 'active' AND created_at > '2024-01-01' ORDER BY name ASC LIMIT 10"
  },
  {
    name: 'JOIN Query',
    sql: "SELECT u.name, o.order_id, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id LEFT JOIN payments p ON o.id = p.order_id WHERE o.status = 'completed'"
  },
  {
    name: 'Aggregation',
    sql: "SELECT category, COUNT(*) as count, SUM(price) as total, AVG(price) as average FROM products WHERE active = true GROUP BY category HAVING COUNT(*) > 5 ORDER BY total DESC"
  },
  {
    name: 'Subquery',
    sql: "SELECT * FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE country = 'USA') AND total > (SELECT AVG(total) FROM orders)"
  }
];

export const SQLFormatterTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [formatted, setFormatted] = useState('');
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [newlineBeforeAnd, setNewlineBeforeAnd] = useState(true);

  const handleFormat = () => {
    const result = formatSQL(input, keywordCase, indentSize, newlineBeforeAnd);
    setFormatted(result);
  };

  const handleMinify = () => {
    const minified = input.replace(/\s+/g, ' ').trim();
    setFormatted(minified);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setFormatted('');
  };

  const loadExample = (sql: string) => {
    setInput(sql);
    setFormatted('');
  };

  return (
    <Container>
      <div>
        <Title>SQL Formatter</Title>
        <Description>
          Format and beautify SQL queries with customizable options
        </Description>
      </div>

      <Section>
        <Label>Examples</Label>
        <ExampleButtons>
          {examples.map((ex, i) => (
            <ExampleButton key={i} onClick={() => loadExample(ex.sql)}>
              {ex.name}
            </ExampleButton>
          ))}
        </ExampleButtons>
      </Section>

      <Section>
        <Label>SQL Input</Label>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your SQL query here..."
        />
      </Section>

      <OptionsRow>
        <OptionGroup>
          <label>Keywords:</label>
          <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}>
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </OptionGroup>
        <OptionGroup>
          <label>Indent:</label>
          <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value) as IndentSize)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
        </OptionGroup>
        <CheckboxOption>
          <input
            type="checkbox"
            checked={newlineBeforeAnd}
            onChange={(e) => setNewlineBeforeAnd(e.target.checked)}
          />
          New line before AND/OR
        </CheckboxOption>
      </OptionsRow>

      <ButtonGroup>
        <Button $primary onClick={handleFormat} disabled={!input}>
          Format SQL
        </Button>
        <Button onClick={handleMinify} disabled={!input}>
          Minify
        </Button>
        <Button onClick={handleClear} disabled={!input && !formatted}>
          Clear
        </Button>
      </ButtonGroup>

      {formatted && (
        <Section>
          <Label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Formatted SQL</span>
            <Button onClick={handleCopy}>Copy</Button>
          </Label>
          <ResultBox>
            <FormattedSQL dangerouslySetInnerHTML={{ __html: highlightSQL(formatted) }} />
          </ResultBox>
        </Section>
      )}
    </Container>
  );
};
