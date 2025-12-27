import type { ParsedWorkout } from '../models/WorkoutEntry';

export class WorkoutParser {
  private workoutKeywords: Record<string, string> = {
    "running": "running",
    "run": "running",
    "jogging": "jogging",
    "jog": "jogging",
    "walking": "walking",
    "walk": "walking",
    "cycling": "cycling",
    "bike": "cycling",
    "bicycle": "cycling",
    "swimming": "swimming",
    "swim": "swimming",
    "gym": "gym",
    "weight": "weightlifting",
    "weightlifting": "weightlifting",
    "lifting": "weightlifting",
    "yoga": "yoga",
    "pilates": "pilates",
    "dancing": "dancing",
    "dance": "dancing",
    "basketball": "basketball",
    "football": "football",
    "soccer": "soccer",
    "tennis": "tennis",
    "badminton": "badminton",
    "cricket": "cricket",
    "hiit": "hiit",
    "cardio": "cardio",
    "treadmill": "treadmill",
    "elliptical": "elliptical",
    "rowing": "rowing",
    "rowing machine": "rowing",
    "crossfit": "crossfit"
  };
  
  private durationKeywords: Record<string, number> = {
    "hour": 60,
    "hours": 60,
    "hr": 60,
    "hrs": 60,
    "minute": 1,
    "minutes": 1,
    "min": 1,
    "mins": 1
  };
  
  private intensityKeywords: Record<string, string> = {
    "low": "low",
    "easy": "low",
    "light": "low",
    "slow": "low",
    "moderate": "moderate",
    "medium": "moderate",
    "normal": "moderate",
    "high": "high",
    "hard": "high",
    "intense": "high",
    "fast": "high",
    "sprint": "high"
  };
  
  parse(text: string): ParsedWorkout[] {
    const lowercased = text.toLowerCase();
    const workouts: ParsedWorkout[] = [];
    
    // Split by common separators to find multiple workouts
    const sentences = lowercased.split(",")
      .flatMap(s => s.split("."))
      .flatMap(s => s.split(" and "))
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      const workout = this.parseSentence(sentence);
      if (workout) {
        workouts.push(workout);
      }
    }
    
    // If no workouts found in split sentences, try entire text
    if (workouts.length === 0) {
      const workout = this.parseSentence(lowercased);
      if (workout) {
        workouts.push(workout);
      }
    }
    
    return workouts;
  }
  
  private parseSentence(sentence: string): ParsedWorkout | null {
    const lowercased = sentence.toLowerCase();
    
    // Extract activity type
    let activityType: string | null = null;
    for (const [keyword, activity] of Object.entries(this.workoutKeywords)) {
      if (lowercased.includes(keyword)) {
        activityType = activity;
        break;
      }
    }
    
    // Return null if no workout keyword found
    if (!activityType) {
      return null;
    }
    
    // Extract duration
    let duration: number = 30.0; // default 30 minutes
    
    // Look for patterns like "30 minutes", "1 hour", "45 mins"
    const words = lowercased.split(/\s+/);
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const num = parseFloat(word);
      if (!isNaN(num)) {
        if (index + 1 < words.length) {
          const nextWord = words[index + 1];
          if (this.durationKeywords[nextWord] !== undefined) {
            duration = num * this.durationKeywords[nextWord];
            break;
          }
        } else if (index > 0) {
          // Check previous word for duration keyword
          const prevWord = words[index - 1];
          if (this.durationKeywords[prevWord] !== undefined) {
            duration = num * this.durationKeywords[prevWord];
            break;
          }
        }
      } else {
        const numFromWord = this.numberWordsToDouble(word);
        if (numFromWord !== null) {
          if (index + 1 < words.length) {
            const nextWord = words[index + 1];
            if (this.durationKeywords[nextWord] !== undefined) {
              duration = numFromWord * this.durationKeywords[nextWord];
              break;
            }
          }
        }
      }
    }
    
    // Extract intensity
    let intensity = "moderate"; // default
    for (const [keyword, int] of Object.entries(this.intensityKeywords)) {
      if (lowercased.includes(keyword)) {
        intensity = int;
        break;
      }
    }
    
    // Infer intensity from activity type if not specified
    if (intensity === "moderate" && !Object.keys(this.intensityKeywords).some(key => lowercased.includes(key))) {
      const highIntensityActivities = ["running", "sprint", "hiit", "crossfit", "basketball", "football"];
      const lowIntensityActivities = ["walking", "yoga", "pilates"];
      
      if (highIntensityActivities.includes(activityType)) {
        intensity = "high";
      } else if (lowIntensityActivities.includes(activityType)) {
        intensity = "low";
      }
    }
    
    return { activityType, duration, intensity };
  }
  
  private numberWordsToDouble(word: string): number | null {
    const numberWords: Record<string, number> = {
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
      "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "half": 0.5, "quarter": 0.25
    };
    return numberWords[word.toLowerCase()] ?? null;
  }
}

