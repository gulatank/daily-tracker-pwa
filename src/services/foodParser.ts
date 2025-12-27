import type { ParsedFoodItem } from '../models/FoodEntry';

export class FoodParser {
  // Common food keywords
  private indianFoods = ["roti", "chapati", "naan", "dal", "dal fry", "dal tadka", "rice", "biriyani", "biryani", "curry", "sabzi", "sabji", "paratha", "dosa", "idli", "sambar", "rasam", "paneer", "palak", "aloo", "gobi", "bhindi", "rajma", "chana", "chole"];
  
  private asianFoods = ["sushi", "ramen", "noodles", "fried rice", "dim sum", "dumpling", "pho", "pad thai", "curry", "teriyaki", "tempura"];
  
  private westernFoods = ["pizza", "pasta", "burger", "sandwich", "salad", "soup", "bread", "chicken", "beef", "pork", "fish", "steak"];
  
  // private quantityKeywords = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "half", "quarter", "full", "some", "a", "an", "piece", "pieces", "cup", "cups", "bowl", "bowls", "plate", "plates", "serving", "servings"];
  
  private units = ["piece", "pieces", "cup", "cups", "bowl", "bowls", "plate", "plates", "serving", "servings", "gram", "grams", "kg", "kilogram", "ml", "liter", "litre", "tbsp", "tablespoon", "tsp", "teaspoon", "bowl of", "bowls of", "plate of", "plates of"];
  
  // Workout keywords to filter out from food parsing
  private workoutKeywords = ["run", "running", "ran", "jog", "jogging", "walk", "walking", "cycle", "cycling", "bike", "swim", "swimming", "gym", "weight", "weightlifting", "lifting", "yoga", "pilates", "dance", "dancing", "basketball", "football", "soccer", "tennis", "badminton", "cricket", "hiit", "cardio", "treadmill", "elliptical", "rowing", "crossfit", "exercise", "workout"];
  
  parse(text: string): ParsedFoodItem[] {
    const lowercased = text.toLowerCase();
    const items: ParsedFoodItem[] = [];
    
    // Split by common separators
    let sentences = lowercased.split(",")
      .flatMap(s => s.split("."))
      .flatMap(s => s.split(" and "))
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      // Skip sentences that contain workout keywords
      const lowerSentence = sentence.toLowerCase();
      if (this.workoutKeywords.some(keyword => lowerSentence.includes(keyword))) {
        continue;
      }
      const item = this.parseSentence(sentence);
      if (item) {
        items.push(item);
      }
    }
    
    // If no items found, try to extract from entire text (but skip if it contains workout keywords)
    if (items.length === 0 && !this.workoutKeywords.some(keyword => lowercased.includes(keyword))) {
      const item = this.parseSentence(lowercased);
      if (item) {
        items.push(item);
      }
    }
    
