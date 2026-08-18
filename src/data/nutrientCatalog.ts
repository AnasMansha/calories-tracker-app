import type { NutrientUnit } from '../types';

export interface NutrientCatalogItem {
  key: string;
  label: string;
  unit: NutrientUnit;
  defaultTarget: number;
  group: 'macro' | 'vitamin' | 'mineral';
}

export const NUTRIENT_CATALOG: NutrientCatalogItem[] = [
  { key: 'protein', label: 'Protein', unit: 'g', defaultTarget: 120, group: 'macro' },
  { key: 'carbs', label: 'Carbs', unit: 'g', defaultTarget: 250, group: 'macro' },
  { key: 'fat', label: 'Fat', unit: 'g', defaultTarget: 70, group: 'macro' },
  { key: 'fiber', label: 'Fiber', unit: 'g', defaultTarget: 30, group: 'macro' },
  { key: 'sugar', label: 'Sugar', unit: 'g', defaultTarget: 50, group: 'macro' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', defaultTarget: 2000, group: 'macro' },
  { key: 'vitamin_a', label: 'Vitamin A', unit: 'mcg', defaultTarget: 900, group: 'vitamin' },
  { key: 'vitamin_b1', label: 'Vitamin B1', unit: 'mg', defaultTarget: 1.2, group: 'vitamin' },
  { key: 'vitamin_b2', label: 'Vitamin B2', unit: 'mg', defaultTarget: 1.3, group: 'vitamin' },
  { key: 'vitamin_b3', label: 'Vitamin B3', unit: 'mg', defaultTarget: 16, group: 'vitamin' },
  { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg', defaultTarget: 1.3, group: 'vitamin' },
  { key: 'vitamin_b9', label: 'Folate (B9)', unit: 'mcg', defaultTarget: 400, group: 'vitamin' },
  { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'mcg', defaultTarget: 2.4, group: 'vitamin' },
  { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg', defaultTarget: 90, group: 'vitamin' },
  { key: 'vitamin_d', label: 'Vitamin D', unit: 'IU', defaultTarget: 600, group: 'vitamin' },
  { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg', defaultTarget: 15, group: 'vitamin' },
  { key: 'vitamin_k', label: 'Vitamin K', unit: 'mcg', defaultTarget: 120, group: 'vitamin' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', defaultTarget: 1000, group: 'mineral' },
  { key: 'iron', label: 'Iron', unit: 'mg', defaultTarget: 18, group: 'mineral' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', defaultTarget: 400, group: 'mineral' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', defaultTarget: 11, group: 'mineral' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', defaultTarget: 3400, group: 'mineral' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', defaultTarget: 700, group: 'mineral' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg', defaultTarget: 55, group: 'mineral' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg', defaultTarget: 150, group: 'mineral' },
];

export function getCatalogItem(key: string): NutrientCatalogItem | undefined {
  return NUTRIENT_CATALOG.find((item) => item.key === key);
}

export function formatNutrientAmount(value: number, unit: string): string {
  const rounded = unit === 'g' || unit === 'mg' || unit === 'mcg' || unit === 'IU' || unit === 'ml'
    ? Math.round(value * 10) / 10
    : Math.round(value);
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display} ${unit}`;
}
