import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
// Types imported from tools module
import { tools, categories } from './tools';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
`;

const PaletteContainer = styled.div`
  width: 100%;
  max-width: 560px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;

  .material-symbols-outlined {
    color: #999;
    font-size: 24px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  font-size: 18px;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const ShortcutHint = styled.span`
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
`;

const ResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const ResultItem = styled.button<{ $highlighted: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.$highlighted ? '#f3e5f5' : 'transparent'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover {
    background: #f3e5f5;
  }
`;

const IconContainer = styled.div<{ $highlighted: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$highlighted ? '#ede7f6' : '#f5f5f5'};
  border-radius: 8px;

  .material-symbols-outlined {
    font-size: 22px;
    color: ${props => props.$highlighted ? '#6200ee' : '#666'};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333;
`;

const ItemDescription = styled.div`
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  color: #6200ee;
  background: #ede7f6;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: capitalize;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  font-size: 12px;
  color: #666;
`;

const FooterShortcuts = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FooterKey = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  kbd {
    background: white;
    border: 1px solid #ddd;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return tools;

    return tools.filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      tool.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Keep highlighted index in bounds
  useEffect(() => {
    if (highlightedIndex >= filteredTools.length) {
      setHighlightedIndex(Math.max(0, filteredTools.length - 1));
    }
  }, [filteredTools.length, highlightedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredTools.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredTools.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTools[highlightedIndex]) {
          onSelectTool(filteredTools[highlightedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredTools, highlightedIndex, onSelectTool, onClose]);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <PaletteContainer onClick={(e) => e.stopPropagation()}>
        <SearchSection>
          <span className="material-symbols-outlined">search</span>
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
          />
          <ShortcutHint>ESC</ShortcutHint>
        </SearchSection>

        <ResultsList ref={listRef}>
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, index) => (
              <ResultItem
                key={tool.id}
                $highlighted={index === highlightedIndex}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <IconContainer $highlighted={index === highlightedIndex}>
                  <span className="material-symbols-outlined">{tool.icon}</span>
                </IconContainer>
                <ItemInfo>
                  <ItemName>{tool.name}</ItemName>
                  <ItemDescription>{tool.description}</ItemDescription>
                </ItemInfo>
                <CategoryBadge>{getCategoryName(tool.category)}</CategoryBadge>
              </ResultItem>
            ))
          ) : (
            <EmptyState>
              <span className="material-symbols-outlined">search_off</span>
              <div>No tools found for "{query}"</div>
            </EmptyState>
          )}
        </ResultsList>

        <Footer>
          <span>{filteredTools.length} tools</span>
          <FooterShortcuts>
            <FooterKey><kbd>↑</kbd><kbd>↓</kbd> Navigate</FooterKey>
            <FooterKey><kbd>Enter</kbd> Select</FooterKey>
            <FooterKey><kbd>Esc</kbd> Close</FooterKey>
          </FooterShortcuts>
        </Footer>
      </PaletteContainer>
    </Overlay>
  );
};
