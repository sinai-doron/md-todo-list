import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../components/SEO';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuth } from '../firebase';
import { UserMenu } from '../components/UserMenu';
import type { GroceryItem, IngredientCategory } from '../types/Recipe';
import { CATEGORY_ORDER, formatQuantity } from '../types/Recipe';

// Color palette (matching Mise design)
const colors = {
  primary: '#2C3E50',
  primaryDark: '#1a252f',
  backgroundLight: '#F0F4F8',
  surface: '#ffffff',
  textMain: '#333333',
  textMuted: '#64748b',
  green500: '#22c55e',
  orange100: '#ffedd5',
  orange600: '#ea580c',
};

// Category display config with icons
const CATEGORY_CONFIG: Record<IngredientCategory, { label: string; icon: string }> = {
  produce: { label: 'Produce', icon: 'nutrition' },
  dairy: { label: 'Dairy & Refrigerated', icon: 'water_drop' },
  meat: { label: 'Meat & Seafood', icon: 'set_meal' },
  bakery: { label: 'Bakery', icon: 'bakery_dining' },
  frozen: { label: 'Frozen', icon: 'ac_unit' },
  pantry: { label: 'Pantry & Dry Goods', icon: 'kitchen' },
  spices: { label: 'Spices & Seasonings', icon: 'local_fire_department' },
  other: { label: 'Other Items', icon: 'category' },
};

// Kitchen staples list
const KITCHEN_STAPLES = [
  'Kosher Salt',
  'Olive Oil',
  'Black Pepper',
  'Vegetable Oil',
  'All-Purpose Flour',
  'Sugar',
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.backgroundLight};
  display: flex;
  flex-direction: column;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(240, 244, 248, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(44, 62, 80, 0.1);
  padding: 16px 24px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${colors.primary};
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.2);

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const LogoText = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textMain};
  font-family: 'Playfair Display', Georgia, serif;
`;

const Nav = styled.nav`
  display: none;
  align-items: center;
  gap: 32px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled.a<{ $active?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${(props) => (props.$active ? colors.primary : colors.textMuted)};
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;

  &:hover {
    color: ${colors.primary};
  }
`;

const ActiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.primary};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MobileMenuButton = styled.button`
  display: flex;
  color: ${colors.textMain};
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 16px;

  @media (min-width: 768px) {
    padding: 48px 24px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

const PageTitleGroup = styled.div``;

const PageLabel = styled.p`
  color: ${colors.primary};
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 8px 0;
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 36px;
  font-weight: 500;
  color: ${colors.textMain};
  margin: 0;
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$primary
      ? `
    background: ${colors.primary};
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(44, 62, 80, 0.2);

    &:hover {
      background: ${colors.primaryDark};
      transform: translateY(-1px);
    }
  `
      : `
    background: white;
    color: ${colors.textMain};
    border: 1px solid rgba(44, 62, 80, 0.15);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #f8f9fa;
      border-color: ${colors.primary};
    }
  `}

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    position: sticky;
    top: 96px;
  }
`;

const SectionCard = styled.div`
  background: ${colors.surface};
  border-radius: 16px;
  padding: 4px;
  box-shadow: 0 4px 20px -2px rgba(44, 62, 80, 0.08);
  border: 1px solid rgba(44, 62, 80, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(44, 62, 80, 0.12);
  }
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(44, 62, 80, 0.06);
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.primary};
  margin: 0;

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const ItemCount = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${colors.primary};
  opacity: 0.6;
  background: rgba(44, 62, 80, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
`;

const ItemList = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

const GroceryItemRow = styled.label<{ $bought: boolean }>`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${colors.backgroundLight};
  }

  ${(props) =>
    props.$bought &&
    `
    .item-name {
      text-decoration: line-through;
      color: ${colors.textMuted};
    }
  `}
`;

const Checkbox = styled.input`
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(44, 62, 80, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: grid;
  place-content: center;

  &::before {
    content: '';
    width: 14px;
    height: 14px;
    transform: scale(0);
    transition: transform 0.12s ease-in-out;
    box-shadow: inset 1em 1em white;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  &:checked {
    background: ${colors.primary};
    border-color: ${colors.primary};
  }

  &:checked::before {
    transform: scale(1);
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  user-select: none;
`;

const ItemName = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.textMain};
  margin: 0;
  line-height: 1.4;
  transition: all 0.2s;
