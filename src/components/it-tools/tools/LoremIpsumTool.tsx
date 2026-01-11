import React, { useState, useCallback, useMemo } from 'react';
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

const OptionsRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
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
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding: 10px 0;

  input {
    accent-color: #6200ee;
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean; $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid ${props => props.$primary ? '#6200ee' : props.$copied ? '#2e7d32' : '#ddd'};
  background: ${props => props.$primary ? '#6200ee' : props.$copied ? '#e8f5e9' : 'white'};
  color: ${props => props.$primary ? 'white' : props.$copied ? '#2e7d32' : '#666'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$primary ? '#5000d0' : '#6200ee'};
    background: ${props => props.$primary ? '#5000d0' : props.$copied ? '#e8f5e9' : '#f3e5f5'};
    color: ${props => props.$primary ? 'white' : props.$copied ? '#2e7d32' : '#6200ee'};
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const OutputBox = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  max-height: 400px;
  overflow-y: auto;
`;

const Paragraph = styled.p`
  margin: 0 0 16px 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    color: #6200ee;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

type OutputType = 'paragraphs' | 'sentences' | 'words';

// Classic Lorem Ipsum text
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
  'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
  'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
  'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate', 'provident',
  'similique', 'mollitia', 'animi', 'quasi', 'architecto', 'beatae', 'vitae',
  'dicta', 'explicabo', 'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas',
  'aspernatur', 'aut', 'odit', 'fugit', 'consequuntur', 'magni', 'dolorem',
  'porro', 'quisquam', 'minus', 'quod', 'ratione', 'sequi', 'nesciunt', 'neque',
  'corporis', 'suscipit', 'laboriosam', 'perspiciatis', 'unde', 'omnis', 'iste',
  'natus', 'error', 'inventore', 'veritatis', 'aperiam', 'eaque', 'ipsa', 'quae',
  'ab', 'illo', 'totam', 'rem', 'tenetur', 'sapiente', 'delectus', 'reiciendis',
  'maiores', 'alias', 'perferendis', 'doloribus', 'asperiores', 'repellat',
];

const FIRST_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

function getRandomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(wordCount?: number): string {
  const count = wordCount || Math.floor(Math.random() * 10) + 5; // 5-14 words
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    words.push(getRandomWord());
  }

  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(' ') + '.';
}

function generateParagraph(sentenceCount?: number): string {
  const count = sentenceCount || Math.floor(Math.random() * 4) + 3; // 3-6 sentences
  const sentences: string[] = [];

  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }

  return sentences.join(' ');
}

function generateWords(count: number): string {
  const words: string[] = [];

  for (let i = 0; i < count; i++) {
    words.push(getRandomWord());
  }

  return words.join(' ');
}

export const LoremIpsumTool: React.FC = () => {
  const [outputType, setOutputType] = useState<OutputType>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const output = useMemo(() => {
    const results: string[] = [];

    if (outputType === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          results.push(FIRST_SENTENCE + ' ' + generateParagraph(4));
        } else {
          results.push(generateParagraph());
        }
      }
    } else if (outputType === 'sentences') {
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          results.push(FIRST_SENTENCE);
        } else {
          results.push(generateSentence());
        }
      }
    } else {
      if (startWithLorem) {
        const loremStart = 'Lorem ipsum dolor sit amet ';
        const remaining = count - 5;
        if (remaining > 0) {
          results.push(loremStart + generateWords(remaining));
        } else {
          results.push(generateWords(count));
        }
      } else {
        results.push(generateWords(count));
      }
    }

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputType, count, startWithLorem, regenerateKey]);

  const plainText = useMemo(() => {
    if (outputType === 'words') {
      return output.join(' ');
    }
    return output.join('\n\n');
  }, [output, outputType]);

  const stats = useMemo(() => {
    const text = plainText;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return { words: words.length, chars, sentences: sentences.length };
  }, [plainText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = plainText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [plainText]);

  const handleRegenerate = useCallback(() => {
    setRegenerateKey(k => k + 1);
    setCopied(false);
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">menu_book</span>
          Lorem Ipsum Generator
        </Title>
        <Description>
          Generate placeholder text for your designs and mockups.
        </Description>
      </div>

      <Card>
        <OptionsRow>
          <OptionGroup>
            <Label>Generate</Label>
            <Select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value as OutputType)}
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </Select>
          </OptionGroup>

          <OptionGroup>
            <Label>Count</Label>
            <NumberInput
              type="number"
              min={1}
              max={outputType === 'words' ? 1000 : 50}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </OptionGroup>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
            />
            Start with "Lorem ipsum..."
          </CheckboxLabel>

          <ActionButton $primary onClick={handleRegenerate}>
            <span className="material-symbols-outlined">restart_alt</span>
            Regenerate
          </ActionButton>
        </OptionsRow>
      </Card>

      <StatsRow>
        <Stat><strong>{stats.words}</strong> words</Stat>
        <Stat><strong>{stats.chars}</strong> characters</Stat>
        <Stat><strong>{stats.sentences}</strong> sentences</Stat>
      </StatsRow>

      <OutputBox>
        {outputType === 'words' ? (
          <Paragraph>{output.join(' ')}</Paragraph>
        ) : (
          output.map((text, idx) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))
        )}
      </OutputBox>

      <ActionBar>
        <ActionButton $copied={copied} onClick={handleCopy}>
          <span className="material-symbols-outlined">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </ActionButton>
      </ActionBar>
    </Container>
  );
};
