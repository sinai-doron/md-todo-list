import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../components/SEO';
import { ToolsSidebar } from '../components/it-tools/ToolsSidebar';
import { CommandPalette } from '../components/it-tools/CommandPalette';
import { getToolById } from '../components/it-tools/tools';

const PageContainer = styled.div`
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #6200ee;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CommandPaletteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ede7f6;
    border-color: #6200ee;
    color: #6200ee;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }

  kbd {
    font-size: 11px;
    background: white;
    border: 1px solid #ddd;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0; /* Critical for flex children to respect overflow */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ToolContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: white;
  margin: 16px;
  margin-left: 0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  min-height: 0; /* Allow flex item to shrink for scrolling */

  @media (max-width: 768px) {
    margin: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  padding: 40px;

  .material-symbols-outlined {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const EmptyTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  max-width: 300px;
`;

const ShortcutHint = styled.div`
  margin-top: 20px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;

  kbd {
    background: white;
    border: 1px solid #ddd;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    margin: 0 4px;
  }
`;

export const ITToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId?: string }>();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Get the selected tool
  const selectedTool = toolId ? getToolById(toolId) : null;
  const ToolComponent = selectedTool?.component;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Escape to close palette or go back
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else {
          navigate('/');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, navigate]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSelectTool = useCallback((id: string) => {
    navigate(`/it-tools/${id}`);
    setIsCommandPaletteOpen(false);
  }, [navigate]);

  const handleOpenCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  // Generate SEO description based on selected tool
  const seoTitle = selectedTool
    ? `${selectedTool.name} - IT Tools`
    : 'IT Tools - Developer Utilities';
  const seoDescription = selectedTool
    ? selectedTool.description
    : 'Collection of developer tools including Base64 encoder/decoder, JWT decoder, and more.';

  return (
    <PageContainer>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={toolId ? `/it-tools/${toolId}` : '/it-tools'}
        keywords="it tools, developer tools, base64, jwt, encoder, decoder, utilities"
      />

      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack} title="Back to Todo List (Esc)">
            <span className="material-symbols-outlined">arrow_back</span>
          </BackButton>
          <Title>
            <span className="material-symbols-outlined">build</span>
            IT Tools
          </Title>
        </HeaderLeft>

        <HeaderRight>
          <CommandPaletteButton onClick={handleOpenCommandPalette}>
            <span className="material-symbols-outlined">search</span>
            Search tools
            <kbd>Cmd+K</kbd>
          </CommandPaletteButton>
        </HeaderRight>
      </Header>

      <MainContent>
        <ToolsSidebar
          selectedToolId={toolId || null}
          onSelectTool={handleSelectTool}
          onOpenCommandPalette={handleOpenCommandPalette}
        />

        <ToolContent>
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <EmptyState>
              <span className="material-symbols-outlined">construction</span>
              <EmptyTitle>Select a Tool</EmptyTitle>
              <EmptyDescription>
                Choose a tool from the sidebar or use the search to find what you need.
              </EmptyDescription>
              <ShortcutHint>
                Press <kbd>Cmd</kbd> + <kbd>K</kbd> to quickly search tools
              </ShortcutHint>
            </EmptyState>
          )}
        </ToolContent>
      </MainContent>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
      />
    </PageContainer>
  );
};
