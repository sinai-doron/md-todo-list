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

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 18px;
  box-sizing: border-box;
  text-align: center;
  letter-spacing: 2px;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const CronVisual = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CronField = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.$active ? '#ede7f6' : '#f8f9fa'};
  border: 2px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  min-width: 80px;
  transition: all 0.2s;
`;

const FieldValue = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 20px;
  font-weight: 600;
  color: #6200ee;
`;

const FieldLabel = styled.div`
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultBox = styled.div<{ $error?: boolean }>`
  background: ${props => props.$error ? '#ffebee' : '#e8f5e9'};
  border: 1px solid ${props => props.$error ? '#ffcdd2' : '#c8e6c9'};
  border-radius: 8px;
  padding: 16px;
`;

const ResultText = styled.div<{ $error?: boolean }>`
  font-size: 16px;
  color: ${props => props.$error ? '#c62828' : '#2e7d32'};
  line-height: 1.5;
`;

const NextRunsSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
`;

const NextRunsTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  font-size: 14px;
`;

const NextRunsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NextRunItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  font-size: 14px;

  .number {
    width: 24px;
    height: 24px;
    background: #6200ee;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
  }

  .date {
    flex: 1;
    font-family: monospace;
    color: #333;
  }

  .relative {
    color: #666;
    font-size: 12px;
  }
`;

const PresetsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

const PresetButton = styled.button`
  padding: 10px 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ede7f6;
    border-color: #6200ee;
  }

  .name {
    font-size: 13px;
    color: #333;
    font-weight: 500;
  }

  .cron {
    font-family: monospace;
    font-size: 12px;
    color: #6200ee;
    margin-top: 4px;
  }
`;

const ReferenceTable = styled.div`
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ReferenceHeader = styled.div`
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

