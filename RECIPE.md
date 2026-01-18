# Recipe Data Transformer

Transform any recipe into the Mise app data format.

## Instructions

Provide a recipe in any format (text, URL content, image, etc.) and transform it into the following TypeScript data structure. Output ONLY the data object, ready to be added to `src/data/mockRecipes.ts`.

---

## Output Format

```typescript
{
  id: 'recipe-[unique-slug]',
  title: '',
  description: '',  // 1-2 sentence summary for recipe cards
  aboutDish: '',    // Optional: longer description about dish history/origin
  image: '',        // Optional: URL to image
  prepTime: 0,      // minutes
  cookTime: 0,      // minutes
  difficulty: 'easy' | 'medium' | 'hard',
  defaultServings: 4,
  author: '',       // Optional
  rating: 4.5,      // Optional: 0-5 scale
  reviewCount: 0,   // Optional
  category: '',     // See categories below
  tags: [],         // lowercase, relevant keywords

  nutrition: {      // Optional - estimate if not provided
    calories: 0,
    protein: 0,     // grams
    carbs: 0,       // grams
    fat: 0,         // grams
  },

  chefTip: '',      // Optional: helpful cooking tip
  language: 'en',   // 'en' | 'he' | 'ar' | 'fa' | 'ur' - for RTL/LTR support

  ingredients: [
    {
      id: 'i1',
      name: '',
      quantity: 0,
      unit: '',
      category: 'produce' | 'dairy' | 'meat' | 'bakery' | 'frozen' | 'pantry' | 'spices' | 'other',
      notes: '',    // Optional: preparation notes like "minced", "room temperature"
    },
  ],

  steps: [
    {
      id: 's1',
      order: 1,
      description: '',
      timer: 0,     // Optional: seconds (e.g., 300 = 5 min)
      tips: '',     // Optional: step-specific tip
    },
  ],

  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Reference Tables

### Recipe Categories
- `Main Dishes` - Entrees, dinner mains
- `Appetizers` - Starters, small plates
- `Soups & Stews` - Soups, stews, chilis
- `Salads` - Green salads, grain salads
- `Desserts` - Sweets, baked goods
- `Breakfast` - Morning meals, brunch
- `Sides` - Side dishes, accompaniments
- `Drinks` - Beverages, cocktails
- `Sauces` - Sauces, dressings, condiments

### Ingredient Categories
| Category | Use For |
|----------|---------|
| `produce` | Fresh fruits, vegetables, herbs, garlic, onions, leafy greens |
| `dairy` | Milk, cream, cheese, butter, eggs, yogurt |
| `meat` | Beef, chicken, pork, lamb, fish, shellfish, bacon, sausage |
| `bakery` | Bread, rolls, tortillas, pizza dough |
| `frozen` | Frozen vegetables, frozen fruits, ice cream |
| `pantry` | Pasta, rice, flour, sugar, canned goods, oils, vinegar, soy sauce |
| `spices` | Salt, pepper, dried herbs, spice blends, extracts |
| `other` | Anything that doesn't fit above |

### Common Units
- **Volume:** `cup`, `cups`, `tbsp`, `tsp`, `ml`, `L`, `fl oz`
- **Weight:** `lb`, `oz`, `g`, `kg`
- **Count:** `whole`, `large`, `medium`, `small`, `cloves`, `slices`, `pieces`, `strips`
- **Approximate:** `bunch`, `sprig`, `handful`, `pinch`, `dash`, `to taste`

### Difficulty Guidelines
- `easy` - Under 30 min total, basic techniques, few ingredients
- `medium` - 30-60 min, some skill required, moderate ingredient list
- `hard` - Over 60 min, advanced techniques, complex preparation

### Language Codes (RTL/LTR Support)
| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR |
| `he` | Hebrew | RTL |
| `ar` | Arabic | RTL |
| `fa` | Persian/Farsi | RTL |
| `ur` | Urdu | RTL |

---

## Transformation Rules

1. **Generate unique ID:** Use format `recipe-[slug]` where slug is lowercase, hyphenated title
2. **Write clear descriptions:** Card description (1-2 sentences), optional detailed aboutDish
3. **Estimate times:** If not provided, estimate based on steps
4. **Assign difficulty:** Based on time, technique complexity, and ingredient count
5. **Categorize ingredients:** Place each ingredient in the correct grocery category
6. **Parse quantities:** Convert fractions to decimals (1/2 = 0.5, 1/4 = 0.25)
7. **Add timers:** Include timer (in seconds) for steps that involve waiting (boiling, simmering, baking)
8. **Extract tips:** If recipe mentions tips, add to chefTip or step tips
9. **Generate tags:** Include cuisine type, main protein, cooking method, dietary info (vegetarian, gluten-free)
10. **Estimate nutrition:** If not provided, make reasonable estimates based on ingredients

---

## Example Input

```
Classic Margherita Pizza

