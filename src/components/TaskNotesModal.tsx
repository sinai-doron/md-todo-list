import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

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

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$active ? '#6200ee' : '#666'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#6200ee' : 'transparent'};
  margin-bottom: -1px;
  transition: all 0.2s;

  &:hover {
    color: #6200ee;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #6200ee;
    box-shadow: 0 0 0 3px rgba(98, 0, 238, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const PreviewContainer = styled.div`
  min-height: 300px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  font-size: 14px;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    color: #333;
  }

  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.1em; }

  p {
    margin: 0.5em 0;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  code {
    background: #e8e8e8;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Monaco', monospace;
    font-size: 0.9em;
  }

  pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }

  blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    border-left: 4px solid #6200ee;
    color: #666;
  }

  a {
    color: #6200ee;
  }

  hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 1em 0;
  }
`;

const EmptyPreview = styled.div`
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 40px;
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#6200ee' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};

  &:hover {
    background: ${props => props.$primary ? '#5000d0' : '#e0e0e0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface TaskNotesModalProps {
  isOpen: boolean;
  taskText: string;
  notes: string | undefined;
  onClose: () => void;
  onSave: (notes: string | undefined) => void;
}

export const TaskNotesModal: React.FC<TaskNotesModalProps> = ({
  isOpen,
  taskText,
  notes,
  onClose,
  onSave,
}) => {
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setEditedNotes(notes || '');
  }, [notes, isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(editedNotes.trim() || undefined);
    onClose();
  };

  const hasChanges = editedNotes !== (notes || '');

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <span className="material-symbols-outlined">notes</span>
            Notes
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab $active={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
            Edit
          </Tab>
          <Tab $active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
            Preview
          </Tab>
        </TabContainer>

        <ModalBody>
          {activeTab === 'edit' ? (
            <TextArea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder={`Add notes for "${taskText}"...\n\nSupports Markdown:\n- **bold**, *italic*\n- Lists and headers\n- Code blocks`}
              autoFocus
            />
          ) : (
            <PreviewContainer>
              {editedNotes.trim() ? (
                <ReactMarkdown>{editedNotes}</ReactMarkdown>
              ) : (
                <EmptyPreview>No notes to preview</EmptyPreview>
              )}
            </PreviewContainer>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button $primary onClick={handleSave} disabled={!hasChanges}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

// Helper component for showing notes indicator
export const NotesIndicator = styled.button<{ $hasNotes: boolean }>`
  background: ${props => props.$hasNotes ? 'rgba(98, 0, 238, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$hasNotes ? 'rgba(98, 0, 238, 0.3)' : 'transparent'};
  color: ${props => props.$hasNotes ? '#6200ee' : '#999'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$hasNotes ? 'rgba(98, 0, 238, 0.2)' : '#f5f5f5'};
    border-color: ${props => props.$hasNotes ? 'rgba(98, 0, 238, 0.5)' : '#ccc'};
    color: ${props => props.$hasNotes ? '#6200ee' : '#666'};
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;