const ReferenceContent = styled.div<{ $expanded: boolean }>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  padding: 16px;
`;

const RefTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 8px 12px;
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

  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #6200ee;
  }
`;

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const presets = [
  { name: 'Every minute', cron: '* * * * *' },
  { name: 'Every hour', cron: '0 * * * *' },
  { name: 'Every day at midnight', cron: '0 0 * * *' },
  { name: 'Every day at noon', cron: '0 12 * * *' },
  { name: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { name: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { name: 'Every Sunday at midnight', cron: '0 0 * * 0' },
  { name: 'First day of month at midnight', cron: '0 0 1 * *' },
  { name: 'Every 15 minutes', cron: '*/15 * * * *' },
  { name: 'Every 6 hours', cron: '0 */6 * * *' },
  { name: 'Twice a day (9 AM & 6 PM)', cron: '0 9,18 * * *' },
  { name: 'Every quarter (Jan, Apr, Jul, Oct)', cron: '0 0 1 1,4,7,10 *' },
];

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseCronExpression = (cron: string): { parts: CronParts | null; error: string | null } => {
  const trimmed = cron.trim();
  const fields = trimmed.split(/\s+/);

  if (fields.length !== 5) {
    return { parts: null, error: `Expected 5 fields, got ${fields.length}` };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

  // Basic validation
  const validateField = (value: string, min: number, max: number, name: string): string | null => {
    if (value === '*') return null;
    if (value.includes('/')) {
      const [range, step] = value.split('/');
      if (range !== '*' && isNaN(Number(range))) return `Invalid ${name}: ${value}`;
      if (isNaN(Number(step)) || Number(step) < 1) return `Invalid step in ${name}: ${value}`;
      return null;
    }
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      if (isNaN(start) || isNaN(end)) return `Invalid range in ${name}: ${value}`;
      if (start < min || end > max) return `${name} out of range: ${value}`;
      return null;
    }
    if (value.includes(',')) {
      const values = value.split(',').map(Number);
      for (const v of values) {
        if (isNaN(v) || v < min || v > max) return `Invalid value in ${name}: ${v}`;
      }
      return null;
    }
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) return `${name} out of range (${min}-${max}): ${value}`;
    return null;
  };

  const errors = [
    validateField(minute, 0, 59, 'Minute'),
    validateField(hour, 0, 23, 'Hour'),
    validateField(dayOfMonth, 1, 31, 'Day of month'),
    validateField(month, 1, 12, 'Month'),
    validateField(dayOfWeek, 0, 7, 'Day of week'),
  ].filter(Boolean);

  if (errors.length > 0) {
    return { parts: null, error: errors[0] };
  }

  return {
    parts: { minute, hour, dayOfMonth, month, dayOfWeek },
    error: null,
  };
};

const describeField = (value: string, type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'): string => {
  if (value === '*') {
    return type === 'minute' ? 'every minute' :
           type === 'hour' ? 'every hour' :
           type === 'dayOfMonth' ? 'every day' :
           type === 'month' ? 'every month' :
           'every day of the week';
  }

  if (value.includes('/')) {
    const [, step] = value.split('/');
    return type === 'minute' ? `every ${step} minutes` :
           type === 'hour' ? `every ${step} hours` :
           type === 'dayOfMonth' ? `every ${step} days` :
           type === 'month' ? `every ${step} months` :
           `every ${step} days`;
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-');
    if (type === 'dayOfWeek') {
      return `${dayNames[Number(start)]} through ${dayNames[Number(end)]}`;
    }
    if (type === 'month') {
      return `${monthNames[Number(start)]} through ${monthNames[Number(end)]}`;
    }
    return `${start} through ${end}`;
  }

  if (value.includes(',')) {
    const values = value.split(',');
    if (type === 'dayOfWeek') {
      return values.map(v => dayNames[Number(v)]).join(', ');
    }
    if (type === 'month') {
      return values.map(v => monthNames[Number(v)]).join(', ');
    }
    return values.join(', ');
  }

  if (type === 'dayOfWeek') {
    const num = Number(value);
    return dayNames[num === 7 ? 0 : num];
  }
  if (type === 'month') {
    return monthNames[Number(value)];
  }

  return value;
};

const describeCron = (parts: CronParts): string => {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parts;

  let description = 'Runs ';

  // Time
  if (minute === '*' && hour === '*') {
    description += 'every minute';
  } else if (minute === '0' && hour === '*') {
    description += 'every hour';
  } else if (minute.includes('/')) {
    description += describeField(minute, 'minute');
  } else if (hour === '*') {
    description += `at minute ${minute} of every hour`;
  } else if (minute === '0') {
    description += `at ${describeField(hour, 'hour').replace('every ', '')}:00`;
  } else {
    description += `at ${hour}:${minute.padStart(2, '0')}`;
  }

  // Day of week
  if (dayOfWeek !== '*') {
    description += ` on ${describeField(dayOfWeek, 'dayOfWeek')}`;
  }

  // Day of month
  if (dayOfMonth !== '*') {
    description += ` on day ${dayOfMonth} of the month`;
  }

  // Month
  if (month !== '*') {
    description += ` in ${describeField(month, 'month')}`;
  }

  return description;
};

const getNextRuns = (parts: CronParts, count: number = 5): Date[] => {
  const runs: Date[] = [];
  const now = new Date();
  let current = new Date(now);
  current.setSeconds(0);
  current.setMilliseconds(0);

  const matchesField = (value: number, field: string): boolean => {
    if (field === '*') return true;
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const stepNum = Number(step);
      if (range === '*') return value % stepNum === 0;
      return value >= Number(range) && value % stepNum === 0;
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }
    if (field.includes(',')) {
      return field.split(',').map(Number).includes(value);
    }
    return value === Number(field);
  };

  let iterations = 0;
  const maxIterations = 525600; // One year of minutes

  while (runs.length < count && iterations < maxIterations) {
    current = new Date(current.getTime() + 60000); // Add 1 minute
    iterations++;

    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    let dayOfWeek = current.getDay();

    if (
      matchesField(minute, parts.minute) &&
      matchesField(hour, parts.hour) &&
      matchesField(dayOfMonth, parts.dayOfMonth) &&
      matchesField(month, parts.month) &&
      (matchesField(dayOfWeek, parts.dayOfWeek) ||
       (parts.dayOfWeek.includes('7') && dayOfWeek === 0))
    ) {
      runs.push(new Date(current));
    }
  }

  return runs;
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  if (hours < 24) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  return `in ${days} day${days !== 1 ? 's' : ''}`;
};

