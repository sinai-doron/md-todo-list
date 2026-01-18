import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import type { TaskTag } from '../types/Task';
import type { ExportedList, ImportMode, ImportPreview } from '../types/Export';
import {
  validateImportJSON,
  generateImportPreview,
} from '../utils/importJSON';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #6200ee;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #d32f2f;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;

  strong {
    display: block;
    margin-bottom: 8px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #e3f2fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;

  .material-symbols-outlined {
    font-size: 28px;
  }
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const FileStats = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 16px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const ImportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const ImportOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? 'rgba(98, 0, 238, 0.04)' : 'white'};

  &:hover {
    border-color: ${props => props.$selected ? '#6200ee' : '#ccc'};
    background: ${props => props.$selected ? 'rgba(98, 0, 238, 0.04)' : '#fafafa'};
  }

  input {
    margin-top: 2px;
  }
`;

const OptionInfo = styled.div`
  flex: 1;
`;

const OptionName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const OptionDescription = styled.div`
  font-size: 13px;
  color: #666;
`;

const NewTagsSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #fff8e1;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
`;

const NewTagsTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #f57c00;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border: 1px solid ${props => `${props.$color}40`};
`;

const ExportDate = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: ${props => props.$primary ? 'none' : '1px solid #ddd'};
  background: ${props => props.$primary ? '#6200ee' : 'white'};
  color: ${props => props.$primary ? 'white' : '#333'};
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 18px;
  }

  &:hover {
    background: ${props => props.$primary ? '#7c3aed' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ImportJSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: string;
  fileName?: string;
  existingTags: TaskTag[];
  onImport: (data: ExportedList, mode: ImportMode) => void;
}

export const ImportJSONModal: React.FC<ImportJSONModalProps> = ({
  isOpen,
  onClose,
  fileContent,
  existingTags,
  onImport,
}) => {
  const [importMode, setImportMode] = useState<ImportMode>('new');

  // Validate and generate preview
  const { validation, preview } = useMemo(() => {
    const validationResult = validateImportJSON(fileContent);
    let previewData: ImportPreview | null = null;

    if (validationResult.valid && validationResult.data) {
      previewData = generateImportPreview(validationResult.data, existingTags);
    }

    return {
      validation: validationResult,
      preview: previewData,
    };
  }, [fileContent, existingTags]);

  const handleImport = () => {
    if (validation.valid && validation.data) {
      onImport(validation.data, importMode);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>
            <span className="material-symbols-outlined">upload</span>
            Import JSON Backup
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          {!validation.valid ? (
            <ErrorMessage>
              <strong>Invalid Import File</strong>
              <ul>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </ErrorMessage>
          ) : preview && (
            <>
              <FileInfo>
                <FileIcon>
                  <span className="material-symbols-outlined">description</span>
                </FileIcon>
                <FileDetails>
                  <FileName>{preview.listName}</FileName>
                  <FileStats>
                    <span>{preview.taskCount} {preview.taskCount === 1 ? 'task' : 'tasks'}</span>
                    <span>{preview.tagCount} {preview.tagCount === 1 ? 'tag' : 'tags'}</span>
                  </FileStats>
                </FileDetails>
              </FileInfo>

              <SectionLabel>Import Mode</SectionLabel>
              <ImportOptions>
                <ImportOption $selected={importMode === 'new'}>
                  <input
                    type="radio"
                    name="importMode"
                    value="new"
                    checked={importMode === 'new'}
                    onChange={() => setImportMode('new')}
                  />
                  <OptionInfo>
                    <OptionName>Create as new list</OptionName>
                    <OptionDescription>
                      Import as "{preview.listName} (Imported)"
                    </OptionDescription>
                  </OptionInfo>
                </ImportOption>

                <ImportOption $selected={importMode === 'replace'}>
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <OptionInfo>
                    <OptionName>Replace current list</OptionName>
                    <OptionDescription>
                      Replace current list tasks with imported data
                    </OptionDescription>
                  </OptionInfo>
                </ImportOption>
              </ImportOptions>

              {preview.newTags.length > 0 && (
                <NewTagsSection>
                  <NewTagsTitle>
                    <span className="material-symbols-outlined">new_releases</span>
                    {preview.newTags.length} new {preview.newTags.length === 1 ? 'tag' : 'tags'} will be created
                  </NewTagsTitle>
                  <TagsList>
                    {preview.newTags.map(tag => (
                      <TagBadge key={tag.id} $color={tag.color}>
                        {tag.name}
                      </TagBadge>
                    ))}
                  </TagsList>
                </NewTagsSection>
              )}

              <ExportDate>
                <span className="material-symbols-outlined">schedule</span>
                Exported: {formatDate(preview.exportedAt)}
              </ExportDate>
            </>
          )}
        </Content>

        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            $primary
            onClick={handleImport}
            disabled={!validation.valid}
          >
            <span className="material-symbols-outlined">upload</span>
            Import
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};
