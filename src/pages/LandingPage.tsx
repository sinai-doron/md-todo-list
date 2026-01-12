import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../components/SEO';

const PageContainer = styled.div`
  min-height: 100vh;
  background-image: url('/sebastian-unrau-sp-p7uuT0tw-unsplash.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

const Header = styled.header`
  padding: 40px 24px;
  text-align: center;
  color: white;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Tagline = styled.p`
  margin: 8px 0 0;
  font-size: 18px;
  opacity: 0.9;
`;

const MainContent = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px 60px;
`;

const CategorySection = styled.section`
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 16px 4px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const FeatureCard = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => props.$color};
  border-radius: 12px;
  flex-shrink: 0;

  .material-symbols-outlined {
    font-size: 24px;
    color: white;
  }
`;

const CardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const CardBadge = styled.span`
  display: inline-block;
  margin-top: 8px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const Attribution = styled.a`
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  text-decoration: none;
  z-index: 1000;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 10px;
    bottom: 12px;
    left: 12px;
  }
`;

const GitHubLink = styled.a`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface Feature {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
  color: string;
  badge?: string;
}

interface Category {
  name: string;
  features: Feature[];
}

const categories: Category[] = [
  {
    name: 'Productivity',
    features: [
      {
        id: 'todo',
        name: 'Todo Lists',
        icon: 'checklist',
        description: 'Manage tasks with markdown sync and subtasks',
        path: '/todo',
        color: '#6200ee',
      },
      {
        id: 'calendar',
        name: 'Calendar',
        icon: 'calendar_month',
        description: 'View your tasks by day, week, or month',
        path: '/calendar',
        color: '#d81b60',
      },
      {
        id: 'kanban',
        name: 'Kanban Board',
        icon: 'view_kanban',
        description: 'Visual task management with drag & drop',
        path: '/kanban',
        color: '#00897b',
      },
      {
        id: 'habits',
        name: 'Habits Tracker',
        icon: 'repeat',
        description: 'Build routines with streak tracking',
        path: '/habits',
        color: '#e65100',
      },
    ],
  },
  {
    name: 'Developer Tools',
    features: [
      {
        id: 'it-tools',
        name: 'IT Tools',
        icon: 'build',
        description: 'Developer utilities for everyday tasks',
        path: '/it-tools',
        color: '#1565c0',
        badge: '24 tools',
      },
      {
        id: 'visualizer',
        name: 'Markdown Preview',
        icon: 'preview',
        description: 'Preview and validate markdown files',
        path: '/visualizer',
        color: '#7b1fa2',
      },
    ],
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <SEO
        title="CommandBoard - Your Productivity Toolkit"
        description="Free online productivity suite with todo lists, kanban boards, habit tracking, and developer tools. Manage tasks with markdown, track habits, and boost your productivity."
        canonical="/"
        keywords="productivity tools, todo list, kanban board, habit tracker, developer tools, markdown tasks, task manager"
      />
      <GitHubLink
        href="https://github.com/nicholaschen09/todo-list"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        GitHub
      </GitHubLink>

      <Header>
        <Logo>CommandBoard</Logo>
        <Tagline>Your productivity toolkit</Tagline>
      </Header>

      <MainContent>
        {categories.map((category) => (
          <CategorySection key={category.name}>
            <CategoryTitle>{category.name}</CategoryTitle>
            <CardsGrid>
              {category.features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  onClick={() => navigate(feature.path)}
                >
                  <IconWrapper $color={feature.color}>
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </IconWrapper>
                  <CardContent>
                    <CardTitle>{feature.name}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                    {feature.badge && <CardBadge>{feature.badge}</CardBadge>}
                  </CardContent>
                </FeatureCard>
              ))}
            </CardsGrid>
          </CategorySection>
        ))}
      </MainContent>

      <Attribution
        href="https://unsplash.com/@sebastian_unrau?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
        target="_blank"
        rel="noopener noreferrer"
      >
        Photo by Sebastian Unrau
      </Attribution>
    </PageContainer>
  );
};