`;

const ItemQuantity = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.textMuted};
  margin: 2px 0 0 0;
`;

const StaplesCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #e8eef5 0%, #dce4ed 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(44, 62, 80, 0.1);
`;

const StaplesDecoration = styled.div`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 128px;
  height: 128px;
  background: rgba(44, 62, 80, 0.1);
  border-radius: 50%;
  filter: blur(40px);
`;

const StaplesTitle = styled.h3`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 500;
  color: ${colors.textMain};
  margin: 0 0 4px 0;
`;

const StaplesSubtitle = styled.p`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.textMuted};
  margin: 0 0 20px 0;
`;

const StaplesList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StapleItem = styled.label`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(44, 62, 80, 0.1);
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: ${colors.textMain};
    transition: color 0.15s;
  }

  &:hover span {
    color: ${colors.primary};
  }
`;

const StapleCheckbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(44, 62, 80, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;

  &:checked {
    background: ${colors.primary};
    border-color: ${colors.primary};
  }
`;

const TipCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(44, 62, 80, 0.1);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(44, 62, 80, 0.03));
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const TipHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TipIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.orange100};
  color: ${colors.orange600};
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const TipTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.textMain};
  margin: 0 0 4px 0;
`;

const TipText = styled.p`
  font-size: 13px;
  color: ${colors.textMuted};
  margin: 0;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed rgba(44, 62, 80, 0.15);

  .material-symbols-outlined {
    font-size: 64px;
    color: ${colors.textMuted};
    opacity: 0.5;
    margin-bottom: 16px;
  }

  h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px;
    color: ${colors.textMain};
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: ${colors.textMuted};
    margin: 0 0 24px 0;
  }
