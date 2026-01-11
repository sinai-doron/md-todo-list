import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { ITTool, ToolCategoryInfo } from '../../types/ITTool';
import { tools, getActiveCategories, getToolsByCategory } from './tools';

const SidebarContainer = styled.div`
  width: 280px;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    max-height: 300px;
  }
`;

const SearchContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
  }

  .material-symbols-outlined {
    color: #999;
    font-size: 20px;
  }
`;

const SearchPlaceholder = styled.span`
  flex: 1;
  color: #999;
  font-size: 14px;
`;

const SearchShortcut = styled.span`
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
`;

const ToolsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const CategorySection = styled.div`
  margin-bottom: 8px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const ToolItem = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${props => props.$active ? '#ede7f6' : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  border-left: 3px solid ${props => props.$active ? '#6200ee' : 'transparent'};

  &:hover {
    background: ${props => props.$active ? '#ede7f6' : '#f0f0f0'};
  }

  .material-symbols-outlined {
    font-size: 20px;
    color: ${props => props.$active ? '#6200ee' : '#666'};
  }
`;

const ToolInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToolName = styled.div<{ $active: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#6200ee' : '#333'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToolDescription = styled.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const ToolCount = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

interface ToolsSidebarProps {
  selectedToolId: string | null;
  onSelectTool: (toolId: string) => void;
  onOpenCommandPalette: () => void;
  searchQuery?: string;
}

export const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  selectedToolId,
  onSelectTool,
  onOpenCommandPalette,
  searchQuery = '',
}) => {
  const activeCategories = useMemo(() => getActiveCategories(), []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.includes(query))
    );
  }, [searchQuery]);

  const renderToolItem = (tool: ITTool) => (
    <ToolItem
      key={tool.id}
      $active={selectedToolId === tool.id}
      onClick={() => onSelectTool(tool.id)}
    >
      <span className="material-symbols-outlined">{tool.icon}</span>
      <ToolInfo>
        <ToolName $active={selectedToolId === tool.id}>{tool.name}</ToolName>
        <ToolDescription>{tool.description}</ToolDescription>
      </ToolInfo>
    </ToolItem>
  );

  return (
    <SidebarContainer>
      <SearchContainer>
        <SearchInput onClick={onOpenCommandPalette}>
          <span className="material-symbols-outlined">search</span>
          <SearchPlaceholder>Search tools...</SearchPlaceholder>
          <SearchShortcut>Cmd+K</SearchShortcut>
        </SearchInput>
      </SearchContainer>

      <ToolsList>
        {filteredTools ? (
          // Show filtered results
          filteredTools.length > 0 ? (
            filteredTools.map(renderToolItem)
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No tools found
            </div>
          )
        ) : (
          // Show categorized list
          activeCategories.map((category: ToolCategoryInfo) => {
            const categoryTools = getToolsByCategory(category.id);
            if (categoryTools.length === 0) return null;

            return (
              <CategorySection key={category.id}>
                <CategoryHeader>
                  <span className="material-symbols-outlined">{category.icon}</span>
                  {category.name}
                </CategoryHeader>
                {categoryTools.map(renderToolItem)}
              </CategorySection>
            );
          })
        )}
      </ToolsList>

      <ToolCount>{tools.length} tools available</ToolCount>
    </SidebarContainer>
  );
};
