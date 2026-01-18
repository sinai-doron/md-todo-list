import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { imageToBase64 } from '../../utils/recipeStorage';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(props) => (props.$active ? 'white' : 'transparent')};
  color: ${(props) => (props.$active ? '#333' : '#666')};
  box-shadow: ${(props) =>
    props.$active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const UrlInput = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #f59e0b;
  }
`;

const DropZone = styled.div<{ $isDragging: boolean; $hasImage: boolean }>`
  border: 2px dashed ${(props) => (props.$isDragging ? '#f59e0b' : '#e0e0e0')};
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  background: ${(props) =>
    props.$isDragging
      ? 'rgba(245, 158, 11, 0.05)'
      : props.$hasImage
      ? '#f9f9f9'
      : 'white'};

  &:hover {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.05);
  }
`;

const DropZoneIcon = styled.div`
  margin-bottom: 12px;

  .material-symbols-outlined {
    font-size: 48px;
    color: #ccc;
  }
`;

const DropZoneText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const DropZoneHint = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #999;
`;

const Preview = styled.div`
  position: relative;
  margin-top: 12px;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const ErrorMessage = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #ef4444;
`;

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<'url' | 'upload'>(value.startsWith('data:') ? 'upload' : 'url');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    onChange(e.target.value);
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    try {
      const base64 = await imageToBase64(file);
      onChange(base64);
    } catch {
      setError('Failed to process image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      // Only handle paste in upload mode
      if (mode !== 'upload') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleFileSelect(file);
          }
          return;
        }
      }
    },
    [mode]
  );

  // Listen for paste events when in upload mode
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <Container>
      <Label>Recipe Image</Label>

      <TabsContainer>
        <Tab $active={mode === 'url'} onClick={() => setMode('url')}>
          URL
        </Tab>
        <Tab $active={mode === 'upload'} onClick={() => setMode('upload')}>
          Upload
        </Tab>
      </TabsContainer>

      {mode === 'url' ? (
        <UrlInput
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value.startsWith('data:') ? '' : value}
          onChange={handleUrlChange}
        />
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <DropZone
            $isDragging={isDragging}
            $hasImage={!!value}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <DropZoneIcon>
              <span className="material-symbols-outlined">cloud_upload</span>
            </DropZoneIcon>
            <DropZoneText>
              Drag and drop, paste from clipboard, or click to browse
            </DropZoneText>
            <DropZoneHint>Images are automatically compressed • Ctrl+V to paste</DropZoneHint>
          </DropZone>
        </>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {value && (
        <Preview>
          <PreviewImage src={value} alt="Recipe preview" />
          <RemoveButton onClick={handleRemove} title="Remove image">
            <span className="material-symbols-outlined">close</span>
          </RemoveButton>
        </Preview>
      )}
    </Container>
  );
};
