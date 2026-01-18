import type { Recipe } from '../types/Recipe';

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-fish-patties-tomato-pepper-sauce',
    title: 'קציצות דגים ברוטב עגבניות וגמבות',
    description: 'קציצות דג מושט עסיסיות ברוטב עגבניות וגמבות עשיר עם כוסברה טרייה ושום. מתכון מסורתי ישראלי מושלם לשבת.',
    aboutDish: 'מנת קציצות הדגים הזו היא קלאסיקה ישראלית שעוברת מדור לדור. השילוב של דג מושט טרי עם רוטב עגבניות וגמבות עשיר יוצר מנה מפנקת ומלאת טעמים. הכוסברה והשום מעניקים ניחוחות ים-תיכוניים אותנטיים, והתוצאה היא מנה שמתאימה בול לארוחת שישי משפחתית או לכל אירוע חגיגי.',
    image: '',
    prepTime: 30,
    cookTime: 90,
    difficulty: 'medium',
    defaultServings: 8,
    author: '',
    rating: 4.8,
    reviewCount: 0,
    category: 'Main Dishes',
    tags: ['israeli', 'fish', 'shabbat', 'traditional', 'gluten-free-option'],
    language: 'he',

    nutrition: {
      calories: 380,
      protein: 42,
      carbs: 18,
      fat: 16,
    },

    chefTip: 'הקפידו לסנן את הדגים היטב לאחר הבישול כדי שהקציצות לא יהיו רטובות מדי. צינון מלא של הדגים לפני הפירור חיוני להצלחת המתכון!',

    ingredients: [
      // For Patties - Fish & Protein
      { id: 'i1', name: 'פילה מושט ללא עור', quantity: 2, unit: 'ק"ג', category: 'meat', notes: 'או דג לבן אחר' },
      { id: 'i2', name: 'ביצים', quantity: 3, unit: 'יחידות', category: 'dairy' },

      // For Patties - Bread & Binders
      { id: 'i3', name: 'לחם לבן', quantity: 2, unit: 'פרוסות', category: 'bakery', notes: 'החלק הרך בלבד' },
      { id: 'i4', name: 'קמח מצה', quantity: 3, unit: 'כפות', category: 'pantry' },

      // For Patties - Aromatics
      { id: 'i5', name: 'שיני שום', quantity: 7, unit: 'יחידות', category: 'produce', notes: 'כתושות' },
      { id: 'i6', name: 'כוסברה טרייה', quantity: 1, unit: 'חופן גדול', category: 'produce', notes: 'קצוצה' },

      // For Patties - Spices
      { id: 'i7', name: 'מלח', quantity: 1, unit: 'לפי הטעם', category: 'spices' },
      { id: 'i8', name: 'פלפל שחור', quantity: 1, unit: 'לפי הטעם', category: 'spices' },
      { id: 'i9', name: 'פפריקה', quantity: 1, unit: 'כף', category: 'spices', notes: 'לטיגון הראשוני' },
      { id: 'i10', name: 'שמן לטיגון', quantity: 1, unit: 'לטיגון', category: 'pantry' },

      // For Sauce - Vegetables
      { id: 'i11', name: 'גמבות (פלפלים)', quantity: 6, unit: 'יחידות', category: 'produce', notes: 'חתוכות לרצועות' },
      { id: 'i12', name: 'עגבניות', quantity: 6, unit: 'יחידות', category: 'produce', notes: 'קצוצות דק' },
      { id: 'i13', name: 'שיני שום', quantity: 15, unit: 'יחידות', category: 'produce', notes: 'קצוצות' },
      { id: 'i14', name: 'פלפל שטה', quantity: 1, unit: 'לפי הטעם', category: 'produce', notes: 'לפי מידת החריפות הרצויה' },
      { id: 'i15', name: 'כוסברה טרייה', quantity: 1, unit: 'חופן', category: 'produce', notes: 'קצוצה, לרוטב' },

      // For Sauce - Other
      { id: 'i16', name: 'פפריקה אדומה', quantity: 1, unit: 'כף', category: 'spices' },
      { id: 'i17', name: 'שמן לטיגון', quantity: 1, unit: 'מעט', category: 'pantry', notes: 'לרוטב' },
      { id: 'i18', name: 'מים', quantity: 0.5, unit: 'כוס', category: 'other' },
    ],

    steps: [
      {
        id: 's1',
        order: 1,
        description: 'מרתיחים מים בסיר גדול ומבשלים את פילה הדגים עד שהם מבושלים לגמרי.',
        timer: 720,
        tips: 'הדגים מוכנים כשהם מתפוררים בקלות עם מזלג'
      },
      {
        id: 's2',
        order: 2,
        description: 'מסננים את הדגים היטב ונותנים להם להתקרר לגמרי. חשוב לא לדלג על שלב זה!'
      },
      {
        id: 's3',
        order: 3,
        description: 'מפוררים את הדגים המצוננים עם מזלג לקערה גדולה.'
      },
      {
        id: 's4',
        order: 4,
        description: 'מוסיפים לקערה את הביצים, הלחם (החלק הרך), 7 שיני השום הכתושות, קמח המצה, הכוסברה הקצוצה, מלח ופלפל. מערבבים היטב עד לקבלת תערובת אחידה.'
      },
      {
        id: 's5',
        order: 5,
        description: 'מכניסים את תערובת הדגים למקרר להתייצבות.',
        timer: 3600,
        tips: 'שעה במקרר עוזרת לתערובת להתמצק ומקלה על יצירת הקציצות'
      },
      {
        id: 's6',
        order: 6,
        description: 'בזמן שהתערובת במקרר, מכינים את הרוטב: במחבת רחבה עם מעט שמן, מטגנים את הגמבות החתוכות לרצועות, 15 שיני השום הקצוצות, פלפל השטה והכוסברה.'
      },
      {
        id: 's7',
        order: 7,
        description: 'מוסיפים את העגבניות הקצוצות וכף פפריקה. מערבבים ומבשלים על אש נמוכה עד שהרוטב מסמיך מאוד.',
        timer: 3600,
        tips: 'רוטב טוב דורש סבלנות - אל תמהרו בשלב הזה'
      },
      {
        id: 's8',
        order: 8,
        description: 'מחממים שמן במחבת או סיר שטוח רחב יחד עם כף פפריקה. יוצרים קציצות מתערובת הדגים.'
      },
      {
        id: 's9',
        order: 9,
        description: 'מטגנים את הקציצות עד להזהבה קלה משני הצדדים.',
        tips: 'אין צורך לטגן עד הסוף - הקציצות ימשיכו להתבשל ברוטב'
      },
      {
        id: 's10',
        order: 10,
        description: 'שופכים את רוטב הגמבות והעגבניות מעל הקציצות המטוגנות.'
      },
      {
        id: 's11',
        order: 11,
        description: 'מוסיפים חצי כוס מים, מכסים ומבשלים על אש נמוכה עד שהקציצות ספוגות ברוטב.',
        timer: 1200,
        tips: 'אפשר להגיש עם אורז לבן, קוסקוס או לחם טרי לספיגת הרוטב'
      },
    ],

    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Helper to initialize store with mock data
export const initializeWithMockRecipes = (addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void) => {
  mockRecipes.forEach((recipe) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...recipeData } = recipe;
    addRecipe(recipeData);
  });
};
