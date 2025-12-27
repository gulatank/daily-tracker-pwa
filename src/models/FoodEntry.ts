export interface FoodEntry {
  id: string;
  timestamp: Date;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  recordingUrl?: string;
  transcription?: string;
}

export interface ParsedFoodItem {
  foodName: string;
  quantity: number;
  unit: string;
}

