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

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 14px;
  border: 1px solid ${props => props.$error ? '#f44336' : '#ddd'};
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#f44336' : '#6200ee'};
  }
`;

const ErrorMessage = styled.div`
  color: #c62828;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
`;

const ResultCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const ResultValue = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
`;

const BinaryDisplay = styled.div`
  background: #1a1a2e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
`;

const BinaryRow = styled.div`
  display: flex;
  gap: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BinaryLabel = styled.span`
  color: #888;
  min-width: 80px;
`;

const BinaryValue = styled.span`
  color: #00ff88;
`;

const OctetGroup = styled.span`
  margin-right: 8px;
`;

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$type) {
      case 'private': return '#e3f2fd';
      case 'public': return '#e8f5e9';
      case 'loopback': return '#fff3e0';
      case 'link-local': return '#fce4ec';
      case 'multicast': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'private': return '#1565c0';
      case 'public': return '#2e7d32';
      case 'loopback': return '#e65100';
      case 'link-local': return '#c2185b';
      case 'multicast': return '#7b1fa2';
      default: return '#666';
    }
  }};
`;

const ClassBadge = styled.span<{ $class: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #ede7f6;
  color: #6200ee;
`;

const SubnetSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
`;

const SubnetTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SubnetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const SubnetItem = styled.div`
  font-size: 13px;

  .label {
    color: #666;
    margin-bottom: 4px;
  }

  .value {
    font-family: monospace;
    color: #333;
    font-weight: 500;
  }
`;

const ExamplesSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExampleButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
  }