    return items;
  }
  
  private parseSentence(sentence: string): ParsedFoodItem | null {
    const words = sentence.split(/\s+/);
    
    // Find food name
    let foodName = "";
    let quantity: number = 1.0;
    let unit = "serving";
    
    // Extract numbers
    const numberWords: Record<string, number> = {
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
      "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "half": 0.5, "quarter": 0.25
    };
    
    // Check for numeric quantities
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const num = parseFloat(word);
      if (!isNaN(num)) {
        quantity = num;
        // Check if next word(s) form a unit (e.g., "bowls of", "bowl of")
        if (index + 1 < words.length) {
          const nextWord = words[index + 1].toLowerCase();
          // Check for "X bowls of" or "X bowl of" pattern
          if (index + 2 < words.length && (nextWord === "bowl" || nextWord === "bowls" || nextWord === "plate" || nextWord === "plates")) {
            const thirdWord = words[index + 2].toLowerCase();
            if (thirdWord === "of") {
              unit = (nextWord === "bowl" || nextWord === "bowls") ? "bowls" : "plates";
              // Extract food name from remaining words (skip "of")
              if (index + 3 < words.length) {
                foodName = words.slice(index + 3).join(" ");
              }
            } else if (this.units.includes(nextWord)) {
              unit = nextWord;
              if (index + 2 < words.length) {
                foodName = words.slice(index + 2).join(" ");
              }
            } else {
              foodName = words.slice(index + 1).join(" ");
            }
          } else if (this.units.includes(nextWord)) {
            unit = nextWord;
            // Extract food name from remaining words
            if (index + 2 < words.length) {
              foodName = words.slice(index + 2).join(" ");
            }
          } else {
            foodName = words.slice(index + 1).join(" ");
          }
        }
        break;
      } else if (numberWords[word.toLowerCase()] !== undefined) {
        quantity = numberWords[word.toLowerCase()];
        if (index + 1 < words.length) {
          const nextWord = words[index + 1].toLowerCase();
          // Check for "X bowls of" or "X bowl of" pattern
          if (index + 2 < words.length && (nextWord === "bowl" || nextWord === "bowls" || nextWord === "plate" || nextWord === "plates")) {
            const thirdWord = words[index + 2].toLowerCase();
            if (thirdWord === "of") {
              unit = (nextWord === "bowl" || nextWord === "bowls") ? "bowls" : "plates";
              // Extract food name from remaining words (skip "of")
              if (index + 3 < words.length) {
                foodName = words.slice(index + 3).join(" ");
              }
            } else if (this.units.includes(nextWord)) {
              unit = nextWord;
              if (index + 2 < words.length) {
                foodName = words.slice(index + 2).join(" ");
              }
            } else {
              foodName = words.slice(index + 1).join(" ");
            }
          } else if (this.units.includes(nextWord)) {
            unit = nextWord;
            if (index + 2 < words.length) {
              foodName = words.slice(index + 2).join(" ");
            }
          } else {
            foodName = words.slice(index + 1).join(" ");
          }
        }
        break;
      }
    }
    
    // If no quantity found, try to find food name directly
    if (foodName === "") {
      // Look for food keywords
      const allFoods = [...this.indianFoods, ...this.asianFoods, ...this.westernFoods];
      for (const food of allFoods) {
        if (sentence.includes(food)) {
          foodName = this.extractFoodName(food, sentence);
          break;
        }
      }
    }
    
    // Clean up food name
    foodName = foodName
      .replace(/i ate/gi, "")
      .replace(/i had/gi, "")
      .replace(/i'm eating/gi, "")
      .trim();
    
    // Validate: foodName must contain actual food keywords, not just random words
    if (foodName === "") {
      return null;
    }
    
    // Additional validation: if foodName was set from number parsing but doesn't contain food keywords, reject it
    const lowerFoodName = foodName.toLowerCase();
    const allFoods = [...this.indianFoods, ...this.asianFoods, ...this.westernFoods];
    if (!allFoods.some(food => lowerFoodName.includes(food))) {
      // Food name doesn't contain any known food keyword - likely not a food item
      return null;
    }
    
    // Better quantity detection for common patterns
    if (sentence.includes("a ") || sentence.includes("an ")) {
      quantity = 1.0;
    } else if (sentence.includes("couple of") || sentence.includes("couple")) {
      quantity = 2.0;
    } else if (sentence.includes("few")) {
      quantity = 3.0;
    } else if (sentence.includes("some") || sentence.includes("a bit")) {
      quantity = 0.5;
    } else if (sentence.includes("full") || sentence.includes("complete")) {
      quantity = 1.0;
    }
    
    return { foodName, quantity, unit };
  }
  
  private extractFoodName(keyword: string, text: string): string {
    const words = text.split(/\s+/);
    const index = words.findIndex(w => w.includes(keyword));
    if (index !== -1) {
      let endIndex = index + 1;
      // Try to capture common food combinations (e.g., "dal fry", "fried rice")
      if (endIndex < words.length) {
        const nextWord = words[endIndex];
        if (["fry", "fried", "tadka", "curry", "soup", "salad"].includes(nextWord.toLowerCase())) {
          endIndex += 1;
        }
      }
      return words.slice(index, Math.min(endIndex, words.length)).join(" ");
    }
    return keyword;
  }
}