export const CronParserTool: React.FC = () => {
  const [cron, setCron] = useState('0 9 * * 1-5');
  const [showReference, setShowReference] = useState(false);

  const { parts, error } = useMemo(() => parseCronExpression(cron), [cron]);
  const description = useMemo(() => parts ? describeCron(parts) : '', [parts]);
  const nextRuns = useMemo(() => parts ? getNextRuns(parts) : [], [parts]);

  const cronFields = cron.trim().split(/\s+/);

  return (
    <Container>
      <div>
        <Title>Cron Expression Parser</Title>
        <Description>
          Parse and explain cron expressions, see upcoming execution times
        </Description>
      </div>

      <Section>
        <Label>Cron Expression (5 fields: minute hour day month weekday)</Label>
        <Input
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="* * * * *"
        />
      </Section>

      <CronVisual>
        {['Minute', 'Hour', 'Day', 'Month', 'Weekday'].map((label, i) => (
          <CronField key={label} $active={cronFields[i] !== '*'}>
            <FieldValue>{cronFields[i] || '*'}</FieldValue>
            <FieldLabel>{label}</FieldLabel>
          </CronField>
        ))}
      </CronVisual>

      <ResultBox $error={!!error}>
        <ResultText $error={!!error}>
          {error ? `Error: ${error}` : description}
        </ResultText>
      </ResultBox>

      {nextRuns.length > 0 && (
        <NextRunsSection>
          <NextRunsTitle>Next 5 Executions</NextRunsTitle>
          <NextRunsList>
            {nextRuns.map((date, i) => (
              <NextRunItem key={i}>
                <span className="number">{i + 1}</span>
                <span className="date">{date.toLocaleString()}</span>
                <span className="relative">{formatRelativeTime(date)}</span>
              </NextRunItem>
            ))}
          </NextRunsList>
        </NextRunsSection>
      )}

      <PresetsSection>
        <Label>Common Presets</Label>
        <PresetsGrid>
          {presets.map((preset) => (
            <PresetButton key={preset.cron} onClick={() => setCron(preset.cron)}>
              <div className="name">{preset.name}</div>
              <div className="cron">{preset.cron}</div>
            </PresetButton>
          ))}
        </PresetsGrid>
      </PresetsSection>

      <ReferenceTable>
        <ReferenceHeader onClick={() => setShowReference(!showReference)}>
          <span>Cron Syntax Reference</span>
          <span className="material-symbols-outlined">
            {showReference ? 'expand_less' : 'expand_more'}
          </span>
        </ReferenceHeader>
        <ReferenceContent $expanded={showReference}>
          <RefTable>
            <thead>
              <tr>
                <th>Field</th>
                <th>Values</th>
                <th>Special Characters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Minute</td>
                <td>0-59</td>
                <td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
              </tr>
              <tr>
                <td>Hour</td>
                <td>0-23</td>
                <td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
              </tr>
              <tr>
                <td>Day of Month</td>
                <td>1-31</td>
                <td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
              </tr>
              <tr>
                <td>Month</td>
                <td>1-12</td>
                <td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
              </tr>
              <tr>
                <td>Day of Week</td>
                <td>0-7 (0 and 7 = Sunday)</td>
                <td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
              </tr>
            </tbody>
          </RefTable>
          <div style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
            <p><code>*</code> - Any value</p>
            <p><code>,</code> - List of values (e.g., 1,3,5)</p>
            <p><code>-</code> - Range of values (e.g., 1-5)</p>
            <p><code>/</code> - Step values (e.g., */15 = every 15)</p>
          </div>
        </ReferenceContent>
      </ReferenceTable>
    </Container>
  );
};
