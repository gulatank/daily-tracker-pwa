export class WorkoutCalorieCalculator {
  private static instance: WorkoutCalorieCalculator;
  
  // MET values for common activities (Metabolic Equivalent of Task)
  // Based on Compendium of Physical Activities
  private metValues: Record<string, Record<string, number>> = {
    "running": { "low": 6.0, "moderate": 9.8, "high": 11.5 },
    "jogging": { "low": 6.0, "moderate": 7.0, "high": 9.8 },
    "walking": { "low": 3.5, "moderate": 4.3, "high": 5.0 },
    "cycling": { "low": 4.0, "moderate": 6.8, "high": 10.0 },
    "swimming": { "low": 6.0, "moderate": 8.3, "high": 10.0 },
    "gym": { "low": 3.5, "moderate": 5.0, "high": 6.0 },
    "weightlifting": { "low": 3.0, "moderate": 5.0, "high": 6.0 },
    "yoga": { "low": 2.5, "moderate": 3.0, "high": 4.0 },
    "pilates": { "low": 3.0, "moderate": 3.5, "high": 4.5 },
    "dancing": { "low": 4.8, "moderate": 6.0, "high": 7.8 },
    "basketball": { "low": 6.0, "moderate": 8.0, "high": 10.0 },
    "football": { "low": 7.0, "moderate": 8.0, "high": 10.0 },
    "soccer": { "low": 7.0, "moderate": 8.0, "high": 10.0 },
    "tennis": { "low": 5.0, "moderate": 7.3, "high": 9.0 },
    "badminton": { "low": 5.5, "moderate": 7.0, "high": 8.5 },
    "cricket": { "low": 4.8, "moderate": 5.0, "high": 6.0 },
    "hiit": { "low": 6.0, "moderate": 8.5, "high": 12.0 },
    "cardio": { "low": 5.0, "moderate": 7.0, "high": 9.0 },
    "treadmill": { "low": 4.0, "moderate": 6.0, "high": 8.0 },
    "elliptical": { "low": 5.0, "moderate": 6.5, "high": 8.0 },
    "rowing": { "low": 6.0, "moderate": 7.0, "high": 8.5 },
    "crossfit": { "low": 6.0, "moderate": 9.0, "high": 12.0 },
    "general exercise": { "low": 3.5, "moderate": 5.0, "high": 7.0 }
  };
  
  static getInstance(): WorkoutCalorieCalculator {
    if (!WorkoutCalorieCalculator.instance) {
      WorkoutCalorieCalculator.instance = new WorkoutCalorieCalculator();
    }
    return WorkoutCalorieCalculator.instance;
  }
  
  calculateCalories(activityType: string, duration: number, intensity: string, weight: number): { calories: number; metValue: number } {
    const lowercasedActivity = activityType.toLowerCase();
    const lowercasedIntensity = intensity.toLowerCase();
    
    // Get MET value
    let metValue: number = 5.0; // default moderate activity
    
    if (this.metValues[lowercasedActivity]) {
      metValue = this.metValues[lowercasedActivity][lowercasedIntensity] ?? 
                 this.metValues[lowercasedActivity]["moderate"] ?? 
                 5.0;
    } else {
      // Try to find similar activity
      for (const [activity, intensities] of Object.entries(this.metValues)) {
        if (lowercasedActivity.includes(activity) || activity.includes(lowercasedActivity)) {
          metValue = intensities[lowercasedIntensity] ?? intensities["moderate"] ?? 5.0;
          break;
        }
      }
    }
    
    // Calculate calories: MET × weight(kg) × duration(hours)
    // Duration is in minutes, so convert to hours
    const durationHours = duration / 60.0;
    const calories = metValue * weight * durationHours;
    
    return { calories, metValue };
  }
  
  getMETValue(activityType: string, intensity: string): number {
    const lowercasedActivity = activityType.toLowerCase();
    const lowercasedIntensity = intensity.toLowerCase();
    
    if (this.metValues[lowercasedActivity]) {
      return this.metValues[lowercasedActivity][lowercasedIntensity] ?? 
             this.metValues[lowercasedActivity]["moderate"] ?? 
             5.0;
    }
    
    return 5.0; // default
  }
}

export const workoutCalculator = WorkoutCalorieCalculator.getInstance();

