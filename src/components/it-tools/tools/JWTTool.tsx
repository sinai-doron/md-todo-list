import React, { useState, useMemo } from 'react';
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

const InputWrapper = styled.div<{ $focused: boolean }>`
  position: relative;
  min-height: 100px;
  border: 2px solid ${props => props.$focused ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  transition: border-color 0.2s;
  background: white;
`;

const TextArea = styled.textarea`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  background: transparent;
  color: transparent;
  caret-color: #333;
  z-index: 2;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
  }
`;

const HighlightOverlay = styled.div`
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  pointer-events: none;
  min-height: 76px;
`;

const TokenPart = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 500;
`;

const TokenDot = styled.span`
  color: #999;
`;

const Placeholder = styled.span`
  color: #999;
`;

const OutputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const Section = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.$color};
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const SectionContent = styled.pre`
  margin: 0;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
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

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #666;
  min-width: 100px;
`;

const InfoValue = styled.span<{ $color?: string }>`
  font-size: 13px;
  color: ${props => props.$color || '#333'};
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $valid: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$valid ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$valid ? '#2e7d32' : '#c62828'};
`;

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

// Token part colors matching the section headers
const TOKEN_COLORS = {
  header: '#1565c0',   // Blue
  payload: '#2e7d32', // Green
  signature: '#6a1b9a', // Purple
};

export const JWTTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse token parts for syntax highlighting
  const tokenParts = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const parts = trimmed.split('.');
    if (parts.length !== 3) return null;

    return {
      header: parts[0],
      payload: parts[1],
      signature: parts[2],
    };
  }, [input]);

  const decoded = useMemo((): DecodedJWT | null => {
    if (!input.trim()) {
      setError(null);
      return null;
    }

    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        setError('Invalid JWT format: Expected 3 parts separated by dots');
        return null;
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode header
      const headerJson = atob(headerB64.replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      // Check expiration
      const exp = payload.exp ? new Date(payload.exp * 1000) : null;
      const iat = payload.iat ? new Date(payload.iat * 1000) : null;
      const isExpired = exp ? exp < new Date() : false;

      setError(null);
      return {
        header,
        payload,
        signature,
        isExpired,
        expiresAt: exp,
        issuedAt: iat,
      };
    } catch (e) {
      setError('Failed to decode JWT: Invalid format or encoding');
      return null;
    }
  }, [input]);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">token</span>
          JWT Decoder
        </Title>
        <Description>Decode and inspect JSON Web Tokens. Paste a JWT to see its header, payload, and expiration status.</Description>
      </div>

      <InputSection>
        <Label>JWT Token</Label>
        <InputWrapper $focused={isFocused}>
          <HighlightOverlay>
            {tokenParts ? (
              <>
                <TokenPart $color={TOKEN_COLORS.header}>{tokenParts.header}</TokenPart>
                <TokenDot>.</TokenDot>
                <TokenPart $color={TOKEN_COLORS.payload}>{tokenParts.payload}</TokenPart>
                <TokenDot>.</TokenDot>
                <TokenPart $color={TOKEN_COLORS.signature}>{tokenParts.signature}</TokenPart>
              </>
            ) : input ? (
              <span style={{ color: '#333' }}>{input}</span>
            ) : (
              <Placeholder>Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)</Placeholder>
            )}
          </HighlightOverlay>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=""
          />
        </InputWrapper>
      </InputSection>

      {error && (
        <ErrorMessage>
          <span className="material-symbols-outlined">error</span>
          {error}
        </ErrorMessage>
      )}

      {decoded && (
        <OutputSection>
          {/* Token Status */}
          <Section>
            <SectionHeader $color="#6200ee">Token Info</SectionHeader>
            <InfoRow>
              <InfoLabel>Status</InfoLabel>
              <StatusBadge $valid={!decoded.isExpired}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {decoded.isExpired ? 'cancel' : 'check_circle'}
                </span>
                {decoded.isExpired ? 'Expired' : 'Valid'}
              </StatusBadge>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Algorithm</InfoLabel>
              <InfoValue>{String(decoded.header.alg) || 'Unknown'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>{String(decoded.header.typ) || 'Unknown'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Issued At</InfoLabel>
              <InfoValue>{formatDate(decoded.issuedAt)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Expires At</InfoLabel>
              <InfoValue $color={decoded.isExpired ? '#c62828' : undefined}>
                {formatDate(decoded.expiresAt)}
              </InfoValue>
            </InfoRow>
          </Section>

          {/* Header */}
          <Section>
            <SectionHeader $color="#1565c0">Header</SectionHeader>
            <SectionContent>
              {JSON.stringify(decoded.header, null, 2)}
            </SectionContent>
          </Section>

          {/* Payload */}
          <Section>
            <SectionHeader $color="#2e7d32">Payload</SectionHeader>
            <SectionContent>
              {JSON.stringify(decoded.payload, null, 2)}
            </SectionContent>
          </Section>

          {/* Signature */}
          <Section>
            <SectionHeader $color="#6a1b9a">Signature</SectionHeader>
            <SectionContent style={{ color: '#666' }}>
              {decoded.signature}
            </SectionContent>
          </Section>
        </OutputSection>
      )}

      {!decoded && !error && (
        <OutputSection style={{ alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.5 }}>token</span>
          <p>Paste a JWT token above to decode it</p>
        </OutputSection>
      )}
    </Container>
  );
};