`;

const FloatingAddButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${colors.primary};
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    background: ${colors.primaryDark};
  }

  .material-symbols-outlined {
    font-size: 28px;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

export function ShoppingListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const groceryItems = useRecipeStore((s) => s.groceryItems);
  const initializeFirebaseSync = useRecipeStore((s) => s.initializeFirebaseSync);
  const toggleGroceryItem = useRecipeStore((s) => s.toggleGroceryItem);
  const clearGroceryList = useRecipeStore((s) => s.clearGroceryList);

  // Initialize Firebase sync on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeFirebaseSync();
    };

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, [initializeFirebaseSync, user]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<IngredientCategory, GroceryItem[]> = {
      produce: [],
      dairy: [],
      meat: [],
      bakery: [],
      frozen: [],
      pantry: [],
      spices: [],
      other: [],
    };

    groceryItems.forEach((item) => {
      groups[item.category].push(item);
    });

    // Return only non-empty categories in order
    return CATEGORY_ORDER
      .filter((cat) => groups[cat].length > 0)
      .map((cat) => ({
        category: cat,
        items: groups[cat],
        config: CATEGORY_CONFIG[cat],
      }));
  }, [groceryItems]);

  // Calculate stats
  const totalItems = groceryItems.length;
  const boughtItems = groceryItems.filter((i) => i.bought).length;

  return (
    <PageContainer>
      <SEO
        title="Shopping List - Mise"
        description="Your grocery shopping list organized by category."
        canonical="/recipes/shopping"
        keywords="shopping list, grocery list, recipes"
      />

      <Header>
        <HeaderContent>
          <LogoGroup onClick={() => navigate('/')}>
            <LogoIcon>
              <span className="material-symbols-outlined">soup_kitchen</span>
            </LogoIcon>
            <LogoText>Mise</LogoText>
          </LogoGroup>

          <Nav>
            <NavLink onClick={() => navigate('/recipes')}>Recipes</NavLink>
            <NavLink onClick={() => navigate('/recipes/meal-plan')}>Meal Plan</NavLink>
            <NavLink $active>
              Shopping
              <ActiveDot />
            </NavLink>
          </Nav>

          <HeaderRight>
            <MobileMenuButton>
              <span className="material-symbols-outlined">menu</span>
            </MobileMenuButton>
            <UserMenu />
          </HeaderRight>
        </HeaderContent>
      </Header>

      <MainContent>
        <PageHeader>
          <PageTitleGroup>
            <PageLabel>My Groceries</PageLabel>
            <PageTitle>Shopping List</PageTitle>
          </PageTitleGroup>

          <HeaderActions>
            {totalItems > 0 && (
              <ActionButton onClick={clearGroceryList}>
                <span className="material-symbols-outlined">delete</span>
                Clear All
              </ActionButton>
            )}
            <ActionButton $primary onClick={() => navigate('/recipes')}>
              <span className="material-symbols-outlined">add</span>
              Add Recipes
            </ActionButton>
          </HeaderActions>
        </PageHeader>

        {totalItems === 0 ? (
          <EmptyState>
            <span className="material-symbols-outlined">shopping_cart</span>
            <h3>Your shopping list is empty</h3>
            <p>Add ingredients from your favorite recipes to start your list.</p>
            <ActionButton $primary onClick={() => navigate('/recipes')}>
              <span className="material-symbols-outlined">menu_book</span>
              Browse Recipes
            </ActionButton>
          </EmptyState>
        ) : (
          <LayoutGrid>
            <MainColumn>
              {groupedItems.map(({ category, items, config }) => (
                <SectionCard key={category}>
                  <SectionHeader>
                    <SectionTitle>
                      <span className="material-symbols-outlined">{config.icon}</span>
                      {config.label}
                    </SectionTitle>
                    <ItemCount>
                      {items.filter((i) => i.bought).length}/{items.length} items
                    </ItemCount>
                  </SectionHeader>
                  <ItemList>
                    {items.map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        $bought={item.bought}
                        onClick={() => toggleGroceryItem(item.id)}
                      >
                        <Checkbox
                          type="checkbox"
                          checked={item.bought}
                          onChange={() => {}} // Handled by label click
                        />
                        <ItemInfo>
                          <ItemName className="item-name">{item.name}</ItemName>
                          <ItemQuantity>
                            {formatQuantity(item.scaledQuantity)} {item.unit}
                            {item.recipeName && ` • ${item.recipeName}`}
                          </ItemQuantity>
                        </ItemInfo>
                      </GroceryItemRow>
                    ))}
                  </ItemList>
                </SectionCard>
              ))}
            </MainColumn>

            <SideColumn>
              <StaplesCard>
                <StaplesDecoration />
                <StaplesTitle>Kitchen Staples</StaplesTitle>
                <StaplesSubtitle>Check if running low</StaplesSubtitle>
                <StaplesList>
                  {KITCHEN_STAPLES.map((staple) => (
                    <StapleItem key={staple}>
                      <StapleCheckbox type="checkbox" />
                      <span>{staple}</span>
                    </StapleItem>
                  ))}
                </StaplesList>
              </StaplesCard>

              <TipCard>
                <TipHeader>
                  <TipIcon>
                    <span className="material-symbols-outlined">lightbulb</span>
                  </TipIcon>
                </TipHeader>
                <TipTitle>Chef's Tip</TipTitle>
                <TipText>
                  Don't forget to check your spice rack before heading out.
                  Dried herbs lose potency after 6 months.
                </TipText>
              </TipCard>

              {totalItems > 0 && (
                <TipCard>
                  <TipHeader>
                    <TipIcon style={{ background: '#dcfce7', color: '#16a34a' }}>
                      <span className="material-symbols-outlined">check_circle</span>
                    </TipIcon>
                  </TipHeader>
                  <TipTitle>Progress</TipTitle>
                  <TipText>
                    You've checked off {boughtItems} of {totalItems} items
                    {boughtItems === totalItems && ' - All done!'}
                  </TipText>
                </TipCard>
              )}
            </SideColumn>
          </LayoutGrid>
        )}
      </MainContent>

      <FloatingAddButton onClick={() => navigate('/recipes')}>
        <span className="material-symbols-outlined">add</span>
      </FloatingAddButton>
    </PageContainer>
  );
}