`;

interface IPInfo {
  valid: boolean;
  version: 4 | 6 | null;
  octets: number[];
  binary: string;
  hex: string;
  decimal: number;
  type: 'private' | 'public' | 'loopback' | 'link-local' | 'multicast' | 'broadcast' | 'reserved';
  class: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  cidr?: number;
  networkAddress?: string;
  broadcastAddress?: string;
  subnetMask?: string;
  wildcardMask?: string;
  usableHosts?: number;
  firstHost?: string;
  lastHost?: string;
}

const parseIPv4 = (ip: string): IPInfo | null => {
  // Check for CIDR notation
  let cidr: number | undefined;
  let ipPart = ip;

  if (ip.includes('/')) {
    const parts = ip.split('/');
    ipPart = parts[0];
    cidr = parseInt(parts[1], 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return null;
    }
  }

  const parts = ipPart.split('.');
  if (parts.length !== 4) return null;

  const octets = parts.map(p => {
    const num = parseInt(p, 10);
    if (isNaN(num) || num < 0 || num > 255 || p !== num.toString()) {
      return -1;
    }
    return num;
  });

  if (octets.some(o => o === -1)) return null;

  const [a, b, c, d] = octets;

  // Calculate binary representation
  const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('.');

  // Calculate hex representation
  const hex = octets.map(o => o.toString(16).padStart(2, '0')).join(':');

  // Calculate decimal representation
  const decimal = (a << 24) + (b << 16) + (c << 8) + d;

  // Determine IP type
  let type: IPInfo['type'] = 'public';
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
    type = 'private';
  } else if (a === 127) {
    type = 'loopback';
  } else if (a === 169 && b === 254) {
    type = 'link-local';
  } else if (a >= 224 && a <= 239) {
    type = 'multicast';
  } else if (a === 255 && b === 255 && c === 255 && d === 255) {
    type = 'broadcast';
  } else if (a === 0 || a >= 240) {
    type = 'reserved';
  }

  // Determine class
  let ipClass: IPInfo['class'] = null;
  if (a <= 127) ipClass = 'A';
  else if (a <= 191) ipClass = 'B';
  else if (a <= 223) ipClass = 'C';
  else if (a <= 239) ipClass = 'D';
  else ipClass = 'E';

  const result: IPInfo = {
    valid: true,
    version: 4,
    octets,
    binary,
    hex,
    decimal: decimal >>> 0, // Convert to unsigned
    type,
    class: ipClass,
  };

  // Calculate subnet info if CIDR is provided
  if (cidr !== undefined) {
    result.cidr = cidr;

    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const network = (decimal & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;

    result.subnetMask = [
      (mask >>> 24) & 255,
      (mask >>> 16) & 255,
      (mask >>> 8) & 255,
      mask & 255,
    ].join('.');

    result.wildcardMask = [
      255 - ((mask >>> 24) & 255),
      255 - ((mask >>> 16) & 255),
      255 - ((mask >>> 8) & 255),
      255 - (mask & 255),
    ].join('.');

    result.networkAddress = [
      (network >>> 24) & 255,
      (network >>> 16) & 255,
      (network >>> 8) & 255,
      network & 255,
    ].join('.');

    result.broadcastAddress = [
      (broadcast >>> 24) & 255,
      (broadcast >>> 16) & 255,
      (broadcast >>> 8) & 255,
      broadcast & 255,
    ].join('.');

    const hostBits = 32 - cidr;
    result.usableHosts = hostBits >= 2 ? Math.pow(2, hostBits) - 2 : (hostBits === 1 ? 2 : 1);

    if (cidr < 31) {
      const firstHost = network + 1;
      const lastHost = broadcast - 1;
      result.firstHost = [
        (firstHost >>> 24) & 255,
        (firstHost >>> 16) & 255,
        (firstHost >>> 8) & 255,
        firstHost & 255,
      ].join('.');
      result.lastHost = [
        (lastHost >>> 24) & 255,
        (lastHost >>> 16) & 255,
        (lastHost >>> 8) & 255,
        lastHost & 255,
      ].join('.');
    }
  }

  return result;
};

const examples = [
  '192.168.1.1',
  '10.0.0.1/24',
  '172.16.0.0/12',
  '8.8.8.8',
  '127.0.0.1',
  '169.254.1.1',
  '224.0.0.1',
];

export const IPAddressTool: React.FC = () => {
  const [input, setInput] = useState('192.168.1.100/24');

  const ipInfo = useMemo(() => parseIPv4(input), [input]);

  return (
    <Container>
      <div>
        <Title>IP Address Analyzer</Title>
        <Description>
          Analyze IPv4 addresses, calculate subnets, and view binary representations
        </Description>
      </div>

      <Section>
        <Label>IP Address (with optional CIDR notation)</Label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
          $error={input.length > 0 && !ipInfo}
        />
        {input.length > 0 && !ipInfo && (
          <ErrorMessage>
            <span className="material-symbols-outlined">error</span>
            Invalid IP address format
          </ErrorMessage>
        )}
      </Section>

      <Section>
        <Label>Examples</Label>
        <ExamplesSection>
          {examples.map(ex => (
            <ExampleButton key={ex} onClick={() => setInput(ex)}>
              {ex}
            </ExampleButton>
          ))}
        </ExamplesSection>
      </Section>

      {ipInfo && (
        <>
          <ResultsGrid>
            <ResultCard>
              <ResultLabel>IP Type</ResultLabel>
              <ResultValue>
                <TypeBadge $type={ipInfo.type}>
                  {ipInfo.type.charAt(0).toUpperCase() + ipInfo.type.slice(1)}
                </TypeBadge>
              </ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>IP Class</ResultLabel>
              <ResultValue>
                <ClassBadge $class={ipInfo.class || ''}>
                  Class {ipInfo.class}
                </ClassBadge>
              </ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Decimal</ResultLabel>
              <ResultValue>{ipInfo.decimal.toLocaleString()}</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Hexadecimal</ResultLabel>
              <ResultValue>{ipInfo.hex}</ResultValue>
            </ResultCard>
          </ResultsGrid>

          <Section>
            <Label>Binary Representation</Label>
            <BinaryDisplay>
              <BinaryRow>
                <BinaryLabel>Binary:</BinaryLabel>
                <BinaryValue>
                  {ipInfo.binary.split('.').map((octet, i) => (
                    <OctetGroup key={i}>{octet}</OctetGroup>
                  ))}
                </BinaryValue>
              </BinaryRow>
              <BinaryRow>
                <BinaryLabel>Decimal:</BinaryLabel>
                <BinaryValue>
                  {ipInfo.octets.map((octet, i) => (
                    <OctetGroup key={i}>{octet.toString().padStart(3, ' ')}</OctetGroup>
                  ))}
                </BinaryValue>
              </BinaryRow>
            </BinaryDisplay>
          </Section>

          {ipInfo.cidr !== undefined && (
            <SubnetSection>
              <SubnetTitle>Subnet Information (/{ipInfo.cidr})</SubnetTitle>
              <SubnetGrid>
                <SubnetItem>
                  <div className="label">Subnet Mask</div>
                  <div className="value">{ipInfo.subnetMask}</div>
                </SubnetItem>
                <SubnetItem>
                  <div className="label">Wildcard Mask</div>
                  <div className="value">{ipInfo.wildcardMask}</div>
                </SubnetItem>
                <SubnetItem>
                  <div className="label">Network Address</div>
                  <div className="value">{ipInfo.networkAddress}</div>
                </SubnetItem>
                <SubnetItem>
                  <div className="label">Broadcast Address</div>
                  <div className="value">{ipInfo.broadcastAddress}</div>
                </SubnetItem>
                {ipInfo.firstHost && (
                  <SubnetItem>
                    <div className="label">First Usable Host</div>
                    <div className="value">{ipInfo.firstHost}</div>
                  </SubnetItem>
                )}
                {ipInfo.lastHost && (
                  <SubnetItem>
                    <div className="label">Last Usable Host</div>
                    <div className="value">{ipInfo.lastHost}</div>
                  </SubnetItem>
                )}
                <SubnetItem>
                  <div className="label">Usable Hosts</div>
                  <div className="value">{ipInfo.usableHosts?.toLocaleString()}</div>
                </SubnetItem>
              </SubnetGrid>
            </SubnetSection>
          )}
        </>
      )}
    </Container>
  );
};
