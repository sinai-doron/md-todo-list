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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e0e0e0;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #6200ee;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReadingTimeCard = styled.div`
  background: linear-gradient(135deg, #6200ee 0%, #9c27b0 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;

  .material-symbols-outlined {
    font-size: 40px;
    opacity: 0.9;
  }
`;

const ReadingTimeContent = styled.div`
  flex: 1;
`;

const ReadingTimeValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ReadingTimeLabel = styled.div`
  font-size: 13px;
  opacity: 0.9;
`;

const DetailsSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e0e0e0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #666;
`;

const DetailValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const TopWordsSection = styled.div`
  margin-top: 8px;
`;

const TopWordsTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
`;

const TopWordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const WordBadge = styled.span`
  background: white;
  border: 1px solid #e0e0e0;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  color: #333;

  span {
    color: #6200ee;
    font-weight: 500;
    margin-left: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
  color: #333;

  &:hover {
    background: #e0e0e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  avgWordLength: number;
  avgSentenceLength: number;
  topWords: { word: string; count: number }[];
}

const analyzeText = (text: string): TextStats => {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Words: split by whitespace and filter empty
  const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  // Sentences: split by sentence-ending punctuation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Paragraphs: split by double newlines or more
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = text.trim() ? Math.max(paragraphs.length, 1) : 0;

  // Lines
  const lines = text.split('\n');
  const lineCount = text.trim() ? lines.length : 0;

  // Reading time (average 200 words per minute)
  const readingTimeMinutes = wordCount / 200;

  // Speaking time (average 150 words per minute)
  const speakingTimeMinutes = wordCount / 150;

  // Average word length
  const totalWordLength = words.reduce((sum, word) => sum + word.replace(/[^\w]/g, '').length, 0);
  const avgWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;

  // Average sentence length
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Top words (excluding common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'we', 'they', 'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'as', 'if', 'then', 'because', 'while', 'although', 'though'
  ]);

  const wordFrequency: { [key: string]: number } = {};
  words.forEach(word => {
    const normalized = word.toLowerCase().replace(/[^\w]/g, '');
    if (normalized.length > 2 && !stopWords.has(normalized)) {
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    }
  });

  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    characters,
    charactersNoSpaces,
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    lines: lineCount,
    readingTimeMinutes,
    speakingTimeMinutes,
    avgWordLength,
    avgSentenceLength,
    topWords,
  };
};

const formatTime = (minutes: number): string => {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return seconds === 0 ? '0 sec' : `${seconds} sec`;
  }
  if (minutes < 60) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
};

export const WordCounterTool: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleClear = () => {
    setText('');
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  return (
    <Container>
      <div>
        <Title>Word & Character Counter</Title>
        <Description>
          Analyze text for word count, character count, reading time, and more
        </Description>
      </div>

      <Section>
        <Label>Enter or paste your text</Label>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here to analyze..."
        />
        <ButtonGroup>
          <Button onClick={handlePaste}>Paste from Clipboard</Button>
          <Button onClick={handleClear} disabled={!text}>Clear</Button>
        </ButtonGroup>
      </Section>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.words.toLocaleString()}</StatValue>
          <StatLabel>Words</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.characters.toLocaleString()}</StatValue>
          <StatLabel>Characters</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.charactersNoSpaces.toLocaleString()}</StatValue>
          <StatLabel>Characters (no spaces)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.sentences}</StatValue>
          <StatLabel>Sentences</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.paragraphs}</StatValue>
          <StatLabel>Paragraphs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.lines}</StatValue>
          <StatLabel>Lines</StatLabel>
        </StatCard>
      </StatsGrid>

      <ReadingTimeCard>
        <span className="material-symbols-outlined">schedule</span>
        <ReadingTimeContent>
          <ReadingTimeValue>{formatTime(stats.readingTimeMinutes)}</ReadingTimeValue>
          <ReadingTimeLabel>Estimated reading time (200 wpm)</ReadingTimeLabel>
        </ReadingTimeContent>
      </ReadingTimeCard>

      <DetailsSection>
        <DetailRow>
          <DetailLabel>Speaking Time (150 wpm)</DetailLabel>
          <DetailValue>{formatTime(stats.speakingTimeMinutes)}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Average Word Length</DetailLabel>
          <DetailValue>{stats.avgWordLength.toFixed(1)} characters</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Average Sentence Length</DetailLabel>
          <DetailValue>{stats.avgSentenceLength.toFixed(1)} words</DetailValue>
        </DetailRow>

        {stats.topWords.length > 0 && (
          <TopWordsSection>
            <TopWordsTitle>Most Used Words</TopWordsTitle>
            <TopWordsList>
              {stats.topWords.map(({ word, count }) => (
                <WordBadge key={word}>
                  {word}<span>×{count}</span>
                </WordBadge>
              ))}
            </TopWordsList>
          </TopWordsSection>
        )}
      </DetailsSection>
    </Container>
  );
};
