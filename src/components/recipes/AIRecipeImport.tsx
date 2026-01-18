import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Recipe } from '../../types/Recipe';

const colors = {
  primary: '#2C3E50',
  primaryDark: '#1a252f',
  backgroundLight: '#F0F4F8',
  surface: '#ffffff',
  textMain: '#333333',
  textMuted: '#64748b',
  green500: '#22c55e',
  red500: '#ef4444',
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${colors.textMain};
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    color: ${colors.primary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;

  &:hover {
    color: #333;
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${(props) =>
    props.$active ? colors.primary : props.$completed ? colors.green500 : '#e0e0e0'};
  color: ${(props) => (props.$active || props.$completed ? 'white' : colors.textMuted)};
  transition: all 0.2s;

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textMain};
  margin-bottom: 8px;
`;

const HelpText = styled.p`
  font-size: 13px;
  color: ${colors.textMuted};
  margin: 0 0 12px 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
  }

  &::placeholder {
    color: ${colors.textMuted};
  }
`;

const PromptBox = styled.div`
  background: ${colors.backgroundLight};
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean; $success?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) =>
    props.$primary
      ? `
    background: ${colors.primary};
    color: white;
    &:hover {
      background: ${colors.primaryDark};
    }
  `
      : props.$success
      ? `
    background: ${colors.green500};
    color: white;
    &:hover {
      background: #16a34a;
    }
  `
      : `
    background: #f0f0f0;
    color: ${colors.textMain};
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: ${colors.red500};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const PreviewCard = styled.div`
  background: ${colors.backgroundLight};
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textMain};
`;

const PreviewMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: ${colors.textMuted};
  margin-bottom: 12px;
`;

const PreviewDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.textMain};
  line-height: 1.5;
`;

// Helper function to escape text for safe JSON string inclusion
function escapeForJSON(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Unicode line/paragraph separators (valid in JS but invalid in JSON)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    // Other control characters (0x00-0x1F except already handled)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, (char) =>
      '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
    );
}

// Helper function to sanitize JSON output from AI models
function sanitizeModelJSON(text: string): string {
  return text
    // Replace smart/curly quotes with straight quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    // Replace em/en dashes with regular dashes (inside strings)
    .replace(/[\u2013\u2014]/g, '-')
    // Remove Unicode line/paragraph separators
    .replace(/[\u2028\u2029]/g, '')
    // Remove zero-width characters that can break parsing
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove other invisible/control characters except valid whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

const CONVERSION_PROMPT = `You are a recipe data converter. Convert the provided recipe into the exact JSON format specified below.

## Output Format

\`\`\`json
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "aboutDish": "Optional longer description about the dish's origin, history, or what makes it special",
  "image": "",
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "easy|medium|hard",
  "defaultServings": 4,
  "category": "Main Dishes|Appetizers|Desserts|Soups|Salads|Breakfast|Beverages|Side Dishes|Snacks",
  "tags": ["tag1", "tag2"],
  "author": "Optional author name",
  "rating": 4.5,
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15
  },
  "chefTip": "Optional professional tip for best results",
  "language": "en|he",
  "ingredients": [
    {
      "id": "ing-1",
      "name": "ingredient name",
      "quantity": 2,
      "unit": "cups|tbsp|tsp|g|kg|ml|l|oz|lb|pieces|cloves|whole",
      "category": "produce|dairy|meat|pantry|frozen|bakery|spices|other",
      "notes": "optional notes like 'diced' or 'room temperature'"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "description": "Step instruction text",
      "timer": 300,
      "tips": "Optional tip for this step"
    }
  ]
}
\`\`\`

## Category Mapping for Ingredients
- **produce**: fruits, vegetables, fresh herbs, garlic, onions, potatoes
- **dairy**: milk, cheese, butter, eggs, cream, yogurt
- **meat**: beef, chicken, pork, fish, seafood, lamb
- **bakery**: bread, tortillas, pita, buns, pastry
- **frozen**: frozen vegetables, ice cream, frozen fruits
- **pantry**: pasta, rice, flour, sugar, canned goods, oils, vinegar, sauces
- **spices**: salt, pepper, cumin, paprika, dried herbs, spice blends
- **other**: anything that doesn't fit above

## Rules
1. Generate unique IDs for ingredients (ing-1, ing-2...) and steps (step-1, step-2...)
2. Timer is in SECONDS (5 minutes = 300 seconds). Only add timer if step involves waiting/cooking time
3. Times (prepTime, cookTime) are in MINUTES
4. Quantity must be a number (use 0.5 for "half", 0.25 for "quarter")
5. Keep step descriptions clear and actionable
6. Use "en" for English recipes, "he" for Hebrew recipes
7. Estimate nutrition if not provided (per serving)
8. Tags should be lowercase, no spaces (use hyphens if needed)
9. Difficulty: easy (under 30 min, simple techniques), medium (30-60 min or moderate skill), hard (60+ min or advanced techniques)

## Recipe to Convert

Note: The recipe text below has special characters pre-escaped for JSON (e.g., quotes as \\", backslashes as \\\\, newlines as \\n). Use these escaped values directly in your JSON string fields.

`;

