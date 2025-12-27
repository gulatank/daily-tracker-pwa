export interface WorkoutEntry {
  id: string;
  timestamp: Date;
  activityType: string;
  duration: number; // in minutes
  intensity: string; // "low", "moderate", "high"
  caloriesBurnt: number;
  metValue: number;
  recordingUrl?: string;
  transcription?: string;
}

export interface ParsedWorkout {
  activityType: string;
  duration: number; // in minutes
  intensity: string; // "low", "moderate", "high"
}

