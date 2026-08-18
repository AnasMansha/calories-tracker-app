import type { MealCategory, NutrientValues, SavedFood } from '../types';
import { normalizeFoodName } from '../utils/foodNames';

export const FOOD_SEED_VERSION = 1;

interface SeedItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  meal?: MealCategory;
}

function toSavedFood(item: SeedItem, updatedAt: string): SavedFood {
  const nutrients: NutrientValues = {};
  if (item.protein) {
    nutrients.protein = item.protein;
  }
  if (item.carbs) {
    nutrients.carbs = item.carbs;
  }
  return {
    nameKey: normalizeFoodName(item.name),
    name: item.name,
    calories: item.calories,
    nutrients,
    meal: item.meal ?? null,
    updatedAt,
    source: 'seed',
  };
}

const SEED: SeedItem[] = [
  { name: 'Roti / chapati (1 medium, ~40g)', calories: 100, protein: 3, carbs: 20, meal: 'lunch' },
  { name: 'Tandoori roti (1, ~60g)', calories: 170, protein: 5, carbs: 32, meal: 'dinner' },
  { name: 'Naan (1, ~120g)', calories: 330, protein: 10, carbs: 58, meal: 'dinner' },
  { name: 'Garlic naan (1)', calories: 360, protein: 10, carbs: 58, meal: 'dinner' },
  { name: 'Roghni naan (1)', calories: 380, protein: 9, carbs: 56, meal: 'dinner' },
  { name: 'Plain paratha (1, ~80g)', calories: 265, protein: 5, carbs: 38, meal: 'breakfast' },
  { name: 'Aloo paratha (1, ~120g)', calories: 325, protein: 6, carbs: 42, meal: 'breakfast' },
  { name: 'Anda paratha (1)', calories: 380, protein: 12, carbs: 38, meal: 'breakfast' },
  { name: 'Keema paratha (1)', calories: 420, protein: 16, carbs: 36, meal: 'breakfast' },
  { name: 'Puri (1, ~35g)', calories: 135, protein: 3, carbs: 16, meal: 'breakfast' },
  { name: 'Halwa puri plate', calories: 650, protein: 12, carbs: 80, meal: 'breakfast' },
  { name: 'Chicken biryani (1 plate, ~300g)', calories: 500, protein: 26, carbs: 52, meal: 'lunch' },
  { name: 'Beef biryani (1 plate, ~300g)', calories: 560, protein: 28, carbs: 50, meal: 'lunch' },
  { name: 'Mutton biryani (1 plate, ~300g)', calories: 580, protein: 27, carbs: 50, meal: 'lunch' },
  { name: 'Vegetable biryani (1 plate)', calories: 380, protein: 10, carbs: 55, meal: 'lunch' },
  { name: 'Chicken pulao (1 plate, ~280g)', calories: 480, protein: 24, carbs: 50, meal: 'lunch' },
  { name: 'Beef pulao (1 plate)', calories: 520, protein: 26, carbs: 48, meal: 'lunch' },
  { name: 'White rice (1 cup cooked)', calories: 240, protein: 4, carbs: 53, meal: 'lunch' },
  { name: 'Brown rice (1 cup cooked)', calories: 215, protein: 5, carbs: 45, meal: 'lunch' },
  { name: 'Boiled egg (1 large)', calories: 78, protein: 6, carbs: 1, meal: 'breakfast' },
  { name: 'Fried egg (1)', calories: 120, protein: 6, carbs: 1, meal: 'breakfast' },
  { name: 'Omelette (2 eggs)', calories: 200, protein: 13, carbs: 2, meal: 'breakfast' },
  { name: 'Anda bhurji (2 eggs)', calories: 240, protein: 14, carbs: 4, meal: 'breakfast' },
  { name: 'Zinger burger (150g patty, mayo loaded)', calories: 720, protein: 32, carbs: 52, meal: 'lunch' },
  { name: 'Chicken burger', calories: 520, protein: 26, carbs: 42, meal: 'lunch' },
  { name: 'Chicken shawarma (1 wrap)', calories: 520, protein: 28, carbs: 42, meal: 'lunch' },
  { name: 'Beef shawarma (1 wrap)', calories: 560, protein: 30, carbs: 40, meal: 'lunch' },
  { name: 'Pizza slice (regular)', calories: 280, protein: 12, carbs: 32, meal: 'snack' },
  { name: 'Pizza (medium, 1/4)', calories: 420, protein: 18, carbs: 46, meal: 'dinner' },
  { name: 'Daal (1 bowl, ~200g)', calories: 200, protein: 12, carbs: 30, meal: 'lunch' },
  { name: 'Daal chawal (1 plate)', calories: 420, protein: 16, carbs: 68, meal: 'lunch' },
  { name: 'Chicken karahi (1 serving, ~200g)', calories: 320, protein: 28, carbs: 8, meal: 'dinner' },
  { name: 'Mutton karahi (1 serving)', calories: 380, protein: 26, carbs: 6, meal: 'dinner' },
  { name: 'Chicken korma (1 bowl)', calories: 340, protein: 24, carbs: 10, meal: 'dinner' },
  { name: 'Nihari (1 bowl, ~250g)', calories: 420, protein: 28, carbs: 10, meal: 'breakfast' },
  { name: 'Haleem (1 bowl)', calories: 320, protein: 22, carbs: 28, meal: 'lunch' },
  { name: 'Seekh kebab (2 pieces)', calories: 280, protein: 20, carbs: 4, meal: 'dinner' },
  { name: 'Chicken tikka (6 pieces)', calories: 260, protein: 32, carbs: 4, meal: 'dinner' },
  { name: 'Chicken tikka boti (1 serving)', calories: 300, protein: 34, carbs: 3, meal: 'dinner' },
  { name: 'Butter chicken (1 serving)', calories: 360, protein: 26, carbs: 12, meal: 'dinner' },
  { name: 'Palak paneer (1 cup)', calories: 250, protein: 12, carbs: 10, meal: 'lunch' },
  { name: 'Chana chaat (1 plate)', calories: 280, protein: 12, carbs: 38, meal: 'snack' },
  { name: 'Chana masala (1 bowl)', calories: 260, protein: 13, carbs: 34, meal: 'lunch' },
  { name: 'Aloo sabzi (1 bowl)', calories: 180, protein: 4, carbs: 28, meal: 'lunch' },
  { name: 'Mixed sabzi (1 bowl)', calories: 140, protein: 4, carbs: 18, meal: 'lunch' },
  { name: 'Dahi / yogurt (1 cup)', calories: 140, protein: 8, carbs: 11, meal: 'snack' },
  { name: 'Raita (1 bowl)', calories: 70, protein: 4, carbs: 6, meal: 'lunch' },
  { name: 'Lassi plain (1 glass)', calories: 140, protein: 6, carbs: 16, meal: 'snack' },
  { name: 'Mango lassi (1 glass)', calories: 220, protein: 6, carbs: 36, meal: 'snack' },
  { name: 'Gol gappa / pani puri (6 pieces)', calories: 180, protein: 4, carbs: 28, meal: 'snack' },
  { name: 'Pakora (6 pieces)', calories: 280, protein: 8, carbs: 24, meal: 'snack' },
  { name: 'Samosa (1)', calories: 260, protein: 5, carbs: 24, meal: 'snack' },
  { name: 'Vegetable samosa (1)', calories: 220, protein: 4, carbs: 26, meal: 'snack' },
  { name: 'Jalebi (2 pieces)', calories: 300, protein: 2, carbs: 50, meal: 'snack' },
  { name: 'Gulab jamun (2 pieces)', calories: 280, protein: 4, carbs: 42, meal: 'snack' },
  { name: 'Kheer (1 bowl)', calories: 260, protein: 7, carbs: 38, meal: 'snack' },
  { name: 'Sooji halwa (1 bowl)', calories: 320, protein: 5, carbs: 44, meal: 'breakfast' },
  { name: 'Gajar ka halwa (1 bowl)', calories: 300, protein: 5, carbs: 40, meal: 'snack' },
  { name: 'Ras malai (2 pieces)', calories: 240, protein: 8, carbs: 28, meal: 'snack' },
  { name: 'Club sandwich', calories: 480, protein: 22, carbs: 42, meal: 'lunch' },
  { name: 'French fries (medium)', calories: 360, protein: 4, carbs: 48, meal: 'snack' },
  { name: 'Pepsi (330ml)', calories: 140, protein: 0, carbs: 35, meal: 'snack' },
  { name: 'Coke (330ml)', calories: 140, protein: 0, carbs: 35, meal: 'snack' },
  { name: 'Chai with 1 tsp sugar (1 cup)', calories: 90, protein: 2, carbs: 12, meal: 'breakfast' },
  { name: 'Doodh patti (1 cup)', calories: 120, protein: 4, carbs: 14, meal: 'breakfast' },
  { name: 'Green tea (unsweetened)', calories: 2, protein: 0, carbs: 0, meal: 'snack' },
  { name: 'Naan with nihari (1 serving)', calories: 720, protein: 36, carbs: 62, meal: 'breakfast' },
  { name: 'Paye (1 bowl)', calories: 380, protein: 24, carbs: 6, meal: 'breakfast' },
  { name: 'Qeema (1 serving)', calories: 300, protein: 22, carbs: 6, meal: 'lunch' },
  { name: 'Chicken handi (1 serving)', calories: 340, protein: 28, carbs: 8, meal: 'dinner' },
  { name: 'Fish fry (1 serving)', calories: 280, protein: 26, carbs: 8, meal: 'dinner' },
  { name: 'Chicken corn soup (1 bowl)', calories: 160, protein: 10, carbs: 16, meal: 'dinner' },
  { name: 'Hot and sour soup (1 bowl)', calories: 140, protein: 8, carbs: 14, meal: 'dinner' },
  { name: 'Fried rice (1 plate)', calories: 420, protein: 12, carbs: 62, meal: 'dinner' },
  { name: 'Chicken manchurian (1 serving)', calories: 380, protein: 22, carbs: 28, meal: 'dinner' },
  { name: 'Chapli kebab (1)', calories: 240, protein: 16, carbs: 8, meal: 'dinner' },
  { name: 'Malai boti (6 pieces)', calories: 320, protein: 28, carbs: 4, meal: 'dinner' },
  { name: 'Behari kebab (6 pieces)', calories: 300, protein: 24, carbs: 4, meal: 'dinner' },
  { name: 'Aloo keema (1 serving)', calories: 320, protein: 18, carbs: 18, meal: 'lunch' },
  { name: 'Bhindi masala (1 bowl)', calories: 160, protein: 4, carbs: 14, meal: 'lunch' },
  { name: 'Baingan bharta (1 bowl)', calories: 150, protein: 3, carbs: 16, meal: 'lunch' },
  { name: 'Palak gosht (1 serving)', calories: 300, protein: 22, carbs: 10, meal: 'dinner' },
  { name: 'Saag (1 bowl)', calories: 180, protein: 6, carbs: 12, meal: 'lunch' },
  { name: 'Makki ki roti (1)', calories: 160, protein: 4, carbs: 28, meal: 'lunch' },
  { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, meal: 'snack' },
  { name: 'Apple (1 medium)', calories: 95, protein: 0, carbs: 25, meal: 'snack' },
  { name: 'Mango (1 medium)', calories: 150, protein: 2, carbs: 37, meal: 'snack' },
  { name: 'Dates (3 pieces)', calories: 90, protein: 1, carbs: 24, meal: 'snack' },
  { name: 'Roasted chana (1 handful)', calories: 160, protein: 8, carbs: 22, meal: 'snack' },
  { name: 'Peanuts (1 handful)', calories: 170, protein: 7, carbs: 6, meal: 'snack' },
  { name: 'Protein bar', calories: 210, protein: 20, carbs: 22, meal: 'snack' },
  { name: 'Milk (1 glass, full cream)', calories: 150, protein: 8, carbs: 12, meal: 'breakfast' },
  { name: 'Paratha with omelette', calories: 460, protein: 18, carbs: 40, meal: 'breakfast' },
  { name: 'Toast with egg (2 slices)', calories: 280, protein: 14, carbs: 26, meal: 'breakfast' },
  { name: 'Cornflakes with milk (1 bowl)', calories: 220, protein: 8, carbs: 36, meal: 'breakfast' },
  { name: 'Poha / chivda (1 plate)', calories: 250, protein: 6, carbs: 42, meal: 'breakfast' },
  { name: 'Dosa (1)', calories: 170, protein: 4, carbs: 28, meal: 'breakfast' },
  { name: 'Idli (2)', calories: 120, protein: 4, carbs: 22, meal: 'breakfast' },
  { name: 'Bun kebab', calories: 420, protein: 16, carbs: 38, meal: 'snack' },
  { name: 'Anda shami burger', calories: 480, protein: 20, carbs: 36, meal: 'snack' },
  { name: 'Broast chicken (2 pieces)', calories: 420, protein: 28, carbs: 16, meal: 'dinner' },
  { name: 'Chicken wings (6 pieces)', calories: 380, protein: 26, carbs: 12, meal: 'snack' },
  { name: 'Nuggets (6 pieces)', calories: 280, protein: 14, carbs: 18, meal: 'snack' },
  { name: 'Pasta (1 plate, creamy)', calories: 520, protein: 16, carbs: 58, meal: 'dinner' },
  { name: 'Chicken sandwich', calories: 380, protein: 22, carbs: 34, meal: 'lunch' },
  { name: 'Egg sandwich', calories: 320, protein: 16, carbs: 28, meal: 'breakfast' },
];

export function createSeedFoods(now: string = new Date().toISOString()): SavedFood[] {
  const unique = new Map<string, SavedFood>();
  for (const item of SEED) {
    const food = toSavedFood(item, now);
    unique.set(food.nameKey, food);
  }
  return [...unique.values()];
}
