import React, { useState, useEffect, useCallback } from 'react';
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

const CurrentTimeCard = styled.div`
  background: linear-gradient(135deg, #6200ee 0%, #9c27b0 100%);
  border-radius: 12px;
  padding: 20px 24px;
  color: white;
`;

const CurrentTimeLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CurrentTimeValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CurrentTimeDate = styled.div`
  font-size: 14px;
  opacity: 0.9;
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

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
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

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: 1px solid ${props => props.$primary ? '#6200ee' : '#ddd'};
  background: ${props => props.$primary ? '#6200ee' : 'white'};
  color: ${props => props.$primary ? 'white' : '#666'};
  border-radius: 8px;
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

const ResultBox = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const ResultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  font-size: 13px;
  color: #666;
`;

const ResultValue = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  font-weight: 500;
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
  margin-left: 8px;

  &:hover {
    border-color: ${props => props.$copied ? '#2e7d32' : '#6200ee'};
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 13px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

type TimestampUnit = 'seconds' | 'milliseconds';

export const TimestampConverterTool: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timestampInput, setTimestampInput] = useState('');
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('seconds');
  const [dateInput, setDateInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert timestamp to date
  const timestampToDate = useCallback(() => {
    if (!timestampInput.trim()) return null;

    const num = parseInt(timestampInput);
    if (isNaN(num)) return { error: 'Invalid timestamp' };

    const ms = timestampUnit === 'seconds' ? num * 1000 : num;
    const date = new Date(ms);

    if (isNaN(date.getTime())) return { error: 'Invalid timestamp' };

    return {
      date,
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative: getRelativeTime(date),
    };
  }, [timestampInput, timestampUnit]);

  // Convert date to timestamp
  const dateToTimestamp = useCallback(() => {
    if (!dateInput.trim()) return null;

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return { error: 'Invalid date format' };

    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    };
  }, [dateInput]);

  const timestampResult = timestampToDate();
  const dateResult = dateToTimestamp();

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

  const handleUseCurrentTime = useCallback(() => {
    const ts = timestampUnit === 'seconds'
      ? Math.floor(Date.now() / 1000).toString()
      : Date.now().toString();
    setTimestampInput(ts);
  }, [timestampUnit]);

  const handleUseCurrentDate = useCallback(() => {
    setDateInput(new Date().toISOString().slice(0, 16));
  }, []);

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">schedule</span>
          Timestamp Converter
        </Title>
        <Description>
          Convert between Unix timestamps and human-readable dates.
        </Description>
      </div>

      <CurrentTimeCard>
        <CurrentTimeLabel>Current Unix Timestamp</CurrentTimeLabel>
        <CurrentTimeValue>{Math.floor(currentTime / 1000)}</CurrentTimeValue>
        <CurrentTimeDate>{new Date(currentTime).toLocaleString()}</CurrentTimeDate>
      </CurrentTimeCard>

      <Card>
        <CardTitle>
          <span className="material-symbols-outlined">arrow_forward</span>
          Timestamp to Date
        </CardTitle>

        <InputRow>
          <InputGroup>
            <Label>Unix Timestamp</Label>
            <Input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="e.g., 1704067200"
            />
          </InputGroup>
          <InputGroup style={{ flex: '0 0 auto', minWidth: 'auto' }}>
            <Label>Unit</Label>
            <Select
              value={timestampUnit}
              onChange={(e) => setTimestampUnit(e.target.value as TimestampUnit)}
            >
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
            </Select>
          </InputGroup>
          <ActionButton onClick={handleUseCurrentTime}>
            <span className="material-symbols-outlined">schedule</span>
            Now
          </ActionButton>
        </InputRow>

        {timestampResult && !('error' in timestampResult) && (
          <ResultBox>
            <ResultRow>
              <ResultLabel>ISO 8601</ResultLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResultValue>{timestampResult.iso}</ResultValue>
                <CopyButton
                  $copied={copiedField === 'iso'}
                  onClick={() => handleCopy(timestampResult.iso, 'iso')}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === 'iso' ? 'check' : 'content_copy'}
                  </span>
                </CopyButton>
              </div>
            </ResultRow>
            <ResultRow>
              <ResultLabel>UTC</ResultLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResultValue>{timestampResult.utc}</ResultValue>
                <CopyButton
                  $copied={copiedField === 'utc'}
                  onClick={() => handleCopy(timestampResult.utc, 'utc')}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === 'utc' ? 'check' : 'content_copy'}
                  </span>
                </CopyButton>
              </div>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Local</ResultLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResultValue>{timestampResult.local}</ResultValue>
                <CopyButton
                  $copied={copiedField === 'local'}
                  onClick={() => handleCopy(timestampResult.local, 'local')}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === 'local' ? 'check' : 'content_copy'}
                  </span>
                </CopyButton>
              </div>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Relative</ResultLabel>
              <ResultValue>{timestampResult.relative}</ResultValue>
            </ResultRow>
          </ResultBox>
        )}

        {timestampResult && 'error' in timestampResult && (
          <ErrorMessage>
            <span className="material-symbols-outlined">error</span>
            {timestampResult.error}
          </ErrorMessage>
        )}
      </Card>

      <Card>
        <CardTitle>
          <span className="material-symbols-outlined">arrow_back</span>
          Date to Timestamp
        </CardTitle>

        <InputRow>
          <InputGroup>
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </InputGroup>
          <ActionButton onClick={handleUseCurrentDate}>
            <span className="material-symbols-outlined">today</span>
            Now
          </ActionButton>
        </InputRow>

        {dateResult && !('error' in dateResult) && (
          <ResultBox>
            <ResultRow>
              <ResultLabel>Seconds</ResultLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResultValue>{dateResult.seconds}</ResultValue>
                <CopyButton
                  $copied={copiedField === 'seconds'}
                  onClick={() => handleCopy(dateResult.seconds.toString(), 'seconds')}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === 'seconds' ? 'check' : 'content_copy'}
                  </span>
                </CopyButton>
              </div>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Milliseconds</ResultLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ResultValue>{dateResult.milliseconds}</ResultValue>
                <CopyButton
                  $copied={copiedField === 'ms'}
                  onClick={() => handleCopy(dateResult.milliseconds.toString(), 'ms')}
                >
                  <span className="material-symbols-outlined">
                    {copiedField === 'ms' ? 'check' : 'content_copy'}
                  </span>
                </CopyButton>
              </div>
            </ResultRow>
          </ResultBox>
        )}

        {dateResult && 'error' in dateResult && (
          <ErrorMessage>
            <span className="material-symbols-outlined">error</span>
            {dateResult.error}
          </ErrorMessage>
        )}
      </Card>
    </Container>
  );
};

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const isFuture = diffMs < 0;
  const abs = Math.abs;

  if (abs(diffSec) < 60) return isFuture ? 'in a few seconds' : 'just now';
  if (abs(diffMin) < 60) return isFuture ? `in ${abs(diffMin)} minute${abs(diffMin) > 1 ? 's' : ''}` : `${abs(diffMin)} minute${abs(diffMin) > 1 ? 's' : ''} ago`;
  if (abs(diffHour) < 24) return isFuture ? `in ${abs(diffHour)} hour${abs(diffHour) > 1 ? 's' : ''}` : `${abs(diffHour)} hour${abs(diffHour) > 1 ? 's' : ''} ago`;
  if (abs(diffDay) < 7) return isFuture ? `in ${abs(diffDay)} day${abs(diffDay) > 1 ? 's' : ''}` : `${abs(diffDay)} day${abs(diffDay) > 1 ? 's' : ''} ago`;
  if (abs(diffWeek) < 4) return isFuture ? `in ${abs(diffWeek)} week${abs(diffWeek) > 1 ? 's' : ''}` : `${abs(diffWeek)} week${abs(diffWeek) > 1 ? 's' : ''} ago`;
  if (abs(diffMonth) < 12) return isFuture ? `in ${abs(diffMonth)} month${abs(diffMonth) > 1 ? 's' : ''}` : `${abs(diffMonth)} month${abs(diffMonth) > 1 ? 's' : ''} ago`;
  return isFuture ? `in ${abs(diffYear)} year${abs(diffYear) > 1 ? 's' : ''}` : `${abs(diffYear)} year${abs(diffYear) > 1 ? 's' : ''} ago`;
}
