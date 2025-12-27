export interface FoodNutrients {
  name: string;
  calories: number; // per 100g or per serving
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
  standardServing: number; // grams
  standardUnit: string;
}

export class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  
  // Local database for common Indian, Asian, and Western foods
  private localFoodDatabase: Record<string, FoodNutrients> = {
    // Indian Foods (per 100g unless specified)
    "roti": { name: "Roti", calories: 297, protein: 7.85, carbs: 46.36, fats: 7.45, fiber: 4.9, sugar: 0, sodium: 298, standardServing: 60, standardUnit: "piece" },
    "chapati": { name: "Roti", calories: 297, protein: 7.85, carbs: 46.36, fats: 7.45, fiber: 4.9, sugar: 0, sodium: 298, standardServing: 60, standardUnit: "piece" },
    "naan": { name: "Naan", calories: 310, protein: 8.0, carbs: 48.0, fats: 10.0, fiber: 2.0, sugar: 2.0, sodium: 400, standardServing: 90, standardUnit: "piece" },
    "dal": { name: "Dal", calories: 105, protein: 6.8, carbs: 18.3, fats: 1.4, fiber: 4.8, sugar: 1.2, sodium: 300, standardServing: 200, standardUnit: "bowl" },
    "dal fry": { name: "Dal Fry", calories: 125, protein: 6.8, carbs: 20.3, fats: 2.4, fiber: 4.8, sugar: 1.2, sodium: 400, standardServing: 200, standardUnit: "bowl" },
    "dal tadka": { name: "Dal Fry", calories: 125, protein: 6.8, carbs: 20.3, fats: 2.4, fiber: 4.8, sugar: 1.2, sodium: 400, standardServing: 200, standardUnit: "bowl" },
    "rice": { name: "Rice", calories: 130, protein: 2.7, carbs: 28.0, fats: 0.3, fiber: 0.4, sugar: 0.05, sodium: 1, standardServing: 100, standardUnit: "cup" },
    "biriyani": { name: "Biryani", calories: 225, protein: 12.0, carbs: 35.0, fats: 5.0, fiber: 2.0, sugar: 2.0, sodium: 600, standardServing: 250, standardUnit: "plate" },
    "biryani": { name: "Biryani", calories: 225, protein: 12.0, carbs: 35.0, fats: 5.0, fiber: 2.0, sugar: 2.0, sodium: 600, standardServing: 250, standardUnit: "plate" },
    "paneer": { name: "Paneer", calories: 295, protein: 18.3, carbs: 3.4, fats: 20.8, fiber: 0, sugar: 3.4, sodium: 15, standardServing: 100, standardUnit: "grams" },
    "paratha": { name: "Paratha", calories: 326, protein: 6.36, carbs: 45.36, fats: 13.6, fiber: 2.7, sugar: 0, sodium: 500, standardServing: 100, standardUnit: "piece" },
    "dosa": { name: "Dosa", calories: 133, protein: 2.7, carbs: 23.4, fats: 3.2, fiber: 1.5, sugar: 0.5, sodium: 300, standardServing: 50, standardUnit: "piece" },
    "idli": { name: "Idli", calories: 39, protein: 2.2, carbs: 7.5, fats: 0.2, fiber: 1.0, sugar: 0.3, sodium: 220, standardServing: 38, standardUnit: "piece" },
    "sambar": { name: "Sambar", calories: 85, protein: 3.5, carbs: 15.0, fats: 1.5, fiber: 3.0, sugar: 4.0, sodium: 450, standardServing: 150, standardUnit: "bowl" },
    "curry": { name: "Curry", calories: 120, protein: 4.0, carbs: 12.0, fats: 6.0, fiber: 2.0, sugar: 5.0, sodium: 500, standardServing: 200, standardUnit: "bowl" },
    "aloo": { name: "Aloo Curry", calories: 150, protein: 2.5, carbs: 20.0, fats: 6.5, fiber: 2.5, sugar: 3.0, sodium: 400, standardServing: 150, standardUnit: "bowl" },
    "gobi": { name: "Gobi Curry", calories: 100, protein: 3.0, carbs: 12.0, fats: 4.0, fiber: 3.5, sugar: 4.0, sodium: 450, standardServing: 150, standardUnit: "bowl" },
    "chana": { name: "Chana Masala", calories: 180, protein: 8.5, carbs: 28.0, fats: 4.5, fiber: 7.0, sugar: 5.0, sodium: 600, standardServing: 200, standardUnit: "bowl" },
    "chole": { name: "Chana Masala", calories: 180, protein: 8.5, carbs: 28.0, fats: 4.5, fiber: 7.0, sugar: 5.0, sodium: 600, standardServing: 200, standardUnit: "bowl" },
    "rajma": { name: "Rajma", calories: 175, protein: 9.0, carbs: 26.0, fats: 4.0, fiber: 8.0, sugar: 4.0, sodium: 500, standardServing: 200, standardUnit: "bowl" },
    
    // Asian Foods
    "sushi": { name: "Sushi", calories: 150, protein: 6.0, carbs: 28.0, fats: 2.0, fiber: 1.0, sugar: 3.0, sodium: 600, standardServing: 100, standardUnit: "piece" },
    "ramen": { name: "Ramen", calories: 200, protein: 8.0, carbs: 35.0, fats: 4.0, fiber: 2.0, sugar: 2.0, sodium: 1200, standardServing: 250, standardUnit: "bowl" },
    "noodles": { name: "Noodles", calories: 138, protein: 4.5, carbs: 25.0, fats: 2.1, fiber: 1.8, sugar: 0.5, sodium: 400, standardServing: 200, standardUnit: "bowl" },
    "fried rice": { name: "Fried Rice", calories: 163, protein: 4.3, carbs: 28.0, fats: 3.8, fiber: 1.0, sugar: 0.8, sodium: 500, standardServing: 200, standardUnit: "plate" },
    "pho": { name: "Pho", calories: 350, protein: 15.0, carbs: 45.0, fats: 10.0, fiber: 2.0, sugar: 3.0, sodium: 1000, standardServing: 350, standardUnit: "bowl" },
    "pad thai": { name: "Pad Thai", calories: 357, protein: 14.0, carbs: 52.0, fats: 11.0, fiber: 2.5, sugar: 8.0, sodium: 800, standardServing: 200, standardUnit: "plate" },
    "dumpling": { name: "Dumpling", calories: 42, protein: 2.0, carbs: 6.0, fats: 1.0, fiber: 0.3, sugar: 0.5, sodium: 200, standardServing: 25, standardUnit: "piece" },
    
    // Western Foods
    "pizza": { name: "Pizza", calories: 266, protein: 11.0, carbs: 33.0, fats: 10.0, fiber: 2.3, sugar: 3.6, sodium: 551, standardServing: 100, standardUnit: "slice" },
    "pasta": { name: "Pasta", calories: 131, protein: 5.0, carbs: 25.0, fats: 1.1, fiber: 1.8, sugar: 0.6, sodium: 6, standardServing: 100, standardUnit: "grams" },
    "burger": { name: "Burger", calories: 354, protein: 16.0, carbs: 33.0, fats: 16.0, fiber: 2.0, sugar: 5.0, sodium: 497, standardServing: 150, standardUnit: "piece" },
    "sandwich": { name: "Sandwich", calories: 250, protein: 10.0, carbs: 35.0, fats: 8.0, fiber: 3.0, sugar: 5.0, sodium: 600, standardServing: 150, standardUnit: "piece" },
    "salad": { name: "Salad", calories: 20, protein: 1.0, carbs: 4.0, fats: 0.2, fiber: 1.5, sugar: 2.0, sodium: 10, standardServing: 100, standardUnit: "grams" },
    "chicken": { name: "Chicken", calories: 165, protein: 31.0, carbs: 0.0, fats: 3.6, fiber: 0, sugar: 0, sodium: 74, standardServing: 100, standardUnit: "grams" },
    "bread": { name: "Bread", calories: 265, protein: 9.0, carbs: 49.0, fats: 3.2, fiber: 2.7, sugar: 5.7, sodium: 491, standardServing: 100, standardUnit: "grams" }
  };
  
  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }
  
  getNutrients(foodName: string, quantity: number, unit: string): FoodNutrients | null {
    const lowercased = foodName.toLowerCase().trim();
    
    // Try exact match first
    if (this.localFoodDatabase[lowercased]) {
      return this.scaleNutrients(this.localFoodDatabase[lowercased], quantity, unit);
    }
    
    // Try partial match
    for (const [key, nutrients] of Object.entries(this.localFoodDatabase)) {
      if (lowercased.includes(key) || key.includes(lowercased)) {
        return this.scaleNutrients(nutrients, quantity, unit);
      }
    }
    
    return null;
  }
  
  private scaleNutrients(baseNutrients: FoodNutrients, quantity: number, unit: string): FoodNutrients {
    // Convert quantity to standard serving size
    let standardQuantity: number;
    
    // Normalize units
    const normalizedUnit = unit.toLowerCase();
    const standardUnitLower = baseNutrients.standardUnit.toLowerCase();
    
    if (normalizedUnit === standardUnitLower) {
      standardQuantity = quantity;
    } else {
      // Try to convert between common units
      // For now, assume 1 serving = 1 piece/bowl/plate/cup
      if ((normalizedUnit.includes("piece") || normalizedUnit.includes("pieces")) && standardUnitLower.includes("piece")) {
        standardQuantity = quantity;
      } else if ((normalizedUnit.includes("bowl") || normalizedUnit.includes("bowls")) && standardUnitLower.includes("bowl")) {
        standardQuantity = quantity;
      } else if ((normalizedUnit.includes("plate") || normalizedUnit.includes("plates")) && standardUnitLower.includes("plate")) {
        standardQuantity = quantity;
      } else if ((normalizedUnit.includes("cup") || normalizedUnit.includes("cups")) && standardUnitLower.includes("cup")) {
        standardQuantity = quantity;
      } else {
        // Default: assume quantity is in servings
        standardQuantity = quantity;
      }
    }
    
    // Calculate nutrients based on standard serving
    const multiplier = standardQuantity * (baseNutrients.standardServing / 100.0);
    
    return {
      name: baseNutrients.name,
      calories: baseNutrients.calories * multiplier,
      protein: baseNutrients.protein * multiplier,
      carbs: baseNutrients.carbs * multiplier,
      fats: baseNutrients.fats * multiplier,
      fiber: baseNutrients.fiber * multiplier,
      sugar: baseNutrients.sugar * multiplier,
      sodium: baseNutrients.sodium * multiplier,
      standardServing: baseNutrients.standardServing,
      standardUnit: baseNutrients.standardUnit
    };
  }
  
  // Search for foods (for future enhancement)
  searchFoods(query: string): FoodNutrients[] {
    const lowercased = query.toLowerCase();
    return Object.values(this.localFoodDatabase).filter(food =>
      food.name.toLowerCase().includes(lowercased)
    );
  }
}

export const foodDatabase = FoodDatabaseService.getInstance();