A simple Italian pizza with fresh tomatoes, mozzarella, and basil.

Prep: 20 min | Cook: 12 min | Serves 2

Ingredients:
- 1 ball pizza dough (about 250g)
- 1/2 cup San Marzano tomato sauce
- 8 oz fresh mozzarella, sliced
- Fresh basil leaves
- 2 tbsp olive oil
- Salt to taste

Instructions:
1. Preheat oven to 500°F (260°C) with pizza stone for 30 minutes.
2. Stretch dough into 12-inch circle on floured surface.
3. Spread tomato sauce, leaving 1-inch border.
4. Arrange mozzarella slices evenly.
5. Bake 10-12 minutes until crust is golden and cheese is bubbly.
6. Top with fresh basil, drizzle with olive oil, and season with salt.

Tip: Don't overload with toppings - less is more for authentic Margherita!
```

## Example Output

```typescript
{
  id: 'recipe-classic-margherita-pizza',
  title: 'Classic Margherita Pizza',
  description: 'A simple Italian pizza with fresh tomatoes, mozzarella, and basil.',
  aboutDish: 'The Margherita pizza originated in Naples, Italy, and is named after Queen Margherita of Savoy. Its colors - red tomatoes, white mozzarella, and green basil - represent the Italian flag.',
  image: '',
  prepTime: 20,
  cookTime: 12,
  difficulty: 'medium',
  defaultServings: 2,
  author: '',
  rating: 4.7,
  reviewCount: 0,
  category: 'Main Dishes',
  tags: ['italian', 'pizza', 'vegetarian', 'classic'],

  nutrition: {
    calories: 680,
    protein: 24,
    carbs: 72,
    fat: 32,
  },

  chefTip: "Don't overload with toppings - less is more for authentic Margherita!",

  ingredients: [
    { id: 'i1', name: 'Pizza Dough', quantity: 250, unit: 'g', category: 'bakery' },
    { id: 'i2', name: 'San Marzano Tomato Sauce', quantity: 0.5, unit: 'cup', category: 'pantry' },
    { id: 'i3', name: 'Fresh Mozzarella', quantity: 8, unit: 'oz', category: 'dairy', notes: 'sliced' },
    { id: 'i4', name: 'Fresh Basil Leaves', quantity: 1, unit: 'handful', category: 'produce' },
    { id: 'i5', name: 'Olive Oil', quantity: 2, unit: 'tbsp', category: 'pantry' },
    { id: 'i6', name: 'Salt', quantity: 1, unit: 'pinch', category: 'spices', notes: 'to taste' },
  ],

  steps: [
    { id: 's1', order: 1, description: 'Preheat oven to 500°F (260°C) with pizza stone inside.', timer: 1800, tips: 'A hot stone is crucial for crispy crust' },
    { id: 's2', order: 2, description: 'Stretch dough into a 12-inch circle on a floured surface.' },
    { id: 's3', order: 3, description: 'Spread tomato sauce evenly, leaving a 1-inch border for the crust.' },
    { id: 's4', order: 4, description: 'Arrange mozzarella slices evenly over the sauce.' },
    { id: 's5', order: 5, description: 'Carefully transfer pizza to hot stone and bake until crust is golden and cheese is bubbly.', timer: 720 },
    { id: 's6', order: 6, description: 'Remove from oven, top with fresh basil leaves, drizzle with olive oil, and season with salt.' },
  ],

  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Your Recipe

Paste your recipe below and I will transform it:

```
[PASTE RECIPE HERE]
```
