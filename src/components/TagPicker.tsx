import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import type { TaskTag } from '../types/Task';

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TagButton = styled.button<{ $hasTag: boolean }>`
  background: ${props => props.$hasTag ? 'rgba(98, 0, 238, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$hasTag ? 'rgba(98, 0, 238, 0.3)' : 'transparent'};
  color: ${props => props.$hasTag ? '#6200ee' : '#999'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$hasTag ? 'rgba(98, 0, 238, 0.2)' : '#f5f5f5'};
    border-color: ${props => props.$hasTag ? 'rgba(98, 0, 238, 0.5)' : '#ccc'};
    color: ${props => props.$hasTag ? '#6200ee' : '#666'};
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const Dropdown = styled.div<{ $top: number; $left: number; $openUpward?: boolean }>`
  position: fixed;
  top: ${props => props.$openUpward ? 'auto' : `${props.$top}px`};
  bottom: ${props => props.$openUpward ? `${props.$top}px` : 'auto'};
  left: ${props => props.$left}px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  padding: 8px;
  z-index: 99999;
  min-width: 220px;
  max-height: 300px;
  overflow-y: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TagOption = styled.button<{ $color: string; $isSelected: boolean }>`
  background: ${props => props.$isSelected ? `${props.$color}15` : 'none'};
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${props => props.$isSelected ? `${props.$color}25` : '#f5f5f5'};
  }
`;

const TagDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const TagName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckIcon = styled.span`
  color: #6200ee;
  font-size: 16px;
`;

const CreateSection = styled.div`
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
  padding-top: 8px;
`;

const CreateButton = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  color: #6200ee;
  transition: background 0.15s;

  &:hover {
    background: rgba(98, 0, 238, 0.08);
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
`;

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 2px solid ${props => props.$isSelected ? '#333' : 'transparent'};
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.1);
  }
`;

const CreateActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: ${props => props.$primary ? '#6200ee' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  transition: background 0.15s;

  &:hover {
    background: ${props => props.$primary ? '#5000d0' : '#e0e0e0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 13px;
`;

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

interface TagPickerProps {
  selectedTagIds: string[];
  availableTags: TaskTag[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag: (name: string, color: string) => TaskTag;
}

export const TagPicker: React.FC<TagPickerProps> = ({
  selectedTagIds,
  availableTags,
  onTagsChange,
  onCreateTag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const shouldOpenUpward = spaceBelow < 320;

      setOpenUpward(shouldOpenUpward);
      setDropdownPosition({
        top: shouldOpenUpward ? viewportHeight - rect.top + 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 240)),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = () => {
    if (!searchQuery.trim()) return;

    const newTag = onCreateTag(searchQuery.trim(), newTagColor);
    onTagsChange([...selectedTagIds, newTag.id]);
    setSearchQuery('');
    setIsCreating(false);
    setNewTagColor(PRESET_COLORS[0]);
  };

  const showCreateOption = searchQuery.trim() &&
    !availableTags.some(tag => tag.name.toLowerCase() === searchQuery.toLowerCase());

  return (
    <Container>
      <TagButton
        ref={buttonRef}
        $hasTag={selectedTagIds.length > 0}
        onClick={() => setIsOpen(!isOpen)}
        title="Add tags"
      >
        <span className="material-symbols-outlined">sell</span>
        {selectedTagIds.length > 0 && selectedTagIds.length}
      </TagButton>

      {isOpen &&
        createPortal(
          <Dropdown
            ref={dropdownRef}
            $top={dropdownPosition.top}
            $left={dropdownPosition.left}
            $openUpward={openUpward}
          >
            <SearchInput
              type="text"
              placeholder="Search or create tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            {filteredTags.length > 0 ? (
              <TagList>
                {filteredTags.map(tag => (
                  <TagOption
                    key={tag.id}
                    $color={tag.color}
                    $isSelected={selectedTagIds.includes(tag.id)}
                    onClick={() => handleToggleTag(tag.id)}
                  >
                    <TagDot $color={tag.color} />
                    <TagName>{tag.name}</TagName>
                    {selectedTagIds.includes(tag.id) && (
                      <CheckIcon className="material-symbols-outlined">check</CheckIcon>
                    )}
                  </TagOption>
                ))}
              </TagList>
            ) : !showCreateOption ? (
              <EmptyState>No tags yet. Type to create one.</EmptyState>
            ) : null}

            {showCreateOption && (
              <CreateSection>
                {!isCreating ? (
                  <CreateButton onClick={() => setIsCreating(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Create "{searchQuery}"
                  </CreateButton>
                ) : (
                  <>
                    <ColorPicker>
                      {PRESET_COLORS.map(color => (
                        <ColorOption
                          key={color}
                          $color={color}
                          $isSelected={newTagColor === color}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </ColorPicker>
                    <CreateActions>
                      <ActionButton onClick={() => setIsCreating(false)}>
                        Cancel
                      </ActionButton>
                      <ActionButton $primary onClick={handleCreateTag}>
                        Create
                      </ActionButton>
                    </CreateActions>
                  </>
                )}
              </CreateSection>
            )}
          </Dropdown>,
          document.body
        )}
    </Container>
  );
};
