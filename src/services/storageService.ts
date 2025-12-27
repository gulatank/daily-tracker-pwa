import type { FoodEntry } from '../models/FoodEntry';
import type { WorkoutEntry } from '../models/WorkoutEntry';
import type { ParsedFoodItem } from '../models/FoodEntry';
import type { ParsedWorkout } from '../models/WorkoutEntry';
import { db } from '../models/db';

export interface DuplicateWarning {
  itemIndex: number;
  existingEntry: FoodEntry | WorkoutEntry;
  message: string;
}

export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
  
  // MARK: - Food Entries
  
  async saveFoodEntry(entry: FoodEntry): Promise<void> {
    await db.foodEntries.add(entry);
  }
  
  async loadFoodEntries(): Promise<FoodEntry[]> {
    return await db.foodEntries.toArray();
  }
  
  async deleteFoodEntry(entry: FoodEntry): Promise<void> {
    await db.foodEntries.delete(entry.id);
  }
  
  // MARK: - Workout Entries
  
  async saveWorkoutEntry(entry: WorkoutEntry): Promise<void> {
    await db.workoutEntries.add(entry);
  }
  
  async loadWorkoutEntries(): Promise<WorkoutEntry[]> {
    return await db.workoutEntries.toArray();
  }
  
  async deleteWorkoutEntry(entry: WorkoutEntry): Promise<void> {
    await db.workoutEntries.delete(entry.id);
  }
  
  // MARK: - Helper Methods
  
  async getFoodEntries(forDate: Date): Promise<FoodEntry[]> {
    const startOfDay = new Date(forDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const allEntries = await this.loadFoodEntries();
    return allEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfDay && entryDate < endOfDay;
    });
  }
  
  async getWorkoutEntries(forDate: Date): Promise<WorkoutEntry[]> {
    const startOfDay = new Date(forDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const allEntries = await this.loadWorkoutEntries();
    return allEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfDay && entryDate < endOfDay;
    });
  }
  
  async getAllFoodEntries(): Promise<FoodEntry[]> {
    const entries = await this.loadFoodEntries();
    return entries.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Most recent first
    });
  }
  
  async getAllWorkoutEntries(): Promise<WorkoutEntry[]> {
    const entries = await this.loadWorkoutEntries();
    return entries.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Most recent first
    });
  }
  
  // MARK: - Duplicate Detection
  
  async checkForDuplicates(foodItems: ParsedFoodItem[], withinMinutes: number = 30): Promise<DuplicateWarning[]> {
    const recentEntries = await this.getRecentFoodEntries(withinMinutes);
    const warnings: DuplicateWarning[] = [];
    
    for (let index = 0; index < foodItems.length; index++) {
      const item = foodItems[index];
      for (const entry of recentEntries) {
        // Check if same food name (case-insensitive) and similar quantity (within 20%)
        const nameMatch = entry.foodName.toLowerCase() === item.foodName.toLowerCase();
        const quantityMatch = Math.abs(entry.quantity - item.quantity) / Math.max(entry.quantity, item.quantity) < 0.2;
        
        if (nameMatch && quantityMatch) {
          warnings.push({
            itemIndex: index,
            existingEntry: entry,
            message: `Similar entry found: ${entry.foodName} (${entry.quantity} ${entry.unit}) at ${this.formatTime(entry.timestamp)}`
          });
          break;
        }
      }
    }
    
    return warnings;
  }
  
  async checkForDuplicatesWorkout(workout: ParsedWorkout, withinMinutes: number = 30): Promise<DuplicateWarning | null> {
    const recentEntries = await this.getRecentWorkoutEntries(withinMinutes);
    
    for (const entry of recentEntries) {
      // Check if same activity type and similar duration (within 10 minutes)
      const activityMatch = entry.activityType.toLowerCase() === workout.activityType.toLowerCase();
      const durationMatch = Math.abs(entry.duration - workout.duration) < 10.0;
      
      if (activityMatch && durationMatch) {
        return {
          itemIndex: 0,
          existingEntry: entry,
          message: `Similar workout found: ${entry.activityType.charAt(0).toUpperCase() + entry.activityType.slice(1)} (${Math.round(entry.duration)} min) at ${this.formatTime(entry.timestamp)}`
        };
      }
    }
    
    return null;
  }
  
  private async getRecentFoodEntries(withinMinutes: number): Promise<FoodEntry[]> {
    const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000);
    const allEntries = await this.loadFoodEntries();
    return allEntries.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= cutoffTime;
    });
  }
  
  private async getRecentWorkoutEntries(withinMinutes: number): Promise<WorkoutEntry[]> {
    const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000);
    const allEntries = await this.loadWorkoutEntries();
    return allEntries.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return timestamp >= cutoffTime;
    });
  }
  
  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export const storageService = StorageService.getInstance();