interface AIRecipeImportProps {
  onImport: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

type ImportStep = 'input' | 'prompt' | 'result';

export const AIRecipeImport: React.FC<AIRecipeImportProps> = ({ onImport, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ImportStep>('input');
  const [recipeText, setRecipeText] = useState('');
  const [jsonResult, setJsonResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

  const fullPrompt = CONVERSION_PROMPT + escapeForJSON(recipeText) + '\n\n---\n\nOutput ONLY the JSON object, no additional text or markdown code blocks.';

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleParseJSON = () => {
    setError(null);
    try {
      // Clean the JSON - remove markdown code blocks if present
      let cleanJson = jsonResult.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.slice(0, -3);
      }
      cleanJson = cleanJson.trim();

      // Sanitize the JSON to fix common AI model output issues
      cleanJson = sanitizeModelJSON(cleanJson);

      const parsed = JSON.parse(cleanJson);

      // Validate required fields
      if (!parsed.title || !parsed.ingredients || !parsed.steps) {
        throw new Error('Missing required fields: title, ingredients, or steps');
      }

      // Ensure arrays exist
      if (!Array.isArray(parsed.ingredients)) {
        throw new Error('Ingredients must be an array');
      }
      if (!Array.isArray(parsed.steps)) {
        throw new Error('Steps must be an array');
      }

      // Set defaults for optional fields
      const recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
        title: parsed.title,
        description: parsed.description || '',
        aboutDish: parsed.aboutDish,
        image: parsed.image,
        prepTime: parsed.prepTime || 15,
        cookTime: parsed.cookTime || 30,
        difficulty: parsed.difficulty || 'medium',
        defaultServings: parsed.defaultServings || 4,
        ingredients: parsed.ingredients,
        steps: parsed.steps,
        tags: parsed.tags || [],
        category: parsed.category || 'Main Dishes',
        author: parsed.author,
        rating: parsed.rating,
        reviewCount: parsed.reviewCount,
        nutrition: parsed.nutrition,
        chefTip: parsed.chefTip,
        language: parsed.language || 'en',
      };

      setParsedRecipe(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setParsedRecipe(null);
    }
  };

  const handleImport = () => {
    if (parsedRecipe) {
      onImport(parsedRecipe);
      onClose();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <span className="material-symbols-outlined">auto_awesome</span>
            AI Recipe Import
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          <StepIndicator>
            <Step $active={step === 'input'} $completed={step !== 'input'}>
              {step !== 'input' ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                '1 '
              )}
              Paste Recipe
            </Step>
            <Step $active={step === 'prompt'} $completed={step === 'result'}>
              {step === 'result' ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                '2 '
              )}
              Copy Prompt
            </Step>
            <Step $active={step === 'result'} $completed={false}>
              {'3 '}
              Import
            </Step>
          </StepIndicator>

          {step === 'input' && (
            <Section>
              <Label>Paste your recipe</Label>
              <HelpText>
                Paste any recipe text - from a website, cookbook, or your own notes.
                The AI will convert it to our format.
              </HelpText>
              <TextArea
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder="Paste your recipe here...

Example:
Classic Spaghetti Carbonara

Ingredients:
- 400g spaghetti
- 200g guanciale or pancetta
- 4 egg yolks
- 100g pecorino romano
- Black pepper

Instructions:
1. Cook pasta in salted water
2. Fry guanciale until crispy
3. Mix egg yolks with cheese
4. Combine everything off heat
..."
              />
              <ButtonRow>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  $primary
                  onClick={() => setStep('prompt')}
                  disabled={!recipeText.trim()}
                >
                  Next
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Button>
              </ButtonRow>
            </Section>
          )}

          {step === 'prompt' && (
            <Section>
              <Label>Copy this prompt to Claude or ChatGPT</Label>
              <HelpText>
                Copy the prompt below and paste it into your preferred AI assistant.
                Then copy the JSON response back here.
              </HelpText>
              <PromptBox>{fullPrompt}</PromptBox>
              <ButtonRow>
                <Button onClick={() => setStep('input')}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </Button>
                <Button $success onClick={handleCopyPrompt}>
                  <span className="material-symbols-outlined">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
                <Button $primary onClick={() => setStep('result')}>
                  I have the result
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Button>
              </ButtonRow>
            </Section>
          )}

          {step === 'result' && (
            <Section>
              <Label>Paste the JSON result</Label>
              <HelpText>
                Paste the JSON that the AI generated. We'll validate and import it.
              </HelpText>
              <TextArea
                value={jsonResult}
                onChange={(e) => {
                  setJsonResult(e.target.value);
                  setError(null);
                  setParsedRecipe(null);
                }}
                placeholder='Paste the JSON here...

{
  "title": "Recipe Name",
  "description": "...",
  ...
}'
              />
              <ButtonRow>
                <Button onClick={() => setStep('prompt')}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </Button>
                <Button $primary onClick={handleParseJSON} disabled={!jsonResult.trim()}>
                  <span className="material-symbols-outlined">check_circle</span>
                  Validate JSON
                </Button>
              </ButtonRow>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              {parsedRecipe && (
                <>
                  <SuccessMessage>
                    <span className="material-symbols-outlined">check_circle</span>
                    Recipe parsed successfully!
                  </SuccessMessage>
                  <PreviewCard>
                    <PreviewTitle>{parsedRecipe.title}</PreviewTitle>
                    <PreviewMeta>
                      <span>{parsedRecipe.prepTime + parsedRecipe.cookTime} min</span>
                      <span>{parsedRecipe.difficulty}</span>
                      <span>{parsedRecipe.defaultServings} servings</span>
                      <span>{parsedRecipe.ingredients.length} ingredients</span>
                      <span>{parsedRecipe.steps.length} steps</span>
                    </PreviewMeta>
                    <PreviewDescription>{parsedRecipe.description}</PreviewDescription>
                  </PreviewCard>
                </>
              )}
            </Section>
          )}
        </Content>

        <Footer>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          {step === 'result' && parsedRecipe && (
            <Button $success onClick={handleImport}>
              <span className="material-symbols-outlined">add</span>
              Import Recipe
            </Button>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};
