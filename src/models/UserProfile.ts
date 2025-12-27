export interface UserProfile {
  age: number;
  gender: string; // "male", "female", "other"
  weight: number; // in kg
  height: number; // in cm
  activityLevel: string; // "sedentary", "lightly_active", "moderately_active", "very_active"
}

export class UserProfileService {
  // BMR calculation using Mifflin-St Jeor Equation
  static calculateBMR(profile: UserProfile): number {
    const weightFactor = 10 * profile.weight;
    const heightFactor = 6.25 * profile.height;
    const ageFactor = 5 * profile.age;
    
    if (profile.gender.toLowerCase() === "male") {
      return weightFactor + heightFactor - ageFactor + 5;
    } else {
      return weightFactor + heightFactor - ageFactor - 161;
    }
  }
  
  // TDEE calculation (Total Daily Energy Expenditure)
  static calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers: Record<string, number> = {
      "sedentary": 1.2,
      "lightly_active": 1.375,
      "moderately_active": 1.55,
      "very_active": 1.725
    };
    return bmr * (activityMultipliers[profile.activityLevel] ?? 1.55);
  }
}

