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

const PasswordDisplay = styled.div`
  background: linear-gradient(135deg, #6200ee 0%, #9c27b0 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
`;

const PasswordValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: 600;
  word-break: break-all;
  margin-bottom: 16px;
  letter-spacing: 1px;
`;

const PasswordActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PasswordButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: ${props => props.$copied ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
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
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const OptionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;

  small {
    color: #999;
    font-size: 12px;
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: ${props => props.$active ? '#6200ee' : '#ccc'};
  cursor: pointer;
  position: relative;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '25px' : '3px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
`;

const SliderLabel = styled.span`
  font-size: 14px;
  color: #333;
  min-width: 80px;
`;

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6200ee;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6200ee;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SliderValue = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #6200ee;
  min-width: 30px;
  text-align: center;
`;

const StrengthBar = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const StrengthSegment = styled.div<{ $filled: boolean; $color: string }>`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.$filled ? props.$color : '#e0e0e0'};
  transition: background 0.2s;
`;

const StrengthLabel = styled.div<{ $color: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color};
  margin-top: 8px;
  text-align: center;
`;

const HistorySection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const HistoryTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
`;

const HistoryCopyButton = styled.button`
  display: flex;
  align-items: center;
  padding: 4px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #6200ee;
  }

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function generatePassword(options: PasswordOptions): string {
  let chars = '';

  if (options.lowercase) chars += LOWERCASE;
  if (options.uppercase) chars += UPPERCASE;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;

  if (options.excludeAmbiguous) {
    chars = chars.replace(/[0OIl1|]/g, '');
  }

  if (!chars) return '';

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

function calculateStrength(password: string, options: PasswordOptions): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'None', color: '#999' };

  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Character type scoring
  const types = [options.lowercase, options.uppercase, options.numbers, options.symbols].filter(Boolean).length;
  score += types;

  // Normalize to 0-4
  score = Math.min(4, Math.floor(score / 2));

  const levels = [
    { score: 0, label: 'Very Weak', color: '#d32f2f' },
    { score: 1, label: 'Weak', color: '#f57c00' },
    { score: 2, label: 'Fair', color: '#fbc02d' },
    { score: 3, label: 'Strong', color: '#388e3c' },
    { score: 4, label: 'Very Strong', color: '#1976d2' },
  ];

  return levels[score] || levels[0];
}

export const PasswordGeneratorTool: React.FC = () => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState(() => generatePassword({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
  }));
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const strength = useMemo(() => calculateStrength(password, options), [password, options]);

  const handleGenerate = useCallback(() => {
    const newPassword = generatePassword(options);
    if (password && !history.includes(password)) {
      setHistory(prev => [password, ...prev].slice(0, 5));
    }
    setPassword(newPassword);
    setCopied(false);
  }, [options, password, history]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleOptionChange = useCallback((key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      setPassword(generatePassword(newOptions));
      return newOptions;
    });
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">lock</span>
          Password Generator
        </Title>
        <Description>
          Generate secure, random passwords with customizable options.
        </Description>
      </div>

      <PasswordDisplay>
        <PasswordValue>{password || 'Select at least one character type'}</PasswordValue>
        <PasswordActions>
          <PasswordButton onClick={handleGenerate}>
            <span className="material-symbols-outlined">restart_alt</span>
            Generate
          </PasswordButton>
          <PasswordButton $copied={copied} onClick={() => handleCopy(password)} disabled={!password}>
            <span className="material-symbols-outlined">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy'}
          </PasswordButton>
        </PasswordActions>

        <StrengthBar>
          {[0, 1, 2, 3, 4].map(i => (
            <StrengthSegment
              key={i}
              $filled={i < strength.score + 1}
              $color={strength.color}
            />
          ))}
        </StrengthBar>
        <StrengthLabel $color={strength.color}>{strength.label}</StrengthLabel>
      </PasswordDisplay>

      <Card>
        <CardTitle>Options</CardTitle>

        <SliderRow>
          <SliderLabel>Length</SliderLabel>
          <Slider
            type="range"
            min="4"
            max="64"
            value={options.length}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
          />
          <SliderValue>{options.length}</SliderValue>
        </SliderRow>

        <OptionRow>
          <OptionLabel>
            Lowercase
            <small>(a-z)</small>
          </OptionLabel>
          <Toggle
            $active={options.lowercase}
            onClick={() => handleOptionChange('lowercase', !options.lowercase)}
          />
        </OptionRow>

        <OptionRow>
          <OptionLabel>
            Uppercase
            <small>(A-Z)</small>
          </OptionLabel>
          <Toggle
            $active={options.uppercase}
            onClick={() => handleOptionChange('uppercase', !options.uppercase)}
          />
        </OptionRow>

        <OptionRow>
          <OptionLabel>
            Numbers
            <small>(0-9)</small>
          </OptionLabel>
          <Toggle
            $active={options.numbers}
            onClick={() => handleOptionChange('numbers', !options.numbers)}
          />
        </OptionRow>

        <OptionRow>
          <OptionLabel>
            Symbols
            <small>(!@#$%...)</small>
          </OptionLabel>
          <Toggle
            $active={options.symbols}
            onClick={() => handleOptionChange('symbols', !options.symbols)}
          />
        </OptionRow>

        <OptionRow>
          <OptionLabel>
            Exclude Ambiguous
            <small>(0, O, I, l, 1, |)</small>
          </OptionLabel>
          <Toggle
            $active={options.excludeAmbiguous}
            onClick={() => handleOptionChange('excludeAmbiguous', !options.excludeAmbiguous)}
          />
        </OptionRow>

        {history.length > 0 && (
          <HistorySection>
            <HistoryTitle>Recent Passwords</HistoryTitle>
            <HistoryList>
              {history.map((pw, idx) => (
                <HistoryItem key={idx}>
                  <span>{pw}</span>
                  <HistoryCopyButton onClick={() => handleCopy(pw)}>
                    <span className="material-symbols-outlined">content_copy</span>
                  </HistoryCopyButton>
                </HistoryItem>
              ))}
            </HistoryList>
          </HistorySection>
        )}
      </Card>
    </Container>
  );
};
