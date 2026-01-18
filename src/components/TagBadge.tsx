import React from 'react';
import styled from 'styled-components';
import type { TaskTag } from '../types/Task';

const Badge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border: 1px solid ${props => `${props.$color}40`};
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button<{ $color: string }>`
  background: none;
  border: none;
  padding: 0;
  margin-left: 2px;
  cursor: pointer;
  color: ${props => props.$color};
  opacity: 0.6;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }
`;

interface TagBadgeProps {
  tag: TaskTag;
  onRemove?: () => void;
  onClick?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove, onClick }) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <Badge $color={tag.color} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {tag.name}
      {onRemove && (
        <RemoveButton $color={tag.color} onClick={handleRemoveClick}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
        </RemoveButton>
      )}
    </Badge>
  );
};

const OverflowBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: #f0f0f0;
  color: #666;
  white-space: nowrap;
`;

interface TagBadgeListProps {
  tags: TaskTag[];
  maxVisible?: number;
  onRemoveTag?: (tagId: string) => void;
  onClick?: () => void;
}

export const TagBadgeList: React.FC<TagBadgeListProps> = ({
  tags,
  maxVisible = 2,
  onRemoveTag,
  onClick,
}) => {
  const visibleTags = tags.slice(0, maxVisible);
  const overflowCount = tags.length - maxVisible;

  if (tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
      {visibleTags.map(tag => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onRemove={onRemoveTag ? () => onRemoveTag(tag.id) : undefined}
          onClick={onClick}
        />
      ))}
      {overflowCount > 0 && (
        <OverflowBadge onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
          +{overflowCount}
        </OverflowBadge>
      )}
    </div>
  );
};
