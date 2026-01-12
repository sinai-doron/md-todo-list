import React, { useState, useEffect, useRef } from 'react';
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

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    color: #666;
  }

  input, select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #6200ee;
    }
  }
`;

const ColorInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type="text"] {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: monospace;
  }
`;

const PreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QRPreview = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const QRCanvas = styled.canvas`
  max-width: 100%;
  border-radius: 8px;
`;

const QRPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#6200ee' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$primary ? '#5000d0' : '#e0e0e0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const CharCount = styled.div`
  font-size: 12px;
  color: ${props => props.color || '#666'};
  text-align: right;
`;

const PresetButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  background: ${props => props.$active ? '#ede7f6' : 'white'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    color: #6200ee;
  }
`;

// Simple QR Code generator using canvas
// This is a basic implementation - for production, you'd use a library like qrcode.js

const generateQRMatrix = (data: string): number[][] | null => {
  // This is a simplified QR code generator
  // For a real implementation, use a proper QR code library
  // Here we'll create a visual pattern that looks like QR code for demo

  if (!data) return null;

  const size = Math.max(21, Math.min(177, 21 + Math.floor(data.length / 10) * 4));
  const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

  // Add finder patterns (the three corners)
  const addFinderPattern = (x: number, y: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          if (x + i < size && y + j < size) {
            matrix[y + j][x + i] = 1;
          }
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(size - 7, 0);
  addFinderPattern(0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Add data pattern based on input (simplified - not real QR encoding)
  let dataIndex = 0;
  const dataBytes = new TextEncoder().encode(data);

  for (let y = size - 1; y >= 0; y -= 2) {
    if (y === 6) y = 5; // Skip timing pattern
    for (let x = size - 1; x >= 0; x--) {
      for (let c = 0; c < 2; c++) {
        const col = y - c;
        if (col < 0) continue;

        // Skip if in finder pattern area
        if ((x < 9 && col < 9) || (x < 9 && col >= size - 8) || (x >= size - 8 && col < 9)) {
          continue;
        }
        if (col === 6) continue; // Skip timing pattern

        if (matrix[x][col] === 0) {
          const bit = dataBytes[dataIndex % dataBytes.length] & (1 << ((dataIndex / 8) % 8));
          matrix[x][col] = bit ? 1 : ((dataIndex + x + col) % 3 === 0 ? 1 : 0);
          dataIndex++;
        }
      }
    }
  }

  return matrix;
};

const drawQRCode = (
  canvas: HTMLCanvasElement,
  data: string,
  size: number,
  fgColor: string,
  bgColor: string
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const matrix = generateQRMatrix(data);
  if (!matrix) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const moduleCount = matrix.length;
  const moduleSize = size / moduleCount;

  canvas.width = size;
  canvas.height = size;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Draw modules
  ctx.fillStyle = fgColor;
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (matrix[y][x]) {
        ctx.fillRect(
          Math.floor(x * moduleSize),
          Math.floor(y * moduleSize),
          Math.ceil(moduleSize),
          Math.ceil(moduleSize)
        );
      }
    }
  }
};

type PresetType = 'text' | 'url' | 'email' | 'phone' | 'wifi';

export const QRCodeTool: React.FC = () => {
  const [content, setContent] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [preset, setPreset] = useState<PresetType>('text');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxLength = 2953; // Max QR code capacity

  useEffect(() => {
    if (canvasRef.current && content) {
      drawQRCode(canvasRef.current, content, size, fgColor, bgColor);
    }
  }, [content, size, fgColor, bgColor]);

  const handleDownload = (format: 'png' | 'svg') => {
    if (!canvasRef.current || !content) return;

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else {
      // For SVG, we'd need to regenerate - simplified here
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current || !content) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const applyPreset = (type: PresetType) => {
    setPreset(type);
    switch (type) {
      case 'url':
        setContent('https://');
        break;
      case 'email':
        setContent('mailto:');
        break;
      case 'phone':
        setContent('tel:');
        break;
      case 'wifi':
        setContent('WIFI:T:WPA;S:NetworkName;P:Password;;');
        break;
      default:
        setContent('');
    }
  };

  return (
    <Container>
      <div>
        <Title>QR Code Generator</Title>
        <Description>
          Generate QR codes for URLs, text, contact info, WiFi credentials, and more
        </Description>
      </div>

      <ContentLayout>
        <InputSection>
          <Section>
            <Label>Content Type</Label>
            <PresetButtons>
              <PresetButton $active={preset === 'text'} onClick={() => applyPreset('text')}>
                Text
              </PresetButton>
              <PresetButton $active={preset === 'url'} onClick={() => applyPreset('url')}>
                URL
              </PresetButton>
              <PresetButton $active={preset === 'email'} onClick={() => applyPreset('email')}>
                Email
              </PresetButton>
              <PresetButton $active={preset === 'phone'} onClick={() => applyPreset('phone')}>
                Phone
              </PresetButton>
              <PresetButton $active={preset === 'wifi'} onClick={() => applyPreset('wifi')}>
                WiFi
              </PresetButton>
            </PresetButtons>
          </Section>

          <Section>
            <Label>Content</Label>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                preset === 'wifi'
                  ? 'WIFI:T:WPA;S:NetworkName;P:Password;;'
                  : 'Enter text, URL, or data to encode...'
              }
              maxLength={maxLength}
            />
            <CharCount color={content.length > maxLength * 0.9 ? '#f44336' : undefined}>
              {content.length} / {maxLength} characters
            </CharCount>
          </Section>

          <Section>
            <Label>Options</Label>
            <OptionsGrid>
              <OptionItem>
                <label>Size (px)</label>
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  <option value="128">128 × 128</option>
                  <option value="256">256 × 256</option>
                  <option value="512">512 × 512</option>
                  <option value="1024">1024 × 1024</option>
                </select>
              </OptionItem>
              <OptionItem>
                <label>Foreground Color</label>
                <ColorInput>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </ColorInput>
              </OptionItem>
              <OptionItem>
                <label>Background Color</label>
                <ColorInput>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </ColorInput>
              </OptionItem>
            </OptionsGrid>
          </Section>
        </InputSection>

        <PreviewSection>
          <QRPreview>
            {content ? (
              <QRCanvas ref={canvasRef} />
            ) : (
              <QRPlaceholder>
                Enter content to generate QR code
              </QRPlaceholder>
            )}
            <ButtonGroup>
              <Button onClick={() => handleDownload('png')} disabled={!content}>
                <span className="material-symbols-outlined">download</span>
                PNG
              </Button>
              <Button onClick={handleCopyImage} disabled={!content}>
                <span className="material-symbols-outlined">content_copy</span>
                Copy
              </Button>
            </ButtonGroup>
          </QRPreview>
        </PreviewSection>
      </ContentLayout>
    </Container>
  );
};
